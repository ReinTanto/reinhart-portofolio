/**
 * scroll-carousel.js
 * Turns a tall .carousel-section into a scroll-driven horizontal carousel.
 * The inner .carousel-pin is sticky, so the viewport "pins" while the
 * user scrolls through the section. Scroll progress maps to a horizontal
 * translate of the .carousel-track.
 */

(function () {
  const section = document.getElementById("carousel-section");
  const track = document.getElementById("carousel-track");
  const progressDots = document.querySelectorAll("#carousel-progress .dot");
  if (!section || !track) return;

  const cards = track.querySelectorAll(".product-card");
  const GAP = 48; // matches CSS gap (3rem)

  // Total distance the track needs to travel
  function getMaxTranslate() {
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    // We want the last card centered, so:
    // maxTranslate = trackWidth - viewportWidth/2 - cardWidth/2
    const firstCard = cards[0];
    const lastCard = cards[cards.length - 1];
    if (!firstCard || !lastCard) return 0;
    const firstRect = firstCard.getBoundingClientRect();
    const lastRect = lastCard.getBoundingClientRect();
    // Simpler: just use scrollWidth - viewportWidth
    return Math.max(0, trackWidth - viewportWidth + 80);
  }

  let ticking = false;

  function update() {
    const sectionRect = section.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;
    const viewportHeight = window.innerHeight;

    // Progress: 0 when section top hits viewport top, 1 when section bottom hits viewport bottom
    const scrollable = sectionHeight - viewportHeight;
    const scrolled = -sectionTop; // how far we've scrolled into the section
    const progress = Math.max(0, Math.min(1, scrolled / scrollable));

    // Ease the progress for a smoother feel
    const eased = progress * progress * (3 - 2 * progress); // smoothstep

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
