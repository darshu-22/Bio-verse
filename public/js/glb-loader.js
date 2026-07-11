






















'use strict';

class GLBAnatomyLoader {

  


  constructor(explorer) {
    this.explorer      = explorer;
    this.loader        = null;   
    this.loadedGltf    = null;   
    this.loadedScene   = null;   
    this._manifest     = null;   
  }

  



  





  async load() {
    this._manifest = window.BIO_MODEL_MANIFEST;

    if (!this._manifest) {
      throw new Error('[GLBLoader] BIO_MODEL_MANIFEST not found — load model-manifest.js first.');
    }

    this._initLoader();

    const path = this._manifest.modelPath || 'models/anatomy.glb';
    console.log(`[GLBLoader] Loading: ${path}`);

    const gltf = await this._loadGLTF(path);
    this.loadedGltf  = gltf;
    this.loadedScene = gltf.scene;

    this._applySceneTransform(gltf.scene);
    this._processScene(gltf.scene);
    this._assignAnimationRefs(gltf.scene);
    this._applyInitialSystemVisibility();
    this._logReport();
  }

  











  sampleVesselPath(glbNodeName, samples = 6) {
    if (!this.loadedScene) {
      console.warn('[GLBLoader] No scene loaded yet.');
      return null;
    }
    let target = null;
    this.loadedScene.traverse(o => { if (o.name === glbNodeName) target = o; });
    if (!target) { console.warn(`[GLBLoader] Node not found: ${glbNodeName}`); return null; }

    const box = new THREE.Box3().setFromObject(target);
    const min = box.min, max = box.max;
    const pts = [];
    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      pts.push(new THREE.Vector3(
        min.x + (max.x - min.x) * t,
        min.y + (max.y - min.y) * t,
        min.z + (max.z - min.z) * t
      ));
    }
    const json = pts.map(p => `new THREE.Vector3(${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)})`).join(',\n      ');
    console.log(`%c[${glbNodeName}] CatmullRomCurve3 points:\n[\n      ${json}\n    ]`, 'color:#00d4ff');
    return pts;
  }

  



  _initLoader() {
    if (typeof THREE.GLTFLoader === 'undefined') {
      throw new Error(
        '[GLBLoader] THREE.GLTFLoader not found.\n' +
        'Add this <script> to index.html BEFORE explorer3d.js:\n' +
        '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>'
      );
    }
    this.loader = new THREE.GLTFLoader();
  }

  






  _loadGLTF(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,

        
        (gltf) => {
          console.log(`[GLBLoader] ✅ Loaded: ${path}`);
          resolve(gltf);
        },

        
        (xhr) => {
          if (xhr.total === 0) return; 
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          
          const bar    = document.getElementById('loading-bar');
          const status = document.getElementById('loading-status');
          if (bar)    bar.style.width = `${pct}%`;
          if (status) status.textContent = `Loading anatomy model… ${pct}%`;
        },

        
        (err) => {
          console.error('[GLBLoader] ❌ Load failed:', err);
          reject(err);
        }
      );
    });
  }

  



  



  _applySceneTransform(scene) {
    const scale   = this._manifest.modelScale   ?? 1.0;
    const offsetY = this._manifest.modelOffsetY ?? 0.0;

    scene.scale.setScalar(scale);
    scene.position.y = offsetY;
    scene.rotation.set(0, 0, 0); 

    this.explorer.pivot.add(scene);
    console.log(`[GLBLoader] Scale: ${scale}, offsetY: ${offsetY}`);
  }

  





  _processScene(scene) {
    const manifest     = this._manifest;
    const meshMap      = manifest.meshMap;
    const skinNodeName = manifest.skinNode;

    this._stats = { registered: 0, skin: 0, unknown: 0, missing: [] };

    scene.traverse((obj) => {
      if (!obj.isMesh && !obj.isSkinnedMesh) return;

      const name = obj.name;

      
      if (name === skinNodeName) {
        this._registerSkin(obj);
        this._stats.skin++;
        return;
      }

      
      const entry = meshMap[name];
      if (entry) {
        this._registerOrgan(obj, entry);
        this._stats.registered++;
        return;
      }

      
      
      this._stats.unknown++;
    });

    
    const critical = new Set([
      ...Object.values(manifest.animRefs),
      ...[
        'Circ_Heart', 'Nerve_Cerebrum', 'Resp_Lung_L', 'Resp_Lung_R',
        'Resp_Diaphragm', 'Dig_Stomach', 'Dig_Liver',
        'Organ_Kidney_L', 'Resp_Trachea',
      ]
    ]);

    for (const nodeName of critical) {
      const entry = meshMap[nodeName];
      if (!entry) continue;
      if (!this.explorer.meshRegistry[entry.meshId]) {
        this._stats.missing.push(nodeName);
      }
    }
  }

  



  _registerSkin(mesh) {
    
    this._ensureTransparentMaterial(mesh);
    mesh.material.transparent = true;
    mesh.material.opacity      = this.explorer.skinOpacity ?? 0.2;
    mesh.castShadow            = true;
    mesh.receiveShadow         = true;

    
    if (!Array.isArray(this.explorer.skinMeshes)) {
      this.explorer.skinMeshes = [];
    }
    this.explorer.skinMeshes.push(mesh);

    
    this.explorer.skinMesh = mesh;

    console.log(`[GLBLoader] Skin registered: ${mesh.name}`);
  }

  


  _registerOrgan(mesh, entry) {
    
    this._ensureEmissiveMaterial(mesh);

    mesh.castShadow    = true;
    mesh.receiveShadow = true;

    
    mesh.userData.originalEmissive = mesh.material.emissive?.getHex() ?? 0x000000;

    this.explorer.register(mesh, entry.meshId, entry.organName, entry.systemKey);
    this.explorer.addToSystem(entry.systemKey, mesh);
  }

  




  _assignAnimationRefs(scene) {
    const refs    = this._manifest.animRefs;
    const missing = [];

    scene.traverse((obj) => {
      if (!obj.isMesh && !obj.isSkinnedMesh) return;
      const n = obj.name;
      if (n === refs.heartMesh) { this.explorer.heartMesh = obj; }
      if (n === refs.lLung)     { this.explorer.lLung     = obj; }
      if (n === refs.rLung)     { this.explorer.rLung     = obj; }
      if (n === refs.diaphragm) { this.explorer.diaphragm = obj; }
    });

    if (!this.explorer.heartMesh) missing.push('heartMesh → ' + refs.heartMesh);
    if (!this.explorer.lLung)     missing.push('lLung → '     + refs.lLung);
    if (!this.explorer.rLung)     missing.push('rLung → '     + refs.rLung);
    if (!this.explorer.diaphragm) missing.push('diaphragm → ' + refs.diaphragm);

    if (missing.length) {
      console.warn(
        '[GLBLoader] ⚠️ Missing animation reference nodes.\n' +
        'Heartbeat and/or breathing animations will be silently disabled.\n' +
        'Fix: rename these nodes in Blender to match animRefs in model-manifest.js:\n  ' +
        missing.join('\n  ')
      );
    } else {
      console.log('[GLBLoader] ✅ All 4 animation refs assigned (heartMesh, lLung, rLung, diaphragm)');
    }
  }

  



  _applyInitialSystemVisibility() {
    for (const [key, group] of Object.entries(this.explorer.systemGroups)) {
      group.visible = (key === this.explorer.activeSystem);
    }

    
    if (this.explorer.skinMesh) {
      this.explorer.skinMesh.visible = (this.explorer.currentScale === 'organ');
    }
  }

  



  




  _ensureEmissiveMaterial(mesh) {
    if (!mesh.material) return;

    const mat = mesh.material;
    
    if (mat.emissive !== undefined) return;

    const color = mat.color ? mat.color.clone() : new THREE.Color(0xffffff);
    const alpha = mat.opacity ?? 1.0;
    const trans = mat.transparent ?? (alpha < 1.0);

    mesh.material = new THREE.MeshStandardMaterial({
      color:       color,
      emissive:    new THREE.Color(0x000000),
      roughness:   0.65,
      metalness:   0.05,
      transparent: trans,
      opacity:     alpha,
    });
  }

  


  _ensureTransparentMaterial(mesh) {
    if (!mesh.material) return;
    const mat = mesh.material;
    
    if (!mat.transparent) {
      mesh.material = mat.clone();
      mesh.material.transparent = true;
      mesh.material.side = THREE.FrontSide;
      mesh.material.depthWrite = false;
    }
  }

  



  _logReport() {
    const s = this._stats;
    console.group('[GLBLoader] Load Report');
    console.log(`  Organ meshes registered : ${s.registered}`);
    console.log(`  Skin meshes             : ${s.skin}`);
    console.log(`  Non-manifest meshes     : ${s.unknown}`);
    if (s.missing.length) {
      console.warn(`  ⚠️ Missing critical nodes (${s.missing.length}):`, s.missing);
      console.warn(
        '  Fix: open anatomy.glb in Blender → rename these mesh objects to match model-manifest.js'
      );
    } else {
      console.log('  All critical nodes found ✅');
    }
    console.log(
      `  Total meshRegistry entries: ${Object.keys(this.explorer.meshRegistry).length}`
    );
    console.groupEnd();
  }
}

window.GLBAnatomyLoader = GLBAnatomyLoader;
