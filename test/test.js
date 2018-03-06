const {expect} = require('chai');
const puppeteer = require('puppeteer');
const path = require('path');
const scanner = require('../src/fpScanner');


describe('Bot scanner', async function () {
  let browser;
  let page;
  let scannerResult;

  before(async function () {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto('file://' + path.resolve(__dirname, 'test.html'), {
      waitUntil: 'load'
    });
    const fingerprint = await page.evaluate(async () => {
      return await fpCollect.generateFingerprint();
    });
    scannerResult = scanner.analyseFingerprint(fingerprint);
  });

  after(async function () {
    await browser.close();
  });

  it('PHANTOM_UA should be consistent', async () => {
    expect(scannerResult[scanner.TESTS.PHANTOM_UA].consistent).to.equal(scanner.CONSISTENT);
  });

  it('PHANTOM_PROPERTIES should be consistent', async () => {
    expect(scannerResult[scanner.TESTS.PHANTOM_PROPERTIES].consistent).to.equal(scanner.CONSISTENT);
  });

  it('PHANTOM_ETSL should be consistent', async () => {
    expect(scannerResult[scanner.TESTS.PHANTOM_ETSL].consistent).to.equal(scanner.CONSISTENT);
  });

  it('PHANTOM_LANGUAGE should be consistent', async () => {
    expect(scannerResult[scanner.TESTS.PHANTOM_LANGUAGE].consistent).to.equal(scanner.CONSISTENT);
  });

  it('PHANTOM_WEBSOCKET should be consistent', async () => {
    expect(scannerResult[scanner.TESTS.PHANTOM_WEBSOCKET].consistent).to.equal(scanner.CONSISTENT);
  });

  it('MQ_SCREEN should not be consistent', async () => {
    expect(scannerResult[scanner.TESTS.MQ_SCREEN].consistent).to.equal(scanner.INCONSISTENT);
  });

  it('PHANTOM_OVERFLOW should not be consistent', async () => {
    expect(scannerResult[scanner.TESTS.PHANTOM_OVERFLOW].consistent).to.equal(scanner.CONSISTENT);
  });

  it('PHANTOM_WINDOW_HEIGHT should not be consistent', async () => {
    expect(scannerResult[scanner.TESTS.PHANTOM_WINDOW_HEIGHT].consistent).to.equal(scanner.CONSISTENT);
  });

  it('HEADCHR_UA should not be consistent', async () => {
    expect(scannerResult[scanner.TESTS.HEADCHR_UA].consistent).to.equal(scanner.INCONSISTENT);
  });

  it('WEBDRIVER should not be consistent', async () => {
    expect(scannerResult[scanner.TESTS.WEBDRIVER].consistent).to.equal(scanner.INCONSISTENT);
  });

  it('HEADCHR_CHROME_OBJ should not be consistent', async () => {
    expect(scannerResult[scanner.TESTS.HEADCHR_CHROME_OBJ].consistent).to.equal(scanner.INCONSISTENT);
  });

  it('HEADCHR_PERMISSIONS should not be consistent', async () => {
    expect(scannerResult[scanner.TESTS.HEADCHR_PERMISSIONS].consistent).to.equal(scanner.INCONSISTENT);
  });

  it('HEADCHR_PLUGINS should  be unsure', async () => {
    expect(scannerResult[scanner.TESTS.HEADCHR_PLUGINS].consistent).to.equal(scanner.UNSURE);
  });

  it('HEADCHR_IFRAME should be inconsistent', async () => {
    expect(scannerResult[scanner.TESTS.HEADCHR_IFRAME].consistent).to.equal(scanner.INCONSISTENT);
  });

  it('CHR_DEBUG_TOOLS should be unsure', async () => {
    expect(scannerResult[scanner.TESTS.CHR_DEBUG_TOOLS].consistent).to.equal(scanner.UNSURE);
  });

  it('SELENIUM_DRIVER should be consistent', async () => {
    expect(scannerResult[scanner.TESTS.SELENIUM_DRIVER].consistent).to.equal(scanner.CONSISTENT);
  });

});