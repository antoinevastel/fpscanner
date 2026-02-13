#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Build fpscanner with a custom encryption key and optional obfuscation.
 * This script:
 * 1. Runs Vite build with the key injected via environment variable
 * 2. Generates TypeScript declarations
 * 3. Optionally obfuscates the output
 * 4. Minifies with Terser (when obfuscating)
 * 5. Removes source maps (when obfuscating)
 */
module.exports = async function build(args) {
  // Parse arguments
  const keyArg = args.find(a => a.startsWith('--key='));
  const packageDirArg = args.find(a => a.startsWith('--package-dir='));
  const skipObfuscation = args.includes('--no-obfuscate');
  
  if (!keyArg) {
    throw new Error('Missing --key argument');
  }
  
  const key = keyArg.split('=').slice(1).join('=');
  const packageDir = packageDirArg 
    ? packageDirArg.split('=')[1] 
    : path.dirname(__dirname);
  
  const distDir = path.join(packageDir, 'dist');
  const files = ['fpScanner.es.js', 'fpScanner.cjs.js'];
  const sentinel = '__DEFAULT_FPSCANNER_KEY__';
  
  console.log('');
  console.log('🔨 Building fpscanner with custom key...');
  console.log(`   Package: ${packageDir}`);
  console.log(`   Output:  ${distDir}`);
  console.log(`   Obfuscation: ${skipObfuscation ? 'disabled' : 'enabled'}`);
  console.log('');
  
  // Step 0: Backup/Restore mechanism to ensure idempotent builds
  // This allows running the build multiple times without re-obfuscating already obfuscated code
  console.log('🔄 Step 0/6: Ensuring clean build state...');
  let restoredFromBackup = false;
  
  for (const file of files) {
    const filePath = path.join(distDir, file);
    const backupPath = filePath + '.original';
    
    if (!fs.existsSync(filePath)) {
      continue;
    }
    
    if (fs.existsSync(backupPath)) {
      // Backup exists - restore from it to ensure clean state
      fs.copyFileSync(backupPath, filePath);
      restoredFromBackup = true;
    } else {
      // First run - create backup of pristine files
      fs.copyFileSync(filePath, backupPath);
      console.log(`   📦 Created backup: ${file}.original`);
    }
  }
  
  if (restoredFromBackup) {
    console.log('   ✓ Restored files from backups (clean state for build)');
  }
  console.log('');
  
  // Check if we can build from source (more reliable than string replacement)
  const viteConfigPath = path.join(packageDir, 'vite.config.ts');
  const canBuildFromSource = fs.existsSync(viteConfigPath);
  
  if (canBuildFromSource) {
    // Preferred method: Build from source with key injected via environment variable
    // This is more reliable as Vite's define properly replaces the key during the build
    console.log('📦 Step 1/6: Building from source with injected key...');
    console.log('   (This is more reliable than post-build string replacement)');
    try {
      execSync('npm run build:vite', {
        cwd: packageDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          FP_ENCRYPTION_KEY: key,
        },
      });
      console.log('');
      console.log('📝 Generating TypeScript declarations...');
      execSync('npx tsc --emitDeclarationOnly', {
        cwd: packageDir,
        stdio: 'inherit',
      });
      console.log('');
      console.log('   ✓ Key injected during build');
    } catch (err) {
      throw new Error('Build from source failed. Make sure vite is installed (npm install)');
    }
  } else {
    // Fallback method: String replacement in pre-built dist files
    // Used when vite.config.ts is not available (npm consumers without dev dependencies)
    console.log('📦 Step 1/6: Injecting encryption key via string replacement...');
    console.log('   (Fallback method - vite.config.ts not found)');
    
    let keyInjected = false;
    for (const file of files) {
      const filePath = path.join(distDir, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  ${file} not found, skipping`);
        continue;
      }
      
      let code = fs.readFileSync(filePath, 'utf8');
      
      // Check if sentinel exists
      if (!code.includes(sentinel)) {
        console.log(`   ⚠️  ${file} does not contain the default key sentinel`);
        console.log(`       Key may have already been replaced, or dist needs to be rebuilt`);
        continue;
      }
      
      // Replace all occurrences of the sentinel with the actual key
      const escapedSentinel = sentinel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const newCode = code.replace(new RegExp(`"${escapedSentinel}"`, 'g'), JSON.stringify(key));
      
      // Verify the replacement worked
      if (newCode === code) {
        console.log(`   ⚠️  ${file} - replacement had no effect`);
        continue;
      }
      
      if (newCode.includes(sentinel)) {
        console.log(`   ⚠️  ${file} - sentinel still present after replacement`);
        continue;
      }
      
      fs.writeFileSync(filePath, newCode);
      keyInjected = true;
      console.log(`   ✓ ${file}`);
    }
    
    if (!keyInjected) {
      console.log('   ⚠️  Warning: No files were updated');
      console.log('       The key may have already been injected, or dist files may need rebuilding');
    }
  }
  
  // Step 2: Skip TypeScript declarations (already generated)
  console.log('');
  console.log('⏭️  Step 2/6: TypeScript declarations already present, skipping...');
  
  // Step 3: Obfuscate (optional)
  if (!skipObfuscation) {
    console.log('');
    console.log('🔒 Step 3/6: Obfuscating output...');
    
    let JavaScriptObfuscator;
    try {
      JavaScriptObfuscator = require('javascript-obfuscator');
    } catch (err) {
      console.log('   ⚠️  javascript-obfuscator not installed, skipping obfuscation');
      console.log('   To enable obfuscation, run: npm install --save-dev javascript-obfuscator');
      skipObfuscation = true;
    }
    
    if (JavaScriptObfuscator) {
      const files = ['fpScanner.es.js', 'fpScanner.cjs.js'];
      
      for (const file of files) {
        const filePath = path.join(distDir, file);
        
        if (!fs.existsSync(filePath)) {
          console.log(`   ⚠️  ${file} not found, skipping`);
          continue;
        }
        
        const code = fs.readFileSync(filePath, 'utf8');
        
        const obfuscated = JavaScriptObfuscator.obfuscate(code, {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.4,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.1,
          stringArray: true,
          stringArrayThreshold: 0.95,
          stringArrayEncoding: ['rc4'],
          transformObjectKeys: true,
          unicodeEscapeSequence: false,
          // Preserve functionality
          selfDefending: false,
          disableConsoleOutput: false,
        });
        
        fs.writeFileSync(filePath, obfuscated.getObfuscatedCode());
        console.log(`   ✓ ${file}`);
      }
      
      // Step 4: Minify with Terser
      console.log('');
      console.log('📦 Step 4/6: Minifying with Terser...');
      
      let terser;
      try {
        terser = require('terser');
      } catch (err) {
        console.log('   ⚠️  terser not installed, skipping minification');
        console.log('   To enable minification, run: npm install --save-dev terser');
      }
      
      if (terser) {
        for (const file of files) {
          const filePath = path.join(distDir, file);
          
          if (!fs.existsSync(filePath)) {
            continue;
          }
          
          const code = fs.readFileSync(filePath, 'utf8');
          const minified = await terser.minify(code, {
            compress: {
              drop_console: false,
              dead_code: true,
              unused: true,
            },
            mangle: {
              toplevel: true,
            },
            format: {
              comments: false,
            },
          });
          
          if (minified.error) {
            console.log(`   ⚠️  Failed to minify ${file}: ${minified.error}`);
          } else {
            fs.writeFileSync(filePath, minified.code);
            console.log(`   ✓ ${file}`);
          }
        }
      }
      
      // Step 5: Delete all source map files so DevTools can't show original source
      console.log('');
      console.log('🗑️  Step 5/6: Removing source maps...');
      
      function deleteMapFiles(dir, prefix = '') {
        if (!fs.existsSync(dir)) {
          return;
        }
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            deleteMapFiles(fullPath, prefix + file + '/');
          } else if (file.endsWith('.map')) {
            fs.unlinkSync(fullPath);
            console.log(`   ✓ Deleted ${prefix}${file}`);
          }
        }
      }
      
      deleteMapFiles(distDir);
    }
  } else {
    console.log('');
    console.log('⏭️  Steps 3-5/6: Skipping obfuscation, minification, and source map removal (--no-obfuscate)');
  }
  
  // Step 6: Note about backups
  console.log('');
  console.log('💡 Note: Original files backed up as *.original for future rebuilds');
  
  console.log('');
  console.log('✅ Build complete!');
  console.log('');
  console.log('   Your custom fpscanner build is ready in:');
  console.log(`   ${distDir}`);
  console.log('');
  console.log('   Import it in your code:');
  console.log("   import FingerprintScanner from 'fpscanner';");
  console.log('');
};

// Allow running directly
if (require.main === module) {
  const args = process.argv.slice(2);
  module.exports(args)
    .catch((err) => {
      console.error('❌ Build failed:', err.message);
      process.exit(1);
    });
}
