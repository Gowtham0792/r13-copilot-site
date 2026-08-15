/*
 * R13 Copilot showcase site.
 *
 * Motion language borrowed from large product-launch pages: pinned,
 * scroll-scrubbed scenes rather than one-shot on-load animations —
 * (1) the hero settles in, then the big "R13 Copilot" title folds itself
 *     down into a compact fixed header as the hero scrolls away (and
 *     unfolds again if you scroll back to the top — the scrub is fully
 *     bidirectional), (2) a pull-quote section lights up word by word
 *     while pinned, (3) everything else below uses a lighter fade+rise
 *     reveal as it enters the viewport. All of it respects
 *     prefers-reduced-motion by rendering the final, fully-revealed
 *     state with no animation at all.
 */

(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || typeof gsap === "undefined") {
    document.querySelectorAll(".bento-card, .pullquote .word").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---- split the hero title into individually-animatable letters ----
  // Two nested spans per letter: an outer one the scroll entrance drives,
  // an inner one that gets its own always-running idle float — kept apart
  // so the two animations never write to the same transform at once.
  var heroTitle = document.getElementById("heroTitle");
  var words = [
    { text: "R13", accent: true },
    { text: "Copilot", accent: false },
  ];
  var markup = "";
  words.forEach(function (w, wi) {
    markup += '<span class="word' + (w.accent ? " accent" : "") + '">';
    w.text.split("").forEach(function (ch) {
      markup +=
        '<span class="letter-outer"><span class="letter-inner">' + ch + "</span></span>";
    });
    markup += "</span>";
    if (wi < words.length - 1) markup += " ";
  });
  heroTitle.innerHTML = markup;

  var letterOuters = heroTitle.querySelectorAll(".letter-outer");
  var letterInners = heroTitle.querySelectorAll(".letter-inner");

  gsap.set(letterOuters, { opacity: 0, y: 34, rotateZ: 7 });

  // continuous idle float, always running, offset per letter — reads as
  // the wordmark gently breathing rather than a static logo
  gsap.to(letterInners, {
    y: -9,
    duration: 1.7,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    stagger: { each: 0.07, from: "start" },
  });

  // ---- hero entrance: plays immediately on load, NOT tied to scroll ----
  // (this was the bug: tying the initial reveal to scroll progress meant
  // scrollY=0 on page load == progress 0 == still hidden, leaving the
  // hero blank until the visitor actually scrolled)
  gsap.set("#heroSub", { opacity: 0, y: 18 });
  gsap.set("#heroTagline", { opacity: 0, y: 14 });
  gsap.set("#heroEyebrow", { opacity: 0, y: 10 });
  gsap.set("#dockedHeader", { xPercent: -50, opacity: 0, y: -14, scale: 0.92, filter: "blur(6px)" });

  var introTl = gsap.timeline({ delay: 0.1 });
  introTl
    .to("#heroEyebrow", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0)
    .to(letterOuters, { opacity: 1, y: 0, rotateZ: 0, stagger: 0.028, duration: 0.55, ease: "power2.out" }, 0.1)
    .to("#heroTagline", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.45)
    .to("#heroSub", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.55);

  // ---- hero: pin, hold, then fold the title down into the docked header ----
  var heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      // kept short and spanning almost the whole pin range below — a
      // pin that outlasts its own animation leaves a stretch of "dead"
      // scroll with nothing on screen (the hero already folded away,
      // the next section can't appear yet since the pin hasn't released)
      end: "+=160",
      scrub: 0.5,
      pin: true,
    },
  });
  heroTl
    .to(".hero-glow .b1", { scale: 1.15, opacity: 0.35, ease: "none", duration: 1 }, 0)
    .to(".hero-glow .b2", { scale: 1.2, opacity: 0.18, ease: "none", duration: 1 }, 0)
    // the whole hero body shrinks/fades away while the docked header
    // fades in — reads as the title folding into place
    .to("#heroInner", { scale: 0.82, opacity: 0, y: -40, ease: "power1.in", duration: 0.65 }, 0.05)
    .to(
      "#dockedHeader",
      { xPercent: -50, opacity: 1, y: 0, scale: 1, filter: "blur(0px)", ease: "none", duration: 0.6 },
      0.2
    );

  // ---- hero centerpiece: real multi-layer parallax ----
  // A single rigid object translating as one block reads as weak —
  // genuine parallax depth comes from several independent planes moving
  // at different rates. Each .disc-layer carries its own data-depth
  // (0 = far/barely moves, 1+ = near/moves the most); the discs inside
  // keep their own plain CSS spin animation, kept off the layer that
  // GSAP is driving so the two transforms never collide.
  var heroObject = document.getElementById("heroObject");
  var discLayers = heroObject ? Array.prototype.slice.call(heroObject.querySelectorAll(".disc-layer")) : [];
  if (heroObject && discLayers.length) {
    var PARALLAX_RANGE_PX = 60;

    var movers = discLayers.map(function (layer) {
      var depth = parseFloat(layer.getAttribute("data-depth")) || 0.5;
      return {
        depth: depth,
        x: gsap.quickTo(layer, "x", { duration: 0.7, ease: "power2.out" }),
        y: gsap.quickTo(layer, "y", { duration: 0.7, ease: "power2.out" }),
      };
    });

    window.addEventListener("pointermove", function (e) {
      // tracked against the whole viewport, not just hovering the
      // object, so it reads as "the scene is aware of the cursor"
      var dx = gsap.utils.clamp(-1, 1, (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2));
      var dy = gsap.utils.clamp(-1, 1, (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2));
      movers.forEach(function (m) {
        m.x(dx * PARALLAX_RANGE_PX * m.depth);
        m.y(dy * PARALLAX_RANGE_PX * m.depth);
      });
    });
  }

  // ---- pull-quote: pin while each word lights up in reading order ----
  gsap.timeline({
    scrollTrigger: {
      trigger: "#pullquote",
      start: "top top",
      end: "+=550",
      scrub: 0.4,
      pin: true,
    },
  }).to("#pullquoteText .word", { opacity: 1, stagger: 0.055, ease: "none" });

  // ---- everything else: fade + rise once it enters the viewport ----
  var cards = gsap.utils.toArray(".bento-card");
  cards.forEach(function (card, i) {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: (i % 3) * 0.06,
      scrollTrigger: {
        trigger: card,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });
  });
})();
