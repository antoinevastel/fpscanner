import { Fingerprint } from "../types";

// Not used as a detection rule since, more like an indicator
export function hasContextMismatch(fingerprint: Fingerprint, context: 'iframe' | 'worker'): boolean {
    const s = fingerprint.signals;
    if (context === 'iframe') {
        return s.iframe.webdriver !== s.webdriver ||
               s.iframe.userAgent !== s.userAgent ||
               s.iframe.platform !== s.platform ||
               s.iframe.memory !== s.memory ||
               s.iframe.cpuCount !== s.cpuCount;
    } else {
        return s.webworker.webdriver !== s.webdriver ||
               s.webworker.userAgent !== s.userAgent ||
               s.webworker.platform !== s.platform ||
               s.webworker.memory !== s.memory ||
               s.webworker.cpuCount !== s.cpuCount;
    }
}