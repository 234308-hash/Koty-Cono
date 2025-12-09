const Cart = {
  items: [],

  add(name, price, img) {
    this.items.push({ name, price, img });
    this.render();
    this.updateCartCount();
    this.saveToStorage();
    
    // Show cart sidebar when item is added
    toggleCart(true);
  },

  remove(index) {
    this.items.splice(index, 1);
    this.render();
    this.updateCartCount();
    this.saveToStorage();
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  },

  updateCartCount() {
    const countElement = document.getElementById("cart-count");
    if (countElement) {
      countElement.textContent = this.items.length;
    }
  },

  render() {
    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");

    if (!container || !totalElement) return;

    if (this.items.length === 0) {
      container.innerHTML =
        '<div class="empty-cart">Your cart is empty<br>Start adding products!</div>';
      totalElement.textContent = "$0.00";
      return;
    }

    container.innerHTML = this.items
      .map(
        (item, index) => `
      <div class="cart-item">
        <img src="${this.escapeHtml(item.img)}" alt="${this.escapeHtml(
          item.name
        )}">
        <div class="cart-item-info">
          <b>${this.escapeHtml(item.name)}</b>
          <span>$${item.price.toFixed(2)}</span>
        </div>
        <button 
          class="remove-btn" 
          onclick="Cart.remove(${index})"
          aria-label="Remove ${this.escapeHtml(item.name)}">
          ×
        </button>
      </div>
    `
      )
      .join("");

    totalElement.textContent = `$${this.getTotal().toFixed(2)}`;
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  checkout() {
    if (this.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Save cart to localStorage for checkout page
    localStorage.setItem("kotyCono_cart", JSON.stringify(this.items));
    
    // Redirect to checkout page
    window.location.href = "checkout.html";
  },

  // Load cart from localStorage
  loadFromStorage() {
    const savedCart = localStorage.getItem("kotyCono_cart");
    if (savedCart) {
      this.items = JSON.parse(savedCart);
      this.render();
      this.updateCartCount();
    }
  },

  // Save cart to localStorage
  saveToStorage() {
    localStorage.setItem("kotyCono_cart", JSON.stringify(this.items));
  },
};

// Toggle cart sidebar
function toggleCart(forceState) {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");

  if (forceState !== undefined) {
    sidebar.classList.toggle("active", forceState);
    overlay.classList.toggle("active", forceState);
  } else {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  }

  // Prevent body scroll when cart is open
  if (sidebar.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

// Toggle mobile menu
function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  const toggle = document.querySelector(".mobile-menu-toggle");
  
  if (navLinks) {
    navLinks.classList.toggle("active");
    toggle.classList.toggle("active");
  }
}

// Smooth scroll for anchor links
document.addEventListener("DOMContentLoaded", () => {
  Cart.loadFromStorage();
  Cart.render();
  Cart.updateCartCount();

  // Add smooth scroll to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80; // Account for fixed navbar
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Close mobile menu if open
        const navLinks = document.querySelector(".nav-links");
        if (navLinks && navLinks.classList.contains("active")) {
          toggleMobileMenu();
        }
      }
    });
  });

  // Navbar scroll effect
  let lastScroll = 0;
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
    } else {
      navbar.style.boxShadow = "0 8px 24px rgba(17, 24, 39, 0.06)";
    }

    lastScroll = currentScroll;
  });
});

