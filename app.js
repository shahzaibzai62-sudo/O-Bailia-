/* ═══════════════════════════════════════════════════════════════
   O-BAILIA RESTAURANT — House of Taste
   app.js | Full Application Controller — Bugfixed v1.1
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── GLOBAL STATE ─────────────────────────────────────────────── */
let menuItems         = [];
let cart              = [];
let currentMenuFilter = 'all';
let filterTabsInited  = false;   // guard: prevent duplicate filter-tab listeners

const settings = {
  waNumber:       '923357367364',
  deliveryCharge: 120,
  currencySymbol: 'Rs.'
};

/* ── DEMO MENU (fallback when Firestore unavailable) ──────────── */
const demoMenu = [
  {
    id: 'burger-001',
    name: 'O-Bailia Lava Burger',
    description: 'Signature double smash patty, lava cheese sauce, jalapeños, crispy onions, special O-Bailia sauce.',
    category: 'burgers', emoji: '🍔', badge: '🔥 Signature',
    variants: [{ label: 'Single', price: 350 }, { label: 'Double', price: 480 }]
  },
  {
    id: 'burger-002',
    name: 'Spicy Crunch Burger',
    description: 'Crispy fried chicken thigh, sriracha mayo, pickles, coleslaw, toasted brioche bun.',
    category: 'burgers', emoji: '🌶️', badge: null,
    variants: [{ label: 'Regular', price: 280 }, { label: 'Large', price: 360 }]
  },
  {
    id: 'burger-003',
    name: 'Zinger Stack',
    description: 'Double crispy zinger strips, cheese slice, fresh lettuce, tomato, garlic aioli.',
    category: 'burgers', emoji: '🥪', badge: null,
    variants: [{ label: 'Single', price: 300 }, { label: 'Double', price: 420 }]
  },
  {
    id: 'pizza-001',
    name: 'Crown Crust Margherita',
    description: 'Hand-stretched Crown Crust base, San Marzano tomato sauce, fresh mozzarella, basil.',
    category: 'pizzas', emoji: '🍕', badge: '⭐ Best Seller',
    variants: [{ label: 'Small', price: 450 }, { label: 'Medium', price: 650 }, { label: 'Large', price: 850 }]
  },
  {
    id: 'pizza-002',
    name: 'Spicy Chicken Supreme',
    description: 'Crown Crust base, bbq sauce, spicy chicken chunks, bell peppers, onion, double cheese blend.',
    category: 'pizzas', emoji: '🍕', badge: null,
    variants: [{ label: 'Small', price: 520 }, { label: 'Medium', price: 720 }, { label: 'Large', price: 920 }]
  },
  {
    id: 'pizza-003',
    name: 'Meat Lovers Special',
    description: 'Loaded with beef pepperoni, seekh kebab chunks, chicken tikka, mozzarella on our signature Crown Crust.',
    category: 'pizzas', emoji: '🍕', badge: '🔥 Hot Pick',
    variants: [{ label: 'Medium', price: 780 }, { label: 'Large', price: 980 }]
  },
  {
    id: 'soup-001',
    name: 'Classic Hot & Sour Soup',
    description: 'Traditional Chinese-style hot & sour broth with silky egg ribbons, mushrooms, bamboo shoots, tofu.',
    category: 'soups', emoji: '🍜', badge: '🏆 Famous',
    variants: [{ label: 'Half', price: 180 }, { label: 'Full', price: 320 }]
  },
  {
    id: 'soup-002',
    name: 'Chicken Corn Soup',
    description: 'Velvety shredded chicken broth blended with sweet corn, beaten egg drizzle, white pepper.',
    category: 'soups', emoji: '🍲', badge: null,
    variants: [{ label: 'Half', price: 160 }, { label: 'Full', price: 290 }]
  },
  {
    id: 'soup-003',
    name: 'Manchow Soup',
    description: 'Spicy dark broth packed with vegetables, soy, vinegar, served with crispy noodles on top.',
    category: 'soups', emoji: '🥣', badge: null,
    variants: [{ label: 'Half', price: 170 }, { label: 'Full', price: 300 }]
  },
  {
    id: 'broast-001',
    name: 'O-Bailia Crispy Broast',
    description: '24-hour marinated whole chicken pieces, pressure-fried to golden perfection with secret spice coating.',
    category: 'broast', emoji: '🍗', badge: '🔥 Must Try',
    variants: [{ label: '2 Pcs', price: 380 }, { label: '4 Pcs', price: 720 }, { label: '8 Pcs', price: 1350 }]
  },
  {
    id: 'broast-002',
    name: 'Spicy Wings Basket',
    description: 'Buffalo-glazed crispy wings, ranch dip, jalapeño slices. Perfect game-day basket.',
    category: 'broast', emoji: '🍖', badge: null,
    variants: [{ label: '6 Pcs', price: 320 }, { label: '12 Pcs', price: 600 }]
  },
  {
    id: 'broast-003',
    name: 'Fish & Chips Platter',
    description: 'Beer-battered fish fillets, crispy golden fries, tartare sauce, lemon wedge.',
    category: 'broast', emoji: '🐟', badge: null,
    variants: [{ label: 'Regular', price: 420 }, { label: 'Large', price: 580 }]
  },
  {
    id: 'roll-001',
    name: 'Seekh Kebab Paratha Roll',
    description: 'Juicy seekh kebab in a flaky layered paratha with onions, mint chutney, and special raita.',
    category: 'rolls', emoji: '🫓', badge: '⭐ Local Fav',
    variants: [{ label: 'Single', price: 180 }, { label: 'Double', price: 320 }]
  },
  {
    id: 'roll-002',
    name: 'Chicken Tikka Roll',
    description: 'Chargrilled chicken tikka chunks, fresh vegetables, garlic mayo wrapped in warm paratha.',
    category: 'rolls', emoji: '🌯', badge: null,
    variants: [{ label: 'Single', price: 200 }, { label: 'Double', price: 350 }]
  },
  {
    id: 'roll-003',
    name: 'Club Sandwich Roll',
    description: 'Grilled chicken, fried egg, cheese slice, lettuce, tomato in a toasted flatbread wrap.',
    category: 'rolls', emoji: '🥙', badge: null,
    variants: [{ label: 'Regular', price: 220 }]
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  UTILITY                                                        */
/* ─────────────────────────────────────────────────────────────── */

/* XSS Sanitizer — converts any string to safe HTML text */
function sanitize(str) {
  const el = document.createElement('div');
  el.textContent = String(str == null ? '' : str);
  return el.innerHTML;
}

/* ─────────────────────────────────────────────────────────────── */
/*  TOAST                                                          */
/* ─────────────────────────────────────────────────────────────── */
let _toastTimer = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ─────────────────────────────────────────────────────────────── */
/*  NAVBAR SCROLL EFFECT                                           */
/* ─────────────────────────────────────────────────────────────── */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on init
}

/* ─────────────────────────────────────────────────────────────── */
/*  INTERSECTION OBSERVER — SCROLL REVEAL                          */
/* ─────────────────────────────────────────────────────────────── */

/*
  observeRevealElements(root)
  BUG FIX: Takes an optional DOM root so freshly rendered menu cards
  (inserted after DOMContentLoaded) are also observed. Without a root
  argument the whole document is scanned.
*/
function observeRevealElements(root) {
  const scope   = (root instanceof Element) ? root : document;
  const targets = scope.querySelectorAll('.reveal:not(.visible)');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  targets.forEach((el, i) => {
    // Only set delay if not already manually set
    if (!el.style.transitionDelay) {
      el.style.transitionDelay = `${Math.min(i * 0.06, 0.42)}s`;
    }
    observer.observe(el);
  });
}

/* Kick off observation for static HTML elements on first load */
function initRevealObserver() {
  observeRevealElements(null);
}

/* ─────────────────────────────────────────────────────────────── */
/*  FIRESTORE FETCH ENGINE                                         */
/* ─────────────────────────────────────────────────────────────── */

/*
  BUG FIX: Dynamic import of firestore module happens here, NOT in
  index.html's module script. This avoids a duplicate-module issue
  and ensures __firestore is readable before we call getDocs.
*/
async function fetchMenuFromFirestore() {
  try {
    if (!window.__firestore) {
      throw new Error('Firestore not initialized (demo mode).');
    }
    const { collection, getDocs } = await import(
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
    );
    const snapshot = await getDocs(collection(window.__firestore, 'menuItems'));
    const items = [];
    snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
    if (items.length === 0) throw new Error('Firestore collection empty — using demo data.');
    return items;
  } catch (err) {
    console.warn('[O-Bailia] Firestore:', err.message);
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────── */
/*  MENU INIT CONTROLLER                                           */
/* ─────────────────────────────────────────────────────────────── */
async function initMenu() {
  const fetched = await fetchMenuFromFirestore();
  menuItems = fetched || demoMenu;
  renderMenu();

  // BUG FIX: Only attach filter tab listeners ONCE — prevents duplicate handlers
  if (!filterTabsInited) {
    initFilterTabs();
    filterTabsInited = true;
  }
}

/* ─────────────────────────────────────────────────────────────── */
/*  RENDER MENU                                                    */
/* ─────────────────────────────────────────────────────────────── */
function renderMenu() {
  const grid    = document.getElementById('menu-grid');
  const emptyEl = document.getElementById('empty-state');
  if (!grid) return;

  const filtered = currentMenuFilter === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === currentMenuFilter);

  // Clear all existing cards (including skeleton loaders)
  grid.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  filtered.forEach((item) => {
    const card = buildMenuCard(item);
    grid.appendChild(card);
  });

  // Observe the freshly rendered cards for scroll-reveal
  observeRevealElements(grid);
}

/* ─────────────────────────────────────────────────────────────── */
/*  BUILD MENU CARD DOM ELEMENT                                    */
/* ─────────────────────────────────────────────────────────────── */
function buildMenuCard(item) {
  const card = document.createElement('article');
  card.className = 'menu-card reveal';
  card.setAttribute('role', 'listitem');
  card.dataset.itemId = item.id;

  // Normalize variants
  const variants = (Array.isArray(item.variants) && item.variants.length)
    ? item.variants
    : [{ label: 'Regular', price: (item.price || 0) }];

  /*
    BUG FIX: Use a state object so the Add-to-Cart closure ALWAYS reads
    the currently selected variant — not a stale closure value.
  */
  const state = { activeVariant: variants[0] };

  // Build badge HTML
  const badgeHTML = item.badge
    ? `<div class="menu-card-badge">${sanitize(item.badge)}</div>`
    : '';

  // Build variant pills HTML (only shown when multiple variants exist)
  const variantPillsHTML = variants.length > 1
    ? `<div class="variant-pills" role="group" aria-label="Select size or portion">
        ${variants.map((v, vi) =>
          `<button
            class="variant-pill${vi === 0 ? ' active' : ''}"
            data-variant-index="${vi}"
            data-price="${Number(v.price)}"
            aria-pressed="${vi === 0 ? 'true' : 'false'}"
            type="button"
          >${sanitize(v.label)} — ${sanitize(settings.currencySymbol)}${sanitize(String(v.price))}</button>`
        ).join('')}
      </div>`
    : '';

  card.innerHTML = `
    ${badgeHTML}
    <div class="menu-card-emoji" aria-hidden="true">${sanitize(item.emoji || '🍽️')}</div>
    <div class="menu-card-body">
      <h3 class="menu-card-name">${sanitize(item.name)}</h3>
      <p class="menu-card-desc">${sanitize(item.description || '')}</p>
      ${variantPillsHTML}
      <div class="menu-card-price-row">
        <div class="menu-card-price">
          <span class="price-currency">${sanitize(settings.currencySymbol)}</span><span class="price-value">${sanitize(String(state.activeVariant.price))}</span>
        </div>
      </div>
      <button class="add-to-cart-btn" type="button" aria-label="Add ${sanitize(item.name)} to cart">
        <span aria-hidden="true">+</span> Add to Cart
      </button>
    </div>
  `;

  // ── Variant pill interactions ────────────────────────────────
  const pills        = card.querySelectorAll('.variant-pill');
  const priceDisplay = card.querySelector('.price-value');

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      // Deactivate all pills
      pills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-pressed', 'false');
      });
      // Activate clicked pill
      pill.classList.add('active');
      pill.setAttribute('aria-pressed', 'true');
      // Update state object — closure in Add-to-Cart will read this
      const varIdx        = parseInt(pill.dataset.variantIndex, 10);
      state.activeVariant = variants[varIdx];
      // Update displayed price
      if (priceDisplay) priceDisplay.textContent = state.activeVariant.price;
    });
  });

  // ── Add to Cart button ───────────────────────────────────────
  card.querySelector('.add-to-cart-btn').addEventListener('click', () => {
    addToCart(item, state.activeVariant);
  });

  return card;
}

