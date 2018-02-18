# Fingerprint Scanner
[![Build Status](https://travis-ci.org/antoinevastel/fpscanner.svg?branch=master)](https://travis-ci.org/antoinevastel/fpscanner)

Library to collect and analyze browser fingerprints.
It aims at detecting the presence of inconsistencies in the fingerprint to reveal the presence 
of countermeasures.

# Attributes collected

## Browser
- canvas
- fonts
- plugins
- mimeTypes
- webGL
- userAgent
- dnt
- adBlock
- cookies
- name
- version
- maths
- localStorage
      
## OS
- name
- platform
- languages
- processors
- hardwareConcurrency
- screen
- oscpu
- touchScreen
- videoCard
- multimediaDevices

## Readme
- timezone
- timezoneLocale

## Scanner
- productSub
- navigatorPrototype
- etsl
- showModal
- sendBeacon
- spawn
- emit
- buffer
- timezoneOffsetDesc
- screenDesc
- historyDesc
- bindDesc 
- canvasDesc
- awesomium
- ghostJS
- nightmareJS
- fmget
- webDriver
- seleniumIDE 
- domAutomation
- errorsGenerated
- resOverflow
- emoji
- accelerometerUsed
- mediaQueries

# TODOs
Separate the scanner module from the collect module.
Add detection of bots and tests for the scanner module.

# Acknowledgements
We would like to thank [CrossBrowserTesting](https://crossbrowsertesting.com) for providing us an easy way to test our scanner on different platforms to reduce false positives.

![Logo of CrossBrowserTesting](https://seeklogo.com/images/C/cross-browser-testing-logo-300E2AF44B-seeklogo.com.png)
