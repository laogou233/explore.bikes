const pageRoot = document.documentElement;
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loadingStartedAt = performance.now();
let loadingFinished = false;

pageRoot.classList.add('site-loading');

const finishLoading = () => {
  if (loadingFinished) return;
  loadingFinished = true;
  const remaining = motionReduced ? 0 : Math.max(0, 650 - (performance.now() - loadingStartedAt));
  window.setTimeout(() => pageRoot.classList.remove('site-loading'), remaining);
};

if (document.readyState === 'complete') finishLoading();
else window.addEventListener('load', finishLoading, { once: true });

window.setTimeout(finishLoading, 3000);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) pageRoot.classList.remove('site-loading');
});

const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelectorAll('.site-nav a');

const setMenu = (isOpen) => {
  document.body.classList.toggle('menu-open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
};

menuButton.addEventListener('click', () => {
  setMenu(!document.body.classList.contains('menu-open'));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});
