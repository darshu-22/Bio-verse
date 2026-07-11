








































'use strict';







const CAMERA_CONFIG = {

  




  paddingFactor: 1.15,

  



  minDistanceFactor: 0.04,

  



  maxDistanceFactor: 6.0,

  


  defaultTransitionDuration: 1200,

  



  resizeDistanceTolerance: 0.01,

  



  nearPlaneFactor: 0.001,

  


  farPlaneFactor: 12,

};






class CameraManager {

  

  




  constructor(camera, controls, renderer) {
    if (!camera)   throw new Error('[CameraManager] camera is required.');
    if (!renderer) throw new Error('[CameraManager] renderer is required.');

     this._camera   = camera;
     this._controls = controls ?? null;
     this._renderer = renderer;

    







    this._boundingSphere = null;

    











    this.defaultState = null;

    








    this.referenceDistance = 14;   

    console.log('[CameraManager] Initialised.');
  }


  






  












  computeFromScene(sceneObject) {
    if (!sceneObject) {
      console.error('[CameraManager] computeFromScene: sceneObject is null.');
      return;
    }

    sceneObject.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(sceneObject);

    if (!this._isValidBox(box)) {
      console.error('[CameraManager] computeFromScene: bounding box is empty or invalid.');
      return;
    }

    this._applyFit(box,  true);
    console.log('[CameraManager] computeFromScene ???', this._stateLog());
  }

  












  fitToScene(sceneObject) {
    if (!sceneObject) {
      console.warn('[CameraManager] fitToScene: sceneObject is null.');
      return;
    }

    sceneObject.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(sceneObject);

    if (!this._isValidBox(box)) {
      console.warn('[CameraManager] fitToScene: scene has no visible geometry.');
      return;
    }

    this._applyFit(box,  true);
    console.log('[CameraManager] fitToScene ???', this._stateLog());
  }

  












  fitToBoundingBox(box) {
    if (!this._isValidBox(box)) {
      console.warn('[CameraManager] fitToBoundingBox: invalid or empty box.');
      return;
    }

    this._applyFit(box,  true);
  }

  












  fitToObject(object) {
    if (!object) {
      console.warn('[CameraManager] fitToObject: object is null.');
      return;
    }

    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);

    if (!this._isValidBox(box)) {
      console.warn('[CameraManager] fitToObject: object has no geometry or is empty.');
      return;
    }

