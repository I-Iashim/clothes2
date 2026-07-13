/* =========================================================
   Clean Edits — product.js
   Powers product.html. Reads ?id= from the URL and renders
   the full PDP: gallery, variants, tabs, related products.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("pdpRoot");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = getProductById(id) || PRODUCTS[0];

  const state = {
    color: product.colors[0].name,
    size: product.sizes[Math.floor(product.sizes.length / 2)],
    qty: 1,
    activeImage: 0,
  };

  document.title = `${product.name} — Clean Edits`;

  // Breadcrumb + category label
  const catLabelEl = document.getElementById("pdpCategory");
  if (catLabelEl) catLabelEl.textContent = product.categoryLabel;
  const catBadge = document.getElementById("pdpCategoryLabel");
  if (catBadge) catBadge.textContent = product.categoryLabel;

  document.getElementById("pdpName").textContent = product.name;
  document.getElementById("pdpRating").innerHTML =
    `<span class="stars">${renderStars(product.rating)}</span><span>${product.rating} (${product.reviews} reviews)</span>`;

  document.getElementById("pdpDesc").textContent = product.description;
  document.getElementById("pdpDescFull").textContent = product.descriptionFull;

  const specsBody = document.getElementById("pdpSpecs");
  specsBody.innerHTML = Object.entries(product.specs)
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
    .join("");

  function renderPrice() {
    const hasSale = product.oldPrice && product.oldPrice > product.price;
    document.getElementById("pdpPriceCurrent").textContent = formatPrice(product.price);
    document.getElementById("pdpPriceOld").textContent = hasSale ? formatPrice(product.oldPrice) : "";
  }
  renderPrice();

  function renderGallery() {
    const mainImg = document.getElementById("pdpMainImage");
    mainImg.src = product.images[state.activeImage];
    mainImg.alt = product.name;
    const thumbs = document.getElementById("pdpThumbs");
    thumbs.innerHTML = product.images
      .map(
        (src, i) =>
          `<img src="${src}" alt="${product.name} view ${i + 1}" class="${i === state.activeImage ? "active" : ""}" data-img-index="${i}">`
      )
      .join("");
    thumbs.querySelectorAll("img").forEach((img) => {
      img.addEventListener("click", () => {
        state.activeImage = Number(img.getAttribute("data-img-index"));
        renderGallery();
      });
    });
  }
  renderGallery();

  function renderSwatches() {
    const el = document.getElementById("pdpSwatches");
    el.innerHTML = product.colors
      .map(
        (c) =>
          `<span class="swatch ${c.name === state.color ? "active" : ""}" style="background:${c.hex}" data-color="${c.name}" title="${c.name}"></span>`
      )
      .join("");
    el.querySelectorAll(".swatch").forEach((sw) => {
      sw.addEventListener("click", () => {
        state.color = sw.getAttribute("data-color");
        renderSwatches();
      });
    });
  }
  renderSwatches();

  function renderSizes() {
    const el = document.getElementById("pdpSizes");
    el.innerHTML = product.sizes
      .map((s) => `<span class="size-chip ${s === state.size ? "active" : ""}" data-size="${s}">${s}</span>`)
      .join("");
    el.querySelectorAll(".size-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.size = chip.getAttribute("data-size");
        renderSizes();
      });
    });
  }
  renderSizes();

  // Quantity
  const qtyDisplay = document.getElementById("pdpQtyDisplay");
  document.getElementById("pdpQtyUp").addEventListener("click", () => {
    state.qty += 1;
    qtyDisplay.textContent = state.qty;
  });
  document.getElementById("pdpQtyDown").addEventListener("click", () => {
    state.qty = Math.max(1, state.qty - 1);
    qtyDisplay.textContent = state.qty;
  });

  // Add to cart
  const addBtn = document.getElementById("pdpAddCart");
  addBtn.addEventListener("click", () => {
    addToCart(product.id, state.color, state.size, state.qty);
    flashButton(addBtn, "Added to Cart ✓");
  });

  // Wishlist toggle
  const wishBtn = document.getElementById("pdpWishlist");
  function renderWish() {
    const active = isWishlisted(product.id);
    wishBtn.classList.toggle("active", active);
    wishBtn.style.color = active ? "var(--danger)" : "";
  }
  wishBtn.addEventListener("click", () => {
    toggleWishlist(product.id);
    renderWish();
  });
  renderWish();

  // Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
    });
  });

  // Related products
  const related = getRelatedProducts(product, 4);
  renderProductGrid(document.getElementById("pdpRelated"), related);
});
