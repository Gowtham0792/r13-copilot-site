/*
 * R13 Copilot showcase site.
 * Scroll-driven zoom/depth effect, adapted from a CodeFronts
 * "CSS Zoom-In / Depth Parallax" demo (MIT licensed, used with
 * permission per the source's own license). One adjustment from the
 * original: the scroll/rAF listener is gated behind the same
 * prefers-reduced-motion check used everywhere else on this site — the
 * CSS already forces `transform: none !important` in that case, so the
 * gate is purely to avoid running a scroll-driven loop that computes
 * styles nothing will ever apply.
 */

(() => {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const zoomBlock = document.getElementById('plx09-zoom');
  const bg        = document.getElementById('plx09-bg');
  const grid      = document.getElementById('plx09-grid');
  const rings     = document.getElementById('plx09-rings');
  const content   = document.getElementById('plx09-content');
  const sub       = document.getElementById('plx09-sub');

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const r = zoomBlock.getBoundingClientRect();
      const h = zoomBlock.offsetHeight - window.innerHeight;
      const p = h > 0 ? Math.max(0, Math.min(1, -r.top / h)) : 0;

      // bg: scales from 1 → 2.2 (world rushes in)
      if (bg) bg.style.transform = `scale(${1 + p * 1.2})`;
      // grid: scales faster (closer layer)
      if (grid) grid.style.transform = `scale(${1 + p * 1.8})`;
      // rings: fly through (scale 1 → 3.5)
      if (rings) rings.style.transform = `translate(-50%,-50%) scale(${1 + p * 2.5})`;

      // content: fade in early, slide up
      const cp = Math.max(0, (p - 0.14) / 0.34);
      if (content) {
        content.style.opacity = String(Math.min(1, cp * 1.5));
        content.style.transform = `translateY(${(1 - Math.min(1, cp)) * 50}px)`;
      }
      if (sub) sub.style.opacity = String(Math.min(1, Math.max(0, (p - 0.3) / 0.25)));

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/*
 * #plx09-backdrop — a fixed layer behind the whole page, giving the zoom
 * scene's grid/glow atmosphere continuity past the first section. Kept
 * intentionally subtle: a slow drift tied to total scroll position, not
 * a second zoom effect. Gated behind prefers-reduced-motion like every
 * other motion on this site.
 */
(() => {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const grid = document.getElementById('plx09-backdrop-grid');
  const glow = document.getElementById('plx09-backdrop-glow');
  if (!grid && !glow) return;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      // Very slow drift — grid crawls, glow drifts even slower, so the
      // backdrop feels alive without competing with foreground content.
      if (grid) grid.style.transform = `translateY(${(y * 0.03) % 80}px)`;
      if (glow) glow.style.transform = `translateY(${y * 0.015}px)`;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/*
 * .plx-08 card grid — mouse-driven parallax/tilt, adapted from a second,
 * separate CodeFronts MIT-licensed demo ("CSS Parallax Card Hover
 * Effect"), used with permission per the source's own license. One
 * adjustment: the mousemove/touchmove listeners are never attached at
 * all under prefers-reduced-motion (the CSS already forces static
 * transforms via !important in that case — not attaching the listener
 * is the cleaner version of that same guarantee).
 */
(() => {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const root = document.querySelector('.plx-08');
  if (!root) return;

  const cards = Array.from(root.querySelectorAll('.plx-08__card'));

  const TILT_MAX = 18; // degrees
  const BG_SPEED = 0.3;
  const GEO_SPEED = -0.5;
  const CONTENT_SPEED = 0.7;

  cards.forEach(card => {
    const bg = card.querySelector('.plx-08__card-bg');
    const light = card.querySelector('.plx-08__card-light');
    const geo = card.querySelector('.plx-08__card-geo');
    const content = card.querySelector('.plx-08__card-content');

    function onMove(e) {
      const rect = card.getBoundingClientRect();
      // Normalized position: -1 to 1
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      // Card tilt
      const rotX = -ny * TILT_MAX;
      const rotY = nx * TILT_MAX;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

      // BG drifts slowly in same direction
      const bgX = nx * 20 * BG_SPEED;
      const bgY = ny * 20 * BG_SPEED;
      if (bg) bg.style.transform = `translateX(${bgX}px) translateY(${bgY}px)`;

      // Light follows cursor
      if (light) light.style.background = `radial-gradient(circle at ${(nx+1)/2*100}% ${(ny+1)/2*100}%, rgba(255,255,255,0.15) 0%, transparent 55%)`;

      // Geo drifts in opposite direction (depth separation)
      const geoX = nx * 20 * GEO_SPEED;
      const geoY = ny * 20 * GEO_SPEED;
      if (geo) geo.style.transform = `translateX(${geoX}px) translateY(${geoY}px)`;

      // Content pops forward
      const contentX = nx * 12 * CONTENT_SPEED;
      const contentY = ny * 12 * CONTENT_SPEED;
      if (content) content.style.transform = `translateX(${contentX}px) translateY(${contentY}px) translateZ(20px)`;
    }

    function onLeave() {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      if (bg) bg.style.transform = 'translateX(0px) translateY(0px)';
      if (geo) geo.style.transform = 'translateX(0px) translateY(0px)';
      if (content) content.style.transform = 'translateX(0px) translateY(0px) translateZ(0px)';
      if (light) light.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)';
    }

    function onTouch(e) {
      const t = e.touches[0];
      onMove({ clientX: t.clientX, clientY: t.clientY });
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('touchmove', onTouch, { passive: true });
    card.addEventListener('touchend', onLeave);
  });
})();
