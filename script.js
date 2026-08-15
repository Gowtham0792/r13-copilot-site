/*
 * R13 Copilot showcase site.
 *
 * Motion language borrowed from large product-launch pages: pinned,
 * scroll-scrubbed scenes rather than one-shot on-load animations —
 * (1) the hero settles/refines as you start scrolling, (2) a pull-quote
 * section lights up word by word while pinned, (3) everything else below
 * uses a lighter fade+rise reveal as it enters the viewport. All of it
 * respects prefers-reduced-motion by rendering the final, fully-revealed
 * state with no animation at all.
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

  // ---- hero: pin briefly while the headline settles and the subhead rises in ----
  gsap.set("#heroSub", { opacity: 0, y: 18 });
  gsap.set("#heroEyebrow", { opacity: 0, y: 10 });

  var heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=480",
      scrub: 0.5,
      pin: true,
    },
  });
  heroTl
    .to("#heroEyebrow", { opacity: 1, y: 0, ease: "none", duration: 0.2 }, 0)
    .fromTo("#heroTitle", { scale: 1.08, y: 16 }, { scale: 1, y: 0, ease: "none", duration: 0.6 }, 0)
    .to("#heroSub", { opacity: 1, y: 0, ease: "none", duration: 0.4 }, 0.35)
    .to(".hero-glow .b1", { scale: 1.15, opacity: 0.35, ease: "none", duration: 1 }, 0)
    .to(".hero-glow .b2", { scale: 1.2, opacity: 0.18, ease: "none", duration: 1 }, 0);

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
