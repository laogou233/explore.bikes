const menuButton = document.querySelector('.menu-button');
const siteNav = document.querySelector('.site-nav');

if (menuButton && siteNav) {
  // Enhance navigation only when its controller is available; links remain usable without JS.
  document.documentElement.classList.add('js');
  const setMenu = (isOpen) => {
    document.body.classList.toggle('menu-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  };
  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', () => setMenu(false));
}

const heroVideo = document.querySelector('.hero-video');
const motionToggle = document.querySelector('.hero-motion-toggle');

if (heroVideo && motionToggle) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const motionIcon = motionToggle.querySelector('span');
  let heroVisible = !('IntersectionObserver' in window);
  let userPaused = reducedMotion.matches || Boolean(connection?.saveData);
  let videoFailed = false;

  const updateHeroVideo = () => {
    const label = userPaused ? 'Play background video' : 'Pause background video';
    motionToggle.setAttribute('aria-label', label);
    motionToggle.title = label;
    if (motionIcon) motionIcon.textContent = userPaused ? '\u25b6' : '\u23f8';
    if (videoFailed || userPaused || document.hidden || !heroVisible) {
      heroVideo.pause();
      return;
    }
    heroVideo.play().catch((error) => {
      // Scrolling away can interrupt a pending play request; keep the user's preference.
      if (error.name === 'AbortError') return;
      userPaused = true;
      updateHeroVideo();
    });
  };

  motionToggle.hidden = false;
  motionToggle.addEventListener('click', () => {
    userPaused = !userPaused;
    updateHeroVideo();
  });
  const showPoster = () => {
    videoFailed = true;
    heroVideo.pause();
    motionToggle.hidden = true;
  };
  heroVideo.addEventListener('error', showPoster);
  heroVideo.querySelector('source')?.addEventListener('error', showPoster);
  updateHeroVideo();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      updateHeroVideo();
    }, { threshold: 0.1 });
    observer.observe(heroVideo);
  }

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) userPaused = true;
    updateHeroVideo();
  });
  connection?.addEventListener('change', () => {
    if (connection.saveData) userPaused = true;
    updateHeroVideo();
  });
  document.addEventListener('visibilitychange', updateHeroVideo);
}
