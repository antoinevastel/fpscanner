import { describe, expect, test } from "vitest";
import { hasMismatchPlatformWorker } from "./hasMismatchPlatformWorker";
import { Fingerprint } from "../types";
import { ERROR, NA, SKIPPED } from "../signals/utils";

function buildFingerprint(devicePlatform: string, workerPlatform: string): Fingerprint {
    return {
        signals: {
            device: { platform: devicePlatform },
            contexts: { webWorker: { platform: workerPlatform } },
        },
    } as unknown as Fingerprint;
}

describe("hasMismatchPlatformWorker", () => {
    test("does not flag matching platforms", () => {
        expect(hasMismatchPlatformWorker(buildFingerprint("MacIntel", "MacIntel"))).toBe(false);
    });

    test.each([NA, ERROR, SKIPPED])("does not flag when the worker platform is %s", (workerPlatform) => {
        expect(hasMismatchPlatformWorker(buildFingerprint("MacIntel", workerPlatform as string))).toBe(false);
    });

    test.each(["iPhone", "iPad", "iPod touch"])(
        "does not flag iOS desktop mode reporting MacIntel over %s",
        (workerPlatform) => {
            expect(hasMismatchPlatformWorker(buildFingerprint("MacIntel", workerPlatform))).toBe(false);
            expect(hasMismatchPlatformWorker(buildFingerprint(workerPlatform, "MacIntel"))).toBe(false);
        },
    );

    test("flags a genuine cross-OS mismatch", () => {
        expect(hasMismatchPlatformWorker(buildFingerprint("Win32", "Linux x86_64"))).toBe(true);
    });

    test("flags a mismatch between two distinct iOS platforms", () => {
        expect(hasMismatchPlatformWorker(buildFingerprint("iPhone", "iPad"))).toBe(true);
    });
});
