import { Fingerprint } from "../types";

export function hasWebdriverWorker(fingerprint: Fingerprint) {
    return fingerprint.signals.webworker.webdriver === true;
}
