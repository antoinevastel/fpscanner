"use strict";


// TODO say if attribute needs to be hashed or stored in plain text
var fpscanner = (function () {
  const parser = require('ua-parser-js');
  const uaParser = new parser.UAParser();
  uaParser.setUA(navigator.userAgent);

  const UNKNOWN = "unknown";
  // Fingerprints can be either a list of attributes or attributes
  // structured by categories
  // It is only possible to have at most one level of category
  var defaultOptions = {
    "all": [
      {
        "browser": [
          /*"canvas",*/
          //"canvasBis", // Can be seen as custom canvas function
          //"audio",
          //"fonts",
          "plugins",
          //"mimeTypes",
          /*"webGL",*/
          "userAgent",
          /*"dnt",*/
          "adBlock",
          "cookies",
          "name",
          "version",
          "maths",
          //"productSub",
          //"navigatorPrototype",
          "localStorage",
        ]
      },
      {
        "os": [
          "platform"
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
    var fingerprint = {};
    defaultOptions.all.forEach((attribute) => {
      // attribute is either an object if it represents a category of the fingerprint
      // or a string if it represents an attribute at the root level of the fingerprint
      if(typeof attribute === "string") {
        fingerprint[attribute] = defaultAttributeToFunction[attribute]();
      } else {
        var subPropertyName = Object.keys(attribute)[0];
        fingerprint[subPropertyName] = {};
        attribute[subPropertyName].forEach((subAttribute) => {
          fingerprint[subPropertyName][subAttribute] = defaultAttributeToFunction[subPropertyName][subAttribute]();
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
