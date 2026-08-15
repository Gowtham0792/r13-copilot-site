/*
 * R13 Copilot showcase site — hero scroll animation.
 *
 * A three-axle semi-trailer rolls across a pinned hero section as the
 * visitor scrolls. Wheel rotation is proportional to distance travelled
 * (real rolling-without-slipping) for most of the scroll range, then
 * switches to a stepped/stuttering rotation at a few "braking zones" to
 * read as an ABS intervention (the wheel visually locks and releases in
 * rapid succession rather than rolling smoothly), synced with a brake-
 * light flash and a caliper glow.
 */

(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var wheels = [document.getElementById("wheel1"), document.getElementById("wheel2"), document.getElementById("wheel3")];
  var trailerGroup = document.getElementById("trailerGroup");
  var taillights = document.querySelectorAll(".taillight");
  var calipers = document.querySelectorAll(".caliper-glow");
  var chassis = document.querySelector(".chassis");
  var spinBlurs = document.querySelectorAll(".spin-blur");
  var heroCopy = document.getElementById("heroCopy");
  var scrollCue = document.getElementById("scrollCue");

  if (reduceMotion || typeof gsap === "undefined") {
    // Static fallback: park the trailer centered on screen, fully formed,
    // no motion at all.
    if (trailerGroup) {
      trailerGroup.style.transform = "translateX(200px)";
    }
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var WHEEL_RADIUS = 41; // matches #wheelSymbol viewBox
  var CIRCUMFERENCE = 2 * Math.PI * WHEEL_RADIUS;

  function degreesForDistance(distance) {
    return (distance / CIRCUMFERENCE) * 360;
  }

  // Trailer local geometry spans roughly x:-10..800 inside #trailerGroup.
  var START_X = 1750; // fully off the right edge
  var END_X = -950; // fully off the left edge

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      pin: ".hero-stage",
    },
  });

  gsap.set(trailerGroup, { x: START_X });
  gsap.set(wheels, { transformOrigin: "50% 50%" });

  // Fade the headline out early so the trailer becomes the focus once it
  // starts moving.
  tl.to([heroCopy, scrollCue], { opacity: 0, duration: 6, ease: "none" }, 0);

  function rollPhase(distance) {
    var deg = degreesForDistance(distance);
    tl.to(trailerGroup, { x: "-=" + distance, duration: distance / 100, ease: "none" });
    tl.to(wheels, { rotation: "+=" + deg, duration: distance / 100, ease: "none" }, "<");
    tl.to(spinBlurs, { opacity: 0.5, duration: (distance / 100) * 0.25, ease: "power1.out" }, "<");
  }

  function brakeZone(distance, stutterDeg) {
    var dur = distance / 100;
    tl.to(trailerGroup, { x: "-=" + distance, duration: dur, ease: "none" });
    tl.to(wheels, { rotation: "+=" + stutterDeg, duration: dur, ease: "steps(6)" }, "<");
    tl.to(spinBlurs, { opacity: 0, duration: dur * 0.3, ease: "none" }, "<");
    tl.to(chassis, { y: 3, duration: dur * 0.3, ease: "power1.out" }, "<");
    tl.to(taillights, { opacity: 1, duration: dur * 0.2, ease: "steps(6)" }, "<");
    tl.to(calipers, { opacity: 0.9, duration: dur * 0.2, ease: "steps(6)" }, "<");
    tl.to(chassis, { y: 0, duration: dur * 0.4 }, "<" + dur * 0.55);
    tl.to(taillights, { opacity: 0.28, duration: dur * 0.5, ease: "steps(6)" }, "<");
    tl.to(calipers, { opacity: 0, duration: dur * 0.5, ease: "steps(6)" }, "<");
  }

  // roll -> brake -> roll -> brake -> roll -> brake -> settle
  rollPhase(675);
  brakeZone(135, 34);
  rollPhase(810);
  brakeZone(135, 34);
  rollPhase(675);
  brakeZone(135, 26);
  rollPhase(135);

  tl.to(spinBlurs, { opacity: 0, duration: 0.5 });
})();
