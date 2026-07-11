





'use strict';




const ORGAN_FOCUS_DATA = {

  heart: {
    name: 'Heart',
    system: 'circulatory',
    systemName: 'Circulatory System',
    systemColor: '#ef4444',
    emoji: '❤️',
    meshId: 'circ_heart',
    camera: { pivotY: -1.00, rotY: -0.18, rotX: 0.18, zoom: 2.40 },
    highlightColor: 0xff3333,
    stats: [
      { icon: '💓', value: '100,000', label: 'Beats per day' },
      { icon: '🩸', value: '5 L/min', label: 'Cardiac output' },
      { icon: '⚖️', value: '300 g', label: 'Average weight' },
    ],
    tagline: 'The body\'s tireless pump — beating over 2.5 billion times in a lifetime without rest.',
    description: `The heart is a hollow, cone-shaped muscular organ roughly the size of a clenched fist, located in the mediastinum slightly left of the sternum. It contains four chambers: two atria (receiving chambers) and two ventricles (pumping chambers), divided by a muscular wall called the septum.

It operates as a dual-action pump simultaneously maintaining two circulation loops. The right side pumps deoxygenated blood through the lungs (pulmonary circulation), while the more powerful left side drives oxygenated blood throughout the entire body (systemic circulation) at pressures reaching 120 mmHg.

Rhythm originates in the sinoatrial (SA) node — the heart's natural pacemaker — cascading through the AV node and His-Purkinje conduction system to produce each synchronized beat.`,
    functions: [
      'Pumps oxygenated blood to all 37 trillion body cells',
      'Returns deoxygenated blood to the lungs for reoxygenation',
      'Maintains blood pressure through precise contraction force',
      'Adapts cardiac output instantly to exercise, stress, and rest',
    ],
    funFact: 'In a 70-year lifetime, your heart beats approximately 2.5 billion times — never stopping, not even between beats. The electrical signal that triggers each heartbeat travels at 0.5 m/s through cardiac muscle.',
  },

  brain: {
    name: 'Brain',
    system: 'nervous',
    systemName: 'Nervous System',
    systemColor: '#a855f7',
    emoji: '🧠',
    meshId: 'nerve_cerebrum',
    camera: { pivotY: -2.90, rotY: 0.0, rotX: -0.08, zoom: 2.60 },
    highlightColor: 0xc084fc,
    stats: [
      { icon: '⚡', value: '86 billion', label: 'Neurons' },
      { icon: '🔋', value: '20%', label: 'Body\'s oxygen' },
      { icon: '⚖️', value: '1.4 kg', label: 'Average weight' },
    ],
    tagline: 'The most complex structure in the known universe — orchestrating every thought, sensation, memory, and movement.',
    description: `The human brain is the metabolic engine of the body — consuming 20% of all oxygen and glucose despite comprising just 2% of body weight. It contains approximately 86 billion neurons, each forming thousands of synaptic connections, for a total synaptic count exceeding 100 trillion.

The cerebrum (largest region) is divided into four lobes: the frontal lobe governs decision-making and motor control; the parietal lobe integrates sensory information; the temporal lobe handles language and memory; and the occipital lobe is dedicated to visual processing.

Deeper structures are equally critical: the cerebellum coordinates fine motor movement and balance; the brainstem regulates automatic life-sustaining functions (breathing, heart rate, blood pressure); the hypothalamus controls hormonal output and homeostasis; and the hippocampus consolidates short-term memories into long-term storage.`,
    functions: [
      'Controls all conscious thought, emotion, and voluntary movement',
      'Processes and encodes memories across distributed networks',
      'Regulates automatic body functions via the brainstem',
      'Integrates all sensory input — sight, sound, touch, smell, taste',
    ],
    funFact: 'If all the neural pathways in a single human brain were unraveled end to end, they would stretch ~150,000 km — enough to circle the Earth nearly four times. The brain also generates roughly 12–25 watts of electricity — enough to power a low-watt LED bulb.',
  },

  lungs: {
    name: 'Lungs',
    system: 'respiratory',
    systemName: 'Respiratory System',
    systemColor: '#22d3ee',
    emoji: '🫁',
    meshId: 'resp_l_lung',
    camera: { pivotY: -1.60, rotY: -0.25, rotX: 0.12, zoom: 2.20 },
    highlightColor: 0x38bdf8,
    stats: [
      { icon: '🌬️', value: '23,000', label: 'Breaths per day' },
      { icon: '🔬', value: '480 million', label: 'Alveoli' },
      { icon: '📐', value: '70 m²', label: 'Surface area' },
    ],
    tagline: 'Paired spongy organs that exchange life-sustaining oxygen for carbon dioxide 23,000 times every day.',
    description: `The lungs are paired spongy organs filling most of the thoracic cavity. The right lung has three lobes; the left has two, with a cardiac notch to accommodate the heart. Each lung is enclosed in a double-layered pleural membrane that allows frictionless expansion.

From the trachea, airways branch exponentially — trachea → bronchi → bronchioles → terminal bronchioles — ending in approximately 480 million microscopic alveoli. Each alveolus (0.2 mm diameter) is surrounded by capillary beds where gas exchange occurs: oxygen diffuses into blood while carbon dioxide diffuses out, driven purely by concentration gradients.

Flattened out, all alveolar surfaces together would cover ~70 m² — the size of a tennis court — enabling simultaneous oxygenation of the entire cardiac output of 5 litres per minute.`,
    functions: [
      'Transfer inhaled oxygen across the alveolar membrane into blood',
      'Remove metabolic CO₂ waste from circulating blood',
      'Regulate blood pH by controlling carbonic acid levels',
      'Provide airflow for vocalization via the larynx and vocal cords',
    ],
    funFact: 'You breathe approximately 11,000 litres of air per day — enough to fill two bathtubs every hour. Yet only about 5% of the oxygen in each breath is actually absorbed; the rest is exhaled.',
  },

  liver: {
    name: 'Liver',
    system: 'digestive',
    systemName: 'Digestive System',
    systemColor: '#f59e0b',
    emoji: '🫀',
    meshId: 'dig_liver',
    camera: { pivotY: -0.80, rotY: 0.35, rotX: 0.20, zoom: 2.35 },
    highlightColor: 0xfbbf24,
    stats: [
      { icon: '⚗️', value: '500+', label: 'Known functions' },
      { icon: '⚖️', value: '1.5 kg', label: 'Largest organ' },
      { icon: '🩸', value: '1.5 L/min', label: 'Blood processed' },
    ],
    tagline: 'The body\'s master chemist — the largest internal organ performing over 500 documented vital functions.',
    description: `The liver is the largest solid internal organ (1.4–1.6 kg), located in the upper right abdomen under the diaphragm. It receives a unique dual blood supply: oxygenated blood via the hepatic artery, and nutrient-rich blood from the gastrointestinal tract via the portal vein — making it the first organ to process absorbed nutrients.

With over 500 documented functions, the liver's metabolic role is unrivaled: it detoxifies drugs, alcohol, and metabolic byproducts; synthesizes clotting factors, albumin, and other plasma proteins; produces ~500–1,000 mL of bile daily to emulsify dietary fats; regulates blood glucose via glycogen storage and gluconeogenesis; and converts excess amino acids into urea for excretion.

The liver is also the only internal solid organ capable of complete regeneration. Following a 75% resection, it can restore its original mass within 8–12 weeks through a process of compensatory hepatocyte proliferation.`,
    functions: [
      'Detoxifies blood from drugs, alcohol, and metabolic byproducts',
      'Produces bile for fat digestion and fat-soluble vitamin absorption',
      'Synthesizes plasma proteins (albumin, fibrinogen, clotting factors)',
      'Regulates blood glucose, cholesterol, and amino acid metabolism',
    ],
    funFact: 'Remove 75% of the liver and it will fully regenerate in 8–12 weeks. This is the basis for living-donor liver transplants, where a donor\'s segment grows back to full size in both donor and recipient.',
  },

  kidneys: {
    name: 'Kidneys',
    system: 'digestive',
    systemName: 'Urinary System',
    systemColor: '#8b5cf6',
    emoji: '🫘',
    meshId: 'organ_kidney_l',
    camera: { pivotY: -0.50, rotY: 0.18, rotX: 0.30, zoom: 2.20 },
    highlightColor: 0xa78bfa,
    stats: [
      { icon: '🔁', value: '180 L', label: 'Blood filtered/day' },
      { icon: '💧', value: '1.5 L', label: 'Urine produced/day' },
      { icon: '🔬', value: '1 million', label: 'Nephrons each' },
    ],
    tagline: 'Two bean-shaped precision filters — processing the body\'s entire blood volume every 30 minutes.',
    description: `The kidneys are paired retroperitoneal organs, each approximately 11 cm long and 150 g, flanking the vertebral column at the T12–L3 level. Their primary function is filtration: every 30 minutes, the kidneys filter the body's entire blood volume — approximately 180 litres per day — producing 1.5–2 litres of concentrated urine as waste.

Each kidney contains roughly 1 million nephrons — microscopic functional units consisting of a glomerulus (filtration ball) and tubular system. The nephron selectively reabsorbs glucose, amino acids, electrolytes, and water back into the blood, while allowing urea, creatinine, and other waste products to pass into the urine.

Beyond filtration, kidneys are critical endocrine organs: they produce erythropoietin (EPO) to stimulate red blood cell synthesis; secrete renin to regulate blood pressure via the renin-angiotensin-aldosterone system; and activate vitamin D for calcium absorption.`,
    functions: [
      'Filter 180 litres of blood daily to produce urine',
      'Maintain electrolyte balance (Na⁺, K⁺, Ca²⁺, HCO₃⁻)',
      'Regulate blood pressure through the renin-angiotensin system',
      'Produce EPO (stimulates red blood cells) and activate vitamin D',
    ],
    funFact: 'Each kidney\'s million nephrons contain ~40 miles (64 km) of tubules. A single kidney — even at reduced function — can sustain life completely, which is why living kidney donation is medically safe.',
  },

  stomach: {
    name: 'Stomach',
    system: 'digestive',
    systemName: 'Digestive System',
    systemColor: '#f97316',
    emoji: '🫃',
    meshId: 'dig_stomach',
    camera: { pivotY: -0.70, rotY: -0.22, rotX: 0.22, zoom: 2.50 },
    highlightColor: 0xfb923c,
    stats: [
      { icon: '⚗️', value: 'pH 1.5', label: 'Acid strength' },
      { icon: '📐', value: '4 litres', label: 'Max capacity' },
      { icon: '⏱️', value: '2–4 hrs', label: 'Digestion time' },
    ],
    tagline: 'A muscular J-shaped bioreactor that churns, sterilizes, and chemically disassembles every meal you eat.',
    description: `The stomach is a hollow, J-shaped muscular organ in the upper left abdomen, capable of expanding from a resting volume of ~75 mL to over 4 litres when full. Its wall contains three layers of smooth muscle oriented in different directions, enabling the powerful churning contractions (peristalsis) that mechanically break food into small particles.

Millions of gastric glands lining the stomach produce a potent mixture: hydrochloric acid (pH 1.5–3.5) to denature proteins and sterilize food, pepsinogen (activated to pepsin by HCl) to begin protein digestion, and intrinsic factor essential for vitamin B12 absorption.

The resulting semi-liquid mass — chyme — is released in controlled pulses through the pyloric sphincter into the duodenum, where pancreatic enzymes and bile take over for full chemical digestion.`,
    functions: [
      'Stores up to 4 litres of ingested food and liquid',
      'Secretes HCl and pepsin to begin protein digestion',
      'Mechanically churns food into chyme via smooth muscle peristalsis',
      'Sterilizes ingested pathogens with its extreme acidity',
    ],
    funFact: 'Stomach acid (pH 1.5–2.0) is chemically comparable to battery acid and strong enough to dissolve razor blades. Your stomach lining replaces itself completely every 3–5 days to prevent self-digestion.',
  },

  thymus: {
    name: 'Thymus Gland',
    system: 'immune',
    systemName: 'Immune System',
    systemColor: '#06b6d4',
    emoji: '🛡️',
    meshId: 'thymus',
    camera: { pivotY: -1.30, rotY: -0.05, rotX: 0.15, zoom: 2.20 },
    highlightColor: 0xf472b6,
    stats: [
      { icon: '🎓', value: 'T-Cells', label: 'Cell maturation' },
      { icon: '⚖️', value: '30 g', label: 'Max size (puberty)' },
      { icon: '🍂', value: 'Involution', label: 'Shrinks with age' },
    ],
    tagline: 'The boot camp of the immune system, where T-lymphocytes learn to fight pathogens.',
    description: `The thymus is a specialized primary lymphoid organ located in the superior mediastinum of the thoracic cavity, directly anterior to the heart and posterior to the sternum. It is most active and largest during infancy and childhood.

Its primary role is to serve as the training site for immature T-lymphocytes (T-cells) arriving from bone marrow. Through positive and negative selection, the thymus trains T-cells to recognize foreign invaders while eliminating cells that would attack the body's own tissues (self-tolerance).`,
    functions: [
      'Promotes T-lymphocyte maturation via hormone secretions like thymosin',
      'Performs positive selection to ensure T-cells recognize MHC molecules',
      'Performs negative selection to eliminate self-reactive autoimmune T-cells',
      'Builds the body\'s early adaptive immune memory pool',
    ],
    funFact: 'The thymus is the only organ that shrinks naturally as you get older. After puberty, it undergoes a process called involution, where functional lymphatic tissue is gradually replaced by fat, though it continues to produce T-cells at a lower rate.',
  },

  spleen: {
    name: 'Spleen',
    system: 'immune',
    systemName: 'Immune System',
    systemColor: '#06b6d4',
    emoji: '🟣',
    meshId: 'spleen',
    camera: { pivotY: -0.60, rotY: 0.35, rotX: 0.22, zoom: 2.10 },
    highlightColor: 0x8b5cf6,
    stats: [
      { icon: '🩸', value: 'Blood filter', label: 'Primary role' },
      { icon: '🛡️', value: 'Monocytes', label: 'Cell reserve' },
      { icon: '⚖️', value: '150 g', label: 'Average weight' },
    ],
    tagline: 'The body\'s blood filter — destroying old red cells and deploying white cells to fight infection.',
    description: `The spleen is the largest secondary lymphoid organ, located in the upper left quadrant of the abdomen, tucked under the rib cage and protected by the 9th to 11th ribs. It is divided into red pulp and white pulp.

The red pulp acts as a mechanical filter, destroying worn-out or damaged red blood cells and recycling their iron. The white pulp functions as a lymphoid hub, containing dense populations of T and B cells that scan blood-borne pathogens and initiate immune responses.`,
    functions: [
      'Filters blood to remove old, damaged, or abnormal red blood cells',
      'Mounts immune responses against blood-borne bacteria and viruses',
      'Stores a massive reserve of platelets and monocytes for emergency deployment',
      'Recycles iron from degraded hemoglobin to make new red blood cells',
    ],
    funFact: 'The spleen can contract during heavy exercise or major blood loss, squeezing up to a cup of stored blood back into circulation to boost oxygen delivery. If the spleen is surgically removed, other organs (like the liver and lymph nodes) take over its red cell filtering duties.',
  },

  bone_marrow: {
    name: 'Bone Marrow',
    system: 'immune',
    systemName: 'Immune System',
    systemColor: '#06b6d4',
    emoji: '🦴',
    meshId: 'bone_marrow',
    camera: { pivotY: -1.00, rotY: -0.40, rotX: 0.18, zoom: 2.05 },
    highlightColor: 0xef4444,
    stats: [
      { icon: '🏭', value: 'Hematopoiesis', label: 'Cell factory' },
      { icon: '🩸', value: '200 billion', label: 'RBCs per day' },
      { icon: '🔬', value: 'Stem Cells', label: 'Origin source' },
    ],
    tagline: 'The body\'s blood cell factory — generating billions of immune and red cells inside your bones every day.',
    description: `Bone marrow is the soft, gelatinous tissue that fills the medullary cavities of bones. It exists in two forms: red marrow (hematopoietic) and yellow marrow (mostly fat). In adults, active red marrow is concentrated in flat bones (skull, ribs, pelvis) and the heads of long bones.

The hematopoietic stem cells in red marrow divide and differentiate into all blood lineages: erythrocytes (red blood cells), thrombocytes (platelets), and leukocytes (white blood cells, including B-lymphocytes, granulocytes, and monocyte precursors).`,
    functions: [
      'Performs hematopoiesis to generate red blood cells, platelets, and white blood cells',
      'Creates B-lymphocytes and natural killer (NK) cells of the immune system',
      'Hosts macrophage populations that destroy old cells and recycle iron',
      'Maintains a reservoir of mesenchymal stem cells for bone and fat repair',
    ],
    funFact: 'Your bone marrow produces about 200 billion red blood cells and 100 billion white blood cells every single day. If your body goes into severe shock or anemia, yellow marrow can convert back into active red marrow to boost cell production.',
  },

  lymph_nodes: {
    name: 'Lymph Nodes',
    system: 'immune',
    systemName: 'Immune System',
    systemColor: '#06b6d4',
    emoji: '🟢',
    meshId: 'lymph_nodes',
    camera: { pivotY: -1.20, rotY: -0.15, rotX: 0.15, zoom: 2.10 },
    highlightColor: 0x10b981,
    stats: [
      { icon: '🟢', value: '600+', label: 'Nodes in body' },
      { icon: '🧪', value: 'Lymph', label: 'Fluid filtered' },
      { icon: '🔬', value: 'T & B Cells', label: 'Pathogen scanners' },
    ],
    tagline: 'Microscopic filtration hubs that trap pathogens and alert immune defenses.',
    description: `Lymph nodes are small, bean-shaped structures distributed along lymphatic vessels throughout the body, clustered heavily in the neck, armpits, and groin. They act as filters for the lymphatic fluid that drains from body tissues.

Each lymph node is enclosed in a fibrous capsule and contains compartments filled with lymphocytes (T and B cells) and antigen-presenting cells. As lymph fluid percolates through the node, macrophages engulf foreign particles while lymphocytes scan for antigens, multiplying rapidly to initiate an immune response if any are detected.`,
    functions: [
      'Filters foreign substances, cellular debris, and pathogens from lymph fluid',
      'Serves as primary site of antigen presentation and lymphocyte activation',
      'Facilitates B-cell maturation and antibody production during infections',
      'Drains interstitial fluid back into venous circulation to maintain blood volume',
    ],
    funFact: 'When you get sick, the lymph nodes in your neck swell. This "swollen gland" effect is actually the result of millions of lymphocytes multiplying inside the nodes to build a massive defense army against the invading pathogen.',
  },

  appendix: {
    name: 'Appendix',
    system: 'immune',
    systemName: 'Immune System',
    systemColor: '#06b6d4',
    emoji: '🪱',
    meshId: 'appendix',
    camera: { pivotY: -0.40, rotY: 0.25, rotX: 0.25, zoom: 2.30 },
    highlightColor: 0xec4899,
    stats: [
      { icon: '🪱', value: 'Tube-like', label: 'Structure' },
      { icon: '🦠', value: 'Safe House', label: 'Good bacteria' },
      { icon: '🛡️', value: 'GALT', label: 'Local immunity' },
    ],
    tagline: 'A small pouch that serves as a safe house for beneficial gut bacteria and local immune support.',
    description: `The appendix (vermiform appendix) is a small, blind-ended tube-like pouch extending from the cecum of the large intestine, located in the lower right abdomen. Traditionally considered a vestigial organ, it contains highly concentrated lymphoid tissue.

Modern immunology recognizes it as a crucial component of gut-associated lymphoid tissue (GALT). It acts as a safe house for beneficial gut bacteria, allowing them to repopulate the colon after a diarrheal illness, and aids in training local immune responses.`,
    functions: [
      'Serves as a reservoir or "safe house" for beneficial gut bacteria',
      'Contains lymphoid tissue that samples gut antigens to train local immune cells',
      'Produces immunoglobulins (IgA) to help manage intestinal microbiota levels',
      'Contributes to mucosal immunity and limits local pathogen spread',
    ],
    funFact: 'For decades, doctors believed the appendix had no function at all. However, researchers have found that people who have had their appendix removed are slightly more prone to recurring gut infections, supporting its role as a bacterial backup drive.',
  },
};




