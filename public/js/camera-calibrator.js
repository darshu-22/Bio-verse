






class CameraCalibrator {
  start() {
    
    if (document.getElementById('bio-calibrator')) return;

    const panel = document.createElement('div');
    panel.id = 'bio-calibrator';
    panel.style.cssText = `
      position:fixed; top:10px; right:10px; z-index:9999;
      background:rgba(0,0,0,0.9); color:#00d4ff;
      padding:16px; border-radius:8px; font-family:monospace;
      font-size:12px; min-width:280px;
      border:1px solid rgba(0,212,255,0.3);
    `;
    document.body.appendChild(panel);

    const update = () => {
      const e = window.bioExplorer;
      if (!e) return;
      panel.innerHTML = `
        <b style="color:#fff">Camera Calibrator</b>
        <br/><br/>
        pivotY: <b>${e.currentPivotOffsetY.toFixed(3)}</b><br/>
        rotY:   <b>${e.currentRotY.toFixed(3)}</b><br/>
        rotX:   <b>${e.currentRotX.toFixed(3)}</b><br/>
        zoom:   <b>${e.zoom.toFixed(3)}</b><br/>
        <br/>
        <button onclick="bioCalibrate.copy()" style="
          background:#00d4ff22; border:1px solid #00d4ff; 
          color:#00d4ff; padding:6px 12px; cursor:pointer; border-radius:4px;
        ">📋 Copy Preset JSON</button>
      `;
      requestAnimationFrame(update);
    };
    update();
  }

  copy() {
    const e = window.bioExplorer;
    const preset = {
      pivotY: parseFloat(e.currentPivotOffsetY.toFixed(3)),
      rotY:   parseFloat(e.currentRotY.toFixed(3)),
      rotX:   parseFloat(e.currentRotX.toFixed(3)),
      zoom:   parseFloat(e.zoom.toFixed(3)),
      opacity: parseInt(document.getElementById('opacity-slider')?.value || 20)
    };
    navigator.clipboard.writeText(JSON.stringify(preset, null, 2))
      .then(() => console.log('✅ Preset copied:', preset));
    return preset;
  }
}
window.bioCalibrate = new CameraCalibrator();
