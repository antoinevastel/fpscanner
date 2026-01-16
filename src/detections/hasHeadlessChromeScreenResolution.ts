import { Fingerprint } from '../types';

export function hasHeadlessChromeScreenResolution(fingerprint: Fingerprint) {
    if (typeof fingerprint.signals.screenResolution.width !== 'number' || typeof fingerprint.signals.screenResolution.height !== 'number') {
        return false;
    }

    return (fingerprint.signals.screenResolution.width === 600 && fingerprint.signals.screenResolution.height === 800) || (fingerprint.signals.screenResolution.availableWidth === 600 && fingerprint.signals.screenResolution.availableHeight === 800) || (fingerprint.signals.screenResolution.innerWidth === 600 && fingerprint.signals.screenResolution.innerHeight === 800);
}