import { Fingerprint } from "../types";
import { ERROR, NA, SKIPPED } from "../signals/utils";

/**
 * iPad Safari in desktop-style mode often reports navigator.platform as "MacIntel"
 * in the top-level window (and same-origin iframe) while dedicated workers can still
 * report "iPad". That split is expected on real hardware, not a worker spoof signal.
 */
function isBenignIPadMacPlatformSplit(a: string, b: string): boolean {
    const aIsIPad = a.includes("iPad");
    const bIsIPad = b.includes("iPad");
    if (aIsIPad === bIsIPad) {
        return false;
    }
    const macDesktopCompat = (p: string) => p === "MacIntel" || p === "MacPPC";
    return macDesktopCompat(a) || macDesktopCompat(b);
}

export function hasMismatchPlatformWorker(fingerprint: Fingerprint) {
    if (fingerprint.signals.contexts.webWorker.platform === NA || fingerprint.signals.contexts.webWorker.platform === ERROR || fingerprint.signals.contexts.webWorker.platform === SKIPPED) {
        return false;
    }

    const devicePlatform = fingerprint.signals.device.platform;
    const workerPlatform = fingerprint.signals.contexts.webWorker.platform;

    if (devicePlatform === workerPlatform) {
        return false;
    }

    if (isBenignIPadMacPlatformSplit(devicePlatform, workerPlatform)) {
        return false;
    }

    return true;
}
