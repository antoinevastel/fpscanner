#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

/**
 * Load environment variables from a file
 * Supports .env format: KEY=value
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  for (const line of content.split('\n')) {
    // Skip comments and empty lines
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
  
  return env;
}

/**
 * Resolve the encryption key from multiple sources
 * Priority: --key flag > environment variable > .env file
 */
function resolveKey(args, cwd) {
  // 1. Check for explicit --key=xxx argument (highest priority)
  const keyArg = args.find(a => a.startsWith('--key='));
  if (keyArg) {
    const key = keyArg.split('=').slice(1).join('='); // Handle keys with = in them
    console.log('🔑 Using key from --key argument');
    return key;
  }
  
  // 2. Check for environment variable (already loaded, e.g., from CI)
  if (process.env.FINGERPRINT_KEY) {
    console.log('🔑 Using FINGERPRINT_KEY from environment');
    return process.env.FINGERPRINT_KEY;
  }
  
  // 3. Try to load from .env file (or custom file via --env-file)
  const envFileArg = args.find(a => a.startsWith('--env-file='));
  const envFileName = envFileArg ? envFileArg.split('=')[1] : '.env';
  const envFilePath = path.isAbsolute(envFileName) 
    ? envFileName 
    : path.join(cwd, envFileName);
  
  const envFromFile = loadEnvFile(envFilePath);
  
  if (envFromFile.FINGERPRINT_KEY) {
    console.log(`🔑 Using FINGERPRINT_KEY from ${path.basename(envFilePath)}`);
    return envFromFile.FINGERPRINT_KEY;
  }
  
  // 4. No key found
  return null;
}

function printHelp() {
  console.log(`
📦 fpscanner CLI

Commands:
  build     Build fpscanner with your custom encryption key

Usage:
  npx fpscanner build [options]

Options:
  --key=KEY           Use KEY as the encryption key (highest priority)
  --env-file=FILE     Load FINGERPRINT_KEY from FILE (default: .env)
  --no-obfuscate      Skip obfuscation step (faster builds for development)

Key Resolution (in order of priority):
  1. --key=xxx argument
  2. FINGERPRINT_KEY environment variable
  3. FINGERPRINT_KEY in .env file (or custom file via --env-file)

Examples:
  # Using command line argument
  npx fpscanner build --key=my-secret-key

  # Using environment variable
  export FINGERPRINT_KEY=my-secret-key
  npx fpscanner build

  # Using .env file
  echo "FINGERPRINT_KEY=my-secret-key" >> .env
  npx fpscanner build

  # Using custom env file
  npx fpscanner build --env-file=.env.production

  # Development build (no obfuscation)
  npx fpscanner build --key=dev-key --no-obfuscate

Setup (add to your package.json):
  {
    "scripts": {
      "postinstall": "fpscanner build"
    }
  }
`);
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'build') {
  const cwd = process.cwd();
  const key = resolveKey(args, cwd);
  
  if (!key) {
    console.error(`
❌ No encryption key found!

Provide a key using one of these methods:

  1. Command line argument:
     npx fpscanner build --key=your-secret-key

  2. Environment variable:
     export FINGERPRINT_KEY=your-secret-key
     npx fpscanner build

  3. .env file in your project root:
     echo "FINGERPRINT_KEY=your-secret-key" >> .env
     npx fpscanner build

  4. Custom env file:
     npx fpscanner build --env-file=.env.production

Run 'npx fpscanner --help' for more information.
`);
    process.exit(1);
  }
  
  // Check for --no-obfuscate flag
  const skipObfuscation = args.includes('--no-obfuscate');
  
  // Run the build script
  const packageDir = path.dirname(__dirname);
  const buildScript = path.join(packageDir, 'scripts', 'build-custom.js');
  
  // Pass arguments to build script
  const buildArgs = [
    `--key=${key}`,
    `--package-dir=${packageDir}`,
  ];
  if (skipObfuscation) {
    buildArgs.push('--no-obfuscate');
  }
  
  require(buildScript)(buildArgs)
    .then(() => {
      // Build completed successfully
    })
    .catch((err) => {
      console.error('❌ Build failed:', err.message);
      process.exit(1);
    });
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Run "npx fpscanner --help" for usage information.');
  process.exit(1);
}
