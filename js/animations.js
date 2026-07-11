




'use strict';

class BioAnimations {
  constructor() {
    this.initScrollAnimations();
    this.initCardHovers();
    this.initStaggeredGrid();
    this.animateCountersOnView();
  }

  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    });

    
    const targets = document.querySelectorAll(
      '.system-card, .feature-card, .systems-header, .features-header, .hero-badge'
    );
    targets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    
    const style = document.createElement('style');
    style.textContent = `
      .in-view {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  }

  initCardHovers() {
    
    const cards = document.querySelectorAll('.system-card, .feature-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        card.style.transform = `
          translateY(-6px)
          rotateX(${-dy * 4}deg)
          rotateY(${dx * 4}deg)
          scale(1.01)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => {
          card.style.transition = '';
        }, 400);
      });
    });
  }

  initStaggeredGrid() {
    
    const systemCards = document.querySelectorAll('.system-card');
    systemCards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.05}s`;
    });

    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.08}s`;
    });
  }

  animateCountersOnView() {
    const statsSection = document.querySelector('.hero-stats');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          BioUtils.animateAllCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
  }
}

window.BioAnimations = BioAnimations;