/* ─────────────────────────────────────────────────────────────── */
/*  FILTER TABS                                                    */
/* ─────────────────────────────────────────────────────────────── */
function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Update active state visually and ARIA
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update filter state and re-render menu
      currentMenuFilter = tab.dataset.filter;
      renderMenu();
    });
  });
}

/* ─────────────────────────────────────────────────────────────── */
/*  CART HELPERS                                                   */
/* ─────────────────────────────────────────────────────────────── */

/* Unique key per item + variant combination */
function generateCartKey(item, variant) {
  return `${item.id}__${variant.label}`;
}

function addToCart(item, variant) {
  const key      = generateCartKey(item, variant);
  const existing = cart.find(c => c.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key,
      itemId:   item.id,
      name:     item.name,
      emoji:    item.emoji || '🍽️',
      variant:  variant.label,
      price:    variant.price,
      quantity: 1
    });
  }

  updateCartBadge();
  bumpCartBadge();

  // Only re-render cart body if the drawer is currently open
  const overlay = document.getElementById('cart-overlay');
  if (overlay && overlay.classList.contains('open')) {
    renderCartDrawer();
  }

  showToast(`✅ ${item.name} (${variant.label}) added!`);
}

function incrementCartItem(key) {
  const entry = cart.find(c => c.key === key);
  if (entry) entry.quantity += 1;
  updateCartBadge();
  renderCartDrawer();
}

