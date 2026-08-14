import { describe, expect, test } from "vitest";
import { hasTamperedNativeGetter } from "./hasTamperedNativeGetter";
import { ERROR, NA } from "../signals/utils";
import { buildFingerprint } from "./userAgents.fixture";

describe("hasTamperedNativeGetter", () => {
    test("flags a getter that could not stringify without the globals", () => {
        expect(hasTamperedNativeGetter(buildFingerprint({ nativeGetterTamper: true }))).toBe(true);
    });

    test("does not flag a native getter", () => {
        expect(hasTamperedNativeGetter(buildFingerprint({ nativeGetterTamper: false }))).toBe(false);
    });

    test.each([
        ["the globals could not be removed", NA],
        ["collection failed", ERROR],
    ])("does not flag a fingerprint where %s", (_name, value) => {
        expect(hasTamperedNativeGetter(buildFingerprint({ nativeGetterTamper: value }))).toBe(false);
    });
});
