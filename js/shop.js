/* =========================================================
   Clean Edits — shop.js
   Powers shop.html, men.html, women.html, shoes.html and
   accessories.html. Called from an inline script tag with
   the fixed category for that page (or null for "shop all").
   ========================================================= */

function initShopPage(fixedCategory) {
  const grid = document.getElementById("shopGrid");
  const resultCount = document.getElementById("resultCount");
  const resultsEmpty = document.getElementById("resultsEmpty");
  const searchInput = document.getElementById("shopSearch");
  const sortSelect = document.getElementById("shopSort");
  const priceRange = document.getElementById("priceRange");
  const priceOutput = document.getElementById("priceOutput");
  const clearBtn = document.getElementById("clearFilters");
  const catCheckboxes = document.querySelectorAll("[data-cat-filter]");

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  if (searchInput && initialQuery) searchInput.value = initialQuery;

  const state = {
    query: initialQuery,
    maxPrice: priceRange ? Number(priceRange.value) : 300,
    categories: [],
    sort: "featured",
  };

  function getBaseSet() {
    return fixedCategory ? getProductsByCategory(fixedCategory) : PRODUCTS.slice();
  }

  function applyFilters() {
    let list = getBaseSet();

    if (state.categories.length) {
      list = list.filter((p) => state.categories.includes(p.category));
    }
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      );
    }
    list = list.filter((p) => p.price <= state.maxPrice);

    switch (state.sort) {
      case "newest":
        list = list.slice().sort((a, b) => a.daysAgo - b.daysAgo);
        break;
      case "price-asc":
        list = list.slice().sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = list.slice().sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = list.slice().sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = list.slice().sort((a, b) => {
          const af = a.tags.includes("featured") ? 0 : 1;
          const bf = b.tags.includes("featured") ? 0 : 1;
          return af - bf;
        });
    }

    if (resultCount) resultCount.textContent = list.length;
    if (grid) renderProductGrid(grid, list);
    if (resultsEmpty) resultsEmpty.classList.toggle("hidden-el", list.length !== 0);
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.query = searchInput.value.trim();
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.sort = sortSelect.value;
      applyFilters();
    });
  }

  if (priceRange) {
    priceRange.addEventListener("input", () => {
      state.maxPrice = Number(priceRange.value);
      if (priceOutput) priceOutput.textContent = "$" + state.maxPrice;
      applyFilters();
    });
  }

  catCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      state.categories = Array.from(catCheckboxes)
        .filter((c) => c.checked)
        .map((c) => c.getAttribute("data-cat-filter"));
      applyFilters();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.query = "";
      state.maxPrice = 300;
      state.categories = [];
      state.sort = "featured";
      if (searchInput) searchInput.value = "";
      if (priceRange) priceRange.value = 300;
      if (priceOutput) priceOutput.textContent = "$300";
      if (sortSelect) sortSelect.value = "featured";
      catCheckboxes.forEach((cb) => (cb.checked = false));
      applyFilters();
    });
  }

  applyFilters();
}
