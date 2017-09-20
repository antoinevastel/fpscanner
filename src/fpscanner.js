"use strict";

var fpscanner = (function () {
  const UNKNOWN = "unknown";

  var defaultOptions = {
    "all": [
      "userAgent",
      "platform"
    ]
  }

  var attributeToFunction = {
    "userAgent": function() {
      return navigator.userAgent;
    },
    "platform": function() {
      if (navigator.platform) {
        return navigator.platform;
      }
      return UNKNOWN;
    }
  }

  var generateFingerprint = function() {
    var fingerprint = {};
    defaultOptions.all.forEach(function(attribute) {
      fingerprint[attribute] = attributeToFunction[attribute]();
    });
    return fingerprint;
  };

 return {
   generateFingerprint: generateFingerprint
 };

})();

module.exports = fpscanner;
