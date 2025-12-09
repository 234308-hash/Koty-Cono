// Checkout state
let currentStep = 1;
let checkoutData = {
  cart: [],
  shipping: {},
  payment: {},
  subtotal: 0,
  shippingCost: 0,
  tax: 0,
  discount: 0,
  total: 0,
};

// Initialize checkout
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromStorage();
  renderCart();
  updateAllSummaries();
});

// Load cart from localStorage
function loadCartFromStorage() {
  const cartData = localStorage.getItem("kotyCono_cart");
  if (cartData) {
    checkoutData.cart = JSON.parse(cartData);
  }

  // If cart is empty, redirect to home
  if (checkoutData.cart.length === 0) {
    checkoutData.cart = [
      { name: "Burn Capsules", price: 28.99, img: "imgs/B.png" },
      { name: "Detox Tea", price: 24.99, img: "imgs/D.png" },
    ];
  }

  calculateTotals();
}

// Calculate totals
function calculateTotals() {
  checkoutData.subtotal = checkoutData.cart.reduce(
    (sum, item) => sum + item.price,
    0
  );
  checkoutData.tax = checkoutData.subtotal * 0.08; // 8% tax
  checkoutData.total =
    checkoutData.subtotal +
    checkoutData.shippingCost +
    checkoutData.tax -
    checkoutData.discount;
}

// Render cart items
function renderCart() {
  const container = document.getElementById("checkout-cart-items");
  if (!container) return;

  if (checkoutData.cart.length === 0) {
    container.innerHTML = '<p class="empty-message">Your cart is empty</p>';
    return;
  }

  container.innerHTML = checkoutData.cart
    .map(
      (item) => `
    <div class="cart-item-checkout">
      <div class="item-image">
        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}">
      </div>
      <div class="item-details">
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="item-quantity">Quantity: 1</div>
      </div>
      <div class="item-price">$${item.price.toFixed(2)}</div>
    </div>
  `
    )
    .join("");
}

// Update all summary sections
function updateAllSummaries() {
  for (let i = 1; i <= 4; i++) {
    const subtotalEl = document.getElementById(`subtotal${i > 1 ? "-" + i : ""}`);
    const shippingEl = document.getElementById(`shipping${i > 1 ? "-" + i : ""}`);
    const taxEl = document.getElementById(`tax${i > 1 ? "-" + i : ""}`);
    const totalEl = document.getElementById(`total${i > 1 ? "-" + i : ""}`);

    if (subtotalEl) subtotalEl.textContent = `$${checkoutData.subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${checkoutData.shippingCost.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${checkoutData.tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${checkoutData.total.toFixed(2)}`;
  }

  // Update discount if applicable
  const discountRow = document.getElementById("discount-row");
  const discountEl = document.getElementById("discount");
  if (checkoutData.discount > 0) {
    if (discountRow) discountRow.style.display = "flex";
    if (discountEl) discountEl.textContent = `-$${checkoutData.discount.toFixed(2)}`;
  }
}

// Apply promo code
function applyPromo() {
  const input = document.getElementById("promo-input");
  const code = input.value.trim().toUpperCase();

  const promoCodes = {
    SAVE10: 0.1,
    WELCOME20: 0.2,
    FREESHIP: "free_shipping",
  };

  if (promoCodes[code]) {
    if (promoCodes[code] === "free_shipping") {
      checkoutData.shippingCost = 0;
      alert("Free shipping applied! 🎉");
    } else {
      checkoutData.discount = checkoutData.subtotal * promoCodes[code];
      alert(`Discount applied! You saved $${checkoutData.discount.toFixed(2)} 🎉`);
    }
    calculateTotals();
    updateAllSummaries();
    input.value = "";
  } else {
    alert("Invalid promo code");
  }
}

// Update shipping cost
function updateShipping() {
  const selectedShipping = document.querySelector('input[name="shipping"]:checked');
  if (selectedShipping) {
    checkoutData.shippingCost = parseFloat(selectedShipping.value);
    calculateTotals();
    updateAllSummaries();
  }
}

// Select payment method
function selectPaymentMethod(method) {
  document.querySelectorAll(".payment-option").forEach((opt) => {
    opt.classList.remove("active");
  });

  event.currentTarget.classList.add("active");

  if (method === "card") {
    document.getElementById("card-payment").style.display = "block";
    document.getElementById("paypal-payment").style.display = "none";
  } else {
    document.getElementById("card-payment").style.display = "none";
    document.getElementById("paypal-payment").style.display = "block";
  }
}

