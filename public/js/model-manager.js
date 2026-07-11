'use strict';
















class SystemModelManager {

  

  static get FILE_MAP() {
    return {
      fullBody      : 'models/regionsofhumanbody.glb',
      skeletal      : 'models/skeleton.glb',
      muscular      : 'models/muscular.glb',
      nervous       : 'models/nervous.glb',
      cardiovascular: 'models/cardiovascular.glb',
      circulatory   : 'models/cardiovascular.glb',
      lymphoid      : 'models/lymphoid.glb',
      immune        : 'models/lymphoid.glb',
      lymphatic     : 'models/lymphoid.glb',
      visceral      : 'models/visceral.glb',
      digestive     : 'models/visceral.glb',
      respiratory   : 'models/visceral.glb',
      joints        : 'models/joints.glb',
      regions       : 'models/regionsofhumanbody.glb',
    };
  }

  static get TARGET_HEIGHT() { return 6.0; }

  

  constructor(explorer) {
    this._ex     = explorer;
    this._loader = null;

    this._cache = new Map();

    this._activeScene    = null;
    this._activeSystem   = null;
    this._loadInProgress = false;

    this._manifestData = null;
    this._manifestPromise = fetch('/data/model-manifest.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        this._manifestData = data;
        console.log('[SystemModelManager] Model manifest loaded.');
      })
      .catch(err => {
        console.warn('[SystemModelManager] Manifest failed to load, falling back to local files.', err);
      });

