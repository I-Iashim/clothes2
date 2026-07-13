/* =========================================================
   Clean Edits — main.js
   Shared behavior across every page: nav, loader, search
   panel, badge counts, footer year, back-to-top, and the
   homepage product rails.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initPageLoader();
  initNavbar();
  initSearchPanel();
  initBackToTop();
  setFooterYear();
  updateHeaderCounts();
  initHomepageRails();
  markActiveNavLink();
});

/* ---------------- Page loader ---------------- */
function initPageLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  const hide = () => loader.classList.add("loaded");
  window.addEventListener("load", () => setTimeout(hide, 300));
  // Safety net in case load already fired
  setTimeout(hide, 1200);
}

/* ---------------- Navbar: scroll shadow + mobile toggle ---------------- */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });
  }
}

function markActiveNavLink() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("active");
  });
}

/* ---------------- Search panel ---------------- */
function initSearchPanel() {
  const toggle = document.getElementById("searchToggle");
  const panel = document.getElementById("searchPanel");
  const input = document.getElementById("navSearchInput");
  const btn = document.getElementById("navSearchBtn");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open") && input) setTimeout(() => input.focus(), 150);
  });

  const runSearch = () => {
    const q = (input && input.value.trim()) || "";
    window.location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  };
  if (btn) btn.addEventListener("click", runSearch);
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runSearch();
    });
  }
}

/* ---------------- Back to top ---------------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("visible", window.scrollY > 500),
    { passive: true }
  );
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------------- Footer year ---------------- */
function setFooterYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* =========================================================
   Product card rendering — shared by home / shop / related
   ========================================================= */

function renderStars(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function productCardHTML(product) {
  const wished = isWishlisted(product.id);
  const hasSale = product.oldPrice && product.oldPrice > product.price;
  const isNew = product.tags && product.tags.includes("new");
  const badges = [];
  if (hasSale) {
    const pct = Math.round((1 - product.price / product.oldPrice) * 100);
    badges.push(`<span class="product-badge sale">-${pct}%</span>`);
  }
  if (isNew) badges.push(`<span class="product-badge">New</span>`);

  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-media">
        <span class="product-badges">${badges.join("")}</span>
        <button class="product-wish-btn ${wished ? "active" : ""}" data-wish-id="${product.id}" aria-label="Toggle wishlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
        </button>
        <a href="product.html?id=${product.id}">
          <img class="main-img" src="${product.images[0]}" alt="${product.name}" loading="lazy">
          <img class="alt-img" src="${product.images[1] || product.images[0]}" alt="${product.name}" loading="lazy">
        </a>
        <button class="product-quick-add" data-quick-add="${product.id}">Add to Cart</button>
      </div>
      <div class="product-info">
        <a href="product.html?id=${product.id}">
          <span class="product-cat">${product.categoryLabel}</span>
          <h3 class="product-name">${product.name}</h3>
        </a>
        <div class="product-rating"><span class="stars">${renderStars(product.rating)}</span><span>${product.rating} (${product.reviews})</span></div>
        <div class="product-price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${hasSale ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderProductGrid(container, products) {
  if (!container) return;
  container.innerHTML = products.map(productCardHTML).join("");
  bindProductCardEvents(container);
}

function bindProductCardEvents(scope) {
  scope.querySelectorAll("[data-wish-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute("data-wish-id");
      const active = toggleWishlist(id);
      btn.classList.toggle("active", active);
    });
  });
  scope.querySelectorAll("[data-quick-add]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute("data-quick-add");
      const product = getProductById(id);
      if (!product) return;
      addToCart(id, product.colors[0].name, product.sizes[Math.floor(product.sizes.length / 2)], 1);
      flashButton(btn, "Added ✓");
    });
  });
}

function flashButton(btn, text) {
  const original = btn.textContent;
  btn.textContent = text;
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 1200);
}

/* ---------------- Homepage rails ---------------- */
function initHomepageRails() {
  const featured = document.getElementById("featuredGrid");
  const arrivals = document.getElementById("arrivalsGrid");
  const bestSellers = document.getElementById("bestSellersGrid");
  const trending = document.getElementById("trendingGrid");
  if (!featured && !arrivals && !bestSellers && !trending) return;

  const byTag = (tag) => PRODUCTS.filter((p) => p.tags.includes(tag));

  if (featured) renderProductGrid(featured, byTag("featured").slice(0, 8));
  if (arrivals) renderProductGrid(arrivals, PRODUCTS.slice().sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 8));
  if (bestSellers) renderProductGrid(bestSellers, byTag("bestseller").slice(0, 8));
  if (trending) renderProductGrid(trending, byTag("trending").slice(0, 8));
}
