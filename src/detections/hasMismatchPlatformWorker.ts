import { Fingerprint } from "../types";
import { usableString } from "../signals/utils";
import { isIOSDevicePlatform } from "./environment";

/**
 * iOS Safari in desktop-style mode reports navigator.platform as "MacIntel" in the
 * top-level window (and same-origin iframe) while dedicated workers still report the
 * real device. Desktop mode is the default on iPad and opt-in on iPhone/iPod via
 * "Request Desktop Website", so the split is expected on all iOS hardware.
 */
function isBenignIOSMacPlatformSplit(a: string, b: string): boolean {
    if (isIOSDevicePlatform(a) === isIOSDevicePlatform(b)) {
        return false;
    }
    const macDesktopCompat = (platform: string) => platform === "MacIntel" || platform === "MacPPC";
    return macDesktopCompat(a) || macDesktopCompat(b);
}

export function hasMismatchPlatformWorker(fingerprint: Fingerprint) {
    const devicePlatform = usableString(fingerprint.signals.device.platform);
    const workerPlatform = usableString(fingerprint.signals.contexts.webWorker.platform);

    if (devicePlatform === undefined || workerPlatform === undefined) {
        return false;
    }

    if (devicePlatform === workerPlatform) {
        return false;
    }

    if (isBenignIOSMacPlatformSplit(devicePlatform, workerPlatform)) {
        return false;
    }

    return true;
}
