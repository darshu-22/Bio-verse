'use strict';

let heroScene = null;
let heroCamera = null;
let heroRenderer = null;
let heroControls = null;
let heroModel = null;
let heroAnimationFrameId = null;
let heroTimeoutId = null;

function initHeroViewer() {
  if (heroRenderer) return;

  const container = document.getElementById('hero-viewer-container');
  const canvas = document.getElementById('hero-canvas');
  if (!container || !canvas) return;

  const width = container.clientWidth || 500;
  const height = container.clientHeight || 500;

  heroScene = new THREE.Scene();

  heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  heroCamera.position.set(0, 0, 8);

  heroRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  heroRenderer.setSize(width, height);
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  heroControls = new THREE.OrbitControls(heroCamera, heroRenderer.domElement);
  heroControls.enableZoom = false;
  heroControls.enablePan = false;
  heroControls.enableDamping = true;
  heroControls.dampingFactor = 0.05;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  heroScene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight1.position.set(2, 4, 5);
  heroScene.add(dirLight1);

  const rimLightCyan = new THREE.DirectionalLight(0x00d4ff, 1.8);
  rimLightCyan.position.set(-5, 2, -3);
  heroScene.add(rimLightCyan);

  const rimLightPurple = new THREE.DirectionalLight(0x7b2fff, 1.8);
  rimLightPurple.position.set(5, -2, -3);
  heroScene.add(rimLightPurple);

  loadHeroModel();

  window.addEventListener('resize', handleResize);
}

function loadHeroModel() {
  if (heroTimeoutId) {
    clearTimeout(heroTimeoutId);
    heroTimeoutId = null;
  }

  let modelLoaded = false;
  let modelTimedOut = false;

  heroTimeoutId = setTimeout(() => {
    if (!modelLoaded) {
      modelTimedOut = true;
      handleLoadFailure('Loading timed out after 15 seconds');
    }
  }, 15000);

  const loader = new THREE.GLTFLoader();
  loader.load(
    'models/muscle-hero.glb',
    (gltf) => {
      if (modelTimedOut) {
        gltf.scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else obj.material.dispose();
          }
        });
        return;
      }
      modelLoaded = true;
      clearTimeout(heroTimeoutId);
      heroTimeoutId = null;

      heroModel = gltf.scene;

      const box = new THREE.Box3().setFromObject(heroModel);
      const center = box.getCenter(new THREE.Vector3());
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const radius = sphere.radius;

      heroModel.position.x += (heroModel.position.x - center.x);
      heroModel.position.y += (heroModel.position.y - center.y);
      heroModel.position.z += (heroModel.position.z - center.z);

      const fov = heroCamera.fov * (Math.PI / 180);
      const distance = radius / Math.sin(fov / 2);
      heroCamera.position.set(0, 0, distance * 1.15);
      heroCamera.lookAt(new THREE.Vector3(0, 0, 0));
      heroCamera.updateProjectionMatrix();

      heroModel.scale.setScalar(1.22);
      heroModel.position.y -= 1.15;

      heroScene.add(heroModel);

      const loaderEl = document.getElementById('hero-loader');
      if (loaderEl) {
        loaderEl.classList.add('hidden');
      }

      if (!heroAnimationFrameId) {
        let clock = new THREE.Clock();
        const animate = () => {
          heroAnimationFrameId = requestAnimationFrame(animate);

          if (heroModel) {
            const elapsed = clock.getElapsedTime();
            heroModel.rotation.y = elapsed * 0.12;
            heroModel.position.y = -1.15 + Math.sin(elapsed * 1.5) * 0.08;
          }

          if (heroControls) {
            heroControls.update();
          }

          if (heroRenderer && heroScene && heroCamera) {
            heroRenderer.render(heroScene, heroCamera);
          }
        };
        animate();
      }
    },
    undefined,
    (err) => {
      if (modelTimedOut) return;
      modelLoaded = true;
      clearTimeout(heroTimeoutId);
      heroTimeoutId = null;
      handleLoadFailure(err);
    }
  );
}

function handleLoadFailure(err) {
  console.error('Homepage model failed to load:', err);

  const loaderEl = document.getElementById('hero-loader');
  if (!loaderEl) return;

  loaderEl.classList.remove('hidden');

  const spinner = loaderEl.querySelector('.hero-spinner');
  if (spinner) spinner.style.display = 'none';

  const textEl = loaderEl.querySelector('span');
  if (textEl) textEl.textContent = '3D Preview Unavailable';

  let retryBtn = document.getElementById('hero-retry-btn');
  if (!retryBtn) {
    retryBtn = document.createElement('button');
    retryBtn.id = 'hero-retry-btn';
    retryBtn.className = 'btn-help';
    retryBtn.style.marginTop = '12px';
    retryBtn.style.width = 'auto';
    retryBtn.style.padding = '8px 20px';
    retryBtn.textContent = 'Retry';
    retryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (spinner) spinner.style.display = 'block';
      if (textEl) textEl.textContent = 'Loading 3D Anatomy...';
      retryBtn.remove();
      loadHeroModel();
    });
    loaderEl.appendChild(retryBtn);
  }
}

function handleResize() {
  const container = document.getElementById('hero-viewer-container');
  if (!container || !heroCamera || !heroRenderer) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  heroCamera.aspect = width / height;
  heroCamera.updateProjectionMatrix();

  heroRenderer.setSize(width, height);
}

function disposeHeroViewer() {
  window.removeEventListener('resize', handleResize);

  if (heroTimeoutId) {
    clearTimeout(heroTimeoutId);
    heroTimeoutId = null;
  }

  if (heroAnimationFrameId) {
    cancelAnimationFrame(heroAnimationFrameId);
    heroAnimationFrameId = null;
  }

  if (heroControls) {
    heroControls.dispose();
    heroControls = null;
  }

  if (heroScene) {
    heroScene.traverse((object) => {
      if (!object.isMesh) return;
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    heroScene = null;
  }

  if (heroRenderer) {
    heroRenderer.dispose();
    heroRenderer = null;
  }

  heroCamera = null;
  heroModel = null;

  const retryBtn = document.getElementById('hero-retry-btn');
  if (retryBtn) retryBtn.remove();
}

window.initHeroViewer = initHeroViewer;
window.disposeHeroViewer = disposeHeroViewer;
