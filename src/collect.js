const fpCollect = (function () {
  const parser = require('ua-parser-js');
  const uaParser = new parser.UAParser();
  uaParser.setUA(navigator.userAgent);

  const getAudio = require('./audio.js');
  const getFonts = require('./fonts.js');
  const hash = require('./hash.js');

  const UNKNOWN = "unknown";

  // TODO needs to be a parameter later
  // use "" if you want to override original value
  const HASH_SUFFIX = "Hashed";
  const SEED = 42;
  // Fingerprints can be either a list of attributes or attributes
  // structured by categories
  // It is only possible to have at most one level of category
  const option = function(hash, isAsync, unpack) {
    //save parameters usefull only if hash is set to true
    return {hash: hash, isAsync: isAsync, unpack: unpack};
  };

  let HTTP_HEADERS_URL;

  // TODO add geolocation
  const DEFAULT_OPTIONS = {
    browser: {
      //"canvasBis", // Can be seen as custom canvas function
      canvas: option(true, false, false),
      // audio: option(true, true, false),
      fonts: option(true, true, false),
      plugins: option(true, false, false),
      mimeTypes: option(true, false, false),
      webGL: option(true, false, false),
      userAgent: option(false, false, false),
      dnt: option(false, false, false),
      adBlock: option(false, false, false),
      cookies: option(false, false, false),
      name: option(false, false, false),
      version: option(false, false, false),
      maths: option(true, false, false),
      localStorage: option(false, false, false),
      httpHeaders: option(false, true, true, {httpHeadersURL: ''})
    },
    os: {
      name: option(false, false, false),
      platform: option(false, false, false),
      languages: option(false, false, false),
      processors: option(false, false, false),
      hardwareConcurrency: option(false, false, false),
      resolution: option(false, false, false),
      colorDepth: option(false, false, false),
      screenDensity: option(false, false, false),
      oscpu: option(false, false, false),
      touchScreen: option(false, false, false),
      videoCard: option(false, false, false),
      multimediaDevices: option(false, true, true),
    },
    geolocation: {
      timezone: option(false, false, false),
      timezoneLocale: option(true, false, false),
    },
    scanner: {
      productSub: option(false, false, false),
      navigatorPrototype: option(false, false, false),
      etsl: option(false, false, false),
      showModal: option(false, false, false),
      sendBeacon: option(false, false, false),
      spawn: option(false, false, false),
      emit: option(false, false, false),
      buffer: option(false, false, false),
      timezoneOffsetDesc: option(false, false, false),
      screenDesc: option(false, false, false),
      historyDesc: option(false, false, false),
      bindDesc: option(false, false, false),
      canvasDesc: option(false, false, false),

      awesomium: option(false, false, false),
      ghostJS: option(false, false, false),
      nightmareJS: option(false, false, false),
      fmget: option(false, false, false),
      webDriver: option(false, false, false),
      seleniumIDE: option(false, false, false),
      domAutomation: option(false, false, false),

      errorsGenerated: option(false, false, false),
      resOverflow: option(false, false, false),
      emoji: option(false, false, false),
      accelerometerUsed: option(false, true, false),
      mediaQueries: option(false, false, false)
    }
  };

  const defaultAttributeToFunction = {
    browser: {
      userAgent: () => {
        return navigator.userAgent;
      },
      plugins: () => {
        const pluginsRes = [];
        for(let i = 0; i < navigator.plugins.length; i++) {
          const plugin = navigator.plugins[i];
          const pluginStr = [plugin.name, plugin.description, plugin.filename, plugin.version].join("::");
          let mimeTypes = [];
          Object.keys(plugin).forEach((mt) => {
            mimeTypes.push([plugin[mt].type, plugin[mt].suffixes, plugin[mt].description].join("~"));
          });
          mimeTypes = mimeTypes.join(",");
          pluginsRes.push(pluginStr + "__" + mimeTypes);
        }
        return pluginsRes.join(";;;");
      },
      name: () => {
        return uaParser.getBrowser().name;
      },
      version: () => {
        return uaParser.getBrowser().version;
      },
      maths: () => {
        function asinh(x) {
          if (x === -Infinity) {
            return x;
          } else {
            return Math.log(x + Math.sqrt(x * x + 1));
          }
        }

        function acosh(x) {
          return Math.log(x + Math.sqrt(x * x - 1));
        }

        function atanh(x) {
          return Math.log((1 + x) / (1 - x)) / 2;
        }

        function cbrt(x) {
          let y = Math.pow(Math.abs(x), 1 / 3);
          return x < 0 ? -y : y;
        }

        function cosh(x) {
          const y = Math.exp(x);
          return (y + 1 / y) / 2;
        }

        function expm1(x) {
          return Math.exp(x) - 1;
        }

        function log1p(x) {
          return Math.log(1 + x);
        }

        function sinh(x) {
          const y = Math.exp(x);
          return (y - 1 / y) / 2;
        }

        function tanh(x) {
          if (x === Infinity) {
            return 1;
          } else if (x === -Infinity) {
            return -1;
          } else {
            const y = Math.exp(2 * x);
            return (y - 1) / (y + 1);
          }
        }

        return [
          asinh(1),
          (acosh(1e300) == "Infinity") ? "Infinity" : acosh(1e300),
          atanh(0.5),
          expm1(1),
          cbrt(100),
          log1p(10),
          sinh(1),
          cosh(10),
          tanh(1)
        ].join(";");
      },
      adBlock: () => {
        const ads = document.createElement("div");
        ads.innerHTML = "&nbsp;";
        ads.className = "adsbox";
        let result = false;
        try {
          // body may not exist, that's why we need try/catch
          document.body.appendChild(ads);
          result = document.getElementsByClassName("adsbox")[0].offsetHeight === 0;
          document.body.removeChild(ads);
        } catch (e) {
          result = false;
        }
        return result;
      },
      cookies: () => {
        return window.navigator.cookieEnabled ? "yes" : "no";
      },
      localStorage: () => {
        let domLocalStorage;
        try {
          localStorage.fp = "test";
        } catch (ex) {}

        try {
          domLocalStorage = "";
          if (localStorage.fp === "test") {
            domLocalStorage = "yes";
          } else {
            domLocalStorage = "no";
          }
        } catch (ex) {
          domLocalStorage = "no";
        }
        return domLocalStorage;
      },
      canvas: () => {
        const canvas = document.createElement("canvas");
        canvas.height = 60;
        canvas.width = 400;
        const canvasContext = canvas.getContext("2d");
        canvas.style.display = "inline";
        canvasContext.textBaseline = "alphabetic";
        canvasContext.fillStyle = "#f60";
        canvasContext.fillRect(125, 1, 62, 20);
        canvasContext.fillStyle = "#069";
        canvasContext.font = "11pt no-real-font-123";
        canvasContext.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
        canvasContext.fillStyle = "rgba(102, 204, 0, 0.7)";
        canvasContext.font = "18pt Arial";
        canvasContext.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);
        return canvas.toDataURL();
      },
      audio: getAudio,
      dnt: () => {
        return navigator.doNotTrack ? navigator.doNotTrack : UNKNOWN;
      },
      mimeTypes : () => {
        const mimeTypes = [];
        for (let i = 0; i < navigator.mimeTypes.length; i++) {
          let mt = navigator.mimeTypes[i];
          mimeTypes.push([mt.description, mt.type, mt.suffixes].join("~~"));
        }
        return mimeTypes.join(";;");
      },
      fonts: getFonts,
      webGL: () => {
        function describeRange(opt_attributes) {
          return "[" + opt_attributes[0] + ", " + opt_attributes[1] + "]";
        }

        function getMaxAnisotropy(gl) {
          let hasMembers;
          const e = gl.getExtension("EXT_texture_filter_anisotropic") || (gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic"));
          return e ? (hasMembers = gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT), hasMembers || (hasMembers = 2), hasMembers) : null;
        }

        function formatPower(exponent, recurring) {
          return recurring ? "" + Math.pow(2, exponent) : "2^" + exponent;
        }

        function getPrecisionDescription(precision, recurring) {
          return "[-" + formatPower(precision.rangeMin, recurring) + ", " + formatPower(precision.rangeMax, recurring) + "] (" + precision.precision + (recurring ? " bit mantissa" : "") + ")";
        }

        function getShader(shaderType, gl) {
          const high = gl.getShaderPrecisionFormat(shaderType, gl.HIGH_FLOAT);
          const low = gl.getShaderPrecisionFormat(shaderType, gl.MEDIUM_FLOAT);
          return {
            High: getPrecisionDescription(high, 1),
            Medium: getPrecisionDescription(low, 1),
            Low: getPrecisionDescription(gl.getShaderPrecisionFormat(shaderType, gl.LOW_FLOAT), 1),
            Best: getPrecisionDescription(high.precision ? high : low, 0)
          };
        }

        function getFloatIntPrecision(gl) {
          let high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
          return (high.precision ? "highp/" : "mediump/") + (high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT) && high.rangeMax ? "highp" : "lowp");
        }

        function isPowerOfTwo(x) {
          return x && 0 === (x & x - 1);
        }

        function getAngle(gl) {
          const lineWidthRange = describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE));
          const a = "Win32" === navigator.platform && ("Internet Explorer" !== gl.getParameter(gl.RENDERER) && lineWidthRange === describeRange([1, 1]));
          return a ? isPowerOfTwo(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)) && isPowerOfTwo(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)) ? 2 : 1 : 0;
        }

        function turnObjToArray(map) {
          const bProperties = [];
          let letter;
          for (letter in map) {
            bProperties.push([letter, map[letter]]);
          }
          return bProperties.sort().toString();
        }

        if (window.WebGLRenderingContext) {
          let gl;
          let cur;
          let i = 4;
          const test_canvas = window.document.createElement("canvas");
          const names = ["webkit-3d", "moz-webgl", "experimental-webgl", "webgl"];
          for (; i--;) {
            {
              if ((gl = test_canvas.getContext(cur = names[i])) && "function" === typeof gl.getParameter) {
                return [turnObjToArray({
                  contextName: cur,
                  glVersion: gl.getParameter(gl.VERSION),
                  shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                  vendor: gl.getParameter(gl.VENDOR),
                  renderer: gl.getParameter(gl.RENDERER),
                  antialias: gl.getContextAttributes().antialias ? "Available" : "Not available",
                  angle: getAngle(gl),
                  redBits: gl.getParameter(gl.RED_BITS),
                  greenBits: gl.getParameter(gl.GREEN_BITS),
                  blueBits: gl.getParameter(gl.BLUE_BITS),
                  alphaBits: gl.getParameter(gl.ALPHA_BITS),
                  depthBits: gl.getParameter(gl.DEPTH_BITS),
                  stencilBits: gl.getParameter(gl.STENCIL_BITS),
                  maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
                  maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
                  maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
                  maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
                  maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
                  maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                  maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
                  maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
                  maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
                  maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
                  aliasedLineWidthRange: describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)),
                  aliasedPointSizeRange: describeRange(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)),
                  maxViewportDimensions: describeRange(gl.getParameter(gl.MAX_VIEWPORT_DIMS)),
                  maxAnisotropy: getMaxAnisotropy(gl),
                  extensions: gl.getSupportedExtensions().sort().toString(),
                  vertexShaderBestPrecision: turnObjToArray(getShader(gl.VERTEX_SHADER, gl)),
                  fragmentShaderBestPrecision: turnObjToArray(getShader(gl.FRAGMENT_SHADER, gl)),
                  fragmentShaderFloatIntPrecision: getFloatIntPrecision(gl)
                }), gl.getSupportedExtensions().indexOf("WEBGL_debug_renderer_info") !== -1 ? gl.getParameter(gl.getExtension("WEBGL_debug_renderer_info").UNMASKED_VENDOR_WEBGL) + " " + gl.getParameter(gl.getExtension("WEBGL_debug_renderer_info").UNMASKED_RENDERER_WEBGL) : init].join(",");
              }
            }
          }
          return "Supported. Disabled";
        }
        return "WebGL not supported";
      },
      httpHeaders: () => {
        // TODO needs to pass a parameter
        return new Promise(function(resolve, reject){
          get(HTTP_HEADERS_URL).then((response) => {
            const httpHeaders = JSON.parse(response);
            const res = {};
            res.connectionHttp = httpHeaders.connection;
            res.userAgentHttp = httpHeaders["user-agent"];
            res.pragmaHttp = httpHeaders.pragma;
            res.acceptHttp = httpHeaders.accept;
            res.languageHttp = httpHeaders["accept-language"];

            resolve(res);
          }, (error) => {
            reject(error);
          })
        });
      }
    },
    os : {
      name: () => {
        let value = uaParser.getOS();
        if (value.name === "Windows") {
          return value.name + " " + value.version;
        }
        return value.name;
      },
      platform: () => {
        if (navigator.platform) {
          return navigator.platform;
        }
        return UNKNOWN;
      },
      languages: () => {
        if (navigator.languages) {
          return navigator.languages.join("~~");
        }
        return UNKNOWN;
      },
      processors: () => {
        if (navigator.cpuClass) {
          return navigator.cpuClass;
        }
        return UNKNOWN;
      },
      hardwareConcurrency: () => {
        if (navigator.hardwareConcurrency) {
          return navigator.hardwareConcurrency;
        }
        return UNKNOWN;
      },
      resolution: () => {
        return [screen.width, screen.height, screen.availWidth, screen.availHeight].join(",");
      },
      colorDepth: () => {
        return screen.colorDepth || -1;
      },
      screenDensity: () => {
        return (window.devicePixelRatio || "") + (window.screen.deviceXDPI ? window.screen.deviceXDPI + "x" + window.screen.deviceYDPI : "");
      },
      oscpu: () => {
        if (navigator.oscpu) {
          return navigator.oscpu;
        }
        return UNKNOWN;
      },
      touchScreen: () => {
        let maxTouchPoints = 0;
        let touchEvent = false;
        if (typeof navigator.maxTouchPoints !== "undefined") {
          maxTouchPoints = navigator.maxTouchPoints;
        } else if (typeof navigator.msMaxTouchPoints !== "undefined") {
          maxTouchPoints = navigator.msMaxTouchPoints;
        }
        try {
          document.createEvent("TouchEvent");
          touchEvent = true;
        } catch (_) {}

        const touchStart = "ontouchstart" in window;
        return [maxTouchPoints, touchEvent, touchStart].join(";");
      },
      videoCard: () => {
        const canvas = document.createElement('canvas');
        var ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        let webGLVendor, webGLRenderer;
        if (ctx.getSupportedExtensions().indexOf("WEBGL_debug_renderer_info") >= 0) {
          webGLVendor = ctx.getParameter(ctx.getExtension('WEBGL_debug_renderer_info').UNMASKED_VENDOR_WEBGL);
          webGLRenderer = ctx.getParameter(ctx.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
        } else {
          webGLVendor = "Not supported";
          webGLRenderer = "Not supported";
        }
        return [webGLVendor, webGLRenderer].join(";;;");
      },
      multimediaDevices: () => {
        return new Promise((resolve) => {
          const deviceToCount = {
            "audiooutput": 0,
            "audioinput": 0,
            "videoinput": 0
          };

          if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
              let name;
              for (let i = 0; i < devices.length; i++) {
                name = [devices[i].kind];
                deviceToCount[name] = deviceToCount[name] + 1;
              }
              resolve({
                speakers: deviceToCount.audiooutput,
                micros: deviceToCount.audioinput,
                webcams: deviceToCount.videoinput
              });
            });
          } else {
            resolve({
              speakers: 0,
              micros: 0,
              webcams: 0
            });
          }
        });
      }
    },
    scanner: {
      productSub: () => {
        return navigator.productSub;
      },
      navigatorPrototype: () => {
        let obj = window.navigator;
        const protoNavigator = [];
        do Object.getOwnPropertyNames(obj).forEach((name) => {
          protoNavigator.push(name);
        });
        while (obj = Object.getPrototypeOf(obj));

        let res;
        const finalProto = [];
        protoNavigator.forEach((prop) => {
          const objDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(navigator), prop);
          if (objDesc !== undefined) {
            if (objDesc.value !== undefined) {
              res = objDesc.value.toString();
            } else if (objDesc.get !== undefined) {
              res = objDesc.get.toString();
            }
          } else {
            res = "";
          }
          finalProto.push(prop + "~~~" + res);
        });
        return finalProto.join(";;;");
      },
      etsl: () => {
        return eval.toString().length;
      },
      showModal: () => {
        return typeof window.showModalDialog !== "undefined";
      },
      sendBeacon: () => {
        return "sendBeacon" in navigator;
      },
      spawn: () => {
        return typeof window.spawn !== "undefined";
      },
      emit: () => {
        return typeof window.emit !== "undefined";
      },
      buffer: () => {
        return typeof window.Buffer !== "undefined";
      },
      timezoneOffsetDesc: () => {
        try {
          return Object.getOwnPropertyDescriptor(Date.prototype, "getTimezoneOffset").value.toString();
        } catch (e) {
          return "Error";
        }
      },
      screenDesc: () => {
        try {
          return Object.getOwnPropertyDescriptor(Object.getPrototypeOf(screen), "width").get.toString();
        } catch (e) {
          return "Error";
        }
      },
      historyDesc: () => {
        try {
          return Object.getOwnPropertyDescriptor(window, "History").value.toString()
        } catch (e) {
          return "Error";
        }
      },
      bindDesc: () => {
        try {
          return Object.getOwnPropertyDescriptor(Function.prototype, "bind").value.toString();
        } catch (e) {
          return "Error";
        }
      },
      canvasDesc: () => {
        try {
          return Object.getOwnPropertyDescriptor(window.HTMLCanvasElement.prototype, "toDataURL").value.toString();
        } catch (e) {
          return "Error";
        }
      },
      awesomium: () => {
        return !!window.awesomium;
      },
      ghostJS: () => {
        return !!window.fmget_targets;
      },
      nightmareJS: () => {
        return !!window.__nightmare;
      },
      fmget: () => {
        return !!window.fmget_targets;
      },
      webDriver: () => {
        return "webdriver" in window || "true" === document.getElementsByTagName("html")[0].getAttribute("webdriver");
      },
      seleniumIDE: () => {
        return !!window._Selenium_IDE_Recorder;
      },
      domAutomation: () => {
        return "domAutomation" in window || "domAutomationController" in window;
      },
      errorsGenerated: () => {
        const errors = [];
        try {
          azeaze + 3;
        } catch (e) {
          errors.push(e.message);
          errors.push(e.fileName);
          errors.push(e.lineNumber);
          errors.push(e.description);
          errors.push(e.number);
          errors.push(e.columnNumber);
          try {
            errors.push(e.toSource().toString());
          } catch (e) {
            errors.push(undefined);
          }
        }

        try {
          new WebSocket("itsgonnafail");
        } catch (e) {
          errors.push(e.toString());
        }
        return errors;
      },
      resOverflow: () => {
        let depth = 0;
        let errorMessage;
        let errorName;

        function inc() {
          try {
            depth++;
            inc();
          } catch (e) {
            errorMessage = e.message;
            errorName = e.name;
          }
        }

        inc();
        return [depth, errorName, errorMessage];
      },
      emoji: () => {
        const canvas = document.createElement("canvas");
        canvas.height = 60;
        canvas.width = 60;
        const canvasContext = canvas.getContext("2d");
        canvas.style.display = "inline";
        canvasContext.textBaseline = "alphabetic";
        canvasContext.font = "40pt no-real-font-123";
        canvasContext.fillText("\uD83E\uDD84", -5, 50);
        return canvas.toDataURL();
      },
      accelerometerUsed: () => {
        return new Promise((resolve) => {
          window.ondevicemotion = function (event) {
            if (event.accelerationIncludingGravity.x !== null) {
              return resolve(true);
            }
          };

          setTimeout(() => {
            return resolve(false);
          }, 200);
        });
      },
      mediaQueries: () => {
        return [
          window.matchMedia("(-moz-mac-graphite-theme: 1)").matches,
          window.matchMedia("(-moz-os-version: windows-xp)").matches,
          window.matchMedia("(-moz-os-version: windows-vista)").matches,
          window.matchMedia("(-moz-os-version: windows-win7)").matches,
          window.matchMedia("(-moz-os-version: windows-win8)").matches,
          window.matchMedia("(-moz-os-version: windows-win10)").matches
        ]
      }
    },
    geolocation: {
      timezone: () => {
        return new Date().getTimezoneOffset();
      },
      timezoneLocale: () => {
        // TODO maybe remove beginning of the function to keep only the part related to the timezone
        const d = new Date();
        let skip = d.getTimezoneOffset();
        d.setTime(0);
        let val;
        const value = 1E9;
        let locale = value.toLocaleString ? value.toLocaleString() + d.toLocaleString() : "";
        let ms = 0;
        // ms += nb of ms in a day
        for (; ms < 1769390779860; ms += 864E5) {
          d.setTime(ms);
          val = d.getTimezoneOffset();
          if (val !== skip) {
            locale += "" + val + Math.round(ms / 1E3);
            skip = val;
          }
        }
        return locale;
      }
    }
  };

  function get(url) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);
      req.onload = function() {
        if (req.status == 200) {
          resolve(req.response);
        }
        else {
          reject(Error(req.statusText));
        }
      };

      req.onerror = function(e) {
        reject(Error("Network Error"));
      };

      req.send();
    });
  }

  const addCustomFunction = function(category, name, options, f) {
    // TODO probably don't use default options
    DEFAULT_OPTIONS[category][name] = options;
    defaultAttributeToFunction[category][name] = f;
  };

  // TODO maybe hashing can be generalized, not only to 2 levels of depth
  const generateFingerprint = function (options) {
    return new Promise((resolve, reject) => {
      let attributeOptions;
      if(typeof options !== "object") {
        reject("options parameter needs to be an object");
      }

      if (options.name === "default"){
        attributeOptions = DEFAULT_OPTIONS;
        if(Object.keys(options.params).length > 0) {
          if(typeof options.params.httpHeadersURL === "string") {
            HTTP_HEADERS_URL = options.params.httpHeadersURL;
          } else {
            console.log("Call to HTTP Headers removed");
            delete attributeOptions["httpHeadersURL"];
          }
        } else {
          console.log("Call to HTTP Headers removed");
          delete attributeOptions.browser.httpHeaders;
        }
      }

      const promises = [];
      const fingerprint = {};

      Object.keys(attributeOptions).forEach((attribute) => {
        // attribute is either an object if it represents a category of the fingerprint
        // or a string if it represents an attribute at the root level of the fingerprint
        // TODO root attribute needs to be an object
        // If user doesn't want categories then he just has to create a fake category
        if (typeof attributeOptions[attribute] === "object") {
          fingerprint[attribute] = {};
          Object.keys(attributeOptions[attribute]).forEach((subPropertyName) => {
            if (attributeOptions[attribute][subPropertyName].isAsync) {
              promises.push(new Promise((resolve) => {
                defaultAttributeToFunction[attribute][subPropertyName]().then((val) => {
                  if(typeof val === "object" && attributeOptions[attribute][subPropertyName].unpack) {
                    // Flatten returned object to add its properties directly in category
                    Object.keys(val).forEach((retProp) => {
                      fingerprint[attribute][retProp] = val[retProp];
                      if(attributeOptions[attribute][subPropertyName].hash) {
                        fingerprint[attribute][retProp + HASH_SUFFIX] = hash.x64hash128(val[retProp].toString(), SEED);
                      }
                    });
                  } else {
                    fingerprint[attribute][subPropertyName] = val;
                    if(attributeOptions[attribute][subPropertyName].hash) {
                      let hashStr = "";
                      if(typeof val === "object") {
                        Object.keys(val).forEach((prop) => {
                          hashStr += val[prop].toString();
                        });
                      } else{
                        hashStr = val.toString();
                      }
                      fingerprint[attribute][subPropertyName + HASH_SUFFIX] = hash.x64hash128(hashStr, SEED);
                    }
                  }
                  return resolve();
                });
              }))
            } else {
              let returnVal = defaultAttributeToFunction[attribute][subPropertyName]();
              if(typeof returnVal === "object" && attributeOptions[attribute][subPropertyName].unpack) {
                Object.keys(returnVal).forEach((retProp) => {
                  fingerprint[attribute][retProp] = returnVal[retProp];
                  if(attributeOptions[attribute][subPropertyName].hash) {
                    fingerprint[attribute][retProp + HASH_SUFFIX] = hash.x64hash128(val[retProp].toString(), SEED);
                  }
                });
              } else {
                fingerprint[attribute][subPropertyName] = returnVal;
                if(attributeOptions[attribute][subPropertyName].hash) {
                  let hashStr = "";
                  if(typeof returnVal === "object") {
                    Object.keys(returnVal).forEach((prop) => {
                      hashStr += returnVal[prop].toString();
                    });
                  }else {
                    hashStr = returnVal.toString();
                  }
                  fingerprint[attribute][subPropertyName + HASH_SUFFIX] = hash.x64hash128(hashStr, SEED);
                }
              }
            }
          });
        }
      });

      return Promise.all(promises).then(() => {
        let hashStr = "";
        Object.keys(fingerprint).forEach((prop) => {
          // prop needs to be an object !
          if(prop !== "scanner") {
            // We remove scanner attributes from hash since their implementation may not be stable
            Object.keys(fingerprint[prop]).forEach((val) => {
              hashStr += fingerprint[prop][val];
            });
          }
        });

        fingerprint.hash = hash.x64hash128(hashStr);
        return resolve(fingerprint);
      });
    });
  };

  const filterToSave = function(fingerprint) {
    const fpFiltered = JSON.parse(JSON.stringify(fingerprint));
    Object.keys(fpFiltered).forEach((prop) => {
      // prop needs to be an object !
      Object.keys(fpFiltered[prop]).forEach((val) => {
        if(fpFiltered[prop].hasOwnProperty(val + HASH_SUFFIX)) {
          delete fpFiltered[prop][val];
        }
      });
    });
    return fpFiltered;
  };

  return {
    addCustomFunction: addCustomFunction,
    generateFingerprint: generateFingerprint,
    filterToSave: filterToSave
  };

})();

module.exports = fpCollect;

