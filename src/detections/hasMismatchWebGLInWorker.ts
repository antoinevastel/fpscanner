import { Fingerprint } from "../types";
import { ERROR, NA } from "../signals/utils";

export function hasMismatchWebGLInWorker(fingerprint: Fingerprint) {
    if (fingerprint.signals.webworker.vendor === ERROR || fingerprint.signals.webworker.renderer === ERROR || fingerprint.signals.webGL.vendor === NA || fingerprint.signals.webGL.renderer === NA) {
        return false;
    }

    return fingerprint.signals.webworker.vendor !== fingerprint.signals.webGL.vendor || fingerprint.signals.webworker.renderer !== fingerprint.signals.webGL.renderer;
}
