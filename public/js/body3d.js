




'use strict';

class Body3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.width = this.canvas.offsetWidth;
    this.height = this.canvas.offsetHeight;
    this.animFrame = null;
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.rotationY = 0;
    this.rotationX = 0;
    this.autoRotate = true;
    this.time = 0;

    this.init();
    this.createBody();
    this.createParticleField();
    this.createGlowSphere();
    this.bindEvents();
    this.animate();
  }

  init() {
    const { canvas, width, height } = this;

    
    this.scene = new THREE.Scene();

    
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 8);

    
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    
    const ambientLight = new THREE.AmbientLight(0x0a1a2e, 3);
    this.scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00d4ff, 4, 20);
    cyanLight.position.set(5, 3, 5);
    this.scene.add(cyanLight);
    this.cyanLight = cyanLight;

    const purpleLight = new THREE.PointLight(0x7b2fff, 3, 20);
    purpleLight.position.set(-5, -2, 3);
    this.scene.add(purpleLight);
    this.purpleLight = purpleLight;

    const topLight = new THREE.DirectionalLight(0x00d4ff, 1.5);
    topLight.position.set(0, 10, 5);
    this.scene.add(topLight);

    
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);
  }

  createBody() {
    const group = new THREE.Group();

    
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0x0a2040,
      emissive: 0x001833,
      specular: 0x00d4ff,
      shininess: 120,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.06,
      wireframe: true,
    });

    
    const headGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 3.1, 0);
    group.add(head);

    
    const headGlowGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const headGlow = new THREE.Mesh(headGlowGeo, glowMat.clone());
    head.add(headGlow);

    
    const neckGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.35, 16);
    const neck = new THREE.Mesh(neckGeo, bodyMat);
    neck.position.set(0, 2.65, 0);
    group.add(neck);

    
    const torsoGeo = new THREE.CylinderGeometry(0.65, 0.55, 1.8, 24);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.position.set(0, 1.5, 0);
    group.add(torso);

    
    const torsoWire = new THREE.Mesh(torsoGeo, wireMat);
    torso.add(torsoWire);

    
    const ribs = this.createRibCage();
    ribs.position.set(0, 1.6, 0.5);
    group.add(ribs);

    
    const pelvisGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.5, 24);
    const pelvis = new THREE.Mesh(pelvisGeo, bodyMat);
    pelvis.position.set(0, 0.55, 0);
    group.add(pelvis);

    
    const lUpperArmGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.9, 12);
    const lUpperArm = new THREE.Mesh(lUpperArmGeo, bodyMat);
    lUpperArm.position.set(-0.85, 1.8, 0);
    lUpperArm.rotation.z = BioUtils.toRad(15);
    group.add(lUpperArm);

    const lForeArmGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.8, 12);
    const lForeArm = new THREE.Mesh(lForeArmGeo, bodyMat);
    lForeArm.position.set(-1.2, 1.1, 0);
    lForeArm.rotation.z = BioUtils.toRad(25);
    group.add(lForeArm);

    
    const rUpperArm = lUpperArm.clone();
    rUpperArm.position.set(0.85, 1.8, 0);
    rUpperArm.rotation.z = BioUtils.toRad(-15);
    group.add(rUpperArm);

    const rForeArm = lForeArm.clone();
    rForeArm.position.set(1.2, 1.1, 0);
    rForeArm.rotation.z = BioUtils.toRad(-25);
    group.add(rForeArm);

    
    const lThighGeo = new THREE.CylinderGeometry(0.22, 0.18, 1.1, 12);
    const lThigh = new THREE.Mesh(lThighGeo, bodyMat);
    lThigh.position.set(-0.28, -0.35, 0);
    group.add(lThigh);

    const lShinGeo = new THREE.CylinderGeometry(0.14, 0.1, 1.0, 12);
    const lShin = new THREE.Mesh(lShinGeo, bodyMat);
    lShin.position.set(-0.28, -1.45, 0);
    group.add(lShin);

    
    const rThigh = lThigh.clone();
    rThigh.position.set(0.28, -0.35, 0);
    group.add(rThigh);

    const rShin = lShin.clone();
    rShin.position.set(0.28, -1.45, 0);
    group.add(rShin);

    
    const footGeo = new THREE.BoxGeometry(0.22, 0.1, 0.4);
    const lFoot = new THREE.Mesh(footGeo, bodyMat);
    lFoot.position.set(-0.28, -2.0, 0.1);
    group.add(lFoot);

    const rFoot = lFoot.clone();
    rFoot.position.set(0.28, -2.0, 0.1);
    group.add(rFoot);

    
    const spinePoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      spinePoints.push(new THREE.Vector3(
        Math.sin(t * 0.5) * 0.05,
        2.5 - t * 4,
        -0.2
      ));
    }
    const splineGeo = new THREE.BufferGeometry().setFromPoints(spinePoints);
    const spineMat = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.5,
    });
    const spine = new THREE.Line(splineGeo, spineMat);
    group.add(spine);

    
    group.position.set(0, 0, 0);
    this.bodyGroup = group;
    this.pivot.add(group);

    
    this.lUpperArm = lUpperArm;
    this.rUpperArm = rUpperArm;
  }

  createRibCage() {
    const group = new THREE.Group();
    const ribMat = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.3,
    });

    const ribCount = 5;
    for (let i = 0; i < ribCount; i++) {
      const y = i * 0.22;
      const ribPoints = [];
      const steps = 20;
      const width = 0.5 - i * 0.04;

      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const angle = Math.PI - t * Math.PI;
        ribPoints.push(new THREE.Vector3(
          Math.cos(angle) * width,
          y + Math.sin(t * Math.PI) * 0.05,
          -Math.sin(angle) * 0.2
        ));
      }

      const ribGeo = new THREE.BufferGeometry().setFromPoints(ribPoints);
      const rib = new THREE.Line(ribGeo, ribMat);
      group.add(rib);
    }

    return group;
  }

  createParticleField() {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      
      const theta = Math.random() * Math.PI * 2;
      const r = BioUtils.randomFloat(1.2, 2.5);
      const y = BioUtils.randomFloat(-2.5, 3.5);

      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      
      const t = Math.random();
      colors[i * 3] = BioUtils.lerp(0, 0.48, t);     
      colors[i * 3 + 1] = BioUtils.lerp(0.83, 0.18, t); 
      colors[i * 3 + 2] = BioUtils.lerp(1, 1, t);    

      sizes[i] = BioUtils.randomFloat(1, 4);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geo, mat);
    this.pivot.add(particles);
    this.particleField = particles;
    this.particlePositions = positions;
    this.particleCount = count;
  }

  createGlowSphere() {
    
    const geo = new THREE.SphereGeometry(2.5, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.015,
      side: THREE.BackSide,
    });
    const sphere = new THREE.Mesh(geo, mat);
    this.scene.add(sphere);
    this.glowSphere = sphere;
  }

  bindEvents() {
    const { canvas } = this;

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      
      clearTimeout(this.autoRotateTimer);
      this.autoRotateTimer = setTimeout(() => {
        this.autoRotate = true;
      }, 2000);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.rotationY += dx * 0.01;
      this.rotationX += dy * 0.005;
      this.rotationX = BioUtils.clamp(this.rotationX, -0.6, 0.6);
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;
    });

    
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.autoRotate = false;
      this.prevMouse.x = e.touches[0].clientX;
      this.prevMouse.y = e.touches[0].clientY;
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.isDragging) return;
      const dx = e.touches[0].clientX - this.prevMouse.x;
      const dy = e.touches[0].clientY - this.prevMouse.y;
      this.rotationY += dx * 0.01;
      this.rotationX += dy * 0.005;
      this.rotationX = BioUtils.clamp(this.rotationX, -0.6, 0.6);
      this.prevMouse.x = e.touches[0].clientX;
      this.prevMouse.y = e.touches[0].clientY;
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      this.isDragging = false;
      clearTimeout(this.autoRotateTimer);
      this.autoRotateTimer = setTimeout(() => {
        this.autoRotate = true;
      }, 2000);
    });

    window.addEventListener('resize', BioUtils.debounce(() => {
      const w = this.canvas.offsetWidth;
      const h = this.canvas.offsetHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }, 200));
  }

  animate() {
    this.time += 0.01;
    const { time, pivot, cyanLight, purpleLight } = this;

    
    if (this.autoRotate) {
      this.rotationY += 0.004;
    }

    
    pivot.rotation.y += (this.rotationY - pivot.rotation.y) * 0.05;
    pivot.rotation.x += (this.rotationX - pivot.rotation.x) * 0.05;

    
    const breathScale = 1 + Math.sin(time * 1.2) * 0.015;
    if (this.bodyGroup) {
      this.bodyGroup.scale.x = breathScale;
      this.bodyGroup.scale.z = breathScale;
    }

    
    cyanLight.intensity = 3.5 + Math.sin(time * 2) * 0.5;
    purpleLight.intensity = 2.5 + Math.cos(time * 1.7) * 0.5;
    cyanLight.position.x = Math.cos(time * 0.5) * 5;
    cyanLight.position.z = Math.sin(time * 0.5) * 5;

    
    if (this.particleField) {
      this.particleField.rotation.y = time * 0.2;
    }

    this.renderer.render(this.scene, this.camera);
    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.renderer.dispose();
  }
}

window.Body3D = Body3D;
