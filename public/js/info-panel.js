'use strict';

class InfoPanel {

  constructor() {
    this._panel       = null;
    this._accentBar   = null;
    this._emoji       = null;
    this._name        = null;
    this._badge       = null;
    this._tagline     = null;
    this._stats       = null;
    this._description = null;
    this._functions   = null;
    this._fact        = null;
    this._exploreBtn  = null;
    this._quizBtn     = null;
    this._closeBtn    = null;

    this._sidebarName   = null;
    this._sidebarSystem = null;
    this._sidebarDesc   = null;
    this._sidebarMeta   = null;
    this._metaType      = null;
    this._metaLocation  = null;
    this._metaFunction  = null;

    this._currentMetadata = null;
    this._visible         = false;
    this._listeners       = new Map();
    this.metadata         = null;
  }

  async initialize() {
    this._panel       = document.getElementById('organ-info-panel');
    this._accentBar   = this._panel?.querySelector('.oip-accent-bar');
    this._emoji       = document.getElementById('oip-emoji');
    this._name        = document.getElementById('oip-organ-name');
    this._badge       = document.getElementById('oip-system-badge');
    this._tagline     = document.getElementById('oip-tagline');
    this._stats       = document.getElementById('oip-stats');
    this._description = document.getElementById('oip-description');
    this._functions   = document.getElementById('oip-functions');
    this._fact        = document.getElementById('oip-fun-fact');

    this._quizBtn     = document.getElementById('oip-quiz-btn');
    this._closeBtn    = document.getElementById('oip-close-btn');

    this._sidebarName   = document.getElementById('selected-organ-name');
    this._sidebarSystem = document.getElementById('selected-organ-system');
    this._sidebarDesc   = document.getElementById('selected-organ-desc');
    this._sidebarMeta   = document.getElementById('selected-info-meta');
    this._metaType      = document.getElementById('meta-type');
    this._metaLocation  = document.getElementById('meta-location');
    this._metaFunction  = document.getElementById('meta-function');

    try {
      const res = await fetch('data/anatomy-metadata.json');
      this.metadata = await res.json();
    } catch (err) {
      console.error('[InfoPanel] Failed to load metadata from anatomy-metadata.json:', err);
    }

    if (this._closeBtn) {
      this._closeBtn.addEventListener('click', () => this.hide());
    }

    if (this._quizBtn) {
      this._quizBtn.addEventListener('click', () => {
        this._emit('quizRequested', { metadata: this._currentMetadata });
        window.dispatchEvent(new CustomEvent('bioInfoPanel:quizRequested', {
          detail: { metadata: this._currentMetadata },
        }));
      });
    }


    window.addEventListener('bioSelectionChanged', (e) => {
      const { selected } = e.detail;
      if (selected) {
        this.show(this._buildMetadata(selected));
      } else {
        this.hide();
      }
    });

    return this;
  }

  show(metadata) {
    if (!metadata) return this;
    this._currentMetadata = metadata;
    this._render(metadata);
    this._applyTheme(metadata);

    if (this._panel) {
      this._panel.classList.add('visible');
      this._panel.setAttribute('aria-hidden', 'false');
    }

    this._visible = true;
    this._emit('shown', { metadata });
    return this;
  }

  hide() {
    if (this._panel) {
      this._panel.classList.remove('visible');
      this._panel.setAttribute('aria-hidden', 'true');
    }
    this._visible = false;
    this._emit('hidden', {});
    return this;
  }

  update(metadata) {
    if (!metadata) return this;
    this._currentMetadata = metadata;
    this._render(metadata);
    this._applyTheme(metadata);
    return this;
  }

  clear() {
    this._currentMetadata = null;
    this._setText(this._name,        'Select a structure');
    this._setText(this._badge,       '');
    this._setText(this._tagline,     '');
    this._setText(this._description, '');
    this._setText(this._emoji,       '🔬');
    this._setText(this._fact,        '');
    if (this._stats)     this._stats.innerHTML     = '';
    if (this._functions) this._functions.innerHTML = '';
    this.hide();
    return this;
  }

  isVisible() {
    return this._visible;
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

  _render(meta) {
    const sysData  = this._getSystemData(meta.system);
    const sysName  = sysData?.name  || meta.system  || '';
    const sysColor = sysData?.color || meta.color    || '#00d4ff';
    const sysIcon  = sysData?.icon  || meta.icon     || '🔬';

    this._setText(this._emoji,       sysIcon);
    this._setText(this._name,        meta.name        || 'Unknown Structure');
    this._setText(this._badge,       sysName);
    this._setText(this._tagline,     meta.scientificName ? 'Scientific Name: ' + meta.scientificName : '');
    this._setText(this._description, meta.description || '');

    if (this._fact) {
      this._fact.innerHTML = Array.isArray(meta.interestingFacts)
        ? meta.interestingFacts.join('<br><br>')
        : (meta.interestingFacts || '');
    }

    if (this._stats) {
      this._stats.innerHTML = '';
      const statsArr = meta.stats || [];
      statsArr.forEach(s => {
        const el = document.createElement('div');
        el.className = 'oip-stat';
        el.innerHTML =
          `<span class="oip-stat-icon">${s.icon || ''}</span>` +
          `<span class="oip-stat-value">${s.value || ''}</span>` +
          `<span class="oip-stat-label">${s.label || ''}</span>`;
        this._stats.appendChild(el);
      });

      if (statsArr.length === 0 && sysData) {
        [sysData.stat1, sysData.stat2].filter(Boolean).forEach(s => {
          const el = document.createElement('div');
          el.className = 'oip-stat';
          el.innerHTML =
            `<span class="oip-stat-value">${s.value || ''}</span>` +
            `<span class="oip-stat-label">${s.label || ''}</span>`;
          this._stats.appendChild(el);
        });
      }
    }

    if (this._functions) {
      this._functions.innerHTML = '';
      
      if (meta.function) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Function:</strong> ${meta.function}`;
        this._functions.appendChild(li);
      }

      if (meta.location) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Location:</strong> ${meta.location}`;
        this._functions.appendChild(li);
      }

      if (meta.commonDiseases && meta.commonDiseases.length > 0) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Common Diseases:</strong> ${meta.commonDiseases.join(', ')}`;
        this._functions.appendChild(li);
      }

      if (meta.relatedOrgans && meta.relatedOrgans.length > 0) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Related Organs:</strong> ${meta.relatedOrgans.join(', ')}`;
        this._functions.appendChild(li);
      }
    }

