/**
 * ZAVLO TECHNOLOGIES — MAIN APPLICATION SCRIPT (STAGE 5 REFINED)
 * Cinematic motion, responsive navigation, touch controls,
 * active nav, tab controls, contact form WhatsApp integration, & ambient lighting
 */

(function () {
  'use strict';

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================
  // Replace with client's verified WhatsApp phone number with country code (e.g. '1234567890')
  // If left empty, opens WhatsApp Web / App with pre-filled message for user selection.
  const ZAVLO_WHATSAPP_PHONE = ''; // [CLIENT CONFIGURATION: Insert verified WhatsApp number here]

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initHeroScrollEffect();
    initSmoothAnchors();
    initScrollReveals();
    initActiveNavObserver();
    initPlatformTabs();
    initContactForm();

    if (!isTouchDevice && !isReducedMotion) {
      initPointerLight();
    }
  });

  /* --------------------------------------------------------------------------
     1. Navigation & Mobile Drawer
     -------------------------------------------------------------------------- */
  function initNavigation() {
    const header = document.getElementById('site-header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (!header) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (mobileToggle && navMenu) {
      const closeMenu = () => {
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.querySelectorAll('.hamburger-line').forEach(l => l.style.transform = '');
      };

      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', (!isExpanded).toString());
        navMenu.classList.toggle('active');

        const lines = mobileToggle.querySelectorAll('.hamburger-line');
        if (lines.length >= 2) {
          if (!isExpanded) {
            lines[0].style.transform = 'translateY(3.75px) rotate(45deg)';
            lines[1].style.transform = 'translateY(-3.75px) rotate(-45deg)';
          } else {
            lines[0].style.transform = '';
            lines[1].style.transform = '';
          }
        }
      });

      // Close menu when clicking nav links
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
      });

      // Close menu when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
          closeMenu();
        }
      });

      // Close menu on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
          closeMenu();
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     2. Hero Typography Fade on Scroll
     -------------------------------------------------------------------------- */
  function initHeroScrollEffect() {
    const heroContent = document.querySelector('.hero-content');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const heroSection = document.getElementById('hero');

    if (!heroContent || !heroSection) return;

    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      const heroHeight = heroSection.clientHeight || window.innerHeight;
      const progress = Math.min(Math.max(scrollY / (heroHeight * 0.6), 0), 1);

      const opacity = Math.max(1 - progress * 1.5, 0);
      const translateY = progress * 40;

      heroContent.style.opacity = opacity;
      heroContent.style.transform = `translateY(${translateY}px)`;

      if (scrollIndicator) {
        scrollIndicator.style.opacity = Math.max(1 - progress * 3, 0);
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* --------------------------------------------------------------------------
     3. Smooth Anchor Scroll with Dynamic Header Offset
     -------------------------------------------------------------------------- */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id === '#') return;

        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const header = document.getElementById('site-header');
          const offset = header ? header.offsetHeight : 72;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. Intersection Observer Scroll Reveals
     -------------------------------------------------------------------------- */
  function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.05
    });

    reveals.forEach(el => observer.observe(el));
  }

  /* --------------------------------------------------------------------------
     5. Active Section Nav Highlight
     -------------------------------------------------------------------------- */
  function initActiveNavObserver() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, {
      rootMargin: '-25% 0px -55% 0px'
    });

    sections.forEach(sec => observer.observe(sec));
  }

  /* --------------------------------------------------------------------------
     6. Platform Tabs
     -------------------------------------------------------------------------- */
  function initPlatformTabs() {
    const tabs = document.querySelectorAll('.tab-card');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. Contact Form WhatsApp Flow
     -------------------------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const successState = document.getElementById('form-success-state');
    const resetBtn = document.getElementById('form-reset-btn');

    if (!form || !successState) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Extract form values
      const name = (document.getElementById('form-name')?.value || '').trim();
      const org = (document.getElementById('form-org')?.value || '').trim();
      const email = (document.getElementById('form-email')?.value || '').trim();
      const inquirySelect = document.getElementById('form-inquiry');
      const inquiryType = inquirySelect ? inquirySelect.options[inquirySelect.selectedIndex].text : 'General Inquiry';
      const message = (document.getElementById('form-message')?.value || '').trim();

      // Format WhatsApp message
      const whatsappMessage = 
`Hello ZAVLO Technologies,

I would like to make an enquiry.

Name: ${name}
Organization: ${org}
Email: ${email}
Inquiry Type: ${inquiryType}

Message:
${message}

Website: ZAVLO Technologies

Thank you.`;

      // Build WhatsApp URL
      const encodedText = encodeURIComponent(whatsappMessage);
      const whatsappUrl = ZAVLO_WHATSAPP_PHONE 
        ? `https://wa.me/${ZAVLO_WHATSAPP_PHONE.replace(/[^0-9]/g, '')}?text=${encodedText}`
        : `https://api.whatsapp.com/send?text=${encodedText}`;

      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Update UI state
      form.style.display = 'none';
      successState.classList.add('active');
      successState.setAttribute('aria-hidden', 'false');
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        successState.classList.remove('active');
        successState.setAttribute('aria-hidden', 'true');
        form.style.display = 'flex';
      });
    }
  }

  /* --------------------------------------------------------------------------
     8. Subtle Pointer-Reactive Ambient Light (Desktop Only)
     -------------------------------------------------------------------------- */
  function initPointerLight() {
    const light = document.getElementById('pointer-light');
    if (!light) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let active = false;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!active) {
        active = true;
        light.classList.add('active');
      }
    });

    document.addEventListener('mouseleave', () => {
      active = false;
      light.classList.remove('active');
    });

    function animateLight() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      light.style.left = currentX + 'px';
      light.style.top = currentY + 'px';

      rafId = requestAnimationFrame(animateLight);
    }

    animateLight();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!document.hidden && !rafId) {
        animateLight();
      }
    });
  }
})();
