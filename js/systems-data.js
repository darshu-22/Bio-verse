




'use strict';

const BioSystemsData = {
  systems: {
    skeletal: {
      name: 'Skeletal System',
      icon: '🦴',
      color: '#d4d4d8',
      stat1: { value: '206', label: 'Total Bones' },
      stat2: { value: '360', label: 'Joints' },
      description: 'The skeletal system provides structural support and protection for vital organs, enables movement through joints and muscles, and produces blood cells within bone marrow. It also stores essential minerals like calcium and phosphorus.',
      structures: ['Skull', 'Vertebral Column', 'Ribcage', 'Femur', 'Humerus', 'Pelvis', 'Patella', 'Radius', 'Ulna', 'Tibia'],
      didYouKnow: 'Bones are approximately 5x stronger than steel of the same weight. The human skeleton is completely replaced roughly every 10 years through a process called bone remodeling.',
      quiz: [
        {
          question: 'How many bones are in the adult human body?',
          options: ['206', '256', '186', '226'],
          correct: 0,
          explanation: 'The adult human body has 206 bones. Babies are born with around 270–300 bones, but many fuse together during childhood and adolescence.'
        },
        {
          question: 'Which is the longest bone in the human body?',
          options: ['Femur', 'Humerus', 'Tibia', 'Fibula'],
          correct: 0,
          explanation: 'The femur (thigh bone) is the longest, heaviest, and strongest bone in the human body, running from the hip to the knee.'
        },
        {
          question: 'What is the smallest bone in the human body?',
          options: ['Stapes (in the ear)', 'Phalanx', 'Rib', 'Clavicle'],
          correct: 0,
          explanation: 'The stapes, one of the three ossicles in the middle ear, is the smallest bone in the human body at only about 3mm in length.'
        },
        {
          question: 'Where is red bone marrow found?',
          options: ['In spongy bone', 'In compact bone', 'In cartilage', 'In tendons'],
          correct: 0,
          explanation: 'Red bone marrow is found in the porous spongy (cancellous) bone tissue, where it produces red blood cells, white blood cells, and platelets.'
        },
        {
          question: 'What type of joint allows the widest range of motion?',
          options: ['Ball-and-socket', 'Hinge', 'Pivot', 'Gliding'],
          correct: 0,
          explanation: 'Ball-and-socket joints (like the hip and shoulder) allow movement in all directions — flexion, extension, abduction, adduction, and rotation.'
        }
      ]
    },

    cardiovascular: {
      name: 'Cardiovascular System',
      icon: '❤️',
      color: '#ef4444',
      stat1: { value: '100K', label: 'Beats/Day' },
      stat2: { value: '96,000', label: 'km of Vessels' },
      description: 'The cardiovascular system is the body\'s transport network, pumping oxygenated blood to every cell and returning deoxygenated blood to the lungs. The heart, arteries, veins, and capillaries work in perfect synchrony.',
      structures: ['Heart', 'Aorta', 'Pulmonary Arteries', 'Jugular Vein', 'Coronary Arteries', 'Vena Cava', 'Capillaries', 'Arterioles', 'Venules'],
      didYouKnow: 'Your heart beats about 100,000 times per day and pumps roughly 7,570 liters of blood per day. Over a lifetime, it beats more than 2.5 billion times without ever taking a break.',
      quiz: [
        {
          question: 'How many chambers does the human heart have?',
          options: ['4', '2', '3', '6'],
          correct: 0,
          explanation: 'The human heart has 4 chambers: the left atrium, right atrium, left ventricle, and right ventricle. The left side handles oxygenated blood, the right handles deoxygenated blood.'
        },
        {
          question: 'Which blood vessel carries oxygenated blood from the heart?',
          options: ['Aorta', 'Pulmonary artery', 'Vena cava', 'Jugular vein'],
          correct: 0,
          explanation: 'The aorta is the largest artery in the body and carries oxygenated blood from the left ventricle of the heart to the rest of the body.'
        },
        {
          question: 'What is the normal resting heart rate for adults?',
          options: ['60–100 bpm', '40–60 bpm', '100–120 bpm', '30–40 bpm'],
          correct: 0,
          explanation: 'A normal resting heart rate for adults is 60–100 beats per minute. Athletes often have lower rates of 40–60 bpm due to their heart efficiency.'
        },
        {
          question: 'What does the sinoatrial (SA) node do?',
          options: ['Generates the heart\'s electrical impulse', 'Filters blood', 'Regulates blood pressure', 'Produces red blood cells'],
          correct: 0,
          explanation: 'The SA node acts as the heart\'s natural pacemaker, generating the electrical impulse that initiates each heartbeat and sets the rhythm of contraction.'
        },
        {
          question: 'Which vessels have the smallest diameter?',
          options: ['Capillaries', 'Arterioles', 'Venules', 'Veins'],
          correct: 0,
          explanation: 'Capillaries are the smallest blood vessels (5–10 micrometers), where the exchange of oxygen, nutrients, and waste products occurs between blood and tissues.'
        }
      ]
    },

    nervous: {
      name: 'Nervous System',
      icon: '🧠',
      color: '#a855f7',
      stat1: { value: '86B', label: 'Neurons' },
      stat2: { value: '120 m/s', label: 'Signal Speed' },
      description: 'The nervous system is the body\'s command center, processing sensory information and coordinating responses. The brain, spinal cord, and an intricate network of nerves govern every thought, sensation, and movement.',
      structures: ['Cerebrum', 'Cerebellum', 'Brain Stem', 'Spinal Cord', 'Motor Neurons', 'Sensory Neurons', 'Synapse', 'Peripheral Nerves', 'Myelin Sheath'],
      didYouKnow: 'The human brain contains approximately 86 billion neurons, each forming thousands of synaptic connections. If all the neural pathways in one brain were laid end to end, they would circle the Earth several times.',
      quiz: [
        {
          question: 'Which part of the brain controls balance and coordination?',
          options: ['Cerebellum', 'Cerebrum', 'Brain stem', 'Hypothalamus'],
          correct: 0,
          explanation: 'The cerebellum, located at the back of the brain, coordinates voluntary muscle movements, maintains posture, and ensures balance and coordination.'
        },
        {
          question: 'What is a synapse?',
          options: ['Junction between two neurons', 'Part of the brain', 'Type of nerve fiber', 'Brain protective layer'],
          correct: 0,
          explanation: 'A synapse is the junction between two neurons where nerve impulses are transmitted from one neuron to another via neurotransmitters.'
        },
        {
          question: 'What is the role of myelin sheath?',
          options: ['Speeds up nerve conduction', 'Produces neurons', 'Filters cerebrospinal fluid', 'Stores memories'],
          correct: 0,
          explanation: 'The myelin sheath is a fatty insulating layer around nerve fibers that speeds up electrical signal transmission by up to 100 times compared to unmyelinated fibers.'
        },
        {
          question: 'The central nervous system consists of:',
          options: ['Brain and spinal cord', 'Brain and peripheral nerves', 'Spinal cord and sensory organs', 'Cranial and spinal nerves'],
          correct: 0,
          explanation: 'The central nervous system (CNS) consists of the brain and spinal cord. The peripheral nervous system includes all other neural elements outside the CNS.'
        },
        {
          question: 'Which neurotransmitter is often called the "happiness chemical"?',
          options: ['Serotonin', 'Dopamine', 'GABA', 'Acetylcholine'],
          correct: 0,
          explanation: 'Serotonin is widely known as the "happiness chemical," playing a key role in mood regulation, sleep, appetite, and sense of well-being.'
        }
      ]
    },

    respiratory: {
      name: 'Respiratory System',
      icon: '🫁',
      color: '#22d3ee',
      stat1: { value: '23K', label: 'Breaths/Day' },
      stat2: { value: '480M', label: 'Alveoli' },
      description: 'The respiratory system facilitates the essential exchange of oxygen and carbon dioxide between the body and the environment. The lungs, airways, and respiratory muscles work together in a continuous rhythm to sustain life.',
      structures: ['Lungs', 'Trachea', 'Bronchi', 'Bronchioles', 'Alveoli', 'Diaphragm', 'Pleura', 'Larynx', 'Pharynx'],
      didYouKnow: 'Your lungs contain approximately 480 million tiny air sacs called alveoli. If all the alveoli in your lungs were unfolded and flattened, they would cover an area roughly the size of a tennis court (70m²).',
      quiz: [
        {
          question: 'What is the primary muscle responsible for breathing?',
          options: ['Diaphragm', 'Intercostal muscles', 'Pectoralis major', 'Rectus abdominis'],
          correct: 0,
          explanation: 'The diaphragm is the dome-shaped muscle below the lungs that contracts and relaxes to drive inhalation and exhalation, responsible for about 70% of breathing effort.'
        },
        {
          question: 'Where does gas exchange occur in the lungs?',
          options: ['Alveoli', 'Bronchi', 'Trachea', 'Bronchioles'],
          correct: 0,
          explanation: 'Gas exchange (oxygen into the blood, carbon dioxide out) occurs in the alveoli, the tiny air sacs surrounded by capillaries at the end of the bronchiole tree.'
        },
        {
          question: 'What percentage of inhaled air is oxygen?',
          options: ['21%', '78%', '16%', '0.04%'],
          correct: 0,
          explanation: 'Atmospheric air is approximately 78% nitrogen, 21% oxygen, and 0.04% carbon dioxide. The body uses only a fraction of the oxygen inhaled.'
        },
        {
          question: 'What connects the larynx to the bronchi?',
          options: ['Trachea', 'Pharynx', 'Esophagus', 'Epiglottis'],
          correct: 0,
          explanation: 'The trachea (windpipe) is the tube that connects the larynx (voice box) to the bronchi, which then enter the lungs. It is reinforced with C-shaped cartilage rings.'
        },
        {
          question: 'What is the normal breathing rate for adults at rest?',
          options: ['12–20 breaths/min', '6–10 breaths/min', '25–35 breaths/min', '30–40 breaths/min'],
          correct: 0,
          explanation: 'The normal adult resting respiratory rate is 12–20 breaths per minute, equivalent to about 17,000–29,000 breaths daily.'
        }
      ]
    },

    digestive: {
      name: 'Digestive System',
      icon: '🫀',
      color: '#f59e0b',
      stat1: { value: '9m', label: 'GI Tract Length' },
      stat2: { value: '30 hrs', label: 'Transit Time' },
      description: 'The digestive system breaks down food into nutrients, absorbs them into the bloodstream, and eliminates waste. From the mouth to the intestines, a complex interplay of organs, enzymes, and microbiota sustains this vital process.',
      structures: ['Stomach', 'Small Intestine', 'Large Intestine', 'Liver', 'Pancreas', 'Esophagus', 'Gallbladder', 'Colon', 'Rectum'],
      didYouKnow: 'Your gut contains approximately 100 trillion bacteria — more than the number of human cells in your body. This microbiome weighs up to 2 kg and plays a crucial role in immune function and metabolism.',
      quiz: [
        {
          question: 'Which organ produces bile to aid digestion?',
          options: ['Liver', 'Pancreas', 'Stomach', 'Gallbladder'],
          correct: 0,
          explanation: 'The liver produces bile, which is then stored in the gallbladder and released into the small intestine to emulsify fats, making them easier to digest and absorb.'
        },
        {
          question: 'Where does most nutrient absorption occur?',
          options: ['Small intestine', 'Large intestine', 'Stomach', 'Rectum'],
          correct: 0,
          explanation: 'The small intestine is the primary site of nutrient absorption, aided by finger-like projections called villi and microvilli that massively increase surface area.'
        },
        {
          question: 'What enzyme in saliva begins starch digestion?',
          options: ['Amylase', 'Lipase', 'Protease', 'Pepsin'],
          correct: 0,
          explanation: 'Salivary amylase (ptyalin) begins breaking down starch (polysaccharides) into smaller sugars in the mouth, starting digestion before food even reaches the stomach.'
        },
        {
          question: 'What is the pH of stomach acid?',
          options: ['1–3 (very acidic)', '6–7 (neutral)', '8–9 (alkaline)', '4–5 (mildly acidic)'],
          correct: 0,
          explanation: 'Stomach acid (gastric acid) has a pH of about 1.5–3.5, making it extremely acidic. This acidity helps denature proteins and kill harmful bacteria.'
        },
        {
          question: 'What is the function of the large intestine?',
          options: ['Water absorption and waste compaction', 'Nutrient absorption', 'Protein digestion', 'Fat emulsification'],
          correct: 0,
          explanation: 'The large intestine primarily absorbs water and electrolytes from indigestible food matter, compacts the remaining waste into feces, and houses beneficial gut bacteria.'
        }
      ]
    },

    muscular: {
      name: 'Muscular System',
      icon: '💪',
      color: '#f43f5e',
      stat1: { value: '640', label: 'Muscles' },
      stat2: { value: '40%', label: 'Body Weight' },
      description: 'The muscular system comprises over 640 muscles that enable movement, maintain posture, generate heat, and support vital functions. Skeletal, smooth, and cardiac muscle types perform distinct roles throughout the body.',
      structures: ['Biceps Brachii', 'Quadriceps', 'Pectoralis Major', 'Gastrocnemius', 'Deltoid', 'Hamstrings', 'Trapezius', 'Latissimus Dorsi', 'Gluteus Maximus'],
      didYouKnow: 'The gluteus maximus is the largest muscle in the body, while the stapedius (in the ear) is the smallest. It takes 17 muscles to smile and 43 to frown — efficiency favors happiness!',
      quiz: [
        {
          question: 'Which type of muscle is under voluntary control?',
          options: ['Skeletal muscle', 'Smooth muscle', 'Cardiac muscle', 'Both smooth and cardiac'],
          correct: 0,
          explanation: 'Skeletal muscles are under voluntary (conscious) control, attached to bones by tendons, and responsible for all intentional body movements.'
        },
        {
          question: 'What is the protein responsible for muscle contraction?',
          options: ['Actin and Myosin', 'Collagen', 'Elastin', 'Keratin'],
          correct: 0,
          explanation: 'Muscle contraction is caused by the interaction between two proteins: actin (thin filaments) and myosin (thick filaments), which slide past each other in the sarcomere.'
        },
        {
          question: 'What is a muscle\'s origin?',
          options: ['Fixed attachment point', 'Moving attachment point', 'Point of contraction', 'Tendon connection'],
          correct: 0,
          explanation: 'The origin is the fixed attachment point of a muscle to the stationary bone, while the insertion is the attachment to the bone that moves when the muscle contracts.'
        },
        {
          question: 'What fuels muscle contraction initially?',
          options: ['ATP (adenosine triphosphate)', 'Glucose directly', 'Lactic acid', 'Creatine alone'],
          correct: 0,
          explanation: 'Muscles use ATP as their direct energy currency for contraction. ATP is generated from glucose (glycolysis), fat oxidation, or creatine phosphate for rapid bursts.'
        },
        {
          question: 'What is muscle hypertrophy?',
          options: ['Increase in muscle fiber size', 'Increase in muscle fiber number', 'Muscle cell death', 'Muscle fiber shortening'],
          correct: 0,
          explanation: 'Muscle hypertrophy is the increase in size (cross-sectional area) of individual muscle fibers, typically occurring in response to progressive resistance training.'
        }
      ]
    }
  }
};

window.BioSystemsData = BioSystemsData;
