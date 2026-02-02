import { test, expect, Page } from '@playwright/test';
import { decryptFingerprint } from './decrypt.js';

let fingerprint: any;

test.describe('FPScanner Obfuscated Build', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    
    // Navigate to the test page
    await page.goto('http://localhost:3333/test/test-page.html');
    
    // Wait for the fingerprint to be collected
    await page.waitForFunction(() => (window as any).__FINGERPRINT_READY__ === true, {
      timeout: 10000,
    });
    
    // Check if there was an error
    const error = await page.evaluate(() => (window as any).__FINGERPRINT_ERROR__);
    if (error) {
      throw new Error(`Fingerprint collection failed: ${error}`);
    }
    
    // Get the encrypted fingerprint from the browser
    const encryptedFingerprint = await page.evaluate(() => (window as any).__ENCRYPTED_FINGERPRINT__);
    
    if (!encryptedFingerprint) {
      throw new Error('Encrypted fingerprint is empty');
    }
    
    // Decrypt the fingerprint (server-side simulation)
    fingerprint = decryptFingerprint(encryptedFingerprint);
    
    await page.close();
  });

  // Structure validations
  test('fingerprint should have signals property', () => {
    expect(fingerprint).toHaveProperty('signals');
  });

  test('fingerprint should have fsid property', () => {
    expect(fingerprint).toHaveProperty('fsid');
  });

  test('fingerprint should have nonce property', () => {
    expect(fingerprint).toHaveProperty('nonce');
  });

  test('fingerprint should have time property', () => {
    expect(fingerprint).toHaveProperty('time');
  });

  // FSID format validation
  test('fsid should be a non-empty string starting with FS1_', () => {
    expect(typeof fingerprint.fsid).toBe('string');
    expect(fingerprint.fsid.length).toBeGreaterThan(0);
    expect(fingerprint.fsid).toMatch(/^FS1_/);
  });

  // Signal validations - using nested structure
  test('device.memory should be a number greater than 0', () => {
    const memory = fingerprint.signals.device.memory;
    expect(typeof memory).toBe('number');
    expect(memory).toBeGreaterThan(0);
  });

  test('device.cpuCount should be a number greater than 0', () => {
    const cpuCount = fingerprint.signals.device.cpuCount;
    expect(typeof cpuCount).toBe('number');
    expect(cpuCount).toBeGreaterThan(0);
  });

  test('browser.userAgent should be a non-empty string', () => {
    expect(fingerprint.signals.browser).toHaveProperty('userAgent');
    expect(typeof fingerprint.signals.browser.userAgent).toBe('string');
    expect(fingerprint.signals.browser.userAgent.length).toBeGreaterThan(0);
  });

  test('device.platform should be a non-empty string', () => {
    expect(fingerprint.signals.device).toHaveProperty('platform');
    expect(typeof fingerprint.signals.device.platform).toBe('string');
    expect(fingerprint.signals.device.platform.length).toBeGreaterThan(0);
  });

  test('automation.webdriver should be a boolean', () => {
    expect(typeof fingerprint.signals.automation.webdriver).toBe('boolean');
  });

  test('device.screenResolution should have valid dimensions', () => {
    const screen = fingerprint.signals.device.screenResolution;
    expect(screen).toHaveProperty('width');
    expect(screen).toHaveProperty('height');
    expect(typeof screen.width).toBe('number');
    expect(typeof screen.height).toBe('number');
    expect(screen.width).toBeGreaterThan(0);
    expect(screen.height).toBeGreaterThan(0);
  });

  test('locale.languages should have language property', () => {
    expect(fingerprint.signals.locale.languages).toHaveProperty('language');
    expect(typeof fingerprint.signals.locale.languages.language).toBe('string');
  });

  test('graphics.webGL should have vendor and renderer', () => {
    const webGL = fingerprint.signals.graphics.webGL;
    expect(typeof webGL.vendor).toBe('string');
    expect(typeof webGL.renderer).toBe('string');
    expect(webGL.vendor.length).toBeGreaterThan(0);
    expect(webGL.renderer.length).toBeGreaterThan(0);
  });

  // Additional nested structure tests
  test('automation signals should exist', () => {
    expect(fingerprint.signals).toHaveProperty('automation');
    expect(typeof fingerprint.signals.automation.cdp).toBe('boolean');
    expect(typeof fingerprint.signals.automation.selenium).toBe('boolean');
    expect(typeof fingerprint.signals.automation.playwright).toBe('boolean');
  });

  test('codecs signals should exist', () => {
    expect(fingerprint.signals).toHaveProperty('codecs');
    expect(typeof fingerprint.signals.codecs.hasMediaSource).toBe('boolean');
  });

  test('contexts signals should exist', () => {
    expect(fingerprint.signals).toHaveProperty('contexts');
    expect(fingerprint.signals.contexts).toHaveProperty('iframe');
    expect(fingerprint.signals.contexts).toHaveProperty('webWorker');
  });
});
