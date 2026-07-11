





'use strict';

class AnatomyAssetSystem {
  constructor(explorer) {
    this.explorer = explorer;
    this.gltfLoader = null;
    
    
    this.organsRegistry = {};
    
    
    this.systemGroups = {};

    
    this.animationHooks = {};

    
    this.config = {
      mode: 'single', 
      singleAssetPath: 'models/anatomy.glb',
      systemPaths: {
        skeletal: 'models/skeletal.glb',
        muscular: 'models/muscular.glb',
        nervous: 'models/nervous.glb',
        circulatory: 'models/circulatory.glb',
        digestive: 'models/digestive.glb',
        respiratory: 'models/respiratory.glb',
        immune: 'models/immune.glb'
      }
    };
  }

  


  initLoader() {
    if (typeof THREE.GLTFLoader === 'undefined') {
      throw new Error('GLTFLoader not found. Load three-gltf-loader CDN script first.');
    }
    this.gltfLoader = new THREE.GLTFLoader();
  }

  


  async loadSystem(systemKey) {
    this.initLoader();
    const manifest = window.BIO_MODEL_MANIFEST;
    if (!manifest) throw new Error('BIO_MODEL_MANIFEST not found.');

    const assetPath = this.config.mode === 'single' 
      ? this.config.singleAssetPath 
      : this.config.systemPaths[systemKey];

    if (!assetPath) {
      throw new Error(`No asset path found for system: ${systemKey}`);
    }

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        assetPath,
        (gltf) => {
          console.log(`🧠 AAS: Loaded system asset for [${systemKey}]:`, assetPath);
          this.processLoadedModel(gltf.scene, systemKey, manifest);
          resolve(gltf);
        },
        (xhr) => {
          if (xhr.total > 0) {
            const pct = Math.round((xhr.loaded / xhr.total) * 100);
            const bar = document.getElementById('loading-bar');
            if (bar) bar.style.width = `${pct}%`;
          }
        },
        (err) => {
          console.warn(`⚠️ AAS: Load failed for ${systemKey} asset:`, err);
          reject(err);
        }
      );
    });
  }

  


  processLoadedModel(scene, targetSystem, manifest) {
    const explorer = this.explorer;

    
    scene.scale.set(1, 1, 1);
    scene.rotation.set(0, 0, 0);
    explorer.pivot.add(scene);

    scene.traverse((obj) => {
      if (!obj.isMesh && !obj.isSkinnedMesh) return;

      const nodeName = obj.name;

      
      if (nodeName === manifest.skinNode) {
        explorer.skinMeshes = explorer.skinMeshes || [];
        explorer.skinMeshes.push(obj);
        obj.material.transparent = true;
        obj.material.opacity = explorer.skinOpacity;
        obj.castShadow = true;
        return;
      }

      
      const entry = manifest.meshMap[nodeName];
      if (entry && entry.systemKey === targetSystem) {
        this.registerOrgan(obj, entry.meshId, entry.organName, entry.systemKey);
      }
    });

    
    this.updateAnimationRefs(scene, manifest.animRefs);
  }

  


  registerOrgan(mesh, meshId, organName, systemKey) {
    
    this.applyStandardMaterial(mesh);

    
    const metadata = (window.BioAnatomyData?.organs && window.BioAnatomyData.organs[meshId]) || {
      type: 'Organ Structure',
      location: 'Internal Body',
      function: 'Performs systemic functions'
    };

    const organAsset = {
      meshId,
      organName,
      systemKey,
      mesh,
      metadata,
      animationHooks: {}
    };

    this.organsRegistry[meshId] = organAsset;

    
    if (!this.systemGroups[systemKey]) {
      this.systemGroups[systemKey] = new THREE.Group();
      this.explorer.pivot.add(this.systemGroups[systemKey]);
    }
    this.systemGroups[systemKey].add(mesh);

    
    this.explorer.register(mesh, meshId, organName, systemKey);
    this.explorer.addToSystem(systemKey, mesh);

    
    this.bindDefaultAnimationHooks(organAsset);
  }

  


  applyStandardMaterial(mesh) {
    const mat = mesh.material;
    if (!mat) return;
    if (mat.emissive !== undefined) return; 

    const color = mat.color ? mat.color.clone() : new THREE.Color(0xcccccc);
    mesh.material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: new THREE.Color(0x000000),
      roughness: 0.65,
      metalness: 0.15,
      transparent: mat.transparent || false,
      opacity: mat.opacity || 1.0,
      side: THREE.DoubleSide
    });
  }

  


  bindDefaultAnimationHooks(organAsset) {
    const meshId = organAsset.meshId;
    
    
    if (meshId === 'circ_heart' || meshId === 'heart') {
      organAsset.animationHooks.pulseSpeed = 6.8;
      organAsset.animationHooks.customUpdate = (time, mesh) => {
        const scale = 1.0 + Math.sin(time * 6.8) * 0.06;
        mesh.scale.set(scale, scale, scale);
      };
    }

    
    if (meshId === 'resp_l_lung' || meshId === 'resp_r_lung') {
      const isRight = meshId === 'resp_r_lung';
      organAsset.animationHooks.inhaleScale = 0.08;
      organAsset.animationHooks.customUpdate = (time, mesh) => {
        if (!mesh) return;
        
        
        
        if (!mesh.userData._lungBaseScale) {
          const sx = mesh.scale.x, sy = mesh.scale.y, sz = mesh.scale.z;
          const isUniform = Math.abs(sx - sy) < 0.05 && Math.abs(sx - sz) < 0.05;
          if (isUniform) {
            
            mesh.userData._lungBaseScale = {
              x: sx * (isRight ? 0.88 : 0.82),
              y: sy * (isRight ? 1.52 : 1.48),
              z: sz * 0.68,
            };
            
            
            const b0 = mesh.userData._lungBaseScale;
            mesh.scale.set(b0.x, b0.y, b0.z);
          } else {
            
            mesh.userData._lungBaseScale = { x: sx, y: sy, z: sz };
          }
        }
        const b = mesh.userData._lungBaseScale;
        const breathing = 1.0 + Math.sin(time * 2.2) * 0.05;
        mesh.scale.set(b.x * breathing, b.y * breathing, b.z * breathing);
      };
    }
  }

  


  registerAnimationHook(meshId, name, value) {
    if (this.organsRegistry[meshId]) {
      this.organsRegistry[meshId].animationHooks[name] = value;
    }
  }

  


  updateAnimationRefs(scene, animRefs) {
    const explorer = this.explorer;
    scene.traverse((obj) => {
      if (!obj.isMesh && !obj.isSkinnedMesh) return;
      const n = obj.name;
      if (n === animRefs.heartMesh) explorer.heartMesh = obj;
      if (n === animRefs.lLung)     explorer.lLung = obj;
      if (n === animRefs.rLung)     explorer.rLung = obj;
      if (n === animRefs.diaphragm) explorer.diaphragm = obj;
    });
  }

  


  setHoverHighlight(mesh, isHovered) {
    if (!mesh || !mesh.material || !mesh.material.emissive) return;

    if (isHovered) {
      if (mesh !== this.explorer.selectedMesh) {
        mesh.userData.originalEmissive = mesh.userData.originalEmissive || mesh.material.emissive.getHex();
        
        mesh.material.emissive.setHex(0x007799);
      }
    } else {
      if (mesh !== this.explorer.selectedMesh) {
        const orig = mesh.userData.originalEmissive !== undefined ? mesh.userData.originalEmissive : 0x000000;
        mesh.material.emissive.setHex(orig);
      }
    }
  }

  


  setSelectionHighlight(mesh) {
    
    if (this.explorer.selectedMesh && this.explorer.selectedMesh.material && this.explorer.selectedMesh.material.emissive) {
      const orig = this.explorer.selectedMesh.userData.originalEmissive !== undefined 
        ? this.explorer.selectedMesh.userData.originalEmissive 
        : 0x000000;
      this.explorer.selectedMesh.material.emissive.setHex(orig);
    }

    if (mesh && mesh.material && mesh.material.emissive) {
      mesh.userData.originalEmissive = mesh.userData.originalEmissive || mesh.material.emissive.getHex();
      
      mesh.material.emissive.setHex(0x00d4ff);
    }
  }

  


  getOrganMetadata(meshId) {
    const organ = this.organsRegistry[meshId];
    return organ ? organ.metadata : null;
  }

  


  tick(time) {
    
    for (const meshId in this.organsRegistry) {
      const organ = this.organsRegistry[meshId];
      if (organ.animationHooks && typeof organ.animationHooks.customUpdate === 'function') {
        organ.animationHooks.customUpdate(time, organ.mesh);
      }
    }
  }
}

window.AnatomyAssetSystem = AnatomyAssetSystem;
