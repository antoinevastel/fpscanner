const scan = (function () {
  const timezone = "TimezoneOverwritten";
  const screen = "ScreenOverwritten";
  const history = "HistoryOverwritten";
  const bind = "BindOverwritten";
  const canvas = "CanvasOverwritten";
  const vendor = "VendorOverwritten";
  const navigatorOverwritten = "NavigatorOverwritten";
  const uasIdentical = "UasIdentical";
  const platformOsRefConsistent = "PlatformOsRefConsistent";
  const mqOsConsistent = "MediaQueriesOsConsistent";
  const arePluginsConsistent = "PluginsConsistentOs";
  const webGlConsistentOs = "WebGlConsistentOs";
  const fontConsistentOs = "FontConsistentOs";
  const errorsConsistentBrowser = "ErrorsConsistentBrowser";
  const screenSizeConsistent = "ScreenSizeConsistent";
  const accelerometerConsistent = "AccelerometerConsistent";
  const productSubConsistent = "ProductSubConsistent";
  const etslConsistentBrowser = "EtslConsistentBrowser";
  const touchSupportConsistent = "TouchSupportConsistent";

  const INTERNET_EXPLORER = "Internet Explorer";
  const EDGE = "Edge";
  const FIREFOX = "Firefox";
  const CHROME = "Chrome";
  const OPERA = "Opera";
  const SAFARI = "Safari";

  const WINDOWS = "Windows";
  const BSD = "Bsd";

  const DESKTOP = "Desktop";
  const MOBILE = "Mobile";

  const WINDOWS_PHONE = "Windows Phone";
  const WINDOWS_XP = "Windows XP";
  const WINDOWS_VISTA = "Windows Vista";
  const WINDOWS_7 = "Windows 7";
  const WINDOWS_8 = "Windows 8";
  const WINDOWS_10	= "Windows 10";
  const FEDORA = "Fedora";
  const UBUNTU = "Ubuntu";
  const LINUX = "Linux";
  const MAC_OS = "MacOS";
  const ANDROID = "Android";
  const IOS = "iOS";
  const OTHER = "Other";
  const FREE_BSD = "FreeBSD";
  const OPEN_BSD = "OpenBSD";
  const NET_BSD = "NetBSD";

  const OS_TO_OS_FAMILY = {};
  OS_TO_OS_FAMILY[WINDOWS_PHONE] = WINDOWS_PHONE;
  OS_TO_OS_FAMILY[WINDOWS_XP] = WINDOWS;
  OS_TO_OS_FAMILY[WINDOWS_VISTA] = WINDOWS;
  OS_TO_OS_FAMILY[WINDOWS_7] = WINDOWS;
  OS_TO_OS_FAMILY[WINDOWS_8] = WINDOWS;
  OS_TO_OS_FAMILY[WINDOWS_10] = WINDOWS;
  OS_TO_OS_FAMILY[FEDORA] = LINUX;
  OS_TO_OS_FAMILY[UBUNTU] = LINUX;
  OS_TO_OS_FAMILY[LINUX] = LINUX;
  OS_TO_OS_FAMILY[MAC_OS] = MAC_OS;
  OS_TO_OS_FAMILY[ANDROID] = ANDROID;
  OS_TO_OS_FAMILY[IOS] = IOS;
  OS_TO_OS_FAMILY[OTHER] = OTHER;
  OS_TO_OS_FAMILY[FREE_BSD] = BSD;
  OS_TO_OS_FAMILY[OPEN_BSD] = BSD;
  OS_TO_OS_FAMILY[NET_BSD] = BSD;

  const OSFamilyToPlatforms = {};
  OSFamilyToPlatforms[LINUX] = ["Linux i686", "Linux x86_64"];
  OSFamilyToPlatforms[WINDOWS] = ["Win32", "Win64"];
  OSFamilyToPlatforms[BSD] = ["FreeBSD amd64", "FreeBSD i386", "OpenBSD amd64", "NetBSD amd64"];
  OSFamilyToPlatforms[MAC_OS] = ["MacIntel"];
  OSFamilyToPlatforms[OTHER] = ["Other", "PlayStation 4", "PlayStation 3", "Nintendo Wii"];
  OSFamilyToPlatforms[WINDOWS_PHONE] = ["ARM", "Win32"];
  OSFamilyToPlatforms[IOS] = ["iPhone", "iPad"];
  OSFamilyToPlatforms[ANDROID] = ["Linux armv7l", "Linux i686", "Linux armv8l"];

  const fontsToOS = require("./dataFonts.js");

  // There may be problems with windows 8 and 8.1
  const mqToOS = {};
  mqToOS["1"] = WINDOWS_XP;
  mqToOS["2"] = WINDOWS_VISTA;
  mqToOS["3"] = WINDOWS_7;
  mqToOS["4"] = WINDOWS_8;
  mqToOS["5"] = WINDOWS_10;

  const analysisResult = function(name, consistent, data) {
      return {name: name, consistent: consistent, data: data};
  };

  const areErrorsConsistentBrowser = function(fp) {
    let consistent = true;
    let errorFailed = [];
    //errors_generated[3] = error.description
    //errors_generated[4] = error.number
    //it is only available on IE browsers
    if ((
        (fp.scanner.errorsGenerated[3] !== undefined || fp.scanner.errorsGenerated[4] !== undefined) &&
        (fp.browser.name !== INTERNET_EXPLORER || fp.browser.name !== EDGE)
      ) || (
        (fp.scanner.errorsGenerated[3] === undefined || fp.scanner.errorsGenerated[4] === undefined) &&
        (fp.browser.name === INTERNET_EXPLORER || fp.browser.name === EDGE)
      )) {
      consistent = false;
      errorFailed.push("IE Edge exception signature");
    }

    //errors_generated[1] = error.filename
    //its is only available on Firefox based browsers
    //works also for firefox mobile
    if ((fp.scanner.errorsGenerated[1] !== undefined && fp.browser.name.indexOf(FIREFOX) === -1) ||
      (fp.scanner.errorsGenerated[1] !== undefined && fp.browser.name.indexOf(FIREFOX) > -1)) {
      consistent = false;
      errorFailed.push("Firefox filename");
    }

    if ((fp.scanner.errorsGenerated[7].indexOf("An invalid or illegal") !== -1 && fp.browser.name.indexOf(FIREFOX) === -1) ||
      (fp.scanner.errorsGenerated[7].indexOf("An invalid or illegal") === -1 && fp.browser.name.indexOf(FIREFOX) > -1)) {
      consistent = false;
      errorFailed.push("Firefox websocket constructor");
    }

    if ((
        fp.scanner.errorsGenerated[7].indexOf("Failed to construct 'WebSocket'") !== -1 &&
        fp.browser.name.indexOf(CHROME) === -1 &&
        fp.browser.name.indexOf(OPERA) === -1
      ) || (
        fp.scanner.errorsGenerated[7].indexOf("Failed to construct 'WebSocket'") === -1 &&
        (fp.browser.name.indexOf(CHROME) > -1 || fp.browser.name.indexOf(OPERA) > -1)
      )) {
      consistent = false;
      errorFailed.push("Chrome websocket constructor");
    }

    if ((fp.scanner.resOverflow[1] === "InternalError" && fp.browser.name.indexOf(FIREFOX) === -1) ||
      (fp.scanner.resOverflow[1] !== "InternalError" && fp.browser.name.indexOf(FIREFOX) > -1)) {
      consistent = false;
      errorFailed.push("Firefox stack overflow");
    }

    if ((
        fp.scanner.resOverflow[1] === "RangeError" &&
        fp.browser.name.indexOf(CHROME) === -1 &&
        fp.browser.name.indexOf(OPERA) === -1
      ) || (
        fp.scanner.resOverflow[1] !== "RangeError" && (
          fp.browser.name.indexOf(CHROME) > -1 ||
          fp.browser.name.indexOf(OPERA) > -1
        )
      )) {
      consistent = false;
      errorFailed.push("Chrome stack overflow");
    }

    const data = {"errorsFailed": errorFailed.join(";")};
    return analysisResult(errorsConsistentBrowser, consistent, data);
  };

  const areFontsConsistentOs = function(fp) {
    const osFamily = OS_TO_OS_FAMILY[fp.os.name];
    console.log(fp);

    let nbWrongFonts = 0;
    let nbRightFonts = 0;
    const data = {};
    data.wrongFonts = [];
    const fonts = fp.browser.fonts.split(";;");
    for (let font in fonts) {
      let value = fonts[font].split("--");
      if (value[1] === "true") {
        if (fontsToOS[value[0]] !== osFamily) {
          nbWrongFonts++;
          data.wrongFonts.push(value[0]);
        } else {
          nbRightFonts++;
        }
      }
    }
    data.nbWrongFonts = nbWrongFonts;
    data.nbRightFonts = nbRightFonts;
    const consistent = (nbWrongFonts / (nbRightFonts + 1)) < 5;
    return analysisResult(fontConsistentOs, consistent, data);
  };

  const isWebGlConsistentOs = function(fp) {
    // TODO When we'll have more info, detect fake mobile devices
    // using vendor, and particularly Qualcomm value
    var osFamily = OS_TO_OS_FAMILY[fp.os.name];
    var consistent = true;
    var data = {};
    if (osFamily === WINDOWS ||
      osFamily === LINUX ||
      osFamily === MAC_OS) {
      var forbiddenExtensions = ["ANGLE", "OpenGL", "Mesa", "Gallium", "Qualcomm"];
      if (osFamily == WINDOWS) {
        forbiddenExtensions = ["OpenGL", "Mesa", "Gallium", "Qualcomm"];
      } else if (osFamily == MAC_OS) {
        forbiddenExtensions = ["ANGLE", "Mesa", "Gallium", "Qualcomm"];
      } else if (osFamily == LINUX) {
        forbiddenExtensions = ["ANGLE", "OpenGL", "Qualcomm"];
      }
      for (var extension in forbiddenExtensions) {
        if (fp.os.videoCard.indexOf(forbiddenExtensions[extension]) != -1) {
          consistent = false;
          data.forbiddenExtensionWebGL = forbiddenExtensions[extension];
          break;
        }
      }

    }
    return analysisResult(webGlConsistentOs, consistent, data);
  };

  const scanFingerprint = function(fp) {
    const inconstencyResults = {
      errorsConsistentBrowser: areErrorsConsistentBrowser(fp),
      fontsConsistentOs: areFontsConsistentOs(fp),
      webGlConsistentOs: isWebGlConsistentOs(fp),
    };

    return inconstencyResults;
  };

  return {
    scanFingerprint: scanFingerprint
  }
})();

module.exports = scan;
