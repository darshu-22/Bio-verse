




'use strict';

class OrganHierarchy {
  constructor() {
    this.container = document.getElementById('hierarchy-tree');
    if (!this.container) return;

    this.currentSystem = 'fullBody';
    this.selectedId = null;

    this.render(this.currentSystem);
    this.bindEvents();
  }

  render(systemKey) {
    if (!this.container) return;
    this.container.innerHTML = '';

    this.currentSystem = systemKey;
    const data = BioAnatomyData.systems[systemKey];
    if (!data || !data.hierarchy) {
      const placeholder = document.createElement('div');
      placeholder.className = 'hierarchy-placeholder-msg';
      placeholder.style.padding = '20px 15px';
      placeholder.style.textAlign = 'center';
      placeholder.style.color = 'var(--text-secondary, #a1a1aa)';
      placeholder.style.fontSize = '0.9rem';
      placeholder.style.lineHeight = '1.4';
      placeholder.textContent = 'Select a specific system to view its detailed organ hierarchy.';
      this.container.appendChild(placeholder);
      return;
    }

    for (const group of data.hierarchy) {
      this.container.appendChild(this.buildGroup(group, data.color));
    }
  }

  buildGroup(group, accentColor) {
    const wrapper = document.createElement('div');
    wrapper.className = 'hier-group';
    wrapper.setAttribute('role', 'treeitem');
    wrapper.setAttribute('aria-expanded', group.expanded ? 'true' : 'false');

    
    const header = document.createElement('div');
    header.className = 'hier-group-header';
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-label', `${group.label} group, ${group.children?.length || 0} items`);
    header.innerHTML = `
      <span class="hier-chevron ${group.expanded ? 'expanded' : ''}">▶</span>
      <span class="hier-group-label">${group.label}</span>
      <span class="hier-count">${group.children?.length || 0}</span>
    `;

    
    const childrenEl = document.createElement('div');
    childrenEl.className = 'hier-children';
    childrenEl.style.display = group.expanded ? 'flex' : 'none';
    childrenEl.setAttribute('role', 'group');

    
    const toggle = () => {
      const isExp = childrenEl.style.display !== 'none';
      childrenEl.style.display = isExp ? 'none' : 'flex';
      const chev = header.querySelector('.hier-chevron');
      if (chev) chev.classList.toggle('expanded', !isExp);
      wrapper.setAttribute('aria-expanded', (!isExp).toString());
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    
    if (group.children) {
      for (const child of group.children) {
        childrenEl.appendChild(this.buildLeaf(child, accentColor));
      }
    }

    wrapper.appendChild(header);
    wrapper.appendChild(childrenEl);
    return wrapper;
  }

  buildLeaf(child, accentColor) {
    const leaf = document.createElement('div');
    leaf.className = 'hier-leaf';
    leaf.setAttribute('role', 'treeitem');
    leaf.setAttribute('tabindex', '0');
    leaf.setAttribute('data-mesh-id', child.meshId || '');
    leaf.setAttribute('data-organ-id', child.id || '');
    leaf.setAttribute('aria-label', child.label);
    leaf.innerHTML = `
      <span class="hier-dot" style="background:${accentColor}"></span>
      <span class="hier-leaf-label">${child.label}</span>
      <span class="hier-leaf-arrow">→</span>
    `;

    leaf.addEventListener('click', () => this.selectLeaf(leaf, child, accentColor));
    leaf.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.selectLeaf(leaf, child, accentColor); }
    });

    return leaf;
  }

  selectLeaf(leafEl, child, accentColor) {
    
    const prev = this.container.querySelector('.hier-leaf.selected');
    if (prev) prev.classList.remove('selected');

    leafEl.classList.add('selected');
    this.selectedId = child.id;

    
    
    const organKey = child.id;
    let cameraHandled = false;

    if (window.bioFocus && window.ORGAN_FOCUS_DATA && window.ORGAN_FOCUS_DATA[organKey]) {
      
      window.bioFocus.selectOrgan(organKey);
      cameraHandled = true;
    } else if (window.bioCinematic) {
      
      const sys = window.CINEMATIC_DATA?.systems[this.currentSystem];
      const cinematicOrgan = sys?.organs?.find(o => o.key === organKey || o.meshId === child.meshId);
      if (cinematicOrgan) {
        window.bioCinematic.navigateToOrgan(cinematicOrgan.key, this.currentSystem);
        cameraHandled = true;
      }
    }

    if (!cameraHandled && window.bioExplorer && child.meshId) {
      
      const mesh = window.bioExplorer.meshRegistry[child.meshId];
      if (mesh) window.bioExplorer.selectMesh(mesh);
    }

    
    if (!cameraHandled && window.bioExplorer && child.meshId) {
      const mesh = window.bioExplorer.meshRegistry[child.meshId];
      if (mesh) window.bioExplorer.selectMesh(mesh);
    }

    
    const nameEl = document.getElementById('selected-organ-name');
    const sysEl = document.getElementById('selected-organ-system');
    const descEl = document.getElementById('selected-organ-desc');
    const metaEl = document.getElementById('selected-info-meta');
    const typeEl = document.getElementById('meta-type');
    const locEl = document.getElementById('meta-location');
    const funcEl = document.getElementById('meta-function');

    if (nameEl) nameEl.textContent = child.label;
    const sysData = BioAnatomyData.systems[this.currentSystem];
    if (sysEl) {
      sysEl.textContent = sysData?.name || '';
      sysEl.style.background = (accentColor || '#00d4ff') + '22';
      sysEl.style.color = accentColor || '#00d4ff';
    }

    
    const meta = BioAnatomyData.organs?.[child.id];
    if (descEl) descEl.textContent = meta ? meta.function + '.' : `${child.label} is a key structure of the ${sysData?.name || ''}.`;
    if (metaEl) metaEl.style.display = meta ? 'flex' : 'none';
    if (typeEl && meta) typeEl.textContent = meta.type;
    if (locEl && meta) locEl.textContent = meta.location;
    if (funcEl && meta) funcEl.textContent = meta.function;
  }

  selectByMeshId(meshId) {
    if (!this.container) return;
    const leaves = this.container.querySelectorAll('.hier-leaf');
    for (const leaf of leaves) {
      if (leaf.dataset.meshId === meshId) {
        leaf.classList.add('selected');
        
        leaf.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        leaf.classList.remove('selected');
      }
    }
  }

  bindEvents() {
    
    window.addEventListener('bioSystemChanged', (e) => {
      this.render(e.detail.system);
    });

    
    window.addEventListener('bioOrganSelected', (e) => {
      this.selectByMeshId(e.detail.meshId);
    });
  }
}

window.OrganHierarchy = OrganHierarchy;
