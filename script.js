/*
 * R13 Copilot showcase site.
 *
 * Two small, restrained effects:
 * 1. An ambient canvas "deceleration trace" in the hero — a slowly
 *    scrolling waveform that occasionally dips and recovers, evoking a
 *    live brake-pressure/deceleration readout without claiming to be
 *    real telemetry.
 * 2. Scroll-revealed spec cards (fade + rise) via GSAP ScrollTrigger.
 */

(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- ambient waveform ----
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

    var t = 0;
    // A handful of sine components at different frequencies/phases sum
    // into an irregular trace; a slow envelope periodically pulls the
    // amplitude down and back up, reading as a braking event.
    var components = [
      { f: 0.006, a: 10, p: 0 },
      { f: 0.013, a: 6, p: 1.7 },
      { f: 0.028, a: 3, p: 3.1 },
    ];

    function sample(x) {
      var v = 0;
      for (var i = 0; i < components.length; i++) {
        var c = components[i];
        v += Math.sin((x + t) * c.f + c.p) * c.a;
      }
      var envelopePhase = ((x + t) * 0.0015) % (Math.PI * 2);
      var envelope = 0.55 + 0.45 * Math.pow(Math.sin(envelopePhase), 2);
      return v * envelope;
    }

    function draw() {
      var w = canvas.getBoundingClientRect().width;
      var h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      var mid = h / 2;

      // baseline grid (drawn first, under the trace)
      ctx.strokeStyle = "#1b1f24";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();

      // fill under the trace
      ctx.beginPath();
      ctx.moveTo(0, mid + sample(0));
      for (var x = 0; x <= w; x += 2) ctx.lineTo(x, mid + sample(x));
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      var fillGrad = ctx.createLinearGradient(0, 0, 0, h);
      fillGrad.addColorStop(0, "rgba(74, 134, 255, 0.22)");
      fillGrad.addColorStop(1, "rgba(74, 134, 255, 0)");
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // glowing trace line
      ctx.beginPath();
      for (var xi = 0; xi <= w; xi += 2) {
        var yi = mid + sample(xi);
        if (xi === 0) ctx.moveTo(xi, yi);
        else ctx.lineTo(xi, yi);
      }
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(74, 134, 255, 0.9)";
      ctx.shadowBlur = 8;
      ctx.strokeStyle = "#7db0ff";
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (!reduceMotion) {
        t += 1.1;
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
