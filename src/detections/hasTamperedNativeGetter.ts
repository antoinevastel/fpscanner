import { Fingerprint } from "../types";

export function hasTamperedNativeGetter(fingerprint: Fingerprint) {
    return fingerprint.signals.automation.nativeGetterTamper === true;
}
