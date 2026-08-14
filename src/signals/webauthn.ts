import { ERROR, INIT, NA, setObjectValues } from "./utils";
import { WebAuthnSignal } from "../types";

/** Fixed order, so an unknown capability leaves the existing bits where they are. */
const CLIENT_CAPABILITIES = [
    "conditionalCreate",
    "conditionalGet",
    "hybridTransport",
    "passkeyPlatformAuthenticator",
    "userVerifyingPlatformAuthenticator",
    "relatedOrigins",
    "signalAllAcceptedCredentials",
    "signalCurrentUserDetails",
    "signalUnknownCredential",
    "extension:credProps",
    "extension:prf",
];

/**
 * Whether the machine can answer a passkey itself follows the hardware and the OS rather than
 * the browser build: Touch ID, Windows Hello, an Android screen lock. `PublicKeyCredential` only
 * exists in a secure context, so the flag is collected next to it, since without it an absent
 * API says nothing.
 */
export async function webauthn(): Promise<WebAuthnSignal> {
    const webauthnData: WebAuthnSignal = {
        secureContext: INIT,
        available: INIT,
        capabilitiesBitmask: INIT,
        userVerifyingPlatformAuthenticator: INIT,
    };

    webauthnData.secureContext = window.isSecureContext === true;

    const publicKeyCredential = (window as any).PublicKeyCredential;
    if (typeof publicKeyCredential !== "function") {
        webauthnData.available = false;
        webauthnData.capabilitiesBitmask = NA;
        webauthnData.userVerifyingPlatformAuthenticator = NA;
        return webauthnData;
    }

    webauthnData.available = true;

    try {
        if (typeof publicKeyCredential.getClientCapabilities === "function") {
            const capabilities = await publicKeyCredential.getClientCapabilities();
            webauthnData.capabilitiesBitmask = CLIENT_CAPABILITIES
                .map((capability) => (capabilities[capability] ? "1" : "0"))
                .join("");
            webauthnData.userVerifyingPlatformAuthenticator =
                capabilities.userVerifyingPlatformAuthenticator === true;
            return webauthnData;
        }

        webauthnData.capabilitiesBitmask = NA;
        webauthnData.userVerifyingPlatformAuthenticator =
            await publicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (e) {
        setObjectValues(webauthnData, ERROR);
    }

    return webauthnData;
}
