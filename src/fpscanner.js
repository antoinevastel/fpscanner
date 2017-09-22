"use strict";

// TODO separate collect code from scanner code so that scanner can be placed on serverside
// TODO say if attribute needs to be hashed or stored in plain text
const fpscanner = (function () {
  const parser = require('ua-parser-js');
  const uaParser = new parser.UAParser();
  uaParser.setUA(navigator.userAgent);

  const getAudio = require('./audio.js');
  const getFonts = require('./fonts.js');

  const UNKNOWN = "unknown";
  // Fingerprints can be either a list of attributes or attributes
  // structured by categories
  // It is only possible to have at most one level of category
  const option = function(name, hash, isAsync) {
    return {name: name, hash: hash, isAsync: isAsync};
  }

  // TODO add geolocation
  const defaultOptions = {
    "all": [
      {
        "browser": [
          //"canvasBis", // Can be seen as custom canvas function
          option("canvas", false, false),
          option("audio", false, true),
          option("fonts", false, true),
          option("plugins", false, false),
          option("mimeTypes", false, false),
          option("webGL", false, false),
          option("userAgent", false, false),
          option("dnt", false, false),
          option("adBlock", false, false),
          option("cookies", false, false),
          option("name", false, false),
          option("version", false, false),
          option("maths", false, false),
          option("localStorage", false, false),
        ]
      },
      {
        "os": [
          option("name", false, false),
          option("platform", false, false),
          option("languages", false, false),
          option("processors", false, false),
          option("hardwareConcurrency", false, false),
          option("resolution", false, false),
          option("colorDepth", false, false),
          option("screenDensity", false, false),
          option("oscpu", false, false),
          option("touchScreen", false, false),
          option("videoCard", false, false),
          option("multimediaDevices", false, true),
        ],
      },
      {
        "network": [
          option("ipAddresses", false, true)
        ]
      },
      {
        "geolocation": [
          option("timezone", false, false),
          option("timezoneLocale", false, false),
        ]
      },
      {
        "scanner": [
          option("productSub", false, false),
          option("navigatorPrototype", false, false),
          option("etsl", false, false),
          option("showModal", false, false),
          option("sendBeacon", false, false),
          option("spawn", false, false),
          option("emit", false, false),
          option("buffer", false, false),
          option("timezoneOffsetDesc", false, false),
          option("screenDesc", false, false),
          option("historyDesc", false, false),
          option("bindDesc", false, false),
          option("canvasDesc", false, false),

          option("awesomium", false, false),
          option("ghostJS", false, false),
          option("nightmareJS", false, false),
          option("fmget", false, false),
          option("webDriver", false, false),
          option("seleniumIDE", false, false),
          option("domAutomation", false, false),

          option("errorsGenerated", false, false),
          option("resOverflow", false, false),
          option("emoji", false, false),
          option("accelerometerUsed", false, true)
        ]
      }
    ]
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
        if (navigator.doNotTrack) {
          return navigator.doNotTrack;
        } else if (navigator.msDoNotTrack) {
          return navigator.msDoNotTrack;
        } else if (window.doNotTrack) {
          return window.doNotTrack;
        }
        return UNKNOWN;
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
              resolve(deviceToCount.audiooutput+","+deviceToCount.audioinput+","+deviceToCount.videoinput);
            });
          } else {
            resolve(deviceToCount);
          }
        });
      }
    },
    network: {
      ipAddresses: () => {
        function getIPs(callback) {
          var ip_dups = {};
          var RTCPeerConnection = window.RTCPeerConnection ||
            window.mozRTCPeerConnection ||
            window.webkitRTCPeerConnection;
          var mediaConstraints = {
            optional: [{RtpDataChannels: true}]
          };
          var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};
          //construct a new RTCPeerConnection
          var pc = new RTCPeerConnection(servers, mediaConstraints);

          function handleCandidate(candidate) {
            //match just the IP address
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
            var ip_addr = ip_regex.exec(candidate)[1];
            //remove duplicates
            if (ip_dups[ip_addr] === undefined) {
              callback(ip_addr);
            }
            ip_dups[ip_addr] = true;
          }

          //listen for candidate events
          pc.onicecandidate = (ice) => {
            //skip non-candidate events
            if (ice.candidate) {
              handleCandidate(ice.candidate.candidate);
            }
          };
          //create a bogus data channel
          pc.createDataChannel("");
          //create an offer sdp
          pc.createOffer((result) => {
            //trigger the stun server request
            pc.setLocalDescription(result, () => {}, () => {});
          }, () => {});
          setTimeout(() => {
            //read candidate info from local description
            const lines = pc.localDescription.sdp.split('\n');
            lines.forEach((line) => {
              if (line.indexOf('a=candidate:') === 0) {
                handleCandidate(line);
              }
            });
          }, 1000);
        }

        return new Promise((resolve) => {
          const network = {};
          getIPs((ip) => {
            //local IPs
            if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
              network.local = ip;
              return resolve(network);
            }
            //IPv6 addresses
            else if (ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/)) {
              network.ipv6 = ip;
              return resolve(network);
            }
            //assume the rest are public IPs
            else {
              network.public = ip;
              return resolve(network);
            }
          });
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
          if (objDesc != undefined) {
            if (objDesc.value != undefined) {
              res = objDesc.value.toString();
            } else if (objDesc.get != undefined) {
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
        return "webdriver" in window || "true" == document.getElementsByTagName("html")[0].getAttribute("webdriver");
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

  const generateFingerprint = function () {
    return new Promise((resolve) => {
      const promises = [];
      const fingerprint = {};

      defaultOptions.all.forEach((attribute) => {
        // attribute is either an object if it represents a category of the fingerprint
        // or a string if it represents an attribute at the root level of the fingerprint
        if (typeof attribute === "string") {
          // TODO root attribute needs to be adapted they will also be object
          // Maybe useless, the solution is to create a single fake category
          fingerprint[attribute] = defaultAttributeToFunction[attribute]();
        } else {
          const subPropertyName = Object.keys(attribute)[0];
          fingerprint[subPropertyName] = {};
          attribute[subPropertyName].forEach((subAttribute) => {
            if (subAttribute.isAsync) {
              promises.push(new Promise((resolve) => {
                defaultAttributeToFunction[subPropertyName][subAttribute.name]().then((val) => {
                  fingerprint[subPropertyName][subAttribute.name] = val;
                  return resolve(val);
                });
              }))
            } else {
              fingerprint[subPropertyName][subAttribute.name] = defaultAttributeToFunction[subPropertyName][subAttribute.name]();
            }
          });
        }
      });

      return Promise.all(promises).then((val) => {
        // TODO do all the things like hash etc
        return resolve(fingerprint);
      });
    });
  };

  return {
   generateFingerprint: generateFingerprint
 };

})();

module.exports = fpscanner;
