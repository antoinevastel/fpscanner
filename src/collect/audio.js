"use strict";

var audio = (function () {
  var getAudioFingerprint = function() {
    var audioData = [];

    //Sum of buffer values
    var p1 = new Promise(function (resolve, reject) {
      var context;
      try {
        if (context = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100), !context) {
          audioData.push(0);
        }
        // Create oscillator
        const pxi_oscillator = context.createOscillator();
        pxi_oscillator.type = "triangle";
        pxi_oscillator.frequency.value = 1e4;

        // Create and configure compressor
        const pxi_compressor = context.createDynamicsCompressor();
        pxi_compressor.threshold && (pxi_compressor.threshold.value = -50);
        pxi_compressor.knee && (pxi_compressor.knee.value = 40);
        pxi_compressor.ratio && (pxi_compressor.ratio.value = 12);
        pxi_compressor.reduction && (pxi_compressor.reduction.value = -20);
        pxi_compressor.attack && (pxi_compressor.attack.value = 0);
        pxi_compressor.release && (pxi_compressor.release.value = .25);

        // Connect nodes
        pxi_oscillator.connect(pxi_compressor);
        pxi_compressor.connect(context.destination);

        // Start audio processing
        pxi_oscillator.start(0);
        context.startRendering();
        context.oncomplete = function (evnt) {
          try {
            audioData.push(0);
            var sha1 = CryptoJS.algo.SHA1.create();
            for (var i = 0; i < evnt.renderedBuffer.length; i++) {
              sha1.update(evnt.renderedBuffer.getChannelData(0)[i].toString());
            }
            const hash = sha1.finalize();
            audioData.push(hash.toString(CryptoJS.enc.Hex));
            var tmp = [];
            for (var i = 4500; 5e3 > i; i++) {
              tmp.push(Math.abs(evnt.renderedBuffer.getChannelData(0)[i]));
            }
            pxi_compressor.disconnect();
            audioData.push(tmp.join("~"));
            resolve();
          } catch (u) {
            audioData.push("0");
            resolve();
          }
        }
      } catch (u) {
        audioData.push(0);
        resolve();
      }
    });

  // End PXI fingerprint

    function a(a, b, c) {
      for (var d in b) "dopplerFactor" === d || "speedOfSound" === d || "currentTime" ===
      d || "number" !== typeof b[d] && "string" !== typeof b[d] || (a[(c ? c : "") + d] = b[d]);
      return a
    }

    var p2 = new Promise(function (resolve, reject) {
      try {
        var nt_vc_context = window.AudioContext || window.webkitAudioContext;
        if ("function" !== typeof nt_vc_context) audioData.push("Not available");
        else {
          var f = new nt_vc_context,
              d = f.createAnalyser();
          var tmp = a({}, f, "ac-");
          tmp = a(tmp, f.destination, "ac-");
          tmp = a(tmp, f.listener, "ac-");
          var res = a(tmp, d, "an-");
          var arr = [], i;
          for (i in res) {
            if (res.hasOwnProperty(i)) {
                arr.push(res[i]);
            }
          }
          arr.sort(function (x, b) {
            return x[0] > b[0] ? 1 : -1;
          })
          audioData.push(arr.join("~"));
        }
      } catch (g) {
        audioData.push(0)
      }
      resolve();
    });

    var cc_output = [];

    var p3 = new Promise(function (resolve, reject) {
      var audioCtx = new (window.AudioContext || window.webkitAudioContext),
          oscillator = audioCtx.createOscillator(),
          analyser = audioCtx.createAnalyser(),
          gain = audioCtx.createGain(),
          scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);


      gain.gain.value = 0; // Disable volume
      oscillator.type = "triangle"; // Set oscillator to output triangle wave
      oscillator.connect(analyser); // Connect oscillator output to analyser input
      analyser.connect(scriptProcessor); // Connect analyser output to scriptProcessor input
      scriptProcessor.connect(gain); // Connect scriptProcessor output to gain input
      gain.connect(audioCtx.destination); // Connect gain output to audiocontext destination

      scriptProcessor.onaudioprocess = function (bins) {
        bins = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(bins);
        for (var i = 0; i < bins.length; i = i + 1) {
          cc_output.push(bins[i]);
        }
        analyser.disconnect();
        scriptProcessor.disconnect();
        gain.disconnect();
        audioData.push(cc_output.slice(0, 30).join("~"));
        resolve();
      };

      oscillator.start(0);
    });

  // Performs a hybrid of cc/pxi methods found above
    var hybrid_output = [];

    var p4 = new Promise(function (resolve, reject) {
      var audioCtx = new (window.AudioContext || window.webkitAudioContext),
          oscillator = audioCtx.createOscillator(),
          analyser = audioCtx.createAnalyser(),
          gain = audioCtx.createGain(),
          scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

      // Create and configure compressor
      var compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold && (compressor.threshold.value = -50);
      compressor.knee && (compressor.knee.value = 40);
      compressor.ratio && (compressor.ratio.value = 12);
      compressor.reduction && (compressor.reduction.value = -20);
      compressor.attack && (compressor.attack.value = 0);
      compressor.release && (compressor.release.value = .25);

      gain.gain.value = 0; // Disable volume
      oscillator.type = "triangle"; // Set oscillator to output triangle wave
      oscillator.connect(compressor); // Connect oscillator output to dynamic compressor
      compressor.connect(analyser); // Connect compressor to analyser
      analyser.connect(scriptProcessor); // Connect analyser output to scriptProcessor input
      scriptProcessor.connect(gain); // Connect scriptProcessor output to gain input
      gain.connect(audioCtx.destination); // Connect gain output to audiocontext destination

      scriptProcessor.onaudioprocess = function (bins) {
        bins = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(bins);
        for (var i = 0; i < bins.length; i = i + 1) {
            hybrid_output.push(bins[i]);
        }
        analyser.disconnect();
        scriptProcessor.disconnect();
        gain.disconnect();

        audioData.push(hybrid_output.slice(0, 30).join("~"));
        resolve();
      };

      oscillator.start(0);
    });

    return Promise.all([p1, p2, p3, p4]).then(function () {
      return audioData.join(";;");
    });
  }

  return getAudioFingerprint;
})();

module.exports = audio;
