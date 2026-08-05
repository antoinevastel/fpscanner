import { Fingerprint } from "../types";
import { describeEnvironment } from "./environment";

export function hasMissingChromeObject(fingerprint: Fingerprint) {
    const { os, engine } = describeEnvironment(fingerprint);

    // In-app browsers and system WebViews on Android and iOS often ship a Chrome-like user
    // agent without exposing window.chrome. That is common on real devices, so this rule is
    // only meant for desktop-style environments where a missing chrome object is suspicious.
    // iOS needs no test of its own: its claimed engine is never V8.
    if (engine !== "v8" || os === "android") {
        return false;
    }

    return fingerprint.signals.browser.features.chrome === false;
}
