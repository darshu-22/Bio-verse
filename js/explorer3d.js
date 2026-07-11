




'use strict';

class Explorer3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    
    this.activeSystem = 'fullBody';
    this.selectedMesh = null;
    this.hoveredMesh = null;
    this.time = 0;
    this.skinOpacity = 0.20;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.targetRotY = 0;
    this.targetRotX = 0.05;
    this.currentRotY = 0;
    this.currentRotX = 0.05;
    
    this.targetPivotOffsetX  = 0;
    this.targetPivotOffsetY  = 0;
    this.targetPivotOffsetZ  = 0;
    this.currentPivotOffsetY = 0;
    this.animFrame = null;
    this.isFlying = false;

    
    this.meshRegistry = {};
    
    this.systemGroups = {};
    
    this.clickableMeshes = [];
    
    this.heartMesh = null;
    this.lLung = null; this.rLung = null;
    this.diaphragm = null;

    
    this.currentScale = 'organ';
    this.isTransitioningScale = false;
    this.tissueGroup = new THREE.Group();
    this.cellGroup = new THREE.Group();
    this.dnaGroup = new THREE.Group();
    this.tissueGroup.visible = false;
    this.cellGroup.visible = false;
    this.dnaGroup.visible = false;

    this.init();
    
    
    this.systemModelManager = new SystemModelManager(this);
    this.modelManager = this.systemModelManager;
    this.anatomyManager = new AnatomyManager(this.modelManager).initialize();
    
    
    const cardioMeta = this.anatomyManager.systemMetadata.get('cardiovascular');
    if (cardioMeta) {
      this.anatomyManager.registerSystem('circulatory', Object.assign({}, cardioMeta, { id: 'circulatory', displayName: 'Circulatory System' }));
    }
    const lymphMeta = this.anatomyManager.systemMetadata.get('lymphatic');
    if (lymphMeta) {
      this.anatomyManager.registerSystem('immune', Object.assign({}, lymphMeta, { id: 'immune', displayName: 'Immune System' }));
    }

    this.organRegistry = new OrganRegistry();
    this.selectionManager = new SelectionManager().initialize();
    this.highlightManager = new HighlightManager().initialize();
    this.infoPanel = new InfoPanel().initialize();

    
    this.pivot.add(this.tissueGroup);
    this.pivot.add(this.cellGroup);
    this.pivot.add(this.dnaGroup);
    this.bindEvents();
    this.animate();
  }

  
  init() {
    const W = this.canvas.offsetWidth || window.innerWidth * 0.55;
    const H = this.canvas.offsetHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020408, 0.018);

    this.camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1000);
    this.camera.position.set(0, 0, 22);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xd6eeff, 3.5);
    this.keyLight.position.set(4, 10, 8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width  = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.bias = -0.0003;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x8855ff, 1.0);
    this.fillLight.position.set(-5, 3, -4);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    this.rimLight.position.set(0, -6, -8);
    this.scene.add(this.rimLight);

    this.systemLight = new THREE.PointLight(0x00d4ff, 3, 30);
    this.systemLight.position.set(3, 4, 4);
    this.scene.add(this.systemLight);

    
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    
    this.raycaster = new THREE.Raycaster();
    this.mouse2D = new THREE.Vector2();

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping  = true;
      this.controls.dampingFactor  = 0.06;
      this.controls.enablePan      = true;
      this.controls.panSpeed       = 0.8;
      this.controls.enableRotate   = true;
      this.controls.enableZoom     = true;
      this.controls.minDistance    = 0.5;
      this.controls.maxDistance    = 80;
      this.controls.minPolarAngle  = 0;
      this.controls.maxPolarAngle  = Math.PI;
    } else {
      console.warn('THREE.OrbitControls is not defined.');
    }

    this.W = W; this.H = H;
  }

  
  makeMat(color, emissive, specular, shininess, opacity = 1) {
    return new THREE.MeshPhongMaterial({
      color, emissive, specular, shininess,
      transparent: opacity < 1,
      opacity,
      side: THREE.FrontSide,
    });
  }

  makeWireMat(color, opacity = 0.05) {
    return new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });
  }

  skinMat() {
    return new THREE.MeshPhongMaterial({
      color: 0xc8956c,
      emissive: 0x331a0d,
      specular: 0xffd5b0,
      shininess: 40,
      transparent: true,
      opacity: this.skinOpacity,
      side: THREE.FrontSide,
    });
  }

  
  register(mesh, meshId, organName, systemKey) {
    mesh.userData = {
      meshId,
      organName,
      systemKey,
      originalScale: mesh.scale.clone(),
      originalPosition: mesh.position.clone()
    };
    this.meshRegistry[meshId] = mesh;
    this.clickableMeshes.push(mesh);
    if (this.organRegistry) {
      this.organRegistry.register(mesh, systemKey);
    }
    return mesh;
  }

  addToSystem(systemKey, mesh) {
    if (!this.systemGroups[systemKey]) {
      this.systemGroups[systemKey] = new THREE.Group();
      this.systemGroups[systemKey].visible = (systemKey === this.activeSystem);
      if (this.anatomyContainer) {
        this.anatomyContainer.add(this.systemGroups[systemKey]);
      } else {
        this.pivot.add(this.systemGroups[systemKey]);
      }
    }
    this.systemGroups[systemKey].add(mesh);
  }

  
  buildSkinShell() {
    const skinGroup = new THREE.Group();
    const sm = this.skinMat.bind(this);

    const parts = [
      
      [new THREE.SphereGeometry(0.56, 32, 32), [0, 3.5, 0], [0,0,0], [1,1,1]],             
      [new THREE.CylinderGeometry(0.19, 0.23, 0.42, 20), [0, 3.06, 0], [0,0,0], [1,1,1]], 
      [new THREE.CylinderGeometry(0.73, 0.61, 2.05, 28), [0, 1.78, 0], [0,0,0], [1,1,1]], 
      [new THREE.CylinderGeometry(0.62, 0.52, 0.65, 24), [0, 0.63, 0], [0,0,0], [1,1,1]], 
      
      [new THREE.CylinderGeometry(0.18, 0.15, 1.05, 14), [-0.96, 2.18, 0], [0,0,0.28], [1,1,1]],
      [new THREE.CylinderGeometry(0.18, 0.15, 1.05, 14), [0.96, 2.18, 0], [0,0,-0.28], [1,1,1]],
      
      [new THREE.CylinderGeometry(0.14, 0.10, 0.95, 14), [-1.32, 1.25, 0], [0,0,0.48], [1,1,1]],
      [new THREE.CylinderGeometry(0.14, 0.10, 0.95, 14), [1.32, 1.25, 0], [0,0,-0.48], [1,1,1]],
      
      [new THREE.SphereGeometry(0.10, 12, 12), [-1.63, 0.58, 0], [0,0,0], [1.2,0.8,0.6]],
      [new THREE.SphereGeometry(0.10, 12, 12), [1.63, 0.58, 0], [0,0,0], [1.2,0.8,0.6]],
      
      [new THREE.CylinderGeometry(0.26, 0.22, 1.28, 16), [-0.32, -0.42, 0], [0,0,0], [1,1,1]],
      [new THREE.CylinderGeometry(0.26, 0.22, 1.28, 16), [0.32, -0.42, 0], [0,0,0], [1,1,1]],
      
      [new THREE.CylinderGeometry(0.18, 0.13, 1.14, 14), [-0.32, -1.68, 0], [0,0,0], [1,1,1]],
      [new THREE.CylinderGeometry(0.18, 0.13, 1.14, 14), [0.32, -1.68, 0], [0,0,0], [1,1,1]],
      
      [new THREE.BoxGeometry(0.24, 0.12, 0.44), [-0.32, -2.34, 0.12], [0,0,0], [1,1,1]],
      [new THREE.BoxGeometry(0.24, 0.12, 0.44), [0.32, -2.34, 0.12], [0,0,0], [1,1,1]],
    ];

    for (const [geo, pos, rot, scale] of parts) {
      const mesh = new THREE.Mesh(geo, this.skinMat());
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      skinGroup.add(mesh);
    }

    this.skinGroup = skinGroup;
    this.skinMeshes = skinGroup.children;
    this.pivot.add(skinGroup);
  }

  updateSkinOpacity(val) {
    this.skinOpacity = val / 100;
    if (this.skinMeshes) {
      for (const m of this.skinMeshes) {
        m.material.opacity = this.skinOpacity;
      }
    }
  }

  async loadGLBModel() {
    await this.systemModelManager.loadForSystem('fullBody');

    if (window.bioAnimations3D) {
      window.bioAnimations3D.rebind(this);
    }
  }

  calibrateModel(scale) {
    if (this.aas?.organsRegistry) {
      for (const meshId in this.aas.organsRegistry) {
        this.aas.organsRegistry[meshId].mesh.scale.setScalar(scale);
      }
    }
  }

  
  buildAllSystems() {
    this.buildSkeletal();
    this.buildMuscular();
    this.buildNervous();
    this.buildCirculatory();
    this.buildDigestive();
    this.buildRespiratory();
    this.buildImmune();
  }

  
  buildImmune() {
    const SYS = 'immune';
    const iMat = (color=0x06b6d4, op=0.92) => this.makeMat(color, 0x083344, 0xcffafe, 100, op);
    const add = (geo, pos, rot, meshId, name, color=0x06b6d4, scale=[1,1,1]) => {
      const m = new THREE.Mesh(geo, iMat(color));
      m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scale);
      m.castShadow = true;
      this.register(m, meshId, name, SYS);
      this.addToSystem(SYS, m);
      return m;
    };

    
    add(new THREE.BoxGeometry(0.18, 0.22, 0.08), [0, 2.50, 0.18], [0, 0, 0], 'thymus', 'Thymus Gland', 0xf472b6);

    
    const spleen = add(new THREE.SphereGeometry(0.13, 16, 16), [-0.52, 1.45, 0.10], [0, 0.5, 0.3], 'spleen', 'Spleen', 0x8b5cf6);
    spleen.scale.set(0.8, 1.3, 0.7);

    
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 8), [-1.15, 2.00, 0.05], [0, 0, 0.3], 'bone_marrow', 'Bone Marrow', 0xef4444);

    
    const appPts = [
      new THREE.Vector3(0.48, 0.50, 0.18),
      new THREE.Vector3(0.52, 0.40, 0.20),
      new THREE.Vector3(0.46, 0.32, 0.19)
    ];
    const appCurve = new THREE.CatmullRomCurve3(appPts);
    const appGeo = new THREE.TubeGeometry(appCurve, 10, 0.016, 6, false);
    add(appGeo, [0, 0, 0], [0, 0, 0], 'appendix', 'Appendix', 0xec4899);

    
    const nodes = [
      [-0.14, 3.08, 0.16], [0.14, 3.08, 0.16],
      [-0.72, 2.45, 0.15], [0.72, 2.45, 0.15],
      [-0.32, 0.38, 0.20], [0.32, 0.38, 0.20]
    ];
    nodes.forEach((pos) => {
      add(new THREE.SphereGeometry(0.038, 8, 8), pos, [0,0,0], 'lymph_nodes', `Lymph Node Group`, 0x10b981);
    });
  }

  
  buildSkeletal() {
    const SYS = 'skeletal';
    const bMat = (op=0.96) => this.makeMat(0xd8d8d8, 0x2a2a2a, 0xffffff, 140, op);
    const add = (geo, pos, rot, meshId, name, scale=[1,1,1]) => {
      const m = new THREE.Mesh(geo, bMat());
      m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scale);
      m.castShadow = true;
      this.register(m, meshId, name, SYS);
      this.addToSystem(SYS, m);
      return m;
    };

    
    const skull = add(new THREE.SphereGeometry(0.52, 28, 28), [0,3.5,0], [0,0,0], 'bone_skull','Cranium');
    
    add(new THREE.BoxGeometry(0.48,0.12,0.36),[0,3.05,0.08],[0,0,0],'bone_mandible','Mandible');
    
    for (let i=0; i<12; i++) {
      const y = 2.65 - i * 0.22;
      const r = Math.sin(i/11*Math.PI)*0.04;
      add(new THREE.CylinderGeometry(0.10,0.12,0.16,10), [r,y,-0.1],[0,0,0], `bone_spine_${i}`, 'Vertebra');
    }
    
    for (let i=0; i<6; i++) {
      const y = 2.18 - i * 0.28;
      const w = 0.52 + i * 0.04;
      for (let side=-1; side<=1; side+=2) {
        const pts=[];
        for(let j=0;j<=16;j++){
          const t=j/16*Math.PI;
          pts.push(new THREE.Vector3(side*(Math.sin(t)*w*0.5+0.08), Math.sin(t/2)*0.08, -Math.cos(t)*0.2));
        }
        const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,0.033,7,false);
        const m=new THREE.Mesh(geo,bMat(0.9));
        m.position.set(0,y,0);
        this.register(m,'bone_ribs','Rib',SYS);
        this.addToSystem(SYS,m);
      }
    }
    
    add(new THREE.BoxGeometry(0.10,0.78,0.06),[0,1.95,0.42],[0,0,0],'bone_sternum','Sternum');
    
    add(new THREE.CylinderGeometry(0.04,0.04,0.6,8),[0,2.72,0],[0,0,1.05],'bone_clavicle','Clavicle',[1,1,1]);
    add(new THREE.CylinderGeometry(0.04,0.04,0.6,8),[0,2.72,0],[0,0,-1.05],'bone_clavicle','Clavicle',[1,1,1]);
    
    add(new THREE.BoxGeometry(0.32,0.28,0.05),[-0.66,2.25,-0.15],[0,0,0.2],'bone_scapula','Scapula');
    add(new THREE.BoxGeometry(0.32,0.28,0.05),[0.66,2.25,-0.15],[0,0,-0.2],'bone_scapula','Scapula');
    
    add(new THREE.CylinderGeometry(0.08,0.07,0.98,12),[-0.96,2.15,0],[0,0,0.28],'bone_l_upper_arm','Humerus (L)');
    add(new THREE.CylinderGeometry(0.08,0.07,0.98,12),[0.96,2.15,0],[0,0,-0.28],'bone_r_upper_arm','Humerus (R)');
    
    add(new THREE.CylinderGeometry(0.055,0.04,0.88,12),[-1.32,1.22,0],[0,0,0.48],'bone_l_forearm','Radius/Ulna (L)');
    add(new THREE.CylinderGeometry(0.045,0.035,0.88,12),[-1.38,1.22,0.06],[0,0,0.48],'bone_l_forearm','Radius/Ulna (L)');
    add(new THREE.CylinderGeometry(0.055,0.04,0.88,12),[1.32,1.22,0],[0,0,-0.48],'bone_r_forearm','Radius/Ulna (R)');
    add(new THREE.CylinderGeometry(0.045,0.035,0.88,12),[1.38,1.22,0.06],[0,0,-0.48],'bone_r_forearm','Radius/Ulna (R)');
    
    add(new THREE.CylinderGeometry(0.60,0.50,0.62,20),[0,0.58,0],[0,0,0],'bone_pelvis','Pelvis');
    
    add(new THREE.CylinderGeometry(0.10,0.09,1.22,12),[-0.32,-0.42,0],[0,0,0],'bone_l_thigh','Femur (L)');
    add(new THREE.CylinderGeometry(0.10,0.09,1.22,12),[0.32,-0.42,0],[0,0,0],'bone_r_thigh','Femur (R)');
    
    add(new THREE.SphereGeometry(0.07,12,12),[-0.32,-1.10,0.12],[0,0,0],'bone_l_kneecap','Patella (L)');
    add(new THREE.SphereGeometry(0.07,12,12),[0.32,-1.10,0.12],[0,0,0],'bone_r_kneecap','Patella (R)');
    
    add(new THREE.CylinderGeometry(0.07,0.05,1.08,12),[-0.32,-1.68,0],[0,0,0],'bone_l_shin','Tibia/Fibula (L)');
    add(new THREE.CylinderGeometry(0.04,0.03,1.05,10),[-0.42,-1.68,0],[0,0,0],'bone_l_shin','Fibula (L)');
    add(new THREE.CylinderGeometry(0.07,0.05,1.08,12),[0.32,-1.68,0],[0,0,0],'bone_r_shin','Tibia/Fibula (R)');
    add(new THREE.CylinderGeometry(0.04,0.03,1.05,10),[0.42,-1.68,0],[0,0,0],'bone_r_shin','Fibula (R)');
    
    add(new THREE.BoxGeometry(0.20,0.07,0.40),[-0.32,-2.33,0.11],[0,0,0],'bone_foot_l','Tarsal/Metatarsal (L)');
    add(new THREE.BoxGeometry(0.20,0.07,0.40),[0.32,-2.33,0.11],[0,0,0],'bone_foot_r','Tarsal/Metatarsal (R)');
  }

  
  buildMuscular() {
    const SYS = 'muscular';
    const mMat=(color=0xf43f5e,op=0.92)=>this.makeMat(color,0x4c0519,0xfda4af,70,op);
    const add=(geo,pos,rot,meshId,name,color=0xf43f5e)=>{
      const m=new THREE.Mesh(geo,mMat(color));
      m.position.set(...pos); m.rotation.set(...rot); m.castShadow=true;
      this.register(m,meshId,name,SYS);
      this.addToSystem(SYS,m); return m;
    };

    
    add(new THREE.SphereGeometry(0.30,14,14),[-0.34,2.12,0.52],[0,0,0],'mus_pec_l','Pectoralis Major (L)',0xcc2f4a);
    add(new THREE.SphereGeometry(0.30,14,14),[0.34,2.12,0.52],[0,0,0],'mus_pec_r','Pectoralis Major (R)',0xcc2f4a);
    
    for(let i=0;i<3;i++){
      const y=1.84-i*0.34;
      add(new THREE.SphereGeometry(0.10,10,10),[-0.14,y,0.52],[0,0,0],`mus_abs_${i*2}`,'Rectus Abdominis',0xe0304a);
      add(new THREE.SphereGeometry(0.10,10,10),[0.14,y,0.52],[0,0,0],`mus_abs_${i*2+1}`,'Rectus Abdominis',0xe0304a);
    }
    
    add(new THREE.SphereGeometry(0.20,12,12),[-0.52,1.55,0.35],[0,0,0.3],'mus_oblique_l','External Oblique (L)',0xc02040);
    add(new THREE.SphereGeometry(0.20,12,12),[0.52,1.55,0.35],[0,0,-0.3],'mus_oblique_r','External Oblique (R)',0xc02040);
    
    add(new THREE.SphereGeometry(0.35,14,14),[0,2.50,-0.25],[0,0,0],'mus_trap','Trapezius',0xa82030);
    
    add(new THREE.SphereGeometry(0.28,12,12),[-0.60,1.55,-0.15],[0,0,0.15],'mus_lats','Latissimus Dorsi',0xb02030);
    add(new THREE.SphereGeometry(0.28,12,12),[0.60,1.55,-0.15],[0,0,-0.15],'mus_lats','Latissimus Dorsi',0xb02030);
    
    add(new THREE.SphereGeometry(0.17,12,12),[-0.88,2.55,0],[0,0,0],'mus_deltoid_l','Deltoid (L)',0xd44060);
    add(new THREE.SphereGeometry(0.17,12,12),[0.88,2.55,0],[0,0,0],'mus_deltoid_r','Deltoid (R)',0xd44060);
    
    add(new THREE.CylinderGeometry(0.085,0.07,0.76,10),[-0.96,2.10,0.05],[0,0,0.28],'mus_bicep_l','Biceps Brachii (L)',0xe84060);
    add(new THREE.CylinderGeometry(0.085,0.07,0.76,10),[0.96,2.10,0.05],[0,0,-0.28],'mus_bicep_r','Biceps Brachii (R)',0xe84060);
    
    add(new THREE.CylinderGeometry(0.090,0.07,0.80,10),[-0.96,2.10,-0.07],[0,0,0.28],'mus_tricep_l','Triceps Brachii (L)',0xb03050);
    add(new THREE.CylinderGeometry(0.090,0.07,0.80,10),[0.96,2.10,-0.07],[0,0,-0.28],'mus_tricep_r','Triceps Brachii (R)',0xb03050);
    
    add(new THREE.CylinderGeometry(0.065,0.045,0.78,10),[-1.30,1.22,0],[0,0,0.48],'mus_forearm_l','Forearm Flexors (L)',0xd04060);
    add(new THREE.CylinderGeometry(0.065,0.045,0.78,10),[1.30,1.22,0],[0,0,-0.48],'mus_forearm_r','Forearm Flexors (R)',0xd04060);
    
    add(new THREE.SphereGeometry(0.28,12,12),[-0.32,0.33,-0.28],[0,0,0],'mus_glute_l','Gluteus Maximus (L)',0xb01a2e);
    add(new THREE.SphereGeometry(0.28,12,12),[0.32,0.33,-0.28],[0,0,0],'mus_glute_r','Gluteus Maximus (R)',0xb01a2e);
    
    add(new THREE.CylinderGeometry(0.15,0.12,1.12,12),[-0.32,-0.44,0.08],[0,0,0],'mus_quad_l','Quadriceps (L)',0xe03050);
    add(new THREE.CylinderGeometry(0.15,0.12,1.12,12),[0.32,-0.44,0.08],[0,0,0],'mus_quad_r','Quadriceps (R)',0xe03050);
    
    add(new THREE.CylinderGeometry(0.13,0.10,1.08,12),[-0.32,-0.44,-0.10],[0,0,0],'mus_hamstring_l','Hamstrings (L)',0xb82838);
    add(new THREE.CylinderGeometry(0.13,0.10,1.08,12),[0.32,-0.44,-0.10],[0,0,0],'mus_hamstring_r','Hamstrings (R)',0xb82838);
    
    add(new THREE.SphereGeometry(0.12,12,12),[-0.32,-1.88,0],[0,0,0],'mus_calf_l','Gastrocnemius (L)',0xc03040);
    add(new THREE.SphereGeometry(0.12,12,12),[0.32,-1.88,0],[0,0,0],'mus_calf_r','Gastrocnemius (R)',0xc03040);
  }

  
  buildNervous() {
    const SYS = 'nervous';
    const nMat=(color=0xa855f7,op=0.90)=>this.makeMat(color,0x2e1065,0xd8b4fe,80,op);
    const add=(geo,pos,rot,meshId,name,color=0xa855f7)=>{
      const m=new THREE.Mesh(geo,nMat(color));
      m.position.set(...pos); m.rotation.set(...rot);
      this.register(m,meshId,name,SYS);
      this.addToSystem(SYS,m); return m;
    };
    const tube=(pts,r,meshId,name)=>{
      const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*3,r,7,false);
      return add(geo,[0,0,0],[0,0,0],meshId,name);
    };

    
    const cMesh=add(new THREE.SphereGeometry(0.50,28,28),[0,3.5,0],[0,0,0],'nerve_cerebrum','Cerebrum',0xc084fc);
    cMesh.scale.set(1,0.85,0.90);
    
    add(new THREE.SphereGeometry(0.22,18,18),[0,3.10,-0.32],[0,0,0],'nerve_cerebellum','Cerebellum',0x8b5cf6);
    
    add(new THREE.CylinderGeometry(0.09,0.12,0.32,12),[0,2.98,-0.10],[0,0,0],'nerve_brainstem','Brain Stem',0x7c3aed);

    
    const spinalPts=[];
    for(let i=0;i<=28;i++){
      const t=i/28;
      spinalPts.push(new THREE.Vector3(Math.sin(t*2)*0.03, 2.74-t*5.2, -0.18));
    }
    tube(spinalPts,0.052,'nerve_spinal','Spinal Cord');

    
    const cervicalPts=[new THREE.Vector3(0,2.6,-0.15),new THREE.Vector3(0.28,2.45,0.1),new THREE.Vector3(0.45,2.2,0.0)];
    tube(cervicalPts,0.025,'nerve_cervical','Cervical Plexus');
    const cervicalPts2=[new THREE.Vector3(0,2.6,-0.15),new THREE.Vector3(-0.28,2.45,0.1),new THREE.Vector3(-0.45,2.2,0.0)];
    tube(cervicalPts2,0.025,'nerve_cervical','Cervical Plexus');

    
    for(let side=-1;side<=1;side+=2){
      const bp=[
        new THREE.Vector3(0,2.3,-0.15),
        new THREE.Vector3(side*0.52,2.15,-0.05),
        new THREE.Vector3(side*0.90,2.0,0),
        new THREE.Vector3(side*1.28,1.20,0),
      ];
      tube(bp,0.022,'nerve_brachial','Brachial Plexus');
    }

    
    for(let side=-1;side<=1;side+=2){
      const sp=[
        new THREE.Vector3(0,0.2,-0.15),
        new THREE.Vector3(side*0.24,0.0,-0.1),
        new THREE.Vector3(side*0.32,-0.6,-0.05),
        new THREE.Vector3(side*0.32,-1.4,0),
        new THREE.Vector3(side*0.32,-2.4,0),
      ];
      tube(sp,0.028,`nerve_sciatic_${side<0?'l':'r'}`,`Sciatic Nerve (${side<0?'L':'R'})`);
    }

    
    for(let side=-1;side<=1;side+=2){
      const sy=[];
      for(let i=0;i<=12;i++){
        const t=i/12;
        sy.push(new THREE.Vector3(side*0.10, 2.4-t*3.6, -0.22));
      }
      tube(sy,0.018,'nerve_sympathetic','Sympathetic Chain');
    }

    
    const vagusPts=[
      new THREE.Vector3(0,2.72,0),
      new THREE.Vector3(0.08,2.3,-0.05),
      new THREE.Vector3(0.10,1.6,-0.1),
      new THREE.Vector3(0.05,0.5,-0.05),
    ];
    tube(vagusPts,0.020,'nerve_vagus','Vagus Nerve');
  }

  
  buildCirculatory() {
    const SYS = 'circulatory';
    const artMat=(op=0.92)=>this.makeMat(0xef4444,0x450a0a,0xfca5a5,100,op);
    const veinMat=(op=0.90)=>this.makeMat(0x3b82f6,0x0c1a4a,0x93c5fd,80,op);
    const add=(geo,pos,rot,meshId,name,mat)=>{
      const m=new THREE.Mesh(geo,mat);
      m.position.set(...pos); m.rotation.set(...rot);
      this.register(m,meshId,name,SYS);
      this.addToSystem(SYS,m); return m;
    };
    const tube=(pts,r,meshId,name,mat)=>{
      const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*4,r,8,false);
      return add(geo,[0,0,0],[0,0,0],meshId,name,mat);
    };

    
    const heart=add(new THREE.SphereGeometry(0.30,20,20),[-0.12,1.88,0.45],[0,0,0],'circ_heart','Heart',artMat());
    heart.scale.set(1.10,1.0,0.85);
    this.heartMesh=heart;

    
    const aortaPts=[
      new THREE.Vector3(-0.05,2.10,0.40),
      new THREE.Vector3(-0.05,2.42,0.32),
      new THREE.Vector3(0,2.52,0.20),
      new THREE.Vector3(0.14,2.52,0.05),
      new THREE.Vector3(0.08,2.40,-0.12),
      new THREE.Vector3(0.04,2.0,-0.18),
      new THREE.Vector3(0.04,1.0,-0.20),
      new THREE.Vector3(0.04,0.0,-0.20),
      new THREE.Vector3(0.04,-0.80,-0.20),
    ];
    tube(aortaPts,0.055,'circ_aorta','Aorta',artMat());

    
    const paPts=[
      new THREE.Vector3(-0.12,2.05,0.40),
      new THREE.Vector3(-0.28,2.20,0.35),
      new THREE.Vector3(-0.40,2.10,0.25),
    ];
    tube(paPts,0.04,'circ_pulm_artery','Pulmonary Artery',artMat(0.88));

    
    for(let s=-1;s<=1;s+=2){
      const pts=[
        new THREE.Vector3(0.04,2.52,0.05),
        new THREE.Vector3(s*0.10,2.80,-0.05),
        new THREE.Vector3(s*0.12,3.15,-0.02),
      ];
      tube(pts,0.030,'circ_carotid','Carotid Artery',artMat(0.88));
    }

    
    for(let s=-1;s<=1;s+=2){
      const pts=[
        new THREE.Vector3(s*0.50,2.45,0.05),
        new THREE.Vector3(s*0.90,2.10,0),
        new THREE.Vector3(s*1.30,1.25,0),
        new THREE.Vector3(s*1.60,0.60,0),
      ];
      tube(pts,0.025,'circ_brachial','Brachial Artery',artMat(0.85));
    }

    
    for(let s=-1;s<=1;s+=2){
      const pts=[
        new THREE.Vector3(s*0.14,-0.05,-0.15),
        new THREE.Vector3(s*0.30,-0.5,0.05),
        new THREE.Vector3(s*0.32,-1.2,0.05),
        new THREE.Vector3(s*0.32,-2.1,0.05),
      ];
      tube(pts,0.030,`circ_femoral_art_${s<0?'l':'r'}`,'Femoral Artery',artMat(0.88));
    }

    
    const svcPts=[
      new THREE.Vector3(0.0,2.10,0.30),
      new THREE.Vector3(0.0,2.38,0.18),
      new THREE.Vector3(-0.05,2.50,0.05),
    ];
    tube(svcPts,0.048,'circ_vena_cava_sup','Superior Vena Cava',veinMat());

    
    const ivcPts=[
      new THREE.Vector3(0.0,2.05,0.30),
      new THREE.Vector3(-0.04,1.2,-0.18),
      new THREE.Vector3(-0.04,0.1,-0.18),
      new THREE.Vector3(-0.04,-0.8,-0.18),
    ];
    tube(ivcPts,0.045,'circ_vena_cava_inf','Inferior Vena Cava',veinMat());

    
    for(let s=-1;s<=1;s+=2){
      const pts=[
        new THREE.Vector3(s*0.12,3.10,0.0),
        new THREE.Vector3(s*0.15,2.82,0.02),
        new THREE.Vector3(s*0.08,2.52,0.08),
      ];
      tube(pts,0.025,'circ_jugular','Jugular Vein',veinMat(0.85));
    }

    
    const pvPts=[
      new THREE.Vector3(-0.40,2.10,0.15),
      new THREE.Vector3(-0.20,2.10,0.28),
    ];
    tube(pvPts,0.032,'circ_pulm_vein','Pulmonary Vein',veinMat(0.85));
  }

  
  buildDigestive() {
    const SYS = 'digestive';
    const dMat=(color=0xf59e0b,op=0.90)=>this.makeMat(color,0x451a03,0xfde68a,60,op);
    const add=(geo,pos,rot,meshId,name,color=0xf59e0b)=>{
      const m=new THREE.Mesh(geo,dMat(color));
      m.position.set(...pos); m.rotation.set(...rot);
      this.register(m,meshId,name,SYS);
      this.addToSystem(SYS,m); return m;
    };
    const tube=(pts,r,meshId,name,color)=>{
      const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*4,r,8,false);
      return add(geo,[0,0,0],[0,0,0],meshId,name,color);
    };

    
    const esPts=[
      new THREE.Vector3(0,2.80,0.0),new THREE.Vector3(0.02,2.40,-0.05),
      new THREE.Vector3(0.04,1.90,-0.08),new THREE.Vector3(0.04,1.55,0.10),
    ];
    tube(esPts,0.040,'dig_esophagus','Esophagus',0xd97706);

    
    const stomach=add(new THREE.SphereGeometry(0.32,18,18),[-0.18,1.12,0.32],[0,0,0],'dig_stomach','Stomach',0xf59e0b);
    stomach.scale.set(1.3,0.9,0.80);

    
    const duoPts=[
      new THREE.Vector3(0.12,0.82,0.30),new THREE.Vector3(0.32,0.72,0.22),
      new THREE.Vector3(0.38,0.50,0.15),new THREE.Vector3(0.30,0.30,0.10),
    ];
    tube(duoPts,0.042,'dig_duodenum','Duodenum',0xfbbf24);

    
    const liver=add(new THREE.SphereGeometry(0.32,14,14),[0.28,1.20,0.28],[0,0,0],'dig_liver','Liver',0x9a3412);
    liver.scale.set(1.55,0.70,0.90);

    
    add(new THREE.SphereGeometry(0.09,12,12),[0.42,0.85,0.32],[0,0,0],'dig_gallbladder','Gallbladder',0x65a30d);

    
    const panc=add(new THREE.SphereGeometry(0.18,12,12),[0.10,0.68,0.0],[0,0,0],'dig_pancreas','Pancreas',0xe0a020);
    panc.scale.set(1.8,0.55,0.65);

    
    const siPts=[];
    for(let i=0;i<=80;i++){
      const t=i/80; const loop=t*5.5*Math.PI*2; const r=0.40-t*0.08;
      siPts.push(new THREE.Vector3(Math.cos(loop)*r*0.80, 0.22-t*1.30, Math.sin(loop)*r*0.52));
    }
    tube(siPts,0.048,'dig_small_int','Small Intestine',0xfbbf24);

    
    const liPts=[
      new THREE.Vector3(-0.58,-0.05,0.10),new THREE.Vector3(-0.60,0.18,0.05),
      new THREE.Vector3(-0.58,0.52,0.05),new THREE.Vector3(-0.52,0.78,0.04),
      new THREE.Vector3(-0.30,0.90,0.04),new THREE.Vector3(0.0,0.92,0.04),
      new THREE.Vector3(0.30,0.90,0.04),new THREE.Vector3(0.55,0.72,0.04),
      new THREE.Vector3(0.60,0.42,0.05),new THREE.Vector3(0.58,0.10,0.06),
      new THREE.Vector3(0.56,-0.25,0.06),new THREE.Vector3(0.40,-0.80,0.04),
      new THREE.Vector3(0.20,-1.05,0.04),new THREE.Vector3(0.0,-1.12,0.04),
      new THREE.Vector3(-0.20,-1.08,0.04),new THREE.Vector3(-0.32,-0.95,0.05),
      new THREE.Vector3(-0.32,-1.30,0.04),
    ];
    tube(liPts,0.055,'dig_large_int','Large Intestine',0xd97706);

    
    const rectPts=[
      new THREE.Vector3(-0.32,-1.30,0.04),new THREE.Vector3(-0.20,-1.60,-0.02),
      new THREE.Vector3(0,-1.80,-0.05),new THREE.Vector3(0,-2.00,-0.08),
    ];
    tube(rectPts,0.048,'dig_rectum','Rectum',0xb45309);

    
    const kMat=(op=0.92)=>this.makeMat(0x7c3aed,0x2e1065,0xc4b5fd,80,op);
    const kL=new THREE.Mesh(new THREE.SphereGeometry(0.12,16,16),kMat());
    kL.position.set(-0.30,0.62,-0.24);
    kL.scale.set(0.80,1.20,0.60);
    kL.castShadow=true;
    this.register(kL,'organ_kidney_l','Left Kidney',SYS);
    this.addToSystem(SYS,kL);
    const kR=new THREE.Mesh(new THREE.SphereGeometry(0.12,16,16),kMat());
    kR.position.set(0.30,0.62,-0.24);
    kR.scale.set(0.80,1.20,0.60);
    kR.castShadow=true;
    this.register(kR,'organ_kidney_r','Right Kidney',SYS);
    this.addToSystem(SYS,kR);
    
    const urL=[new THREE.Vector3(-0.30,0.55,-0.22),new THREE.Vector3(-0.25,0.10,-0.15),new THREE.Vector3(-0.18,-0.50,-0.10),new THREE.Vector3(-0.10,-1.00,-0.08)];
    const urR=[new THREE.Vector3(0.30,0.55,-0.22),new THREE.Vector3(0.25,0.10,-0.15),new THREE.Vector3(0.18,-0.50,-0.10),new THREE.Vector3(0.10,-1.00,-0.08)];
    const urGeoL=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(urL),12,0.018,6,false);
    const urGeoR=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(urR),12,0.018,6,false);
    const umL=new THREE.Mesh(urGeoL,kMat(0.80)); this.register(umL,'organ_ureter_l','Left Ureter',SYS); this.addToSystem(SYS,umL);
    const umR=new THREE.Mesh(urGeoR,kMat(0.80)); this.register(umR,'organ_ureter_r','Right Ureter',SYS); this.addToSystem(SYS,umR);
    
    const agL=new THREE.Mesh(new THREE.SphereGeometry(0.05,10,10),kMat(0.88)); agL.position.set(-0.30,0.78,-0.24); agL.scale.set(1.2,0.7,0.8);
    this.register(agL,'organ_adrenal_l','Left Adrenal Gland',SYS); this.addToSystem(SYS,agL);
    const agR=new THREE.Mesh(new THREE.SphereGeometry(0.05,10,10),kMat(0.88)); agR.position.set(0.30,0.78,-0.24); agR.scale.set(1.2,0.7,0.8);
    this.register(agR,'organ_adrenal_r','Right Adrenal Gland',SYS); this.addToSystem(SYS,agR);
  }

  
  buildRespiratory() {
    const SYS = 'respiratory';
    const rMat=(color=0x22d3ee,op=0.88)=>this.makeMat(color,0x083344,0xcffafe,80,op);
    const add=(geo,pos,rot,meshId,name,color=0x22d3ee)=>{
      const m=new THREE.Mesh(geo,rMat(color));
      m.position.set(...pos); m.rotation.set(...rot);
      this.register(m,meshId,name,SYS);
      this.addToSystem(SYS,m); return m;
    };
    const tube=(pts,r,meshId,name)=>{
      const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*4,r,8,false);
      return add(geo,[0,0,0],[0,0,0],meshId,name);
    };

    
    add(new THREE.BoxGeometry(0.30,0.15,0.12),[0,3.60,0.30],[0,0,0],'resp_nasal','Nasal Cavity',0x38bdf8);

    
    add(new THREE.CylinderGeometry(0.10,0.10,0.22,12),[0,3.28,0.18],[0.2,0,0],'resp_pharynx','Pharynx',0x38bdf8);
    add(new THREE.CylinderGeometry(0.075,0.09,0.18,12),[0,3.08,0.12],[0.2,0,0],'resp_larynx','Larynx',0x06b6d4);

    
    const trPts=[
      new THREE.Vector3(0,2.94,0.08),new THREE.Vector3(0,2.62,0.05),
      new THREE.Vector3(0,2.20,0.04),new THREE.Vector3(0,1.90,0.05),
    ];
    tube(trPts,0.055,'resp_trachea','Trachea');

    
    const bL=[new THREE.Vector3(0,1.90,0.05),new THREE.Vector3(-0.25,1.78,0.08),new THREE.Vector3(-0.45,1.68,0.10)];
    const bR=[new THREE.Vector3(0,1.90,0.05),new THREE.Vector3(0.25,1.78,0.08),new THREE.Vector3(0.45,1.68,0.10)];
    tube(bL,0.042,'resp_bronchi_l','Left Primary Bronchus',0x06b6d4);
    tube(bR,0.042,'resp_bronchi_r','Right Primary Bronchus',0x06b6d4);

    
    const lLung=add(new THREE.SphereGeometry(0.40,20,20),[-0.46,1.68,0.08],[0,0,0],'resp_l_lung','Left Lung',0x38bdf8);
    lLung.scale.set(0.82,1.48,0.68);
    const rLung=add(new THREE.SphereGeometry(0.40,20,20),[0.46,1.68,0.08],[0,0,0],'resp_r_lung','Right Lung',0x38bdf8);
    rLung.scale.set(0.88,1.52,0.68);
    this.lLung=lLung; this.rLung=rLung;

    
    for(let i=0;i<4;i++){
      const angle=-0.6+i*0.4;
      const pts=[
        new THREE.Vector3(-0.46,1.80+Math.cos(angle)*0.20,0.10),
        new THREE.Vector3(-0.46+Math.sin(angle)*0.28,1.70,0.10),
        new THREE.Vector3(-0.46+Math.sin(angle)*0.36,1.58,0.10),
      ];
      tube(pts,0.018,'resp_bronchioles','Bronchioles',0x0891b2);
    }

    
    for(let i=0;i<6;i++){
      const a=Math.random()*Math.PI*2; const r=0.30;
      const x=-0.46+Math.cos(a)*r*0.6; const y=1.65+Math.sin(a)*r*1.0;
      add(new THREE.SphereGeometry(0.055,8,8),[x,y,0.05],[0,0,0],'resp_alveoli','Alveoli',0x0ea5e9);
    }

    
    const diaphGeo=new THREE.TorusGeometry(0.65,0.05,10,30,Math.PI);
    const diaph=add(diaphGeo,[0,0.95,0],[Math.PI/2,0,0],'resp_diaphragm','Diaphragm',0x0891b2);
    this.diaphragm=diaph;
    
    for(let i=0;i<5;i++){
      const y=2.35-i*0.27;
      add(new THREE.TorusGeometry(0.66,0.018,6,22,Math.PI*1.7),[0,y,0],[-0.1,0,0],'resp_intercostals','Intercostals',0x22d3ee);
    }
  }

  
  buildRootGroupMap()     {}
  updateAnatomyVisibility() {}
  hideAllSystems()        {}
  showSystem()            {}
  toggleSystem()          {}

  async switchSystem(key) {
    if (key !== 'fullBody' && !BioAnatomyData.systems[key]) return;
    this.activeSystem = key;

    
    await this.systemModelManager.loadForSystem(key);

    
    const lightColor = (key === 'fullBody')
      ? 0x00d4ff
      : (BioAnatomyData.systems[key]?.lightColor || 0x00d4ff);
    this.systemLight.color.setHex(lightColor);
    this.keyLight.color.setHex(lightColor);

    
    const sysData = (key === 'fullBody')
      ? { name: 'Full Body', stat1: { value: '—', label: '' }, stat2: { value: '—', label: '' } }
      : BioAnatomyData.systems[key];
    const label  = document.getElementById('active-system-label');
    if (label)  label.textContent  = sysData.name;
    const hudSys = document.getElementById('hud-system');
    if (hudSys) hudSys.textContent = sysData.name;

    const s1v = document.getElementById('info-stat1-value');
    const s1l = document.getElementById('info-stat1-label');
    const s2v = document.getElementById('info-stat2-value');
    const s2l = document.getElementById('info-stat2-label');
    if (s1v) s1v.textContent = sysData.stat1?.value || '';
    if (s1l) s1l.textContent = sysData.stat1?.label || '';
    if (s2v) s2v.textContent = sysData.stat2?.value || '';
    if (s2l) s2l.textContent = sysData.stat2?.label || '';

    if (window.bioAnimations3D) {
      window.bioAnimations3D.switchSystem(key);
    }

    window.dispatchEvent(new CustomEvent('bioSystemChanged', { detail: { system: key } }));
  }

  
  selectMesh(mesh) {
    if (this.selectionManager) {
      if (mesh) {
        this.selectionManager.select(mesh);
      } else {
        this.selectionManager.deselect();
      }
    }
    if (mesh) {
      this.focusOnObject(mesh);
    }
    
    if (this.selectedMesh) {
      if (this.aas) {
        this.aas.setHoverHighlight(this.selectedMesh, false);
      } else {
        const orig = this.selectedMesh.userData.originalColor;
        if (orig !== undefined) this.selectedMesh.material.emissive.setHex(orig);
      }
    }
    this.selectedMesh = mesh;
    if (!mesh) return;

    const sysKey = this.activeSystem;
    const sysData = (sysKey === 'fullBody') ? { name: 'Full Body', color: '#00d4ff' } : BioAnatomyData.systems[sysKey];

    if (this.aas) {
      this.aas.setSelectionHighlight(mesh);
    } else {
      mesh.userData.originalColor = mesh.userData.originalColor || mesh.material.emissive.getHex();
      mesh.material.emissive.setHex(0x00d4ff);
    }

    const organId = mesh.userData.meshId;
    const name = mesh.userData.organName;

    
    const nameEl = document.getElementById('selected-organ-name');
    const sysEl = document.getElementById('selected-organ-system');
    const descEl = document.getElementById('selected-organ-desc');
    const metaEl = document.getElementById('selected-info-meta');
    const typeEl = document.getElementById('meta-type');
    const locEl = document.getElementById('meta-location');
    const funcEl = document.getElementById('meta-function');

    if (nameEl) nameEl.textContent = name;
    if (sysEl) { sysEl.textContent = sysData?.name || ''; sysEl.style.background = (sysData?.color || '#00d4ff') + '22'; sysEl.style.color = sysData?.color || '#00d4ff'; }

    
    const organKey = mesh.userData.meshId?.replace(/bone_|mus_|nerve_|circ_|dig_|resp_/, '');
    
    let meta = null;
    for (const [k, v] of Object.entries(BioAnatomyData.organs || {})) {
      if (name.toLowerCase().includes(k) || k.includes(organKey)) { meta = v; break; }
    }

    if (descEl) descEl.textContent = meta
      ? `${meta.function}.`
      : `${name} is a key structure of the ${sysData?.name || ''}.`;
    if (metaEl) metaEl.style.display = meta ? 'flex' : 'none';
    if (typeEl && meta) typeEl.textContent = meta.type;
    if (locEl && meta) locEl.textContent = meta.location;
    if (funcEl && meta) funcEl.textContent = meta.function;

    
    window.dispatchEvent(new CustomEvent('bioOrganSelected', { detail: { meshId: mesh.userData.meshId, name } }));
  }

  focusOnObject(objects, presetRotY, presetRotX, presetZoom) {
    if (!objects || !this.cameraManager) return;

    
    this.scene.updateMatrixWorld(true);

    const box = new THREE.Box3();
    const arr = Array.isArray(objects) ? objects : [objects];
    
    let validCount = 0;
    arr.forEach(obj => {
      if (obj) {
        const objBox = new THREE.Box3();
        let hasMesh = false;
        obj.traverse(node => {
          if (node.isMesh && node.geometry) {
            
            let isVisible = node.visible;
            let temp = node.parent;
            while (temp && isVisible) {
              if (temp.visible === false) isVisible = false;
              temp = temp.parent;
            }
            if (!isVisible) return;

            
            const activeSystem = this.activeSystem || 'fullBody';
            if (activeSystem !== 'fullBody' && node.userData?.systemKey !== activeSystem) {
              return;
            }

            
            if (this.anatomyContainer) {
              let inHierarchy = false;
              let curr = node;
              while (curr) {
                if (curr === this.anatomyContainer) {
                  inHierarchy = true;
                  break;
                }
                curr = curr.parent;
              }
              if (!inHierarchy) return;
            }

            
            const nameLower = (node.name || '').toLowerCase();
            const userDataNameLower = (node.userData?.organName || '').toLowerCase();
            if (nameLower.endsWith('.t') || userDataNameLower.endsWith('.t') || /\.t$/i.test(node.name)) {
              return;
            }
            const isHelper = /helper|proxy|placeholder|duplicate|copy|temp|ghost|bounds|bbox|collider|marker|anchor|outline|indicator/i.test(nameLower) ||
                             /helper|proxy|placeholder|duplicate|copy|temp|ghost|bounds|bbox|collider|marker|anchor|outline|indicator/i.test(userDataNameLower);
            if (isHelper) return;

            
            const isSegmentOrHelperPart = /segment|surface|border|division|impression|part|area|curvature|wall|pole|hilum|fissure|root|notch/i.test(nameLower) ||
                                          /segment|surface|border|division|impression|part|area|curvature|wall|pole|hilum|fissure|root|notch/i.test(userDataNameLower);
            
            const isMajorOrgan = /liver|lung|kidney|heart|stomach|hepat|renal|gastr|pylor/i.test(nameLower) ||
                                 /liver|lung|kidney|heart|stomach|hepat|renal|gastr|pylor/i.test(userDataNameLower);
            if (isMajorOrgan && isSegmentOrHelperPart) {
              return;
            }

            if (!node.geometry.boundingBox) {
              node.geometry.computeBoundingBox();
            }
            const nodeBox = node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);
            if (!nodeBox.isEmpty()) {
              objBox.union(nodeBox);
              hasMesh = true;
            }
          }
        });

        if (hasMesh && !objBox.isEmpty()) {
          box.union(objBox);
          validCount++;
        }
      }
    });

    if (validCount === 0 || box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const radius = size.length() / 2;

    const aspect    = this.camera.aspect;
    const fov       = this.camera.fov;
    const halfFovRad = (fov * Math.PI / 180) / 2;
    const distVertical = radius / Math.tan(halfFovRad);
    const distHorizontal = aspect < 1 ? radius / (Math.tan(halfFovRad) * aspect) : distVertical;
    const idealDist = Math.max(distVertical, distHorizontal, 0.3) * 1.25;

    const startTarget = this.controls ? this.controls.target.clone() : new THREE.Vector3();
    const endTarget   = center.clone();

    const startCamPos = this.camera.position.clone();
    let endCamPos;

    if (presetRotY !== undefined && presetRotX !== undefined && presetZoom !== undefined) {
      const theta = presetRotY;
      const phi = Math.PI / 2 - presetRotX;
      
      let dist;
      const primaryMesh = arr[0];
      const isLungsOrHeart = primaryMesh && (
        (primaryMesh.name || '').toLowerCase().includes('lung') ||
        (primaryMesh.userData?.organName || '').toLowerCase().includes('lung') ||
        (primaryMesh.name || '').toLowerCase().includes('heart') ||
        (primaryMesh.userData?.organName || '').toLowerCase().includes('heart')
      );

      if (isLungsOrHeart) {
        dist = idealDist;
      } else {
        dist = this.cameraManager
          ? this.cameraManager.getOrbitDistance(presetZoom)
          : 14 / presetZoom;
      }

      endCamPos = new THREE.Vector3(
        dist * Math.sin(phi) * Math.sin(theta),
        dist * Math.cos(phi),
        dist * Math.sin(phi) * Math.cos(theta)
      ).add(endTarget);
    } else {
      
      const offsetVec = this.camera.position.clone().sub(startTarget);
      const dir = offsetVec.lengthSq() > 1e-6 ? offsetVec.normalize() : new THREE.Vector3(0, 0, 1);
      endCamPos = endTarget.clone().addScaledVector(dir, idealDist);
    }

    
    if (isNaN(endTarget.x) || isNaN(endTarget.y) || isNaN(endTarget.z) ||
        isNaN(endCamPos.x) || isNaN(endCamPos.y) || isNaN(endCamPos.z)) {
      console.warn('[focusOnObject] Computed NaN target or camera position. Focus aborted.');
      return;
    }

    
    const modelBox = new THREE.Box3();
    const activeContainer = this.anatomyContainer || this.scene;
    const activeSystem = this.activeSystem || 'fullBody';
    activeContainer.traverse(node => {
      if (node.isMesh && node.geometry) {
        
        if (activeSystem !== 'fullBody' && node.userData?.systemKey && node.userData.systemKey !== activeSystem) {
          return;
        }

        
        const nameLower = (node.name || '').toLowerCase();
        const userDataNameLower = (node.userData?.organName || '').toLowerCase();
        if (nameLower.endsWith('.t') || userDataNameLower.endsWith('.t') || /\.t$/i.test(node.name)) {
          return;
        }
        const isHelper = /helper|proxy|placeholder|duplicate|copy|temp|ghost|bounds|bbox|collider|marker|anchor|outline|indicator/i.test(nameLower) ||
                         /helper|proxy|placeholder|duplicate|copy|temp|ghost|bounds|bbox|collider|marker|anchor|outline|indicator/i.test(userDataNameLower);
        if (isHelper) return;

        const isSegmentOrHelperPart = /segment|surface|border|division|impression|part|area|curvature|wall|pole|hilum|fissure|root|notch/i.test(nameLower) ||
                                      /segment|surface|border|division|impression|part|area|curvature|wall|pole|hilum|fissure|root|notch/i.test(userDataNameLower);
        
        const isMajorOrgan = /liver|lung|kidney|heart|stomach|hepat|renal|gastr|pylor/i.test(nameLower) ||
                             /liver|lung|kidney|heart|stomach|hepat|renal|gastr|pylor/i.test(userDataNameLower);
        if (isMajorOrgan && isSegmentOrHelperPart) {
          return;
        }

        if (!node.geometry.boundingBox) {
          node.geometry.computeBoundingBox();
        }
        const nodeBox = node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);
        if (!nodeBox.isEmpty()) {
          modelBox.union(nodeBox);
        }
      }
    });

    if (!modelBox.isEmpty()) {
      modelBox.expandByScalar(2.0); 
      endCamPos.clamp(modelBox.min, modelBox.max);
      endTarget.clamp(modelBox.min, modelBox.max);
    }

    
    this.targetPivotOffsetX = endTarget.x;
    this.targetPivotOffsetY = endTarget.y;
    this.targetPivotOffsetZ = endTarget.z;

    
    const primaryMesh = arr[0];
    console.log("Raycast Hit: true");
    console.log(`Mesh: ${primaryMesh.name || primaryMesh.userData?.organName || 'Unknown'}`);
    console.log(`Selection: ${primaryMesh.userData?.meshId || primaryMesh.uuid || 'Unknown'}`);
    console.log(`Old Target: (${startTarget.x.toFixed(3)}, ${startTarget.y.toFixed(3)}, ${startTarget.z.toFixed(3)})`);
    console.log(`New Target: (${endTarget.x.toFixed(3)}, ${endTarget.y.toFixed(3)}, ${endTarget.z.toFixed(3)})`);
    console.log(`Camera Start: (${startCamPos.x.toFixed(3)}, ${startCamPos.y.toFixed(3)}, ${startCamPos.z.toFixed(3)})`);
    console.log(`Camera End: (${endCamPos.x.toFixed(3)}, ${endCamPos.y.toFixed(3)}, ${endCamPos.z.toFixed(3)})`);
    console.log(`Animation Duration: 700ms`);

    this.focusAnimation = {
      startTime: performance.now(),
      duration: 700, 
      startTarget,
      endTarget,
      startCamPos,
      endCamPos
    };
  }

  
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    console.log(`[handleClick] NDC=(${this.mouse2D.x.toFixed(3)}, ${this.mouse2D.y.toFixed(3)}) clickableMeshes=${this.clickableMeshes.length}`);

    
    
    
    
    this.raycaster.setFromCamera(this.mouse2D, this.camera);
    const visibleMeshes = this.clickableMeshes.filter(m => {
      let node = m;
      while (node) { if (node.visible === false) return false; node = node.parent; }
      return true;
    });

    console.log(`[handleClick] visibleMeshes=${visibleMeshes.length}`);

    const hits = this.raycaster.intersectObjects(visibleMeshes, false);
    let hit = hits.length > 0 ? hits[0] : null;

    console.log(`[handleClick] raycaster hits=${hits.length}${hit ? ' → ' + (hit.object?.userData?.organName || hit.object?.name || hit.object?.uuid) : ''}`);

    if (hit) {
      this.selectMesh(hit.object);
    } else {
      console.log('[handleClick] No mesh hit — click on empty space, doing nothing.');
    }
  }

  handleHover(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    
    this.raycaster.setFromCamera(this.mouse2D, this.camera);
    const visibleMeshes = this.clickableMeshes.filter(m => {
      let node = m;
      while (node) { if (node.visible === false) return false; node = node.parent; }
      return true;
    });
    const rawHits = this.raycaster.intersectObjects(visibleMeshes, false);
    let hit = rawHits.length > 0 ? rawHits[0] : null;

    const label = document.getElementById('organ-hover-label');
    const nameEl = document.getElementById('organ-hover-name');
    const sysEl = document.getElementById('organ-hover-system');

    if (hit) {
      const mesh = hit.object;
      const sysData = BioAnatomyData.systems[this.activeSystem];

      if (this.selectionManager) {
        this.selectionManager.hover(mesh);
      }

      if (this.aas) {
        this.aas.setHoverHighlight(mesh, true);
        if (this.hoveredMesh && this.hoveredMesh !== mesh) {
          this.aas.setHoverHighlight(this.hoveredMesh, false);
        }
      }
      this.hoveredMesh = mesh;

      if (label) {
        label.style.opacity = '1';
        label.style.left = (e.clientX - rect.left + 16) + 'px';
        label.style.top = (e.clientY - rect.top - 8) + 'px';
      }
      if (nameEl) nameEl.textContent = mesh.userData.organName || '';
      if (sysEl) { sysEl.textContent = sysData?.name || ''; sysEl.style.color = sysData?.color || '#00d4ff'; }
      this.canvas.style.cursor = 'pointer';
    } else {
      if (this.selectionManager) {
        this.selectionManager.unhover();
      }
      if (this.hoveredMesh && this.aas) {
        this.aas.setHoverHighlight(this.hoveredMesh, false);
      }
      this.hoveredMesh = null;

      if (label) label.style.opacity = '0';
      this.canvas.style.cursor = this.isDragging ? 'grabbing' : 'grab';
    }
  }

  
  setOpacity(val) { this.updateSkinOpacity(val); }
  setZoom(val) { 
    this.targetZoom = val / 100;
    this.isFlying = true;
  }
  resetView() {
    
    
    if (this.cameraManager?.defaultState) {
      const cam = this.cameraManager;
      this.focusAnimation = {
        startTime  : performance.now(),
        duration   : 700,
        startTarget: this.controls ? this.controls.target.clone() : new THREE.Vector3(),
        endTarget  : cam.defaultState.target.clone(),
        startCamPos: this.camera.position.clone(),
        endCamPos  : cam.defaultState.position.clone()
      };
      this.selectMesh(null);
      console.log('[resetView] focusAnimation started toward defaultState.');
    } else {
      
      this.targetRotY = 0;
      this.targetRotX = 0.05;
      this.targetZoom = 1;
      this.targetPivotOffsetX = 0;
      this.targetPivotOffsetY = 0;
      this.targetPivotOffsetZ = 0;
      this.isFlying = true;
    }
  }
  setView(view) {
    const v = { full:[0,0.05], anterior:[0,0.05], posterior:[Math.PI,0.05], lateral:[Math.PI/2,0.05] };
    const [ry,rx] = v[view] || [0,0.05];
    this.targetRotY = ry;
    this.targetRotX = rx;
    this.targetPivotOffsetX = 0;
    this.targetPivotOffsetY = 0;
    this.targetPivotOffsetZ = 0;
    this.isFlying = true;
  }

  
  bindEvents() {
    const { canvas } = this;

    
    
    
    
    
    
    let lastClickTime = 0;
    canvas.addEventListener('click', (e) => {
      console.log(`[EVENT] Canvas click: clientX=${e.clientX}, clientY=${e.clientY}`);
      lastClickTime = Date.now();
      this.handleClick(e);
    });

    
    
    
    canvas.addEventListener('mousedown', (e) => {
      console.log(`[EVENT] Canvas mousedown: clientX=${e.clientX}, clientY=${e.clientY}`);
      this.isDragging = true;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;
      canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', (e) => {
      console.log(`[EVENT] Window mouseup: clientX=${e.clientX}, clientY=${e.clientY}, isDragging=${this.isDragging}, prevMouse=(${this.prevMouse.x}, ${this.prevMouse.y})`);
      
      
      if (this.isDragging &&
          Math.abs(e.clientX - this.prevMouse.x) < 5 &&
          Math.abs(e.clientY - this.prevMouse.y) < 5 &&
          Date.now() - lastClickTime > 50) {
        console.log(`[EVENT] Window mouseup triggering handleClick fallback`);
        this.handleClick(e);
      }
      this.isDragging = false;
      canvas.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.prevMouse.x = e.clientX;
        this.prevMouse.y = e.clientY;
      } else {
        this.handleHover(e);
      }
    });

    
    let touchStart = null;
    canvas.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.prevMouse.x = touchStart.x; this.prevMouse.y = touchStart.y;
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      this.prevMouse.x = e.touches[0].clientX; this.prevMouse.y = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchend', (e) => {
      if (touchStart && Math.abs(e.changedTouches[0].clientX - touchStart.x) < 8) {
        this.handleClick({ clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY });
      }
      this.isDragging = false;
    });

    window.addEventListener('resize', BioUtils.debounce(() => {
      if (this.cameraManager) {
        
        
        
        this.cameraManager.updateOnResize();
      } else {
        
        const W = canvas.offsetWidth  || window.innerWidth;
        const H = canvas.offsetHeight || window.innerHeight;
        this.camera.aspect = W / H;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(W, H);
      }
      const W = canvas.offsetWidth  || window.innerWidth;
      const H = canvas.offsetHeight || window.innerHeight;
      this.W = W;
      this.H = H;
    }, 200));
  }

  
  animate() {
    this.time += 0.012;
    const t = this.time;

    if (this.aas) {
      this.aas.tick(t);
    }

    
    if (!this.logFrameCount) this.logFrameCount = 0;
    this.logFrameCount++;
    if (this.logFrameCount % 60 === 0) {
      console.log(`[Diagnostic State] isFlying: ${this.isFlying}, isCinematicActive: ${!!(window.bioCinematic && window.bioCinematic.isTransitioning)}, isTransitioningScale: ${this.isTransitioningScale}, focusAnimation: ${!!this.focusAnimation}, dampingEnabled: ${this.controls ? this.controls.enableDamping : 'no-controls'}`);
    }

    
    if (this.focusAnimation) {
      const elapsed = performance.now() - this.focusAnimation.startTime;
      const progress = Math.min(elapsed / this.focusAnimation.duration, 1.0);
      
      
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      if (this.controls) {
        
        
        const savedDamping = this.controls.enableDamping;
        this.controls.enableDamping = false;

        this.controls.target.lerpVectors(this.focusAnimation.startTarget, this.focusAnimation.endTarget, ease);
        this.camera.position.lerpVectors(this.focusAnimation.startCamPos, this.focusAnimation.endCamPos, ease);
        this.controls.update();

        this.controls.enableDamping = savedDamping;
      } else {
        this.camera.position.lerpVectors(this.focusAnimation.startCamPos, this.focusAnimation.endCamPos, ease);
      }

      if (progress >= 1.0) {
        
        
        if (this.controls) {
          this.controls.target.copy(this.focusAnimation.endTarget);
          this.camera.position.copy(this.focusAnimation.endCamPos);
          this.controls.update();

          
          
          const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
          const dist = offset.length();
          const theta = Math.atan2(offset.x, offset.z);
          const phi   = Math.acos(Math.max(-1, Math.min(1, offset.y / dist)));
          this.targetRotY         = theta;
          this.targetRotX         = Math.PI / 2 - phi;
          this.currentRotY        = theta;
          this.currentRotX        = this.targetRotX;
          this.targetZoom         = this.cameraManager ? this.cameraManager.getZoomFromDistance(dist) : 14 / dist;
          this.zoom               = this.targetZoom;
          this.targetPivotOffsetX = this.controls.target.x;
          this.targetPivotOffsetY = this.controls.target.y;
          this.targetPivotOffsetZ = this.controls.target.z;
          this.currentPivotOffsetY = this.controls.target.y;
        }
        this.focusAnimation = null;
        console.log('[focusAnimation] Complete — camera at target.');
      }
    } else if (this.controls) {
      const isCinematicNavActive = (window.bioCinematic && window.bioCinematic.isTransitioning) || this.isTransitioningScale || this.isFlying;

      if (isCinematicNavActive) {
        
        this.controls.target.y += (this.targetPivotOffsetY - this.controls.target.y) * 0.055;
        this.controls.target.x += (this.targetPivotOffsetX - this.controls.target.x) * 0.055;
        this.controls.target.z += (this.targetPivotOffsetZ - this.controls.target.z) * 0.055;

        
        const theta = this.targetRotY;
        const phi = Math.PI / 2 - this.targetRotX; 
        const dist = this.cameraManager
          ? this.cameraManager.getOrbitDistance(this.targetZoom)
          : 14 / this.targetZoom;

        const targetPos = new THREE.Vector3(
          this.controls.target.x + dist * Math.sin(phi) * Math.sin(theta),
          this.controls.target.y + dist * Math.cos(phi),
          this.controls.target.z + dist * Math.sin(phi) * Math.cos(theta)
        );

        this.camera.position.lerp(targetPos, 0.07);
        this.zoom += (this.targetZoom - this.zoom) * 0.07;
        
        
        this.controls.update();

        
        const posDiff = this.camera.position.distanceTo(targetPos);
        const targetDiff = Math.abs(this.controls.target.y - this.targetPivotOffsetY);
        if (posDiff < 0.08 && targetDiff < 0.02 && !this.isTransitioningScale && !(window.bioCinematic && window.bioCinematic.isTransitioning)) {
          this.isFlying = false;
        }
      } else {
        const oldTargetRotY = this.targetRotY;
        const oldTargetRotX = this.targetRotX;
        const oldTargetZoom = this.targetZoom;

        
        this.controls.update();

        
        const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
        const dist = offset.length();
        this.zoom = this.cameraManager
          ? this.cameraManager.getZoomFromDistance(dist)
          : 14 / dist;
        this.targetZoom = this.zoom;

        const theta = Math.atan2(offset.x, offset.z);
        const phi = Math.acos(Math.max(-1, Math.min(1, offset.y / dist)));

        this.targetRotY = theta;
        this.targetRotX = Math.PI / 2 - phi;
        this.currentRotY = theta;
        this.currentRotX = this.targetRotX;
        this.targetPivotOffsetX = this.controls.target.x;
        this.targetPivotOffsetY = this.controls.target.y;
        this.targetPivotOffsetZ = this.controls.target.z;
        this.currentPivotOffsetY = this.controls.target.y;

        if (Math.abs(oldTargetRotY - this.targetRotY) > 0.01 || Math.abs(oldTargetRotX - this.targetRotX) > 0.01) {
          console.log(`[Camera Overwrite Alert] Explorer3D normal loop overwrote targetRotY from ${oldTargetRotY.toFixed(3)} to ${this.targetRotY.toFixed(3)} and targetRotX from ${oldTargetRotX.toFixed(3)} to ${this.targetRotX.toFixed(3)}!`);
        }

        
        this.pivot.rotation.set(0, 0, 0);
        this.pivot.position.set(0, 0, 0);

        
        const hudRot = document.getElementById('hud-rotation');
        if (hudRot) {
          let deg = BioUtils.toDeg(theta) % 360;
          if (deg < 0) deg += 360;
          hudRot.textContent = `${deg.toFixed(0)}°`;
        }
        const hudZ = document.getElementById('hud-zoom');
        if (hudZ) hudZ.textContent = `${this.zoom.toFixed(1)}×`;
        const zSlider = document.getElementById('zoom-slider');
        if (zSlider) zSlider.value = Math.round(this.zoom * 100);
        const zDisp = document.getElementById('zoom-display');
        if (zDisp) zDisp.textContent = `${this.zoom.toFixed(1)}×`;
      }
    } else {
      
      this.currentRotY += (this.targetRotY - this.currentRotY) * 0.07;
      this.currentRotX += (this.targetRotX - this.currentRotX) * 0.07;
      this.pivot.rotation.y = this.currentRotY;
      this.pivot.rotation.x = this.currentRotX;

      this.currentPivotOffsetY += (this.targetPivotOffsetY - this.currentPivotOffsetY) * 0.055;
      this.pivot.position.y = this.currentPivotOffsetY;

      this.zoom += (this.targetZoom - this.zoom) * 0.07;
      this.camera.position.z = this.cameraManager
        ? this.cameraManager.getOrbitDistance(this.zoom)
        : 14 / this.zoom;
    }

    
    if (!this.isTransitioningScale && window.bioCinematic && window.bioCinematic.activeOrgan) {
      if (this.currentScale === 'organ' && this.zoom > 3.0) {
        this.changeScale('tissue');
      } else if (this.currentScale === 'tissue') {
        if (this.zoom > 3.0) this.changeScale('cell');
        else if (this.zoom < 0.45) this.changeScale('organ');
      } else if (this.currentScale === 'cell') {
        if (this.zoom > 3.0) this.changeScale('dna');
        else if (this.zoom < 0.45) this.changeScale('tissue');
      } else if (this.currentScale === 'dna') {
        if (this.zoom < 0.45) this.changeScale('cell');
      }
    }

    
    if (this.currentScale === 'dna' && this.dnaGroup) {
      this.dnaGroup.rotation.y = 0;
    }

    
    if (window.bioAnimations3D) {
      window.bioAnimations3D.update(t);
    }

    
    this.systemLight.position.set(3, 4, 4);
    this.systemLight.intensity = 3.5;

    
    if (window.bioFocus) window.bioFocus.update(t);

    this.renderer.render(this.scene, this.camera);
    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  
  changeScale(nextScale) {
    if (this.isTransitioningScale || this.currentScale === nextScale) return;
    this.isTransitioningScale = true;

    const flash = () => {
      this.currentScale = nextScale;
      
      const isOrgan = (nextScale === 'organ');
      const isTissue = (nextScale === 'tissue');
      const isCell = (nextScale === 'cell');
      const isDNA = (nextScale === 'dna');

      
      this.updateAnatomyVisibility();

      
      this.tissueGroup.visible = isTissue;
      this.cellGroup.visible = isCell;
      this.dnaGroup.visible = isDNA;

      
      this.clearGroup(this.tissueGroup);
      this.clearGroup(this.cellGroup);
      this.clearGroup(this.dnaGroup);

      
      this.targetRotY = 0;
      this.targetRotX = 0.05;
      this.targetPivotOffsetY = 0;

      
      const organKey = window.bioCinematic?.activeOrgan || 'heart';

      
      if (isTissue) {
        this.buildTissue(organKey);
      } else if (isCell) {
        this.buildCell(organKey);
      } else if (isDNA) {
        this.buildDNA(organKey);
      }

      
      const scaleLevels = { organ: 2, tissue: 3, cell: 4, dna: 5 };
      if (window.bioCinematic) {
        window.bioCinematic.zoomTransition(scaleLevels[nextScale]);
      }

      
      if (window.bioAnimations3D) {
        window.bioAnimations3D.updateVitalsLabels(this.activeSystem);
      }
    };

    if (window.bioCinematic) {
      const scaleLevels = { organ: 2, tissue: 3, cell: 4, dna: 5 };
      const currentLevel = scaleLevels[this.currentScale];
      const nextLevel = scaleLevels[nextScale];
      const goingDeeper = nextLevel > currentLevel;

      window.bioCinematic._cinTransition(() => {
        flash();
        this.targetZoom = 1.0;
        this.zoom = goingDeeper ? 0.52 : 2.75;
        
        
        const zsl = document.getElementById('zoom-slider');
        const zdv = document.getElementById('zoom-display');
        if (zsl) zsl.value = 100;
        if (zdv) zdv.textContent = '1.0\u00d7';
      });
    } else {
      flash();
    }

    setTimeout(() => {
      this.isTransitioningScale = false;
    }, 450);
  }

  clearGroup(group) {
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
  }

  buildTissue(organKey) {
    if (organKey === 'heart') {
      
      for (let i = -1; i <= 1; i++) {
        const cylinderGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.5, 16);
        const mat = new THREE.MeshPhongMaterial({
          color: 0xd84b60,
          emissive: 0x3d0d14,
          specular: 0xffffff,
          shininess: 60,
          transparent: true,
          opacity: 0.88
        });
        const fiber = new THREE.Mesh(cylinderGeo, mat);
        fiber.rotation.z = Math.PI / 2;
        fiber.position.y = i * 0.7;
        this.tissueGroup.add(fiber);

        
        for (let j = -8; j <= 8; j++) {
          const ringGeo = new THREE.TorusGeometry(0.13, 0.012, 6, 16);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0x110204, transparent: true, opacity: 0.7 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = Math.PI / 2;
          ring.position.set(j * 0.25, i * 0.7, 0);
          this.tissueGroup.add(ring);
        }
      }

      
      const branchGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 12);
      const branchMat = new THREE.MeshPhongMaterial({ color: 0xd84b60, emissive: 0x3d0d14, transparent: true, opacity: 0.88 });
      const b1 = new THREE.Mesh(branchGeo, branchMat);
      b1.rotation.z = Math.PI / 4;
      b1.position.set(-0.6, 0.35, 0);
      this.tissueGroup.add(b1);

      const b2 = b1.clone();
      b2.rotation.z = -Math.PI / 4;
      b2.position.set(0.8, -0.35, 0);
      this.tissueGroup.add(b2);

    } else if (organKey === 'brain') {
      
      const nodes = [
        new THREE.Vector3(-1.2, 0.8, 0.2),
        new THREE.Vector3(1.1, 0.9, -0.1),
        new THREE.Vector3(-0.8, -0.6, -0.2),
        new THREE.Vector3(0.9, -0.8, 0.3),
        new THREE.Vector3(0.0, 1.2, 0.1),
        new THREE.Vector3(-1.5, -0.2, 0.4),
        new THREE.Vector3(1.6, -0.1, -0.3),
        new THREE.Vector3(0.1, -0.2, -0.1)
      ];

      const mat = new THREE.MeshPhongMaterial({ color: 0x9333ea, emissive: 0x2e0854, shininess: 80 });
      nodes.forEach(pos => {
        const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 1), mat);
        mesh.position.copy(pos);
        this.tissueGroup.add(mesh);
      });

      const lineMat = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.4 });
      const connections = [
        [0, 4], [0, 5], [0, 7], [1, 4], [1, 6], [1, 7],
        [2, 5], [2, 7], [3, 6], [3, 7], [4, 7], [5, 7]
      ];
      connections.forEach(([f, t]) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([nodes[f], nodes[t]]);
        this.tissueGroup.add(new THREE.Line(lineGeo, lineMat));
      });

    } else if (organKey === 'lungs') {
      
      const lungMat = new THREE.MeshPhongMaterial({ color: 0x22d3ee, emissive: 0x083344, transparent: true, opacity: 0.22, shininess: 90 });
      const alveoliPos = [
        new THREE.Vector3(-0.6, 0.4, 0),
        new THREE.Vector3(0.6, 0.4, 0.1),
        new THREE.Vector3(-0.5, -0.6, -0.1),
        new THREE.Vector3(0.5, -0.6, 0.2),
        new THREE.Vector3(0.0, 0.0, -0.2)
      ];
      alveoliPos.forEach((pos, idx) => {
        const alveolus = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), lungMat);
        alveolus.position.copy(pos);
        this.tissueGroup.add(alveolus);

        
        const wireMat = new THREE.MeshBasicMaterial({
          color: idx % 2 === 0 ? 0xef4444 : 0x3b82f6,
          wireframe: true,
          transparent: true,
          opacity: 0.12
        });
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.58, 12, 12), wireMat);
        cap.position.copy(pos);
        this.tissueGroup.add(cap);
      });

    } else {
      
      const hexMat = new THREE.MeshPhongMaterial({ color: 0xf59e0b, emissive: 0x451a03, transparent: true, opacity: 0.25, shininess: 50, side: THREE.DoubleSide });
      const width = 0.5;
      const height = Math.sqrt(3) * width / 2;

      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          const xOffset = x * width * 1.5;
          const yOffset = y * height * 2 + (Math.abs(x) % 2) * height;

          const hex = new THREE.Mesh(new THREE.RingGeometry(width * 0.85, width, 6), hexMat);
          hex.position.set(xOffset, yOffset, 0);
          this.tissueGroup.add(hex);

          
          const nuc = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x7c2d12, transparent: true, opacity: 0.6 })
          );
          nuc.position.set(xOffset, yOffset, 0.02);
          this.tissueGroup.add(nuc);
        }
      }
    }
  }

  buildCell(organKey) {
    const isBrain = (organKey === 'brain');
    
    if (isBrain) {
      
      const cellMat = new THREE.MeshPhongMaterial({ color: 0xa855f7, emissive: 0x2e1065, transparent: true, opacity: 0.22, shininess: 100 });
      const soma = new THREE.Mesh(new THREE.IcosahedronGeometry(0.52, 1), cellMat);
      soma.position.set(-1.0, 0, 0);
      this.cellGroup.add(soma);

      const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.20, 16, 16), new THREE.MeshPhongMaterial({ color: 0x7c3aed, emissive: 0x1e003b }));
      nucleus.position.set(-1.0, 0, 0);
      this.cellGroup.add(nucleus);

      
      const axon = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 12), cellMat);
      axon.rotation.z = Math.PI / 2;
      axon.position.set(0.1, 0, 0);
      this.cellGroup.add(axon);

      
      for (let i = 0; i < 3; i++) {
        const ms = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12),
          new THREE.MeshPhongMaterial({ color: 0xeab308, emissive: 0x422006, transparent: true, opacity: 0.7 })
        );
        ms.rotation.z = Math.PI / 2;
        ms.position.set(-0.4 + i * 0.6, 0, 0);
        this.cellGroup.add(ms);
      }
    } else {
      
      const color = (organKey === 'heart') ? 0xf43f5e : 0x00d4ff;
      const emissive = (organKey === 'heart') ? 0x3b0712 : 0x002d44;
      
      const cellGeo = (organKey === 'heart') ? new THREE.BoxGeometry(1.6, 1.2, 2.6) : new THREE.SphereGeometry(0.9, 24, 24);
      const cellMat = new THREE.MeshPhongMaterial({ color, emissive, transparent: true, opacity: 0.16, shininess: 100 });
      const cell = new THREE.Mesh(cellGeo, cellMat);
      this.cellGroup.add(cell);

      const wire = new THREE.Mesh(cellGeo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.10 }));
      this.cellGroup.add(wire);

      
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 20, 20),
        new THREE.MeshPhongMaterial({ color: 0x7b2fff, emissive: 0x220044 })
      );
      nucleus.position.set(-0.2, 0, 0);
      this.cellGroup.add(nucleus);

      
      for (let i = 0; i < 4; i++) {
        const og = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.09, 0.25, 12),
          new THREE.MeshPhongMaterial({ color: 0xf97316, emissive: 0x431407 })
        );
        og.position.set(0.3 + (i % 2) * 0.3, -0.3 + Math.floor(i / 2) * 0.6, -0.4 + i * 0.25);
        og.rotation.x = Math.PI / 4;
        og.rotation.z = Math.PI / 6;
        this.cellGroup.add(og);
      }
    }
  }

  buildDNA(organKey) {
    
    let sysColor = 0x00ffa3; 
    if (organKey === 'heart') sysColor = 0xef4444;
    else if (organKey === 'brain') sysColor = 0xa855f7;
    else if (organKey === 'lungs') sysColor = 0x22d3ee;
    else if (organKey === 'liver' || organKey === 'stomach') sysColor = 0xf59e0b;
    else if (organKey === 'kidneys') sysColor = 0x8b5cf6;

    const rungsGroup = new THREE.Group();
    rungsGroup.name = 'rungs';
    this.dnaGroup.add(rungsGroup);

    const points1 = [];
    const points2 = [];

    const height = 4.5;
    const coils = 2.5;
    const radius = 0.65;
    const steps = 45;

    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const angle = ratio * Math.PI * 2 * coils;
      const y = -height / 2 + ratio * height;

      const p1 = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      const p2 = new THREE.Vector3(-Math.cos(angle) * radius, y, -Math.sin(angle) * radius);

      points1.push(p1);
      points2.push(p2);

      
      const nodeMat = new THREE.MeshPhongMaterial({ color: sysColor, emissive: 0x0a1a10 });
      const node1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), nodeMat);
      node1.position.copy(p1);
      this.dnaGroup.add(node1);

      const node2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), nodeMat);
      node2.position.copy(p2);
      this.dnaGroup.add(node2);

      
      if (i % 2 === 0 && i > 0 && i < steps) {
        const isAT = (i / 2) % 2 === 0;
        const rungColor1 = isAT ? 0x10b981 : 0x3b82f6; 
        const rungColor2 = isAT ? 0xef4444 : 0xf59e0b; 

        const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const drawHalf = (start, end, col) => {
          const dir = new THREE.Vector3().subVectors(end, start);
          const len = dir.length();
          const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.018, len, 8),
            new THREE.MeshPhongMaterial({ color: col, emissive: 0x050505 })
          );
          mesh.position.addVectors(start, end).multiplyScalar(0.5);
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
          rungsGroup.add(mesh);
        };

        drawHalf(p1, midpoint, rungColor1);
        drawHalf(midpoint, p2, rungColor2);
      }
    }

    
    const railMat = new THREE.MeshPhongMaterial({ color: sysColor, emissive: 0x111111, shininess: 120 });
    this.dnaGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points1), 50, 0.03, 8, false), railMat));
    this.dnaGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points2), 50, 0.03, 8, false), railMat));
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.renderer.dispose();
  }
}

window.Explorer3D = Explorer3D;
