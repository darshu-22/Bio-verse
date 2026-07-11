'use strict';

class BioGestureController {
  constructor() {
    this.handsData = {
      Left: {
        tracked: false,
        score: 0,
        rawLandmarks: null,
        smoothedLandmarks: null,
        currentGesture: 'NONE',
        previousGesture: 'NONE',
        gestureConfidence: 0.0,
        candidateGesture: 'NONE',
        candidateCount: 0,
        gestureStartTime: Date.now(),
        gestureDuration: 0,
        cooldownEndTime: 0,
        transitionLockEndTime: 0,
        gestureChanged: false,

        cursorX: null,
        cursorY: null,
        cursorPos: null,
        dwellTarget: null,
        dwellStartTime: 0,
        dwellCooldownEndTime: 0,
        prevPinchDistance: null,
        smoothedPinchChange: 0,
        palmPrev: null,
        smoothedPalmDiff: { x: 0, y: 0 },
        resetStartTime: 0,
        resetCooldownEndTime: 0
      },
      Right: {
        tracked: false,
        score: 0,
        rawLandmarks: null,
        smoothedLandmarks: null,
        currentGesture: 'NONE',
        previousGesture: 'NONE',
        gestureConfidence: 0.0,
        candidateGesture: 'NONE',
        candidateCount: 0,
        gestureStartTime: Date.now(),
        gestureDuration: 0,
        cooldownEndTime: 0,
        transitionLockEndTime: 0,
        gestureChanged: false,

        cursorX: null,
        cursorY: null,
        cursorPos: null,
        dwellTarget: null,
        dwellStartTime: 0,
        dwellCooldownEndTime: 0,
        prevPinchDistance: null,
        smoothedPinchChange: 0,
        palmPrev: null,
        smoothedPalmDiff: { x: 0, y: 0 },
        resetStartTime: 0,
        resetCooldownEndTime: 0
      }
    };

    this.activeHandKey = null;

    this.isActive = false;
    this.isLooping = false;
    this.videoEl = null;
    this.stream = null;
    this.hands = null;
    this.animationFrameId = null;
    this.onStatus = null;

    this.cursorEl = null;
    this.prevTracked = false;
    this._toastTimeout = null;

    this.thresholds = {
      pinchClose: 0.05,
      pinchOpen: 0.08,
      fingerExtended: 0.60,
      fingerFolded: 0.45,
      pointIndexMin: 0.65,
      pointOthersMax: 0.45,
      openPalmMin: 0.55,
      closedFistMax: 0.42,
      threeFingerResetMin: 0.60,
      stabilizationFrames: 5,
      cooldownMs: 300,
      zoomSensitivity: 35.0,
      rotationSensitivity: 6.5,
      };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initPanelRepositioning();
        this.bindHelpPopup();
      });
    } else {
      this.initPanelRepositioning();
      this.bindHelpPopup();
    }
  }

  initPanelRepositioning() {
    const organPanel = document.getElementById('organ-info-panel');
    const gesturePanel = document.getElementById('gesture-panel');
    if (!organPanel || !gesturePanel) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isVisible = organPanel.classList.contains('visible');
          gesturePanel.classList.toggle('gesture-panel--left', isVisible);
        }
      });
    });

    observer.observe(organPanel, { attributes: true, attributeFilter: ['class'] });

    const isVisible = organPanel.classList.contains('visible');
    gesturePanel.classList.toggle('gesture-panel--left', isVisible);
  }

  bindHelpPopup() {
    const trigger = document.getElementById('gesture-help-btn');
    const popup = document.getElementById('gesture-help-popup');
    const closeBtn = document.getElementById('gesture-help-close-btn');

    if (trigger && popup) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.style.display = 'flex';
      });
    }

    if (closeBtn && popup) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.style.display = 'none';
      });
    }

    document.addEventListener('click', (e) => {
      if (popup && popup.style.display === 'flex') {
        const isClickInside = popup.contains(e.target) || (trigger && trigger.contains(e.target));
        if (!isClickInside) {
          popup.style.display = 'none';
        }
      }
    });
  }

  async start() {
    const explorePage = document.getElementById('explore-page');
    const isExploreActive = (explorePage && explorePage.classList.contains('active')) || (window.bioNav && window.bioNav.currentPage === 'explore');
    if (!isExploreActive) {
      return;
    }
    if (this.stream || this.isLooping) {
      return;
    }
    this._status('Starting camera...', 'info');
    const feedLoading = document.getElementById('gesture-feed-loading');
    if (feedLoading) {
      feedLoading.classList.remove('hidden');
    }
    try {
      if (!this.videoEl) {
        this.videoEl = document.createElement('video');
        this.videoEl.setAttribute('playsinline', '');
        this.videoEl.setAttribute('muted', '');
        this.videoEl.muted = true;
        this.videoEl.style.display = 'none';
        document.body.appendChild(this.videoEl);
      }
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
      } catch (e) {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      await new Promise((res, rej) => {
        if (this.videoEl.readyState >= 1) {
          res();
          return;
        }
        this.videoEl.onloadedmetadata = () => res();
        this.videoEl.onerror = (e) => rej(e);
        this.videoEl.srcObject = this.stream;
      });
      await this.videoEl.play();

      if (!this.hands) {
        await this._waitForGlobal('Hands', 6000);
        this.hands = new Hands({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${f}`
        });
        this.hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.72,
          minTrackingConfidence: 0.60
        });
        this.hands.onResults((results) => this._onHandResults(results));
      }

      this.isLooping = true;
      this._processLoop();
      this._status('Gesture control active', 'success');
      this._ensureFeedbackUI();
      this._emitUI(true);
    } catch (err) {
      console.error(err);
      this._status(err.message || 'Webcam access or MediaPipe load failed', 'error');
      this.isActive = false;
      this.stop();
    }
  }

  stop() {
    this.isLooping = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }

    this._clearHand('Left');
    this._clearHand('Right');

    this.prevTracked = false;
    this._resetAllModes();
    const canvas = document.getElementById('gesture-feed-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    this._status('Gesture control inactive', 'idle');
    this._updateFeedbackUI('NO HAND', 0);
    this._emitUI(false);
  }

  toggle() {
    if (!this.isActive) {
      return this.enable();
    } else {
      return this.disable();
    }
  }

  enable() {
    this.isActive = true;
    return this.start();
  }

  disable() {
    this.isActive = false;
    this.stop();
  }

  getHandState() {
    return {
      ...this.handState,
      currentGesture: this.currentGesture,
      previousGesture: this.previousGesture,
      gestureConfidence: this.gestureConfidence,
      gestureDuration: this.gestureDuration,
      gestureChanged: this.gestureChanged,
      cursorPos: this.cursorPos
    };
  }

  async _waitForGlobal(name, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    return new Promise((res, rej) => {
      const check = () => {
        if (typeof window[name] !== 'undefined') return res();
        if (Date.now() > deadline) return rej(new Error(`${name} not found within ${timeoutMs}ms`));
        setTimeout(check, 80);
      };
      check();
    });
  }

  async _processLoop() {
    if (!this.isLooping || !this.videoEl || !this.hands) return;
    if (this.isProcessingFrame) {
      this.animationFrameId = requestAnimationFrame(() => this._processLoop());
      return;
    }
    if (this.videoEl.readyState >= 2) {
      this.isProcessingFrame = true;
      try {
        await this.hands.send({ image: this.videoEl });
      } catch (err) {
        console.error(err);
      } finally {
        this.isProcessingFrame = false;
      }
    }
    if (this.isLooping) {
      this.animationFrameId = requestAnimationFrame(() => this._processLoop());
    }
  }

  _dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z || 0) - (b.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  _getFingerExtensions(lm) {
    const w = lm[0];
    const ext = (tip, mcp) => {
      const tipD = this._dist(w, tip);
      const mcpD = this._dist(w, mcp);
      if (mcpD < 0.001) return 0;
      return Math.min(tipD / mcpD / 1.7, 1.0);
    };
    return {
      thumb: ext(lm[4], lm[2]),
      index: ext(lm[8], lm[5]),
      middle: ext(lm[12], lm[9]),
      ring: ext(lm[16], lm[13]),
      pinky: ext(lm[20], lm[17])
    };
  }

  _classifyRawGesture(lm, activeGesture) {
    const ext = this._getFingerExtensions(lm);
    const pinchDist = this._dist(lm[4], lm[8]);

    const isPinchActive = activeGesture === 'PINCH';
    const isPinchValid = ext.middle < this.thresholds.pointOthersMax &&
                         ext.ring < this.thresholds.pointOthersMax &&
                         ext.pinky < this.thresholds.pointOthersMax &&
                         ext.index > this.thresholds.fingerFolded;

    if (isPinchActive) {
      if (isPinchValid) {
        return 'PINCH';
      }
    } else {
      if (pinchDist < this.thresholds.pinchClose && isPinchValid) {
        return 'PINCH';
      }
    }

    if (
      ext.index > this.thresholds.threeFingerResetMin &&
      ext.middle > this.thresholds.threeFingerResetMin &&
      ext.ring > this.thresholds.threeFingerResetMin &&
      ext.pinky < this.thresholds.pointOthersMax &&
      ext.thumb < this.thresholds.pointOthersMax
    ) {
      return 'THREE_FINGER_RESET';
    }

    if (
      ext.index > this.thresholds.pointIndexMin &&
      ext.middle < this.thresholds.pointOthersMax &&
      ext.ring < this.thresholds.pointOthersMax &&
      ext.pinky < this.thresholds.pointOthersMax
    ) {
      return 'INDEX_POINT';
    }

    if (
      ext.thumb > this.thresholds.openPalmMin &&
      ext.index > this.thresholds.openPalmMin &&
      ext.middle > this.thresholds.openPalmMin &&
      ext.ring > this.thresholds.openPalmMin &&
      ext.pinky > this.thresholds.openPalmMin
    ) {
      return 'FULLY_OPEN_PALM';
    }

    return 'NONE';
  }

  _updateHandGestureStateMachine(key, rawGesture) {
    const hand = this.handsData[key];
    const now = Date.now();
    hand.gestureChanged = false;

    if (rawGesture === hand.currentGesture) {
      hand.candidateGesture = rawGesture;
      hand.candidateCount = 0;
      hand.gestureDuration = now - hand.gestureStartTime;
      hand.gestureConfidence = 1.0;
      return;
    }

    if (rawGesture === hand.candidateGesture) {
      hand.candidateCount++;
    } else {
      hand.candidateGesture = rawGesture;
      hand.candidateCount = 1;
    }

    hand.gestureConfidence = hand.candidateCount / this.thresholds.stabilizationFrames;

    if (hand.candidateCount >= this.thresholds.stabilizationFrames) {
      if (now >= hand.cooldownEndTime) {
        const oldGesture = hand.currentGesture;
        hand.previousGesture = oldGesture;
        hand.currentGesture = rawGesture;
        hand.gestureStartTime = now;
        hand.gestureDuration = 0;
        hand.gestureChanged = true;
        hand.gestureConfidence = 1.0;
        hand.cooldownEndTime = now + this.thresholds.cooldownMs;
        hand.transitionLockEndTime = now + this.thresholds.transitionLockMs;
        if (key === this.activeHandKey) {
          this._resetAllModes();
        }
      }
      hand.candidateCount = 0;
    } else {
      hand.gestureDuration = now - hand.gestureStartTime;
    }
  }

  _updateHand(key, candidate) {
    const hand = this.handsData[key];
    const prevTracked = hand.tracked;
    hand.tracked = true;
    hand.score = candidate.score;
    hand.rawLandmarks = candidate.landmarks;

    if (!prevTracked || !hand.smoothedLandmarks) {
      hand.smoothedLandmarks = candidate.landmarks.map(pt => ({ x: pt.x, y: pt.y, z: pt.z || 0 }));
    } else {
      const alpha = 0.35;
      hand.smoothedLandmarks = candidate.landmarks.map((pt, idx) => {
        const prev = hand.smoothedLandmarks[idx] || pt;
        return {
          x: alpha * pt.x + (1 - alpha) * prev.x,
          y: alpha * pt.y + (1 - alpha) * prev.y,
          z: alpha * (pt.z || 0) + (1 - alpha) * (prev.z || 0)
        };
      });
    }

    const rawGesture = this._classifyRawGesture(hand.smoothedLandmarks, hand.currentGesture);
    this._updateHandGestureStateMachine(key, rawGesture);
  }

  _clearHand(key) {
    const hand = this.handsData[key];
    if (!hand.tracked) return;

    hand.tracked = false;
    hand.score = 0;
    hand.rawLandmarks = null;
    hand.smoothedLandmarks = null;

    hand.candidateGesture = 'NONE';
    hand.candidateCount = 0;

    const oldGesture = hand.currentGesture;
    hand.previousGesture = oldGesture;
    hand.currentGesture = 'NONE';
    hand.gestureConfidence = 0.0;
    hand.gestureDuration = 0;
    hand.gestureChanged = oldGesture !== 'NONE';

    this._cleanupHandInteraction(key);
  }

  _cleanupHandInteraction(key) {
    const hand = this.handsData[key];
    hand.cursorX = null;
    hand.cursorY = null;
    hand.cursorPos = null;
    hand.dwellTarget = null;
    hand.dwellStartTime = 0;
    hand.prevPinchDistance = null;
    hand.smoothedPinchChange = 0;
    hand.palmPrev = null;
    hand.smoothedPalmDiff = { x: 0, y: 0 };
    hand.resetStartTime = 0;
  }

  _resetAllModes() {
    this._cleanupHandInteraction('Left');
    this._cleanupHandInteraction('Right');
    if (this.cursorEl) {
      this.cursorEl.style.opacity = '0';
    }
    this._setProgress(0);
    if (window.bioExplorer) {
      window.bioExplorer.handleHover({ clientX: -9999, clientY: -9999 });
    }
  }

  _updateCursor(activeKey) {
    if (!activeKey) {
      if (this.cursorEl) {
        this.cursorEl.style.opacity = '0';
      }
      this._setProgress(0);
      return;
    }

    const hand = this.handsData[activeKey];
    if (Date.now() < hand.transitionLockEndTime) {
      return;
    }
    if (!this.cursorEl) {
      this.cursorEl = document.createElement('div');
      this.cursorEl.id = 'bio-virtual-cursor';
      this.cursorEl.style.position = 'absolute';
      this.cursorEl.style.width = '24px';
      this.cursorEl.style.height = '24px';
      this.cursorEl.style.pointerEvents = 'none';
      this.cursorEl.style.zIndex = '999999';
      this.cursorEl.style.transform = 'translate(-50%, -50%)';
      this.cursorEl.style.transition = 'opacity 0.15s ease';
      this.cursorEl.style.opacity = '0';

      this.cursorEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" style="display: block;">
          <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(0, 212, 255, 0.25)" stroke-width="2" />
          <circle id="bio-cursor-progress-circle" cx="12" cy="12" r="10" fill="none" stroke="#00d4ff" stroke-width="2" 
                  stroke-dasharray="62.8" stroke-dashoffset="62.8" transform="rotate(-90 12 12)" style="transition: stroke-dashoffset 0.05s linear;" />
        </svg>
        <div style="position: absolute; width: 6px; height: 6px; background: #ffffff; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 6px #00d4ff;"></div>
      `;

      document.body.appendChild(this.cursorEl);
    }

    const isPoint = hand.currentGesture === 'INDEX_POINT';
    const isReset = hand.currentGesture === 'THREE_FINGER_RESET';

    if ((isPoint || isReset) && hand.tracked && hand.smoothedLandmarks) {
      const indexTip = hand.smoothedLandmarks[8];
      const middleTip = hand.smoothedLandmarks[12];
      const trackingPt = isPoint ? indexTip : middleTip;

      const viewport = document.querySelector('.explorer-main') || document.body;
      const rect = viewport.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      const mirroredX = 1 - trackingPt.x;
      const clientX = rect.left + mirroredX * rect.width;
      const clientY = rect.top + trackingPt.y * rect.height;

      const clampedClientX = Math.max(rect.left, Math.min(rect.right, clientX));
      const clampedClientY = Math.max(rect.top, Math.min(rect.bottom, clientY));

      const targetX = clampedClientX + scrollX;
      const targetY = clampedClientY + scrollY;

      if (hand.cursorX === null || hand.cursorY === null) {
        hand.cursorX = targetX;
        hand.cursorY = targetY;
      } else {
        const alpha = 0.15;
        hand.cursorX = alpha * targetX + (1 - alpha) * hand.cursorX;
        hand.cursorY = alpha * targetY + (1 - alpha) * hand.cursorY;
      }

      this.cursorEl.style.left = `${hand.cursorX}px`;
      this.cursorEl.style.top = `${hand.cursorY}px`;
      this.cursorEl.style.opacity = '1';

      const nx = (hand.cursorX - rect.left - scrollX) / rect.width;
      const ny = (hand.cursorY - rect.top - scrollY) / rect.height;
      hand.cursorPos = { x: nx, y: ny };

      if (isPoint) {
        this._updateDwell(activeKey, clampedClientX, clampedClientY);
      } else {
        this._updateDwell(activeKey, -9999, -9999);
      }
    } else {
      if (this.cursorEl) {
        this.cursorEl.style.opacity = '0';
      }
      hand.cursorX = null;
      hand.cursorY = null;
      hand.cursorPos = null;
      this._updateDwell(activeKey, -9999, -9999);
    }
  }

  _updateDwell(activeKey, clientX, clientY) {
    const hand = this.handsData[activeKey];
    if (hand.tracked && hand.currentGesture === 'INDEX_POINT' && window.bioExplorer) {
      window.bioExplorer.handleHover({ clientX, clientY });
      const currentHovered = window.bioExplorer.hoveredMesh;
      const now = Date.now();

      if (now < hand.dwellCooldownEndTime) {
        hand.dwellTarget = null;
        hand.dwellStartTime = 0;
        this._setProgress(0);
        return;
      }

      if (currentHovered) {
        if (currentHovered === hand.dwellTarget) {
          const elapsed = now - hand.dwellStartTime;
          const progress = Math.min(1.0, elapsed / 1500);
          this._setProgress(progress);
          if (elapsed >= 1500) {
            window.bioExplorer.handleClick({ clientX, clientY });
            this._showToast('ORGAN SELECTED');
            hand.dwellCooldownEndTime = now + 1500;
            hand.dwellTarget = null;
            hand.dwellStartTime = 0;
            this._setProgress(0);
          }
        } else {
          hand.dwellTarget = currentHovered;
          hand.dwellStartTime = now;
          this._setProgress(0);
        }
      } else {
        hand.dwellTarget = null;
        hand.dwellStartTime = 0;
        this._setProgress(0);
      }
    } else {
      if (hand.dwellTarget || hand.dwellStartTime !== 0) {
        hand.dwellTarget = null;
        hand.dwellStartTime = 0;
        this._setProgress(0);
      }
      if (window.bioExplorer) {
        window.bioExplorer.handleHover({ clientX: -9999, clientY: -9999 });
      }
    }
  }

  _setProgress(progress) {
    const progressCircle = document.getElementById('bio-cursor-progress-circle');
    if (progressCircle) {
      progressCircle.style.strokeDashoffset = (62.8 * (1 - progress)).toFixed(2);
    }
  }

  _updateZoom(activeKey) {
    if (!activeKey) return;
    const hand = this.handsData[activeKey];
    if (Date.now() < hand.transitionLockEndTime) {
      return;
    }
    if (hand.tracked && hand.currentGesture === 'PINCH' && hand.smoothedLandmarks && window.bioExplorer) {
      const thumbTip = hand.smoothedLandmarks[4];
      const indexTip = hand.smoothedLandmarks[8];
      const d = this._dist(thumbTip, indexTip);

      if (hand.prevPinchDistance === null) {
        hand.prevPinchDistance = d;
        hand.smoothedPinchChange = 0;
        return;
      }

      const delta = d - hand.prevPinchDistance;
      const alpha = 0.25;
      hand.smoothedPinchChange = alpha * delta + (1 - alpha) * hand.smoothedPinchChange;

      const zoomChange = hand.smoothedPinchChange * this.thresholds.zoomSensitivity;
      const targetZoom = Math.max(0.35, Math.min(3.5, window.bioExplorer.targetZoom + zoomChange));
      window.bioExplorer.targetZoom = targetZoom;
      window.bioExplorer.isFlying = true;
      hand.prevPinchDistance = d;
    } else {
      if (hand.prevPinchDistance !== null) {
        hand.prevPinchDistance = null;
        hand.smoothedPinchChange = 0;
      }
    }
  }

  _updateRotation(activeKey) {
    if (!activeKey) return;
    const hand = this.handsData[activeKey];
    if (Date.now() < hand.transitionLockEndTime) {
      return;
    }
    if (hand.tracked && hand.currentGesture === 'FULLY_OPEN_PALM' && hand.gestureDuration >= 250 && hand.smoothedLandmarks && window.bioExplorer) {
      const getPalmCenter = (lm) => {
        const indices = [0, 5, 9, 13, 17];
        let sumX = 0, sumY = 0;
        for (const idx of indices) {
          sumX += lm[idx].x;
          sumY += lm[idx].y;
        }
        return { x: sumX / 5, y: sumY / 5 };
      };

      const curr = getPalmCenter(hand.smoothedLandmarks);

      if (hand.palmPrev === null) {
        hand.palmPrev = curr;
        hand.smoothedPalmDiff = { x: 0, y: 0 };
        return;
      }

      let dx = curr.x - hand.palmPrev.x;
      let dy = curr.y - hand.palmPrev.y;

      const deadZone = 0.002;
      if (Math.abs(dx) < deadZone) dx = 0;
      if (Math.abs(dy) < deadZone) dy = 0;

      const alpha = 0.25;
      hand.smoothedPalmDiff.x = alpha * dx + (1 - alpha) * hand.smoothedPalmDiff.x;
      hand.smoothedPalmDiff.y = alpha * dy + (1 - alpha) * hand.smoothedPalmDiff.y;

      const deltaRotY = -hand.smoothedPalmDiff.x * this.thresholds.rotationSensitivity;
      const deltaRotX = hand.smoothedPalmDiff.y * this.thresholds.rotationSensitivity * 0.6;

      window.bioExplorer.targetRotY += deltaRotY;
      window.bioExplorer.targetRotX = Math.max(-1.1, Math.min(1.1, window.bioExplorer.targetRotX + deltaRotX));
      window.bioExplorer.isFlying = true;

      hand.palmPrev = curr;
    } else {
      if (hand.palmPrev !== null) {
        hand.palmPrev = null;
        hand.smoothedPalmDiff = { x: 0, y: 0 };
      }
    }
  }

  _updateReset(activeKey) {
    if (!activeKey) return;
    const hand = this.handsData[activeKey];
    if (Date.now() < hand.transitionLockEndTime) {
      return;
    }
    if (hand.tracked && hand.currentGesture === 'THREE_FINGER_RESET' && hand.smoothedLandmarks && window.bioExplorer) {
      const now = Date.now();

      if (now < hand.resetCooldownEndTime) {
        hand.resetStartTime = 0;
        this._setProgress(0);
        return;
      }

      if (hand.resetStartTime === 0) {
        hand.resetStartTime = now;
      }

      const elapsed = now - hand.resetStartTime;
      const progress = Math.min(1.0, elapsed / 1000);
      this._setProgress(progress);

      if (elapsed >= 1000) {
        window.bioExplorer.resetView();
        this._showToast('VIEW RESET');
        hand.resetCooldownEndTime = now + 2000;
        hand.resetStartTime = 0;
        this._setProgress(0);
      }
    } else {
      if (hand.resetStartTime !== 0) {
        hand.resetStartTime = 0;
        this._setProgress(0);
      }
    }
  }

  _ensureFeedbackUI() {
    const panel = document.getElementById('gesture-panel');
    if (!panel) return;

    if (!document.getElementById('gesture-mode-row')) {
      const modeRow = document.createElement('div');
      modeRow.id = 'gesture-mode-row';
      modeRow.className = 'gesture-active-row';
      modeRow.style.marginTop = '4px';
      modeRow.style.borderTop = 'none';
      modeRow.innerHTML = `
        <span class="gesture-active-title">Mode</span>
        <span id="gesture-feedback-ui-mode" style="color: #00d4ff; font-weight: bold; margin-right: auto; margin-left: 8px;">NO HAND</span>
        <span id="gesture-feedback-ui-conf" style="font-size: 11px; padding: 2px 6px; background: rgba(0, 212, 255, 0.15); border-radius: 4px; color: #00d4ff; font-family: monospace; display: none;">0%</span>
      `;
      const activeRow = panel.querySelector('.gesture-active-row');
      if (activeRow) {
        activeRow.parentNode.insertBefore(modeRow, activeRow.nextSibling);
      }
    }
  }

  _updateFeedbackUI(mode, score) {
    this._ensureFeedbackUI();
    const modeEl = document.getElementById('gesture-feedback-ui-mode');
    const confEl = document.getElementById('gesture-feedback-ui-conf');
    if (modeEl) modeEl.textContent = mode;
    if (confEl) {
      confEl.textContent = `${Math.round(score * 100)}%`;
      confEl.style.display = score > 0 ? 'inline-block' : 'none';
    }
  }

  _showToast(msg) {
    let toast = document.getElementById('bio-gesture-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bio-gesture-toast';
      toast.style.position = 'absolute';
      toast.style.bottom = '80px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.padding = '8px 16px';
      toast.style.background = 'rgba(0, 0, 0, 0.75)';
      toast.style.color = '#ffffff';
      toast.style.borderRadius = '20px';
      toast.style.border = '1px solid #00d4ff';
      toast.style.fontSize = '14px';
      toast.style.fontWeight = 'bold';
      toast.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.5)';
      toast.style.zIndex = '999999';
      toast.style.transition = 'opacity 0.25s ease';
      toast.style.pointerEvents = 'none';
      toast.style.opacity = '0';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    if (this._toastTimeout) clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.style.opacity = '0';
    }, 2000);
  }

  _onHandResults(results) {
    if (!this.isLooping) return;
    this._drawLandmarks(results);

    const prevTracked = this.prevTracked;
    const tracked = !!(results.multiHandLandmarks && results.multiHandLandmarks.length > 0);
    this.prevTracked = tracked;

    if (tracked !== prevTracked) {
      if (tracked) {
        this._status('Hand tracking acquired', 'success');
      } else {
        this._status('Searching for hand...', 'info');
      }
    }

    if (!tracked) {
      this._clearHand('Left');
      this._clearHand('Right');
      this._emitGestureLabel('NONE');
      this._resetAllModes();
      this._updateFeedbackUI('NO HAND', 0);
      return;
    }

    const assignedIndices = { Left: -1, Right: -1 };
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        if (results.multiHandedness && results.multiHandedness[i]) {
          const rawLabel = results.multiHandedness[i].label || '';
          const actualLabel = (rawLabel.toLowerCase() === 'left') ? 'Left' : 'Right';
          assignedIndices[actualLabel] = i;
        }
      }
    }

    for (const key of ['Left', 'Right']) {
      const idx = assignedIndices[key];
      if (idx !== -1) {
        this._updateHand(key, {
          landmarks: results.multiHandLandmarks[idx],
          score: (results.multiHandedness && results.multiHandedness[idx]) ? results.multiHandedness[idx].score : 0.9
        });
      } else {
        this._clearHand(key);
      }
    }

    const leftTracked = this.handsData.Left.tracked;
    const rightTracked = this.handsData.Right.tracked;
    const leftValid = leftTracked && this.handsData.Left.currentGesture !== 'NONE';
    const rightValid = rightTracked && this.handsData.Right.currentGesture !== 'NONE';

    if (leftValid && !rightValid) {
      this.activeHandKey = 'Left';
    } else if (!leftValid && rightValid) {
      this.activeHandKey = 'Right';
    } else if (leftValid && rightValid) {
      if (this.activeHandKey !== 'Left' && this.activeHandKey !== 'Right') {
        this.activeHandKey = 'Left';
      }
    } else {
      this.activeHandKey = null;
    }

    for (const key of ['Left', 'Right']) {
      if (key !== this.activeHandKey) {
        this._cleanupHandInteraction(key);
      }
    }



    this._updateCursor(this.activeHandKey);
    this._updateZoom(this.activeHandKey);
    this._updateRotation(this.activeHandKey);
    this._updateReset(this.activeHandKey);

    if (this.activeHandKey) {
      const activeHand = this.handsData[this.activeHandKey];
      this._emitGestureLabel(activeHand.currentGesture);

      let modeText = 'LOCKED';
      if (activeHand.currentGesture === 'INDEX_POINT') modeText = 'POINT';
      else if (activeHand.currentGesture === 'PINCH') modeText = 'ZOOM';
      else if (activeHand.currentGesture === 'FULLY_OPEN_PALM') modeText = 'ROTATE';
      else if (activeHand.currentGesture === 'THREE_FINGER_RESET') modeText = 'RESET';
      else if (activeHand.currentGesture === 'NONE') modeText = 'NONE';

      this._updateFeedbackUI(modeText, activeHand.score);
    } else {
      this._resetAllModes();
      for (const key of ['Left', 'Right']) {
        const hand = this.handsData[key];
        if (hand.currentGesture === 'NONE') {
          hand.gestureConfidence = 0.0;
          hand.gestureDuration = 0;
        }
      }
      this._emitGestureLabel('NONE');
      this._updateFeedbackUI('NO HAND', 0);
    }
  }

  _drawLandmarks(results) {
    const canvas = document.getElementById('gesture-feed-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(this.videoEl, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20],
      [5,9],[9,13],[13,17],
    ];

    for (const key of ['Left', 'Right']) {
      const hand = this.handsData[key];
      if (!hand.tracked || !hand.smoothedLandmarks) continue;

      ctx.strokeStyle = key === 'Right' ? 'rgba(0,212,255,0.7)' : 'rgba(212,123,255,0.7)';
      ctx.lineWidth = 1.5;
      for (const [a, b] of connections) {
        const pa = hand.smoothedLandmarks[a], pb = hand.smoothedLandmarks[b];
        if (!pa || !pb) continue;
        ctx.beginPath();
        ctx.moveTo((1 - pa.x) * canvas.width, pa.y * canvas.height);
        ctx.lineTo((1 - pb.x) * canvas.width, pb.y * canvas.height);
        ctx.stroke();
      }

      for (const pt of hand.smoothedLandmarks) {
        const x = (1 - pt.x) * canvas.width;
        const y = pt.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = key === 'Right' ? '#00d4ff' : '#d47bff';
        ctx.fill();
      }
    }
  }

  _status(msg, type = 'info') {
    if (this.onStatus) this.onStatus(msg, type);
    const el = document.getElementById('gesture-status-text');
    if (el) el.textContent = msg;
    const badge = document.getElementById('gesture-status-badge');
    if (badge) {
      badge.className = 'gesture-status-badge';
      badge.classList.add(`gesture-status--${type}`);
    }
  }

  _emitGestureLabel(gesture) {
    const labelMap = {
      NONE: { icon: '·', label: 'No gesture' },
      INDEX_POINT: { icon: '☝️', label: 'Pointing' },
      PINCH: { icon: '🤏', label: 'Pinching' },
      OPEN_PALM: { icon: '✋', label: 'Open Palm' },
      CLOSED_FIST: { icon: '✊', label: 'Closed Fist' },
      THREE_FINGER_RESET: { icon: '🔄', label: 'Resetting' }
    };
    const entry = labelMap[gesture] || labelMap.NONE;
    const el = document.getElementById('gesture-active-label');
    if (el) el.textContent = `${entry.icon} ${entry.label}`;
    const hud = document.getElementById('hud-gesture');
    if (hud) {
      hud.textContent = gesture !== 'NONE' ? entry.icon : '';
      hud.style.opacity = gesture !== 'NONE' ? '1' : '0';
    }
  }

  _emitUI(enabled) {
    const btn = document.getElementById('gesture-toggle-btn');
    const panel = document.getElementById('gesture-panel');
    if (btn) {
      btn.classList.toggle('active', enabled);
      btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      btn.title = enabled ? 'Disable Gesture Control' : 'Enable Gesture Control';
      const textSpan = btn.querySelector('span:not(.gesture-btn-icon):not(.gesture-btn-dot)');
      if (textSpan) {
        textSpan.textContent = enabled ? 'Gestures: ON' : 'Gestures: OFF';
      }
    }
    if (panel) {
      panel.classList.toggle('gesture-panel--open', enabled);
    }
  }
}

window.bioGestureController = new BioGestureController();