function decrementCartItem(key) {
  const idx = cart.findIndex(c => c.key === key);
  if (idx === -1) return;
  if (cart[idx].quantity > 1) {
    cart[idx].quantity -= 1;
  } else {
    cart.splice(idx, 1);
  }
  updateCartBadge();
  renderCartDrawer();
}

function removeCartItem(key) {
  const idx = cart.findIndex(c => c.key === key);
  if (idx === -1) return;
  const name = cart[idx].name;
  cart.splice(idx, 1);
  updateCartBadge();
  renderCartDrawer();
  showToast(`🗑️ ${name} removed`);
}

function getCartSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartTotal() {
  const subtotal = getCartSubtotal();
  return cart.length > 0 ? subtotal + settings.deliveryCharge : 0;
}

function getTotalItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = getTotalItemCount();
}

function bumpCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  badge.classList.remove('bump');
  void badge.offsetWidth; // Force reflow so animation restarts
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 350);
}

/* ─────────────────────────────────────────────────────────────── */
/*  RENDER CART DRAWER                                             */
/* ─────────────────────────────────────────────────────────────── */
function renderCartDrawer() {
  const body   = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if (!body || !footer) return;

  /* ── Empty state ── */
  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p class="cart-empty-text">Your cart is empty.<br />Add some delicious items!</p>
      </div>`;
    footer.innerHTML = '';
    return;
  }

  /* ── Cart item rows — built via DOM for reliable event binding ── */
  body.innerHTML = '';
  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.dataset.key = item.key;

    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${sanitize(item.emoji)} ${sanitize(item.name)}</div>
        <div class="cart-item-variant">${sanitize(item.variant)}</div>
        <div class="cart-item-unit-price">${sanitize(settings.currencySymbol)} ${sanitize(String(item.price))} each</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" type="button" aria-label="Decrease quantity of ${sanitize(item.name)}">−</button>
        <span class="qty-value" aria-label="Quantity ${item.quantity}">${item.quantity}</span>
        <button class="qty-btn" type="button" aria-label="Increase quantity of ${sanitize(item.name)}">+</button>
      </div>
      <div class="cart-item-subtotal" aria-label="Subtotal">
        ${sanitize(settings.currencySymbol)} ${sanitize(String(item.price * item.quantity))}
      </div>
      <button class="cart-item-remove" type="button" aria-label="Remove ${sanitize(item.name)} from cart">✕</button>
    `;

    // Capture key in closure — safe and independent per row
    const k = item.key;
    const qtyBtns = row.querySelectorAll('.qty-btn');
    qtyBtns[0].addEventListener('click', () => decrementCartItem(k));
    qtyBtns[1].addEventListener('click', () => incrementCartItem(k));
    row.querySelector('.cart-item-remove').addEventListener('click', () => removeCartItem(k));

    body.appendChild(row);
  });

  /* ── Totals & WhatsApp button ── */
  const subtotal = getCartSubtotal();
  const total    = getCartTotal();

  footer.innerHTML = `
    <div class="cart-totals">
      <div class="cart-total-row">
        <span class="label">Subtotal</span>
        <span class="value">${sanitize(settings.currencySymbol)} ${sanitize(String(subtotal))}</span>
      </div>
      <div class="cart-total-row">
        <span class="label">Delivery Charge</span>
        <span class="value">${sanitize(settings.currencySymbol)} ${sanitize(String(settings.deliveryCharge))}</span>
      </div>
      <div class="cart-total-row grand">
        <span class="label">Grand Total</span>
        <span class="value">${sanitize(settings.currencySymbol)} ${sanitize(String(total))}</span>
      </div>
    </div>
    <button class="btn btn--gold btn--full" id="whatsapp-checkout-btn" type="button">
      📲 Order via WhatsApp
    </button>
    <p class="cart-checkout-note">
      You'll be redirected to WhatsApp to confirm your order.
    </p>
  `;

  // BUG FIX: Bind WhatsApp button AFTER innerHTML is set — fresh DOM node each time
  const waBtn = document.getElementById('whatsapp-checkout-btn');
  if (waBtn) waBtn.addEventListener('click', launchWhatsAppCheckout);
}

