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
  
  console.log('');
  console.log('🔨 Building fpscanner with custom key...');
  console.log(`   Package: ${packageDir}`);
  console.log(`   Output:  ${distDir}`);
  console.log(`   Obfuscation: ${skipObfuscation ? 'disabled' : 'enabled'}`);
  console.log('');
  
  // Step 1: Run Vite build with the key
  console.log('📦 Step 1/5: Running Vite build...');
  try {
    execSync('npm run build:vite', {
      cwd: packageDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        FP_ENCRYPTION_KEY: key,
      },
    });
  } catch (err) {
    throw new Error('Vite build failed');
  }
  
  // Step 2: Generate TypeScript declarations
  console.log('');
  console.log('📝 Step 2/5: Generating TypeScript declarations...');
  try {
    execSync('npx tsc --emitDeclarationOnly', {
      cwd: packageDir,
      stdio: 'inherit',
    });
  } catch (err) {
    // Non-fatal, declarations might already exist
    console.log('   (skipped or already generated)');
  }
  
  // Step 3: Obfuscate (optional)
  if (!skipObfuscation) {
    console.log('');
    console.log('🔒 Step 3/5: Obfuscating output...');
    
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
      console.log('📦 Step 4/5: Minifying with Terser...');
      
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
      console.log('🗑️  Step 5/5: Removing source maps...');
      
      function deleteMapFiles(dir, prefix = '') {
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
    console.log('⏭️  Steps 3-5/5: Skipping obfuscation, minification, and source map removal (--no-obfuscate)');
  }
  
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
