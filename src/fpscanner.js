"use strict";


// TODO say if attribute needs to be hashed or stored in plain text
var fpscanner = (function () {
  const parser = require('ua-parser-js');
  const uaParser = new parser.UAParser();
  uaParser.setUA(navigator.userAgent);

  const getAudio = require('./audio.js');

  const UNKNOWN = "unknown";
  // Fingerprints can be either a list of attributes or attributes
  // structured by categories
  // It is only possible to have at most one level of category
  var defaultOptions = {
    "all": [
      {
        "browser": [
          {
            name: "canvas",
            hash: false,
            isAsync: false
          },
          //"canvasBis", // Can be seen as custom canvas function
          {
            name: "audio",
            hash: false,
            isAsync: true,
          },
          //"fonts",
          {
            name: "plugins",
            hash: false,
            isAsync: false
          },
          //"mimeTypes",
          /*"webGL",*/
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

  var defaultAttributeToFunction = {
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
          // TODO needs to be adapted depending on sync/async/
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
    return fingerprint;
  };

 return {
   generateFingerprint: generateFingerprint
 };

})();

module.exports = fpscanner;