/* ─────────────────────────────────────────────────────────────── */
/*  WHATSAPP ORDER SLIP COMPILER                                   */
/* ─────────────────────────────────────────────────────────────── */
function launchWhatsAppCheckout() {
  if (cart.length === 0) {
    showToast('⚠️ Your cart is empty!');
    return;
  }

  const now  = new Date();
  const date = now.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });

  const lines = [];
  lines.push('🍽️ *O-BAILIA RESTAURANT — House of Taste*');
  lines.push('📍 Kot Sultan, Nawabshah Road, Sanghar, Sindh');
  lines.push(`📅 ${date}  🕐 ${time}`);
  lines.push('──────────────────────────');
  lines.push('*📋 ORDER DETAILS:*');
  lines.push('');

  cart.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    lines.push(
      `${index + 1}. *${item.emoji} ${item.name}*\n` +
      `   Size: ${item.variant}\n` +
      `   Qty: ${item.quantity} × ${settings.currencySymbol} ${item.price}\n` +
      `   Subtotal: *${settings.currencySymbol} ${lineTotal}*`
    );
  });

  const subtotal = getCartSubtotal();
  const total    = getCartTotal();

  lines.push('');
  lines.push('──────────────────────────');
  lines.push('🧾 *ORDER SUMMARY:*');
  lines.push(`Items Subtotal : ${settings.currencySymbol} ${subtotal}`);
  lines.push(`Delivery Charge: ${settings.currencySymbol} ${settings.deliveryCharge}`);
  lines.push(`*GRAND TOTAL   : ${settings.currencySymbol} ${total}*`);
  lines.push('');
  lines.push('──────────────────────────');
  lines.push('📦 *Please provide your delivery address.*');
  lines.push('Thank you for choosing O-Bailia! 🔥');

  const text   = lines.join('\n');
  const waURL  = `https://wa.me/${settings.waNumber}?text=${encodeURIComponent(text)}`;

  window.open(waURL, '_blank', 'noopener,noreferrer');
  closeCart();
}

