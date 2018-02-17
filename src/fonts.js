"use strict";

var fonts = (function () {
  var fontsToTest = ['Arial Narrow Gras', 'NewJumja', 'TSCu', 'Times Italique', 'CL', 'Latin Modern Roman Dunhill', 'Latin Modern Roman Unslanted', 'Helvetica Gras', 'Times New Roman Italique', 'Arial Narrow Gras Italique', 'MotoyaG04Mincho', 'Ume Gothic S4', 'SignPainter', 'Bordeaux Roman Bold LET', 'Ume Gothic O5', 'Latin Modern Mono Light Cond', 'Bell Gothic Std Light', 'pcf', 'boot', 'Latin Modern Mono', 'Arial Gras Italique', 'Police système Moyen', 'Letter Gothic', 'IV50', 'Trebuchet MS Gras Italique', 'Kohinoor Devanagari', 'Times Gras', 'cursor', 'Latin Modern Sans Demi Cond', 'Courier Gras', 'MSung B5HK', 'Police système Intense', 'Police système Gras', 'Courier New Gras Italique', 'Apple Emoji couleur', 'SAPDings', 'Coronet', 'Latin Modern Mono Prop', 'Georgia Gras Italique', 'Times Gras italique', 'Klee', 'Orange LET', 'TAMu', 'Ume Gothic S5', 'Ruach LET', 'Ume P Gothic O5', 'Arial Italique', 'ITF Devanagari', 'Nuosu SIL', 'Wolf', 'Trebuchet MS Gras', 'TG Pagella Math', 'Police système Léger', 'HolidayPi BT', 'Ro', 'Westwood LET', 'Latin Modern Mono Caps', 'Charlie', 'Ume P Gothic S4', 'Yuanti TC', 'Bradley Hand', 'Times New Roman Gras', 'HCR Batang', 'Ume P Mincho', 'Trebuchet MS Italique', 'msam10', 'SchoolHouse Printed A', 'ParkAvenue BT', 'stmary10', 'Earth', 'Tlwg Typewriter', 'Latin Modern Roman Demi', 'W', 'Courier New Italique', 'eufm10', 'Comic Sans MS Gras', 'Lohit Odia', 'Brush Script MT Italique', 'Bodoni 72', 'Arial Black Normal', 'Police système Courant', 'John Handy LET', 'Highlight LET', 'Kievit Offc Pro', 'Verdana Italique', 'AR PL UMing TW', 'Victorian LET', 'Ume Mincho S3', 'Laksaman', 'Ume Mincho', 'Smudger LET', 'Phosphate', 'La Bamba LET', 'Arial Gras', 'Bickham Script Pro Regular', 'Police système Italique', 'SAPIcons', 'Droid Sans Devanagari', 'Clarendon', 'Princetown LET', 'Odessa LET', 'Police système', 'Ume Gothic C4', 'University Roman LET', 'Ki', 'TG Termes Math', 'Latin Modern Roman Slanted', 'Quixley LET', 'Verdana Gras Italique', 'Times New Roman Gras Italique', 'Synchro LET', 'Georgia Gras', 'Blackletter686 BT', 'wasy10', '36p Kana', 'AR PL UMing TW MBE', 'HCR Dotum', 'Eeyek Unicode', 'rsfs10', 'MotoyaG04GothicMono', 'Scruff LET', 'Gabo Drive', 'Latin Modern Roman Caps', 'One Stroke Script LET', 'Rage Italic LET', 'Lohit Gurmukhi', 'Latin Modern Mono Slanted', 'Arial monospaced for SAP', 'Bodoni 72 Oldstyle', 'MotoyaG04Gothic', 'Ume P Gothic C4', 'PingFang HK', 'Oxygen-Sans', 'Ume P Gothic', 'Khmer OS Content', 'Tsukushi A Round Gothic', 'MSung GB18030', 'Latin Modern Sans Quotation', 'HyhwpEQ', 'Ume Gothic C5', 'Albertus Medium', 'Broadway BT', 'Tlwg Mono', 'Calligraph421 BT', 'FixedSys', 'MisterEarl BT', 'Cataneo BT', 'Pump Demi Bold LET', 'Latin Modern Mono Prop Light', 'Tahoma Gras', 'Marigold', 'Nimbus Sans Narrow', 'Microsoft Yahei', 'Bodoni 72 Smallcaps', 'SchoolHouse Cursive B', 'Mekanik LET', 'Montserrat SemiBold', 'Verdana Gras', 'Enigmatic Unicode', 'Ume Gothic', 'PingFang TC', 'Latin Modern Sans', 'URW Gothic', 'Bradley Hand Gras', 'WenQuanYi Zen Hei Sharp', 'PingFang SC', 'ITF Devanagari Marathi', 'Georgia Italique', 'Latin Modern Mono Light', 'P', 'Tiranti Solid LET', 'Garamond Premr Pro', 'Mona Lisa Solid ITC TT', 'Hiragino Sans', 'AR PL UMing HK', 'Virgo 01', 'AR PL UMing CN', 'Staccato222 BT', 'ori1Uni', 'Ume P Mincho S3', 'OldDreadfulNo7 BT', 'Latin Modern Roman', 'Milano LET', 'esint10', 'WST', 'IPT', 'Courier New Gras', 'Ume UI Gothic', 'Arial Narrow Italique', 'Fixed', 'msbm10', 'Ume P Gothic S5', 'Mishafi Gold', 'Police système Semi-gras', 'Noto Sans Emoji', 'Thonburi Gras', 'Ume UI Gothic O5', 'Roman SD', 'PakType Naqsh', 'Ostrich Sans Heavy', 'Ume P Gothic C5', 'BRK', 'MotoyaG04MinchoMono', 'Tsukushi B Round Gothic', 'IV25', '12x10'];
  function runFontsEnum() {
    return new Promise((resolve, reject) => {
      var baseFonts = ["monospace", "sans-serif", "serif"];
      var testString = "mmmmmmmmmmlli";
      var testSize = "72px";
      var h = document.getElementsByTagName("body")[0];

      // div to load spans for the base fonts
      var baseFontsDiv = document.createElement("div");

      // div to load spans for the fonts to detect
      var fontsDiv = document.createElement("div");

      var defaultWidth = {};
      var defaultHeight = {};

      // creates a span where the fonts will be loaded
      var createSpan = function () {
        var s = document.createElement("span");
        /*
         * We need this css as in some weird browser this
         * span elements shows up for a microSec which creates a
         * bad user experience
         */
        s.style.position = "absolute";
        s.style.left = "-9999px";
        s.style.fontSize = testSize;
        s.style.lineHeight = "normal";
        s.innerHTML = testString;
        return s;
      };

      var createSpanWithFonts = function (fontToDetect, baseFont) {
        var s = createSpan();
        s.style.fontFamily = "'" + fontToDetect + "'," + baseFont;
        return s;
      };

      var initializeBaseFontsSpans = function () {
        var spans = [];
        for (var index = 0, length = baseFonts.length; index < length; index++) {
          var s = createSpan();
          s.style.fontFamily = baseFonts[index];
          baseFontsDiv.appendChild(s);
          spans.push(s);
        }
        return spans;
      };

      var initializeFontsSpans = function () {
        var spans = {};
        for (var i = 0, l = fontsToTest.length; i < l; i++) {
          var fontSpans = [];
          for (var j = 0, numDefaultFonts = baseFonts.length; j < numDefaultFonts; j++) {
            var s = createSpanWithFonts(fontsToTest[i], baseFonts[j]);
            fontsDiv.appendChild(s);
            fontSpans.push(s);
          }
          spans[fontsToTest[i]] = fontSpans;
        }
        return spans;
      };

      var isFontAvailable = function (fontSpans) {
        var detected = false;
        for (var i = 0; i < baseFonts.length; i++) {
          detected = (fontSpans[i].offsetWidth !== defaultWidth[baseFonts[i]] || fontSpans[i].offsetHeight !== defaultHeight[baseFonts[i]]);
          if (detected) {
            return detected;
          }
        }
        return detected;
      };

      var baseFontsSpans = initializeBaseFontsSpans();

      // add the spans to the DOM
      h.appendChild(baseFontsDiv);

      // get the default width for the three base fonts
      for (var index = 0, length = baseFonts.length; index < length; index++) {
        defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth; // width for the default font
        defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight; // height for the default font
      }

      // create spans for fonts to detect
      var fontsSpans = initializeFontsSpans();

      // add all the spans to the DOM
      h.appendChild(fontsDiv);

      // check available fonts
      var available = [];
      for (var i = 0, l = fontsToTest.length; i < l; i++) {
        if (isFontAvailable(fontsSpans[fontsToTest[i]])) {
          available.push(fontsToTest[i] + "--true");
        } else {
          available.push(fontsToTest[i] + "--false");
        }
      }

      // remove spans from DOM
      h.removeChild(fontsDiv);
      h.removeChild(baseFontsDiv);
      return resolve(available);
    });
  }
  return runFontsEnum;
})();

module.exports = fonts;
