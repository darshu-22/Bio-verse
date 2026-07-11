




'use strict';

const BioAnatomyData = {

  systems: {

    skeletal: {
      name: 'Skeletal System',
      icon: '🦴',
      color: '#d4d4d8',
      lightColor: 0xd4d4d8,
      emissive: 0x2a2a2a,
      specular: 0xffffff,
      shininess: 120,
      stat1: { value: '206', label: 'Bones' },
      stat2: { value: '360', label: 'Joints' },
      description: 'The skeletal system provides structural support, protects vital organs, enables movement, and produces blood cells in bone marrow.',
      didYouKnow: 'Bone is 5× stronger than steel by weight. The femur can support 30× your body weight.',
      hierarchy: [
        {
          id: 'skull',
          label: 'Skull',
          expanded: true,
          children: [
            { id: 'cranium', label: 'Cranium', meshId: 'bone_skull' },
            { id: 'mandible', label: 'Mandible', meshId: 'bone_mandible' },
            { id: 'maxilla', label: 'Maxilla', meshId: 'bone_skull' },
          ]
        },
        {
          id: 'axial',
          label: 'Axial Skeleton',
          expanded: false,
          children: [
            { id: 'vertebrae', label: 'Vertebral Column', meshId: 'bone_spine' },
            { id: 'ribcage', label: 'Rib Cage', meshId: 'bone_ribs' },
            { id: 'sternum', label: 'Sternum', meshId: 'bone_sternum' },
          ]
        },
        {
          id: 'upper_limb',
          label: 'Upper Limbs',
          expanded: false,
          children: [
            { id: 'clavicle', label: 'Clavicle', meshId: 'bone_clavicle' },
            { id: 'scapula', label: 'Scapula', meshId: 'bone_scapula' },
            { id: 'humerus_l', label: 'Humerus (L)', meshId: 'bone_l_upper_arm' },
            { id: 'humerus_r', label: 'Humerus (R)', meshId: 'bone_r_upper_arm' },
            { id: 'radius_l', label: 'Radius/Ulna (L)', meshId: 'bone_l_forearm' },
            { id: 'radius_r', label: 'Radius/Ulna (R)', meshId: 'bone_r_forearm' },
          ]
        },
        {
          id: 'lower_limb',
          label: 'Lower Limbs',
          expanded: false,
          children: [
            { id: 'pelvis', label: 'Pelvis', meshId: 'bone_pelvis' },
            { id: 'femur_l', label: 'Femur (L)', meshId: 'bone_l_thigh' },
            { id: 'femur_r', label: 'Femur (R)', meshId: 'bone_r_thigh' },
            { id: 'tibia_l', label: 'Tibia/Fibula (L)', meshId: 'bone_l_shin' },
            { id: 'tibia_r', label: 'Tibia/Fibula (R)', meshId: 'bone_r_shin' },
            { id: 'patella', label: 'Patella', meshId: 'bone_l_kneecap' },
          ]
        }
      ]
    },

    muscular: {
      name: 'Muscular System',
      icon: '💪',
      color: '#f43f5e',
      lightColor: 0xf43f5e,
      emissive: 0x4c0519,
      specular: 0xfda4af,
      shininess: 80,
      stat1: { value: '640', label: 'Muscles' },
      stat2: { value: '40%', label: 'Body Weight' },
      description: 'The muscular system enables all body movement, maintains posture, generates heat, and supports vital organ function through three muscle types.',
      didYouKnow: 'The gluteus maximus is the largest muscle; the stapedius (inner ear) is the smallest. It takes 17 muscles to smile.',
      hierarchy: [
        {
          id: 'head_neck_m',
          label: 'Head & Neck',
          expanded: false,
          children: [
            { id: 'frontalis', label: 'Frontalis', meshId: 'mus_frontalis' },
            { id: 'temporalis', label: 'Temporalis', meshId: 'mus_temporalis' },
            { id: 'sternocleidomastoid', label: 'Sternocleidomastoid', meshId: 'mus_scm' },
          ]
        },
        {
          id: 'trunk_m',
          label: 'Trunk',
          expanded: true,
          children: [
            { id: 'pectoralis', label: 'Pectoralis Major', meshId: 'mus_pec_l' },
            { id: 'rectus_ab', label: 'Rectus Abdominis', meshId: 'mus_abs_0' },
            { id: 'obliques', label: 'External Obliques', meshId: 'mus_oblique_l' },
            { id: 'trapezius', label: 'Trapezius', meshId: 'mus_trap' },
            { id: 'latissimus', label: 'Latissimus Dorsi', meshId: 'mus_lats' },
          ]
        },
        {
          id: 'upper_arm_m',
          label: 'Upper Limb',
          expanded: false,
          children: [
            { id: 'deltoid', label: 'Deltoid', meshId: 'mus_deltoid_l' },
            { id: 'biceps', label: 'Biceps Brachii', meshId: 'mus_bicep_l' },
            { id: 'triceps', label: 'Triceps Brachii', meshId: 'mus_tricep_l' },
            { id: 'forearm_flex', label: 'Forearm Flexors', meshId: 'mus_forearm_l' },
          ]
        },
        {
          id: 'lower_limb_m',
          label: 'Lower Limb',
          expanded: false,
          children: [
            { id: 'gluteus', label: 'Gluteus Maximus', meshId: 'mus_glute_l' },
            { id: 'quadriceps', label: 'Quadriceps', meshId: 'mus_quad_l' },
            { id: 'hamstrings', label: 'Hamstrings', meshId: 'mus_hamstring_l' },
            { id: 'gastrocnemius', label: 'Gastrocnemius', meshId: 'mus_calf_l' },
          ]
        }
      ]
    },

    nervous: {
      name: 'Nervous System',
      icon: '🧠',
      color: '#a855f7',
      lightColor: 0xa855f7,
      emissive: 0x2e1065,
      specular: 0xd8b4fe,
      shininess: 80,
      stat1: { value: '86B', label: 'Neurons' },
      stat2: { value: '120m/s', label: 'Signal Speed' },
      description: 'The nervous system is the body\'s command center, coordinating all body activities through electrical impulses transmitted through billions of neurons.',
      didYouKnow: 'Neural pathways in one brain, if laid end to end, would circle the Earth several times. The brain generates enough power to light a dim bulb.',
      hierarchy: [
        {
          id: 'cns',
          label: 'Central Nervous System',
          expanded: true,
          children: [
            { id: 'cerebrum', label: 'Cerebrum', meshId: 'nerve_cerebrum' },
            { id: 'cerebellum', label: 'Cerebellum', meshId: 'nerve_cerebellum' },
            { id: 'brainstem', label: 'Brain Stem', meshId: 'nerve_brainstem' },
            { id: 'spinal_cord', label: 'Spinal Cord', meshId: 'nerve_spinal' },
          ]
        },
        {
          id: 'pns',
          label: 'Peripheral Nervous System',
          expanded: false,
          children: [
            { id: 'cervical_plexus', label: 'Cervical Plexus', meshId: 'nerve_cervical' },
            { id: 'brachial_plexus', label: 'Brachial Plexus', meshId: 'nerve_brachial' },
            { id: 'lumbar_plexus', label: 'Lumbar Plexus', meshId: 'nerve_lumbar' },
            { id: 'sciatic', label: 'Sciatic Nerve', meshId: 'nerve_sciatic_l' },
          ]
        },
        {
          id: 'ans',
          label: 'Autonomic NS',
          expanded: false,
          children: [
            { id: 'sympathetic', label: 'Sympathetic Chain', meshId: 'nerve_sympathetic' },
            { id: 'vagus', label: 'Vagus Nerve', meshId: 'nerve_vagus' },
          ]
        }
      ]
    },

    circulatory: {
      name: 'Circulatory System',
      icon: '❤️',
      color: '#ef4444',
      lightColor: 0xef4444,
      emissive: 0x450a0a,
      specular: 0xfca5a5,
      shininess: 100,
      stat1: { value: '100K', label: 'Beats/Day' },
      stat2: { value: '96K km', label: 'Blood Vessels' },
      description: 'The circulatory system transports oxygen, nutrients, hormones, and waste products throughout the body via the heart, arteries, veins, and capillaries.',
      didYouKnow: 'Your heart beats over 2.5 billion times in a lifetime without rest. Blood vessels laid end-to-end would circle Earth 2.5 times.',
      hierarchy: [
        {
          id: 'heart_chambers',
          label: 'Heart',
          expanded: true,
          children: [
            { id: 'l_ventricle', label: 'Left Ventricle', meshId: 'circ_heart' },
            { id: 'r_ventricle', label: 'Right Ventricle', meshId: 'circ_heart' },
            { id: 'l_atrium', label: 'Left Atrium', meshId: 'circ_heart' },
            { id: 'r_atrium', label: 'Right Atrium', meshId: 'circ_heart' },
          ]
        },
        {
          id: 'arteries',
          label: 'Major Arteries',
          expanded: false,
          children: [
            { id: 'aorta', label: 'Aorta', meshId: 'circ_aorta' },
            { id: 'pulm_artery', label: 'Pulmonary Artery', meshId: 'circ_pulm_artery' },
            { id: 'carotid', label: 'Carotid Arteries', meshId: 'circ_carotid' },
            { id: 'femoral_art', label: 'Femoral Artery', meshId: 'circ_femoral_art_l' },
          ]
        },
        {
          id: 'veins',
          label: 'Major Veins',
          expanded: false,
          children: [
            { id: 'vena_cava_sup', label: 'Superior Vena Cava', meshId: 'circ_vena_cava_sup' },
            { id: 'vena_cava_inf', label: 'Inferior Vena Cava', meshId: 'circ_vena_cava_inf' },
            { id: 'jugular', label: 'Jugular Veins', meshId: 'circ_jugular' },
            { id: 'pulm_vein', label: 'Pulmonary Veins', meshId: 'circ_pulm_vein' },
          ]
        }
      ]
    },

    digestive: {
      name: 'Digestive System',
      icon: '🫀',
      color: '#f59e0b',
      lightColor: 0xf59e0b,
      emissive: 0x451a03,
      specular: 0xfde68a,
      shininess: 60,
      stat1: { value: '9m', label: 'GI Length' },
      stat2: { value: '30 hrs', label: 'Transit' },
      description: 'The digestive system breaks down food into absorbable nutrients, extracts energy, and eliminates waste through a series of coordinated organs.',
      didYouKnow: 'Your gut contains 100 trillion bacteria — more than the number of human cells. This microbiome weighs up to 2 kg.',
      hierarchy: [
        {
          id: 'upper_gi',
          label: 'Upper GI Tract',
          expanded: true,
          children: [
            { id: 'esophagus', label: 'Esophagus', meshId: 'dig_esophagus' },
            { id: 'stomach', label: 'Stomach', meshId: 'dig_stomach' },
            { id: 'duodenum', label: 'Duodenum', meshId: 'dig_duodenum' },
          ]
        },
        {
          id: 'accessory',
          label: 'Accessory Organs',
          expanded: false,
          children: [
            { id: 'liver', label: 'Liver', meshId: 'dig_liver' },
            { id: 'gallbladder', label: 'Gallbladder', meshId: 'dig_gallbladder' },
            { id: 'pancreas', label: 'Pancreas', meshId: 'dig_pancreas' },
          ]
        },
        {
          id: 'lower_gi',
          label: 'Lower GI Tract',
          expanded: false,
          children: [
            { id: 'small_intestine', label: 'Small Intestine', meshId: 'dig_small_int' },
            { id: 'large_intestine', label: 'Large Intestine', meshId: 'dig_large_int' },
            { id: 'rectum', label: 'Rectum', meshId: 'dig_rectum' },
          ]
        },
        {
          id: 'urinary',
          label: 'Urinary System',
          expanded: false,
          children: [
            { id: 'kidney_l', label: 'Left Kidney', meshId: 'organ_kidney_l' },
            { id: 'kidney_r', label: 'Right Kidney', meshId: 'organ_kidney_r' },
            { id: 'ureter_l', label: 'Left Ureter', meshId: 'organ_ureter_l' },
            { id: 'ureter_r', label: 'Right Ureter', meshId: 'organ_ureter_r' },
            { id: 'adrenal_l', label: 'Left Adrenal Gland', meshId: 'organ_adrenal_l' },
            { id: 'adrenal_r', label: 'Right Adrenal Gland', meshId: 'organ_adrenal_r' },
          ]
        }
      ]
    },

    respiratory: {
      name: 'Respiratory System',
      icon: '🫁',
      color: '#22d3ee',
      lightColor: 0x22d3ee,
      emissive: 0x083344,
      specular: 0xcffafe,
      shininess: 80,
      stat1: { value: '23K', label: 'Breaths/Day' },
      stat2: { value: '480M', label: 'Alveoli' },
      description: 'The respiratory system facilitates gas exchange — bringing oxygen into the blood and expelling carbon dioxide — sustaining every cell in the body.',
      didYouKnow: 'Your lungs spread flat would cover a tennis court (70m²). You breathe about 11,000 litres of air each day.',
      hierarchy: [
        {
          id: 'upper_resp',
          label: 'Upper Airways',
          expanded: true,
          children: [
            { id: 'nasal_cavity', label: 'Nasal Cavity', meshId: 'resp_nasal' },
            { id: 'pharynx', label: 'Pharynx', meshId: 'resp_pharynx' },
            { id: 'larynx', label: 'Larynx', meshId: 'resp_larynx' },
            { id: 'trachea', label: 'Trachea', meshId: 'resp_trachea' },
          ]
        },
        {
          id: 'lungs',
          label: 'Lungs',
          expanded: false,
          children: [
            { id: 'l_lung', label: 'Left Lung', meshId: 'resp_l_lung' },
            { id: 'r_lung', label: 'Right Lung', meshId: 'resp_r_lung' },
            { id: 'bronchi', label: 'Primary Bronchi', meshId: 'resp_bronchi_l' },
            { id: 'bronchioles', label: 'Bronchioles', meshId: 'resp_bronchioles' },
            { id: 'alveoli', label: 'Alveoli', meshId: 'resp_alveoli' },
          ]
        },
        {
          id: 'breathing_muscles',
          label: 'Breathing Muscles',
          expanded: false,
          children: [
            { id: 'diaphragm', label: 'Diaphragm', meshId: 'resp_diaphragm' },
            { id: 'intercostals', label: 'Intercostals', meshId: 'resp_intercostals' },
          ]
        }
      ]
    },
  },

  
  
  organs: {

    
    skull: {
      type: 'Bone structure',
      location: 'Head',
      function: 'The skull is a bony casing of 22 bones that completely encases and shields the brain from physical trauma. It also forms the eye sockets, nasal cavity, and jaw framework, housing the organs of sight, smell, taste, and hearing.'
    },
    cranium: {
      type: 'Bone',
      location: 'Head',
      function: 'The cranium is formed by 8 fused bones — the frontal, two parietal, two temporal, occipital, sphenoid, and ethmoid — that interlock at immovable suture joints. Together they create a rigid, dome-shaped vault that absorbs and distributes impact forces to protect the brain.'
    },
    mandible: {
      type: 'Bone',
      location: 'Face',
      function: 'The mandible is the lower jaw and the only movable bone of the skull, articulating with the temporal bone at the temporomandibular joint (TMJ). It bears the lower teeth and plays a central role in chewing (mastication), speaking, and facial expression.'
    },
    maxilla: {
      type: 'Bone',
      location: 'Face',
      function: 'The maxilla is a paired bone that forms the upper jaw, the floor and sides of the nasal cavity, and the floor of the eye socket (orbit). It anchors the upper teeth and contributes to the hard palate, separating the oral and nasal cavities.'
    },
    vertebrae: {
      type: 'Bone series',
      location: 'Back',
      function: 'The vertebral column consists of 33 vertebrae (7 cervical, 12 thoracic, 5 lumbar, 5 fused sacral, 4 fused coccygeal) that form a flexible but protective column around the spinal cord. Intervertebral discs between vertebrae act as shock absorbers, and the spinal curvature (lordosis/kyphosis) distributes body weight efficiently.'
    },
    ribcage: {
      type: 'Bone structure',
      location: 'Chest',
      function: 'The rib cage is a semi-rigid enclosure of 12 pairs of ribs that protects the heart, lungs, and major vessels from mechanical injury. The first 7 pairs attach directly to the sternum (true ribs); ribs 8–10 attach via costal cartilage (false ribs); ribs 11–12 are floating ribs. The cage also assists breathing by expanding and contracting during respiration.'
    },
    sternum: {
      type: 'Bone',
      location: 'Chest',
      function: 'The sternum (breastbone) is a flat, T-shaped bone running down the centre of the chest that anchors the costal cartilages of the ribs and forms the anterior boundary of the thoracic cage. It is composed of the manubrium, body (gladiolus), and xiphoid process, and provides attachment for chest muscles and ligaments.'
    },
    clavicle: {
      type: 'Long bone',
      location: 'Shoulder',
      function: 'The clavicle (collarbone) is an S-shaped bone that acts as a structural strut, connecting the shoulder girdle (scapula) to the axial skeleton (sternum). It transmits forces from the upper limb to the trunk and protects the underlying brachial plexus and subclavian vessels.'
    },
    scapula: {
      type: 'Flat bone',
      location: 'Upper back',
      function: 'The scapula (shoulder blade) is a large, triangular flat bone that sits against the posterior thorax and serves as the attachment point for 17 muscles of the shoulder and upper arm. Its glenoid cavity forms the socket of the glenohumeral (shoulder) joint, allowing the wide range of arm movement.'
    },
    humerus_l: {
      type: 'Long bone',
      location: 'Left upper arm',
      function: 'The humerus is the single long bone of the upper arm, articulating proximally at the shoulder (glenohumeral joint) and distally at the elbow (humeroulnar and humeroradial joints). It provides attachment for all major muscles that move the arm and forearm, including the deltoid, biceps, and triceps.'
    },
    humerus_r: {
      type: 'Long bone',
      location: 'Right upper arm',
      function: 'The humerus is the single long bone of the upper arm, articulating proximally at the shoulder (glenohumeral joint) and distally at the elbow (humeroulnar and humeroradial joints). It provides attachment for all major muscles that move the arm and forearm, including the deltoid, biceps, and triceps.'
    },
    radius_l: {
      type: 'Long bone pair',
      location: 'Left forearm',
      function: 'The radius and ulna are the two bones of the forearm that work in tandem. The radius rotates around the ulna to produce pronation and supination of the hand, and together they provide the precise lever mechanics needed for grip strength and fine motor tasks at the wrist.'
    },
    radius_r: {
      type: 'Long bone pair',
      location: 'Right forearm',
      function: 'The radius and ulna are the two bones of the forearm that work in tandem. The radius rotates around the ulna to produce pronation and supination of the hand, and together they provide the precise lever mechanics needed for grip strength and fine motor tasks at the wrist.'
    },
    pelvis: {
      type: 'Bone structure',
      location: 'Trunk/Hip',
      function: 'The pelvis is a bony ring formed by two hip bones (ilium, ischium, pubis), the sacrum, and the coccyx, acting as a mechanical bridge that transmits forces between the axial skeleton and the lower limbs. It also protects the reproductive organs, bladder, and rectum, and provides attachment for the powerful muscles of the hip and thigh.'
    },
    femur_l: {
      type: 'Long bone',
      location: 'Left thigh',
      function: 'The femur is the longest, heaviest, and strongest bone in the human body, capable of withstanding compressive forces up to 30 times body weight. It articulates with the pelvis at the hip joint superiorly and with the tibia and patella at the knee joint inferiorly.'
    },
    femur_r: {
      type: 'Long bone',
      location: 'Right thigh',
      function: 'The femur is the longest, heaviest, and strongest bone in the human body, capable of withstanding compressive forces up to 30 times body weight. It articulates with the pelvis at the hip joint superiorly and with the tibia and patella at the knee joint inferiorly.'
    },
    tibia_l: {
      type: 'Long bone',
      location: 'Left lower leg',
      function: 'The tibia (shinbone) is the main weight-bearing bone of the lower leg, transmitting forces from the knee to the ankle. The fibula runs alongside it laterally and, while non-weight-bearing, provides muscle attachment points and stabilises the ankle mortise joint.'
    },
    tibia_r: {
      type: 'Long bone',
      location: 'Right lower leg',
      function: 'The tibia (shinbone) is the main weight-bearing bone of the lower leg, transmitting forces from the knee to the ankle. The fibula runs alongside it laterally and, while non-weight-bearing, provides muscle attachment points and stabilises the ankle mortise joint.'
    },
    patella: {
      type: 'Sesamoid bone',
      location: 'Knee',
      function: 'The patella (kneecap) is the largest sesamoid bone in the body, embedded within the quadriceps tendon. It improves the mechanical advantage of the quadriceps by increasing the lever arm at the knee, reducing tendon wear, and protecting the underlying articular cartilage of the knee joint.'
    },

    
    frontalis: {
      type: 'Skeletal muscle',
      location: 'Forehead',
      function: 'The frontalis is the broad flat muscle of the forehead that elevates the eyebrows, creating horizontal forehead wrinkles, and contributes to facial expressions of surprise or concern. It has no bony origin and instead attaches to the galea aponeurotica (a fibrous scalp layer).'
    },
    temporalis: {
      type: 'Skeletal muscle',
      location: 'Temple (side of head)',
      function: 'The temporalis is a powerful fan-shaped muscle of mastication that elevates (closes) the mandible and retracts a protruded jaw. It is one of the primary chewing muscles and can generate forces exceeding 200 N at the molars.'
    },
    sternocleidomastoid: {
      type: 'Skeletal muscle',
      location: 'Neck',
      function: 'The sternocleidomastoid (SCM) is a paired neck muscle that, when contracting unilaterally, rotates the head to the opposite side and tilts it toward the same shoulder. Bilateral contraction flexes the neck and raises the sternum during forced inspiration, making it an accessory breathing muscle.'
    },
    pectoralis: {
      type: 'Skeletal muscle',
      location: 'Chest',
      function: 'Pectoralis major is the large fan-shaped muscle covering the anterior chest that adducts, medially rotates, and flexes the humerus at the shoulder joint. It is the primary muscle used in pushing movements (e.g., bench press) and also assists with forced expiration by compressing the thorax.'
    },
    rectus_ab: {
      type: 'Skeletal muscle',
      location: 'Anterior abdomen',
      function: 'The rectus abdominis runs vertically down the front of the abdomen between the sternum and pubis, separated into sections by tendinous intersections (the visible "six-pack"). It flexes the lumbar spine, compresses abdominal viscera, stabilises the pelvis, and assists in forced expiration and childbirth.'
    },
    obliques: {
      type: 'Skeletal muscle',
      location: 'Lateral abdomen',
      function: 'The external obliques are the outermost of three flat abdominal muscles, with fibres running diagonally downward and medially from the lower ribs to the iliac crest and linea alba. They rotate and laterally flex the trunk, compress the abdomen, and contribute to forced expiration and coughing.'
    },
    trapezius: {
      type: 'Skeletal muscle',
      location: 'Upper back and neck',
      function: 'The trapezius is a large diamond-shaped muscle spanning from the skull and cervical/thoracic vertebrae to the clavicle, acromion, and spine of the scapula. Its upper fibres elevate the scapula (shrugging), middle fibres retract it, and lower fibres depress it — together enabling full shoulder mobility.'
    },
    latissimus: {
      type: 'Skeletal muscle',
      location: 'Mid and lower back',
      function: 'The latissimus dorsi is the broadest muscle in the body, spanning from the lower thoracic vertebrae, lumbar fascia, iliac crest, and lower ribs to the intertubercular groove of the humerus. It powerfully adducts, extends, and medially rotates the arm, and is the prime mover in pulling and rowing actions.'
    },
    deltoid: {
      type: 'Skeletal muscle',
      location: 'Shoulder',
      function: 'The deltoid wraps over the shoulder in three parts (anterior, middle, posterior) and is the primary abductor of the arm, raising it laterally to 90°. The anterior head flexes and medially rotates the arm, while the posterior head extends and laterally rotates it, making the deltoid essential for all overhead and throwing movements.'
    },
    biceps: {
      type: 'Skeletal muscle',
      location: 'Anterior upper arm',
      function: 'The biceps brachii has two heads (long and short) originating on the scapula and inserting on the radial tuberosity and bicipital aponeurosis. Its primary actions are supination of the forearm and flexion of the elbow, and it is most powerful when the forearm is supinated (palm up).'
    },
    triceps: {
      type: 'Skeletal muscle',
      location: 'Posterior upper arm',
      function: 'The triceps brachii is the only muscle on the back of the upper arm and the sole extensor of the elbow joint. Its three heads (long, medial, lateral) converge on the olecranon process of the ulna, and it is essential for all pushing movements such as pressing and throwing.'
    },
    forearm_flex: {
      type: 'Skeletal muscle group',
      location: 'Anterior forearm',
      function: 'The forearm flexor group (including flexor carpi radialis, palmaris longus, and flexor digitorum superficialis) originates from the medial epicondyle of the humerus and acts on the wrist and fingers. They flex the wrist and digits, enabling gripping, writing, and fine manipulation tasks.'
    },
    gluteus: {
      type: 'Skeletal muscle',
      location: 'Buttock',
      function: 'The gluteus maximus is the largest and most superficial gluteal muscle, running from the iliac crest, sacrum, and coccyx to the iliotibial band and femur. It is the primary extensor and lateral rotator of the hip, powering climbing stairs, rising from a chair, sprinting, and maintaining upright posture.'
    },
    quadriceps: {
      type: 'Skeletal muscle group',
      location: 'Anterior thigh',
      function: 'The quadriceps femoris is a group of four muscles (rectus femoris, vastus lateralis, vastus medialis, vastus intermedius) that converge on the quadriceps tendon and patella. They are the primary extensors of the knee joint and are essential for walking, running, jumping, and absorbing landing forces.'
    },
    hamstrings: {
      type: 'Skeletal muscle group',
      location: 'Posterior thigh',
      function: 'The hamstrings (biceps femoris, semitendinosus, semimembranosus) originate from the ischial tuberosity and insert below the knee. They flex the knee, extend the hip, and act as dynamic stabilisers during walking and running, decelerating the swinging leg before heel strike.'
    },
    gastrocnemius: {
      type: 'Skeletal muscle',
      location: 'Posterior lower leg (calf)',
      function: 'The gastrocnemius forms the visible bulk of the calf and has two heads originating on the femoral condyles, merging with the soleus to form the calcaneal (Achilles) tendon. It powerfully plantar-flexes the ankle for walking, running, and jumping, and also weakly flexes the knee.'
    },

    
    cerebrum: {
      type: 'Brain region',
      location: 'Head (anterior/superior)',
      function: 'The cerebrum is the largest part of the brain, divided into left and right hemispheres connected by the corpus callosum. It governs higher functions including voluntary movement, sensory perception, language, memory, reasoning, and personality through its highly folded cerebral cortex.'
    },
    cerebellum: {
      type: 'Brain region',
      location: 'Posterior head (hindbrain)',
      function: 'The cerebellum ("little brain") contains over 50% of the brain\'s neurons despite being only 10% of its volume. It fine-tunes voluntary movements, coordinates muscle timing and force, maintains balance and equilibrium, and is critical for motor learning — such as acquiring new physical skills.'
    },
    brainstem: {
      type: 'Brain region',
      location: 'Base of brain',
      function: 'The brainstem (midbrain, pons, medulla oblongata) is the oldest part of the brain evolutionarily and controls vital automatic functions including heart rate, blood pressure, breathing rhythm, and sleep–wake cycles. It also relays all signals between the cerebrum, cerebellum, and spinal cord, and contains the nuclei of 10 of the 12 cranial nerves.'
    },
    spinal_cord: {
      type: 'CNS structure',
      location: 'Vertebral canal (C1–L1)',
      function: 'The spinal cord is a 45 cm-long cylinder of nervous tissue running through the vertebral canal that serves as the main highway between the brain and the rest of the body. It also independently processes spinal reflexes (such as the patellar reflex), giving it a degree of autonomous sensorimotor function.'
    },
    cervical_plexus: {
      type: 'Nerve plexus',
      location: 'Neck (C1–C4)',
      function: 'The cervical plexus is a network of nerve fibres from spinal roots C1–C4 that supplies sensation to the skin of the head, neck, and upper chest, and motor innervation to several neck muscles. Most notably, it gives rise to the phrenic nerve (C3–C5), the sole motor nerve to the diaphragm.'
    },
    brachial_plexus: {
      type: 'Nerve plexus',
      location: 'Neck and axilla (C5–T1)',
      function: 'The brachial plexus is a complex network of spinal roots (C5–T1) that gives rise to all the major nerves supplying the entire upper limb, including the median, ulnar, radial, musculocutaneous, and axillary nerves. Injury to this plexus (e.g., during birth or trauma) can cause weakness, paralysis, or loss of sensation in the arm and hand.'
    },
    lumbar_plexus: {
      type: 'Nerve plexus',
      location: 'Posterior abdominal wall (L1–L4)',
      function: 'The lumbar plexus arises from spinal roots L1–L4 within the psoas major muscle and supplies motor and sensory innervation to the anterior and medial thigh. Its major branches include the femoral nerve (quadriceps, hip flexors) and the obturator nerve (adductors).'
    },
    sciatic: {
      type: 'Peripheral nerve',
      location: 'Posterior thigh and leg',
      function: 'The sciatic nerve is the widest and longest nerve in the body, formed from roots L4–S3, exiting the pelvis through the greater sciatic foramen below the piriformis. It innervates the hamstrings and all muscles of the lower leg and foot, and carries sensation from most of the leg and the entire foot.'
    },
    sympathetic: {
      type: 'Autonomic nerve chain',
      location: 'Bilateral to vertebral column (T1–L2)',
      function: 'The sympathetic chain is a paired ganglionated trunk running alongside the vertebral column that mediates the "fight-or-flight" response. Activation releases adrenaline, increases heart rate and blood pressure, dilates pupils and airways, shunts blood to skeletal muscles, and suppresses digestion.'
    },
    vagus: {
      type: 'Cranial nerve (CN X)',
      location: 'Neck, thorax, and abdomen',
      function: 'The vagus nerve is the longest cranial nerve, carrying parasympathetic ("rest-and-digest") fibres to the heart, lungs, and abdominal organs. It slows heart rate, stimulates digestion, regulates inflammation, and plays a key role in the gut–brain axis, linking gut health to mood and cognition.'
    },

    
    l_ventricle: {
      type: 'Heart chamber',
      location: 'Heart (left side)',
      function: 'The left ventricle is the most muscular chamber of the heart, with walls up to 12 mm thick, and is responsible for pumping oxygenated blood into the aorta and throughout the systemic circulation at high pressure (~120 mmHg). Its forceful contraction creates the pulse felt at the wrist and neck.'
    },
    r_ventricle: {
      type: 'Heart chamber',
      location: 'Heart (right side)',
      function: 'The right ventricle pumps deoxygenated blood through the pulmonary artery to the lungs for oxygenation. It operates at much lower pressure (~25 mmHg) than the left ventricle, reflecting the shorter, low-resistance pulmonary circuit it serves.'
    },
    l_atrium: {
      type: 'Heart chamber',
      location: 'Heart (left, superior)',
      function: 'The left atrium receives freshly oxygenated blood returning from the lungs via the four pulmonary veins. It acts as a primer pump, pushing blood through the mitral valve into the left ventricle just before ventricular contraction, and its appendage is the most common site of clot formation in atrial fibrillation.'
    },
    r_atrium: {
      type: 'Heart chamber',
      location: 'Heart (right, superior)',
      function: 'The right atrium receives deoxygenated blood from the systemic circulation via the superior and inferior venae cavae, and coronary sinus drainage from the heart muscle itself. It houses the sinoatrial (SA) node — the heart\'s natural pacemaker — which generates the electrical impulse that drives each heartbeat.'
    },
    aorta: {
      type: 'Artery',
      location: 'Thorax and abdomen',
      function: 'The aorta is the largest artery in the body (diameter ~2.5 cm) and the root of the systemic circulation, carrying oxygenated blood from the left ventricle. It arches upward from the heart, descends through the thorax and abdomen, and bifurcates into the two common iliac arteries at L4, giving rise to all major branches along the way.'
    },
    pulm_artery: {
      type: 'Artery',
      location: 'Thorax',
      function: 'The pulmonary trunk and its left and right branches carry deoxygenated blood from the right ventricle to the lungs — uniquely, these are arteries that carry oxygen-poor blood. After branching extensively within each lung, blood passes through the pulmonary capillaries where CO₂ is exchanged for O₂.'
    },
    carotid: {
      type: 'Artery pair',
      location: 'Neck',
      function: 'The common carotid arteries (one on each side) are the principal blood supply to the head and neck, each dividing at the level of C4 into the internal carotid (supplying the brain and eye) and external carotid (supplying the face and scalp). The carotid sinus contains baroreceptors that monitor blood pressure and help regulate it.'
    },
    femoral_art: {
      type: 'Artery',
      location: 'Anterior thigh',
      function: 'The femoral artery is the main blood supply to the lower limb, continuing from the external iliac artery below the inguinal ligament. It passes through the femoral triangle and adductor canal, giving off the deep femoral artery before becoming the popliteal artery behind the knee. Its pulse is palpable in the groin and is commonly used for arterial access procedures.'
    },
    vena_cava_sup: {
      type: 'Vein',
      location: 'Upper thorax',
      function: 'The superior vena cava (SVC) is a large, short vein (7 cm long) formed by the union of the right and left brachiocephalic veins that drains all deoxygenated blood from the head, neck, upper limbs, and upper thorax into the right atrium. It carries approximately one-third of venous return to the heart.'
    },
    vena_cava_inf: {
      type: 'Vein',
      location: 'Abdomen and lower thorax',
      function: 'The inferior vena cava (IVC) is the largest vein in the body, formed by the union of the two common iliac veins at L5. It ascends the right side of the posterior abdomen, collecting blood from the lower limbs, abdominal organs, and kidneys before entering the right atrium, carrying approximately two-thirds of total venous return.'
    },
    jugular: {
      type: 'Vein pair',
      location: 'Neck',
      function: 'The internal jugular veins are large vessels running alongside the carotid arteries that drain blood from the brain, face, and neck, returning it to the brachiocephalic veins and then the superior vena cava. Jugular venous pressure (JVP) is a clinical marker of right heart function and fluid status, visibly pulsating in the neck.'
    },
    pulm_vein: {
      type: 'Vein (oxygenated)',
      location: 'Thorax',
      function: 'The four pulmonary veins (two from each lung) are the only veins in the adult body that carry fully oxygenated blood, transporting it from the pulmonary capillaries to the left atrium. Their unique role highlights that "artery" and "vein" are defined by direction relative to the heart, not oxygen content.'
    },

    
    esophagus: {
      type: 'Organ',
      location: 'Throat and chest (C6–T11)',
      function: 'The esophagus is a 25 cm muscular tube that transports food from the pharynx to the stomach via coordinated peristaltic waves within 8–10 seconds. Its walls have two sphincters: the upper esophageal sphincter prevents air from entering during breathing, and the lower esophageal sphincter prevents acid reflux from the stomach.'
    },
    stomach: {
      type: 'Organ',
      location: 'Upper left abdomen',
      function: 'The stomach is a J-shaped muscular organ that mechanically churns food with its three muscle layers and chemically digests protein using hydrochloric acid (pH 1.5–3.5) and pepsin secreted by gastric glands. It stores up to 1.5 litres of food and releases chyme in small amounts through the pyloric valve into the duodenum over 2–4 hours.'
    },
    duodenum: {
      type: 'Organ',
      location: 'Upper right abdomen',
      function: 'The duodenum is the first and shortest (~25 cm) section of the small intestine, where the most intensive chemical digestion occurs. It receives acidic chyme from the stomach, bile from the gallbladder, and pancreatic enzymes — all of which neutralise the acid and break down proteins, fats, and carbohydrates before absorption in the jejunum.'
    },
    liver: {
      type: 'Organ',
      location: 'Right upper abdomen',
      function: 'The liver is the largest internal organ (~1.5 kg) and performs over 500 vital metabolic functions: metabolising glucose, lipids, and amino acids; detoxifying drugs, alcohol, and metabolic waste; synthesising plasma proteins (albumin, clotting factors); and producing ~600–1000 ml of bile daily for fat emulsification. It also stores glycogen, vitamins A/D/B12, and iron.'
    },
    gallbladder: {
      type: 'Organ',
      location: 'Under the liver (right abdomen)',
      function: 'The gallbladder is a pear-shaped sac (7–10 cm) that stores and concentrates bile produced by the liver up to 5-fold by absorbing water and electrolytes. When fat enters the duodenum, cholecystokinin (CCK) triggers contraction, releasing bile through the cystic duct and common bile duct to emulsify dietary fats and facilitate absorption of fat-soluble vitamins (A, D, E, K).'
    },
    pancreas: {
      type: 'Organ (exocrine + endocrine)',
      location: 'Retroperitoneum, behind stomach',
      function: 'The pancreas has a dual role: its exocrine acinar cells secrete 1–2 litres/day of pancreatic juice (containing proteases, lipases, amylase) into the duodenum for digestion. Its endocrine islets of Langerhans produce insulin (lowers blood glucose), glucagon (raises blood glucose), and somatostatin — hormones critical for blood sugar homeostasis.'
    },
    small_intestine: {
      type: 'Organ',
      location: 'Central abdomen',
      function: 'The small intestine (~6 m long: duodenum, jejunum, ileum) is the primary site of nutrient absorption in the body. Its inner surface is amplified 600-fold by circular folds, finger-like villi, and microscopic microvilli (the "brush border"), providing ~200 m² of absorptive surface — roughly the area of a tennis court.'
    },
    large_intestine: {
      type: 'Organ',
      location: 'Periphery of abdomen',
      function: 'The large intestine (~1.5 m: cecum, colon, rectum) absorbs water and electrolytes from indigestible material, converting liquid chyme into formed stool over 12–48 hours. It houses ~100 trillion microorganisms (the gut microbiome) that ferment fibre, produce vitamins B12 and K, regulate immunity, and influence mood via the gut–brain axis.'
    },
    rectum: {
      type: 'Organ',
      location: 'Pelvis',
      function: 'The rectum is the final 12–15 cm of the large intestine that stores faeces until voluntary defecation. Stretch receptors in its wall trigger the urge to defecate; the internal anal sphincter (involuntary smooth muscle) relaxes reflexively, while the external anal sphincter (voluntary skeletal muscle) allows conscious control of elimination.'
    },
    kidney_l: {
      type: 'Organ',
      location: 'Left retroperitoneum (T12–L2)',
      function: 'The left kidney filters approximately 180 litres of blood each day through ~1 million nephron units, producing ~1.5 litres of urine. Each kidney also regulates blood pH, electrolyte balance, blood pressure (via the renin–angiotensin system), and red blood cell production (by secreting erythropoietin, EPO).'
    },
    kidney_r: {
      type: 'Organ',
      location: 'Right retroperitoneum (L1–L3)',
      function: 'The right kidney sits slightly lower than the left due to the liver above it. It performs the same vital filtration functions: removing metabolic waste (urea, creatinine), regulating water balance, controlling blood pressure via renin secretion, and activating vitamin D to maintain calcium homeostasis.'
    },
    ureter_l: {
      type: 'Duct',
      location: 'Left retroperitoneum',
      function: 'The left ureter is a 25–30 cm muscular tube that conveys urine from the renal pelvis of the left kidney to the urinary bladder by peristaltic contractions (1–5 waves/min). Its smooth muscle walls can generate pressure to overcome any gravity gradient, allowing urine transport even when lying down.'
    },
    ureter_r: {
      type: 'Duct',
      location: 'Right retroperitoneum',
      function: 'The right ureter is a 25–30 cm muscular tube that conveys urine from the renal pelvis of the right kidney to the urinary bladder by peristaltic contractions (1–5 waves/min). Kidney stones most commonly obstruct at three natural narrowings: the ureteropelvic junction, the pelvic brim crossing, and the ureterovesical junction.'
    },
    adrenal_l: {
      type: 'Endocrine gland',
      location: 'Superior pole of left kidney',
      function: 'The left adrenal gland is a pyramid-shaped gland with two functional zones: the cortex secretes corticosteroids (cortisol for stress response, aldosterone for sodium/water balance, androgens for secondary sex characteristics), while the medulla secretes catecholamines (adrenaline and noradrenaline) during the fight-or-flight response.'
    },
    adrenal_r: {
      type: 'Endocrine gland',
      location: 'Superior pole of right kidney',
      function: 'The right adrenal gland mirrors its left counterpart in function. Its cortex produces cortisol, aldosterone, and sex hormones, while its medulla releases adrenaline and noradrenaline. Adrenal insufficiency (Addison\'s disease) causes fatigue, low blood pressure, and electrolyte imbalances that can be life-threatening without hormone replacement.'
    },

    
    nasal_cavity: {
      type: 'Airway',
      location: 'Face (between nostrils and pharynx)',
      function: 'The nasal cavity filters inhaled air through mucus-coated hairs (cilia) that trap particles as small as 10 µm, warms it to body temperature using a rich capillary network, and humidifies it to 100% relative humidity — all within milliseconds of inhalation. The olfactory epithelium lining its roof detects ~10,000 different odour molecules.'
    },
    pharynx: {
      type: 'Airway and foodway',
      location: 'Throat (behind nasal cavity and mouth)',
      function: 'The pharynx is a 12 cm muscular funnel shared by both the respiratory and digestive tracts. The nasopharynx conducts air only; the oropharynx and laryngopharynx handle both air and food. During swallowing, the epiglottis folds over the larynx to prevent food entering the airway — a reflex taking less than 1 second.'
    },
    larynx: {
      type: 'Airway / Voice box',
      location: 'Anterior neck (C3–C6)',
      function: 'The larynx is a cartilaginous framework (including the thyroid cartilage, the prominent "Adam\'s apple") that protects the airway and houses the vocal cords. Airflow vibrates the vocal cords at 80–1000 Hz to produce speech; the pitch is controlled by the tension of the cords regulated by the intrinsic laryngeal muscles.'
    },
    trachea: {
      type: 'Airway',
      location: 'Anterior neck and upper chest (C6–T4)',
      function: 'The trachea is a 10–12 cm tube reinforced by 16–20 C-shaped rings of hyaline cartilage that prevent collapse during inhalation. Its interior is lined with ciliated mucous epithelium (the mucociliary escalator) that beats 1,000 times/min to sweep trapped particles and pathogens upward toward the pharynx for removal.'
    },
    l_lung: {
      type: 'Organ',
      location: 'Left thorax',
      function: 'The left lung is slightly smaller than the right (due to the cardiac notch accommodating the heart) and is divided into two lobes (superior and inferior) by the oblique fissure. It contains roughly 240 million alveoli with a total gas-exchange surface area of ~70 m² and receives ~0.5 litres of fresh air per breath at rest.'
    },
    r_lung: {
      type: 'Organ',
      location: 'Right thorax',
      function: 'The right lung is larger than the left and divided into three lobes (upper, middle, lower) by the oblique and horizontal fissures. The right main bronchus is wider, shorter, and more vertical than the left, which is why inhaled foreign objects most commonly lodge in the right lung.'
    },
    bronchi: {
      type: 'Airway',
      location: 'Thorax (within lungs)',
      function: 'The primary (main) bronchi branch from the trachea at the carina and enter each lung at the hilum, then divide into secondary (lobar) and tertiary (segmental) bronchi. The branching continues through ~23 generations of increasingly smaller airways until the gas-exchange alveoli are reached.'
    },
    bronchioles: {
      type: 'Airway (small)',
      location: 'Lungs',
      function: 'Bronchioles are airways less than 1 mm in diameter that lack cartilage, relying entirely on smooth muscle tone and elastic recoil to stay open. Terminal bronchioles are the last purely conducting airways; respiratory bronchioles begin the transition zone where gas exchange starts. In asthma, bronchiole smooth muscle spasm causes the characteristic wheeze and breathlessness.'
    },
    alveoli: {
      type: 'Microstructure',
      location: 'Lungs (alveolar sacs)',
      function: 'Alveoli are ~0.2 mm air-filled sacs with walls only one cell thick (type I pneumocytes) and surrounded by dense pulmonary capillaries, creating a gas-exchange membrane of just 0.2–0.5 µm. Oxygen dissolves across this membrane into blood while CO₂ moves in the opposite direction, with ~250 ml O₂ absorbed and ~200 ml CO₂ expelled every minute at rest.'
    },
    diaphragm: {
      type: 'Skeletal muscle',
      location: 'Thoracic/abdominal border',
      function: 'The diaphragm is a dome-shaped sheet of striated muscle that is the primary muscle of breathing, responsible for ~70% of the work of quiet inspiration. When it contracts, it flattens and descends, increasing thoracic volume and creating negative pressure that draws air into the lungs; relaxation allows elastic recoil to expel air in passive expiration.'
    },
    intercostals: {
      type: 'Skeletal muscle group',
      location: 'Between ribs (thorax)',
      function: 'The 11 pairs of external intercostal muscles (with fibres angled downward and forward) elevate the ribs during inspiration, increasing thoracic diameter. The internal intercostals depress the ribs during forced expiration. Together they stiffen the chest wall to prevent inward collapse during deep breathing and contribute to the production of forced cough.'
    },
  }
};

window.BioAnatomyData = BioAnatomyData;