/* ─────────────────────────────────────────────────────────────── */
/*  CART DRAWER OPEN / CLOSE                                       */
/* ─────────────────────────────────────────────────────────────── */
function openCart() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  renderCartDrawer();                  // always render fresh on open
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Delay focus until the slide animation reaches the viewer
  setTimeout(() => {
    const closeBtn = document.getElementById('cart-close-btn');
    if (closeBtn) closeBtn.focus();
  }, 180);
}

function closeCart() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';

  // Return focus to the trigger for accessibility
  const triggerBtn = document.getElementById('cart-trigger-btn');
  if (triggerBtn) triggerBtn.focus();
}

/* ─────────────────────────────────────────────────────────────── */
/*  CART UI BINDINGS                                               */
/* ─────────────────────────────────────────────────────────────── */
function initCartUI() {
  // Open cart
  const triggerBtn = document.getElementById('cart-trigger-btn');
  if (triggerBtn) triggerBtn.addEventListener('click', openCart);

  // Close cart via ✕ button
  const closeBtn = document.getElementById('cart-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeCart);

  // Close cart by clicking the dark backdrop (not the drawer itself)
  const overlay = document.getElementById('cart-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCart();
    });
  }

  // Close cart via ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const ol = document.getElementById('cart-overlay');
      if (ol && ol.classList.contains('open')) closeCart();
    }
  });
}

