import { Fingerprint } from "../types";

export function hasPlaywright(fingerprint: Fingerprint) {
    return fingerprint.signals.playwright === true;
}