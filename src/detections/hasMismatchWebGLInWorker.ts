import { Fingerprint } from "../types";
import { ERROR, INIT, NA, SKIPPED } from "../signals/utils";

function webGLStringUnavailable(value: unknown): boolean {
    if (typeof value !== "string" || value.length === 0) {
        return true;
    }
    return value === NA || value === ERROR || value === SKIPPED || value === INIT;
}

export function hasMismatchWebGLInWorker(fingerprint: Fingerprint) {
    const worker = fingerprint.signals.contexts.webWorker;
    const webGL = fingerprint.signals.graphics.webGL;

    if (
        webGLStringUnavailable(webGL.vendor) ||
        webGLStringUnavailable(webGL.renderer) ||
        webGLStringUnavailable(worker.vendor) ||
        webGLStringUnavailable(worker.renderer)
    ) {
        return false;
    }

    return worker.vendor !== webGL.vendor || worker.renderer !== webGL.renderer;
}
