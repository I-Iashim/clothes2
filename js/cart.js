/* =========================================================
   Clean Edits — cart.js
   Powers cart.html (initCartPage) and feeds the order summary
   on checkout.html.
   ========================================================= */

function cartLineHTML(item, product) {
  return `
    <tr data-line-id="${item.id}">
      <td>
        <div class="cart-product">
          <img src="${product.images[0]}" alt="${product.name}">
          <div>
            <div class="cart-product-name">${product.name}</div>
            <div class="cart-product-meta">${item.color} · Size ${item.size}</div>
            <button class="cart-remove-btn" data-remove="${item.id}">Remove</button>
          </div>
        </div>
      </td>
      <td>${formatPrice(product.price)}</td>
      <td>
        <div class="qty-control">
          <button data-qty-down="${item.id}">&minus;</button>
          <span>${item.qty}</span>
          <button data-qty-up="${item.id}">+</button>
        </div>
      </td>
      <td>${formatPrice(product.price * item.qty)}</td>
      <td></td>
    </tr>
  `;
}

function initCartPage() {
  const emptyEl = document.getElementById("cartEmpty");
  const contentEl = document.getElementById("cartContent");
  const body = document.getElementById("cartBody");
  const couponInput = document.getElementById("couponInput");
  const couponBtn = document.getElementById("applyCoupon");
  const couponNote = document.getElementById("couponNote");

  let couponApplied = false;

  function render() {
    const cart = getCart();
    if (cart.length === 0) {
      emptyEl.classList.remove("hidden-el");
      contentEl.classList.add("hidden-el");
      return;
    }
    emptyEl.classList.add("hidden-el");
    contentEl.classList.remove("hidden-el");

    body.innerHTML = cart
      .map((item) => {
        const product = getProductById(item.productId);
        return product ? cartLineHTML(item, product) : "";
      })
      .join("");

    body.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeFromCart(btn.getAttribute("data-remove"));
        render();
      });
    });
    body.querySelectorAll("[data-qty-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-qty-up");
        const item = getCart().find((i) => i.id === id);
        if (item) updateCartQty(id, item.qty + 1);
        render();
      });
    });
    body.querySelectorAll("[data-qty-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-qty-down");
        const item = getCart().find((i) => i.id === id);
        if (item) updateCartQty(id, item.qty - 1);
        render();
      });
    });

    renderTotals();
  }

  function renderTotals() {
    const totals = getCartTotals();
    let discount = 0;
    if (couponApplied) discount = totals.subtotal * 0.1;
    const finalTotal = totals.total - discount;

    document.getElementById("cartSubtotal").textContent = formatPrice(totals.subtotal);
    document.getElementById("cartShipping").textContent = totals.shipping === 0 ? "Free" : formatPrice(totals.shipping);
    document.getElementById("cartTax").textContent = formatPrice(totals.tax);
    document.getElementById("cartTotal").textContent = formatPrice(Math.max(0, finalTotal));
  }

  if (couponBtn) {
    couponBtn.addEventListener("click", () => {
      const code = (couponInput.value || "").trim().toUpperCase();
      if (code === "CLEAN10") {
        couponApplied = true;
        couponNote.textContent = "10% discount applied — CLEAN10";
        couponNote.style.color = "var(--success)";
      } else {
        couponApplied = false;
        couponNote.textContent = "That code isn't valid. Try CLEAN10.";
        couponNote.style.color = "var(--danger)";
      }
      renderTotals();
    });
  }

  render();
}

/* Shared by checkout.html to show the order summary from cart state */
function renderCheckoutSummary() {
  const itemsEl = document.getElementById("checkoutItems");
  if (!itemsEl) return;
  const cart = getCart();

  itemsEl.innerHTML = cart
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return "";
      return `<div class="checkout-line-item"><span>${product.name} × ${item.qty} <br><small>${item.color} · ${item.size}</small></span><strong>${formatPrice(product.price * item.qty)}</strong></div>`;
    })
    .join("");

  const totals = getCartTotals();
  document.getElementById("checkoutSubtotal").textContent = formatPrice(totals.subtotal);
  document.getElementById("checkoutShipping").textContent = totals.shipping === 0 ? "Free" : formatPrice(totals.shipping);
  document.getElementById("checkoutTax").textContent = formatPrice(totals.tax);
  document.getElementById("checkoutTotal").textContent = formatPrice(totals.total);
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("checkoutItems")) renderCheckoutSummary();
});
