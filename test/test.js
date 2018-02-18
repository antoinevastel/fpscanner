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
    await page.goto('file://' + path.resolve(__dirname, 'test.html'), {
      waitUntil: 'load'
    });
  });

  afterEach(async function () {
    await page.close();
  });

  after(async function () {
    await browser.close();
  });

  it('mediaQueries should be an array', async () => {
    const mediaQueries = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.mediaQueries;
    });
    const expectedResult = [ false, false, false, false, false, false ];
    expect(mediaQueries).to.deep.equal(expectedResult);
  });

  it('accelerometerUsed should be false', async () => {
    const accelerometerUsed = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.accelerometerUsed;
    });
    expect(accelerometerUsed).to.be.false;
  });

  it('emoji should be an image', async () => {
    const emoji = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.emoji;
    });
    const isImageB64 = emoji.indexOf('data:image/png;base64') > -1;
    expect(isImageB64).to.be.true;
  });

  it('resOverflow should be false', async () => {
    const resOverflow = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.resOverflow;
    });
    const expectedResult = ['RangeError', 'Maximum call stack size exceeded']
    expect(resOverflow.slice(1, 3)).to.deep.equal(expectedResult);
  });

  it('errorsGenerated should be an array', async () => {
    const errorsGenerated = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.errorsGenerated;
    });
    const expectedResult = [ 'azeaze is not defined',
      null,
      null,
      null,
      null,
      null,
      null,
      'SyntaxError: Failed to construct \'WebSocket\': The URL \'itsgonnafail\' is invalid.' ];

    expect(errorsGenerated).to.deep.equal(expectedResult);
  });

  it('domAutomation should be false', async () => {
    const domAutomation = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.domAutomation;
    });
    expect(domAutomation).to.be.false;
  });

  it('seleniumIDE should be false', async () => {
    const seleniumIDE = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.seleniumIDE;
    });
    expect(seleniumIDE).to.be.false;
  });

  it('webDriver should be true', async () => {
    const webDriver = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.webDriver;
    });
    expect(webDriver).to.be.true;
  });

  it('fmget should be false', async () => {
    const fmget = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.fmget;
    });
    expect(fmget).to.be.false;
  });

  it('nightmareJS should be false', async () => {
    const nightmareJS = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.nightmareJS;
    });
    expect(nightmareJS).to.be.false;
  });

  it('ghostJS should be false', async () => {
    const ghostJS = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.ghostJS;
    });
    expect(ghostJS).to.be.false;
  });

  it('awesomium should be false', async () => {
    const awesomium = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.awesomium;
    });
    expect(awesomium).to.be.false;
  });

  it('canvasDesc should be \'function toDataURL() { [native code] }\'', async () => {
    const canvasDesc = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.canvasDesc;
    });
    expect(canvasDesc).to.equal('function toDataURL() { [native code] }');
  });

  it('bindDesc should be \'function bind() { [native code] }\'', async () => {
    const bindDesc = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.bindDesc;
    });
    expect(bindDesc).to.equal('function bind() { [native code] }');
  });

  it('historyDesc should be \'function History() { [native code] }\'', async () => {
    const historyDesc = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.historyDesc;
    });
    expect(historyDesc).to.equal('function History() { [native code] }');
  });

  it('screenDesc should be \'function () { [native code] }\'', async () => {
    const screenDesc = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.screenDesc;
    });
    expect(screenDesc).to.equal('function () { [native code] }');
  });

  it('timezoneOffsetDesc should be \'function getTimezoneOffset() { [native code] }\'', async () => {
    const timezoneOffsetDesc = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.timezoneOffsetDesc;
    });
    expect(timezoneOffsetDesc).to.equal('function getTimezoneOffset() { [native code] }');
  });

  it('buffer should be false', async () => {
    const buffer = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.buffer;
    });
    expect(buffer).to.be.false;
  });

  it('emit should be false', async () => {
    const emit = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.emit;
    });
    expect(emit).to.be.false;
  });

  it('spawn should be false', async () => {
    const spawn = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.spawn;
    });
    expect(spawn).to.be.false;
  });

  it('sendBeacon should be true', async () => {
    const sendBeacon = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.sendBeacon;
    });
    expect(sendBeacon).to.be.true;
  });

  it('showModal should be false', async () => {
    const showModal = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.showModal;
    });
    expect(showModal).to.be.false;
  });

  it('ETSL should be 33', async () => {
    const etsl = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.etsl;
    });
    expect(etsl).to.equal(33);
  });

  it('Navigator prototype should be an object', async () => {
    const navigatorPrototype = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.navigatorPrototype;
    });
    expect(typeof navigatorPrototype).to.equal('object');
  });

  it('productSub should be equal to 20030107', async () => {
    const productSub = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.scanner.productSub;
    });

    expect(productSub).to.equal('20030107');
  });

  it('TimezoneLocale should not be null', async () => {
    const timezoneLocale = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.geolocation.timezoneLocale;
    });
    expect(timezoneLocale).to.not.be.null;
  });

  it('Timezone should be a number', async () => {
    const timezone = await page.evaluate(async () => {
      const fingerprint = await fpScanner.collect.generateFingerprint();
      return fingerprint.geolocation.timezone;
    });
    expect(typeof timezone).to.equal('number');
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

    if ('TRAVIS' in process.env && 'CI' in process.env) {
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

  it('Canvas should be an image', async () => {
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

});
