import { describe, expect, test } from "vitest";
import { hasInconsistentEtsl } from "./hasInconsistentEtsl";
import { ERROR, SKIPPED } from "../signals/utils";
import { USER_AGENTS, buildFingerprint } from "./userAgents.fixture";

describe("hasInconsistentEtsl", () => {
    test.each([
        ["Windows Chrome", USER_AGENTS.windowsChrome, 33, "Win32"],
        ["macOS Chrome", USER_AGENTS.macChrome, 33, "MacIntel"],
        ["Windows Firefox", USER_AGENTS.windowsFirefox, 37, "Win32"],
        ["macOS Safari", USER_AGENTS.macSafari, 37, "MacIntel"],
        ["iPhone Safari", USER_AGENTS.iphoneSafari, 37, "iPhone"],
        ["iPhone Chrome", USER_AGENTS.iphoneChrome, 37, "iPhone"],
        ["Android Chrome", USER_AGENTS.androidChrome, 33, "Linux armv8l"],
    ])("does not flag %s with its expected ETSL", (_name, userAgent, etsl, platform) => {
        expect(hasInconsistentEtsl(buildFingerprint({ userAgent, etsl, platform }))).toBe(false);
    });

    test("does not flag Firefox where an extension injected window.chrome", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.windowsFirefox,
            etsl: 37,
        }))).toBe(false);
    });

    test("does not flag Safari where a user script injected window.chrome", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.macSafari,
            etsl: 37,
            platform: "MacIntel",
        }))).toBe(false);
    });

    test("does not flag Opera for iOS, which defines window.chrome on top of WebKit", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.iphoneOpera,
            etsl: 37,
            platform: "iPhone",
        }))).toBe(false);
    });

    test("does not flag iPhone Safari with Request Desktop Website enabled", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.macSafari,
            etsl: 37,
            platform: "MacIntel",
            workerUserAgent: USER_AGENTS.iphoneSafari,
            workerPlatform: "iPhone",
        }))).toBe(false);
    });

    test("does not flag an iOS device behind a desktop Chrome user agent", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.macChrome,
            etsl: 37,
            platform: "MacIntel",
            workerPlatform: "iPad",
        }))).toBe(false);
    });

    test.each([
        ["Android", USER_AGENTS.androidChrome, "Linux armv8l"],
        ["Linux", USER_AGENTS.linuxChrome, "Linux x86_64"],
    ])("does not flag %s, where a Chrome token may come from an unknown build", (_name, userAgent, platform) => {
        expect(hasInconsistentEtsl(buildFingerprint({ userAgent, etsl: 37, platform }))).toBe(false);
    });

    test.each([ERROR, SKIPPED, undefined])("does not flag an ETSL of %s", (etsl) => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.windowsChrome,
            etsl,
        }))).toBe(false);
    });

    test("does not flag a user agent it cannot attribute to an engine", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.unknown,
            etsl: 42,
        }))).toBe(false);
    });

    test("flags a desktop Chrome user agent running on a non-V8 engine", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.windowsChrome,
            etsl: 37,
        }))).toBe(true);
    });

    test("flags a Firefox user agent running on V8", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.windowsFirefox,
            etsl: 33,
        }))).toBe(true);
    });

    test("flags a Safari user agent running on V8", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.macSafari,
            etsl: 33,
            platform: "MacIntel",
        }))).toBe(true);
    });

    test("flags an iPhone user agent running on V8", () => {
        expect(hasInconsistentEtsl(buildFingerprint({
            userAgent: USER_AGENTS.iphoneSafari,
            etsl: 33,
            platform: "iPhone",
        }))).toBe(true);
    });
});
