'use strict';

class GLBSystemSwitcher {

  constructor(explorer) {
    this.explorer = explorer;
    this.glbGroups = {};
    this._ready = false;
  }

  initialize() {
    const ac = this.explorer.anatomyContainer;
    if (!ac) return this;

    const NAME_MAP = {
      skeletal      : 'Skeletal system.g',
      muscular      : 'Muscular system.g',
      joints        : 'Joints.g',
      cardiovascular: ['Arterial system.g', 'Venous system.g'],
      circulatory   : ['Arterial system.g', 'Venous system.g'],
      lymphatic     : 'Lymphoid organs.g',
      immune        : 'Lymphoid organs.g',
      nervous       : 'Nervous system & Sense organs.g',
      visceral      : 'Visceral systems.g',
      digestive     : 'Visceral systems.g',
      respiratory   : 'Visceral systems.g',
      regions       : 'Regions of human body.g',
    };

    ac.traverse((node) => {
      for (const [key, glbName] of Object.entries(NAME_MAP)) {
        if (Array.isArray(glbName)) {
          if (!this.glbGroups[key]) this.glbGroups[key] = [];
          glbName.forEach((n) => {
            if (node.name === n && !this.glbGroups[key].includes(node)) {
              this.glbGroups[key].push(node);
            }
          });
        } else {
          if (node.name === glbName && !this.glbGroups[key]) {
            this.glbGroups[key] = node;
          }
        }
      }
    });

    const found = Object.keys(this.glbGroups).filter(k => {
      const v = this.glbGroups[k];
      return Array.isArray(v) ? v.length > 0 : !!v;
    });

    if (found.length === 0) {
      console.warn('[GLBSystemSwitcher] No GLB root groups found ? system switching will use legacy path.');
      return this;
    }

    this._ready = true;
    console.log('[GLBSystemSwitcher] GLB groups indexed:', found);
    this._patchSwitchSystem();
    this._patchRaycasting();
    return this;
  }

  showSystem(systemId) {
    this.hideAllSystems();
    this._resolve(systemId).forEach((g) => { g.visible = true; });
  }

  hideSystem(systemId) {
    this._resolve(systemId).forEach((g) => { g.visible = false; });
  }

  hideAllSystems() {
    const seen = new Set();
    for (const val of Object.values(this.glbGroups)) {
      (Array.isArray(val) ? val : [val]).forEach((g) => {
        if (g && !seen.has(g)) { g.visible = false; seen.add(g); }
      });
    }
  }

  showAllSystems() {
    const seen = new Set();
    for (const val of Object.values(this.glbGroups)) {
      (Array.isArray(val) ? val : [val]).forEach((g) => {
        if (g && !seen.has(g)) { g.visible = true; seen.add(g); }
      });
    }
  }

  toggleSystem(systemId) {
    const targets = this._resolve(systemId);
    if (!targets.length) return;
    const next = !targets[0].visible;
    targets.forEach((g) => { g.visible = next; });
  }

