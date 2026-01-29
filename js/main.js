/* ============================================
   PERSOONLIJKMERK.NL — JavaScript
   Business-First Personal Branding
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // === Navbar scroll effect ===
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // === Mobile menu toggle ===
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    const hamburger = toggle.querySelector('.hamburger-icon');
    const close = toggle.querySelector('.close-icon');

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('active');
      if (hamburger) hamburger.style.display = isOpen ? 'none' : 'block';
      if (close) close.style.display = isOpen ? 'block' : 'none';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when clicking a link
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('active');
        if (hamburger) hamburger.style.display = 'block';
        if (close) close.style.display = 'none';
        document.body.style.overflow = '';
      });
    });
  }

  // === Smooth scroll for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        if (menu && menu.classList.contains('active')) {
          menu.classList.remove('active');
          const hamburger = toggle.querySelector('.hamburger-icon');
          const close = toggle.querySelector('.close-icon');
          if (hamburger) hamburger.style.display = 'block';
          if (close) close.style.display = 'none';
          document.body.style.overflow = '';
        }
      }
    });
  });

  // === Scroll animations ===
  const animTargets = document.querySelectorAll(
    '.hero-content, ' +
    '.recognition-content, .recognition-stat-card, ' +
    '.villain-card, .villain-outcome, .villain-truth, ' +
    '.guide-empathy, .guide-card, .guide-philosophy, ' +
    '.plan-phase, .plan-difference, ' +
    '.success-morning, .success-metric, .success-from, .success-to, .success-clou, ' +
    '.failure-scenario, .failure-cost, .failure-bottom-line, ' +
    '.testimonial-inner, ' +
    '.cta-content, .cta-form-wrap, ' +
    '.leadmag-content, .leadmag-form-wrap, ' +
    '.final-cta-inner, ' +
    '.footer-brand, .footer-col'
  );

  animTargets.forEach((el, index) => {
    el.classList.add('fade-up');
    // Add stagger delay for elements within the same parent
    const siblings = Array.from(el.parentElement?.children || []);
    const siblingIndex = siblings.indexOf(el);
    if (siblingIndex > 0 && siblingIndex <= 4) {
      el.classList.add('delay-' + siblingIndex);
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  });

  animTargets.forEach(el => observer.observe(el));

  // === Counter animation for metrics ===
  const counters = document.querySelectorAll(
    '.hero-proof-number, .guide-stat-num, .success-metric-num, .failure-cost-amount'
  );

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateNumber(el) {
    const text = el.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;

    const targetNum = parseInt(match[1]);
    const prefix = text.substring(0, text.indexOf(match[1]));
    const suffix = text.substring(text.indexOf(match[1]) + match[1].length);
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentNum = Math.round(targetNum * easeOut);
      el.textContent = prefix + currentNum + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = text;
      }
    }

    requestAnimationFrame(update);
  }

  // === Form handling ===
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;

      const originalText = btn.textContent;
      const originalStyles = {
        background: btn.style.background,
        color: btn.style.color,
        borderColor: btn.style.borderColor
      };

      // Show success state
      btn.textContent = 'Bedankt! We nemen contact op.';
      btn.style.background = '#4A5D2E';
      btn.style.color = '#fff';
      btn.style.borderColor = '#4A5D2E';
      btn.disabled = true;

      // Reset after delay
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = originalStyles.background;
        btn.style.color = originalStyles.color;
        btn.style.borderColor = originalStyles.borderColor;
        btn.disabled = false;
        form.reset();
      }, 4000);
    });
  });

  // === Image lazy loading effect ===
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';
      img.addEventListener('load', () => { img.style.opacity = '1'; });
      img.addEventListener('error', () => { img.style.opacity = '1'; });
    }
  });

  // === Active nav link highlighting ===
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

  function highlightNavLink() {
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNavLink, { passive: true });
  highlightNavLink();

});
