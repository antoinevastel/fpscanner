import { describe, expect, test } from "vitest";
import { hasPdfViewerMismatch } from "./hasPdfViewerMismatch";
import { ERROR, NA } from "../signals/utils";
import { USER_AGENTS, buildFingerprint } from "./userAgents.fixture";

describe("hasPdfViewerMismatch", () => {
    test.each([
        ["Windows Chrome", USER_AGENTS.windowsChrome, "Win32"],
        ["macOS Chrome", USER_AGENTS.macChrome, "MacIntel"],
        ["Windows Firefox", USER_AGENTS.windowsFirefox, "Win32"],
        ["Android Chrome", USER_AGENTS.androidChrome, "Linux armv8l"],
    ])("does not flag %s reporting the viewer and its entries", (_name, userAgent, platform) => {
        expect(hasPdfViewerMismatch(buildFingerprint({
            userAgent,
            platform,
            pdfViewerEnabled: true,
            pluginCount: 5,
        }))).toBe(false);
    });

    test("does not flag Chromium with the viewer disabled and no entries", () => {
        expect(hasPdfViewerMismatch(buildFingerprint({
            pdfViewerEnabled: false,
            pluginCount: 0,
        }))).toBe(false);
    });

    test("flags entries kept while the viewer reports off", () => {
        expect(hasPdfViewerMismatch(buildFingerprint({
            pdfViewerEnabled: false,
            pluginCount: 5,
        }))).toBe(true);
    });

    test("flags a wiped plugin array while the viewer reports on", () => {
        expect(hasPdfViewerMismatch(buildFingerprint({
            pdfViewerEnabled: true,
            pluginCount: 0,
        }))).toBe(true);
    });

    test("does not flag Safari, which never exposed the flag", () => {
        expect(hasPdfViewerMismatch(buildFingerprint({
            userAgent: USER_AGENTS.macSafari,
            platform: "MacIntel",
            pdfViewerEnabled: NA,
            pluginCount: 5,
        }))).toBe(false);
    });

    test.each([
        ["the flag", { pdfViewerEnabled: ERROR, pluginCount: 5 }],
        ["the plugin count", { pdfViewerEnabled: false, pluginCount: ERROR }],
    ])("does not flag a fingerprint that failed to collect %s", (_name, overrides) => {
        expect(hasPdfViewerMismatch(buildFingerprint(overrides))).toBe(false);
    });
});
