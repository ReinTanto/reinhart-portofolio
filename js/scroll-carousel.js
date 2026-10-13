/**
 * scroll-carousel.js
 * Scroll-driven horizontal carousel — desktop, tablet, mobile.
 *
 * Responsive strategy:
 * - Desktop (≥1024px): horizontal scroll carousel
 * - Tablet (600–1023px): horizontal carousel, narrower cards
 * - Mobile (<600px): vertical stacked list (no horizontal scroll)
 *
 * The dead-zone is a fixed pixel buffer so the "landing" time feels
 * consistent regardless of section height / viewport size.
 */

(function () {
  const section = document.getElementById("carousel-section");
  const track = document.getElementById("carousel-track");
  const progressDots = document.querySelectorAll("#carousel-progress .dot");
  if (!section || !track) return;

  const cards = track.querySelectorAll(".product-card");

  // Fixed pixel buffer: carousel doesn't start until user has scrolled
  // this many pixels past the point where the section fills the viewport.
  const DEAD_ZONE_PX = 200;

  // ── Responsive mode ──
  function getMode() {
    const w = window.innerWidth;
    if (w < 600) return "vertical";
    if (w < 1024) return "tablet";
    return "desktop";
  }

  let currentMode = getMode();

  function applyMode() {
    const mode = getMode();

    if (mode !== currentMode) {
      currentMode = mode;

      if (mode === "vertical") {
        section.style.height = "auto";
        track.style.flexDirection = "column";
        track.style.transform = "none";
        track.style.gap = "1.5rem";
        cards.forEach((c) => {
          c.style.minWidth = "unset";
          c.style.width = "100%";
          c.style.maxWidth = "500px";
        });
        const progressEl = document.getElementById("carousel-progress");
        if (progressEl) progressEl.style.display = "none";
      } else {
        section.style.height = mode === "tablet" ? "300vh" : "350vh";
        track.style.flexDirection = "row";
        track.style.gap = mode === "tablet" ? "2rem" : "3rem";
        cards.forEach((c) => {
          c.style.minWidth = mode === "tablet" ? "min(320px, 70vw)" : "min(420px, 80vw)";
          c.style.width = "unset";
          c.style.maxWidth = "unset";
        });
        const progressEl = document.getElementById("carousel-progress");
        if (progressEl) progressEl.style.display = "flex";
      }
    }

    return mode;
  }

  // ── Max translate ──
  function getMaxTranslate() {
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    const lastCard = cards[cards.length - 1];
    if (!lastCard) return 0;
    const lastCardWidth = lastCard.offsetWidth;
    const maxScroll = trackWidth - viewportWidth;
    const centerOffset = viewportWidth / 2 - lastCardWidth / 2;
    return Math.max(0, maxScroll - centerOffset + lastCardWidth / 2);
  }

  let ticking = false;

  function update() {
    const mode = applyMode();

    if (mode === "vertical") {
      ticking = false;
      return;
    }

    const sectionRect = section.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;
    const viewportHeight = window.innerHeight;

    // The section "fills the viewport" when its top edge reaches the
    // viewport top (sectionTop === 0). Before that, the section is still
    // scrolling INTO view and the carousel should NOT be moving.
    //
    // The sticky pin has a range of (sectionHeight - viewportHeight),
    // but the section top reaches viewport top at scroll position where
    // sectionTop = 0. From that point, the pin is still sticky for
    // (sectionHeight - viewportHeight) more pixels of scroll.
    //
    // So the effective scroll range for the carousel is:
    //   start: sectionTop = 0  (section just filled the viewport)
    //   end:   sectionTop = -(sectionHeight - viewportHeight)  (section bottom hits viewport bottom)

    const scrollable = sectionHeight - viewportHeight;

    // How far past "section fills viewport" have we scrolled?
    // sectionTop is negative once the section top is above the viewport top.
    const scrolledPastFill = -sectionTop;

    // If the section hasn't filled the viewport yet, no carousel movement
    if (scrolledPastFill < 0) {
      track.style.transform = "none";
      progressDots.forEach((dot) => dot.classList.remove("active"));
      if (progressDots[0]) progressDots[0].classList.add("active");
      ticking = false;
      return;
    }

    // Apply fixed pixel dead-zone
    const effectiveScroll = Math.max(0, scrolledPastFill - DEAD_ZONE_PX);
    const effectiveRange = scrollable - DEAD_ZONE_PX;

    if (effectiveRange <= 0) {
      track.style.transform = "none";
      ticking = false;
      return;
    }

    const progress = Math.max(0, Math.min(1, effectiveScroll / effectiveRange));

    // Smoothstep easing
    const eased = progress * progress * (3 - 2 * progress);

    const maxTranslate = getMaxTranslate();
    const translateX = -eased * maxTranslate;
    track.style.transform = `translate3d(${translateX}px, 0, 0)`;

    // Progress dots
    const activeIndex = Math.round(eased * (cards.length - 1));
    progressDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === activeIndex);
    });

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(update, 100);
  });

  update();
})();
