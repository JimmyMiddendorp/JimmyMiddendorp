/* ============================================
   EVERMIND™ — JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // === Navbar scroll ===
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // === Mobile menu ===
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    const hamburger = toggle.querySelector('.hamburger-icon');
    const close = toggle.querySelector('.close-icon');
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('active');
      hamburger.style.display = isOpen ? 'none' : 'block';
      close.style.display = isOpen ? 'block' : 'none';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // === Capability Tabs ===
  const tabBtns = document.querySelectorAll('.cap-nav-item');
  const tabs = document.querySelectorAll('.cap-tab');
  const infos = document.querySelectorAll('.cap-info');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      infos.forEach(i => i.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`.cap-tab[data-tab="${idx}"]`)?.classList.add('active');
      document.querySelector(`.cap-info[data-tab="${idx}"]`)?.classList.add('active');
    });
  });

  // === System Carousel ===
  const carousel = document.querySelector('.system-carousel');
  const prevBtn = document.querySelector('.arrow-prev');
  const nextBtn = document.querySelector('.arrow-next');
  let carouselIndex = 0;

  if (carousel && prevBtn && nextBtn) {
    const cards = carousel.querySelectorAll('.system-card');
    const cardWidth = cards[0]?.offsetWidth + 16 || 0; // card + gap

    nextBtn.addEventListener('click', () => {
      if (carouselIndex < cards.length - 3) {
        carouselIndex++;
        carousel.style.transform = `translateX(-${carouselIndex * cardWidth}px)`;
      }
    });

    prevBtn.addEventListener('click', () => {
      if (carouselIndex > 0) {
        carouselIndex--;
        carousel.style.transform = `translateX(-${carouselIndex * cardWidth}px)`;
      }
    });
  }

  // === Scroll Animations ===
  const animTargets = document.querySelectorAll(
    '.hero-content, .hero-col, ' +
    '.intro-label-row, .intro-headline, .intro-img-left, .intro-right-wrap, ' +
    '.cap-top-row, .cap-content-grid, ' +
    '.about-left, .about-right, .stat-block, ' +
    '.system-header, .system-card, ' +
    '.stories-header, .story-card, ' +
    '.testimonial-inner, ' +
    '.contact-left, .contact-right, ' +
    '.cta-inner, ' +
    '.footer-brand, .footer-col'
  );

  animTargets.forEach(el => {
    el.classList.add('fade-up');
    const siblings = Array.from(el.parentElement?.children || []);
    const i = siblings.indexOf(el);
    if (i > 0 && i <= 4) el.classList.add('delay-' + i);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  animTargets.forEach(el => observer.observe(el));

  // === Counter animation ===
  const counters = document.querySelectorAll('.stat-number, .story-stat-num');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNum(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));

  function animateNum(el) {
    const txt = el.textContent;
    const match = txt.match(/(\d+)/);
    if (!match) return;
    const target = parseInt(match[1]);
    const pre = txt.substring(0, txt.indexOf(match[1]));
    const suf = txt.substring(txt.indexOf(match[1]) + match[1].length);
    const dur = 1200;
    const start = performance.now();
    (function update(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(target * ease) + suf;
      if (p < 1) requestAnimationFrame(update);
      else el.textContent = txt;
    })(start);
  }

  // === Form handling ===
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Thank you!';
      btn.style.background = '#4A5D2E';
      btn.style.color = '#fff';
      btn.style.borderColor = '#4A5D2E';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  });

  // === Smooth scroll ===
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // === Image fade in on load ===
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      img.addEventListener('load', () => { img.style.opacity = '1'; });
      img.addEventListener('error', () => { img.style.opacity = '1'; });
    }
  });

});
