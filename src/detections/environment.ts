import { Fingerprint } from "../types";
import { usableString, usableStrings } from "../signals/utils";

/** Operating system a fingerprint claims to run on, `ios` winning over the macOS it impersonates. */
export type ClaimedOS = "windows" | "macos" | "ios" | "android" | "other";

/** JavaScript engine implied by the browser a fingerprint claims to be. */
export type ClaimedEngine = "v8" | "gecko" | "webkit" | "unknown";

export interface Environment {
    userAgent?: string;
    os: ClaimedOS;
    /**
     * Windows and macOS only. Android, ChromeOS and desktop Linux are left out on purpose:
     * their user agents overlap with embedded WebViews and niche builds whose engine cannot
     * be pinned down, so consistency checks are not safe to enforce there.
     */
    isDesktop: boolean;
    engine: ClaimedEngine;
}

/** `navigator.platform` on an iOS device. Workers keep reporting it even in desktop mode. */
const IOS_DEVICE_PLATFORM = /^(iPhone|iPad|iPod)/;
const IOS_USER_AGENT = /(iPhone|iPad|iPod)/;
const ANDROID_USER_AGENT = /Android/;
const WINDOWS_USER_AGENT = /Windows NT/;
const MACOS_USER_AGENT = /Macintosh/;
const CHROMIUM_USER_AGENT = /(Chrome|Chromium|CriOS)\//;
const GECKO_USER_AGENT = /(Firefox|FxiOS)\//;
/** Safari, and the WebKit browsers reusing its user agent, are the only ones pairing `Version/` with `Safari/`. */
const APPLE_WEBKIT_USER_AGENT = /Version\/[\d.]+( Mobile\/\S+)? Safari\//;

export function isIOSDevicePlatform(platform: unknown): boolean {
    const value = usableString(platform);
    return value !== undefined && IOS_DEVICE_PLATFORM.test(value);
}

/**
 * Spotting iOS takes some care because "Request Desktop Website" (opt-in on iPhone, the
 * default on iPad) makes the page report a macOS user agent and a "MacIntel" platform. The
 * iframe and worker contexts are read as well since they keep reporting the real device.
 */
function isIOS(fingerprint: Fingerprint): boolean {
    const signals = fingerprint.signals;

    const platforms = usableStrings(
        signals.device.platform,
        signals.contexts.iframe.platform,
        signals.contexts.webWorker.platform
    );
    if (platforms.some(platform => IOS_DEVICE_PLATFORM.test(platform))) {
        return true;
    }

    const userAgents = usableStrings(
        signals.browser.userAgent,
        signals.contexts.iframe.userAgent,
        signals.contexts.webWorker.userAgent
    );
    return userAgents.some(userAgent => IOS_USER_AGENT.test(userAgent));
}

function claimedOS(fingerprint: Fingerprint, userAgent: string | undefined): ClaimedOS {
    if (isIOS(fingerprint)) {
        return "ios";
    }
    if (userAgent === undefined) {
        return "other";
    }
    if (ANDROID_USER_AGENT.test(userAgent)) {
        return "android";
    }
    if (WINDOWS_USER_AGENT.test(userAgent)) {
        return "windows";
    }
    if (MACOS_USER_AGENT.test(userAgent)) {
        return "macos";
    }
    return "other";
}

/**
 * Derived from the user agent only, never from a global such as `window.chrome`: extensions
 * and user scripts inject that object into Firefox and Safari, and Opera for iOS defines it
 * on top of WebKit.
 */
function claimedEngine(os: ClaimedOS, userAgent: string | undefined): ClaimedEngine {
    // App Store rules force every iOS browser onto WebKit, whichever vendor ships it.
    if (os === "ios") {
        return "webkit";
    }
    if (userAgent === undefined) {
        return "unknown";
    }
    if (CHROMIUM_USER_AGENT.test(userAgent)) {
        return "v8";
    }
    if (GECKO_USER_AGENT.test(userAgent)) {
        return "gecko";
    }
    if (APPLE_WEBKIT_USER_AGENT.test(userAgent)) {
        return "webkit";
    }
    return "unknown";
}

const environments = new WeakMap<Fingerprint, Environment>();

/**
 * Describes what a fingerprint claims to be, so that detection rules share one reading of
 * the user agent and platform instead of each parsing them their own way. The result is
 * cached per fingerprint, which detection rules can rely on: they all run in a single pass,
 * once signal collection is over.
 */
export function describeEnvironment(fingerprint: Fingerprint): Environment {
    const cached = environments.get(fingerprint);
    if (cached !== undefined) {
        return cached;
    }

    const userAgent = usableString(fingerprint.signals.browser.userAgent);
    const os = claimedOS(fingerprint, userAgent);
    const environment: Environment = {
        userAgent,
        os,
        isDesktop: os === "windows" || os === "macos",
        engine: claimedEngine(os, userAgent),
    };

    environments.set(fingerprint, environment);
    return environment;
}
