# Fingerprint Scanner
[![Build Status](https://travis-ci.org/antoinevastel/fpscanner.svg?branch=master)](https://travis-ci.org/antoinevastel/fpscanner)

Library to detect bots and crawlers using browser fingerprinting.

You can see it in action on [this page.](https://antoinevastel.com/bots/)


## Attributes collected
Fingerprint Scanner relies on [Fp-Collect](https://github.com/antoinevastel/fp-collect) to collect a browser fingerprint.
Since the purpose of the library is bot detection, it doesn't detect collect 
unnecessary fingerprint attributes used for tracking.

## Usage

### Installation

```
npm install fpscanner

```

### Detect bots

In order to use Fingerprint-Scanner your need to pass a fingerprint
collected using the fp-collect library.
Then, we can analyze the fingerprint with the scanner.

```js
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
Each object contains the following information:
- *name*: the name of the test;
- *consistent*: the result of the test (CONSISTENT, UNSURE, INCONSISTENT)
- *data*: data related to the test

## Detection tests

Summary of the tests used to detect bots. For more details, visit 
the documentation page (coming soon).

- **PHANTOM_UA:** Detect PhantomJS user agent
- **PHANTOM_PROPERTIES:** Test the presence of properties introduced by PhantomJS 
- **PHANTOM_ETSL:** Runtime verification for PhantomJS
- **PHANTOM_LANGUAGE:** Use *navigator.languages* to detect PhantomJS
- **PHANTOM_WEBSOCKET:** Analyze the error thrown when creating a websocket
- **MQ_SCREEN:** Use media query related to the screen
- **PHANTOM_OVERFLOW:** Analyze error thrown when a stack overflow occurs
- **PHANTOM_WINDOW_HEIGHT:** Analyze window screen dimension
- **HEADCHR_UA:** Detect Chrome Headless user agent
- **WEBDRIVER:** Test the presence of *webriver* attributes
- **HEADCHR_CHROME_OBJ:** Test the presence of the *window.chrome* object
- **HEADCHR_PERMISSIONS:** Test permissions management
- **HEADCHR_PLUGINS:** Verify the number of plugins
- **HEADCHR_IFRAME:** Test presence of Chrome Headless using an iframe
- **CHR_DEBUG_TOOLS:** Test if debug tools are opened
- **SELENIUM_DRIVER:** Test the presence of Selenium drivers
- **CHR_BATTERY:** Test the presence of *battery*
- **CHR_MEMORY:** Verify if *navigator.deviceMemory* is consistent
- **TRANSPARENT_PIXEL:** Verify if a canvas pixel is transparent

# Acknowledgements
We would like to thank [CrossBrowserTesting](https://crossbrowsertesting.com) for providing us an easy way to test our scanner on different platforms to reduce false positives.

![Logo of CrossBrowserTesting](https://seeklogo.com/images/C/cross-browser-testing-logo-300E2AF44B-seeklogo.com.png)