class OrganFocusController {
  constructor() {
    this.active = null;
    this.pulseMesh = null;
    this.pulseOriginalEmissive = 0x000000;
    this.haloMesh = null;
    this.panelEl = document.getElementById('organ-info-panel');
    this.quickBarEl = document.getElementById('organ-quick-bar');

    
    this._preFocusZoom = 1.0;
    this._preFocusRotY = 0;
    this._preFocusRotX = 0.05;

    this._buildQuickBar();
    this._bindPanelClose();
  }

  
  _buildQuickBar() {
    if (!this.quickBarEl) return;
    this.quickBarEl.innerHTML = '';

    for (const [key, data] of Object.entries(ORGAN_FOCUS_DATA)) {
      const btn = document.createElement('button');
      btn.className = 'organ-quick-btn';
      btn.id = `oqb-${key}`;
      btn.setAttribute('data-organ', key);
      btn.setAttribute('aria-label', `Explore ${data.name}`);
      btn.style.setProperty('--organ-color', data.systemColor);
      btn.innerHTML = `<span class="oqb-emoji">${data.emoji}</span><span class="oqb-name">${data.name}</span>`;
      btn.addEventListener('click', () => this.selectOrgan(key));
      this.quickBarEl.appendChild(btn);
    }
  }

  
  async selectOrgan(organKey) {
    const data = ORGAN_FOCUS_DATA[organKey];
    if (!data) return;

    const isDeselect = this.active === organKey;

    
    if (isDeselect) {
      this.clearFocus();
      return;
    }

    this.active = organKey;

    
    if (window.bioExplorer) {
      this._preFocusZoom = window.bioExplorer.targetZoom;
      this._preFocusRotY = window.bioExplorer.targetRotY;
      this._preFocusRotX = window.bioExplorer.targetRotX;
    }

    
    document.querySelectorAll('.organ-quick-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.organ === organKey);
    });

    
    if (window.bioExplorer) {
      await window.bioExplorer.switchSystem(data.system);
    }
    if (window.bioHierarchy) window.bioHierarchy.render(data.system);
    if (window.bioNav) window.bioNav.updateSidebarSelection(data.system);

    
    if (window.bioExplorer) window.bioExplorer.setOpacity(100);

    
    this._highlightMesh(data);
    this._focusCamera(data);

    
    this._showPanel(organKey);
  }

  
  _resolveMeshes(data) {
    if (!window.bioExplorer) return [];

    let list = [];
    if (window.bioExplorer.organRegistry) {
      
      let organKey = data.name ? data.name.toLowerCase() : null;
      if (organKey) {
        
        let candidates = [organKey];
        if (organKey.endsWith('s')) candidates.push(organKey.slice(0, -1));
        else candidates.push(organKey + 's');

        for (const key of candidates) {
          list = window.bioExplorer.organRegistry.getMeshesForOrgan(key).map(e => e.object);
          if (list.length > 0) {
            console.log(`[OrganFocus] Mapped logical organ '${data.name}' to ${list.length} meshes in OrganRegistry.`);
            break;
          }
        }
      }
    }

    
    if (list.length === 0) {
      const mesh = window.bioExplorer.meshRegistry[data.meshId];
      if (mesh) {
        list = [mesh];
      }
    }

    
    if (list.length > 0) {
      const explorer = window.bioExplorer;
      const activeSystem = explorer.activeSystem || 'fullBody';
      const container = explorer.anatomyContainer;
      list = list.filter(mesh => {
        if (!mesh) return false;
        
        
        if (mesh.visible === false) return false;

        
        if (activeSystem !== 'fullBody' && mesh.userData?.systemKey !== activeSystem) {
          return false;
        }

        
        if (container) {
          let inHierarchy = false;
          let curr = mesh;
          while (curr) {
            if (curr === container) {
              inHierarchy = true;
              break;
            }
            curr = curr.parent;
          }
          if (!inHierarchy) return false;
        }

        
        const nameLower = (mesh.name || '').toLowerCase();
        const userDataNameLower = (mesh.userData?.organName || '').toLowerCase();
        if (nameLower.endsWith('.t') || userDataNameLower.endsWith('.t') || /\.t$/i.test(mesh.name)) {
          return false;
        }
        const isHelper = /helper|proxy|placeholder|duplicate|copy|temp|ghost|bounds|bbox|collider|marker|anchor|outline|indicator/i.test(nameLower) ||
                         /helper|proxy|placeholder|duplicate|copy|temp|ghost|bounds|bbox|collider|marker|anchor|outline|indicator/i.test(userDataNameLower);
        if (isHelper) return false;

        
        const isSegmentOrHelperPart = /segment|surface|border|division|impression|part|area|curvature|wall|pole|hilum|fissure|root|notch/i.test(nameLower) ||
                                      /segment|surface|border|division|impression|part|area|curvature|wall|pole|hilum|fissure|root|notch/i.test(userDataNameLower);
        
        const isMajorOrgan = /liver|lung|kidney|heart|stomach|hepat|renal|gastr|pylor/i.test(nameLower) ||
                             /liver|lung|kidney|heart|stomach|hepat|renal|gastr|pylor/i.test(userDataNameLower);
        if (isMajorOrgan && isSegmentOrHelperPart) {
          return false;
        }

        return true;
      });
    }

    return list;
  }

  _highlightMesh(data) {
    if (!window.bioExplorer) return;
    const meshes = this._resolveMeshes(data);
    if (!meshes || meshes.length === 0) return;

    
    this._clearHighlight();

    this.pulseMeshes = meshes;
    this.pulseOriginalEmissives = new Map();
    this._origScales = new Map();

    meshes.forEach(mesh => {
      if (mesh.material && mesh.material.emissive) {
        this.pulseOriginalEmissives.set(mesh.uuid, mesh.material.emissive.getHex());
      }
      this._origScales.set(mesh.uuid, { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z });
      const isLungsOrHeart = data.name === 'Lungs' || data.name === 'Heart';
      if (!isLungsOrHeart) {
        mesh.scale.multiplyScalar(1.12);
      }
    });
  }

  _clearHighlight() {
    if (this.pulseMeshes) {
      this.pulseMeshes.forEach(mesh => {
        try {
          const origEm = this.pulseOriginalEmissives.get(mesh.uuid);
          if (origEm !== undefined && mesh.material && mesh.material.emissive) {
            mesh.material.emissive.setHex(origEm);
          }
          const origSc = this._origScales.get(mesh.uuid);
          if (origSc) {
            mesh.scale.set(origSc.x, origSc.y, origSc.z);
          }
        } catch(e) {}
      });
      this.pulseMeshes = null;
      this.pulseOriginalEmissives = null;
      this._origScales = null;
    }
  }

  
  _addHalo(data) {
    
  }

  _removeHalo() {
    if (this.haloMesh && window.bioExplorer) {
      window.bioExplorer.pivot.remove(this.haloMesh);
      this.haloMesh.geometry.dispose();
      this.haloMesh.material.dispose();
      this.haloMesh = null;
    }
  }

  
  _focusCamera(data) {
    if (!window.bioExplorer) return;
    const preset = data.camera;
    const meshes = this._resolveMeshes(data);

    
    if (meshes.length > 0) {
      window.bioExplorer.focusOnObject(meshes, preset.rotY, preset.rotX, preset.zoom);
      console.log(`[OrganFocus] Camera → Focused on combined bounding box of resolved meshes for '${data.name}' with zoom=${preset.zoom}`);
    } else if (preset.pivotY !== undefined) {
      const ex = window.bioExplorer;
      ex.targetPivotOffsetY = preset.pivotY;
      ex.targetRotY         = preset.rotY  ?? 0;
      ex.targetRotX         = preset.rotX  ?? 0.05;
      ex.targetZoom         = preset.zoom  ?? 1.8;
      ex.isFlying           = true;
      console.log(`[OrganFocus] Camera (Fallback) → pivotY=${preset.pivotY}, rotY=${preset.rotY}, rotX=${preset.rotX}, zoom=${preset.zoom}`);
    } else {
      window.bioExplorer.targetRotY = preset.rotY;
      window.bioExplorer.targetRotX = preset.rotX;
      window.bioExplorer.targetZoom = preset.zoom;
      window.bioExplorer.isFlying   = true;
    }

    
    const zSlider = document.getElementById('zoom-slider');
    const zDisp = document.getElementById('zoom-display');
    if (zSlider) zSlider.value = Math.round(preset.zoom * 100);
    if (zDisp) zDisp.textContent = `${preset.zoom.toFixed(1)}×`;
  }

  
  _showPanel(organKey) {
    const data = ORGAN_FOCUS_DATA[organKey];
    if (!data || !this.panelEl) return;

    
    this.panelEl.style.setProperty('--panel-color', data.systemColor);
    this.panelEl.style.setProperty('--panel-color-alpha', this._hexToAlpha(data.systemColor, 0.12));
    this.panelEl.style.setProperty('--panel-color-border', this._hexToAlpha(data.systemColor, 0.28));
    this.panelEl.style.setProperty('--panel-gradient',
      `linear-gradient(90deg, ${data.systemColor}, #7b2fff)`);

    
    const el = (id) => document.getElementById(id);
    if (el('oip-emoji')) el('oip-emoji').textContent = data.emoji;
    if (el('oip-organ-name')) el('oip-organ-name').textContent = data.name;
    if (el('oip-system-badge')) el('oip-system-badge').textContent = data.systemName;
    if (el('oip-tagline')) el('oip-tagline').textContent = data.tagline;

    
    const statsEl = document.getElementById('oip-stats');
    if (statsEl) {
      statsEl.innerHTML = data.stats.map(s => `
        <div class="oip-stat">
          <span class="oip-stat-icon">${s.icon}</span>
          <span class="oip-stat-value">${s.value}</span>
          <span class="oip-stat-label">${s.label}</span>
        </div>
      `).join('');
    }

    
    if (el('oip-description')) el('oip-description').textContent = data.description;

    
    const funcEl = document.getElementById('oip-functions');
    if (funcEl) {
      funcEl.innerHTML = data.functions.map(f => `<li>${f}</li>`).join('');
    }

    
    if (el('oip-fun-fact')) el('oip-fun-fact').textContent = data.funFact;

    
    const accentBar = this.panelEl.querySelector('.oip-accent-bar');
    if (accentBar) {
      accentBar.style.background = `linear-gradient(90deg, ${data.systemColor}, #7b2fff)`;
    }

    
    requestAnimationFrame(() => {
      this.panelEl.classList.add('visible');
      this.panelEl.setAttribute('aria-hidden', 'false');
    });
  }

  _hidePanel() {
    if (this.panelEl) {
      this.panelEl.classList.remove('visible');
      this.panelEl.setAttribute('aria-hidden', 'true');
    }
  }

  
  clearFocus() {
    this.active = null;
    this._clearHighlight();
    this._removeHalo();
    this._hidePanel();

    
    if (window.bioExplorer) {
      window.bioExplorer.targetZoom = this._preFocusZoom;
      window.bioExplorer.targetRotY = this._preFocusRotY;
      window.bioExplorer.targetRotX = this._preFocusRotX;
    }

    
    if (window.bioExplorer) window.bioExplorer.setOpacity(100);

    
    document.querySelectorAll('.organ-quick-btn').forEach(b => b.classList.remove('active'));
  }

  
  update(time) {
    
    if (this.pulseMeshes) {
      try {
        const organKey = this.active;
        const data = organKey ? ORGAN_FOCUS_DATA[organKey] : null;
        const pulse = 0.5; 
        const hexColor = data?.highlightColor || 0x00d4ff;
        const r = ((hexColor >> 16) & 0xff) / 255;
        const g = ((hexColor >> 8) & 0xff) / 255;
        const b = (hexColor & 0xff) / 255;
        this.pulseMeshes.forEach(mesh => {
          if (mesh.material && mesh.material.emissive) {
            mesh.material.emissive.setRGB(r * pulse * 0.9, g * pulse * 0.9, b * pulse * 0.9);
          }
        });
      } catch(e) {}
    }

  }

  
  _bindPanelClose() {
    document.getElementById('oip-close-btn')?.addEventListener('click', () => this.clearFocus());

    
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.active) this.clearFocus();
    });
  }


  
  _hexToAlpha(hex, alpha) {
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}