    this._ensureLoader();
    console.log('[SystemModelManager] Initialised.');
  }

  

  



  async loadForSystem(systemKey) {
    const url = SystemModelManager.FILE_MAP[systemKey];
    if (!url) {
      console.warn(`[SystemModelManager] No file mapped for system: "${systemKey}"`);
      return;
    }

    if (this._loadInProgress) {
      console.warn('[SystemModelManager] Load already in progress — ignoring.');
      return;
    }

    this._loadInProgress = true;
    const t0 = performance.now();

    this._showOverlay(systemKey);

    try {
      
      this._disposeActiveInstance();

      
      const scene = await this._getScene(url);

      
      this._activeScene  = scene;
      this._activeSystem = systemKey;

      
      if (!this._ex.skeletonViewer) {
        this._ex.skeletonViewer = new BioSkeletonViewer(this._ex);
      }
      this._ex.skeletonViewer.processScene(scene, systemKey);

      
      const worldBox = new THREE.Box3().setFromObject(this._ex.anatomyContainer);
      const elapsed = (performance.now() - t0).toFixed(0);
      this._printReport(systemKey, url, worldBox, elapsed);

    } catch (err) {
      console.error(`[SystemModelManager] Failed to load "${url}":`, err);
      this._showErrorOverlay(url, err);
    } finally {
      this._loadInProgress = false;
      this._hideOverlay();
    }
  }

  
  get activeSystem() { return this._activeSystem; }

  

  




  async _getScene(url) {
    if (!this._cache.has(url)) {
      const gltf = await this._fetchGLTF(url);
      this._cache.set(url, gltf);
    }
    const gltf  = this._cache.get(url);
    const clone = gltf.scene.clone(true);
    clone.updateMatrixWorld(true);
    return clone;
  }

  

  async _fetchGLTF(url) {
    if (this._manifestPromise) {
      try {
        await this._manifestPromise;
      } catch (e) {}
    }

    let targetURL = url;
    if (this._manifestData && this._manifestData[url]) {
      targetURL = this._manifestData[url];
      console.log(`[SystemModelManager] Resolving ${url} via manifest to ${targetURL}`);
    }

    const resolvedURL = new URL(targetURL, location.href).href;
    console.log(`[SystemModelManager] Fetching: ${resolvedURL}`);

    let fakeTimer = null;
    let fakePct   = 0;

    const setProgress = (pct) => {
      const ovPct  = document.getElementById('bsv-pct');
      const ovFill = document.getElementById('bsv-progress-fill');
      if (ovPct)  ovPct.textContent  = `${Math.round(pct)}%`;
      if (ovFill) ovFill.style.width = `${pct}%`;
    };

    fakeTimer = setInterval(() => {
      fakePct += (90 - fakePct) * 0.05;
      setProgress(fakePct);
    }, 150);

    return new Promise((resolve, reject) => {
      this._loader.load(
        targetURL,
        (gltf) => {
          clearInterval(fakeTimer);
          setProgress(100);
          console.log(`[SystemModelManager] Loaded: ${url}`);
          resolve(gltf);
        },
        (xhr) => {
          if (xhr.total > 0) {
            clearInterval(fakeTimer);
            fakeTimer = null;
            setProgress((xhr.loaded / xhr.total) * 100);
          }
        },
        (err) => {
          clearInterval(fakeTimer);
          console.error(`[SystemModelManager] Fetch error: ${url}`, err);
          reject(err);
        }
      );
    });
  }

  

  _disposeActiveInstance() {
    const ex = this._ex;

    if (this._activeScene && ex.anatomyContainer) {
      ex.anatomyContainer.remove(this._activeScene);
      this._disposeObject(this._activeScene);
      this._activeScene = null;
    }

    
    ex.clickableMeshes = [];
    ex.meshRegistry    = {};
    ex.heartMesh  = null;
    ex.lLung      = null;
    ex.rLung      = null;
    ex.diaphragm  = null;

    if (ex.organRegistry) ex.organRegistry.clear();

    
    
    
    if (ex.selectionManager) ex.selectionManager.clear();

    if (ex.selectMesh) ex.selectMesh(null);
  }

  _disposeObject(root) {
    if (!root) return;
    root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
          for (const key of ['map','normalMap','roughnessMap','metalnessMap',
                             'emissiveMap','aoMap','envMap']) {
            if (m[key]) m[key].dispose();
          }
          m.dispose();
        });
      }
    });
  }

  

  _printReport(systemKey, url, worldBox, elapsedMs) {
    const ex       = this._ex;
    const size     = worldBox.getSize(new THREE.Vector3());
    const camState = ex.cameraManager?.defaultState;
    const dist     = camState
      ? camState.distance
      : (ex.camera && ex.controls
          ? ex.camera.position.distanceTo(ex.controls.target)
          : 0);

    const filename = url.split('/').pop();
    const pad = (s, n) => String(s).padEnd(n);

    console.log([
      '',
      '╔══════════════════════════════════════════════╗',
      '║  SystemModelManager — Load Report            ║',
      '╠══════════════════════════════════════════════╣',
      `║  Loaded model   : ${pad(filename, 26)}║`,
      `║  System         : ${pad(systemKey, 26)}║`,
      `║  Mesh count     : ${pad(ex.clickableMeshes.length, 26)}║`,
      `║  Bounding box   : W=${size.x.toFixed(2)} H=${size.y.toFixed(2)} D=${size.z.toFixed(2)}        ║`,
      `║  Camera distance: ${pad(dist.toFixed(3), 26)}║`,
      `║  Load time      : ${pad(elapsedMs + 'ms', 26)}║`,
      '╚══════════════════════════════════════════════╝',
    ].join('\n'));
  }

  

  _showOverlay(systemKey) {
    const canvas = this._ex.canvas;
    if (!canvas?.parentElement) return;
    const wrap = canvas.parentElement;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    this._removeOverlay();
    this._injectOverlayStyles();

    const label = this._labelFor(systemKey);
    const div   = document.createElement('div');
    div.id = 'bsv-loading-overlay';
    div.innerHTML = `
      <div class="bsv-loader-inner">
        <div class="bsv-spinner"></div>
        <div class="bsv-loader-text">
          <span class="bsv-label">Loading ${label}</span>
          <span class="bsv-pct" id="bsv-pct">0%</span>
        </div>
        <div class="bsv-progress-track">
          <div class="bsv-progress-fill" id="bsv-progress-fill"></div>
        </div>
      </div>`;
    wrap.appendChild(div);
  }

  _hideOverlay() {
    const el = document.getElementById('bsv-loading-overlay');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 600);
  }

  _removeOverlay() {
    document.getElementById('bsv-loading-overlay')?.remove();
  }

  _showErrorOverlay(url, err) {
    this._removeOverlay();
    const canvas = this._ex.canvas;
    if (!canvas?.parentElement) return;
    const wrap = canvas.parentElement;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    const div = document.createElement('div');
    div.id = 'bsv-error-overlay';
    div.innerHTML = `
      <div class="bsv-error-inner">
        <div class="bsv-error-icon">💀</div>
        <div class="bsv-error-title">Model Load Error</div>
        <div class="bsv-error-msg">Could not load <code>${url}</code><br>${err?.message || err}</div>
        <button class="bsv-error-btn"
          onclick="document.getElementById('bsv-error-overlay').remove()">Dismiss</button>
      </div>`;
    wrap.appendChild(div);
  }

  _labelFor(systemKey) {
    const L = {
      fullBody: 'Full Body', skeletal: 'Skeleton', muscular: 'Muscular System',
      nervous: 'Nervous System', cardiovascular: 'Cardiovascular System',
      circulatory: 'Cardiovascular System', lymphoid: 'Lymphoid System',
      immune: 'Lymphoid System', lymphatic: 'Lymphoid System',
      visceral: 'Visceral Systems', digestive: 'Visceral Systems',
      respiratory: 'Visceral Systems',
      joints: 'Joints', regions: 'Body Regions',
    };
    return L[systemKey] || systemKey;
  }

  _injectOverlayStyles() {
    if (document.getElementById('bsv-style')) return;
    const st = document.createElement('style');
    st.id = 'bsv-style';
    st.textContent = `
      #bsv-loading-overlay {
        position:absolute; inset:0;
        display:flex; align-items:center; justify-content:center;
        background:rgba(2,4,8,0.82);
        backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
        z-index:999; border-radius:inherit; pointer-events:none;
        font-family:'Inter',system-ui,sans-serif;
        transition:opacity 0.5s ease;
      }
      .bsv-loader-inner { display:flex; flex-direction:column; align-items:center; gap:18px; }
      .bsv-spinner {
        width:52px; height:52px;
        border:3px solid rgba(0,212,255,0.15);
        border-top-color:#00d4ff; border-radius:50%;
        animation:bsv-spin 0.85s linear infinite;
      }
      @keyframes bsv-spin { to { transform:rotate(360deg); } }
      .bsv-loader-text { display:flex; gap:8px; font-size:14px; font-weight:600; letter-spacing:0.06em; }
      .bsv-label { color:#e2e8f0; }
      .bsv-pct   { color:#00d4ff; min-width:38px; }
      .bsv-progress-track { width:220px; height:3px; background:rgba(0,212,255,0.12); border-radius:4px; overflow:hidden; }
      .bsv-progress-fill  { height:100%; width:0%; background:linear-gradient(90deg,#00d4ff,#7b2fff); border-radius:4px; transition:width 0.25s ease; }
      #bsv-error-overlay {
        position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
        background:rgba(10,2,2,0.88); backdrop-filter:blur(8px); z-index:999;
        font-family:'Inter',system-ui,sans-serif; padding:24px; border-radius:inherit;
      }
      .bsv-error-inner { text-align:center; max-width:380px; display:flex; flex-direction:column; gap:12px; align-items:center; }
      .bsv-error-icon  { font-size:40px; }
      .bsv-error-title { color:#ff6b6b; font-size:17px; font-weight:700; }
      .bsv-error-msg   { color:#e2e8f0; font-size:13px; line-height:1.7; }
      .bsv-error-btn {
        margin-top:8px; padding:9px 22px;
        background:linear-gradient(135deg,#00d4ff,#7b2fff);
        color:#fff; border:none; border-radius:8px;
        cursor:pointer; font-size:13px; font-weight:600;
        letter-spacing:0.04em; transition:opacity 0.2s;
      }
      .bsv-error-btn:hover { opacity:0.85; }
    `;
    document.head.appendChild(st);
  }

  

  _ensureLoader() {
    if (typeof THREE === 'undefined')
      throw new Error('[SystemModelManager] THREE.js not loaded.');
    if (typeof THREE.GLTFLoader === 'undefined')
      throw new Error('[SystemModelManager] THREE.GLTFLoader not available.');
    this._loader = new THREE.GLTFLoader();
  }

}

window.SystemModelManager = SystemModelManager;


window.ModelManager = SystemModelManager;
