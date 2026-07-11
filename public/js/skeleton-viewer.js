













'use strict';

class BioSkeletonViewer {

  constructor(explorer) {
    this.explorer       = explorer;
    this._overlay       = null;
    this._loader        = null;
    this._underLight    = null;
  }

  

  async load() {
    console.warn('[SkeletonViewer] load() is deprecated. Models should be loaded via SystemModelManager.');
    if (this.explorer.systemModelManager) {
      await this.explorer.systemModelManager.loadForSystem('fullBody');
    }
  }

  



  processScene(scene, systemKey = 'fullBody') {
    if (!scene) return;

    
    if (!this.explorer.anatomyContainer) {
      this.explorer.anatomyContainer = new THREE.Group();
      this.explorer.anatomyContainer.name = 'anatomyContainer';
      this.explorer.pivot.add(this.explorer.anatomyContainer);
    }

    
    while (this.explorer.anatomyContainer.children.length > 0) {
      const child = this.explorer.anatomyContainer.children[0];
      this.explorer.anatomyContainer.remove(child);
    }

    this.explorer.anatomyContainer.add(scene);

    
    scene.updateMatrixWorld(true);
    const rawBox    = new THREE.Box3().setFromObject(scene);
    const rawSize   = rawBox.getSize(new THREE.Vector3());
    const rawCenter = rawBox.getCenter(new THREE.Vector3());
    const maxDim    = Math.max(rawSize.x, rawSize.y, rawSize.z);

    if (!isFinite(maxDim) || maxDim <= 0) {
      throw new Error('Model bounding box is zero or invalid.');
    }

    
    const TARGET_HEIGHT = 6.0;
    const autoScale     = TARGET_HEIGHT / maxDim;
    const offset        = rawCenter.clone().negate();

    this.explorer.anatomyContainer.scale.setScalar(autoScale);
    this.explorer.anatomyContainer.position.copy(offset.multiplyScalar(autoScale));

    
    this._registerMeshes(scene, systemKey);

    
    this.explorer.anatomyContainer.updateMatrixWorld(true);
    const worldBox    = new THREE.Box3().setFromObject(this.explorer.anatomyContainer);
    const worldSize   = worldBox.getSize(new THREE.Vector3());
    const worldCenter = worldBox.getCenter(new THREE.Vector3());

    
    if (!this.explorer.cameraManager) {
      this.explorer.cameraManager = new CameraManager(
        this.explorer.camera,
        this.explorer.controls,
        this.explorer.renderer
      );
    }

    
    this.explorer.cameraManager.fitToBoundingBox(worldBox);

    
    if (this.explorer.controls) {
      const ctrl = this.explorer.controls;
      ctrl.enableDamping  = true;
      ctrl.dampingFactor  = 0.06;
      ctrl.enableRotate   = true;
      ctrl.enablePan      = true;   
      ctrl.enableZoom     = true;
      ctrl.minPolarAngle  = 0;
      ctrl.maxPolarAngle  = Math.PI;
      ctrl.update();
    }

    
    this.explorer.resetView = function () {
      const cam = this.cameraManager;
      if (!cam?.defaultState) return;

      this.focusAnimation = {
        startTime: performance.now(),
        duration: 700,
        startTarget: this.controls ? this.controls.target.clone() : new THREE.Vector3(),
        endTarget: cam.defaultState.target.clone(),
        startCamPos: this.camera.position.clone(),
        endCamPos: cam.defaultState.position.clone()
      };

      this.selectMesh(null);
    };

    
    const defaultTargetY = this.explorer.cameraManager.defaultState?.target.y ?? 0;
    this.explorer.setView = function (view) {
      const views = {
        full      : [0,           0.05],
        anterior  : [0,           0.05],
        posterior : [Math.PI,     0.05],
        lateral   : [Math.PI / 2, 0.05],
      };
      const [ry, rx] = views[view] || [0, 0.05];
      this.targetRotY         = ry;
      this.targetRotX         = rx;
      this.targetPivotOffsetY = defaultTargetY;
      this.isFlying           = true;
    };

    
    this._upgradeLighting();

    
    const camDist = this.explorer.camera ? this.explorer.camera.position.distanceTo(this.explorer.controls.target) : 0;
    const rootKeys = ['Skeletal system.g', 'Muscular system.g', 'Arterial system.g', 'Nervous system & Sense organs.g', 'Visceral systems.g'];
    let hierarchyPreserved = true;
    rootKeys.forEach(k => {
      let found = false;
      scene.traverse(n => { if (n.name === k) found = true; });
      if (!found) hierarchyPreserved = false;
    });

    console.log(`Hierarchy Preserved: ${hierarchyPreserved ? 'YES' : 'NO'}`);
    console.log(`Meshes Reparented: NO`);
    console.log(`Registered Meshes: ${this.explorer.clickableMeshes.length}`);
    console.log(`Bounding Box: W=${worldSize.x.toFixed(3)} H=${worldSize.y.toFixed(3)} D=${worldSize.z.toFixed(3)}`);
    console.log(`Camera Distance: ${camDist.toFixed(3)}`);
    console.log(`Viewer UI optimized successfully.`);
  }

  

