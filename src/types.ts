import { ERROR, INIT, NA } from './signals/utils';

export type SignalValue<T> = T | typeof ERROR | typeof INIT | typeof NA;

export interface WebGLSignal {
    vendor: SignalValue<string>;
    renderer: SignalValue<string>;
}

export interface InternationalizationSignal {
    timezone: SignalValue<string>;
    localeLanguage: SignalValue<string>;
}

export interface ScreenResolutionSignal {
    width: SignalValue<number>;
    height: SignalValue<number>;
    pixelDepth: SignalValue<number>;
    colorDepth: SignalValue<number>;
    availableWidth: SignalValue<number>;
    availableHeight: SignalValue<number>;
    innerWidth: SignalValue<number>;
    innerHeight: SignalValue<number>;
    hasMultipleDisplays: SignalValue<boolean>;
}

export interface LanguagesSignal {
    languages: SignalValue<string[]>;
    language: SignalValue<string>;
}

export interface WebGPUSignal {
    vendor: SignalValue<string>;
    architecture: SignalValue<string>;
    device: SignalValue<string>;
    description: SignalValue<string>;
}

export interface IframeSignal {
    webdriver: SignalValue<boolean>;
    userAgent: SignalValue<string>;
    platform: SignalValue<string>;
    memory: SignalValue<number>;
    cpuCount: SignalValue<number>;
    language: SignalValue<string>;
}

export interface WebWorkerSignal {
    webdriver: SignalValue<boolean>;
    userAgent: SignalValue<string>;
    platform: SignalValue<string>;
    memory: SignalValue<number>;
    cpuCount: SignalValue<number>;
    language: SignalValue<string>;
    vendor: SignalValue<string>;
    renderer: SignalValue<string>;
}

export interface FingerprintSignals {
    webdriver: SignalValue<boolean>;
    userAgent: SignalValue<string>;
    platform: SignalValue<string>;
    cdp: SignalValue<boolean>;
    webGL: WebGLSignal;
    playwright: SignalValue<boolean>;
    brave: SignalValue<boolean>;
    cpuCount: SignalValue<number>;
    memory: SignalValue<number>;
    etsl: SignalValue<number>;
    chrome: SignalValue<boolean>;
    internationalization: InternationalizationSignal;
    screenResolution: ScreenResolutionSignal;
    languages: LanguagesSignal;
    webgpu: WebGPUSignal;
    iframe: IframeSignal;
    webworker: WebWorkerSignal;
}

export interface FastBotDetectionDetails {
    headlessChromeScreenResolution: boolean;
    hasWebdriver: boolean;
    hasCDP: boolean;
    hasPlaywright: boolean;
    hasImpossibleDeviceMemory: boolean;
    hasHighCPUCount: boolean;
    hasMissingChromeObject: boolean;
    hasWebdriverIframe: boolean;
    hasWebdriverWorker: boolean;
    hasMismatchWebGLInWorker: boolean;
    hasMismatchPlatformIframe: boolean;
    hasMismatchPlatformWorker: boolean;
}
export interface Fingerprint {
    signals: FingerprintSignals;
    fsid: string;
    nonce: string;
    time: SignalValue<number>;
    fastBotDetection: boolean;
    fastBotDetectionDetails: FastBotDetectionDetails;
}

