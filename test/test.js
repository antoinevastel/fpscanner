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

    it('multimediaDevices should not be null', async () => {
        const multimediaDevices = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return {
                speakers: fingerprint.os.speakers,
                micros: fingerprint.os.micros,
                webcams: fingerprint.os.webcams
            }
        });

        if('TRAVIS' in process.env && 'CI' in process.env) {
            expect(multimediaDevices).to.deep.equal({
                speakers: 0,
                micros: 0,
                webcams: 0
            });
        } else {
            expect(typeof multimediaDevices).to.equal('object');
        }

    });

    it('videoCard should be [ \'Google Inc.\', \'Google SwiftShader\' ]', async () => {
        const videoCard = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.videoCard;
        });
        expect(videoCard).to.deep.equal(['Google Inc.', 'Google SwiftShader']);
    });

    it('touchScreen should be [0, false, false]', async () => {
        const touchScreen = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.touchScreen;
        });
        expect(touchScreen).to.deep.equal([0, false, false]);
    });

    it('oscpu should be unknown', async () => {
        const oscpu = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.oscpu;
        });
        expect(oscpu).to.equal('unknown');
    });

    it('screen should have 9 properties', async () => {
        const screen = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.screen;
        });
        const isScreenValid = screen !== undefined && Object.keys(screen).length === 9;
        expect(isScreenValid).to.be.true;
    });

    it('hardware Concurrency should be a number', async () => {
        const hardwareConcurrency = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.hardwareConcurrency;
        });
        expect(typeof hardwareConcurrency).to.equal('number');
    });

    it('Processors should not be null', async () => {
        const processors = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.processors;
        });
        expect(processors).to.not.be.null;
    });

    it('Languages should be en-US', async () => {
        const languages = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.languages;
        });

        const areLanguagesValid = typeof languages === 'object' &&
            languages.length === 1 &&
            languages[0] == 'en-US';

        expect(areLanguagesValid).to.be.true;
    });

    it('Platform should not be null', async () => {
        const platform = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.platform;
        });
        expect(platform).to.not.be.null;
    });

    it('OS should not be null', async () => {
        const os = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.os.name;
        });
        expect(os).to.not.be.null;
    });

    it('Local storage should be true', async () => {
        const localStorage = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.localStorage;
        });
        expect(localStorage).to.equal('yes');
    });

    it('Maths should have 9 elements', async () => {
        const maths = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.maths;
        });
        expect(maths.length).to.equal(9);
    });

    it('Cookies should be true', async () => {
        const cookies = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.cookies;
        });
        expect(cookies).to.equal('yes');
    });

    it('Adblock should be false', async () => {
        const adblock = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.adBlock;
        });
        expect(adblock).to.be.false;
    });

    it('DNT should not be null', async () => {
        const dnt = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.dnt;
        });
        expect(dnt).to.not.be.null;
    });

    it('WebGL should not be null', async () => {
        const webGL = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.webGL;
        });
        expect(webGL).to.not.be.null;
    });

    it('MimeTypes should not be null', async () => {
        const mimeTypes = await page.evaluate(async () => {
            const fingerprint = await fpScanner.collect.generateFingerprint();
            return fingerprint.browser.mimeTypes;
        });
        expect(mimeTypes).to.not.be.null;
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