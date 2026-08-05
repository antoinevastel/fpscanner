import { describe, expect, test } from "vitest";
import { hasMissingChromeObject } from "./hasMissingChromeObject";
import { USER_AGENTS, buildFingerprint } from "./userAgents.fixture";

describe("hasMissingChromeObject", () => {
    test.each([
        ["Windows Chrome", USER_AGENTS.windowsChrome, "Win32"],
        ["macOS Chrome", USER_AGENTS.macChrome, "MacIntel"],
        ["Linux Chrome", USER_AGENTS.linuxChrome, "Linux x86_64"],
    ])("flags %s without a chrome object", (_name, userAgent, platform) => {
        expect(hasMissingChromeObject(buildFingerprint({ userAgent, platform, chrome: false }))).toBe(true);
    });

    test("does not flag a desktop Chrome that exposes the chrome object", () => {
        expect(hasMissingChromeObject(buildFingerprint({ chrome: true }))).toBe(false);
    });

    test.each([
        ["Android WebViews", USER_AGENTS.androidChrome, "Linux armv8l"],
        ["iOS in-app browsers", USER_AGENTS.iphoneChrome, "iPhone"],
    ])("does not flag %s, which routinely lack a chrome object", (_name, userAgent, platform) => {
        expect(hasMissingChromeObject(buildFingerprint({ userAgent, platform, chrome: false }))).toBe(false);
    });

    test("does not flag an iOS device behind a desktop Chrome user agent", () => {
        expect(hasMissingChromeObject(buildFingerprint({
            userAgent: USER_AGENTS.macChrome,
            platform: "MacIntel",
            workerPlatform: "iPad",
            chrome: false,
        }))).toBe(false);
    });

    test.each([
        ["Firefox", USER_AGENTS.windowsFirefox, "Win32"],
        ["Safari", USER_AGENTS.macSafari, "MacIntel"],
    ])("does not flag %s, which is not expected to expose a chrome object", (_name, userAgent, platform) => {
        expect(hasMissingChromeObject(buildFingerprint({ userAgent, platform, chrome: false }))).toBe(false);
    });
});