    this._setText(this._sidebarName,   meta.name || '');
    if (this._sidebarSystem) {
      this._sidebarSystem.textContent       = sysName;
      this._sidebarSystem.style.background  = sysColor + '22';
      this._sidebarSystem.style.color       = sysColor;
    }
    this._setText(this._sidebarDesc, meta.description || '');

    const hasMeta = meta.type || meta.location || meta.function;
    if (this._sidebarMeta) {
      this._sidebarMeta.style.display = hasMeta ? 'flex' : 'none';
    }
    this._setText(this._metaType,     meta.type     || '—');
    this._setText(this._metaLocation, meta.location || '—');
    this._setText(this._metaFunction, meta.function || meta.description || '—');
  }

  _applyTheme(meta) {
    const sysData  = this._getSystemData(meta.system);
    const color    = sysData?.color || meta.color || '#00d4ff';
    const colorAlpha  = color + '26';
    const colorBorder = color + '40';

    if (this._panel) {
      this._panel.style.setProperty('--panel-color',        color);
      this._panel.style.setProperty('--panel-color-alpha',  colorAlpha);
      this._panel.style.setProperty('--panel-color-border', colorBorder);
      this._panel.style.setProperty('--panel-gradient',
        `linear-gradient(90deg, ${color}, #7b2fff)`);
    }
  }

  _findOrganMetadata(record) {
    if (!this.metadata || !this.metadata.organs) return null;
    const meshId = (record.id || record.object?.userData?.meshId || "").toLowerCase();
    const name = (record.name || record.object?.userData?.organName || "").toLowerCase();

    if (this.metadata.organs[meshId]) return this.metadata.organs[meshId];

    for (const [key, data] of Object.entries(this.metadata.organs)) {
      const cleanKey = key.toLowerCase();
      if (meshId === cleanKey) return data;
      if (meshId.endsWith('_' + cleanKey) || meshId.includes('_' + cleanKey)) return data;
      if (cleanKey === 'lungs' && (meshId.includes('lung') || name.includes('lung'))) return data;
      if (cleanKey === 'ribcage' && (meshId.includes('rib') || name.includes('rib'))) return data;
      if (name === cleanKey || name.includes(cleanKey) || cleanKey.includes(name)) return data;
    }

    return null;
  }

  _buildMetadata(record) {
    const organMeta = this._findOrganMetadata(record);
    if (!organMeta) {
      const ud = record.object?.userData || {};
      const sysKey = record.system || ud.systemKey || '';
      const sysData = this._getSystemData(sysKey);
      const name = record.name || ud.organName || 'Structure';
      return {
        name: name,
        scientificName: 'Organum',
        system: sysKey,
        description: `${name} is an important component of the ${sysData?.displayName || sysKey || 'human'} system.`,
        function: `Plays a role within the ${sysData?.displayName || sysKey || 'body'}.`,
        location: `Located in the ${sysKey} region.`,
        interestingFacts: ["No interesting facts available at this time."],
        commonDiseases: ["N/A"],
        relatedOrgans: [],
        icon: sysData?.icon || '🔬',
        color: sysData?.color || '#00d4ff',
        stats: []
      };
    }

    const sysKey = organMeta.system;
    const sysMeta = this.metadata?.systems?.[sysKey] || this._getSystemData(sysKey);
    return {
      name: organMeta.displayName,
      scientificName: organMeta.scientificName || 'Organum',
      system: sysKey,
      description: organMeta.description,
      function: organMeta.function,
      location: organMeta.location,
      interestingFacts: organMeta.interestingFacts || [],
      commonDiseases: organMeta.commonDiseases || [],
      relatedOrgans: organMeta.relatedOrgans || [],
      icon: sysMeta?.icon || '🔬',
      color: sysMeta?.color || '#00d4ff',
      stats: []
    };
  }

  _getSystemData(systemKey) {
    if (!systemKey) return null;
    const key = systemKey.toLowerCase();
    const src  = window.BioAnatomyData?.systems  || {};
    const src2 = window.BioSystemsData?.systems  || {};
    return src[key] || src2[key] || null;
  }

  _setText(el, text) {
    if (el) el.textContent = text ?? '';
  }

  _emit(event, data) {
    const fns = this._listeners.get(event);
    if (fns) for (const fn of fns) { try { fn(data); } catch (_) {} }
  }
}

window.InfoPanel = InfoPanel;
