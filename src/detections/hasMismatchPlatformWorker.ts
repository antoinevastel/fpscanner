import { Fingerprint } from "../types";
import { ERROR, NA } from "../signals/utils";

export function hasMismatchPlatformWorker(fingerprint: Fingerprint) {
    if (fingerprint.signals.webworker.platform === NA || fingerprint.signals.webworker.platform === ERROR) {
        return false;
    }

    return fingerprint.signals.platform !== fingerprint.signals.webworker.platform;
}