/* ─────────────────────────────────────────────────────────────── */
/*  SMOOTH SCROLL FOR ANCHOR LINKS                                 */
/* ─────────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = 68; // matches --nav-h CSS variable
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────────────────────────── */
/*  PWA SERVICE WORKER REGISTRATION                                */
/* ─────────────────────────────────────────────────────────────── */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(reg  => console.log('[O-Bailia SW] Registered:', reg.scope))
      .catch(err => console.warn('[O-Bailia SW] Registration failed:', err));
  });
}

/* ─────────────────────────────────────────────────────────────── */
/*  FIREBASE READINESS GUARD                                       */
/* ─────────────────────────────────────────────────────────────── */
function waitForFirebaseAndInit() {
  /*
    BUG FIX: The Firebase module script in index.html uses top-level await
    so it MIGHT complete before or after app.js (which has `defer`). We
    check the flag first; if already ready, we init immediately. Otherwise,
    we listen for the 'firebase-ready' event. A 3.5 s hard fallback ensures
    the demo menu always loads even if Firebase never responds.
  */
  if (window.__firestoreReady !== undefined) {
    // Firebase module already done (flag set, one way or the other)
    initMenu();
    return;
  }

  // Event not yet fired — listen for it
  document.addEventListener('firebase-ready', () => {
    initMenu();
  }, { once: true });

  // Hard fallback: if 'firebase-ready' never fires within 3.5 s, load demo
  setTimeout(() => {
    if (menuItems.length === 0) {
      console.warn('[O-Bailia] Firebase timeout — loading demo menu.');
      initMenu();
    }
  }, 3500);
}

/* ─────────────────────────────────────────────────────────────── */
/*  APPLICATION BOOTSTRAP                                          */
/* ─────────────────────────────────────────────────────────────── */
function boot() {
  initNavbarScroll();
  initRevealObserver();
  initCartUI();
  initSmoothScroll();
  registerServiceWorker();
  updateCartBadge();         // ensure badge shows 0 on first paint
  waitForFirebaseAndInit();  // async menu load (Firestore or demo)

  console.log(
    '%c🍔 O-Bailia Restaurant%c — House of Taste loaded successfully!',
    'color:#E63946;font-weight:700;font-size:13px;',
    'color:#F4A261;font-size:13px;'
  );
}

/*
  BUG FIX: app.js is loaded with `defer` in index.html so the DOM is
  always ready by the time this script runs. `DOMContentLoaded` guard
  is kept as a safety net in case the file is ever used without defer.
*/
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
