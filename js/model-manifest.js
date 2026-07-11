























'use strict';

const BIO_MODEL_MANIFEST = {

  

  
  modelPath: 'models/anatomy.glb',

  







  modelScale: 1.0,

  
  modelOffsetY: 0.0,

  

  




  skinNode: 'Skin_Shell',

  

  




  animRefs: {
    heartMesh: 'Circ_Heart',     
    lLung:     'Resp_Lung_L',    
    rLung:     'Resp_Lung_R',    
    diaphragm: 'Resp_Diaphragm', 
  },

  
  











  meshMap: {

    


    'Bone_Skull':              { meshId: 'bone_skull',          organName: 'Cranium',               systemKey: 'skeletal' },
    'Bone_Mandible':           { meshId: 'bone_mandible',       organName: 'Mandible',              systemKey: 'skeletal' },

    
    'Bone_Spine':              { meshId: 'bone_spine',          organName: 'Vertebra',              systemKey: 'skeletal' },
    'Bone_Spine_C1':           { meshId: 'bone_spine_0',        organName: 'Vertebra C1',           systemKey: 'skeletal' },
    'Bone_Spine_C2':           { meshId: 'bone_spine_1',        organName: 'Vertebra C2',           systemKey: 'skeletal' },
    'Bone_Spine_C3':           { meshId: 'bone_spine_2',        organName: 'Vertebra C3',           systemKey: 'skeletal' },
    'Bone_Spine_C4':           { meshId: 'bone_spine_3',        organName: 'Vertebra C4',           systemKey: 'skeletal' },
    'Bone_Spine_C5':           { meshId: 'bone_spine_4',        organName: 'Vertebra C5',           systemKey: 'skeletal' },
    'Bone_Spine_T1':           { meshId: 'bone_spine_5',        organName: 'Vertebra T1',           systemKey: 'skeletal' },
    'Bone_Spine_T6':           { meshId: 'bone_spine_6',        organName: 'Vertebra T6',           systemKey: 'skeletal' },
    'Bone_Spine_T12':          { meshId: 'bone_spine_7',        organName: 'Vertebra T12',          systemKey: 'skeletal' },
    'Bone_Spine_L1':           { meshId: 'bone_spine_8',        organName: 'Vertebra L1',           systemKey: 'skeletal' },
    'Bone_Spine_L5':           { meshId: 'bone_spine_9',        organName: 'Vertebra L5',           systemKey: 'skeletal' },
    'Bone_Spine_Sacrum':       { meshId: 'bone_spine_10',       organName: 'Sacrum',                systemKey: 'skeletal' },
    'Bone_Spine_Coccyx':       { meshId: 'bone_spine_11',       organName: 'Coccyx',                systemKey: 'skeletal' },

    
    'Bone_Rib_L1':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_L2':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_L3':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_L4':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_L5':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_L6':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_R1':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_R2':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_R3':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_R4':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_R5':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },
    'Bone_Rib_R6':             { meshId: 'bone_ribs',           organName: 'Rib',                   systemKey: 'skeletal' },

    'Bone_Sternum':            { meshId: 'bone_sternum',        organName: 'Sternum',               systemKey: 'skeletal' },
    'Bone_Clavicle_L':         { meshId: 'bone_clavicle',       organName: 'Clavicle',              systemKey: 'skeletal' },
    'Bone_Clavicle_R':         { meshId: 'bone_clavicle',       organName: 'Clavicle',              systemKey: 'skeletal' },
    'Bone_Scapula_L':          { meshId: 'bone_scapula',        organName: 'Scapula',               systemKey: 'skeletal' },
    'Bone_Scapula_R':          { meshId: 'bone_scapula',        organName: 'Scapula',               systemKey: 'skeletal' },
    'Bone_Humerus_L':          { meshId: 'bone_l_upper_arm',    organName: 'Humerus (L)',           systemKey: 'skeletal' },
    'Bone_Humerus_R':          { meshId: 'bone_r_upper_arm',    organName: 'Humerus (R)',           systemKey: 'skeletal' },
    'Bone_Radius_Ulna_L':      { meshId: 'bone_l_forearm',      organName: 'Radius/Ulna (L)',       systemKey: 'skeletal' },
    'Bone_Radius_Ulna_R':      { meshId: 'bone_r_forearm',      organName: 'Radius/Ulna (R)',       systemKey: 'skeletal' },
    'Bone_Pelvis':             { meshId: 'bone_pelvis',         organName: 'Pelvis',                systemKey: 'skeletal' },
    'Bone_Femur_L':            { meshId: 'bone_l_thigh',        organName: 'Femur (L)',             systemKey: 'skeletal' },
    'Bone_Femur_R':            { meshId: 'bone_r_thigh',        organName: 'Femur (R)',             systemKey: 'skeletal' },
    'Bone_Patella_L':          { meshId: 'bone_l_kneecap',      organName: 'Patella (L)',           systemKey: 'skeletal' },
    'Bone_Patella_R':          { meshId: 'bone_r_kneecap',      organName: 'Patella (R)',           systemKey: 'skeletal' },
    'Bone_Tibia_Fibula_L':     { meshId: 'bone_l_shin',         organName: 'Tibia/Fibula (L)',      systemKey: 'skeletal' },
    'Bone_Tibia_Fibula_R':     { meshId: 'bone_r_shin',         organName: 'Tibia/Fibula (R)',      systemKey: 'skeletal' },
    'Bone_Foot_L':             { meshId: 'bone_foot_l',         organName: 'Tarsal/Metatarsal (L)', systemKey: 'skeletal' },
    'Bone_Foot_R':             { meshId: 'bone_foot_r',         organName: 'Tarsal/Metatarsal (R)', systemKey: 'skeletal' },

    


    'Mus_Pectoralis_L':        { meshId: 'mus_pec_l',           organName: 'Pectoralis Major (L)',  systemKey: 'muscular' },
    'Mus_Pectoralis_R':        { meshId: 'mus_pec_r',           organName: 'Pectoralis Major (R)',  systemKey: 'muscular' },
    'Mus_Rectus_Abdominis_L':  { meshId: 'mus_abs_0',           organName: 'Rectus Abdominis',      systemKey: 'muscular' },
    'Mus_Rectus_Abdominis_R':  { meshId: 'mus_abs_1',           organName: 'Rectus Abdominis',      systemKey: 'muscular' },
    'Mus_Oblique_L':           { meshId: 'mus_oblique_l',       organName: 'External Oblique (L)',  systemKey: 'muscular' },
    'Mus_Oblique_R':           { meshId: 'mus_oblique_r',       organName: 'External Oblique (R)',  systemKey: 'muscular' },
    'Mus_Trapezius':           { meshId: 'mus_trap',            organName: 'Trapezius',             systemKey: 'muscular' },
    'Mus_Latissimus_L':        { meshId: 'mus_lats',            organName: 'Latissimus Dorsi (L)',  systemKey: 'muscular' },
    'Mus_Latissimus_R':        { meshId: 'mus_lats',            organName: 'Latissimus Dorsi (R)',  systemKey: 'muscular' },
    'Mus_Deltoid_L':           { meshId: 'mus_deltoid_l',       organName: 'Deltoid (L)',           systemKey: 'muscular' },
    'Mus_Deltoid_R':           { meshId: 'mus_deltoid_r',       organName: 'Deltoid (R)',           systemKey: 'muscular' },
    'Mus_Bicep_L':             { meshId: 'mus_bicep_l',         organName: 'Biceps Brachii (L)',    systemKey: 'muscular' },
    'Mus_Bicep_R':             { meshId: 'mus_bicep_r',         organName: 'Biceps Brachii (R)',    systemKey: 'muscular' },
    'Mus_Tricep_L':            { meshId: 'mus_tricep_l',        organName: 'Triceps Brachii (L)',   systemKey: 'muscular' },
    'Mus_Tricep_R':            { meshId: 'mus_tricep_r',        organName: 'Triceps Brachii (R)',   systemKey: 'muscular' },
    'Mus_Forearm_L':           { meshId: 'mus_forearm_l',       organName: 'Forearm Flexors (L)',   systemKey: 'muscular' },
    'Mus_Forearm_R':           { meshId: 'mus_forearm_r',       organName: 'Forearm Flexors (R)',   systemKey: 'muscular' },
    'Mus_Glute_L':             { meshId: 'mus_glute_l',         organName: 'Gluteus Maximus (L)',   systemKey: 'muscular' },
    'Mus_Glute_R':             { meshId: 'mus_glute_r',         organName: 'Gluteus Maximus (R)',   systemKey: 'muscular' },
    'Mus_Quad_L':              { meshId: 'mus_quad_l',          organName: 'Quadriceps (L)',        systemKey: 'muscular' },
    'Mus_Quad_R':              { meshId: 'mus_quad_r',          organName: 'Quadriceps (R)',        systemKey: 'muscular' },
    'Mus_Hamstring_L':         { meshId: 'mus_hamstring_l',     organName: 'Hamstrings (L)',        systemKey: 'muscular' },
    'Mus_Hamstring_R':         { meshId: 'mus_hamstring_r',     organName: 'Hamstrings (R)',        systemKey: 'muscular' },
    'Mus_Gastrocnemius_L':     { meshId: 'mus_calf_l',          organName: 'Gastrocnemius (L)',     systemKey: 'muscular' },
    'Mus_Gastrocnemius_R':     { meshId: 'mus_calf_r',          organName: 'Gastrocnemius (R)',     systemKey: 'muscular' },
    'Mus_Frontalis':           { meshId: 'mus_frontalis',       organName: 'Frontalis',             systemKey: 'muscular' },
    'Mus_Temporalis':          { meshId: 'mus_temporalis',      organName: 'Temporalis',            systemKey: 'muscular' },
    'Mus_SCM':                 { meshId: 'mus_scm',             organName: 'Sternocleidomastoid',   systemKey: 'muscular' },

    


    'Nerve_Cerebrum':          { meshId: 'nerve_cerebrum',      organName: 'Cerebrum',              systemKey: 'nervous' },  
    'Nerve_Cerebellum':        { meshId: 'nerve_cerebellum',    organName: 'Cerebellum',            systemKey: 'nervous' },
    'Nerve_Brainstem':         { meshId: 'nerve_brainstem',     organName: 'Brain Stem',            systemKey: 'nervous' },
    'Nerve_Spinal_Cord':       { meshId: 'nerve_spinal',        organName: 'Spinal Cord',           systemKey: 'nervous' },
    'Nerve_Cervical_Plexus':   { meshId: 'nerve_cervical',      organName: 'Cervical Plexus',       systemKey: 'nervous' },
    'Nerve_Brachial_Plexus':   { meshId: 'nerve_brachial',      organName: 'Brachial Plexus',       systemKey: 'nervous' },
    'Nerve_Lumbar_Plexus':     { meshId: 'nerve_lumbar',        organName: 'Lumbar Plexus',         systemKey: 'nervous' },
    'Nerve_Sciatic_L':         { meshId: 'nerve_sciatic_l',     organName: 'Sciatic Nerve (L)',     systemKey: 'nervous' },
    'Nerve_Sciatic_R':         { meshId: 'nerve_sciatic_r',     organName: 'Sciatic Nerve (R)',     systemKey: 'nervous' },
    'Nerve_Sympathetic':       { meshId: 'nerve_sympathetic',   organName: 'Sympathetic Chain',     systemKey: 'nervous' },
    'Nerve_Vagus':             { meshId: 'nerve_vagus',         organName: 'Vagus Nerve',           systemKey: 'nervous' },

    


    'Circ_Heart':              { meshId: 'circ_heart',          organName: 'Heart',                 systemKey: 'circulatory' }, 
    'Circ_Aorta':              { meshId: 'circ_aorta',          organName: 'Aorta',                 systemKey: 'circulatory' },
    'Circ_Pulm_Artery':        { meshId: 'circ_pulm_artery',    organName: 'Pulmonary Artery',      systemKey: 'circulatory' },
    'Circ_Carotid_L':          { meshId: 'circ_carotid',        organName: 'Carotid Artery',        systemKey: 'circulatory' },
    'Circ_Carotid_R':          { meshId: 'circ_carotid',        organName: 'Carotid Artery',        systemKey: 'circulatory' },
    'Circ_Brachial_L':         { meshId: 'circ_brachial',       organName: 'Brachial Artery (L)',   systemKey: 'circulatory' },
    'Circ_Brachial_R':         { meshId: 'circ_brachial',       organName: 'Brachial Artery (R)',   systemKey: 'circulatory' },
    'Circ_Femoral_L':          { meshId: 'circ_femoral_art_l',  organName: 'Femoral Artery (L)',    systemKey: 'circulatory' },
    'Circ_Femoral_R':          { meshId: 'circ_femoral_art_r',  organName: 'Femoral Artery (R)',    systemKey: 'circulatory' },
    'Circ_Vena_Cava_Sup':      { meshId: 'circ_vena_cava_sup',  organName: 'Superior Vena Cava',    systemKey: 'circulatory' },
    'Circ_Vena_Cava_Inf':      { meshId: 'circ_vena_cava_inf',  organName: 'Inferior Vena Cava',    systemKey: 'circulatory' },
    'Circ_Jugular_L':          { meshId: 'circ_jugular',        organName: 'Jugular Vein',          systemKey: 'circulatory' },
    'Circ_Jugular_R':          { meshId: 'circ_jugular',        organName: 'Jugular Vein',          systemKey: 'circulatory' },
    'Circ_Pulm_Vein':          { meshId: 'circ_pulm_vein',      organName: 'Pulmonary Vein',        systemKey: 'circulatory' },

    


    'Dig_Esophagus':           { meshId: 'dig_esophagus',       organName: 'Esophagus',             systemKey: 'digestive' },
    'Dig_Stomach':             { meshId: 'dig_stomach',         organName: 'Stomach',               systemKey: 'digestive' }, 
    'Dig_Duodenum':            { meshId: 'dig_duodenum',        organName: 'Duodenum',              systemKey: 'digestive' },
    'Dig_Liver':               { meshId: 'dig_liver',           organName: 'Liver',                 systemKey: 'digestive' }, 
    'Dig_Gallbladder':         { meshId: 'dig_gallbladder',     organName: 'Gallbladder',           systemKey: 'digestive' },
    'Dig_Pancreas':            { meshId: 'dig_pancreas',        organName: 'Pancreas',              systemKey: 'digestive' },
    'Dig_Small_Intestine':     { meshId: 'dig_small_int',       organName: 'Small Intestine',       systemKey: 'digestive' },
    'Dig_Large_Intestine':     { meshId: 'dig_large_int',       organName: 'Large Intestine',       systemKey: 'digestive' },
    'Dig_Rectum':              { meshId: 'dig_rectum',          organName: 'Rectum',                systemKey: 'digestive' },
    'Organ_Kidney_L':          { meshId: 'organ_kidney_l',      organName: 'Left Kidney',           systemKey: 'digestive' }, 
    'Organ_Kidney_R':          { meshId: 'organ_kidney_r',      organName: 'Right Kidney',          systemKey: 'digestive' },
    'Organ_Ureter_L':          { meshId: 'organ_ureter_l',      organName: 'Left Ureter',           systemKey: 'digestive' },
    'Organ_Ureter_R':          { meshId: 'organ_ureter_r',      organName: 'Right Ureter',          systemKey: 'digestive' },
    'Organ_Adrenal_L':         { meshId: 'organ_adrenal_l',     organName: 'Left Adrenal Gland',    systemKey: 'digestive' },
    'Organ_Adrenal_R':         { meshId: 'organ_adrenal_r',     organName: 'Right Adrenal Gland',   systemKey: 'digestive' },

    


    'Resp_Nasal_Cavity':       { meshId: 'resp_nasal',          organName: 'Nasal Cavity',          systemKey: 'respiratory' },
    'Resp_Pharynx':            { meshId: 'resp_pharynx',        organName: 'Pharynx',               systemKey: 'respiratory' },
    'Resp_Larynx':             { meshId: 'resp_larynx',         organName: 'Larynx',                systemKey: 'respiratory' },
    'Resp_Trachea':            { meshId: 'resp_trachea',        organName: 'Trachea',               systemKey: 'respiratory' },
    'Resp_Bronchi_L':          { meshId: 'resp_bronchi_l',      organName: 'Left Primary Bronchus', systemKey: 'respiratory' },
    'Resp_Bronchi_R':          { meshId: 'resp_bronchi_r',      organName: 'Right Primary Bronchus',systemKey: 'respiratory' },
    'Resp_Bronchioles':        { meshId: 'resp_bronchioles',    organName: 'Bronchioles',           systemKey: 'respiratory' },
    'Resp_Lung_L':             { meshId: 'resp_l_lung',         organName: 'Left Lung',             systemKey: 'respiratory' }, 
    'Resp_Lung_R':             { meshId: 'resp_r_lung',         organName: 'Right Lung',            systemKey: 'respiratory' }, 
    'Resp_Alveoli':            { meshId: 'resp_alveoli',        organName: 'Alveoli',               systemKey: 'respiratory' },
    'Resp_Diaphragm':          { meshId: 'resp_diaphragm',      organName: 'Diaphragm',             systemKey: 'respiratory' }, 
    'Resp_Intercostals':       { meshId: 'resp_intercostals',   organName: 'Intercostals',          systemKey: 'respiratory' },

    


    'Immune_Thymus':           { meshId: 'thymus',              organName: 'Thymus Gland',          systemKey: 'immune' },
    'Immune_Bone_Marrow':      { meshId: 'bone_marrow',         organName: 'Bone Marrow',           systemKey: 'immune' },
    'Immune_Spleen':           { meshId: 'spleen',              organName: 'Spleen',                systemKey: 'immune' },
    'Immune_Lymph_Nodes':      { meshId: 'lymph_nodes',         organName: 'Lymph Node System',     systemKey: 'immune' },
    'Immune_Appendix':         { meshId: 'appendix',            organName: 'Appendix',              systemKey: 'immune' },
  },

  







};

window.BIO_MODEL_MANIFEST = BIO_MODEL_MANIFEST;
