const {expect} = require('chai');
const puppeteer = require('puppeteer');
const path = require('path');

const CHROME_HEADLESS = 'Chrome Headless';

describe('Fingerprinting on Chrome Headless', function () {
    let browser;
    let page;

    before(async function () {
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    beforeEach(async function () {
        page = await browser.newPage();
        await page.goto('file://'+path.resolve(__dirname, 'test.html'), {
            waitUntil: 'load'
        });
    });

    afterEach(async function () {
        await page.close();
    });

    after(async function () {
        await browser.close();
    });

    it('Plugins should not be null', async () => {

        const plugins = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.plugins;
        });

        expect(plugins).to.not.be.null;
    });

    it('Browser should be Chrome Headless', async () => {

        const browserName = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.name;
        });
        expect(browserName).to.equal(CHROME_HEADLESS);
    });

    it('Platform should not be null', async () => {
        const platform = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.platform;
        });

        expect(platform).to.not.be.null;
    });

    it('Canvas should not be an image', async () => {
        const canvas = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.canvas;
        });

        const isImageB64 = canvas.indexOf('data:image/png;base64') > -1;
        expect(isImageB64).to.be.true;
    });

    it('Fonts should not be null', async () => {
        const fonts = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.fonts;
        });

        let areFontsValids = fonts !== undefined && fonts.length > 0;
        if (areFontsValids) {
            areFontsValids = fonts.filter((font) => {
                return /\w+--(false|true)/.test(font);
            }).length > 0;
        }

        expect(areFontsValids).to.be.true;
    });

    it('ETSL should be 33', async () => {

        const etsl = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.scanner.etsl;
        });
        expect(etsl).to.equal(33);
    });


});