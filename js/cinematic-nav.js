









'use strict';





const CINEMATIC_DATA = {

  bodyPreset: {
    pivotY: 0, rotY: 0, rotX: 0.05, zoom: 1.0, opacity: 20
  },

  systems: {

    skeletal: {
      name: 'Skeletal System',
      shortName: 'Skeletal',
      icon: '🦴',
      color: '#d4d4d8',
      tagline: '206 bones · structural framework',
      camera: { pivotY: -0.40, rotY: 0.08, rotX: 0.06, zoom: 1.28, opacity: 14 },
      organs: [
        { key: 'skull',    name: 'Skull',    emoji: '💀', meshId: 'bone_skull',    camera: { pivotY: -3.00, rotY: 0.00, rotX: -0.04, zoom: 3.8, opacity: 7 } },
        { key: 'spine',    name: 'Spine',    emoji: '🦴', meshId: 'bone_spine',    camera: { pivotY: -0.80, rotY: 0.55, rotX: 0.08,  zoom: 2.2, opacity: 7 } },
        { key: 'ribcage',  name: 'Ribcage',  emoji: '🫁', meshId: 'bone_ribs',     camera: { pivotY: -1.70, rotY: 0.10, rotX: 0.08,  zoom: 2.6, opacity: 7 } },
        { key: 'pelvis',   name: 'Pelvis',   emoji: '🦴', meshId: 'bone_pelvis',   camera: { pivotY: -0.10, rotY: 0.00, rotX: 0.10,  zoom: 2.8, opacity: 7 } },
        { key: 'femur',    name: 'Femur',    emoji: '🦴', meshId: 'bone_l_thigh',  camera: { pivotY:  0.90, rotY: 0.10, rotX: 0.08,  zoom: 2.2, opacity: 7 } },
      ]
    },

    muscular: {
      name: 'Muscular System',
      shortName: 'Muscular',
      icon: '💪',
      color: '#f43f5e',
      tagline: '640 muscles · movement & heat',
      camera: { pivotY: -0.30, rotY: 0.10, rotX: 0.08, zoom: 1.28, opacity: 12 },
      organs: [
        { key: 'pectorals', name: 'Pectorals', emoji: '💪', meshId: 'mus_pec_l',      camera: { pivotY: -1.80, rotY: -0.10, rotX: 0.10, zoom: 3.0, opacity: 6 } },
        { key: 'abs',       name: 'Abs',       emoji: '💪', meshId: 'mus_abs_0',      camera: { pivotY: -0.80, rotY:  0.00, rotX: 0.10, zoom: 3.0, opacity: 6 } },
        { key: 'deltoids',  name: 'Deltoids',  emoji: '💪', meshId: 'mus_deltoid_l',  camera: { pivotY: -1.80, rotY:  0.30, rotX: 0.10, zoom: 3.2, opacity: 6 } },
        { key: 'quads',     name: 'Quads',     emoji: '💪', meshId: 'mus_quad_l',     camera: { pivotY:  0.80, rotY:  0.00, rotX: 0.08, zoom: 2.5, opacity: 6 } },
        { key: 'glutes',    name: 'Glutes',    emoji: '💪', meshId: 'mus_glute_l',    camera: { pivotY:  0.20, rotY:  2.00, rotX: 0.10, zoom: 2.5, opacity: 6 } },
      ]
    },

    nervous: {
      name: 'Nervous System',
      shortName: 'Nervous',
      icon: '🧠',
      color: '#a855f7',
      tagline: '86 billion neurons · command network',
      camera: { pivotY: -1.00, rotY: 0.00, rotX: 0.02, zoom: 1.35, opacity: 10 },
      organs: [
        { key: 'brain',      name: 'Brain',        emoji: '🧠', meshId: 'nerve_cerebrum',  isFeatured: true, camera: { pivotY: -3.00, rotY: 0.05, rotX: -0.05, zoom: 3.8, opacity: 5 } },
        { key: 'cerebellum', name: 'Cerebellum',   emoji: '🧠', meshId: 'nerve_cerebellum',               camera: { pivotY: -3.00, rotY: 0.30, rotX:  0.05, zoom: 4.0, opacity: 5 } },
        { key: 'spinal',     name: 'Spinal Cord',  emoji: '⚡', meshId: 'nerve_spinal',                    camera: { pivotY: -0.50, rotY: 0.50, rotX:  0.08, zoom: 2.0, opacity: 6 } },
        { key: 'sciatic',    name: 'Sciatic Nerve',emoji: '⚡', meshId: 'nerve_sciatic_l',                 camera: { pivotY:  0.80, rotY: 0.20, rotX:  0.08, zoom: 2.0, opacity: 6 } },
      ]
    },

    circulatory: {
      name: 'Circulatory System',
      shortName: 'Circulatory',
      icon: '❤️',
      color: '#ef4444',
      tagline: '96,000 km vessels · 100K beats/day',
      camera: { pivotY: -0.80, rotY: -0.10, rotX: 0.10, zoom: 1.40, opacity: 10 },
      organs: [
        { key: 'heart',   name: 'Heart',    emoji: '❤️', meshId: 'circ_heart',         isFeatured: true, camera: { pivotY: -1.38, rotY: -0.20, rotX: 0.18, zoom: 3.2, opacity: 5 } },
        { key: 'aorta',   name: 'Aorta',    emoji: '🩸', meshId: 'circ_aorta',                           camera: { pivotY: -1.00, rotY: -0.10, rotX: 0.10, zoom: 2.5, opacity: 6 } },
        { key: 'carotid', name: 'Carotids', emoji: '🩸', meshId: 'circ_carotid',                         camera: { pivotY: -2.50, rotY:  0.20, rotX: 0.05, zoom: 2.8, opacity: 6 } },
        { key: 'femoral', name: 'Femoral',  emoji: '🩸', meshId: 'circ_femoral_art_l',                   camera: { pivotY:  0.80, rotY:  0.10, rotX: 0.08, zoom: 2.2, opacity: 6 } },
      ]
    },

    digestive: {
      name: 'Digestive System',
      shortName: 'Digestive',
      icon: '🫀',
      color: '#f59e0b',
      tagline: '9 m GI tract · 40 trillion gut bacteria',
      camera: { pivotY: -0.20, rotY: 0.10, rotX: 0.12, zoom: 1.40, opacity: 10 },
      organs: [
        { key: 'liver',     name: 'Liver',     emoji: '🫀', meshId: 'dig_liver',       isFeatured: true, camera: { pivotY: -0.70, rotY:  0.30, rotX: 0.18, zoom: 3.0, opacity: 5 } },
        { key: 'stomach',   name: 'Stomach',   emoji: '🫃', meshId: 'dig_stomach',     isFeatured: true, camera: { pivotY: -0.62, rotY: -0.20, rotX: 0.22, zoom: 3.2, opacity: 5 } },
        { key: 'kidneys',   name: 'Kidneys',   emoji: '🫘', meshId: 'organ_kidney_l',  isFeatured: true, camera: { pivotY: -0.12, rotY:  0.20, rotX: 0.28, zoom: 3.2, opacity: 5 } },
        { key: 'pancreas',  name: 'Pancreas',  emoji: '🟡', meshId: 'dig_pancreas',                      camera: { pivotY: -0.18, rotY:  0.10, rotX: 0.20, zoom: 3.5, opacity: 5 } },
        { key: 'intestine', name: 'Intestines',emoji: '🌀', meshId: 'dig_small_int',                     camera: { pivotY:  0.00, rotY:  0.10, rotX: 0.15, zoom: 2.5, opacity: 5 } },
      ]
    },

    respiratory: {
      name: 'Respiratory System',
      shortName: 'Respiratory',
      icon: '🫁',
      color: '#22d3ee',
      tagline: '23,000 breaths/day · 70 m² exchange area',
      camera: { pivotY: -0.80, rotY: -0.10, rotX: 0.10, zoom: 1.35, opacity: 10 },
      organs: [
        { key: 'lungs',     name: 'Lungs',     emoji: '🫁', meshId: 'resp_l_lung',    isFeatured: true, camera: { pivotY: -1.60, rotY: -0.25, rotX: 0.12, zoom: 2.6, opacity: 5 } },
        { key: 'trachea',   name: 'Trachea',   emoji: '💨', meshId: 'resp_trachea',                     camera: { pivotY: -2.20, rotY:  0.00, rotX: 0.05, zoom: 2.8, opacity: 5 } },
        { key: 'diaphragm', name: 'Diaphragm', emoji: '🔵', meshId: 'resp_diaphragm',                   camera: { pivotY: -0.95, rotY:  0.00, rotX: 0.15, zoom: 3.2, opacity: 5 } },
        { key: 'bronchi',   name: 'Bronchi',   emoji: '🌿', meshId: 'resp_bronchi_l',                   camera: { pivotY: -1.50, rotY: -0.20, rotX: 0.12, zoom: 3.0, opacity: 5 } },
      ]
    },
  }
};





