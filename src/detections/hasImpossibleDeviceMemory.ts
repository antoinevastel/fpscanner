import { Fingerprint } from "../types";

export function hasImpossibleDeviceMemory(fingerprint: Fingerprint) {
    if (typeof fingerprint.signals.memory !== 'number') {
        return false;
    }

    return (fingerprint.signals.memory > 8 || fingerprint.signals.memory < 0.25);
}