  _resolve(systemId) {
    const val = this.glbGroups[systemId];
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  _visibleMeshes() {
    const out = [];
    const ac = this.explorer.anatomyContainer;
    if (!ac) return out;
    ac.traverse((obj) => {
      if (!obj.isMesh && !obj.isSkinnedMesh) return;
      let anc = obj;
      while (anc) {
        if (anc.visible === false) return;
        anc = anc.parent;
      }
      out.push(obj);
    });
    return out;
  }

  _patchSwitchSystem() {
    const self = this;
    const ex   = this.explorer;

    ex.switchSystem = async function (key) {
      ex.activeSystem = key;

      if (key === 'fullBody') {
        self.showAllSystems();
      } else {
        self.showSystem(key);
      }

      if (ex.skinGroup) ex.skinGroup.visible = (key === 'fullBody');

      const sys = (typeof BioAnatomyData !== 'undefined') ? BioAnatomyData.systems[key] : null;
      const lightHex = sys?.lightColor || 0x00d4ff;
      if (ex.systemLight) ex.systemLight.color.setHex(lightHex);
      if (ex.keyLight)    ex.keyLight.color.setHex(lightHex);

      const sysData = (key === 'fullBody')
        ? { name: 'Full Body', stat1: { value: '?', label: '' }, stat2: { value: '?', label: '' } }
        : sys;

      const label = document.getElementById('active-system-label');
      if (label && sysData) label.textContent = sysData.name || '';
      const hudSys = document.getElementById('hud-system');
      if (hudSys && sysData) hudSys.textContent = sysData.name || '';

      const s1v = document.getElementById('info-stat1-value');
      const s1l = document.getElementById('info-stat1-label');
      const s2v = document.getElementById('info-stat2-value');
      const s2l = document.getElementById('info-stat2-label');
      if (s1v) s1v.textContent = sysData?.stat1?.value || '';
      if (s1l) s1l.textContent = sysData?.stat1?.label || '';
      if (s2v) s2v.textContent = sysData?.stat2?.value || '';
      if (s2l) s2l.textContent = sysData?.stat2?.label || '';

      ex.selectMesh(null);

      if (window.bioAnimations3D) window.bioAnimations3D.switchSystem(key);

      window.dispatchEvent(new CustomEvent('bioSystemChanged', { detail: { system: key } }));
    };
  }

  _patchRaycasting() {
    const self = this;
    const ex   = this.explorer;

    ex.handleClick = function (e) {
      const rect = ex.canvas.getBoundingClientRect();
      ex.mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ex.mouse2D.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      const targets = self._visibleMeshes();
      let hit = null;
      if (ex.selectionManager) {
        hit = ex.selectionManager.pick(ex.mouse2D, ex.camera, targets);
      } else {
        ex.raycaster.setFromCamera(ex.mouse2D, ex.camera);
        const hits = ex.raycaster.intersectObjects(targets, false);
        if (hits.length > 0) hit = hits[0];
      }

      ex.selectMesh(hit ? hit.object : null);
    };

    ex.handleHover = function (e) {
      const rect = ex.canvas.getBoundingClientRect();
      ex.mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ex.mouse2D.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      const targets = self._visibleMeshes();
      let hit = null;
      if (ex.selectionManager) {
        hit = ex.selectionManager.pick(ex.mouse2D, ex.camera, targets);
      } else {
        ex.raycaster.setFromCamera(ex.mouse2D, ex.camera);
        const hits = ex.raycaster.intersectObjects(targets, false);
        if (hits.length > 0) hit = hits[0];
      }

      const label  = document.getElementById('organ-hover-label');
      const nameEl = document.getElementById('organ-hover-name');
      const sysEl  = document.getElementById('organ-hover-system');

      if (hit) {
        const mesh    = hit.object;
        const sysData = (typeof BioAnatomyData !== 'undefined') ? BioAnatomyData.systems[ex.activeSystem] : null;
        if (ex.selectionManager) ex.selectionManager.hover(mesh);
        if (ex.aas) {
          ex.aas.setHoverHighlight(mesh, true);
          if (ex.hoveredMesh && ex.hoveredMesh !== mesh) ex.aas.setHoverHighlight(ex.hoveredMesh, false);
        }
        ex.hoveredMesh = mesh;
        if (label) {
          label.style.opacity = '1';
          label.style.left    = (e.clientX - rect.left + 16) + 'px';
          label.style.top     = (e.clientY - rect.top  - 8)  + 'px';
        }
        if (nameEl) nameEl.textContent = mesh.userData.organName || mesh.name || '';
        if (sysEl)  { sysEl.textContent = sysData?.name || ''; sysEl.style.color = sysData?.color || '#00d4ff'; }
        ex.canvas.style.cursor = 'pointer';
      } else {
        if (ex.selectionManager) ex.selectionManager.unhover();
        if (ex.hoveredMesh && ex.aas) ex.aas.setHoverHighlight(ex.hoveredMesh, false);
        ex.hoveredMesh = null;
        if (label) label.style.opacity = '0';
        ex.canvas.style.cursor = ex.isDragging ? 'grabbing' : 'grab';
      }
    };
  }
}

window.GLBSystemSwitcher = GLBSystemSwitcher;
