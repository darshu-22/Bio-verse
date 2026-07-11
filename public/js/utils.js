



'use strict';

const BioUtils = {
  


  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  


  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  


  mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  },

  


  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  


  animateCounter(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easedProgress);
      element.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(update);
  },

  


  animateAllCounters() {
    const counters = document.querySelectorAll('[data-target]');
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      BioUtils.animateCounter(counter, target, 2200);
    });
  },

  


  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom >= 0
    );
  },

  


  toRad(degrees) {
    return (degrees * Math.PI) / 180;
  },

  


  toDeg(radians) {
    return (radians * 180) / Math.PI;
  },

  


  randomFloat(min, max) {
    return min + Math.random() * (max - min);
  },

  


  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  


  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  


  formatNumber(num) {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  }
};


window.BioUtils = BioUtils;
