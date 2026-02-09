#!/usr/bin/env node

/**
 * Pre-publish verification script
 * Ensures the dist files contain the sentinel key for npm consumers
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const files = ['fpScanner.es.js', 'fpScanner.cjs.js'];
const sentinel = '__DEFAULT_FPSCANNER_KEY__';

console.log('🔍 Verifying dist files before publish...\n');

let allPassed = true;

for (const file of files) {
  const filePath = path.join(distDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file}: File not found`);
    allPassed = false;
    continue;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(new RegExp(`"${sentinel}"`, 'g'));
  
  if (!matches || matches.length === 0) {
    console.log(`❌ ${file}: Sentinel key "${sentinel}" NOT found`);
    console.log(`   This file cannot be published - consumers won't be able to inject their keys!`);
    allPassed = false;
  } else {
    console.log(`✅ ${file}: Sentinel key found (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`);
  }
}

console.log('');

if (allPassed) {
  console.log('✅ All checks passed! Safe to publish.');
  process.exit(0);
} else {
  console.log('❌ Verification failed!');
  console.log('');
  console.log('To fix:');
  console.log('  1. Make sure FP_ENCRYPTION_KEY is NOT set in your environment');
  console.log('  2. Run: rm -rf dist && npm run build');
  console.log('  3. Run this script again to verify');
  console.log('');
  process.exit(1);
}
