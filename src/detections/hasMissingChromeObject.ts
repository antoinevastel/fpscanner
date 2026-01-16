import { Fingerprint } from "../types";

export function hasMissingChromeObject(fingerprint: Fingerprint) {
    return fingerprint.signals.chrome === false && fingerprint.signals.userAgent.includes('Chrome');
}