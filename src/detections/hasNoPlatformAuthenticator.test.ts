import { describe, expect, test } from "vitest";
import { hasNoPlatformAuthenticator } from "./hasNoPlatformAuthenticator";
import { NA } from "../signals/utils";
import { USER_AGENTS, buildFingerprint } from "./userAgents.fixture";

describe("hasNoPlatformAuthenticator", () => {
    test.each([
        ["Windows Chrome", USER_AGENTS.windowsChrome, "Win32"],
        ["macOS Chrome", USER_AGENTS.macChrome, "MacIntel"],
    ])("flags %s answering that no platform authenticator exists", (_name, userAgent, platform) => {
        expect(hasNoPlatformAuthenticator(buildFingerprint({
            userAgent,
            platform,
            userVerifyingPlatformAuthenticator: false,
        }))).toBe(true);
    });

    test("does not flag a desktop that has one", () => {
        expect(hasNoPlatformAuthenticator(buildFingerprint({
            userVerifyingPlatformAuthenticator: true,
        }))).toBe(false);
    });

    test("does not flag an insecure context, where the API is missing by design", () => {
        expect(hasNoPlatformAuthenticator(buildFingerprint({
            secureContext: false,
            webauthnAvailable: false,
            userVerifyingPlatformAuthenticator: NA,
        }))).toBe(false);
    });

    test.each([
        ["Windows Firefox", USER_AGENTS.windowsFirefox, "Win32"],
        ["macOS Safari", USER_AGENTS.macSafari, "MacIntel"],
        ["Android Chrome", USER_AGENTS.androidChrome, "Linux armv8l"],
        ["iPhone Safari", USER_AGENTS.iphoneSafari, "iPhone"],
    ])("does not flag %s, which is out of the rule's scope", (_name, userAgent, platform) => {
        expect(hasNoPlatformAuthenticator(buildFingerprint({
            userAgent,
            platform,
            userVerifyingPlatformAuthenticator: false,
        }))).toBe(false);
    });
});
