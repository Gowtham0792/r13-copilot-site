/*
 * R13 Copilot showcase site.
 *
 * The hero's own "reveal" effect (a scrolling list of phrases lighting
 * up as they cross the vertical center of the screen) is pure CSS — a
 * gradient fixed to the viewport painted through the text via
 * background-clip — so it needs no JS at all, and nothing here disables
 * it under prefers-reduced-motion (it isn't an animation, it's a static
 * paint that just depends on scroll position, same as position:sticky
 * itself). What's left for JS:
 * (1) a pull-quote section that pins and lights up word by word while
 *     pinned, (2) everything else below uses a lighter fade+rise reveal
 *     as it enters the viewport. Both respect prefers-reduced-motion by
 *     rendering the final, fully-revealed state with no animation.
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
