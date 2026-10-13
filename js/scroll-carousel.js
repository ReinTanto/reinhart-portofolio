/**
 * scroll-carousel.js
 * Turns a tall .carousel-section into a scroll-driven horizontal carousel.
 * The inner .carousel-pin is sticky, so the viewport "pins" while the
 * user scrolls through the section. Scroll progress maps to a horizontal
 * translate of the .carousel-track.
 *
 * A dead-zone at the top of the section means the carousel doesn't start
 * moving until the user has scrolled a bit past the section's top edge,
 * giving them a moment to "land" before the animation kicks in.
 */

(function () {
  const section = document.getElementById("carousel-section");
  const track = document.getElementById("carousel-track");
  const progressDots = document.querySelectorAll("#carousel-progress .dot");
  if (!section || !track) return;

  const cards = track.querySelectorAll(".product-card");

  // Dead-zone: fraction of the scrollable height to ignore at the start.
  // 0.12 = the first 12% of the section's scroll does nothing (user "lands").
  const DEAD_ZONE = 0.12;

  // Total distance the track needs to travel
  function getMaxTranslate() {
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    return Math.max(0, trackWidth - viewportWidth + 80);
  }

  let ticking = false;

  function update() {
    const sectionRect = section.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;
    const viewportHeight = window.innerHeight;

    const scrollable = sectionHeight - viewportHeight;
    const scrolled = -sectionTop;

    // Raw progress 0..1 across the full scrollable range
    const rawProgress = Math.max(0, Math.min(1, scrolled / scrollable));

    // Apply dead-zone: remap so the first DEAD_ZONE fraction = 0 progress
    let progress;
    if (rawProgress < DEAD_ZONE) {
      progress = 0;
    } else {
      progress = (rawProgress - DEAD_ZONE) / (1 - DEAD_ZONE);
    }
    progress = Math.max(0, Math.min(1, progress));

    // Ease with smoothstep for a gentle start and end
    const eased = progress * progress * (3 - 2 * progress);

    const maxTranslate = getMaxTranslate();
    const translateX = -eased * maxTranslate;
    track.style.transform = `translate3d(${translateX}px, 0, 0)`;

    // Update progress dots
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

  window.addEventListener("resize", update);

  // Initial
  update();
})();