  _ensureLoader() {
    if (typeof THREE === 'undefined') throw new Error('[SkeletonViewer] THREE.js not loaded.');
    if (typeof THREE.GLTFLoader === 'undefined') {
      throw new Error('[SkeletonViewer] THREE.GLTFLoader not available — add CDN script before skeleton-viewer.js.');
    }
    this._loader = new THREE.GLTFLoader();
  }

  _loadGLTF(path) {
    const resolvedURL = new URL(path, location.href).href;
    console.log(`[SkeletonViewer] ⏳ Fetching: ${resolvedURL}`);

    
    let fakeTimer = null;
    let fakePct   = 0;

    const setProgress = (pct) => {
      const bar    = document.getElementById('loading-bar');
      const status = document.getElementById('loading-status');
      const ovPct  = document.getElementById('bsv-pct');
      const ovFill = document.getElementById('bsv-progress-fill');
      if (bar)    bar.style.width    = `${pct}%`;
      if (status) status.textContent = `Loading Skeleton… ${Math.round(pct)}%`;
      if (ovPct)  ovPct.textContent  = `${Math.round(pct)}%`;
      if (ovFill) ovFill.style.width = `${pct}%`;
    };

    
    fakeTimer = setInterval(() => {
      
      fakePct += (90 - fakePct) * 0.04;
      setProgress(fakePct);
    }, 200);

    return new Promise((resolve, reject) => {
      this._loader.load(
        path,
        (gltf) => {
          clearInterval(fakeTimer);
          setProgress(100);
          console.log('[SkeletonViewer] ✅ GLTFLoader onLoad fired.');
          console.log('  gltf raw       :', gltf);
          console.log('  gltf.scene     :', gltf ? gltf.scene : 'UNDEFINED');
          console.log('  gltf.scenes    :', gltf ? gltf.scenes : 'UNDEFINED');
          resolve(gltf);
        },
        (xhr) => {
          if (xhr.total && xhr.total > 0) {
            
            clearInterval(fakeTimer);
            fakeTimer = null;
            const pct = (xhr.loaded / xhr.total) * 100;
            setProgress(pct);
          }
        },
        (err) => {
          clearInterval(fakeTimer);
          console.error('[SkeletonViewer] ❌ GLTFLoader onError fired:', err);
          console.error('[SkeletonViewer]    Requested URL:', resolvedURL);
          reject(err);
        }
      );
    });
  }

  

  _clearPlaceholders() {
    const ex    = this.explorer;
    const pivot = ex.pivot;
    if (!pivot) return;

    if (ex.anatomyContainer) {
      pivot.remove(ex.anatomyContainer);
      this._disposeGroup(ex.anatomyContainer);
      ex.anatomyContainer = null;
    }

    if (ex.systemGroups) {
      for (const [, g] of Object.entries(ex.systemGroups)) {
        if (g instanceof THREE.Object3D) {
          pivot.remove(g);
          this._disposeGroup(g);
        }
      }
      ex.systemGroups = {};
    }

    if (ex.skinGroup) {
      pivot.remove(ex.skinGroup);
      this._disposeGroup(ex.skinGroup);
      ex.skinGroup = null;
    }

    ex.clickableMeshes = [];
    ex.meshRegistry    = {};
    ex.heartMesh = ex.lLung = ex.rLung = ex.diaphragm = null;
    if (ex.organRegistry) ex.organRegistry.clear();

    console.log('[SkeletonViewer] Placeholder geometry cleared.');
  }

