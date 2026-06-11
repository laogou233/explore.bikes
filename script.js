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
