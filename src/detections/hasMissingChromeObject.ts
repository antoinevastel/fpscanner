import { Fingerprint } from "../types";

/**
 * In-app browsers and system WebViews on Android/iOS often ship a Chrome-like UA but
 * do not expose window.chrome. That is common on real devices, so this rule is only
 * meant for desktop-style environments where missing chrome is suspicious.
 */
function isClaimedMobileUserAgent(ua: string): boolean {
    return (
        ua.includes("Android") ||
        ua.includes("iPhone") ||
        ua.includes("iPod") ||
        ua.includes("iPad")
    );
}

export function hasMissingChromeObject(fingerprint: Fingerprint) {
    const userAgent = fingerprint.signals.browser.userAgent;
    if (typeof userAgent !== "string" || !userAgent.includes("Chrome")) {
        return false;
    }
    if (isClaimedMobileUserAgent(userAgent)) {
        return false;
    }
    return fingerprint.signals.browser.features.chrome === false;
}