import { Fingerprint } from "../types";
import { describeEnvironment } from "./environment";

/**
 * `eval.toString().length` is a property of the JavaScript engine rather than of the
 * browser: V8 reports 33, while SpiderMonkey (Firefox) and JavaScriptCore (WebKit) report 37.
 */
const V8_ETSL = 33;
const SPIDERMONKEY_AND_JSC_ETSL = 37;

export function hasInconsistentEtsl(fingerprint: Fingerprint) {
    const etsl = fingerprint.signals.browser.etsl;
    if (typeof etsl !== "number") {
        return false;
    }

    const { engine, isDesktop } = describeEnvironment(fingerprint);
    switch (engine) {
        case "v8":
            // A `Chrome/` token only pins the engine down on a Windows or macOS desktop.
            return isDesktop && etsl !== V8_ETSL;
        case "gecko":
        case "webkit":
            return etsl !== SPIDERMONKEY_AND_JSC_ETSL;
        default:
            return false;
    }
}
