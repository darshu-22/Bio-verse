'use strict';

class SelectionManager {

  constructor() {
    this.selectedObject  = null;
    this.hoveredObject   = null;
    this.selectionHistory = [];
    this.pickableObjects = new Map();
    this.raycaster       = new THREE.Raycaster();
    this.pointer         = new THREE.Vector2();

    this._listeners = new Map();
    this._maxHistory = 50;
  }

  initialize() {
    this.raycaster.params.Mesh = { threshold: 0 };
    return this;
  }

  register(object) {
    if (!object) return this;
    const id = object.userData?.meshId || object.uuid;
    this.pickableObjects.set(id, {
      id:          id,
      name:        object.userData?.organName  ?? object.name ?? '',
      system:      object.userData?.systemKey  ?? '',
      type:        object.userData?.type       ?? 'mesh',
      description: object.userData?.description ?? '',
      interactive: object.userData?.interactive !== false,
      object,
    });
    return this;
  }

  unregister(object) {
    if (!object) return this;
    const id = object.userData?.meshId || object.uuid;
    this.pickableObjects.delete(id);
    if (this.selectedObject?.object === object) this.deselect();
    if (this.hoveredObject?.object === object)  this.unhover();
    return this;
  }

  clear() {
    this.pickableObjects.clear();
    this.deselect();
    this.unhover();
    this._emit('selectionCleared', {});
    return this;
  }

  select(object) {
    if (!object) { this.deselect(); return this; }

    const id  = object.userData?.meshId || object.uuid;
    const rec = this.pickableObjects.get(id) ?? this._makeTransient(object);

    if (!rec.interactive) return this;

    const prev = this.selectedObject;

    if (prev?.object === object) return this;

    this.selectedObject = rec;

    if (prev) {
      this.selectionHistory.push(prev);
      if (this.selectionHistory.length > this._maxHistory) {
        this.selectionHistory.shift();
      }
    }

    this._emit('selectionChanged', { selected: rec, previous: prev });
    window.dispatchEvent(new CustomEvent('bioSelectionChanged', {
      detail: { selected: rec, previous: prev },
    }));

    return this;
  }

  deselect() {
    const prev = this.selectedObject;
    if (!prev) return this;
    this.selectedObject = null;
    this._emit('selectionChanged', { selected: null, previous: prev });
    window.dispatchEvent(new CustomEvent('bioSelectionChanged', {
      detail: { selected: null, previous: prev },
    }));
    return this;
  }

  hover(object) {
    if (!object) { this.unhover(); return this; }

    const id  = object.userData?.meshId || object.uuid;
    const rec = this.pickableObjects.get(id) ?? this._makeTransient(object);

    if (!rec.interactive) return this;
    if (this.hoveredObject?.object === object) return this;

    const prev = this.hoveredObject;
    this.hoveredObject = rec;

    this._emit('hoverChanged', { hovered: rec, previous: prev });
    window.dispatchEvent(new CustomEvent('bioHoverChanged', {
      detail: { hovered: rec, previous: prev },
    }));

    return this;
  }

  unhover() {
    const prev = this.hoveredObject;
    if (!prev) return this;
    this.hoveredObject = null;
    this._emit('hoverChanged', { hovered: null, previous: prev });
    window.dispatchEvent(new CustomEvent('bioHoverChanged', {
      detail: { hovered: null, previous: prev },
    }));
    return this;
  }

  getSelected() {
    return this.selectedObject;
  }

  getHovered() {
    return this.hoveredObject;
  }

  isSelected(object) {
    if (!object) return false;
    return this.selectedObject?.object === object;
  }

  isHovered(object) {
    if (!object) return false;
    return this.hoveredObject?.object === object;
  }

  pick(pointer, camera, objects) {
    if (!camera) return null;

    this.pointer.set(pointer.x, pointer.y);
    this.raycaster.setFromCamera(this.pointer, camera);

    const targets = this._resolveTargets(objects);
    if (targets.length === 0) return null;

    const hits = this.raycaster.intersectObjects(targets, false);
    return hits.length > 0 ? hits[0] : null;
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

  _resolveTargets(objects) {
    if (Array.isArray(objects)) return objects;
    if (objects && typeof objects.traverse === 'function') {
      const out = [];
      objects.traverse(c => { if (c.isMesh || c.isSkinnedMesh) out.push(c); });
      return out;
    }
    return [...this.pickableObjects.values()]
      .filter(r => r.interactive)
      .map(r => r.object)
      .filter(Boolean);
  }

  _makeTransient(object) {
    return {
      id:          object.userData?.meshId || object.uuid,
      name:        object.userData?.organName ?? object.name ?? '',
      system:      object.userData?.systemKey ?? '',
      type:        object.userData?.type ?? 'mesh',
      description: object.userData?.description ?? '',
      interactive: object.userData?.interactive !== false,
      object,
    };
  }

  _emit(event, data) {
    const fns = this._listeners.get(event);
    if (!fns) return;
    for (const fn of fns) {
      try { fn(data); } catch (_) {}
    }
  }
}

window.SelectionManager = SelectionManager;