class CinematicNav {
  constructor() {
    this.level        = 0;       
    this.activeSystem = null;    
    this.activeOrgan  = null;    
    this.isTransitioning = false;

    
    this.microNames = {
      heart: { tissue: 'Myocardial Fibers', cell: 'Cardiomyocyte', dna: 'Cardiac DNA Helix' },
      brain: { tissue: 'Neuronal Synaptic Net', cell: 'Pyramidal Neuron', dna: 'Neural DNA Helix' },
      lungs: { tissue: 'Alveoli Capillary Mesh', cell: 'Squamous Pneumocyte', dna: 'Pulmonary DNA Helix' },
      liver: { tissue: 'Hepatic Lobule Grid', cell: 'Hepatocyte Cell', dna: 'Hepatic DNA Helix' },
      kidneys: { tissue: 'Nephron Tubules', cell: 'Podocyte Cell', dna: 'Renal DNA Helix' },
      stomach: { tissue: 'Gastric Mucosa Glands', cell: 'Parietal Cell', dna: 'Gastric DNA Helix' }
    };

    
    this.breadcrumbEl     = document.getElementById('cin-breadcrumb');
    this.navBarEl         = document.getElementById('cin-nav-bar');
    this.flashEl          = document.getElementById('cin-flash');
    this.levelDotsEl      = document.getElementById('cin-level-dots');

    
    this._hlMesh = null;
    this._hlOrigEmissive = 0x000000;

    
    this._updateBreadcrumb();
    this._renderNavBar();
    this._updateLevelDots();
  }

  


