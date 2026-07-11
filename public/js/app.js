




'use strict';


class BioVerseApp {
  constructor() {
    this.initialized = false;
    this.loadingMessages = [
      'Initializing neural render engine...',
      'Building skeletal framework...',
      'Mapping circulatory pathways...',
      'Rendering muscular geometry...',
      'Connecting nervous system...',
      'Calibrating respiratory model...',
      'Loading organ hierarchy data...',
      'BioVerse X ready.',
    ];
    this.loadingIndex = 0;
    this.loadingBar = document.getElementById('loading-bar');
    this.loadingStatus = document.getElementById('loading-status');
    this.loadingProgress = document.getElementById('loading-progress');
  }

  async init() {
    await this.runLoadingSequence();
    try {
      window.bioExplorer = new Explorer3D('explorer-canvas');

      
      await window.bioExplorer.loadGLBModel();

      
      window.bioAnimations3D = new BioAnimations3D();
      window.bioAnimations3D.bind(window.bioExplorer);

      
      window.explorer3D = window.bioExplorer;

      
      window.dispatchEvent(new CustomEvent('bioExplorerReady', {
        detail: { explorer: window.bioExplorer }
      }));

      
      window.bioHierarchy = new OrganHierarchy();

      
      window.bioFocus = new OrganFocusController();

      
      window.bioCinematic = new CinematicNav();

      
      window.bioNav = new BioNavigation();

      
      window.bioQuiz = new BioQuiz();

      
      window.bioSchool = new SchoolPlatform();

      
      window.bioAnimations = new BioAnimations();

      
      window._activeBioSystem = 'fullBody';

      
      this.bindSliders();

      
      BioUtils.animateAllCounters();

    } catch (err) {
      console.warn('BioVerse X: Module init warning:', err.message, err);
    }

    this.initialized = true;
    console.log('🧬 BioVerse X v2 initialized successfully.');
  }

  bindSliders() {
    
    const opSlider = document.getElementById('opacity-slider');
    const opValue = document.getElementById('opacity-value');
    if (opSlider) {
      opSlider.addEventListener('input', () => {
        const val = parseInt(opSlider.value, 10);
        if (opValue) opValue.textContent = `${val}%`;
        if (window.bioExplorer) window.bioExplorer.setOpacity(val);
      });
    }

    
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomDisp = document.getElementById('zoom-display');
    if (zoomSlider) {
      zoomSlider.addEventListener('input', () => {
        const val = parseInt(zoomSlider.value, 10);
        const zoom = val / 100;
        if (zoomDisp) zoomDisp.textContent = `${zoom.toFixed(1)}×`;
        if (window.bioExplorer) window.bioExplorer.setZoom(val);
        const hudZoom = document.getElementById('hud-zoom');
        if (hudZoom) hudZoom.textContent = `${zoom.toFixed(1)}×`;
      });
    }

    
  }

  static _showGestureToast(msg) {
    let toast = document.getElementById('gesture-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'gesture-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(BioVerseApp._toastTimer);
    BioVerseApp._toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  runLoadingSequence() {
    return new Promise((resolve) => {
      const totalDuration = 2800;
      const stepDuration = totalDuration / this.loadingMessages.length;
      let progress = 0;

      const updateLoading = () => {
        const msg = this.loadingMessages[this.loadingIndex];
        if (this.loadingStatus) this.loadingStatus.textContent = msg;

        const targetProgress = ((this.loadingIndex + 1) / this.loadingMessages.length) * 100;
        this.animateProgress(progress, targetProgress, 200);
        progress = targetProgress;

        if (this.loadingProgress) {
          this.loadingProgress.setAttribute('aria-valuenow', Math.round(targetProgress));
        }

        this.loadingIndex++;

        if (this.loadingIndex < this.loadingMessages.length) {
          setTimeout(updateLoading, stepDuration);
        } else {
          setTimeout(() => { this.hideLoadingScreen(); resolve(); }, 400);
        }
      };

      updateLoading();
    });
  }

  animateProgress(from, to, duration) {
    if (!this.loadingBar) return;
    const start = performance.now();
    const update = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.loadingBar.style.width = `${from + (to - from) * ease}%`;
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  hideLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (screen) screen.classList.add('hidden');
  }

  bindGestureController() {
    const gestureBtn = document.getElementById('gesture-toggle-btn');
    if (gestureBtn) {
      gestureBtn.addEventListener('click', () => {
        if (window.bioGestureController) {
          window.bioGestureController.toggle();
        }
      });
    }

    const gesturePanelClose = document.getElementById('gesture-panel-close');
    if (gesturePanelClose) {
      gesturePanelClose.addEventListener('click', () => {
        if (window.bioGestureController) {
          window.bioGestureController.disable();
        }
      });
    }

    if (window.bioGestureController) {
      window.bioGestureController.onStatus = (msg, type) => {
        if (type === 'success') {
          const feedLoading = document.getElementById('gesture-feed-loading');
          if (feedLoading) feedLoading.classList.add('hidden');
        }
        BioVerseApp._showGestureToast(msg);
      };
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new BioVerseApp();
  app.init().catch(console.error);
  window.bioApp = app;
  try {
    app.bindGestureController();
  } catch (e) {
    console.error(e);
  }
});