  _disposeGroup(group) {
    group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => m.dispose());
      }
    });
  }

  

  _registerMeshes(scene, loadedSystemKey = 'fullBody') {
    const ex = this.explorer;
    if (ex.organRegistry) {
      ex.organRegistry.clear();
    }
    const systemKeys = ['skeletal','muscular','nervous','circulatory','respiratory','digestive'];

    

    const KW = {
      skeletal   : ['groove','sulcus','notch','process','canal','foramen','fossa','crest','tubercle',
                    'articular','surface','linea','spine','angle','border','tuberosity','condyle',
                    'epicondyle','facet','arch','shaft','extremity','ramus','cavity','sinus','plate',
                    'meatus','trochanter','eminence','fissure','aperture','suture','skeleton','bone',
                    'cartilage','joint','joint','ligament'],

      circulatory: ['heart','aorta','artery','vein','vessel','capillary','vena cava','jugular','carotid'],
      nervous    : ['nerve','plexus','brain','cerebrum','cerebellum','brainstem','spinal cord','vagus'],
      respiratory: ['lung','trachea','bronch','larynx','pharynx','diaphragm','nasal cavity'],
      digestive  : ['stomach','liver','gallbladder','pancreas','intestine','rectum','kidney',
                    'ureter','esophagus','colon','duodenum','jejunum','ileum'],
      muscular   : ['muscle','pectoralis','oblique','gluteus','trapezius','deltoid','bicep',
                    'tricep','gastrocnemius','frontalis','temporalis','rectus abdominis'],
    };

    const VISCERA = ['heart','lung','stomach','liver','brain'];
    const MUS_SFX = ['.ol','.or','.el','.er','.o1l','.e1l','.o1r','.e1r','.o2l','.e2l','.o2r','.e2r'];

    
    scene.updateMatrixWorld(true);
    const meshes = [];
    scene.traverse(obj => {
      if (obj.isMesh || obj.isSkinnedMesh) {
        obj.updateMatrixWorld(true);
        meshes.push(obj);
      }
    });

    meshes.forEach(obj => {
      const nl = (obj.name || '').toLowerCase();
      let systemKey = 'skeletal';

      const isViscera = VISCERA.some(k => nl.includes(k));
      if (!isViscera && KW.skeletal.some(k => nl.includes(k))) {
        systemKey = 'skeletal';
      } else if (KW.circulatory.some(k => nl.includes(k)))   { systemKey = 'circulatory'; }
      else if (KW.nervous.some(k => nl.includes(k)))       { systemKey = 'nervous'; }
      else if (KW.respiratory.some(k => nl.includes(k)))   { systemKey = 'respiratory'; }
      else if (KW.digestive.some(k => nl.includes(k)))     { systemKey = 'digestive'; }
      else if (KW.muscular.some(k => nl.includes(k)) || MUS_SFX.some(s => nl.endsWith(s))) {
        systemKey = 'muscular';
      }

      
      if (systemKey === 'skeletal' && loadedSystemKey && loadedSystemKey !== 'fullBody' && loadedSystemKey !== 'skeletal') {
        systemKey = loadedSystemKey;
      }

      this._upgradeObjMaterial(obj);
      obj.castShadow    = true;
      obj.receiveShadow = true;

      const safeName     = obj.name || `mesh_anon`;
      const friendlyName = this._humanize(safeName);
      const meshId       = systemKey.slice(0,4) + '_' + safeName.toLowerCase().replace(/[^a-z0-9]+/g,'_');

      obj.userData = {
        meshId,
        organName: friendlyName,
        systemKey,
        originalEmissive: 0x000000,
        originalScale: obj.scale.clone(),
        originalPosition: obj.position.clone()
      };
      ex.meshRegistry[meshId] = obj;
      ex.clickableMeshes.push(obj);

      if (ex.selectionManager) {
        ex.selectionManager.register(obj);
      }
      if (ex.organRegistry) {
        ex.organRegistry.register(obj, systemKey);
      }

      
      if (!ex.heartMesh && nl.includes('heart') && !nl.includes('artery') && !nl.includes('vein')) {
        ex.heartMesh = obj;
      }
      if (!ex.lLung  && (nl.includes('left lung')  || nl.includes('lung_l'))) ex.lLung  = obj;
      if (!ex.rLung  && (nl.includes('right lung')  || nl.includes('lung_r'))) ex.rLung  = obj;
      if (!ex.diaphragm && nl.includes('diaphragm')) ex.diaphragm = obj;
    });

    console.log(`[SkeletonViewer] ${meshes.length} meshes registered.`);
    if (ex.organRegistry) {
      ex.organRegistry.print();
    }
  }

  _humanize(name) {
    return name
      .replace(/\.[a-z0-9]+$/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim() || 'Organ Part';
  }

  _upgradeObjMaterial(mesh) {
    if (!mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const upgraded = mats.map(mat => {
      if (mat.emissive !== undefined) return mat;
      const color = mat.color ? mat.color.clone() : new THREE.Color(0xd8d8d8);
      return new THREE.MeshStandardMaterial({
        color, emissive: new THREE.Color(0x000000),
        roughness: 0.55, metalness: 0.08, side: THREE.DoubleSide,
      });
    });
    mesh.material = upgraded.length === 1 ? upgraded[0] : upgraded;
  }

  

  _upgradeLighting() {
    const ex = this.explorer;
    const sc = ex.scene;
    if (!sc) return;

    if (ex.ambientLight) {
      ex.ambientLight.color.setHex(0x1a2d45);
      ex.ambientLight.intensity = 5;
    }

    if (ex.keyLight) {
      ex.keyLight.color.setHex(0xb0d4ff);
      ex.keyLight.intensity = 4.0;
      ex.keyLight.position.set(5, 12, 8);
      ex.keyLight.castShadow = true;
      if (ex.keyLight.shadow) {
        ex.keyLight.shadow.mapSize.width  = 2048;
        ex.keyLight.shadow.mapSize.height = 2048;
        ex.keyLight.shadow.bias           = -0.0003;
      }
    }

    if (ex.fillLight) {
      ex.fillLight.color.setHex(0x5533aa);
      ex.fillLight.intensity = 1.6;
      ex.fillLight.position.set(-6, 4, -4);
    }

    if (ex.rimLight) {
      ex.rimLight.color.setHex(0xffffff);
      ex.rimLight.intensity = 0.9;
      ex.rimLight.position.set(0, -5, -8);
    }

    if (!this._underLight) {
      this._underLight = new THREE.DirectionalLight(0x203050, 1.6);
      this._underLight.position.set(0, -10, 4);
      sc.add(this._underLight);
    }

    console.log('[SkeletonViewer] Lighting upgraded.');
  }

  

  _injectStyles() {
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

  _createLoadingOverlay() {
    const canvas = this.explorer.canvas;
    if (!canvas || !canvas.parentElement) return;
    const wrap = canvas.parentElement;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';

    const div = document.createElement('div');
    div.id = 'bsv-loading-overlay';
    div.innerHTML = `
      <div class="bsv-loader-inner">
        <div class="bsv-spinner"></div>
        <div class="bsv-loader-text">
          <span class="bsv-label">Loading Skeleton</span>
          <span class="bsv-pct" id="bsv-pct">0%</span>
        </div>
        <div class="bsv-progress-track">
          <div class="bsv-progress-fill" id="bsv-progress-fill"></div>
        </div>
      </div>
    `;
    wrap.appendChild(div);
    this._overlay = div;
  }

  _removeLoadingOverlay() {
    const existing = document.getElementById('bsv-loading-overlay');
    if (existing) {
      existing.style.opacity = '0';
      setTimeout(() => existing.remove(), 600);
    }
    this._overlay = null;
  }

  _showErrorOverlay(msg) {
    this._removeLoadingOverlay();
    const canvas = this.explorer.canvas;
    if (!canvas || !canvas.parentElement) return;
    const wrap = canvas.parentElement;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';

    const div = document.createElement('div');
    div.id = 'bsv-error-overlay';
    div.innerHTML = `
      <div class="bsv-error-inner">
        <div class="bsv-error-icon">💀</div>
        <div class="bsv-error-title">Model Load Error</div>
        <div class="bsv-error-msg">${msg}</div>
        <button class="bsv-error-btn" onclick="document.getElementById('bsv-error-overlay').remove()">Dismiss</button>
      </div>
    `;
    wrap.appendChild(div);
  }
}

window.BioSkeletonViewer = BioSkeletonViewer;
