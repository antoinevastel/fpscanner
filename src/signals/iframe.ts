import { ERROR, INIT, NA } from './utils';

export function iframe() {
    const iframeData = {
        webdriver: INIT,
        userAgent: INIT,
        platform: INIT,
        memory: INIT,
        cpuCount: INIT,
        language: INIT,
    };
    const iframe = document.createElement('iframe');

    try {
        iframe.style.display = 'none';
        iframe.src = 'about:blank';
        document.body.appendChild(iframe);

        const iframeWindowNavigator = (iframe.contentWindow?.navigator as any);

        iframeData.webdriver = iframeWindowNavigator.webdriver ?? false;
        iframeData.userAgent = iframeWindowNavigator.userAgent ?? NA;
        iframeData.platform = iframeWindowNavigator.platform ?? NA;
        iframeData.memory = iframeWindowNavigator.deviceMemory ?? NA;
        iframeData.cpuCount = iframeWindowNavigator.hardwareConcurrency ?? NA;
        iframeData.language = iframeWindowNavigator.language ?? NA;
    } catch (e) {
        console.error('Error collecting iframe signals', e);
        iframeData.webdriver = ERROR;
        iframeData.userAgent = ERROR;
        iframeData.platform = ERROR;
        iframeData.memory = ERROR;
        iframeData.cpuCount = ERROR;
        iframeData.language = ERROR;
    } finally {
        document.body.removeChild(iframe);
    }

    return iframeData;
}