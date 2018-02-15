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

  const INTERNET_EXPLORER = "IE";
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
  const WINDOWS_8_1 = "Windows 8.1";
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
  OS_TO_OS_FAMILY[WINDOWS_8_1] = WINDOWS;
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
        fp.browser.name !== INTERNET_EXPLORER && fp.browser.name !== EDGE
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
      (fp.scanner.errorsGenerated[1] === undefined && fp.browser.name.indexOf(FIREFOX) > -1)) {
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
    const osFamily = OS_TO_OS_FAMILY[fp.os.name];
    let consistent = true;
    const data = {};
    if (osFamily === WINDOWS ||
      osFamily === LINUX ||
      osFamily === MAC_OS) {
      let forbiddenExtensions = ["ANGLE", "OpenGL", "Mesa", "Gallium", "Qualcomm"];
      if (osFamily === WINDOWS) {
        forbiddenExtensions = ["OpenGL", "Mesa", "Gallium", "Qualcomm"];
      } else if (osFamily === MAC_OS) {
        forbiddenExtensions = ["ANGLE", "Mesa", "Gallium", "Qualcomm"];
      } else if (osFamily === LINUX) {
        forbiddenExtensions = ["ANGLE", "OpenGL", "Qualcomm"];
      }
      for (let extension in forbiddenExtensions) {
        if (fp.os.videoCard.indexOf(forbiddenExtensions[extension]) !== -1) {
          consistent = false;
          data.forbiddenExtensionWebGL = forbiddenExtensions[extension];
          break;
        }
      }

    }
    return analysisResult(webGlConsistentOs, consistent, data);
  };

  /*
      Analysis name: PluginsConsistentOs
      Checks if plugins filename extension is consistent with the OS
      On Linux it should be .so
      On Mac .plugin
      On Windows .dll
      Some OSes shouldn't have plugins such as Android or iOS
  */
  const arePluginsConsistentOs = function(fp) {
    let forbiddenExtensions = [".so", ".dll", ".plugin"];
    const osFamily = OS_TO_OS_FAMILY[fp.os.name];
    // Case of mobile devices
    if (fp.os.platform.indexOf("arm") !== -1) {
      forbiddenExtensions = [".so", ".plugin"];
    } else if (osFamily === WINDOWS) {
      forbiddenExtensions = [".so", ".plugin"];
    } else if (osFamily === MAC_OS) {
      forbiddenExtensions = [".so", ".dll"];
    } else if (osFamily === LINUX) {
      forbiddenExtensions = [".dll", ".plugin"];
    }

    let forbiddenExtensionFound = false;
    const data = {};
    for (let extension in forbiddenExtensions) {
      if (fp.browser.plugins.indexOf(forbiddenExtensions[extension]) !== -1) {
        forbiddenExtensionFound = true;
        data.forbiddenExtension = forbiddenExtensions[extension];
      }
    }
    const consistent = !forbiddenExtensionFound;
    return analysisResult(arePluginsConsistent, consistent, data);
  };

  /*
	  Analysis name: MqOsConsistentOs
		Check if media queries about OS are consistent
		with the OS displayed in the user agent
		It also detects inconsistency with the browser (Firefox)
	*/
  const areMqOSConsistent = function(fp) {
    let consistent = true;
    const data = {};
    // we test if one one the media query is true and the browser is not firefox
    let found = false;
    for (let mq in fp.scanner.mediaQueries) {
      if (fp.scanner.mediaQueries[mq]) {
        found = true;
      }
    }

    if (found && fp.browser.name !== FIREFOX) {
      data.notFirefox = true;
      consistent = false;
    }

    //mq_os[0] tests mac OS X special theme
    if (fp.scanner.mediaQueries[0] && fp.os.name !== MAC_OS) {
      data.mqFailed = MAC_OS;
      consistent = false;
    }

    //mq_os[i] tests every Windows
    // Warning: there might be problem with windows 8.1
    for (let i = 1; i < 6; i++) {
      if (i != 4 && consistent && (
          (
            fp.scanner.mediaQueries[i] && fp.os.name !== mqToOS[i]
          ) || (
            !fp.scanner.mediaQueries[i] && fp.os.name === mqToOS[i] && (
              fp.browser.name === FIREFOX || found
            )
          )
        )) {
        data.mqFailed = mqToOS[i];
        consistent = false;
      } else if (i === 4) {//For windows 8
        if (consistent && (
            (
              fp.scanner.mediaQueries[i] && fp.os.name.indexOf(WINDOWS_8) === -1
            ) || (
              !fp.scanner.mediaQueries[i] && fp.os.name.indexOf(WINDOWS_8) > -1 && (
                fp.browser.name === FIREFOX || found
              )
            )
          )) {
          data.mqFailed = mqToOS[i];
          consistent = false;
        }
      }
    }
    return analysisResult(mqOsConsistent, consistent, data);
  };

  /*
      Analysis name: PlatformOsRefConsistent
      Checks if navigator platform attribute is consistent with OS
      using user agent
  */
  const isPlatformOsRefConsistent = function(fp) {
    let consistent = false;
    const osFamily = OS_TO_OS_FAMILY[fp.os.name];
    let data;
    for (let value in OSFamilyToPlatforms[osFamily]) {
      if (fp.os.platform === OSFamilyToPlatforms[osFamily][value]) {
        consistent = true;
        data = {"os": fp.os.name, "platformInconsistent": fp.os.platform};
        break;
      }
    }
    return analysisResult(platformOsRefConsistent, consistent, data);
  };

  /*
       Analysis name: UasIdentical
      Checks if ua http and ua navigator are the same
  */
  const areUasIdentical = function(fp) {
    let consistent = true;
    if(typeof fp.browser.httpHeaders !== "undefined") {
      consistent = fp.browser.userAgent === fp.browser.userAgentHttp;
    }
    return analysisResult(uasIdentical, consistent, {});
  };

  /*
      Analysis name: TimezoneOverwritten
      Returns True if Date.getTimezoneOffset method has been
      overwritten, else False
  */
  const isTimezoneOverwritten = function(fp) {
    const consistent = fp.scanner.timezoneOffsetDesc.indexOf("native code") !== -1;
    return analysisResult(timezone, consistent, {});
  };

  /*
		Analysis name: NAVIGATOR_OVERWRITTEN
		Checks if there exists at least 1 methods or attributes
		of navigator object that has been overwritten
	*/
  const isNavigatorOverwritten = function(fp) {
    let consistent = true;
    const overwrittenProperties = [];

    if (fp.browser.name !== INTERNET_EXPLORER) {
      const navProto = fp.scanner.navigatorPrototype.split(";;;");

      for (let propName in navProto) {
        let value = navProto[propName].split("~~~");
        if (value[1] !== "" && value[1].indexOf("native") === -1) {
          consistent = false;
          overwrittenProperties.push(value[0]);
        }
      }
    }
    const data = {"propertiesOverwritten": overwrittenProperties.join("~~")};
    return analysisResult(navigatorOverwritten, consistent, data);
  };

  /*
		Analysis name: CanvasOverwritten
		Checks if a property/method used to generate a
		canvas has been overwritten
	*/
  const isCanvasOverwritten = function(fp) {
    // TODO add analysis of pixels
    const consistent =  fp.scanner.canvasDesc.indexOf("native code") !== -1;
    return analysisResult(canvas, consistent, {});
  };

  /*
        Analysis name: ScreenOverwritten
        Returns True if screen object has been overwritten,
        else False
    */
  const isScreenOverwritten = function(fp) {
    const consistent = fp.scanner.screenDesc.indexOf("native code") !== -1;
    return analysisResult(screen, consistent, {});
  };

  const isHistoryOverwritten = function(fp) {
    var consistent;
    if(fp.browser.name === INTERNET_EXPLORER) {
      consistent = fp.scanner.historyDesc.indexOf("object History") !== -1;
    } else {
      consistent = fp.scanner.historyDesc.indexOf("native code") !== -1;
    }
    return analysisResult(history, consistent, {});
  }

  const isBindOverwritten = function(fp) {
    const consistent = (fp.scanner.bindDesc.indexOf("native code") !== -1);
    return analysisResult(bind, consistent, {});
  };

  /*
		Analysis name: ScreenSizeConsistent
		For the moment test only in case the device claims to be an iPhone if its screen size
		belongs to a defined list of allowed screen resolution
	*/
  const isScreenSizeConsistent = function(fp) {
    let consistent = true;
    const data = {};
    if (fp.os.name === "iOS") {
      consistent = false;
      const subRes = fp.os.resolution.split(",");
      const subResStr = subRes[0]+","+subRes[1];
      const allowedIphoneResolutions = ["320,568", "568,320", "375,667", "667,375", "768,1024", "1024,768", "2048,1536", "1536,2048"];
      for (let i in allowedIphoneResolutions) {
        if (allowedIphoneResolutions[i] === subResStr) {
          consistent = true;
          break;
        }
      }

      if(!consistent) {
        data.screenSize = fp.os.resolution;
      }
    }
    return analysisResult(screenSizeConsistent, consistent, data);
  };

  /*
		Analysis name: ACCELEROMETER
		Returns True if accelerometer is consistent with the
		class of device, i.e mobile device and accelerometer is True,
		or computer device and accelerometer is False
	*/
  const isAccelerometerConsistent = function(fp) {
    const isMobileDevice = (fp.os.name === ANDROID || fp.os.name === IOS || fp.os.name === WINDOWS_PHONE);
    let consistent = true;
    if ((isMobileDevice && !fp.os.accelerometer) || (!isMobileDevice && fp.os.accelerometer)) {
      consistent = false;
    }
    return analysisResult(accelerometerConsistent, consistent, {});
  };

  /*
		Analysis name: ProductSubConsistent
		Returns True if productSub is "20030107" on
		Chrome, Safari and Opera
	*/
  const isProductSubConsistent = function(fp) {
    let consistent = true;
    const data = {};
    if ((fp.browser.name.indexOf(CHROME) > -1 ||
        fp.browser.name.indexOf(SAFARI) > -1 ||
        fp.browser.name.indexOf(OPERA) > -1) &&
      fp.scanner.productSub !== "20030107") {
      consistent = false;
    }
    else if (fp.browser.name !== OTHER && fp.browser.name.indexOf(CHROME) === -1 &&
      fp.browser.name.indexOf(SAFARI) === -1 && fp.browser.name.indexOf(OPERA) === -1 &&
      fp.scanner.productSub === "20030107") {
      consistent = false;
    }

    if (!consistent) {
      data.productSub = fp.scanner.productSub;
    }
    return analysisResult(productSubConsistent, consistent, data);
  };

  /*
      Analysis name: EtslConsistentBrowser
      Checks if eval.toString().length is equals to:
      - 37 for Safari and Firefox
      - 39 for IE and Edge
      - 33 for Chrome, Opera
  */

  const isEtslConsistentBrowser = function(fp) {
    const browserToEvalLength = {};
    browserToEvalLength[SAFARI] = 37;
    browserToEvalLength[FIREFOX] = 37;
    browserToEvalLength[INTERNET_EXPLORER] = 39;
    browserToEvalLength[EDGE] = 39;
    browserToEvalLength[CHROME] = 33;
    browserToEvalLength[OPERA] = 33;

    let consistent = true;
    const data = {};
    if ((fp.browser.name in browserToEvalLength) && (browserToEvalLength[fp.browser.name] !== fp.scanner.etsl)) {
      consistent = false;
      data.etsl = fp.scanner.etsl;
    }
    return analysisResult(etslConsistentBrowser, consistent, data);
  };

  /*
      Analysis name: TouchSupportConsistent
      Checks if touch support is active only on Android, iOS, or
      Windows Phone devices
  */
  const isTouchSupportConsistent = function(fp){
    let consistent = true;
    const data = {};
    if ((fp.os.name === ANDROID || fp.os.name === IOS || fp.os.name === WINDOWS_PHONE) &&
      fp.os.touchScreen === "0;false;false") {
      consistent = false;
      data.touchSupport = fp.os.touchScreen;
    }
    return analysisResult(touchSupportConsistent, consistent, data);
  };

  const isConsistent = function(analysisResults) {
    let consistent = true;
    Object.keys(analysisResults).forEach((res) => {
      if(!analysisResults[res].consistent) {
        consistent = false;
      }
    });
    return consistent;
  };

  // TODO add a mode where it stops as soon as a test fails
  const scanFingerprint = function(fp) {
    const inconstencyResults = {
      errorsConsistentBrowser: areErrorsConsistentBrowser(fp),
      fontsConsistentOs: areFontsConsistentOs(fp),
      webGlConsistentOs: isWebGlConsistentOs(fp),
      pluginsConsistentOs: arePluginsConsistentOs(fp),
      mqOSConsistent: areMqOSConsistent(fp),
      platformOsRefConsistent: isPlatformOsRefConsistent(fp),
      uasIdentical: areUasIdentical(fp),
      timezoneOverwritten: isTimezoneOverwritten(fp),
      navigatorOverwritten: isNavigatorOverwritten(fp),
      canvasOverwritten: isCanvasOverwritten(fp),
      screenOverwritten: isScreenOverwritten(fp),
      historyOverwritten: isHistoryOverwritten(fp),
      bindOverwritten: isBindOverwritten(fp),
      screenSizeConsistent: isScreenSizeConsistent(fp),
      accelerometerConsistent: isAccelerometerConsistent(fp),
      productSubConsistent: isProductSubConsistent(fp),
      etslConsistentBrowser: isEtslConsistentBrowser(fp),
      touchSupportConsistent: isTouchSupportConsistent(fp)
    };

    inconstencyResults.consistency = analysisResult("consistent", isConsistent(inconstencyResults), {});
    return inconstencyResults;
  };



  return {
    analyse: scanFingerprint
  }
})();

module.exports = scan;
