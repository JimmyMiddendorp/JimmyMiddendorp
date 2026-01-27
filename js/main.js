/* ============================================
   EVERMIND™ — Main JavaScript
   Interactions, animations, and functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // === Navbar Scroll Effect ===
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // === Mobile Menu Toggle ===
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
  }

  // === Dropdown Navigation ===
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('active');
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  });

  // === Scroll Animations (Intersection Observer) ===
  const animatedElements = document.querySelectorAll(
    '.hero-content, .hero-img-card, .hero-widget, ' +
    '.intro-paragraph, .intro-img-wrapper, .intro-description, ' +
    '.capabilities-sidebar, .feature-block, ' +
    '.integrity-title, .integrity-links, .stat-item, ' +
    '.system-card, ' +
    '.stories-header, .story-card, ' +
    '.idea-left, .idea-quote-card, .idea-stat-card, ' +
    '.contact-left, .contact-right, ' +
    '.cta-content, ' +
    '.footer-brand, .footer-col'
  );

  // Add animation classes
  animatedElements.forEach((el, index) => {
    el.classList.add('fade-in');
    // Add staggered delays for sibling elements
    const siblings = el.parentElement.children;
    const siblingIndex = Array.from(siblings).indexOf(el);
    if (siblingIndex > 0 && siblingIndex < 5) {
      el.classList.add(`delay-${siblingIndex}`);
    }
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));

  // === Counter Animation ===
  const counters = document.querySelectorAll('.stat-number, .story-stat-number, .idea-stat-number, .feature-stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(element) {
    const text = element.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;

    const target = parseInt(match[1]);
    const suffix = text.replace(match[1], '').trim();
    const prefix = text.substring(0, text.indexOf(match[1]));
    const duration = 1500;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      element.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = text;
      }
    }

    requestAnimationFrame(update);
  }

  // === Capabilities Navigation ===
  const capNavItems = document.querySelectorAll('.cap-nav-item');
  const featureBlocks = document.querySelectorAll('.feature-block');

  capNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);

      // Update active nav
      capNavItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Scroll to feature block
      if (featureBlocks[index]) {
        featureBlocks[index].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  });

  // Update active nav on scroll through feature blocks
  const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.index);
        capNavItems.forEach(nav => nav.classList.remove('active'));
        if (capNavItems[index]) {
          capNavItems[index].classList.add('active');
        }
      }
    });
  }, {
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0.3
  });

  featureBlocks.forEach(block => featureObserver.observe(block));

  // === Form Handling ===
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple validation animation
      const inputs = form.querySelectorAll('.form-input[required]');
      let isValid = true;

      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = '#e74c3c';
          input.addEventListener('input', () => {
            input.style.borderColor = '';
          }, { once: true });
        }
      });

      const checkbox = form.querySelector('input[type="checkbox"][required]');
      if (checkbox && !checkbox.checked) {
        isValid = false;
      }

      if (isValid) {
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Thank you!';
        btn.style.backgroundColor = '#4A5D2E';
        btn.style.color = '#fff';
        btn.disabled = true;

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
          btn.style.color = '';
          btn.disabled = false;
          form.reset();
        }, 3000);
      }
    });
  });

  // === Smooth scroll for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // === Image lazy loading with fade effect ===
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
      img.addEventListener('error', () => {
        img.style.opacity = '1';
        img.alt = 'Image unavailable';
      });
    }
  });

  // === Parallax effect on hero images ===
  const heroImages = document.querySelectorAll('.hero-img-card img');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        heroImages.forEach((img, i) => {
          const speed = 0.05 + (i * 0.02);
          const yPos = scrollY * speed;
          img.style.transform = `translateY(${yPos}px) scale(1)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // === Hover effects for system cards ===
  const systemCards = document.querySelectorAll('.system-card');
  systemCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.system-card-icon');
      if (icon) {
        icon.style.transform = 'scale(1.1)';
        icon.style.transition = 'transform 0.3s ease';
      }
    });
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.system-card-icon');
      if (icon) {
        icon.style.transform = 'scale(1)';
      }
    });
  });

  // === Typed effect for hero label ===
  const heroLabel = document.querySelector('.hero-label');
  if (heroLabel) {
    const text = heroLabel.textContent;
    heroLabel.textContent = '';
    heroLabel.style.opacity = '1';

    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        heroLabel.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
  }

});
