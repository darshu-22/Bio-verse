





'use strict';

class BioAnimations3D {
  constructor() {
    this.explorer = null;
    this.time = 0;
    this.activeSystem = 'skeletal';

    
    this.circGroup = new THREE.Group();
    this.respGroup = new THREE.Group();
    this.nervGroup = new THREE.Group();
    this.digGroup = new THREE.Group();
    this.immuneGroup = new THREE.Group();

    
    this.vitalsPanel = null;
    this.vitalsCanvas = null;
    this.vitalsCtx = null;
    this.chartData = [];
    this.chartWidth = 340;
    this.chartHeight = 90;

    
    this.initPaths();
    this.initCirculatory();
    this.initRespiratory();
    this.initNervous();
    this.initDigestive();
  }

  


  bind(explorer) {
    this.explorer = explorer;
    
    
    this.switchSystem(this.explorer.activeSystem || 'skeletal');
    this.initVitalsUI();
  }

  


  initPaths() {
    this.curves = {
      
      aorta: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.05, 2.10, 0.40),
        new THREE.Vector3(-0.05, 2.42, 0.32),
        new THREE.Vector3(0, 2.52, 0.20),
        new THREE.Vector3(0.14, 2.52, 0.05),
        new THREE.Vector3(0.08, 2.40, -0.12),
        new THREE.Vector3(0.04, 2.0, -0.18),
        new THREE.Vector3(0.04, 1.0, -0.20),
        new THREE.Vector3(0.04, 0.0, -0.20),
        new THREE.Vector3(0.04, -0.80, -0.20)
      ]),
      pulm_art: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.12, 2.05, 0.40),
        new THREE.Vector3(-0.28, 2.20, 0.35),
        new THREE.Vector3(-0.40, 2.10, 0.25)
      ]),
      carotid_l: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.04, 2.52, 0.05),
        new THREE.Vector3(-0.10, 2.80, -0.05),
        new THREE.Vector3(-0.12, 3.15, -0.02)
      ]),
      carotid_r: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.04, 2.52, 0.05),
        new THREE.Vector3(0.10, 2.80, -0.05),
        new THREE.Vector3(0.12, 3.15, -0.02)
      ]),
      brachial_l: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.50, 2.45, 0.05),
        new THREE.Vector3(-0.90, 2.10, 0),
        new THREE.Vector3(-1.30, 1.25, 0),
        new THREE.Vector3(-1.60, 0.60, 0)
      ]),
      brachial_r: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.50, 2.45, 0.05),
        new THREE.Vector3(0.90, 2.10, 0),
        new THREE.Vector3(1.30, 1.25, 0),
        new THREE.Vector3(1.60, 0.60, 0)
      ]),
      femoral_l: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.14, -0.05, -0.15),
        new THREE.Vector3(-0.30, -0.5, 0.05),
        new THREE.Vector3(-0.32, -1.2, 0.05),
        new THREE.Vector3(-0.32, -2.1, 0.05)
      ]),
      femoral_r: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.14, -0.05, -0.15),
        new THREE.Vector3(0.30, -0.5, 0.05),
        new THREE.Vector3(0.32, -1.2, 0.05),
        new THREE.Vector3(0.32, -2.1, 0.05)
      ]),

      
      svc: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.05, 2.50, 0.05),
        new THREE.Vector3(0.0, 2.38, 0.18),
        new THREE.Vector3(0.0, 2.10, 0.30)
      ]),
      ivc: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.04, -0.8, -0.18),
        new THREE.Vector3(-0.04, 0.1, -0.18),
        new THREE.Vector3(-0.04, 1.2, -0.18),
        new THREE.Vector3(0.0, 2.05, 0.30)
      ]),
      jugular_l: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.12, 3.10, 0.0),
        new THREE.Vector3(-0.15, 2.82, 0.02),
        new THREE.Vector3(-0.08, 2.52, 0.08)
      ]),
      jugular_r: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.12, 3.10, 0.0),
        new THREE.Vector3(0.15, 2.82, 0.02),
        new THREE.Vector3(0.08, 2.52, 0.08)
      ]),
      pulm_vein: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.40, 2.10, 0.15),
        new THREE.Vector3(-0.20, 2.10, 0.28)
      ]),

      
      trachea: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2.94, 0.08),
        new THREE.Vector3(0, 2.62, 0.05),
        new THREE.Vector3(0, 2.20, 0.04),
        new THREE.Vector3(0, 1.90, 0.05)
      ]),
      bronchus_l: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.90, 0.05),
        new THREE.Vector3(-0.25, 1.78, 0.08),
        new THREE.Vector3(-0.45, 1.68, 0.10)
      ]),
      bronchus_r: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.90, 0.05),
        new THREE.Vector3(0.25, 1.78, 0.08),
        new THREE.Vector3(0.45, 1.68, 0.10)
      ]),

      
      spinal_cord: (function() {
        const pts = [];
        for (let i = 0; i <= 28; i++) {
          const t = i / 28;
          pts.push(new THREE.Vector3(Math.sin(t * 2) * 0.03, 2.74 - t * 5.2, -0.18));
        }
        return new THREE.CatmullRomCurve3(pts);
      })(),
      brachial_plexus_l: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2.3, -0.15),
        new THREE.Vector3(-0.52, 2.15, -0.05),
        new THREE.Vector3(-0.90, 2.0, 0),
        new THREE.Vector3(-1.28, 1.20, 0)
      ]),
      brachial_plexus_r: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2.3, -0.15),
        new THREE.Vector3(0.52, 2.15, -0.05),
        new THREE.Vector3(0.90, 2.0, 0),
        new THREE.Vector3(1.28, 1.20, 0)
      ]),
      sciatic_l: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.2, -0.15),
        new THREE.Vector3(-0.24, 0.0, -0.1),
        new THREE.Vector3(-0.32, -0.6, -0.05),
        new THREE.Vector3(-0.32, -1.4, 0),
        new THREE.Vector3(-0.32, -2.4, 0)
      ]),
      sciatic_r: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.2, -0.15),
        new THREE.Vector3(0.24, 0.0, -0.1),
        new THREE.Vector3(0.32, -0.6, -0.05),
        new THREE.Vector3(0.32, -1.4, 0),
        new THREE.Vector3(0.32, -2.4, 0)
      ]),

      
      esophagus: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2.80, 0.0),
        new THREE.Vector3(0.02, 2.40, -0.05),
        new THREE.Vector3(0.04, 1.90, -0.08),
        new THREE.Vector3(0.04, 1.55, 0.10)
      ]),
      duodenum: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.12, 0.82, 0.30),
        new THREE.Vector3(0.32, 0.72, 0.22),
        new THREE.Vector3(0.38, 0.50, 0.15),
        new THREE.Vector3(0.30, 0.30, 0.10)
      ]),
      small_int: (function() {
        const pts = [];
        for (let i = 0; i <= 80; i++) {
          const t = i / 80;
          const loop = t * 6.5 * Math.PI * 2;
          const r = 0.35 - t * 0.08;
          pts.push(new THREE.Vector3(Math.cos(loop) * r * 0.82, 0.22 - t * 1.30, Math.sin(loop) * r * 0.52));
        }
        return new THREE.CatmullRomCurve3(pts);
      })(),
      large_int: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.58, -0.05, 0.10),
        new THREE.Vector3(-0.60, 0.18, 0.05),
        new THREE.Vector3(-0.58, 0.52, 0.05),
        new THREE.Vector3(-0.52, 0.78, 0.04),
        new THREE.Vector3(-0.30, 0.90, 0.04),
        new THREE.Vector3(0.0, 0.92, 0.04),
        new THREE.Vector3(0.30, 0.90, 0.04),
        new THREE.Vector3(0.55, 0.72, 0.04),
        new THREE.Vector3(0.60, 0.42, 0.05),
        new THREE.Vector3(0.58, 0.10, 0.06),
        new THREE.Vector3(0.56, -0.25, 0.06),
        new THREE.Vector3(0.40, -0.80, 0.04),
        new THREE.Vector3(0.20, -1.05, 0.04),
        new THREE.Vector3(0.0, -1.12, 0.04),
        new THREE.Vector3(-0.20, -1.08, 0.04),
        new THREE.Vector3(-0.32, -0.95, 0.05),
        new THREE.Vector3(-0.32, -1.30, 0.04)
      ]),
      rectum: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.32, -1.30, 0.04),
        new THREE.Vector3(-0.20, -1.60, -0.02),
        new THREE.Vector3(0, -1.80, -0.05),
        new THREE.Vector3(0, -2.00, -0.08)
      ])
    };
  }

  


  initCirculatory() {
    const count = 180;
    this.circParticles = [];

    const redCurves = ['aorta', 'pulm_art', 'carotid_l', 'carotid_r', 'brachial_l', 'brachial_r', 'femoral_l', 'femoral_r'];
    const blueCurves = ['svc', 'ivc', 'jugular_l', 'jugular_r', 'pulm_vein'];

    
    for (let i = 0; i < count; i++) {
      const isRed = Math.random() < 0.65;
      const curveList = isRed ? redCurves : blueCurves;
      const curveName = curveList[Math.floor(Math.random() * curveList.length)];
      
      this.circParticles.push({
        curve: this.curves[curveName],
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        isRed: isRed,
        offset: Math.random() * 0.05 
      });
    }

    
    this.circGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    this.circGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.circGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);

    const circMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.90,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.circPoints = new THREE.Points(this.circGeometry, circMaterial);
    this.circGroup.add(this.circPoints);
  }

  updateCirculatory(t, dt) {
    const positions = this.circGeometry.attributes.position.array;
    const colors = this.circGeometry.attributes.color.array;

    
    const beatCycle = (t * 1.3) % 1.0;
    let surge = 1.0;
    let heartScale = 1.0;
    let heartEmissive = 0.0;

    if (beatCycle < 0.14) {
      
      heartScale = 1.0 + Math.sin((beatCycle / 0.14) * Math.PI) * 0.06;
      heartEmissive = 0.25;
      surge = 1.3;
    } else if (beatCycle >= 0.18 && beatCycle < 0.43) {
      
      const ratio = (beatCycle - 0.18) / 0.25;
      heartScale = 1.0 + Math.sin(ratio * Math.PI) * 0.17;
      heartEmissive = 0.95;
      
      surge = 1.0 + Math.sin(ratio * Math.PI) * 3.4;
    } else {
      
      surge = 0.7;
    }

    
    if (this.explorer && this.explorer.heartMesh) {
      const hOrig = this.explorer.heartMesh.userData.originalScale || new THREE.Vector3(1, 1, 1);
      this.explorer.heartMesh.scale.copy(hOrig).multiplyScalar(heartScale);
      
      this.explorer.heartMesh.material.emissive.setRGB(
        heartEmissive * 0.92,
        heartEmissive * 0.15,
        heartEmissive * 0.18
      );
    }

    
    for (let i = 0; i < this.circParticles.length; i++) {
      const p = this.circParticles[i];
      
      
      
      
      
      
      
      const speedSurge = p.isRed ? surge : 1.0; 
      p.t += p.speed * speedSurge * dt * 60;
      if (p.t > 1.0) p.t = 0.0;

      const pos = p.curve.getPointAt(p.t);
      
      
      positions[i * 3] = pos.x + Math.sin(t * 8 + i) * 0.015;
      positions[i * 3 + 1] = pos.y + Math.cos(t * 8 + i) * 0.015;
      positions[i * 3 + 2] = pos.z + Math.sin(t * 5 + i) * 0.015;

      
      if (p.isRed) {
        colors[i * 3] = 0.98;     
        colors[i * 3 + 1] = 0.10; 
        colors[i * 3 + 2] = 0.22; 
      } else {
        colors[i * 3] = 0.05;     
        colors[i * 3 + 1] = 0.48; 
        colors[i * 3 + 2] = 0.98; 
      }
    }

    this.circGeometry.attributes.position.needsUpdate = true;
    this.circGeometry.attributes.color.needsUpdate = true;
  }

  


  initRespiratory() {
    const count = 120;
    this.respParticles = [];

    for (let i = 0; i < count; i++) {
      this.respParticles.push({
        t: Math.random(),
        speed: 0.005 + Math.random() * 0.006,
        isLeft: Math.random() < 0.5,
        offsetY: Math.random() * 0.02
      });
    }

    this.respGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.respGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.respGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);

    const respMaterial = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.respPoints = new THREE.Points(this.respGeometry, respMaterial);
    this.respGroup.add(this.respPoints);
  }

  updateRespiratory(t, dt) {
    const positions = this.respGeometry.attributes.position.array;
    const colors = this.respGeometry.attributes.color.array;

    
    const breathCycle = Math.sin(t * 1.3); 
    const lungScale = 1.0 + breathCycle * 0.075;

    
    if (this.explorer && this.explorer.lLung && this.explorer.rLung) {
      const lOrig = this.explorer.lLung.userData.originalScale || new THREE.Vector3(1, 1, 1);
      const rOrig = this.explorer.rLung.userData.originalScale || new THREE.Vector3(1, 1, 1);
      this.explorer.lLung.scale.copy(lOrig).multiplyScalar(lungScale);
      this.explorer.rLung.scale.copy(rOrig).multiplyScalar(lungScale);
      if (this.explorer.diaphragm) {
        const dOrigPos = this.explorer.diaphragm.userData.originalPosition || new THREE.Vector3(0, 0.95, 0);
        this.explorer.diaphragm.position.copy(dOrigPos);
        this.explorer.diaphragm.position.y += (1 - lungScale) * 0.05;
      }
    }

    
    const isInhaling = breathCycle > 0;

    for (let i = 0; i < this.respParticles.length; i++) {
      const p = this.respParticles[i];

      
      if (isInhaling) {
        p.t += p.speed * dt * 60;
        if (p.t > 1.0) p.t = 0.0;
      } else {
        p.t -= p.speed * dt * 60;
        if (p.t < 0.0) p.t = 1.0;
      }

      
      
      
      let pos;
      if (p.t <= 0.4) {
        const subT = p.t / 0.4;
        pos = this.curves.trachea.getPointAt(subT);
      } else {
        const subT = (p.t - 0.4) / 0.6;
        const curve = p.isLeft ? this.curves.bronchus_l : this.curves.bronchus_r;
        pos = curve.getPointAt(subT);
      }

      positions[i * 3] = pos.x + Math.sin(t * 4 + i) * 0.02;
      positions[i * 3 + 1] = pos.y + p.offsetY;
      positions[i * 3 + 2] = pos.z + Math.cos(t * 4 + i) * 0.02;

      
      
      
      if (isInhaling) {
        colors[i * 3] = 0.0;     
        colors[i * 3 + 1] = 0.83; 
        colors[i * 3 + 2] = 1.0;  
      } else {
        colors[i * 3] = 0.68;     
        colors[i * 3 + 1] = 0.25; 
        colors[i * 3 + 2] = 0.88; 
      }
    }

    this.respGeometry.attributes.position.needsUpdate = true;
    this.respGeometry.attributes.color.needsUpdate = true;
  }

  


  initNervous() {
    
    const sparkCount = 35;
    this.brainSparks = [];
    for (let i = 0; i < sparkCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.random() * 0.42;

      this.brainSparks.push({
        x: Math.sin(phi) * Math.cos(theta) * r,
        y: 3.5 + Math.sin(phi) * Math.sin(theta) * r * 0.8,
        z: Math.cos(phi) * r * 0.85,
        flashSpeed: 6.0 + Math.random() * 8.0,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.brainGeometry = new THREE.BufferGeometry();
    const bPositions = new Float32Array(sparkCount * 3);
    const bColors = new Float32Array(sparkCount * 3);
    this.brainGeometry.setAttribute('position', new THREE.BufferAttribute(bPositions, 3));
    this.brainGeometry.setAttribute('color', new THREE.BufferAttribute(bColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    this.brainPoints = new THREE.Points(this.brainGeometry, sparkMat);
    this.nervGroup.add(this.brainPoints);

    
    const signalCount = 6;
    this.nerveSignals = [];
    const pathways = ['spinal_cord', 'brachial_plexus_l', 'brachial_plexus_r', 'sciatic_l', 'sciatic_r'];

    for (let i = 0; i < signalCount; i++) {
      this.nerveSignals.push({
        curve: this.curves[pathways[i % pathways.length]],
        t: Math.random(),
        speed: 0.015 + Math.random() * 0.010,
        trail: [] 
      });
    }

    
    
    this.signalGeometry = new THREE.BufferGeometry();
    const sPositions = new Float32Array(signalCount * 5 * 3); 
    const sColors = new Float32Array(signalCount * 5 * 3);
    this.signalGeometry.setAttribute('position', new THREE.BufferAttribute(sPositions, 3));
    this.signalGeometry.setAttribute('color', new THREE.BufferAttribute(sColors, 3));

    const signalMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    this.signalPoints = new THREE.Points(this.signalGeometry, signalMat);
    this.nervGroup.add(this.signalPoints);
  }

  updateNervous(t, dt) {
    
    const bPositions = this.brainGeometry.attributes.position.array;
    const bColors = this.brainGeometry.attributes.color.array;

    for (let i = 0; i < this.brainSparks.length; i++) {
      const s = this.brainSparks[i];
      bPositions[i * 3] = s.x;
      bPositions[i * 3 + 1] = s.y;
      bPositions[i * 3 + 2] = s.z;

      
      const flash = Math.sin(t * s.flashSpeed + s.phase) * 0.5 + 0.5;
      const isExtreme = flash > 0.85; 

      bColors[i * 3] = isExtreme ? 1.0 : 0.65 * flash;      
      bColors[i * 3 + 1] = isExtreme ? 1.0 : 0.30 * flash;  
      bColors[i * 3 + 2] = 1.0;                            
    }
    this.brainGeometry.attributes.position.needsUpdate = true;
    this.brainGeometry.attributes.color.needsUpdate = true;

    
    const sPositions = this.signalGeometry.attributes.position.array;
    const sColors = this.signalGeometry.attributes.color.array;

    let index = 0;
    for (let i = 0; i < this.nerveSignals.length; i++) {
      const s = this.nerveSignals[i];
      
      
      s.t += s.speed * dt * 60;
      if (s.t > 1.0) s.t = 0.0;

      const pos = s.curve.getPointAt(s.t);
      
      
      s.trail.unshift(pos.clone()); 
      if (s.trail.length > 5) s.trail.pop(); 

      
      for (let j = 0; j < 5; j++) {
        const trailPos = s.trail[j] || pos;
        const opacity = 1.0 - (j * 0.22); 

        sPositions[index * 3] = trailPos.x;
        sPositions[index * 3 + 1] = trailPos.y;
        sPositions[index * 3 + 2] = trailPos.z;

        
        if (j === 0) {
          sColors[index * 3] = 1.0;
          sColors[index * 3 + 1] = 1.0;
          sColors[index * 3 + 2] = 1.0;
        } else {
          sColors[index * 3] = 0.68 * opacity;
          sColors[index * 3 + 1] = 0.15 * opacity;
          sColors[index * 3 + 2] = 0.98 * opacity;
        }

        index++;
      }
    }

    this.signalGeometry.attributes.position.needsUpdate = true;
    this.signalGeometry.attributes.color.needsUpdate = true;
  }

  


  initDigestive() {
    
    const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0xffa500,
      emissive: 0xff4f00,
      specular: 0xffffff,
      shininess: 120,
      transparent: true,
      opacity: 0.95
    });

    this.foodBolus = new THREE.Mesh(sphereGeo, sphereMat);
    this.digGroup.add(this.foodBolus);

    
    
    this.bolusState = {
      phase: 0,
      t: 0.0,
      churnTime: 0.0,
      speed: 0.002
    };

    
    this.nutrients = [];
    this.nutrientGeometry = new THREE.BufferGeometry();
    
    
    this.maxNutrients = 50;
    this.nPositions = new Float32Array(this.maxNutrients * 3);
    this.nColors = new Float32Array(this.maxNutrients * 3);
    
    this.nutrientGeometry.setAttribute('position', new THREE.BufferAttribute(this.nPositions, 3));
    this.nutrientGeometry.setAttribute('color', new THREE.BufferAttribute(this.nColors, 3));

    const nMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.nutrientPoints = new THREE.Points(this.nutrientGeometry, nMaterial);
    this.digGroup.add(this.nutrientPoints);
  }

  updateDigestive(t, dt) {
    const s = this.bolusState;
    let pos = new THREE.Vector3();

    
    switch (s.phase) {
      case 0: 
        s.t += 0.012 * dt * 60;
        if (s.t >= 1.0) {
          s.phase = 1;
          s.t = 0.0;
          s.churnTime = 0.0;
        } else {
          pos.copy(this.curves.esophagus.getPointAt(s.t));
        }
        break;

      case 1: 
        s.churnTime += dt;
        if (s.churnTime >= 3.2) {
          s.phase = 2;
          s.t = 0.0;
        } else {
          
          const angle = s.churnTime * 5.0;
          pos.set(
            -0.18 + Math.cos(angle) * 0.12,
            1.12 + Math.sin(s.churnTime * 3.0) * 0.06,
            0.32 + Math.sin(angle) * 0.08
          );
        }
        break;

      case 2: 
        s.t += 0.0035 * dt * 60;
        if (s.t >= 1.0) {
          s.phase = 3;
          s.t = 0.0;
        } else {
          
          
          if (s.t < 0.15) {
            pos.copy(this.curves.duodenum.getPointAt(s.t / 0.15));
          } else {
            pos.copy(this.curves.small_int.getPointAt((s.t - 0.15) / 0.85));
          }

          
          if (Math.random() < 0.25) {
            this.emitNutrient(pos);
          }
        }
        break;

      case 3: 
        s.t += 0.0055 * dt * 60;
        if (s.t >= 1.0) {
          s.phase = 4;
          s.t = 0.0;
        } else {
          pos.copy(this.curves.large_int.getPointAt(s.t));
        }
        break;

      case 4: 
        s.t += 0.015 * dt * 60;
        if (s.t >= 1.0) {
          s.phase = 0; 
          s.t = 0.0;
        } else {
          pos.copy(this.curves.rectum.getPointAt(s.t));
        }
        break;
    }

    
    this.foodBolus.position.copy(pos);

    
    const pulseFactor = 0.8 + Math.sin(t * 8) * 0.25;
    this.foodBolus.material.emissive.setRGB(1.0 * pulseFactor, 0.45 * pulseFactor, 0.0);

    
    this.updateNutrients(dt);
  }

  emitNutrient(startPos) {
    
    if (this.nutrients.length >= this.maxNutrients) {
      this.nutrients.shift();
    }

    
    const angle = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const speed = 0.012 + Math.random() * 0.015;

    const vel = new THREE.Vector3(
      Math.sin(phi) * Math.cos(angle),
      Math.sin(phi) * Math.sin(angle) * 0.6,
      Math.cos(phi)
    ).normalize().multiplyScalar(speed);

    this.nutrients.push({
      pos: startPos.clone(),
      vel: vel,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.03
    });
  }

  updateNutrients(dt) {
    const posArray = this.nutrientGeometry.attributes.position.array;
    const colArray = this.nutrientGeometry.attributes.color.array;

    
    posArray.fill(0);
    colArray.fill(0);

    for (let i = 0; i < this.nutrients.length; i++) {
      const n = this.nutrients[i];
      n.pos.add(n.vel);
      n.life -= n.decay * dt * 60;

      if (n.life > 0) {
        posArray[i * 3] = n.pos.x;
        posArray[i * 3 + 1] = n.pos.y;
        posArray[i * 3 + 2] = n.pos.z;

        
        colArray[i * 3] = 0.0 * n.life;     
        colArray[i * 3 + 1] = 0.95 * n.life; 
        colArray[i * 3 + 2] = 0.45 * n.life; 
      }
    }

    
    this.nutrients = this.nutrients.filter(n => n.life > 0);

    this.nutrientGeometry.attributes.position.needsUpdate = true;
    this.nutrientGeometry.attributes.color.needsUpdate = true;
  }

  


  initVitalsUI() {
    this.vitalsPanel = document.getElementById('vitals-panel');
    this.vitalsCanvas = document.getElementById('vitals-chart-canvas');
    if (this.vitalsCanvas) {
      this.vitalsCtx = this.vitalsCanvas.getContext('2d');
      
      this.chartWidth = this.vitalsCanvas.width;
      this.chartHeight = this.vitalsCanvas.height;
    }
  }

  


  drawVitalsChart(t) {
    if (!this.vitalsCtx) return;
    const ctx = this.vitalsCtx;
    const W = this.chartWidth;
    const H = this.chartHeight;

    ctx.clearRect(0, 0, W, H);

    
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    ctx.lineWidth = 2.0;

    const scale = this.explorer ? this.explorer.currentScale : 'organ';

    if (scale === 'tissue') {
      
      if (this.activeSystem === 'circulatory') {
        
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.95)';
        ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const timeVal = (t * 1.5 - (x / W) * 2.0);
          const cycle = (timeVal % 1.0 + 1.0) % 1.0;
          let yOffset = H / 2 + 10;
          if (cycle < 0.1) {
            yOffset -= (cycle / 0.1) * 35;
          } else if (cycle >= 0.1 && cycle < 0.45) {
            yOffset -= 35 - ((cycle - 0.1) / 0.35) * 15;
          } else if (cycle >= 0.45 && cycle < 0.6) {
            yOffset -= 20 - ((cycle - 0.45) / 0.15) * 20;
          }
          if (x === 0) ctx.moveTo(x, yOffset);
          else ctx.lineTo(x, yOffset);
        }
        ctx.stroke();
      } else if (this.activeSystem === 'respiratory') {
        
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.95)';
        ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const timeVal = (t * 1.3 - (x / W) * 6.2);
          const base = Math.sin(timeVal);
          const inflection = Math.sin(timeVal * 2) * 5;
          const yOffset = H / 2 - base * 22 - inflection;
          if (x === 0) ctx.moveTo(x, yOffset);
          else ctx.lineTo(x, yOffset);
        }
        ctx.stroke();
      } else if (this.activeSystem === 'nervous') {
        
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.95)';
        ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const timeVal = (t * 1.8 - (x / W) * 5.0);
          const cycle = (timeVal % 1.0 + 1.0) % 1.0;
          let yOffset = H / 2;
          if (cycle < 0.35) {
            yOffset += Math.sin(cycle * 60) * 15 * Math.sin((cycle / 0.35) * Math.PI);
          }
          if (x === 0) ctx.moveTo(x, yOffset);
          else ctx.lineTo(x, yOffset);
        }
        ctx.stroke();
      } else {
        
        let sysColor = 'rgba(245, 158, 11, 0.95)';
        if (this.activeSystem === 'skeletal') sysColor = 'rgba(212, 212, 216, 0.95)';
        else if (this.activeSystem === 'muscular') sysColor = 'rgba(244, 63, 94, 0.95)';
        ctx.strokeStyle = sysColor;
        ctx.shadowColor = sysColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const timeVal = (t * 1.0 - (x / W) * 8.0);
          const yOffset = H / 2 + Math.sin(timeVal) * 12 + Math.cos(timeVal * 2.5) * 6;
          if (x === 0) ctx.moveTo(x, yOffset);
          else ctx.lineTo(x, yOffset);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      return;
    }

    if (scale === 'cell') {
      
      let sysColor = 'rgba(0, 212, 255, 0.95)';
      if (this.activeSystem === 'circulatory') sysColor = 'rgba(239, 68, 68, 0.95)';
      else if (this.activeSystem === 'respiratory') sysColor = 'rgba(34, 211, 238, 0.95)';
      else if (this.activeSystem === 'nervous') sysColor = 'rgba(168, 85, 247, 0.95)';
      else if (this.activeSystem === 'digestive') sysColor = 'rgba(245, 158, 11, 0.95)';
      else if (this.activeSystem === 'muscular') sysColor = 'rgba(244, 63, 94, 0.95)';
      else sysColor = 'rgba(212, 212, 216, 0.95)';

      ctx.strokeStyle = sysColor;
      ctx.shadowColor = sysColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();

      if (this.activeSystem === 'nervous') {
        
        for (let x = 0; x < W; x++) {
          const timeVal = (t * 1.2 - (x / W) * 2.2);
          const cycle = (timeVal % 1.0 + 1.0) % 1.0;
          let yOffset = H - 25; 
          if (cycle < 0.05) {
            yOffset -= (cycle / 0.05) * 8;
          } else if (cycle >= 0.05 && cycle < 0.12) {
            yOffset -= 8 + ((cycle - 0.05) / 0.07) * 45;
          } else if (cycle >= 0.12 && cycle < 0.22) {
            yOffset -= 53 - ((cycle - 0.12) / 0.10) * 60;
          } else if (cycle >= 0.22 && cycle < 0.38) {
            yOffset += 7 - ((cycle - 0.22) / 0.16) * 7;
          }
          if (x === 0) ctx.moveTo(x, yOffset);
          else ctx.lineTo(x, yOffset);
        }
      } else {
        
        for (let x = 0; x < W; x++) {
          const timeVal = (t * 1.5 - (x / W) * 6.0);
          const yOffset = H / 2 + Math.sin(timeVal) * 15 + Math.sin(timeVal * 8.0) * 3;
          if (x === 0) ctx.moveTo(x, yOffset);
          else ctx.lineTo(x, yOffset);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    if (scale === 'dna') {
      
      let sysColor = 'rgba(0, 255, 163, 0.95)'; 
      if (this.activeSystem === 'circulatory') sysColor = 'rgba(239, 68, 68, 0.95)';
      else if (this.activeSystem === 'respiratory') sysColor = 'rgba(34, 211, 238, 0.95)';
      else if (this.activeSystem === 'nervous') sysColor = 'rgba(168, 85, 247, 0.95)';
      else if (this.activeSystem === 'digestive') sysColor = 'rgba(245, 158, 11, 0.95)';
      else if (this.activeSystem === 'muscular') sysColor = 'rgba(244, 63, 94, 0.95)';
      else sysColor = 'rgba(212, 212, 216, 0.95)';

      const amplitude = 18;
      const centerY = H / 2;
      const frequency = 0.04;
      const timeOffset = t * 2.0;

      
      ctx.lineWidth = 1.5;
      for (let x = 10; x < W - 10; x += 12) {
        const theta1 = x * frequency + timeOffset;
        const theta2 = x * frequency + timeOffset + Math.PI;
        const y1 = centerY + Math.sin(theta1) * amplitude;
        const y2 = centerY + Math.sin(theta2) * amplitude;

        const rungIndex = Math.floor(x / 12);
        const isAT = (rungIndex / 2) % 2 === 0;
        const col1 = isAT ? 'rgba(16, 185, 129, 0.7)' : 'rgba(59, 130, 246, 0.7)';
        const col2 = isAT ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)';

        ctx.strokeStyle = col1;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, (y1 + y2) / 2);
        ctx.stroke();

        ctx.strokeStyle = col2;
        ctx.beginPath();
        ctx.moveTo(x, (y1 + y2) / 2);
        ctx.lineTo(x, y2);
        ctx.stroke();
      }

      
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = sysColor;
      ctx.shadowColor = sysColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = centerY + Math.sin(x * frequency + timeOffset) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = centerY + Math.sin(x * frequency + timeOffset + Math.PI) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    if (this.activeSystem === 'circulatory') {
      
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.95)'; 
      ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const pulseSpeed = 1.3;
      const bpm = 78;

      for (let x = 0; x < W; x++) {
        
        const timeVal = (t * pulseSpeed - (x / W) * 2.5);
        const cycle = (timeVal % 1.0 + 1.0) % 1.0; 
        
        let yOffset = H / 2;

        
        if (cycle < 0.08) {
          
          yOffset -= Math.sin(cycle / 0.08 * Math.PI) * 4;
        } else if (cycle >= 0.12 && cycle < 0.15) {
          
          yOffset += Math.sin((cycle - 0.12) / 0.03 * Math.PI) * 5;
        } else if (cycle >= 0.15 && cycle < 0.20) {
          
          yOffset -= Math.sin((cycle - 0.15) / 0.05 * Math.PI) * 32;
        } else if (cycle >= 0.20 && cycle < 0.24) {
          
          yOffset += Math.sin((cycle - 0.20) / 0.04 * Math.PI) * 12;
        } else if (cycle >= 0.32 && cycle < 0.44) {
          
          yOffset -= Math.sin((cycle - 0.32) / 0.12 * Math.PI) * 8;
        }

        if (x === 0) ctx.moveTo(x, yOffset);
        else ctx.lineTo(x, yOffset);
      }
      ctx.stroke();

    } else if (this.activeSystem === 'respiratory') {
      
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.95)'; 
      ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let x = 0; x < W; x++) {
        const timeVal = (t * 1.3 - (x / W) * 6.2);
        const yOffset = H / 2 - Math.sin(timeVal) * 26;

        if (x === 0) ctx.moveTo(x, yOffset);
        else ctx.lineTo(x, yOffset);
      }
      ctx.stroke();

    } else if (this.activeSystem === 'nervous') {
      
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.95)'; 
      ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let x = 0; x < W; x++) {
        
        const timeVal = (t * 2.0 - (x / W) * 12.0);
        const base = Math.sin(timeVal * 4.0) * 12 + Math.sin(timeVal * 12.0) * 6;
        const noise = Math.sin(x * 1.5 + t * 45) * 3; 
        const yOffset = H / 2 + base + noise;

        if (x === 0) ctx.moveTo(x, yOffset);
        else ctx.lineTo(x, yOffset);
      }
      ctx.stroke();

    } else if (this.activeSystem === 'digestive') {
      
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.95)'; 
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let x = 0; x < W; x++) {
        
        const timeVal = (t * 0.4 - (x / W) * 4.0);
        const cycle = Math.sin(timeVal) * 8 + Math.cos(timeVal * 2.3) * 6;
        const yOffset = H / 2 + cycle;

        if (x === 0) ctx.moveTo(x, yOffset);
        else ctx.lineTo(x, yOffset);
      }
      ctx.stroke();

    } else if (this.activeSystem === 'immune') {
      
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.95)'; 
      ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const timeVal = (t * 3.5 - (x / W) * 18.0);
        
        const burst = Math.sin(timeVal) * (Math.random() > 0.92 ? 22 : 4);
        const yOffset = H / 2 + burst + Math.sin(x * 0.1) * 3;
        if (x === 0) ctx.moveTo(x, yOffset);
        else ctx.lineTo(x, yOffset);
      }
      ctx.stroke();

    } else {
      
      ctx.strokeStyle = 'rgba(212, 212, 216, 0.7)'; 
      ctx.shadowColor = 'rgba(212, 212, 216, 0.3)';
      ctx.shadowBlur = 4;
      ctx.beginPath();

      for (let x = 0; x < W; x++) {
        
        const yOffset = H / 2 + Math.sin(x * 0.4 + t * 10) * 1.5;
        if (x === 0) ctx.moveTo(x, yOffset);
        else ctx.lineTo(x, yOffset);
      }
      ctx.stroke();
    }

    
    ctx.shadowBlur = 0;
  }

  


  switchSystem(key) {
    this.activeSystem = key;

    
    this.circGroup.visible = (key === 'circulatory');
    this.respGroup.visible = (key === 'respiratory');
    this.nervGroup.visible = (key === 'nervous');
    this.digGroup.visible = (key === 'digestive');
    this.immuneGroup.visible = (key === 'immune');

    
    this.updateVitalsLabels(key);
  }

  updateVitalsLabels(key) {
    const metricsPanel = document.getElementById('vitals-metrics');
    if (!metricsPanel) return;

    let itemsHTML = '';
    const scale = this.explorer ? this.explorer.currentScale : 'organ';

    const statusBadge = document.getElementById('vitals-status-badge');
    if (statusBadge) {
      if (scale === 'tissue') {
        statusBadge.textContent = 'Coherent';
      } else if (scale === 'cell') {
        statusBadge.textContent = 'Integrated';
      } else if (scale === 'dna') {
        statusBadge.textContent = 'Fidelity: OK';
      } else {
        statusBadge.textContent = 'Nominal';
      }
    }

    if (scale === 'tissue') {
      switch (key) {
        case 'circulatory':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">MYOCYTE SYNC</span>
              <span class="v-m-val text-red">98% Coherence</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">CELLULAR PERFUSION</span>
              <span class="v-m-val">96% SpO???</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ACTION POTENTIAL</span>
              <span class="v-m-val">1.2 Hz</span>
            </div>
          `;
          break;
        case 'respiratory':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">ALVEOLAR GAS EXCHANGE</span>
              <span class="v-m-val text-cyan">98% Efficient</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">SURFACTANT TENSION</span>
              <span class="v-m-val">25 mN/m</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">MEMBRANE THICKNESS</span>
              <span class="v-m-val">0.5 ??m</span>
            </div>
          `;
          break;
        case 'nervous':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">SYNAPTIC COHERENCE</span>
              <span class="v-m-val text-purple">92%</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">AXON CONDUCTION</span>
              <span class="v-m-val">120 m/s</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">NEUROTRANSMITTER LEVEL</span>
              <span class="v-m-val">Normal</span>
            </div>
          `;
          break;
        case 'digestive':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">ABSORPTION DEPTH</span>
              <span class="v-m-val text-orange">Microvilli Level</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">MUCOSAL INTEGRITY</span>
              <span class="v-m-val">99%</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ION CHANNELS</span>
              <span class="v-m-val">Active</span>
            </div>
          `;
          break;
        default:
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">TISSUE PERFUSION</span>
              <span class="v-m-val text-zinc">95%</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">MATRIX INTEGRITY</span>
              <span class="v-m-val">99%</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">INTERCELLULAR SIGNAL</span>
              <span class="v-m-val">Nominal</span>
            </div>
          `;
      }
    } else if (scale === 'cell') {
      switch (key) {
        case 'circulatory':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">MITOCHONDRIA COUNT</span>
              <span class="v-m-val text-red">~40% Volume</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">CARDIAC BEAT REFRACTORY</span>
              <span class="v-m-val">250 ms</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ORGANELLE INTEGRITY</span>
              <span class="v-m-val text-red">99.2%</span>
            </div>
          `;
          break;
        case 'respiratory':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">PNEUMOCYTE TYPE I/II</span>
              <span class="v-m-val text-cyan">Balanced</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">CYTOSOL pH</span>
              <span class="v-m-val">7.2</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ORGANELLE INTEGRITY</span>
              <span class="v-m-val text-cyan">98.9%</span>
            </div>
          `;
          break;
        case 'nervous':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">MEMBRANE POTENTIAL</span>
              <span class="v-m-val text-purple">-70 mV</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">MYELIN THICKNESS</span>
              <span class="v-m-val">Optimum</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ORGANELLE INTEGRITY</span>
              <span class="v-m-val text-purple">99.5%</span>
            </div>
          `;
          break;
        case 'digestive':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">ATP PRODUCTION</span>
              <span class="v-m-val text-orange">1.4M ATP/sec</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ENZYMATIC SECRETION</span>
              <span class="v-m-val">Nominal</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ORGANELLE INTEGRITY</span>
              <span class="v-m-val text-orange">99.0%</span>
            </div>
          `;
          break;
        default:
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">CELLULAR RESPIRATION</span>
              <span class="v-m-val text-zinc">Active</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ORGANELLE INTEGRITY</span>
              <span class="v-m-val text-zinc">99.1%</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">CYTOPLASMIC STATE</span>
              <span class="v-m-val">Stable</span>
            </div>
          `;
      }
    } else if (scale === 'dna') {
      itemsHTML = `
        <div class="vital-m-item">
          <span class="v-m-label">GENE TRANSCRIPTION HEALTH</span>
          <span class="v-m-val text-cyan animate-pulse">Active (100% Health)</span>
        </div>
        <div class="vital-m-item">
          <span class="v-m-label">BASE PAIR FIDELITY</span>
          <span class="v-m-val">99.999%</span>
        </div>
        <div class="vital-m-item">
          <span class="v-m-label">CHROMATIN STATE</span>
          <span class="v-m-val">Uncoiled (Euchromatin)</span>
        </div>
      `;
    } else {
      switch (key) {
        case 'circulatory':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">HEART RATE</span>
              <span class="v-m-val text-red animate-pulse">78 BPM</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">BLOOD PRESSURE</span>
              <span class="v-m-val">120/80 mmHg</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">CARDIAC OUTPUT</span>
              <span class="v-m-val">5.0 L/min</span>
            </div>
          `;
          break;
        case 'respiratory':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">RESPIRATION</span>
              <span class="v-m-val text-cyan">14 bpm</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">OXYGEN CAP.</span>
              <span class="v-m-val">98% SpO???</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">TIDAL VOLUME</span>
              <span class="v-m-val">500 mL</span>
            </div>
          `;
          break;
        case 'nervous':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">BRAINWAVES</span>
              <span class="v-m-val text-purple">Alpha (10 Hz)</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">NEURAL VELOCITY</span>
              <span class="v-m-val">120 m/s</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">SYNAPTIC LOAD</span>
              <span class="v-m-val">8% Peak</span>
            </div>
          `;
          break;
        case 'digestive':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">STOMACH ACIDITY</span>
              <span class="v-m-val text-orange">pH 2.0</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ABSORPTION RATE</span>
              <span class="v-m-val">85% Net</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">PERISTALSIS FREQ.</span>
              <span class="v-m-val">3 cycles/min</span>
            </div>
          `;
          break;
        case 'immune':
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">WHITE CELL COUNT</span>
              <span class="v-m-val text-cyan animate-pulse">7,200 /??L</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">ANTIBODY TITER</span>
              <span class="v-m-val">IgG: Nominal</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">LYMPHATIC DRAIN</span>
              <span class="v-m-val">120 mL/hr</span>
            </div>
          `;
          break;
        default: 
          itemsHTML = `
            <div class="vital-m-item">
              <span class="v-m-label">BONE DENSITY</span>
              <span class="v-m-val text-zinc">1.2 g/cm??</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">JOINT LOAD</span>
              <span class="v-m-val">0.14 kN</span>
            </div>
            <div class="vital-m-item">
              <span class="v-m-label">MUSCLE TENSION</span>
              <span class="v-m-val">Normal</span>
            </div>
          `;
      }
    }

    metricsPanel.innerHTML = itemsHTML;
  }

  


  update(t) {
    
  }

  destroy() {
    
    if (this.circPoints) {
      this.circGroup.remove(this.circPoints);
      this.circGeometry.dispose();
      this.circPoints.material.dispose();
    }
    if (this.respPoints) {
      this.respGroup.remove(this.respPoints);
      this.respGeometry.dispose();
      this.respPoints.material.dispose();
    }
    if (this.brainPoints) {
      this.nervGroup.remove(this.brainPoints);
      this.brainGeometry.dispose();
      this.brainPoints.material.dispose();
    }
    if (this.signalPoints) {
      this.nervGroup.remove(this.signalPoints);
      this.signalGeometry.dispose();
      this.signalPoints.material.dispose();
    }
    if (this.foodBolus) {
      this.digGroup.remove(this.foodBolus);
      this.foodBolus.geometry.dispose();
      this.foodBolus.material.dispose();
    }
    if (this.nutrientPoints) {
      this.digGroup.remove(this.nutrientPoints);
      this.nutrientGeometry.dispose();
      this.nutrientPoints.material.dispose();
    }
  }

  rebind(explorer) {
    this.explorer = explorer;
    
    console.log('???? BioAnimations3D rebound to new explorer');
  }
}


window.BioAnimations3D = BioAnimations3D;
