const PRODUCTS = {
  'coastal-tee': {
    name: 'Coastal Tee',
    image: 'assets/coastal-tee-concept.webp',
    sizes: ['Not sure', 'S', 'M', 'L', 'XL', 'XXL']
  },
  'coastal-hoodie': {
    name: 'Coastal Hoodie',
    image: 'assets/coastal-hoodie-concept.webp',
    sizes: ['Not sure', 'S', 'M', 'L', 'XL', 'XXL']
  },
  'freedom-jersey': {
    name: 'Freedom Jersey',
    image: 'assets/freedom-jersey-concept.webp',
    sizes: ['Not sure', 'XS', 'S', 'M', 'L', 'XL']
  }
};

const CART_KEY = 'explore-bike-order-draft-v1';

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    const cart = [];
    saved.forEach((item) => {
      if (!item || !Object.hasOwn(PRODUCTS, item.id) ||
        !PRODUCTS[item.id].sizes.includes(item.size) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return;
      const existing = cart.find((piece) => piece.id === item.id && piece.size === item.size);
      if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity);
      else cart.push({ id: item.id, size: item.size, quantity: item.quantity });
    });
    return cart;
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount(cart);
    return true;
  } catch {
    return false;
  }
}

function updateCartCount(cart = readCart()) {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((label) => {
    label.textContent = String(count);
  });
}

let toastTimeout;
const toast = document.querySelector('.toast');
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { toast.hidden = true; }, 3500);
}

const categoryToolbar = document.querySelector('.category-toolbar');

