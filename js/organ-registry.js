




'use strict';

class OrganRegistry {
  constructor() {
    
    this.meshes = new Map();

    
    this.mappings = {};

    
    this.rules = [
      {
        key: 'brain',
        aliases: ['brain', 'cerebr', 'telencephalon', 'gyrus', 'cortex', 'cerebellum', 'midbrain', 'thalamus', 'pons', 'medulla'],
        exclude: ['artery', 'vein', 'sinus', 'vessel', 'nerve']
      },
      {
        key: 'heart',
        aliases: ['heart', 'myocardium', 'ventricle', 'atrium', 'auricle'],
        exclude: ['artery', 'vein', 'sinus', 'vessel', 'nerve', 'papillary', 'leaflet']
      },
      {
        key: 'lungs',
        aliases: ['lung'],
        exclude: ['artery', 'vein', 'vessel', 'bronch', 'pleura', 'trachea', 'segment', 'surface', 'border', 'apex', 'base', 'hilum', 'fissure', 'root', 'notch']
      },
      {
        key: 'liver',
        aliases: ['liver'],
        exclude: ['artery', 'vein', 'vessel', 'duct', 'segment', 'surface', 'border', 'division', 'impression', 'part', 'area', 'curvature', 'wall', 'lobe of', 'bare area']
      },
      {
        key: 'kidney',
        aliases: ['kidney'],
        exclude: ['artery', 'vein', 'vessel', 'ureter', 'adrenal', 'surface', 'border', 'pole', 'hilum']
      },
      {
        key: 'stomach',
        aliases: ['stomach'],
        exclude: ['artery', 'vein', 'vessel', 'nerve', 'wall', 'mucosa']
      },
      {
        key: 'femur',
        aliases: ['femur', 'thigh']
      },
      {
        key: 'skull',
        aliases: ['skull', 'cranium', 'mandible', 'maxilla', 'frontal_bone', 'parietal_bone', 'occipital_bone', 'temporal_bone']
      },
      {
        key: 'spine',
        aliases: ['spine', 'vertebra', 'sacrum', 'coccyx', 'intervertebral']
      }
    ];
  }

  


  register(mesh, systemKey) {
    if (!mesh) return;

    
    if (mesh.visible === false) return;

    const nameLower = (mesh.name || '').toLowerCase();
    const userDataNameLower = (mesh.userData?.organName || '').toLowerCase();

    if (nameLower.endsWith('.t') || userDataNameLower.endsWith('.t') || /\.t$/i.test(mesh.name)) {
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

    
    const explorer = window.bioExplorer;
    if (explorer) {
      const activeSystem = explorer.activeSystem || 'fullBody';
      if (activeSystem !== 'fullBody' && systemKey !== activeSystem) {
        return;
      }

      
      if (explorer.anatomyContainer) {
        let inHierarchy = false;
        let curr = mesh;
        while (curr) {
          if (curr === explorer.anatomyContainer) {
            inHierarchy = true;
            break;
          }
          curr = curr.parent;
        }
        if (!inHierarchy) return;
      }
    }

    mesh.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);

    const meshId = mesh.userData?.meshId || mesh.uuid;
    const parentName = mesh.parent ? mesh.parent.name : null;
    const selectable = mesh.userData?.interactive !== false;

    const entry = {
      uuid: mesh.uuid,
      name: mesh.name,
      parentName,
      system: systemKey,
      boundingBox: box.clone(),
      center: center.clone(),
      worldPosition: worldPos.clone(),
      material: mesh.material,
      visibility: mesh.visible,
      selectable,
      object: mesh
    };

    this.meshes.set(meshId, entry);

    for (const rule of this.rules) {
      
      const matchesAlias = rule.aliases.some(alias => 
        nameLower.includes(alias) || userDataNameLower.includes(alias)
      );
      
      
      const isExcluded = rule.exclude && rule.exclude.some(excl => 
        nameLower.includes(excl) || userDataNameLower.includes(excl)
      );

      if (matchesAlias && !isExcluded) {
        if (!this.mappings[rule.key]) {
          this.mappings[rule.key] = [];
        }
        if (!this.mappings[rule.key].some(item => item.uuid === mesh.uuid)) {
          this.mappings[rule.key].push(entry);
        }
      }
    }
  }

  


  getMeshesForOrgan(organKey) {
    return this.mappings[organKey] || [];
  }

  


  getMeshIdsForOrgan(organKey) {
    const list = this.getMeshesForOrgan(organKey);
    return list.map(entry => entry.object.userData?.meshId || entry.uuid);
  }

  


  getOrganForMesh(meshId) {
    if (!meshId) return null;
    for (const [organKey, list] of Object.entries(this.mappings)) {
      const match = list.some(entry => {
        const id = entry.object.userData?.meshId || entry.uuid;
        return id === meshId || entry.uuid === meshId;
      });
      if (match) return organKey;
    }
    return null;
  }

  


  print() {
    console.log("=================================================================================");
    console.log("                       B I O V E R S E   X   O R G A N   R E G I S T R Y         ");
    console.log("=================================================================================");
    console.log(`Total Registered Meshes: ${this.meshes.size}`);
    console.log("Logical Organ Mappings:");
    
    for (const [organKey, list] of Object.entries(this.mappings)) {
      console.log(`  - ${organKey.toUpperCase()} (${list.length} meshes):`);
      list.forEach(entry => {
        console.log(`     * name: "${entry.name}" | parent: "${entry.parentName}" | UUID: ${entry.uuid}`);
      });
    }
    console.log("=================================================================================");
  }

  


  clear() {
    this.meshes.clear();
    this.mappings = {};
  }
}


window.OrganRegistry = OrganRegistry;
