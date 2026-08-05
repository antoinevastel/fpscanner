import { Fingerprint } from "../types";
import { usableString } from "../signals/utils";

export function hasMismatchPlatformIframe(fingerprint: Fingerprint) {
    const devicePlatform = usableString(fingerprint.signals.device.platform);
    const iframePlatform = usableString(fingerprint.signals.contexts.iframe.platform);

    if (devicePlatform === undefined || iframePlatform === undefined) {
        return false;
    }

    return devicePlatform !== iframePlatform;
}
