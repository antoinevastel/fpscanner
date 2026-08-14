import { Fingerprint } from "../types";
import { describeEnvironment } from "./environment";

/**
 * Chromium and Gecko tie `navigator.plugins` to `navigator.pdfViewerEnabled`: either the viewer
 * is on and the five hardcoded PDF entries are there, or it is off and the list is empty.
 * Patched environments rebuild one and leave the other alone.
 */
export function hasPdfViewerMismatch(fingerprint: Fingerprint) {
    const { engine } = describeEnvironment(fingerprint);
    if (engine !== "v8" && engine !== "gecko") {
        return false;
    }

    const plugins = fingerprint.signals.browser.plugins;
    if (typeof plugins.pdfViewerEnabled !== "boolean" || typeof plugins.pluginCount !== "number") {
        return false;
    }

    return plugins.pdfViewerEnabled !== (plugins.pluginCount > 0);
}
