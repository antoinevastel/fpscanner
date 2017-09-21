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
          //"adBlock",
          //"cookies",
          "name",
          "version",
          //"maths",
          //"productSub",
          //"navigatorPrototype",
          /*"localStorage",*/
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
