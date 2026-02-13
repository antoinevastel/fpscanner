#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publishType = process.argv[2]; // 'beta' or 'stable'

if (!publishType || !['beta', 'stable'].includes(publishType)) {
    console.error('❌ Usage: npm run publish:beta or npm run publish:stable');
    process.exit(1);
}

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function run(command, description) {
    console.log(`\n🔄 ${description}...`);
    try {
        execSync(command, { cwd: ROOT_DIR, stdio: 'inherit' });
        console.log(`✅ ${description} - Done`);
    } catch (error) {
        console.error(`❌ ${description} - Failed`);
        process.exit(1);
    }
}

function checkGitStatus() {
    console.log('\n🔍 Checking git status...');
    try {
        const status = execSync('git status --porcelain', { cwd: ROOT_DIR, encoding: 'utf8' });
        if (status.trim()) {
            console.error('❌ Git working directory is not clean. Please commit or stash changes first.');
            console.error('\nUncommitted changes:');
            console.error(status);
            process.exit(1);
        }
        console.log('✅ Git working directory is clean');
    } catch (error) {
        console.error('❌ Failed to check git status');
        process.exit(1);
    }
}

function getPackageVersion() {
    const packageJson = require(path.join(ROOT_DIR, 'package.json'));
    return packageJson.version;
}

console.log('═══════════════════════════════════════════════════════════');
console.log(`🚀 Safe Publish Script - ${publishType.toUpperCase()}`);
console.log('═══════════════════════════════════════════════════════════');

// Step 0: Check git status
checkGitStatus();

// Step 1: Clean dist directory
console.log('\n🧹 Cleaning dist directory...');
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    console.log('✅ Dist directory cleaned');
} else {
    console.log('✅ Dist directory already clean');
}

// Step 2: Build package with sentinel key (no key injection)
run('npm run build', 'Building package with sentinel key');

// Step 3: Verify build
run('node scripts/verify-publish.js', 'Verifying build integrity');

// Step 4: Get version and confirm
const version = getPackageVersion();
console.log(`\n📦 Package version: ${version}`);

if (publishType === 'beta' && !version.includes('beta')) {
    console.error(`❌ Version ${version} is not a beta version. Use publish:stable instead.`);
    process.exit(1);
}

if (publishType === 'stable' && version.includes('beta')) {
    console.error(`❌ Version ${version} is a beta version. Use publish:beta instead.`);
    process.exit(1);
}

// Step 5: Publish
const publishTag = publishType === 'beta' ? '--tag beta' : '';
run(`npm publish ${publishTag}`, `Publishing to npm with ${publishType} tag`);

// Step 6: Create git tag
const gitTag = `v${version}`;
console.log(`\n🏷️  Creating git tag: ${gitTag}...`);
try {
    execSync(`git tag ${gitTag}`, { cwd: ROOT_DIR, stdio: 'inherit' });
    console.log(`✅ Git tag created: ${gitTag}`);
    
    console.log('\n💡 Don\'t forget to push the tag:');
    console.log(`   git push origin ${gitTag}`);
} catch (error) {
    console.log(`⚠️  Git tag might already exist: ${gitTag}`);
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ PUBLISH SUCCESSFUL!');
console.log('═══════════════════════════════════════════════════════════');
console.log(`\n📦 Published: fpscanner@${version}`);
console.log(`🏷️  Tag: ${publishType}`);
console.log('\n📝 Next steps:');
console.log(`   1. Push git tag: git push origin ${gitTag}`);
console.log(`   2. Test installation: npm install fpscanner@${publishType}`);
console.log('═══════════════════════════════════════════════════════════\n');
