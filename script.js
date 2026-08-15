/*
 * R13 Copilot showcase site.
 *
 * Restrained motion only: bento cards fade + rise into view on scroll.
 * No canvas/chart gimmicks — the visual interest here comes from type,
 * color, and layout, not a simulated readout.
 */

(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

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
  } else {
    document.querySelectorAll(".bento-card").forEach(function (card) {
      card.style.opacity = "1";
      card.style.transform = "none";
    });
  }
})();
