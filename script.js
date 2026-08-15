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

  // ---- hero: pin while the title settles in, then folds into the header ----
  gsap.set("#heroSub", { opacity: 0, y: 18 });
  gsap.set("#heroTagline", { opacity: 0, y: 14 });
  gsap.set("#heroEyebrow", { opacity: 0, y: 10 });
  gsap.set("#dockedHeader", { opacity: 0, y: -12 });

  var heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=1100",
      scrub: 0.5,
      pin: true,
    },
  });
  heroTl
    // settle in
    .to("#heroEyebrow", { opacity: 1, y: 0, ease: "none", duration: 0.12 }, 0)
    .fromTo("#heroTitle", { scale: 1.1, y: 20 }, { scale: 1, y: 0, ease: "none", duration: 0.3 }, 0)
    .to("#heroTagline", { opacity: 1, y: 0, ease: "none", duration: 0.2 }, 0.2)
    .to("#heroSub", { opacity: 1, y: 0, ease: "none", duration: 0.2 }, 0.32)
    .to(".hero-glow .b1", { scale: 1.15, opacity: 0.35, ease: "none", duration: 1 }, 0)
    .to(".hero-glow .b2", { scale: 1.2, opacity: 0.18, ease: "none", duration: 1 }, 0)
    // hold, then fold: the whole hero body shrinks/fades away while the
    // docked header fades in — reads as the title folding into place
    .to("#heroInner", { scale: 0.82, opacity: 0, y: -40, ease: "power1.in", duration: 0.3 }, 0.62)
    .to("#dockedHeader", { opacity: 1, y: 0, ease: "none", duration: 0.25 }, 0.68);

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
