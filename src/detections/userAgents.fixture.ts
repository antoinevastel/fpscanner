export const USER_AGENTS = {
    windowsChrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    windowsEdge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    windowsFirefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    macChrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    macSafari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    linuxChrome: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    androidChrome: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    androidFirefox: "Mozilla/5.0 (Android 13; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0",
    iphoneSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    iphoneChrome: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1",
    iphoneOpera: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPT/4.4.0",
    unknown: "Mozilla/5.0 (Unknown)",
};

export interface FingerprintOverrides {
    userAgent?: unknown;
    etsl?: unknown;
    chrome?: boolean;
    platform?: unknown;
    iframeUserAgent?: unknown;
    iframePlatform?: unknown;
    workerUserAgent?: unknown;
    workerPlatform?: unknown;
}

/**
 * Minimal fingerprint carrying only the signals the user-agent based rules read. Each call
 * returns a fresh object, which matters because `describeEnvironment` caches per fingerprint.
 */
export function buildFingerprint({
    userAgent = USER_AGENTS.windowsChrome,
    etsl = 33,
    chrome = true,
    platform = "Win32",
    iframeUserAgent = userAgent,
    iframePlatform = platform,
    workerUserAgent = userAgent,
    workerPlatform = platform,
}: FingerprintOverrides = {}) {
    return {
        signals: {
            browser: { userAgent, etsl, features: { chrome } },
            device: { platform },
            contexts: {
                iframe: { userAgent: iframeUserAgent, platform: iframePlatform },
                webWorker: { userAgent: workerUserAgent, platform: workerPlatform },
            },
        },
    } as any;
}
