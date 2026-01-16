import { Fingerprint } from "../types";

export function hasHighCPUCount(fingerprint: Fingerprint) {
    if (typeof fingerprint.signals.cpuCount !== 'number') {
        return false;
    }

    return fingerprint.signals.cpuCount > 70;
}