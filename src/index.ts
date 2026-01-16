// Import all signals
import { webdriver } from './signals/webdriver';
import { userAgent } from './signals/userAgent';
import { platform } from './signals/platform';
import { cdp } from './signals/cdp';
import { webGL } from './signals/webGL';
import { playwright } from './signals/playwright';
import { brave } from './signals/brave';
import { cpuCount } from './signals/cpuCount';
import { memory } from './signals/memory';
import { etsl } from './signals/etsl';
import { chrome } from './signals/chrome';
import { internationalization } from './signals/internationalization';
import { screenResolution } from './signals/screenResolution';
import { languages } from './signals/languages';
import { webgpu } from './signals/webgpu';

// Fast Bot Detection tests
import { hasHeadlessChromeScreenResolution } from './detections/hasHeadlessChromeScreenResolution';
import { hasWebdriver } from './detections/hasWebdriver';
import { hasCDP } from './detections/hasCDP';
import { hasPlaywright } from './detections/hasPlaywright';
import { hasImpossibleDeviceMemory } from './detections/hasImpossibleDeviceMemory';
import { hasHighCPUCount } from './detections/hasHighCPUCount';
import { hasMissingChromeObject } from './detections/hasMissingChromeObject';

import { ERROR, INIT, NA } from './signals/utils';
import { encryptString, decryptString } from './crypto-helpers';
import { Fingerprint, FastBotDetectionDetails } from './types';
import { iframe } from './signals/iframe';
import { worker } from './signals/worker';
import { hasWebdriverIframe } from './detections/hasWebdriverIframe';
import { hasWebdriverWorker } from './detections/hasWebdriverWorker';
import { hasMismatchWebGLInWorker } from './detections/hasMismatchWebGLInWorker';
import { hasMismatchPlatformWorker } from './detections/hasMismatchPlatformWorker';
import { hasMismatchPlatformIframe } from './detections/hasMismatchPlatformIframe';
import { nonce } from './signals/nonce';
import { time } from './signals/time';
import { hasContextMismatch } from './detections/hasContextMismatch';

class FingerprintScanner {
    private fingerprint: Fingerprint;

    constructor() {
        this.fingerprint = {
            signals: {
                webdriver: INIT,
                userAgent: INIT,
                platform: INIT,
                cdp: INIT,
                webGL: {
                    vendor: INIT,
                    renderer: INIT,
                },
                playwright: INIT,
                brave: INIT,
                cpuCount: INIT,
                memory: INIT,
                etsl: INIT,
                chrome: INIT,
                internationalization: {
                    timezone: INIT,
                    localeLanguage: INIT,
                },
                screenResolution: {
                    width: INIT,
                    height: INIT,
                    pixelDepth: INIT,
                    colorDepth: INIT,
                    availableWidth: INIT,
                    availableHeight: INIT,
                    innerWidth: INIT,
                    innerHeight: INIT,
                    hasMultipleDisplays: INIT,
                },
                languages: {
                    languages: INIT,
                    language: INIT,
                },
                webgpu: {
                    vendor: INIT,
                    architecture: INIT,
                    device: INIT,
                    description: INIT,
                },
                iframe: {
                    webdriver: INIT,
                    userAgent: INIT,
                    platform: INIT,
                    memory: INIT,
                    cpuCount: INIT,
                    language: INIT,
                },
                webworker: {
                    webdriver: INIT,
                    userAgent: INIT,
                    platform: INIT,
                    memory: INIT,
                    cpuCount: INIT,
                    language: INIT,
                    vendor: INIT,
                    renderer: INIT,
                },
            },
            fsid: INIT,
            nonce: INIT,
            time: INIT,
            fastBotDetection: false,
            fastBotDetectionDetails: {
                headlessChromeScreenResolution: false,
                hasWebdriver: false,
                hasCDP: false,
                hasPlaywright: false,
                hasImpossibleDeviceMemory: false,
                hasHighCPUCount: false,
                hasMissingChromeObject: false,
                hasWebdriverIframe: false,
                hasWebdriverWorker: false,
                hasMismatchWebGLInWorker: false,
                hasMismatchPlatformIframe: false,
                hasMismatchPlatformWorker: false,
            },
        };
    }

    private async collectSignal(signal: () => any) {
        try {
            return await signal();
        } catch (e) {
            return ERROR;
        }
    }

    private safeDetectionTest(test: () => boolean) {
        try {
            return test();
        } catch (e) {
            return false;
        }
    }