// Navigation functions
function nextStep() {
  // Validate current step
  if (!validateStep(currentStep)) {
    return;
  }

  // Save step data
  saveStepData(currentStep);

  // Move to next step
  const currentStepEl = document.getElementById(`step-${currentStep}`);
  currentStepEl.classList.remove("active");

  const currentProgressStep = document.querySelector(
    `.progress-step[data-step="${currentStep}"]`
  );
  currentProgressStep.classList.add("completed");

  currentStep++;

  const nextStepEl = document.getElementById(`step-${currentStep}`);
  nextStepEl.classList.add("active");

  const nextProgressStep = document.querySelector(
    `.progress-step[data-step="${currentStep}"]`
  );
  nextProgressStep.classList.add("active");

  // Special handling for confirmation step
  if (currentStep === 4) {
    populateConfirmation();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function prevStep() {
  const currentStepEl = document.getElementById(`step-${currentStep}`);
  currentStepEl.classList.remove("active");

  const currentProgressStep = document.querySelector(
    `.progress-step[data-step="${currentStep}"]`
  );
  currentProgressStep.classList.remove("active");

  currentStep--;

  const prevStepEl = document.getElementById(`step-${currentStep}`);
  prevStepEl.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToStep(step) {
  const currentStepEl = document.getElementById(`step-${currentStep}`);
  currentStepEl.classList.remove("active");

  const currentProgressStep = document.querySelector(
    `.progress-step[data-step="${currentStep}"]`
  );
  currentProgressStep.classList.remove("active");

  currentStep = step;

  const targetStepEl = document.getElementById(`step-${currentStep}`);
  targetStepEl.classList.add("active");

  const targetProgressStep = document.querySelector(
    `.progress-step[data-step="${currentStep}"]`
  );
  targetProgressStep.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Validate step
function validateStep(step) {
  if (step === 1) {
    if (checkoutData.cart.length === 0) {
      alert("Your cart is empty!");
      return false;
    }
  } else if (step === 2) {
    const form = document.getElementById("shipping-form");
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
  } else if (step === 3) {
    const form = document.getElementById("payment-form");
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
  }
  return true;
}

// Save step data
function saveStepData(step) {
  if (step === 2) {
    checkoutData.shipping = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      zip: document.getElementById("zip").value,
      country: document.getElementById("country").value,
    };
  } else if (step === 3) {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    checkoutData.payment = {
      method: paymentMethod,
    };

    if (paymentMethod === "card") {
      checkoutData.payment.cardNumber = document.getElementById("cardNumber").value;
      checkoutData.payment.cardName = document.getElementById("cardName").value;
      checkoutData.payment.expiry = document.getElementById("expiry").value;
    }
  }
}

// Populate confirmation
function populateConfirmation() {
  // Shipping details
  const shippingDetails = document.getElementById("shipping-details");
  shippingDetails.innerHTML = `
    ${checkoutData.shipping.firstName} ${checkoutData.shipping.lastName}<br>
    ${checkoutData.shipping.address}<br>
    ${checkoutData.shipping.city}, ${checkoutData.shipping.state} ${checkoutData.shipping.zip}<br>
    ${checkoutData.shipping.country}<br>
    ${checkoutData.shipping.email}<br>
    ${checkoutData.shipping.phone}
  `;

  // Payment details
  const paymentDetails = document.getElementById("payment-details");
  if (checkoutData.payment.method === "card") {
    const lastFour = checkoutData.payment.cardNumber.slice(-4);
    paymentDetails.innerHTML = `
      Credit Card ending in ${lastFour}<br>
      ${checkoutData.payment.cardName}
    `;
  } else {
    paymentDetails.innerHTML = "PayPal";
  }

  // Order items
  const confirmationItems = document.getElementById("confirmation-items");
  confirmationItems.innerHTML = checkoutData.cart
    .map(
      (item) => `
    <div class="cart-item-checkout">
      <div class="item-image">
        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}">
      </div>
      <div class="item-details">
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="item-quantity">Quantity: 1</div>
      </div>
      <div class="item-price">$${item.price.toFixed(2)}</div>
    </div>
  `
    )
    .join("");
}

// Place order
function placeOrder() {
  const termsCheckbox = document.getElementById("terms");
  if (!termsCheckbox.checked) {
    alert("Please agree to the Terms & Conditions");
    return;
  }

  // Simulate order processing
  const orderNumber = "KC" + Date.now().toString().slice(-8);

  // Hide current step
  document.getElementById(`step-${currentStep}`).classList.remove("active");

  // Show success step
  document.getElementById("success-step").style.display = "block";
  document.getElementById("order-number").textContent = orderNumber;
  document.getElementById("customer-email").textContent = checkoutData.shipping.email;

  // Clear cart
  localStorage.removeItem("kotyCono_cart");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Utility function
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Format card number input
document.addEventListener("DOMContentLoaded", () => {
  const cardNumberInput = document.getElementById("cardNumber");
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\s/g, "");
      let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
      e.target.value = formattedValue;
    });
  }

  const expiryInput = document.getElementById("expiry");
  if (expiryInput) {
    expiryInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }
});
