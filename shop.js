const PRODUCTS = {
  'coastal-tee': {
    name: 'Coastal Graphic Tee',
    image: 'assets/coastal-tee-concept.png',
    sizes: ['Not sure', 'S', 'M', 'L', 'XL', 'XXL']
  },
  'coastal-hoodie': {
    name: 'Coastal Pullover',
    image: 'assets/coastal-hoodie-concept.png',
    sizes: ['Not sure', 'S', 'M', 'L', 'XL', 'XXL']
  },
  'freedom-jersey': {
    name: 'Freedom Jersey',
    image: 'assets/freedom-jersey-concept.png',
    sizes: ['Not sure', 'XS', 'S', 'M', 'L', 'XL']
  }
};

const CART_KEY = 'explore-bike-order-draft-v1';

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) =>
      item && Object.hasOwn(PRODUCTS, item.id) &&
      PRODUCTS[item.id].sizes.includes(item.size) &&
      Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99
    );
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
function showToast(message) {
  const toast = document.querySelector('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { toast.hidden = true; }, 3500);
}

document.querySelectorAll('[data-product-id] .add-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const card = form.closest('[data-product-id]');
    const id = card.dataset.productId;
    const size = form.elements.size.value;
    const quantity = Number(form.elements.quantity?.value || 1);
    if (!PRODUCTS[id]?.sizes.includes(size)) return;
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
      showToast(`${PRODUCTS[id].name} added to your draft.`);
      form.reset();
    } else {
      showToast('This browser could not save your draft. Please check storage settings.');
    }
  });
});

document.querySelectorAll('.detail-gallery').forEach((gallery) => {
  const stage = gallery.querySelector('.detail-stage');
  const caption = gallery.querySelector('[data-detail-caption]');
  gallery.querySelectorAll('.detail-view-button').forEach((button) => {
    button.addEventListener('click', () => {
      stage.dataset.view = button.dataset.view;
      gallery.querySelectorAll('.detail-view-button').forEach((choice) => {
        choice.setAttribute('aria-pressed', String(choice === button));
      });
      caption.textContent = button.dataset.view === 'front'
        ? 'Digital design preview. Final garment may differ.'
        : 'Enlarged crop of the same digital preview, not a garment detail photograph.';
    });
  });
});

const orderItems = document.getElementById('order-items');

function createOrderRow(item, index) {
  const product = PRODUCTS[item.id];
  const row = document.createElement('article');
  row.className = 'order-row';

  const image = document.createElement('img');
  image.src = product.image;
  image.alt = `${product.name} design preview`;
  image.width = 160;
  image.height = 160;
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

function renderOrder() {
  if (!orderItems) return;
  const cart = readCart();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  orderItems.replaceChildren(...cart.map(createOrderRow));
  document.getElementById('order-content').hidden = cart.length === 0;
  document.getElementById('empty-order').hidden = cart.length !== 0;
  document.querySelector('[data-item-count]').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  document.querySelector('[data-summary-count]').textContent = String(count);
  document.getElementById('copy-status').textContent = '';
  updateCartCount(cart);
}

if (orderItems) {
  orderItems.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const cart = readCart();
    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || !cart[index]) return;
    if (button.dataset.action === 'remove') cart.splice(index, 1);
    if (button.dataset.action === 'decrease') cart[index].quantity = Math.max(1, cart[index].quantity - 1);
    if (button.dataset.action === 'increase') cart[index].quantity = Math.min(99, cart[index].quantity + 1);
    if (saveCart(cart)) renderOrder();
  });

  document.getElementById('copy-summary').addEventListener('click', async () => {
    const cart = readCart();
    const lines = ['Explore Bike design preview list', 'No order has been submitted.', ''];
    cart.forEach((item, index) => {
      lines.push(`${index + 1}. ${PRODUCTS[item.id].name} | Preferred size: ${item.size} | Quantity: ${item.quantity}`);
    });
    lines.push('', 'Prices, availability, and final specifications are not confirmed.');
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      status.textContent = 'Summary copied. Nothing was sent.';
    } catch {
      status.textContent = 'Could not copy the summary in this browser.';
    }
  });

  renderOrder();
}

window.addEventListener('storage', () => {
  updateCartCount();
  renderOrder();
});
updateCartCount();
