'use strict';

class AnatomyManager {

  constructor(modelManager) {
    if (!modelManager) throw new Error('[AnatomyManager] modelManager is required.');

    this._mm = modelManager;

    this.currentSystem   = null;
    this.availableSystems = new Map();
    this.visibleSystems  = new Set();
    this.systemMetadata  = new Map();
    this.systemOrder     = [];

    this._listeners = new Map();
  }

  initialize() {
    const defaults = [
      {
        id: 'fullBody',
        displayName: 'Full Body',
        description: 'Complete human anatomy overview showing all major systems and structures.',
        modelName: 'skeleton',
        icon: '🫀',
        color: '#00d4ff',
        category: 'overview',
        interactive: true,
        visible: false,
        loaded: false,
        animations: ['breathe'],
      },
      {
        id: 'skeletal',
        displayName: 'Skeletal System',
        description: 'The skeletal system provides structural support and protection for vital organs, enables movement through joints and muscles, and produces blood cells within bone marrow.',
        modelName: 'skeleton',
        icon: '🦴',
        color: '#d4d4d8',
        category: 'system',
        interactive: true,
        visible: false,
        loaded: false,
        animations: [],
      },
      {
        id: 'muscular',
        displayName: 'Muscular System',
        description: 'The muscular system comprises over 640 muscles that enable movement, maintain posture, generate heat, and support vital functions.',
        modelName: 'skeleton',
        icon: '💪',
        color: '#f43f5e',
        category: 'system',
        interactive: true,
        visible: false,
        loaded: false,
        animations: [],
      },
      {
        id: 'nervous',
        displayName: 'Nervous System',
        description: 'The nervous system is the body\'s command center, processing sensory information and coordinating responses through 86 billion neurons.',
        modelName: 'skeleton',
        icon: '🧠',
        color: '#a855f7',
        category: 'system',
        interactive: true,
        visible: false,
        loaded: false,
        animations: ['pulse'],
      },
      {
        id: 'cardiovascular',
        displayName: 'Cardiovascular System',
        description: 'The cardiovascular system is the body\'s transport network, pumping oxygenated blood to every cell and returning deoxygenated blood to the lungs.',
        modelName: 'skeleton',
        icon: '❤️',
        color: '#ef4444',
        category: 'system',
        interactive: true,
        visible: false,
        loaded: false,
        animations: ['heartbeat'],
      },
      {
        id: 'digestive',
        displayName: 'Digestive System',
        description: 'The digestive system breaks down food into nutrients, absorbs them into the bloodstream, and eliminates waste along a 9-metre GI tract.',
        modelName: 'skeleton',
        icon: '🫀',
        color: '#f59e0b',
        category: 'system',
        interactive: true,
        visible: false,
        loaded: false,
        animations: [],
      },
      {
        id: 'respiratory',
        displayName: 'Respiratory System',
        description: 'The respiratory system facilitates the essential exchange of oxygen and carbon dioxide between the body and the environment through 23,000 breaths per day.',
        modelName: 'skeleton',
        icon: '🫁',
        color: '#22d3ee',
        category: 'system',
        interactive: true,
        visible: false,
        loaded: false,
        animations: ['breathe'],
      },
      {
        id: 'lymphatic',
        displayName: 'Lymphatic System',
        description: 'The lymphatic system maintains fluid balance, supports immunity, and transports fats from the digestive system through a network of vessels and lymph nodes.',
        modelName: 'skeleton',
        icon: '🛡️',
        color: '#06b6d4',
        category: 'system',
        interactive: true,
        visible: false,
        loaded: false,
        animations: [],
      },
    ];

    for (const meta of defaults) {
      this.registerSystem(meta.id, meta);
    }

    return this;
  }

  registerSystem(id, metadata) {
    const record = Object.assign(
      {
        id,
        displayName: id,
        description: '',
        modelName: null,
        icon: '🔬',
        color: '#ffffff',
        category: 'system',
        interactive: true,
        visible: false,
        loaded: false,
        animations: [],
      },
      metadata,
      { id }
    );

    this.systemMetadata.set(id, record);
    this.availableSystems.set(id, record);

    if (!this.systemOrder.includes(id)) {
      this.systemOrder.push(id);
    }

    return this;
  }

  async activate(id) {
    const meta = this.systemMetadata.get(id);
    if (!meta) return;

    for (const active of [...this.visibleSystems]) {
      if (active !== id) {
        this._hide(active);
      }
    }

    await this._show(id);
    this.currentSystem = id;
    this._emit('systemActivated', { id, meta });

    return this;
  }

  deactivate(id) {
    if (!this.visibleSystems.has(id)) return;
    this._hide(id);
    if (this.currentSystem === id) this.currentSystem = null;
    this._emit('systemDeactivated', { id });
    return this;
  }

  toggle(id) {
    if (this.visibleSystems.has(id)) {
      return Promise.resolve(this.deactivate(id));
    }
    return this.activate(id);
  }

  async activateMultiple(ids) {
    const valid = ids.filter(id => this.systemMetadata.has(id));
    await Promise.all(valid.map(id => this._show(id)));
    if (valid.length) this.currentSystem = valid[valid.length - 1];
    this._emit('systemsActivated', { ids: valid });
    return this;
  }

  deactivateAll() {
    for (const id of [...this.visibleSystems]) {
      this._hide(id);
    }
    this.currentSystem = null;
    this._emit('allDeactivated', {});
    return this;
  }

  next() {
    const idx = this.currentSystem ? this.systemOrder.indexOf(this.currentSystem) : -1;
    const nextId = this.systemOrder[(idx + 1) % this.systemOrder.length];
    return nextId ? this.activate(nextId) : Promise.resolve();
  }

  previous() {
    const idx = this.currentSystem ? this.systemOrder.indexOf(this.currentSystem) : 0;
    const prevIdx = (idx - 1 + this.systemOrder.length) % this.systemOrder.length;
    const prevId = this.systemOrder[prevIdx];
    return prevId ? this.activate(prevId) : Promise.resolve();
  }

  getCurrent() {
    if (!this.currentSystem) return null;
    return this.systemMetadata.get(this.currentSystem) ?? null;
  }

  getAvailable() {
    return [...this.availableSystems.values()];
  }

  isActive(id) {
    return this.visibleSystems.has(id);
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

  async _show(id) {
    const meta = this.systemMetadata.get(id);
    if (!meta) return;

    if (meta.modelName && !this._mm.isLoaded(meta.modelName)) {
      meta.loaded = false;
    }

    if (this._mm.isLoaded(meta.modelName)) {
      this._mm.show(meta.modelName);
    }

    meta.visible = true;
    this.visibleSystems.add(id);
  }

  _hide(id) {
    const meta = this.systemMetadata.get(id);
    if (!meta) return;

    if (meta.modelName && this._mm.isLoaded(meta.modelName)) {
      const others = [...this.visibleSystems].filter(
        s => s !== id && this.systemMetadata.get(s)?.modelName === meta.modelName
      );
      if (others.length === 0) {
        this._mm.hide(meta.modelName);
      }
    }

    meta.visible = false;
    this.visibleSystems.delete(id);
  }

  _emit(event, data) {
    const fns = this._listeners.get(event);
    if (!fns) return;
    for (const fn of fns) {
      try { fn(data); } catch (_) {}
    }
    window.dispatchEvent(new CustomEvent('bioAnatomyManager:' + event, { detail: data }));
  }
}

window.AnatomyManager = AnatomyManager;
