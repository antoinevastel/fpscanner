import { describe, expect, test } from "vitest";
import { describeEnvironment, isIOSDevicePlatform } from "./environment";
import { ERROR, INIT, NA, SKIPPED } from "../signals/utils";
import { USER_AGENTS, buildFingerprint } from "./userAgents.fixture";

describe("isIOSDevicePlatform", () => {
    test.each(["iPhone", "iPad", "iPod touch"])("recognises %s", (platform) => {
        expect(isIOSDevicePlatform(platform)).toBe(true);
    });

    test.each(["MacIntel", "Win32", "Linux x86_64", "", NA, ERROR, SKIPPED, INIT, undefined, 42])(
        "rejects %s",
        (platform) => {
            expect(isIOSDevicePlatform(platform)).toBe(false);
        },
    );
});

describe("describeEnvironment", () => {
    test.each([
        ["Windows Chrome", USER_AGENTS.windowsChrome, "Win32", "windows", "v8", true],
        ["Windows Edge", USER_AGENTS.windowsEdge, "Win32", "windows", "v8", true],
        ["Windows Firefox", USER_AGENTS.windowsFirefox, "Win32", "windows", "gecko", true],
        ["macOS Chrome", USER_AGENTS.macChrome, "MacIntel", "macos", "v8", true],
        ["macOS Safari", USER_AGENTS.macSafari, "MacIntel", "macos", "webkit", true],
        ["Linux Chrome", USER_AGENTS.linuxChrome, "Linux x86_64", "other", "v8", false],
        ["Android Chrome", USER_AGENTS.androidChrome, "Linux armv8l", "android", "v8", false],
        ["Android Firefox", USER_AGENTS.androidFirefox, "Linux armv8l", "android", "gecko", false],
        ["iPhone Safari", USER_AGENTS.iphoneSafari, "iPhone", "ios", "webkit", false],
        ["iPhone Chrome", USER_AGENTS.iphoneChrome, "iPhone", "ios", "webkit", false],
        ["iPhone Opera", USER_AGENTS.iphoneOpera, "iPhone", "ios", "webkit", false],
        ["an unrecognised user agent", USER_AGENTS.unknown, "Win32", "other", "unknown", false],
    ])("describes %s", (_name, userAgent, platform, os, engine, isDesktop) => {
        expect(describeEnvironment(buildFingerprint({ userAgent, platform }))).toEqual({
            userAgent,
            os,
            engine,
            isDesktop,
        });
    });

    test("reports iOS when only a worker still exposes the real device", () => {
        const environment = describeEnvironment(buildFingerprint({
            userAgent: USER_AGENTS.macSafari,
            platform: "MacIntel",
            workerUserAgent: USER_AGENTS.iphoneSafari,
            workerPlatform: "iPhone",
        }));

        expect(environment.os).toBe("ios");
        expect(environment.engine).toBe("webkit");
        expect(environment.isDesktop).toBe(false);
    });

    test("reports iOS when only an iframe still exposes the real device", () => {
        expect(describeEnvironment(buildFingerprint({
            userAgent: USER_AGENTS.macChrome,
            platform: "MacIntel",
            iframePlatform: "iPad",
            workerPlatform: SKIPPED,
        })).os).toBe("ios");
    });

    test("falls back to an undefined user agent when the signal is unavailable", () => {
        expect(describeEnvironment(buildFingerprint({
            userAgent: ERROR,
            platform: "Win32",
            iframeUserAgent: ERROR,
            workerUserAgent: SKIPPED,
        }))).toEqual({
            userAgent: undefined,
            os: "other",
            engine: "unknown",
            isDesktop: false,
        });
    });

    test("caches its result per fingerprint", () => {
        const fingerprint = buildFingerprint({ userAgent: USER_AGENTS.windowsChrome });
        expect(describeEnvironment(fingerprint)).toBe(describeEnvironment(fingerprint));
    });
});
