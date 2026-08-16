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

  // ---- tilt-card: per-card mouse-driven parallax, 3 independent layers ----
  // 1. the card itself tilts in 3D toward the cursor (smoothed via
  //    quickTo, not an instant snap).
  // 2. a cursor-following spotlight — the CSS ::before in style.css reads
  //    the --mx/--my custom properties this sets directly on every move
  //    (no smoothing here; a spotlight should feel glued to the pointer).
  // 3. the icon badge shifts opposite the cursor by a small amount, its
  //    own independent quickTo — the piece that actually sells "this is
  //    layered," not just tilted as one flat card.
  gsap.utils.toArray(".tilt-card").forEach(function (card) {
    var rotateX = gsap.quickTo(card, "rotateX", { duration: 0.5, ease: "power3.out" });
    var rotateY = gsap.quickTo(card, "rotateY", { duration: 0.5, ease: "power3.out" });
    var icon = card.querySelector(".icon-badge");
    var iconX = icon ? gsap.quickTo(icon, "x", { duration: 0.4, ease: "power3.out" }) : null;
    var iconY = icon ? gsap.quickTo(icon, "y", { duration: 0.4, ease: "power3.out" }) : null;

    card.addEventListener("pointermove", function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width; // 0..1
      var py = (e.clientY - rect.top) / rect.height;

      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");

      var nx = px - 0.5; // -0.5..0.5
      var ny = py - 0.5;
      rotateX(-ny * 10);
      rotateY(nx * 10);
      if (iconX && iconY) {
        iconX(-nx * 14);
        iconY(-ny * 14);
      }
    });

    card.addEventListener("pointerleave", function () {
      rotateX(0);
      rotateY(0);
      if (iconX && iconY) {
        iconX(0);
        iconY(0);
      }
    });
  });
})();
