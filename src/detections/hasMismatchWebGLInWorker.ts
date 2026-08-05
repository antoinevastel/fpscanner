import { Fingerprint } from "../types";
import { usableStrings } from "../signals/utils";

export function hasMismatchWebGLInWorker(fingerprint: Fingerprint) {
    const worker = fingerprint.signals.contexts.webWorker;
    const webGL = fingerprint.signals.graphics.webGL;

    const collected = usableStrings(webGL.vendor, webGL.renderer, worker.vendor, worker.renderer);
    if (collected.length !== 4) {
        return false;
    }

    return worker.vendor !== webGL.vendor || worker.renderer !== webGL.renderer;
}
