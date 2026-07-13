/* =========================================================
   Clean Edits — forms.js
   Client-side only: validates and simulates submission for
   login, register, contact and checkout forms. There is no
   backend, so each form "succeeds" once HTML5 validation
   passes and shows appropriate feedback.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  bindSimpleForm("loginForm", () => {
    window.location.href = "index.html";
  });

  bindSimpleForm("registerForm", (form) => {
    const pw = form.querySelector("#registerPassword");
    const confirm = form.querySelector("#registerConfirm");
    if (pw && confirm && pw.value !== confirm.value) {
      confirm.setCustomValidity("Passwords do not match");
      confirm.reportValidity();
      return false;
    }
    if (confirm) confirm.setCustomValidity("");
    window.location.href = "index.html";
  });

  bindSimpleForm("contactForm", (form) => {
    const btn = form.querySelector('button[type="submit"]');
    flashButton(btn, "Message Sent ✓");
    form.reset();
  });

  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        return;
      }
      clearCart();
      checkoutForm.classList.add("hidden-el");
      const success = document.getElementById("orderSuccess");
      if (success) success.classList.remove("hidden-el");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Newsletter form (home page)
  document.querySelectorAll(".newsletter-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      flashButton(btn, "Subscribed ✓");
      form.reset();
    });
  });
});

function bindSimpleForm(id, onValid) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    onValid(form);
  });
}
