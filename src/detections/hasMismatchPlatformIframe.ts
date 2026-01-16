import { Fingerprint } from "../types";
import { ERROR, NA } from "../signals/utils";

export function hasMismatchPlatformIframe(fingerprint: Fingerprint) {
    if (fingerprint.signals.iframe.platform === NA || fingerprint.signals.iframe.platform === ERROR) {
        return false;
    }

    return fingerprint.signals.platform !== fingerprint.signals.iframe.platform;
}
