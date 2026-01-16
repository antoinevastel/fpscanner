import { Fingerprint } from "../types";

export function hasCDP(fingerprint: Fingerprint) {
    return fingerprint.signals.cdp === true;
}