window.addEventListener('bioOrganSelected', (e) => {
  if (!window.bioFocus) return;
  const { meshId } = e.detail;

  
  let organKey = null;
  if (window.bioExplorer && window.bioExplorer.organRegistry) {
    organKey = window.bioExplorer.organRegistry.getOrganForMesh(meshId);
    
    if (organKey === 'kidney' && ORGAN_FOCUS_DATA['kidneys']) {
      organKey = 'kidneys';
    }
  }

  
  if (organKey && ORGAN_FOCUS_DATA[organKey]) {
    if (window.bioFocus.active !== organKey) {
      window.bioFocus.selectOrgan(organKey);
    }
    return;
  }

  
  for (const [key, data] of Object.entries(ORGAN_FOCUS_DATA)) {
    if (data.meshId === meshId || 
        (data.meshId && meshId && (
          meshId.replace('_l', '').replace('_r', '') === data.meshId.replace('_l', '').replace('_r', '') ||
          meshId.replace('_l_gland', '').replace('_r_gland', '') === data.meshId.replace('_l', '').replace('_r', '') ||
          meshId.includes(data.meshId) ||
          data.meshId.includes(meshId)
        ))) {
      
      if (window.bioFocus.active !== key) {
        window.bioFocus.selectOrgan(key);
      }
      break;
    }
  }
});

window.OrganFocusController = OrganFocusController;
window.ORGAN_FOCUS_DATA = ORGAN_FOCUS_DATA;
