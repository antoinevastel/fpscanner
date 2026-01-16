import { Fingerprint } from "../types";

export function hasWebdriverIframe(fingerprint: Fingerprint) {
    return fingerprint.signals.iframe.webdriver === true;
}
