// 汉堡菜单
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  
  // 三条线变成 X
  const bars = document.querySelectorAll('.bar');
  bars[0].style.transform = navMenu.classList.contains('active') 
    ? 'rotate(45deg) translate(4px, 4px)' : '';
  bars[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
  bars[2].style.transform = navMenu.classList.contains('active') 
    ? 'rotate(-45deg) translate(4px, -4px)' : '';
});

// 点击菜单项后自动关闭
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    document.querySelectorAll('.bar').forEach(bar => {
      bar.style.transform = '';
      bar.style.opacity = '1';
    });
  });
});

// 点击菜单外部关闭
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('active');
    document.querySelectorAll('.bar').forEach(bar => {
      bar.style.transform = '';
      bar.style.opacity = '1';
    });
  }
});

// 滚动淡入动画
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .social-card, .about-grid, .contact-grid, .section-title').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});
