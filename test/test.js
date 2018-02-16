const {expect} = require('chai');
const puppeteer = require('puppeteer');
const path = require('path');

const CHROME_HEADLESS = 'Chrome Headless';

describe('First tests with puppeteer:', function () {
    // Define global variables
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

    it('ETSL should be 33', async () => {

        const etsl = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.scanner.etsl;
        });
        expect(etsl).to.equal(33);
    });


});