    this._applyFit(box,  false);
  }

  










  resetView() {
    if (!this.defaultState) {
      console.warn('[CameraManager] resetView: defaultState not set yet.');
      return;
    }

    this._camera.position.copy(this.defaultState.position);

    if (this.defaultState.fov !== this._camera.fov) {
      this._camera.fov = this.defaultState.fov;
      this._camera.updateProjectionMatrix();
    }

    if (this._controls) {
      this._controls.target.copy(this.defaultState.target);
      this._controls.update();
    }

    console.log('[CameraManager] resetView applied.');
  }

  
















  updateOnResize() {
    const canvas = this._renderer.domElement;
    const W = canvas.clientWidth  || canvas.offsetWidth  || window.innerWidth;
    const H = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;

    if (W <= 0 || H <= 0) return;

    
    const newAspect = W / H;
    if (Math.abs(this._camera.aspect - newAspect) > 1e-6) {
      this._camera.aspect = newAspect;
      this._camera.updateProjectionMatrix();
    }

    
    this._renderer.setSize(W, H, false);

    
    if (!this._boundingSphere) return;

    const newDist = this._computeIdealDistance(
      this._boundingSphere.radius,
      this._camera.fov,
      newAspect
    );

    
    const delta = Math.abs(newDist - this.referenceDistance) / this.referenceDistance;
    if (delta > CAMERA_CONFIG.resizeDistanceTolerance) {
      this.referenceDistance = newDist;
      this._applyControlsBounds(newDist);
      this._updateNearFar(this._boundingSphere.radius, newDist);

      
      if (this.defaultState) {
        const center    = this.defaultState.target.clone();
        const direction = this.defaultState.position.clone().sub(center).normalize();
        this.defaultState.position = center.clone().addScaledVector(direction, newDist);
        this.defaultState.distance = newDist;
      }
    }
  }

  







  getCurrentState() {
    const target = this._controls
      ? this._controls.target.clone()
      : new THREE.Vector3();

    return {
      position : this._camera.position.clone(),
      target   : target,
      distance : this._camera.position.distanceTo(target),
      fov      : this._camera.fov,
    };
  }

  








  restoreState(state) {
    if (!state || !state.position || !state.target) {
      console.warn('[CameraManager] restoreState: invalid state object.');
      return;
    }

    this._camera.position.copy(state.position);

    if (state.fov !== undefined && state.fov !== this._camera.fov) {
      this._camera.fov = state.fov;
      this._camera.updateProjectionMatrix();
    }

    if (this._controls) {
      this._controls.target.copy(state.target);
      this._controls.update();
    }
  }


  
















  








  getOrbitDistance(zoomFactor) {
    if (!zoomFactor || zoomFactor <= 0) return this.referenceDistance;
    return this.referenceDistance / zoomFactor;
  }

  







  getZoomFromDistance(distance) {
    if (!distance || distance <= 0) return 1.0;
    return this.referenceDistance / distance;
  }


  



  









  _applyFit(box, saveAsDefault) {

    
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());

    
    
    const radius = size.length() / 2;

    this._boundingSphere = { center: center.clone(), radius };

    
    const aspect    = this._camera.aspect;
    const fov       = this._camera.fov;
    const idealDist = this._computeIdealDistance(radius, fov, aspect);

    this.referenceDistance = idealDist;

    
    
    const camPos = new THREE.Vector3(
      center.x,
      center.y,
      center.z + idealDist
    );

    this._camera.position.copy(camPos);

    
    this._updateNearFar(radius, idealDist);

    
    if (this._controls) {
      this._controls.target.copy(center);
      this._applyControlsBounds(idealDist);
      this._controls.update();
    }

    
    if (saveAsDefault) {
      this.defaultState = {
        position : camPos.clone(),
        target   : center.clone(),
        distance : idealDist,
        fov      : this._camera.fov,
      };
    }
  }

  




















  _computeIdealDistance(radius, fovDeg, aspect) {
    const halfFovRad = (fovDeg * Math.PI / 180) / 2;
    const tanHalfFov = Math.tan(halfFovRad);

    
    const distVertical = radius / tanHalfFov;

    
    
    const distHorizontal = aspect < 1
      ? radius / (tanHalfFov * aspect)
      : distVertical;   

    const rawDist = Math.max(distVertical, distHorizontal, 0.1);
    return rawDist * CAMERA_CONFIG.paddingFactor;
  }

  







  _updateNearFar(radius, idealDist) {
    this._camera.near = Math.max(
      CAMERA_CONFIG.nearPlaneFactor,
      idealDist * CAMERA_CONFIG.minDistanceFactor * 0.1
    );
    this._camera.far = idealDist + radius * CAMERA_CONFIG.farPlaneFactor;
    this._camera.updateProjectionMatrix();
  }

  




  _applyControlsBounds(idealDist) {
    if (!this._controls) return;
    this._controls.minDistance = idealDist * CAMERA_CONFIG.minDistanceFactor;
    this._controls.maxDistance = idealDist * CAMERA_CONFIG.maxDistanceFactor;
  }


  



  





  _isValidBox(box) {
    if (!box) return false;
    if (box.isEmpty()) return false;
    const size = box.getSize(new THREE.Vector3());
    return (
      isFinite(size.x) && isFinite(size.y) && isFinite(size.z) &&
      (size.x > 0 || size.y > 0 || size.z > 0)
    );
  }

  




  _stateLog() {
    if (!this.defaultState) return '(defaultState not set)';
    const { position: p, target: t, distance: d } = this.defaultState;
    const r = this._boundingSphere?.radius ?? 0;
    return (
      `pos=(${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)})  ` +
      `target=(${t.x.toFixed(3)}, ${t.y.toFixed(3)}, ${t.z.toFixed(3)})  ` +
      `dist=${d.toFixed(3)}  sphere.radius=${r.toFixed(3)}`
    );
  }

}








window.CameraManager = CameraManager;
window.CAMERA_CONFIG = CAMERA_CONFIG;