  navigateToSystem(systemKey) {
    if (this.isTransitioning) return;
    const sys = CINEMATIC_DATA.systems[systemKey];
    if (!sys) return;

    
    if (window.bioFocus?.active) window.bioFocus.clearFocus();
    this._clearHighlight();

    this.level        = 1;
    this.activeSystem = systemKey;
    this.activeOrgan  = null;

    this._cinTransition(() => {
      if (window.bioExplorer) {
        window.bioExplorer.switchSystem(systemKey);
        window.bioExplorer.changeScale('organ'); 
      }
      if (window.bioHierarchy) window.bioHierarchy.render(systemKey);
      if (window.bioNav) window.bioNav.updateSidebarSelection?.(systemKey);

      this._flyTo(sys.camera);
      this._updateBreadcrumb();
      this._renderNavBar();
      this._updateLevelDots();
      this._updateHUDSystem(sys.name);
    });
  }

  


  navigateToOrgan(organKey, systemKey) {
    if (this.isTransitioning) return;
    const sysKey = systemKey || this.activeSystem;
    const sys    = CINEMATIC_DATA.systems[sysKey];
    if (!sys) return;
    const organ = sys.organs.find(o => o.key === organKey);
    if (!organ) return;

    this._clearHighlight();

    this.level        = 2;
    this.activeSystem = sysKey;
    this.activeOrgan  = organKey;

    this._cinTransition(() => {
      if (window.bioExplorer) {
        window.bioExplorer.changeScale('organ');
      }
      this._flyTo(organ.camera);

      if (organ.isFeatured && window.bioFocus) {
        window.bioFocus.selectOrgan(organKey);
      } else {
        this._highlightMesh(organ.meshId, sys.color);
      }

      this._updateBreadcrumb();
      this._renderNavBar();
      this._updateLevelDots();
      this._updateHUDSystem(`${sys.icon} ${organ.name}`);
    });
  }

  


