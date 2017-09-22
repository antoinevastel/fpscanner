"use strict";


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
  const defaultOptions = {
    "all": [
      {
        "browser": [
          //"canvasBis", // Can be seen as custom canvas function
          {
            name: "canvas",
            hash: false,
            isAsync: false
          },
          {
            name: "audio",
            hash: false,
            isAsync: true,
          },
          {
            name: "fonts",
            hash: false,
            isAsync: true
          },
          {
            name: "plugins",
            hash: false,
            isAsync: false
          },
          {
            name: "mimeTypes",
            hash: false,
            isAsync: false
          },
          {
            name: "webGL",
            hash: false,
            isAsync: false
          },
          {
            name: "userAgent",
            hash: false,
            isAsync: false
          },
          {
            name: "dnt",
            hash: false,
            isAsync: false
          },
          {
            name: "adBlock",
            hash: false,
            isAsync: false
          },
          {
            name: "cookies",
            hash: false,
            isAsync: false
          },
          {
            name: "name",
            hash: false,
            isAsync: false
          },
          {
            name: "version",
            hash: false,
            isAsync: false
          },
          {
            name: "maths",
            hash: false,
            isAsync: false
          },
          //"productSub", // move to a scanner part
          //"navigatorPrototype",
          {
            name: "localStorage",
            hash: false,
            isAsync: false
          }
        ]
      },
      {
        "os": [
          {
            name: "platform",
            hash: false,
            isAsync: false
          }
        ],
      }
    ]
  };

  const defaultAttributeToFunction = {
    browser: {
      userAgent: function() {
        return navigator.userAgent;
      },
      plugins: function() {
        var pluginsRes = [];
        var plugins = [];
        for(var i = 0; i < navigator.plugins.length; i++) {
          var plugin = navigator.plugins[i];
          var pluginStr = [plugin.name, plugin.description, plugin.filename, plugin.version].join("::");
          var mimeTypes = [];
          Object.keys(plugin).forEach((mt) => {
            mimeTypes.push([plugin[mt].type, plugin[mt].suffixes, plugin[mt].description].join("~"));
          });
          mimeTypes = mimeTypes.join(",");
          pluginsRes.push(pluginStr + "__" + mimeTypes);
        }
        return pluginsRes.join(";;;");
      },
      name: function() {
        return uaParser.getBrowser().name;
      },
      version: function() {
        return uaParser.getBrowser().version;
      },
      maths: function() {
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
          var y = Math.pow(Math.abs(x), 1 / 3);
          return x < 0 ? -y : y;
        }

        function cosh(x) {
          var y = Math.exp(x);
          return (y + 1 / y) / 2;
        }

        function expm1(x) {
          return Math.exp(x) - 1;
        }

        function log1p(x) {
          return Math.log(1 + x);
        }

        function sinh(x) {
          var y = Math.exp(x);
          return (y - 1 / y) / 2;
        }

        function tanh(x) {
          if (x === Infinity) {
              return 1;
          } else if (x === -Infinity) {
              return -1;
          } else {
              var y = Math.exp(2 * x);
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
      adBlock: function() {
        var ads = document.createElement("div");
        ads.innerHTML = "&nbsp;";
        ads.className = "adsbox";
        var result = false;
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
      cookies: function() {
        return window.navigator.cookieEnabled ? "yes" : "no";
      },
      localStorage: function() {
        try {
          localStorage.fp = "test";
        } catch (ex) {}

        try {
          var domLocalStorage = "";
          if (localStorage.fp == "test") {
            domLocalStorage = "yes";
          } else {
            domLocalStorage = "no";
          }
        } catch (ex) {
          domLocalStorage = "no";
        }
        return domLocalStorage;
      },
      canvas: function() {
        var canvas = document.createElement("canvas");
        canvas.height = 60;
        canvas.width = 400;
        var canvasContext = canvas.getContext("2d");
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
      dnt: function() {
        if (navigator.doNotTrack) {
          return navigator.doNotTrack;
        } else if (navigator.msDoNotTrack) {
          return navigator.msDoNotTrack;
        } else if (window.doNotTrack) {
          return window.doNotTrack;
        }
        return UNKNOWN;
      },
      mimeTypes : function() {
        var mimeTypes = [];
        for (var i = 0; i < navigator.mimeTypes.length; i++) {
          var mt = navigator.mimeTypes[i];
          mimeTypes.push([mt.description, mt.type, mt.suffixes].join("~~"));
        }
        return mimeTypes.join(";;");
      },
      fonts: getFonts,
      webGL: function() {
        function describeRange(opt_attributes) {
          return "[" + opt_attributes[0] + ", " + opt_attributes[1] + "]";
        }

        function getMaxAnisotropy(gl) {
          var hasMembers;
          var e = gl.getExtension("EXT_texture_filter_anisotropic") || (gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic"));
          return e ? (hasMembers = gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT), hasMembers || (hasMembers = 2), hasMembers) : null;
        }

        function formatPower(exponent, recurring) {
          return recurring ? "" + Math.pow(2, exponent) : "2^" + exponent;
        }

        function getPrecisionDescription(precision, recurring) {
          return "[-" + formatPower(precision.rangeMin, recurring) + ", " + formatPower(precision.rangeMax, recurring) + "] (" + precision.precision + (recurring ? " bit mantissa" : "") + ")";
        }

        function getShader(shaderType, gl) {
          var high = gl.getShaderPrecisionFormat(shaderType, gl.HIGH_FLOAT);
          var low = gl.getShaderPrecisionFormat(shaderType, gl.MEDIUM_FLOAT);
          return {
            High: getPrecisionDescription(high, 1),
            Medium: getPrecisionDescription(low, 1),
            Low: getPrecisionDescription(gl.getShaderPrecisionFormat(shaderType, gl.LOW_FLOAT), 1),
            Best: getPrecisionDescription(high.precision ? high : low, 0)
          };
        }

        function getFloatIntPrecision(gl) {
          var high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
          return (high.precision ? "highp/" : "mediump/") + (high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT) && high.rangeMax ? "highp" : "lowp");
        }

        function isPowerOfTwo(x) {
          return x && 0 === (x & x - 1);
        }

        function getAngle(gl) {
          var lineWidthRange = describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE));
          var a = "Win32" === navigator.platform && ("Internet Explorer" !== gl.getParameter(gl.RENDERER) && lineWidthRange === describeRange([1, 1]));
          return a ? isPowerOfTwo(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)) && isPowerOfTwo(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)) ? 2 : 1 : 0;
        }

        function turnObjToArray(map) {
          var bProperties = [];
          var letter;
          for (letter in map) {
            bProperties.push([letter, map[letter]]);
          }
          return bProperties.sort().toString();
        }

        if (window.WebGLRenderingContext) {
          var gl;
          var cur;
          var i = 4;
          var test_canvas = window.document.createElement("canvas");
          var names = ["webkit-3d", "moz-webgl", "experimental-webgl", "webgl"];
          for (; i--;) {
            {
                if ((gl = test_canvas.getContext(cur = names[i])) && "function" == typeof gl.getParameter) {
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
      platform: function() {
        if (navigator.platform) {
          return navigator.platform;
        }
        return UNKNOWN;
      }
    }
  };

  var generateFingerprint = function() {
    return new Promise((resolve, reject) => {
      var promises = [];
      var fingerprint = {};

      defaultOptions.all.forEach((attribute) => {
        // attribute is either an object if it represents a category of the fingerprint
        // or a string if it represents an attribute at the root level of the fingerprint
        if(typeof attribute === "string") {
          // TODO root attribute needs to be adapted they will also be object
          fingerprint[attribute] = defaultAttributeToFunction[attribute]();
        } else {
          var subPropertyName = Object.keys(attribute)[0];
          fingerprint[subPropertyName] = {};
          attribute[subPropertyName].forEach((subAttribute) => {
            if(subAttribute.isAsync) {
              promises.push(new Promise((resolve, reject) => {
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

      return Promise.all(promises).then(() => {
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
