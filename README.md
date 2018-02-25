# Fingerprint Scanner
[![Build Status](https://travis-ci.org/antoinevastel/fpscanner.svg?branch=master)](https://travis-ci.org/antoinevastel/fpscanner)

Library to detect bots and crawlers using fingerprinting.

## Attributes collected
Fingerprint Scanner relies on [Fp-Collect](https://github.com/antoinevastel/fp-collect) to collect a browser fingerprint.
Since the purpose of the library is bot detection, it doesn't detect collect 
unecessary fingerprint attributes used for tracking.

## Usage

### Installation

```
npm install fpscanner

```


### Detect bots

In order to use Fingerprint-Scanner your need to pass a fingerprint
collected using fp-collect.

```
const fingerprint = await fpCollect.generateFingerprint();

//or

fpCollect.generateFingerprint().then((fingerprint) => {
    // Do something with the fingerprint
});

```

Once you have a fingerprint, you can pass it to the scanner.

```
const scanner = require('fpScanner');
//fingerprint is the fingerprint collected with fp-collect
scannerResults = scanner.analyseFingerprint(fingerprint);

// Name of the first test
console.log(scannerResults[0].name); 
// PHANTOM_UA

// Result of the test
console.log(scannerResults[0].consistent);
// Either 1 (Inconsistent), 2 (Unsure) or 3 (Consistent)

// Data related with the test
console.log(scannerResults[0].data);
// User agent of the browser
```

**analyseFingerprint** returns an array of analysisResult's objects.
Each object contains information on the name of the test


# Warning
The library is still in its early phase, many changes may occur.
More tests are coming soon.

# Acknowledgements
We would like to thank [CrossBrowserTesting](https://crossbrowsertesting.com) for providing us an easy way to test our scanner on different platforms to reduce false positives.

![Logo of CrossBrowserTesting](https://seeklogo.com/images/C/cross-browser-testing-logo-300E2AF44B-seeklogo.com.png)
