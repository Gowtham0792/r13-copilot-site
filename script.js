/*
 * R13 Copilot showcase site.
 *
 * Two small, restrained effects:
 * 1. An ambient canvas "ABS control cycle" readout in the hero — a
 *    two-trace chart shaped like a real ABS test-rig plot: wheel speed
 *    (V) decaying in a stepped curve with brief intervention notches on
 *    top, brake-line pressure (P) sawtoothing as the valve cycles below
 *    it. Looping/ambient, not a claim of real live telemetry.
 * 2. Scroll-revealed spec cards (fade + rise) via GSAP ScrollTrigger.
 */

(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- ambient ABS control-cycle chart ----
  var canvas = document.getElementById("waveform");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var CYCLE = 1400; // px of "x" one full loop covers before repeating
    var t = 0;

    // Wheel-speed trace: an overall downward ramp (the vehicle slowing
    // from a run-in speed toward a stop) with a handful of sharp, brief
    // notches layered on — each notch is a wheel-lock moment the ABS
    // catches and releases, matching the real shape of a v/t ABS trace.
    var notches = [0.14, 0.30, 0.44, 0.56, 0.66, 0.75, 0.83, 0.9];

    function vFrac(xf) {
      // xf: 0..1 progress through one cycle
      var base = 1 - xf * 0.92; // overall decay toward near-zero speed
      var dip = 0;
      for (var i = 0; i < notches.length; i++) {
        var d = xf - notches[i];
        if (d > 0 && d < 0.035) {
          dip -= (1 - d / 0.035) * 0.16;
        }
      }
      return Math.max(0.02, base + dip);
    }

    // Pressure trace: an asymmetric sawtooth (fast rise, sharp release)
    // that cycles faster than the notches above and tapers out as the
    // vehicle approaches a stop, same as a real ABS pressure-modulation
    // trace.
    function pFrac(xf) {
      var period = 0.052;
      var local = (xf % period) / period;
      var tooth = local < 0.72 ? local / 0.72 : 1 - (local - 0.72) / 0.28;
      var taper = xf < 0.85 ? 1 : Math.max(0.15, 1 - (xf - 0.85) / 0.15);
      return tooth * taper;
    }

    function draw() {
      var w = canvas.getBoundingClientRect().width;
      var h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      var vTop = 14;
      var vBottom = h * 0.58;
      var pTop = h * 0.66;
      var pBottom = h - 14;

      // baselines
      ctx.strokeStyle = "#1b1f24";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, vBottom);
      ctx.lineTo(w, vBottom);
      ctx.moveTo(0, pBottom);
      ctx.lineTo(w, pBottom);
      ctx.stroke();

      function tracePath(fracFn, yTop, yBottom) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 2) {
          var xf = (((x + t) % CYCLE) + CYCLE) % CYCLE / CYCLE;
          var y = yBottom - fracFn(xf) * (yBottom - yTop);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }

      // V trace — fill
      ctx.save();
      tracePath(vFrac, vTop, vBottom);
      ctx.lineTo(w, vBottom);
      ctx.lineTo(0, vBottom);
      ctx.closePath();
      var vGrad = ctx.createLinearGradient(0, vTop, 0, vBottom);
      vGrad.addColorStop(0, "rgba(74, 134, 255, 0.22)");
      vGrad.addColorStop(1, "rgba(74, 134, 255, 0)");
      ctx.fillStyle = vGrad;
      ctx.fill();
      ctx.restore();

      // V trace — glowing line
      tracePath(vFrac, vTop, vBottom);
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(74, 134, 255, 0.85)";
      ctx.shadowBlur = 7;
      ctx.strokeStyle = "#7db0ff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // P trace — sawtooth, amber
      tracePath(pFrac, pTop, pBottom);
      ctx.shadowColor = "rgba(255, 178, 56, 0.7)";
      ctx.shadowBlur = 5;
      ctx.strokeStyle = "#ffb238";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // axis labels
      ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#8a9099";
      ctx.fillText("V", 8, vTop + 12);
      ctx.fillText("P", 8, pTop + 12);
      ctx.fillStyle = "#565c64";
      ctx.fillText("t →", w - 26, pBottom - 4);

      if (!reduceMotion) {
        t += 1.4;
        requestAnimationFrame(draw);
      }
    }
    draw();
  }

  // ---- stat tiles count up once on load ----
  var stats = document.querySelectorAll(".readout-stats .value[data-count]");
  stats.forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || typeof gsap === "undefined") {
      el.textContent = target.toFixed(2) + suffix;
      return;
    }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      delay: 0.3,
      ease: "power2.out",
      onUpdate: function () {
        el.textContent = obj.v.toFixed(2) + (obj.v >= target - 0.001 ? suffix : "");
      },
    });
  });

  // ---- scroll-revealed spec cards ----
  if (!reduceMotion && typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    var cards = gsap.utils.toArray(".spec-card");
    cards.forEach(function (card, i) {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: (i % 4) * 0.06,
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });
  } else {
    document.querySelectorAll(".spec-card").forEach(function (card) {
      card.style.opacity = "1";
      card.style.transform = "none";
    });
  }
})();