  navigateToMicroScale(scale) {
    if (this.isTransitioning) return;
    if (window.bioExplorer) {
      window.bioExplorer.changeScale(scale);
    }
  }

  


  zoomTransition(nextLevel) {
    this.level = nextLevel;
    const sys = CINEMATIC_DATA.systems[this.activeSystem];
    const organ = sys?.organs.find(o => o.key === this.activeOrgan);
    const micro = this.microNames[this.activeOrgan] || { tissue: 'Tissue', cell: 'Cell', dna: 'DNA' };
    
    let hudName = 'Micro Anatomy';
    if (nextLevel === 3) {
      hudName = `🔬 ${micro.tissue}`;
      if (window.bioFocus) window.bioFocus._hidePanel();
    } else if (nextLevel === 4) {
      hudName = `🧬 ${micro.cell}`;
      if (window.bioFocus) window.bioFocus._hidePanel();
    } else if (nextLevel === 5) {
      hudName = `🧬 ${micro.dna}`;
      if (window.bioFocus) window.bioFocus._hidePanel();
    } else if (nextLevel === 2) {
      hudName = `${organ ? organ.emoji + ' ' + organ.name : 'Organ'}`;
      
      if (window.bioFocus && window.bioFocus.active) {
        window.bioFocus._showPanel(window.bioFocus.active);
      }
    }

    this._updateBreadcrumb();
    this._renderNavBar();
    this._updateLevelDots();
    this._updateHUDSystem(hudName);
  }

  


  goBack() {
    if (this.isTransitioning) return;
    if (this.level >= 3) {
      const scales = ['body', 'system', 'organ', 'tissue', 'cell', 'dna'];
      const prevScale = scales[this.level - 1];
      if (prevScale === 'organ') {
        this.navigateToOrgan(this.activeOrgan, this.activeSystem);
      } else {
        this.navigateToMicroScale(prevScale);
      }
    } else if (this.level === 2) {
      if (window.bioFocus?.active) window.bioFocus.clearFocus();
      this._clearHighlight();
      this.level       = 1;
      this.activeOrgan = null;
      const sys = CINEMATIC_DATA.systems[this.activeSystem];
      this._cinTransition(() => {
        this._flyTo(sys.camera);
        this._updateBreadcrumb();
        this._renderNavBar();
        this._updateLevelDots();
        this._updateHUDSystem(sys.name);
      });
    } else if (this.level === 1) {
      this.returnToBody();
    }
  }

  


  returnToBody() {
    if (this.isTransitioning) return;
    if (window.bioFocus?.active) window.bioFocus.clearFocus();
    this._clearHighlight();

    this.level        = 0;
    this.activeSystem = null;
    this.activeOrgan  = null;

    this._cinTransition(() => {
      if (window.bioExplorer) {
        window.bioExplorer.changeScale('organ');
      }
      this._flyTo(CINEMATIC_DATA.bodyPreset);
      this._updateBreadcrumb();
      this._renderNavBar();
      this._updateLevelDots();
      this._updateHUDSystem('Human Body');
    });
  }

  


  _flyTo(preset) {
    if (!window.bioExplorer) return;
    window.bioExplorer.targetRotY          = preset.rotY   ?? 0;
    window.bioExplorer.targetRotX          = preset.rotX   ?? 0.05;
    window.bioExplorer.targetZoom          = preset.zoom   ?? 1.0;
    window.bioExplorer.targetPivotOffsetY  = preset.pivotY ?? 0;
    window.bioExplorer.isFlying            = true;

    
    if (window.bioExplorer) window.bioExplorer.setOpacity(100);

    
    const zsl = document.getElementById('zoom-slider');
    const zdv = document.getElementById('zoom-display');
    if (zsl) zsl.value = Math.round((preset.zoom ?? 1.0) * 100);
    if (zdv) zdv.textContent = `${(preset.zoom ?? 1.0).toFixed(1)}×`;
  }

  


