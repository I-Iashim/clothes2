/* =========================================================
   Clean Edits — wishlist.js
   Powers wishlist.html.
   ========================================================= */

function initWishlistPage() {
  const emptyEl = document.getElementById("wishlistEmpty");
  const gridEl = document.getElementById("wishlistGrid");

  function render() {
    const ids = getWishlist();
    const products = ids.map(getProductById).filter(Boolean);

    if (products.length === 0) {
      emptyEl.classList.remove("hidden-el");
      gridEl.classList.add("hidden-el");
      return;
    }
    emptyEl.classList.add("hidden-el");
    gridEl.classList.remove("hidden-el");
    renderProductGrid(gridEl, products);

    // Re-render this page live when a card's wishlist heart is toggled off
    gridEl.querySelectorAll("[data-wish-id]").forEach((btn) => {
      btn.addEventListener("click", () => setTimeout(render, 50));
    });
  }

  render();
}
