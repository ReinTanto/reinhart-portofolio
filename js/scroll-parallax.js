/**
 * scroll-parallax.js
 * Moves .parallax-layer elements based on scroll position.
 * Each layer has a data-speed attribute (0.1 = slow, 1.0 = fast).
 */

(function () {
  const layers = document.querySelectorAll(".parallax-layer");
  if (layers.length === 0) return;

  let ticking = false;

  function update() {
    const scrollY = window.scrollY;
    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed) || 0.3;
      // Negative translate so layers move slower than content (parallax effect)
      const yOffset = -scrollY * speed;
      layer.style.transform = `translate3d(0, ${yOffset}px, 0)`;
    });
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Initial position
  update();
})();
