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

  // Signal validations
  test('memory should be a number greater than 0', () => {
    const memory = fingerprint.signals.memory;
    expect(typeof memory).toBe('number');
    expect(memory).toBeGreaterThan(0);
  });

  test('cpuCount should be a number greater than 0', () => {
    const cpuCount = fingerprint.signals.cpuCount;
    expect(typeof cpuCount).toBe('number');
    expect(cpuCount).toBeGreaterThan(0);
  });

  test('userAgent should be a non-empty string', () => {
    expect(fingerprint.signals).toHaveProperty('userAgent');
    expect(typeof fingerprint.signals.userAgent).toBe('string');
    expect(fingerprint.signals.userAgent.length).toBeGreaterThan(0);
    expect(fingerprint.signals.userAgent).toContain('HeadlessChrome');
  });

  test('platform should be a non-empty string', () => {
    expect(fingerprint.signals).toHaveProperty('platform');
    expect(typeof fingerprint.signals.platform).toBe('string');
    expect(fingerprint.signals.platform.length).toBeGreaterThan(0);
  });

  test('webdriver should be a boolean', () => {
    expect(typeof fingerprint.signals.webdriver).toBe('boolean');
  });

  test('screenResolution should have valid dimensions', () => {
    const screen = fingerprint.signals.screenResolution;
    expect(screen).toHaveProperty('width');
    expect(screen).toHaveProperty('height');
    expect(typeof screen.width).toBe('number');
    expect(typeof screen.height).toBe('number');
    expect(screen.width).toBeGreaterThan(0);
    expect(screen.height).toBeGreaterThan(0);
  });

  test('languages should have language property', () => {
    expect(fingerprint.signals.languages).toHaveProperty('language');
    expect(typeof fingerprint.signals.languages.language).toBe('string');
  });

  test('webGL should have vendor and renderer', () => {
    expect(fingerprint.signals.webGL.vendor).toContain('Google');
    expect(fingerprint.signals.webGL.renderer).toContain('SwiftShader');
  });
});