    /**
     * Generate a short hex hash of a string
     */
    private shortHash(str: string, length: number): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        const hex = Math.abs(hash).toString(16).padStart(8, '0');
        return hex.slice(0, length);
    }

    /**
     * Generate a JA4-inspired fingerprint scanner ID
     * Format: FS1_<bot>_<env>_<hw>_<gl>_<gpu>_<scr>_<loc>_<ifr>_<wrk>
     * 
     * Each section is delimited by '_', allowing partial matching.
     * - bot: detection count + binary flags (webdriver, cdp, playwright)
     * - env: hash of userAgent, platform, chrome, brave, etsl
     * - hw: human readable cpu count + memory
     * - gl: hash of WebGL vendor + renderer
     * - gpu: hash of WebGPU attributes
     * - scr: screen dimensions + hash of other screen attributes
     * - loc: primary language + count + hash of all locale data
     * - ifr: mismatch flag + hash of iframe signals
     * - wrk: mismatch flag + hash of worker signals
     */
    private generateFingerprintScannerId(): string {
        try {
            const s = this.fingerprint.signals;
            const det = this.fingerprint.fastBotDetectionDetails;

            // Section 1: Version
            const version = 'FS1';

            // Section 2: Bot indicators - count of triggered detections + 3 binary flags
            const detectionCount = Object.values(det).filter(Boolean).length;
            const detectionCountStr = String(detectionCount).padStart(2, '0');
            const botFlags = [
                s.webdriver === true ? '1' : '0',
                s.cdp === true ? '1' : '0',
                s.playwright === true ? '1' : '0',
            ].join('');
            const botSection = `${detectionCountStr}${botFlags}`;

            // Section 3: Browser environment hash (userAgent, platform, chrome, brave, etsl)
            const envStr = [
                s.userAgent,
                s.platform,
                s.chrome,
                s.brave,
                s.etsl,
            ].map(v => String(v)).join('|');
            const envHash = this.shortHash(envStr, 6);

            // Section 4: Hardware (cpu + memory) - human readable
            const cpu = typeof s.cpuCount === 'number' ? String(s.cpuCount).padStart(2, '0') : '00';
            const mem = typeof s.memory === 'number' ? String(Math.round(s.memory)).padStart(2, '0') : '00';
            const hardware = `c${cpu}m${mem}`;

            // Section 5: WebGL hash (vendor + renderer)
            const webglStr = [s.webGL.vendor, s.webGL.renderer].map(v => String(v)).join('|');
            const webglHash = this.shortHash(webglStr, 6);

            // Section 6: WebGPU hash (vendor, architecture, device, description)
            const webgpuStr = [
                s.webgpu.vendor,
                s.webgpu.architecture,
                s.webgpu.device,
                s.webgpu.description,
            ].map(v => String(v)).join('|');
            const webgpuHash = this.shortHash(webgpuStr, 6);

            // Section 7: Screen - dimensions readable + hash of all other screen attributes
            const width = typeof s.screenResolution.width === 'number' ? s.screenResolution.width : 0;
            const height = typeof s.screenResolution.height === 'number' ? s.screenResolution.height : 0;
            const screenRestStr = [
                s.screenResolution.pixelDepth,
                s.screenResolution.colorDepth,
                s.screenResolution.availableWidth,
                s.screenResolution.availableHeight,
                s.screenResolution.innerWidth,
                s.screenResolution.innerHeight,
                s.screenResolution.hasMultipleDisplays,
            ].map(v => String(v)).join('|');
            const screenHash = this.shortHash(screenRestStr, 4);
            const screen = `${width}x${height}h${screenHash}`;

            // Section 8: Locale - primary language + count readable, hash of all locale data
            const primaryLang = typeof s.languages.language === 'string'
                ? s.languages.language.slice(0, 2).toLowerCase()
                : 'xx';
            const langCount = Array.isArray(s.languages.languages) ? s.languages.languages.length : 0;
            const localeStr = [
                s.internationalization.timezone,
                s.internationalization.localeLanguage,
                Array.isArray(s.languages.languages) ? s.languages.languages.join(',') : s.languages.languages,
                s.languages.language,
            ].map(v => String(v)).join('|');
            const localeHash = this.shortHash(localeStr, 4);
            const locale = `${primaryLang}${langCount}h${localeHash}`;

            // Section 9: Iframe context - mismatch flag + hash of all iframe signals
            const iframeMismatch = hasContextMismatch(this.fingerprint, 'iframe') ? '1' : '0';
            const iframeStr = [
                s.iframe.webdriver,
                s.iframe.userAgent,
                s.iframe.platform,
                s.iframe.memory,
                s.iframe.cpuCount,
                s.iframe.language,
            ].map(v => String(v)).join('|');
            const iframeHash = this.shortHash(iframeStr, 6);
            const iframeSection = `${iframeMismatch}h${iframeHash}`;

            // Section 10: Worker context - mismatch flag + hash of all worker signals
            const workerMismatch = hasContextMismatch(this.fingerprint, 'worker') ? '1' : '0';
            const workerStr = [
                s.webworker.webdriver,
                s.webworker.userAgent,
                s.webworker.platform,
                s.webworker.memory,
                s.webworker.cpuCount,
                s.webworker.language,
                s.webworker.vendor,
                s.webworker.renderer,
            ].map(v => String(v)).join('|');
            const workerHash = this.shortHash(workerStr, 6);
            const workerSection = `${workerMismatch}h${workerHash}`;

            return [
                version,
                botSection,
                envHash,
                hardware,
                webglHash,
                webgpuHash,
                screen,
                locale,
                iframeSection,
                workerSection,
            ].join('_');
        } catch (e) {
            console.error('Error generating fingerprint scanner id', e);
            return ERROR;
        }
    }

    private async encryptFingerprint(fingerprint: string) {
        // Key is injected at build time via Vite's define option
        // Customers run: npx fpscanner build --key=their-key
        const key = __FP_ENCRYPTION_KEY__;
        const enc = await encryptString(JSON.stringify(fingerprint), key);

        return enc;
    }

    private getFastBotDetectionDetails(): FastBotDetectionDetails {
        return {
            headlessChromeScreenResolution: this.safeDetectionTest(() => hasHeadlessChromeScreenResolution(this.fingerprint)),
            hasWebdriver: this.safeDetectionTest(() => hasWebdriver(this.fingerprint)),
            hasCDP: this.safeDetectionTest(() => hasCDP(this.fingerprint)),
            hasPlaywright: this.safeDetectionTest(() => hasPlaywright(this.fingerprint)),
            hasImpossibleDeviceMemory: this.safeDetectionTest(() => hasImpossibleDeviceMemory(this.fingerprint)),
            hasHighCPUCount: this.safeDetectionTest(() => hasHighCPUCount(this.fingerprint)),
            hasMissingChromeObject: this.safeDetectionTest(() => hasMissingChromeObject(this.fingerprint)),
            hasWebdriverIframe: this.safeDetectionTest(() => hasWebdriverIframe(this.fingerprint)),
            hasWebdriverWorker: this.safeDetectionTest(() => hasWebdriverWorker(this.fingerprint)),
            hasMismatchWebGLInWorker: this.safeDetectionTest(() => hasMismatchWebGLInWorker(this.fingerprint)),
            hasMismatchPlatformIframe: this.safeDetectionTest(() => hasMismatchPlatformIframe(this.fingerprint)),
            hasMismatchPlatformWorker: this.safeDetectionTest(() => hasMismatchPlatformWorker(this.fingerprint)),
        };
    }

    async collectFingerprint() {
        // Is it optimal to chain await like this?
        // I should probably use a Promise.all or a Promise.allSettled to collect all signals at once
        // and then wait for the results
        this.fingerprint.signals.webdriver = await this.collectSignal(webdriver);
        this.fingerprint.signals.userAgent = await this.collectSignal(userAgent);
        this.fingerprint.signals.platform = await this.collectSignal(platform);
        this.fingerprint.signals.cdp = await this.collectSignal(cdp);
        this.fingerprint.signals.webGL = await this.collectSignal(webGL);
        this.fingerprint.signals.playwright = await this.collectSignal(playwright);
        this.fingerprint.signals.brave = await this.collectSignal(brave);
        this.fingerprint.signals.cpuCount = await this.collectSignal(cpuCount);
        this.fingerprint.signals.memory = await this.collectSignal(memory);
        this.fingerprint.signals.etsl = await this.collectSignal(etsl);
        this.fingerprint.signals.chrome = await this.collectSignal(chrome);
        this.fingerprint.signals.internationalization = await this.collectSignal(internationalization);
        this.fingerprint.signals.screenResolution = await this.collectSignal(screenResolution);
        this.fingerprint.signals.languages = await this.collectSignal(languages);
        this.fingerprint.signals.webgpu = await this.collectSignal(webgpu);
        this.fingerprint.signals.iframe = await this.collectSignal(iframe);
        this.fingerprint.signals.webworker = await this.collectSignal(worker);
        
        this.fingerprint.nonce = await this.collectSignal(nonce);
        this.fingerprint.time = await this.collectSignal(time);

        // Run detection tests first (needed for fsid generation)
        this.fingerprint.fastBotDetectionDetails = this.getFastBotDetectionDetails();
        
        // fastBotDetection = true if any of the fastBotDetectionDetails is true
        this.fingerprint.fastBotDetection = Object.values(this.fingerprint.fastBotDetectionDetails).some(Boolean);

        // Generate fsid after all signals and detections are collected
        this.fingerprint.fsid = this.generateFingerprintScannerId();

        const encryptedFingerprint = await this.encryptFingerprint(JSON.stringify(this.fingerprint));

        return encryptedFingerprint;
    }
}

export default FingerprintScanner;
export * from './types';