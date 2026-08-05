import { Fingerprint } from "../types";
import { ERROR, NA, SKIPPED } from "../signals/utils";

/**
 * iOS Safari in desktop-style mode reports navigator.platform as "MacIntel" in the
 * top-level window (and same-origin iframe) while dedicated workers still report the
 * real device. Desktop mode is the default on iPad and opt-in on iPhone/iPod via
 * "Request Desktop Website", so the split is expected on all iOS hardware.
 */
const IOS_DEVICE_PLATFORM = /^(iPhone|iPad|iPod)/;

function isBenignIOSMacPlatformSplit(a: string, b: string): boolean {
    const aIsIOS = IOS_DEVICE_PLATFORM.test(a);
    const bIsIOS = IOS_DEVICE_PLATFORM.test(b);
    if (aIsIOS === bIsIOS) {
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

    if (isBenignIOSMacPlatformSplit(devicePlatform, workerPlatform)) {
        return false;
    }

    return true;
}