  _updateBreadcrumb() {
    if (!this.breadcrumbEl) return;
    this.breadcrumbEl.innerHTML = '';

    
    const b0 = this._makeCrumb('🌐 Human Body', this.level === 0, () => this.returnToBody());
    this.breadcrumbEl.appendChild(b0);

    if (this.level >= 1 && this.activeSystem) {
      const sys = CINEMATIC_DATA.systems[this.activeSystem];
      this.breadcrumbEl.appendChild(this._makeSep());
      const b1 = this._makeCrumb(`${sys.icon} ${sys.shortName}`, this.level === 1, () => this.navigateToSystem(this.activeSystem));
      b1.style.setProperty('--crumb-color', sys.color);
      this.breadcrumbEl.appendChild(b1);
    }

    if (this.level >= 2 && this.activeOrgan) {
      const sys   = CINEMATIC_DATA.systems[this.activeSystem];
      const organ = sys?.organs.find(o => o.key === this.activeOrgan);
      if (organ) {
        this.breadcrumbEl.appendChild(this._makeSep());
        const b2 = this._makeCrumb(`${organ.emoji} ${organ.name}`, this.level === 2, () => this.navigateToOrgan(this.activeOrgan, this.activeSystem));
        b2.style.setProperty('--crumb-color', sys.color);
        this.breadcrumbEl.appendChild(b2);

        const micro = this.microNames[this.activeOrgan] || { tissue: 'Tissue', cell: 'Cell', dna: 'DNA' };

        
        if (this.level >= 3) {
          this.breadcrumbEl.appendChild(this._makeSep());
          const b3 = this._makeCrumb(`🔬 ${micro.tissue}`, this.level === 3, () => this.navigateToMicroScale('tissue'));
          b3.style.setProperty('--crumb-color', sys.color);
          this.breadcrumbEl.appendChild(b3);
        }

        
        if (this.level >= 4) {
          this.breadcrumbEl.appendChild(this._makeSep());
          const b4 = this._makeCrumb(`🧬 ${micro.cell}`, this.level === 4, () => this.navigateToMicroScale('cell'));
          b4.style.setProperty('--crumb-color', sys.color);
          this.breadcrumbEl.appendChild(b4);
        }

        
        if (this.level >= 5) {
          this.breadcrumbEl.appendChild(this._makeSep());
          const b5 = this._makeCrumb(`🧬 ${micro.dna}`, true, null);
          b5.style.setProperty('--crumb-color', sys.color);
          this.breadcrumbEl.appendChild(b5);
        }
      }
    }
  }

  _makeCrumb(text, isActive, onClick) {
    const el = document.createElement(onClick ? 'button' : 'span');
    el.className = 'cin-crumb' + (isActive ? ' cin-crumb--active' : ' cin-crumb--link');
    el.innerHTML = text;
    if (onClick) el.addEventListener('click', onClick);
    return el;
  }