if (categoryToolbar) {
  const grid = document.querySelector('.product-grid');
  const cards = [...grid.querySelectorAll('.product-card[data-category]')];
  const filters = [...categoryToolbar.querySelectorAll('[data-category-filter]')];
  const status = categoryToolbar.querySelector('[data-category-status]');
  const categories = new Set(filters.map((button) => button.dataset.categoryFilter));

  filters.forEach((button) => {
    const count = button.dataset.categoryFilter === 'all'
      ? cards.length
      : cards.filter((card) => card.dataset.category === button.dataset.categoryFilter).length;
    button.querySelector('[data-category-count]').textContent = String(count).padStart(2, '0');
  });

  function showCategory(category) {
    let visibleCount = 0;
    cards.forEach((card) => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) visibleCount += 1;
    });
    filters.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.categoryFilter === category));
    });
    grid.classList.toggle('is-filtered', category !== 'all');
    status.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'piece' : 'pieces'}`;
  }

  const requestedCategory = new URLSearchParams(window.location.search).get('category');
  const initialCategory = categories.has(requestedCategory) ? requestedCategory : 'all';
  if (initialCategory !== 'all') grid.classList.add('has-category-choice');
  showCategory(initialCategory);
  categoryToolbar.hidden = false;

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.categoryFilter;
      grid.classList.add('has-category-choice');
      showCategory(category);
      try {
        const url = new URL(window.location.href);
        if (category === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', category);
        url.hash = 'collection';
        window.history.replaceState(null, '', url);
      } catch {
        // Filtering still works when a local file browser blocks history updates.
      }
    });
  });
}

document.querySelectorAll('[data-product-id] .add-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const card = form.closest('[data-product-id]');
    const id = card.dataset.productId;
    const size = form.elements.size.value;
    const quantity = Number(form.elements.quantity?.value || 1);
    if (!Object.hasOwn(PRODUCTS, id) || !PRODUCTS[id].sizes.includes(size)) return;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;

    const cart = readCart();
    const existing = cart.find((item) => item.id === id && item.size === size);
    if (existing) {
      if (existing.quantity + quantity > 99) {
        showToast('Maximum quantity reached for this size.');
        return;
      }
      existing.quantity += quantity;
    } else {
      cart.push({ id, size, quantity });
    }

    if (saveCart(cart)) {
      showToast(`${PRODUCTS[id].name} saved to your picks.`);
      form.reset();
    } else {
      showToast('This browser could not save your picks. Please check storage settings.');
    }
  });
});

document.querySelectorAll('.detail-gallery').forEach((gallery) => {
  const stage = gallery.querySelector('.detail-stage');
  const caption = gallery.querySelector('[data-detail-caption]');
  const viewButtons = gallery.querySelectorAll('.detail-view-button');
  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      stage.dataset.view = button.dataset.view;
      viewButtons.forEach((choice) => {
        choice.setAttribute('aria-pressed', String(choice === button));
      });
      caption.textContent = button.dataset.view === 'front'
        ? 'Digital design preview. Final garment may differ.'
        : 'Enlarged crop of the same digital preview, not a garment detail photograph.';
    });
  });
});

const orderItems = document.getElementById('order-items');
const orderContent = document.getElementById('order-content');
const emptyOrder = document.getElementById('empty-order');
const itemCount = document.querySelector('[data-item-count]');
const summaryCount = document.querySelector('[data-summary-count]');
const copyStatus = document.getElementById('copy-status');
const copySummary = document.getElementById('copy-summary');

function createOrderRow(item, index) {
  const product = PRODUCTS[item.id];
  const row = document.createElement('article');
  row.className = 'order-row';
  row.dataset.pickKey = JSON.stringify([item.id, item.size]);

  const image = document.createElement('img');
  image.src = product.image;
  image.alt = `${product.name} design preview`;
  image.width = 160;
  image.height = 160;
  image.loading = 'lazy';
  image.decoding = 'async';
  const imageLink = document.createElement('a');
  imageLink.href = `${item.id}.html`;
  imageLink.setAttribute('aria-label', `View ${product.name} details`);
  imageLink.append(image);

  const details = document.createElement('div');
  details.className = 'order-row-details';
  const tag = document.createElement('p');
  tag.className = 'product-type';
  tag.textContent = 'Design preview';
  const name = document.createElement('h3');
  const nameLink = document.createElement('a');
  nameLink.href = `${item.id}.html`;
  nameLink.textContent = product.name;
  name.append(nameLink);
  const size = document.createElement('p');
  size.textContent = `Preferred size: ${item.size}`;
  details.append(tag, name, size);

  const actions = document.createElement('div');
  actions.className = 'quantity-controls';
  const minus = document.createElement('button');
  minus.type = 'button';
  minus.textContent = '-';
  minus.setAttribute('aria-label', `Decrease ${product.name}, ${item.size}`);
  minus.dataset.action = 'decrease';
  minus.dataset.index = String(index);
  minus.disabled = item.quantity === 1;
  const count = document.createElement('span');
  count.textContent = String(item.quantity);
  count.setAttribute('aria-label', `Quantity ${item.quantity}`);
  const plus = document.createElement('button');
  plus.type = 'button';
  plus.textContent = '+';
  plus.setAttribute('aria-label', `Increase ${product.name}, ${item.size}`);
  plus.dataset.action = 'increase';
  plus.dataset.index = String(index);
  plus.disabled = item.quantity === 99;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-item';
  remove.textContent = 'Remove';
  remove.setAttribute('aria-label', `Remove ${product.name}, ${item.size}`);
  remove.dataset.action = 'remove';
  remove.dataset.index = String(index);
  actions.append(minus, count, plus, remove);
  row.append(imageLink, details, actions);
  return row;
}

function renderOrder(focusTarget) {
  if (!orderItems) return;
  const activeButton = document.activeElement?.closest('button[data-action]');
  if (!focusTarget && activeButton && orderItems.contains(activeButton)) {
    focusTarget = {
      key: activeButton.closest('.order-row').dataset.pickKey,
      index: Number(activeButton.dataset.index),
      action: activeButton.dataset.action
    };
  }
  const cart = readCart();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  orderItems.replaceChildren(...cart.map(createOrderRow));
  orderContent.hidden = cart.length === 0;
  emptyOrder.hidden = cart.length !== 0;
  itemCount.textContent = `${count} ${count === 1 ? 'piece' : 'pieces'}`;
  summaryCount.textContent = String(count);
  copyStatus.textContent = '';
  updateCartCount(cart);
  if (focusTarget) {
    const rows = [...orderItems.children];
    const row = rows.find((candidate) => candidate.dataset.pickKey === focusTarget.key) ||
      rows[Math.min(focusTarget.index, rows.length - 1)];
    const preferred = row?.querySelector(`[data-action="${focusTarget.action}"]`);
    const nextFocus = preferred && !preferred.disabled ? preferred :
      row?.querySelector('button[data-action]:not(:disabled)') || emptyOrder.querySelector('a');
    nextFocus?.focus();
  }
}

if (orderItems) {
  orderItems.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const cart = readCart();
    const pickKey = button.closest('.order-row').dataset.pickKey;
    const index = cart.findIndex((item) => JSON.stringify([item.id, item.size]) === pickKey);
    if (index < 0) { renderOrder(); return; }
    const focusTarget = { key: button.closest('.order-row').dataset.pickKey, index, action: button.dataset.action };
    if (button.dataset.action === 'remove') cart.splice(index, 1);
    if (button.dataset.action === 'decrease') cart[index].quantity = Math.max(1, cart[index].quantity - 1);
    if (button.dataset.action === 'increase') cart[index].quantity = Math.min(99, cart[index].quantity + 1);
    if (saveCart(cart)) renderOrder(focusTarget);
    else showToast('This browser could not update your picks. Please check storage settings.');
  });

  copySummary.addEventListener('click', async () => {
    const cart = readCart();
    const lines = [`${window.SITE_BRAND?.name || 'Explore'} — My Picks`, 'Saved in this browser only.', 'No order has been submitted.', ''];
    cart.forEach((item, index) => {
      lines.push(`${index + 1}. ${PRODUCTS[item.id].name} | Preferred size: ${item.size} | Quantity: ${item.quantity}`);
    });
    lines.push('', 'Prices, availability, and final specifications are not confirmed.');
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      copyStatus.textContent = 'Summary copied. Nothing was sent.';
    } catch {
      copyStatus.textContent = 'Could not copy the summary in this browser.';
    }
  });

  renderOrder();
}

window.addEventListener('storage', (event) => {
  if (event.key !== CART_KEY && event.key !== null) return;
  if (orderItems) renderOrder();
  else updateCartCount();
});
if (!orderItems) updateCartCount();
