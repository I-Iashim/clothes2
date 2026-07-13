/* =========================================================
   Clean Edits — animations.js
   Adds `.in-view` to reveal-* elements as they enter the
   viewport. Re-scans periodically since some grids (shop,
   product, cart, wishlist) render content after this script
   has already run its first pass.
   ========================================================= */

(function () {
  const SELECTOR = ".reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-stagger";
  const seen = new WeakSet();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  function scan() {
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (!seen.has(el)) {
        seen.add(el);
        observer.observe(el);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", scan);
  // Content injected by shop.js / product.js / cart.js / wishlist.js
  // arrives shortly after DOMContentLoaded — catch it too.
  window.addEventListener("load", scan);
  setTimeout(scan, 400);
  setTimeout(scan, 1200);
})();
