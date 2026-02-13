import { Fingerprint } from "../types";
import { ERROR, NA } from "../signals/utils";

export function hasPlatformMismatch(fingerprint: Fingerprint) {
    const platform = fingerprint.signals.device.platform;
    const userAgent = fingerprint.signals.browser.userAgent;
    const highEntropyPlatform = fingerprint.signals.browser.highEntropyValues.platform;
    
    if (userAgent.includes('Mac') && !platform.includes('Mac')) {
        return true;
    }

    if (userAgent.includes('Windows') && !platform.includes('Win')) {
        return true;
    }
    
    if (userAgent.includes('Linux') && !platform.includes('Linux')) {
        return true;
    }


    // Check applied only if highEntropyPlatform is not ERROR or NA
    if (highEntropyPlatform !== ERROR && highEntropyPlatform !== NA) {
        if (highEntropyPlatform.includes('Mac') && !platform.includes('Mac')) {
            return true;
        }
        
        if (highEntropyPlatform.includes('Windows') && !platform.includes('Win')) {
            return true;
        }

        if (highEntropyPlatform.includes('Linux') && !platform.includes('Linux')) {
            return true;
        }

        if (highEntropyPlatform.includes('Android') && !platform.includes('Android')) {
            return true;
        }

        if (highEntropyPlatform.includes('iOS') && !platform.includes('iOS')) {
            return true;
        }  
    }

    return false;
}