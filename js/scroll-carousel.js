/**
 * scroll-carousel.js
 * Scroll-driven horizontal carousel that works across desktop, tablet, and mobile.
 *
 * Responsive strategy:
 * - Desktop (≥1024px): horizontal scroll carousel, one card at a time
 * - Tablet (600–1023px): horizontal carousel, cards slightly narrower
 * - Mobile (<600px): falls back to a vertical stacked list (no horizontal scroll),
 *   because horizontal swipe + vertical scroll is confusing on small screens
 */

(function () {
  const section = document.getElementById("carousel-section");
  const track = document.getElementById("carousel-track");
  const progressDots = document.querySelectorAll("#carousel-progress .dot");
  if (!section || !track) return;

  const cards = track.querySelectorAll(".product-card");

  // Dead-zone: fraction of scrollable height to ignore at the start
  const DEAD_ZONE = 0.15;

  // ── Responsive mode detection ──
  function getMode() {
    const w = window.innerWidth;
    if (w < 600) return "vertical";   // mobile: stack vertically
    if (w < 1024) return "tablet";   // tablet: horizontal, narrower cards
    return "desktop";                // desktop: horizontal, full cards
  }

  let currentMode = getMode();

  // ── Apply mode-specific styles ──
  function applyMode() {
    const mode = getMode();

    if (mode !== currentMode) {
      currentMode = mode;

      if (mode === "vertical") {
        // Mobile: stack cards vertically, no horizontal scroll
        section.style.height = "auto";
        track.style.flexDirection = "column";
        track.style.transform = "none";
        track.style.gap = "1.5rem";
        // Center cards
        cards.forEach((c) => {
          c.style.minWidth = "unset";
          c.style.width = "100%";
          c.style.maxWidth = "500px";
        });
        // Hide progress dots (not relevant for vertical)
        const progressEl = document.getElementById("carousel-progress");
        if (progressEl) progressEl.style.display = "none";
      } else {
        // Desktop / tablet: horizontal carousel
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

  // ── Total distance the track needs to travel ──
  function getMaxTranslate() {
    // Measure the actual rendered width of the track
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    // We want to scroll until the last card is roughly centered
    const lastCard = cards[cards.length - 1];
    if (!lastCard) return 0;
    const lastCardWidth = lastCard.offsetWidth;
    // Distance = total track width minus what fits in viewport,
    // adjusted so the last card ends up centered
    const maxScroll = trackWidth - viewportWidth;
    // Center the last card: add half the viewport minus half the last card
    const centerOffset = viewportWidth / 2 - lastCardWidth / 2;
    return Math.max(0, maxScroll - centerOffset + lastCardWidth / 2);
  }

  let ticking = false;

  function update() {
    const mode = applyMode();

    // Vertical mode: nothing to do
    if (mode === "vertical") {
      ticking = false;
      return;
    }

    const sectionRect = section.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;
    const viewportHeight = window.innerHeight;

    const scrollable = sectionHeight - viewportHeight;
    if (scrollable <= 0) {
      // Section is shorter than viewport — no carousel needed
      track.style.transform = "none";
      ticking = false;
      return;
    }

    const scrolled = -sectionTop;

    // Raw progress 0..1
    const rawProgress = Math.max(0, Math.min(1, scrolled / scrollable));

    // Dead-zone
    let progress;
    if (rawProgress < DEAD_ZONE) {
      progress = 0;
    } else {
      progress = (rawProgress - DEAD_ZONE) / (1 - DEAD_ZONE);
    }
    progress = Math.max(0, Math.min(1, progress));

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

  // Re-apply on resize (handles orientation change, window resize)
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(update, 100);
  });

  // Initial
  update();
})();
