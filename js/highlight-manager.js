'use strict';

class HighlightManager {

  constructor() {
    this.highlightedObject = null;
    this.previousMaterial  = new Map();
    this.outlinePass       = null;
    this.highlightQueue    = [];

    this.hoverMaterial = {
      emissiveHex:  0x007799,
      emissiveIntensity: 1.0,
    };

    this.selectionMaterial = {
      emissiveHex:  0x00d4ff,
      emissiveIntensity: 1.4,
    };

    this._pulseHandles  = new Map();
    this._flashHandles  = new Map();
    this._listeners     = new Map();
    this._animFrame     = null;
    this._time          = 0;
    this._active        = new Set();
  }

  initialize() {
    window.addEventListener('bioSelectionChanged', (e) => {
      const { selected, previous } = e.detail;
      if (previous?.object) this._clearSelectionEmissive(previous.object);
      if (selected?.object) this._applySelectionEmissive(selected.object);
    });

    window.addEventListener('bioHoverChanged', (e) => {
      const { hovered, previous } = e.detail;
      if (previous?.object) this._clearHoverEmissive(previous.object);
      if (hovered?.object)  this._applyHoverEmissive(hovered.object);
    });

    this._startLoop();
    return this;
  }

  highlight(object) {
    if (!object) return this;
    this._applySelectionEmissive(object);
    const prev = this.highlightedObject;
    if (prev && prev !== object) this._clearSelectionEmissive(prev);
    this.highlightedObject = object;
    this._emit('highlightChanged', { object, previous: prev });
    return this;
  }

  unhighlight() {
    const obj = this.highlightedObject;
    if (!obj) return this;
    this._clearSelectionEmissive(obj);
    this.highlightedObject = null;
    this._emit('highlightCleared', { object: obj });
    return this;
  }

  highlightHover(object) {
    if (!object) return this;
    this._applyHoverEmissive(object);
    return this;
  }

  clearHover(object) {
    if (!object) return this;
    this._clearHoverEmissive(object);
    return this;
  }

  flash(object, duration = 600) {
    if (!object) return this;
    if (this._flashHandles.has(object.uuid)) return this;

    const mat = this._getMaterial(object);
    if (!mat?.emissive) return this;

    this._saveEmissive(object);
    const start = performance.now();

    const tick = (now) => {
      const t   = Math.min((now - start) / duration, 1);
      const v   = Math.sin(t * Math.PI);
      mat.emissive.setHex(
        this._lerpHex(this.hoverMaterial.emissiveHex, this.selectionMaterial.emissiveHex, v)
      );
      if (t < 1) {
        this._flashHandles.set(object.uuid, requestAnimationFrame(tick));
      } else {
        this._flashHandles.delete(object.uuid);
        this.restore(object);
      }
    };

    this._flashHandles.set(object.uuid, requestAnimationFrame(tick));
    return this;
  }

  pulse(object) {
    if (!object) return this;
    if (this._pulseHandles.has(object.uuid)) return this;

    const mat = this._getMaterial(object);
    if (!mat?.emissive) return this;

    this._saveEmissive(object);
    this._active.add(object.uuid);
    this._pulseHandles.set(object.uuid, { object, mat });
    return this;
  }

  restore(object) {
    if (!object) return this;

    this._pulseHandles.delete(object.uuid);
    this._active.delete(object.uuid);

    if (this._flashHandles.has(object.uuid)) {
      cancelAnimationFrame(this._flashHandles.get(object.uuid));
      this._flashHandles.delete(object.uuid);
    }

    const saved = this.previousMaterial.get(object.uuid);
    const mat   = this._getMaterial(object);

    if (mat?.emissive && saved !== undefined) {
      mat.emissive.setHex(saved);
    }

    this.previousMaterial.delete(object.uuid);

    if (this.highlightedObject === object) {
      this.highlightedObject = null;
      this._emit('highlightCleared', { object });
    }

    return this;
  }

  isHighlighted(object) {
    return object ? this.highlightedObject === object : false;
  }

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return this;
  }

  off(event, fn) {
    this._listeners.get(event)?.delete(fn);
    return this;
  }

  _applySelectionEmissive(object) {
    const mat = this._getMaterial(object);
    if (!mat?.emissive) return;
    this._saveEmissive(object);
    mat.emissive.setHex(this.selectionMaterial.emissiveHex);
  }

  _clearSelectionEmissive(object) {
    if (this._pulseHandles.has(object.uuid)) return;
    const mat   = this._getMaterial(object);
    const saved = this.previousMaterial.get(object.uuid);
    if (mat?.emissive && saved !== undefined) {
      mat.emissive.setHex(saved);
    }
  }

  _applyHoverEmissive(object) {
    const mat = this._getMaterial(object);
    if (!mat?.emissive) return;
    if (!this.previousMaterial.has(object.uuid)) {
      this._saveEmissive(object);
    }
    mat.emissive.setHex(this.hoverMaterial.emissiveHex);
  }

  _clearHoverEmissive(object) {
    if (object === this.highlightedObject) return;
    if (this._pulseHandles.has(object.uuid)) return;
    const mat   = this._getMaterial(object);
    const saved = this.previousMaterial.get(object.uuid);
    if (mat?.emissive && saved !== undefined) {
      mat.emissive.setHex(saved);
      this.previousMaterial.delete(object.uuid);
    }
  }

  _saveEmissive(object) {
    if (this.previousMaterial.has(object.uuid)) return;
    const mat = this._getMaterial(object);
    if (!mat?.emissive) return;
    this.previousMaterial.set(
      object.uuid,
      object.userData.originalEmissive !== undefined
        ? object.userData.originalEmissive
        : mat.emissive.getHex()
    );
  }

  _getMaterial(object) {
    if (!object?.material) return null;
    return Array.isArray(object.material) ? object.material[0] : object.material;
  }

  _startLoop() {
    const tick = () => {
      this._animFrame = requestAnimationFrame(tick);
      this._time += 0.016;
      for (const [, entry] of this._pulseHandles) {
        if (!entry.mat?.emissive) continue;
        const v = (Math.sin(this._time * 4.0) + 1) / 2;
        entry.mat.emissive.setHex(
          this._lerpHex(0x003344, this.selectionMaterial.emissiveHex, v)
        );
      }
    };
    this._animFrame = requestAnimationFrame(tick);
  }

  _lerpHex(a, b, t) {
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return (r << 16) | (g << 8) | bl;
  }

  _emit(event, data) {
    const fns = this._listeners.get(event);
    if (fns) for (const fn of fns) { try { fn(data); } catch (_) {} }
    window.dispatchEvent(new CustomEvent('bioHighlightManager:' + event, { detail: data }));
  }
}

window.HighlightManager = HighlightManager;
