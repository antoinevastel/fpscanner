import { ERROR, INIT, NA, setObjectValues } from './utils';

export async function worker() {
    return new Promise((resolve) => {
        const workerData = {
            vendor: INIT,
            renderer: INIT,
            userAgent: INIT,
            language: INIT,
            platform: INIT,
            memory: INIT,
            cpuCount: INIT,
        };

        let worker: Worker | null = null;
        let workerUrl: string | null = null;
        let timeoutId: number | null = null;

        const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (worker) worker.terminate();
            if (workerUrl) URL.revokeObjectURL(workerUrl);
        };

        try {
            const workerCode = `var fingerprintWorker = {
                userAgent: 'NA',
                language: 'NA',
                cpuCount: 'NA',
                platform: 'NA',
                memory: 'NA',
                vendor: 'NA',
                renderer: 'NA'
            };
            try {
                fingerprintWorker.userAgent = navigator.userAgent;
                fingerprintWorker.language = navigator.language;
                fingerprintWorker.cpuCount = navigator.hardwareConcurrency;
                fingerprintWorker.platform = navigator.platform;
                if (typeof navigator.deviceMemory !== 'undefined') {
                    fingerprintWorker.memory = navigator.deviceMemory;
                }

                try {
                    if (typeof OffscreenCanvas === 'undefined') {
                        fingerprintWorker.vendor = 'NA';
                        fingerprintWorker.renderer = 'NA';
                    } else {
                        var canvas = new OffscreenCanvas(1, 1);
                        var gl = canvas.getContext('webgl');
                        var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
                        if (gl && !isFirefox) {
                            var glExt = gl.getExtension('WEBGL_debug_renderer_info');
                            if (glExt) {
                                fingerprintWorker.vendor = gl.getParameter(glExt.UNMASKED_VENDOR_WEBGL);
                                fingerprintWorker.renderer = gl.getParameter(glExt.UNMASKED_RENDERER_WEBGL);
                            } else {
                                fingerprintWorker.vendor = 'NA';
                                fingerprintWorker.renderer = 'NA';
                            }
                        } else {
                            fingerprintWorker.vendor = 'NA';
                            fingerprintWorker.renderer = 'NA';
                        }
                    }
                } catch (_) {
                    fingerprintWorker.vendor = 'ERROR';
                    fingerprintWorker.renderer = 'ERROR';
                }
                self.postMessage(fingerprintWorker);
            } catch (e) {
                self.postMessage(fingerprintWorker);
            }`

            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            workerUrl = URL.createObjectURL(blob);
            worker = new Worker(workerUrl);

            // Set timeout to prevent infinite hang
            timeoutId = window.setTimeout(() => {
                cleanup();
                setObjectValues(workerData, ERROR);
                resolve(workerData);
            }, 2000);

            worker.onmessage = function (e) {
                try {
                    const pick = (v: any) => (typeof v === 'undefined' ? NA : v);
                    workerData.vendor = pick(e.data.vendor);
                    workerData.renderer = pick(e.data.renderer);
                    workerData.userAgent = pick(e.data.userAgent);
                    workerData.language = pick(e.data.language);
                    workerData.platform = pick(e.data.platform);
                    workerData.memory = pick(e.data.memory);
                    workerData.cpuCount = pick(e.data.cpuCount);
                } catch (_) {
                    setObjectValues(workerData, ERROR);
                } finally {
                    cleanup();
                    resolve(workerData);
                }
            };

            worker.onerror = function () {
                cleanup();
                setObjectValues(workerData, ERROR);
                resolve(workerData);
            };
        } catch (e) {
            cleanup();
            setObjectValues(workerData, ERROR);
            resolve(workerData);
        }

    });

}