// =====================
// Global Variables
// =====================
let userEmail = '';
let userCity = '';
let userZip = '';
let cart = {};

// =====================
// Utility Functions
// =====================

// Generate a unique event ID (for deduplication)
function generateEventID() {
  return 'evt_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
}

// Update user variables and persist to localStorage
function updateUserVariables() {
  const emailInput = document.getElementById('email');
  const cityInput = document.getElementById('city');
  const zipInput = document.getElementById('zip');

  userEmail = emailInput?.value || '';
  userCity = cityInput?.value || '';
  userZip = zipInput?.value || '';

  localStorage.setItem('userEmail', userEmail);
  localStorage.setItem('userCity', userCity);
  localStorage.setItem('userZip', userZip);
  localStorage.setItem('cartTotal', getCartTotal());
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <span>${message}</span>
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path d="M10 2C5.14 2 1 5.14 1 10s4.14 8 9 8 9-4.14 9-8S14.86 2 10 2z" fill="#fff" />
    </svg>
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Get total value of the cart
function getCartTotal() {
  return Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Save cart to localStorage
function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem('cart');
  cart = storedCart ? JSON.parse(storedCart) : {};
  updateCartCount();
}

// =====================
// Cart Functions
// =====================

// Update cart count in UI
function updateCartCount() {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    cartCountElement.textContent = cartCount;
  }
}

// Add item to cart
function addToCart(name, price) {
  if (cart[name]) {
    cart[name].quantity++;
  } else {
    cart[name] = { price, quantity: 1 };
  }
  updateCartCount();
  showNotification(`Added ${name} to cart!`);
  saveCartToLocalStorage();
}

// Remove item from cart
function removeFromCart(name) {
  if (cart[name]) {
    delete cart[name];
    updateCartCount();
    saveCartToLocalStorage();
  }
}

// =====================
// Cart Display Functions
// =====================

// Display cart table (for cart page)
function displayCartTable() {
  const cartTableBody = document.getElementById('cart-body');
  if (!cartTableBody) return;
  cartTableBody.innerHTML = '';

  for (const [name, item] of Object.entries(cart)) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${name}</td>
      <td>$${item.price}</td>
      <td>${item.quantity}</td>
      <td>$${item.price * item.quantity}</td>
    `;
    cartTableBody.appendChild(row);
  }

  const total = getCartTotal();
  const cartTotalElem = document.getElementById('cart-total');
  if (cartTotalElem) cartTotalElem.textContent = total.toFixed(2);
}

// Display cart summary (for checkout page)
function displayCartSummary() {
  const cartSummaryBody = document.getElementById('cart-summary-body');
  if (!cartSummaryBody) return;
  cartSummaryBody.innerHTML = '';

  for (const [name, item] of Object.entries(cart)) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="width:40%">${name}</td>
      <td style="width:20%;text-align:center">${item.quantity}</td>
      <td style="width:40%;text-align:right">$${item.price * item.quantity}</td>
    `;
    cartSummaryBody.appendChild(row);
  }

  const total = getCartTotal();
  const cartTotalElem = document.getElementById('cart-total');
  if (cartTotalElem) cartTotalElem.textContent = total.toFixed(2);
}

// =====================
// Checkout & Purchase
// =====================

// Initiate checkout
function initiateCheckout() {
  window.location.href = 'checkout.html';
}

// Complete purchase
function completePurchase() {
  // Generate and store eventID for deduplication
  const eventID = generateEventID();
  localStorage.setItem('eventID', eventID);

  // Save latest user/cart data
  updateUserVariables();

  // Clear the cart
  cart = {};
  saveCartToLocalStorage();
  updateCartCount();

  // Redirect to the purchase confirmation page
  window.location.href = 'purchase-confirmation.html';
}

// =====================
// Event Listeners & Initialization
// =====================

document.addEventListener('DOMContentLoaded', () => {
  // User input listeners
  ['email', 'city', 'zip'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('input', updateUserVariables);
  });
  updateUserVariables();

  // Load cart and update UI
  loadCartFromLocalStorage();

  // Display cart table if on cart page
  if (document.getElementById('cart-table')) displayCartTable();

  // Display cart summary if on checkout page
  if (document.getElementById('cart-summary-table')) {
    displayCartSummary();
  }

  // Purchase button listener
  const purchaseBtn = document.getElementById('purchase-btn');
  if (purchaseBtn) purchaseBtn.addEventListener('click', completePurchase);
});

// =====================
// Confirmation Page: Push Data to Data Layer for GTM
// =====================

if (window.location.pathname.includes('purchase-confirmation.html')) {
  window.addEventListener('load', function() {
    // Retrieve purchase/user data from localStorage
    var userEmail = localStorage.getItem('userEmail') || '';
    var userCity = localStorage.getItem('userCity') || '';
    var userZip = localStorage.getItem('userZip') || '';
    var cartTotal = localStorage.getItem('cartTotal') || '';
    var eventID = localStorage.getItem('eventID') || '';

    // Push purchase data to the Data Layer for GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'purchase',
      userEmail: userEmail,
      userCity: userCity,
      userZip: userZip,
      cartTotal: cartTotal,
      eventID: eventID
    });

    // Optionally clear localStorage to prevent duplicate events
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userCity');
    localStorage.removeItem('userZip');
    localStorage.removeItem('cartTotal');
    localStorage.removeItem('eventID');
  });
}