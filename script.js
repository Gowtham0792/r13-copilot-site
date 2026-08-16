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

  const zoomBlock   = document.getElementById('plx09-zoom');
  const bg          = document.getElementById('plx09-bg');
  const grid        = document.getElementById('plx09-grid');
  const rings       = document.getElementById('plx09-rings');
  const content     = document.getElementById('plx09-content');
  const sub         = document.getElementById('plx09-sub');
  const galCells    = [
    document.getElementById('plx09-g1'),
    document.getElementById('plx09-g2'),
    document.getElementById('plx09-g3'),
  ];
  const outroBlock  = document.getElementById('plx09-outro');
  const outroBg     = document.getElementById('plx09-outro-bg');
  const outroText   = document.getElementById('plx09-outro-text');

  let ticking = false;

  function prog(el) {
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const h = el.offsetHeight - window.innerHeight;
    return h > 0 ? Math.max(0, Math.min(1, -r.top / h)) : 0;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const vh = window.innerHeight;

      // ── SCENE 1 ──
      const p = prog(zoomBlock);
      // bg: scales from 1 → 2.2 (world rushes in)
      if (bg) bg.style.transform = `scale(${1 + p * 1.2})`;
      // grid: scales faster (closer layer)
      if (grid) grid.style.transform = `scale(${1 + p * 1.8})`;
      // rings: fly through (scale 1 → 3.5)
      if (rings) rings.style.transform = `translate(-50%,-50%) scale(${1 + p * 2.5})`;

      // content: fade in after 35% scroll, slide up
      const cp = Math.max(0, (p - 0.14) / 0.34);
      if (content) {
        content.style.opacity = String(Math.min(1, cp * 1.5));
        content.style.transform = `translateY(${(1 - Math.min(1, cp)) * 50}px)`;
      }
      if (sub) sub.style.opacity = String(Math.min(1, Math.max(0, (p - 0.3) / 0.25)));

      // ── GALLERY: parallax inside each cell ──
      galCells.forEach((cell) => {
        if (!cell) return;
        const parent = cell.closest('.plx-09__cell');
        if (!parent) return;
        const r = parent.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        const centerOffset = (r.top + r.height / 2) - vh / 2;
        // Cell comes in zoomed out (1.0) from below, scale up as it centers
        const cellProg = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / (vh * 0.8)));
        const scaleVal = 1.0 + cellProg * 0.25;
        const yShift = centerOffset * 0.1;
        cell.style.transform = `scale(${scaleVal}) translateY(${yShift}px)`;
      });

      // ── OUTRO ──
      const op = prog(outroBlock);
      if (outroBg) outroBg.style.transform = `scale(${1 + op * 0.5})`;
      if (outroText) outroText.style.transform = `scale(${1 + op * 0.06}) translateY(${op * -18}px)`;

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
