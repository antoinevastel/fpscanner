import { Fingerprint } from "../types";
import { describeEnvironment } from "./environment";

/**
 * Windows Hello and Touch ID answer yes on a normal desktop, headless and virtualised Chromium
 * answer no. An Intel Mac without Touch ID answers no too, hence the low severity. Restricted
 * to Chromium desktop, and skipped outside a secure context where the API is absent by design.
 */
export function hasNoPlatformAuthenticator(fingerprint: Fingerprint) {
    const { engine, isDesktop } = describeEnvironment(fingerprint);
    if (engine !== "v8" || !isDesktop) {
        return false;
    }

    const webauthn = fingerprint.signals.browser.webauthn;
    if (webauthn.secureContext !== true || webauthn.available !== true) {
        return false;
    }

    return webauthn.userVerifyingPlatformAuthenticator === false;
}