  _makeSep() {
    const s = document.createElement('span');
    s.className = 'cin-crumb-sep';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>`;
    return s;
  }

  


  _renderNavBar() {
    if (!this.navBarEl) return;
    
    this.navBarEl.style.opacity = '0';
    this.navBarEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
      this.navBarEl.innerHTML = '';
      this.navBarEl.className = `cin-nav-bar cin-nav-bar--level${this.level}`;

      if (this.level === 0) {
        this._buildSystemCards();
      } else if (this.level === 1) {
        this._buildOrganChips();
      }
      

      this.navBarEl.style.opacity = '1';
      this.navBarEl.style.transform = 'translateY(0)';
    }, 160);
  }

  
  _buildSystemCards() {
    const hint = document.createElement('p');
    hint.className = 'cin-nav-hint';
    hint.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> Select a system to explore`;
    this.navBarEl.appendChild(hint);

    const grid = document.createElement('div');
    grid.className = 'cin-system-grid';
    grid.setAttribute('role', 'list');

    for (const [key, sys] of Object.entries(CINEMATIC_DATA.systems)) {
      const card = document.createElement('button');
      card.className = 'cin-system-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', `Explore the ${sys.name}`);
      card.setAttribute('data-system', key);
      card.style.setProperty('--sys-color', sys.color);
      card.innerHTML = `
        <span class="cin-sc-glow" aria-hidden="true"></span>
        <span class="cin-sc-emoji">${sys.icon}</span>
        <span class="cin-sc-name">${sys.shortName}</span>
      `;
      card.addEventListener('click', () => this.navigateToSystem(key));
      grid.appendChild(card);
    }

    this.navBarEl.appendChild(grid);
  }

  
  _buildOrganChips() {
    const sys = CINEMATIC_DATA.systems[this.activeSystem];
    if (!sys) return;

    
    const back = document.createElement('button');
    back.className = 'cin-back-btn';
    back.setAttribute('aria-label', 'Back to system selection');
    back.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>`;
    back.addEventListener('click', () => this.goBack());
    this.navBarEl.appendChild(back);

    
    const label = document.createElement('span');
    label.className = 'cin-chip-sys-label';
    label.innerHTML = `<span style="color:${sys.color}">${sys.icon}</span> ${sys.name}`;
    this.navBarEl.appendChild(label);

    
    const row = document.createElement('div');
    row.className = 'cin-chips-row';
    sys.organs.forEach(organ => {
      const chip = document.createElement('button');
      chip.className = 'cin-organ-chip' +
        (organ.isFeatured ? ' cin-organ-chip--featured' : '') +
        (this.activeOrgan === organ.key ? ' cin-organ-chip--active' : '');
      chip.style.setProperty('--sys-color', sys.color);
      chip.setAttribute('aria-label', `Focus on ${organ.name}`);
      chip.innerHTML = `<span class="cin-chip-emoji">${organ.emoji}</span><span class="cin-chip-name">${organ.name}</span>`;
      chip.addEventListener('click', () => this.navigateToOrgan(organ.key, this.activeSystem));
      row.appendChild(chip);
    });
    this.navBarEl.appendChild(row);
  }

  


  _highlightMesh(meshId, hexColor) {
    if (!window.bioExplorer || typeof THREE === 'undefined') return;
    const mesh = window.bioExplorer.meshRegistry[meshId];
    if (!mesh) return;
    this._hlMesh = mesh;
    this._hlOrigEmissive = mesh.material.emissive.getHex();
    mesh.material.emissive.set(new THREE.Color(hexColor));
    mesh.scale.multiplyScalar(1.08);
  }

  _clearHighlight() {
    if (this._hlMesh) {
      try {
        this._hlMesh.material.emissive.setHex(this._hlOrigEmissive);
        this._hlMesh.scale.divideScalar(1.08);
      } catch (e) {}
      this._hlMesh = null;
    }
  }

  



  _cinTransition(callback) {
    this.isTransitioning = true;
    const flash = this.flashEl;
    if (flash) {
      flash.classList.add('cin-flash--active');
    }
    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        if (flash) flash.classList.remove('cin-flash--active');
        this.isTransitioning = false;
      }, 180);
    }, 140);
  }

  


  _updateLevelDots() {
    if (!this.levelDotsEl) return;
    const dots = this.levelDotsEl.querySelectorAll('.cin-dot');
    dots.forEach((d, i) => d.classList.toggle('cin-dot--active', i === this.level));
  }

  


  _updateHUDSystem(text) {
    const hudSys = document.getElementById('hud-system');
    if (hudSys) hudSys.textContent = text;
    const navLabel = document.getElementById('active-system-label');
    if (navLabel) navLabel.textContent = text;
  }
}

window.CinematicNav   = CinematicNav;
window.CINEMATIC_DATA = CINEMATIC_DATA;
