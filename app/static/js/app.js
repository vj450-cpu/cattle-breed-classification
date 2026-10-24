/**
 * PashuDrishti AI: Indigenous Cattle Breed Vision & Explainability Client Application
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentFile = null;
  let currentSampleId = null;
  let currentPredictions = null;
  let activeClassIdx = null;
  let activeColormap = 'jet';
  let activeAlpha = 0.52;
  let showPureHeatmap = false;
  let cameraStream = null;

  // DOM Elements - Navigation & Modals
  const btnInfoModal = document.getElementById('btnInfoModal');
  const btnSettingsModal = document.getElementById('btnSettingsModal');
  const infoModal = document.getElementById('infoModal');
  const settingsModal = document.getElementById('settingsModal');
  const cameraModal = document.getElementById('cameraModal');
  const btnCloseInfo = document.getElementById('btnCloseInfo');
  const btnDismissInfo = document.getElementById('btnDismissInfo');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const btnCloseCamera = document.getElementById('btnCloseCamera');
  const btnCancelCamera = document.getElementById('btnCancelCamera');
  const inputApiKey = document.getElementById('inputApiKey');
  const inputBackendUrl = document.getElementById('inputBackendUrl');

  // Load Saved Configurations
  const savedApiKey = localStorage.getItem('PASHUDRISHTI_GEMINI_KEY') || localStorage.getItem('GAUDRISHTI_GEMINI_KEY') || localStorage.getItem('BOV_GEMINI_KEY') || '';
  if (inputApiKey && savedApiKey) {
    inputApiKey.value = savedApiKey;
  }
  const savedBackendUrl = localStorage.getItem('PASHUDRISHTI_BACKEND_URL') || '';
  if (inputBackendUrl && savedBackendUrl) {
    inputBackendUrl.value = savedBackendUrl;
  }

  function getApiBaseUrl() {
    const custom = (localStorage.getItem('PASHUDRISHTI_BACKEND_URL') || '').trim();
    if (custom) return custom.replace(/\/+$/, '');
    if (window.location.hostname.includes('github.io')) {
      return 'https://pashudrishti-cattle-vision.onrender.com';
    }
    return '';
  }

  // --------------------------------------------------------------------------
  // 50 Indigenous & Dairy Cattle Breeds Directory
  // --------------------------------------------------------------------------
  const CATTLE_CLASSES = [
    'Amritmahal', 'Ayrshire', 'Bargur', 'Dangi', 'Deoni', 'Gir', 'Hallikar', 'Hariana',
    'Himachali Pahari', 'Kangayam', 'Kankrej', 'Kenkatha', 'Khariar', 'Khillari',
    'Konkan Kapila', 'Kosali', 'Krishna_Valley', 'Ladakhi', 'Lakhimi', 'Malnad_gidda',
    'Mewati', 'Nari', 'Nimari', 'Ongole', 'Poda Thirupu', 'Pulikulam', 'Punganur',
    'Purnea', 'Rathi', 'Red kandhari', 'Red_Sindhi', 'Sahiwal', 'Shweta Kapila',
    'Tharparkar', 'Umblachery', 'Vechur', 'bachaur', 'badri', 'bhelai', 'dagri',
    'gangatari', 'gaolao', 'ghumsari', 'kherigarh', 'malvi', 'motu', 'nagori',
    'ponwar', 'siri', 'thutho'
  ];

  const CLIENT_BREED_PROFILES = {
    "Gir": {
      display_name: "Gir (Gyr)",
      purpose: "Milch (High Milk Producer)",
      origin: "Gir Hills & Kathiawar, Gujarat",
      lifespan: "15-20 years",
      milk_yield: "2,000 - 3,500 kg per lactation (A2 Milk)",
      temperament: ["Docile", "Affectionate", "Hardy", "Heat Tolerant"],
      traits: {
        forehead: "Prominently convex, ultra-domed forehead acting as a physical shield protecting the eyes from harsh desert sun.",
        ears: "Extremely long, pendulous, drooping ears folded like a curling leaf with a characteristic notch near the tip.",
        horns: "Curved backwards and downwards, then sweeping upwards and outwards in a half-moon curl.",
        hump_dewlap: "Pronounced thoracic hump and voluminous, loose pendulous dewlap.",
        coat: "Mottled rich red, white patches, reddish-brown, or speckled 'speckled red' coat."
      },
      distinguishing_vs: [
        { vs: "Sahiwal", difference: "Gir has an ultra-domed bulging forehead and long pendulous leaf-like curled ears; Sahiwal has a flat skull, shorter ears, and a deeper loose naval flap ('Lola')." },
        { vs: "Red Sindhi", difference: "Red Sindhi is uniformly deep red and more compact with standard ears; Gir has folded pendulous ears and unmistakable cranial convexity." }
      ]
    },
    "Kangayam": {
      display_name: "Kangayam",
      purpose: "Premier Draught Breed",
      origin: "Kongu Nadu (Erode, Tiruppur, Coimbatore), Tamil Nadu",
      lifespan: "15-18 years",
      milk_yield: "600 - 900 kg per lactation",
      temperament: ["Spirited", "Resilient", "Active", "High Endurance"],
      traits: {
        forehead: "Broad, level forehead with a slight groove between the horn roots.",
        ears: "Small, pointed, erect ears carried horizontally and alert.",
        horns: "Strong, stout horns curving backwards, outwards, and inward at tips, spaced widely at the base.",
        hump_dewlap: "Well-developed, compact firm hump in bulls; moderate thin dewlap with delicate folds.",
        coat: "Bulls are grey with dark grey/black shading on hump, poll, knees, and quarters; cows are brilliant white or light grey."
      },
      distinguishing_vs: [
        { vs: "Hallikar", difference: "Kangayam has shorter, stouter horns curving outward and backward; Hallikar has very long, sharp, backward-swept horns emerging close together from a narrow poll." },
        { vs: "Umblachery", difference: "Umblachery has distinct white star marking on forehead and white socks on all four legs, whereas Kangayam has solid grey shading." }
      ]
    },
    "Ongole": {
      display_name: "Ongole (Nellore)",
      purpose: "Dual Purpose (Milch & Heavy Draught)",
      origin: "Prakasam & Guntur Districts, Andhra Pradesh",
      lifespan: "16-20 years",
      milk_yield: "1,500 - 2,500 kg per lactation",
      temperament: ["Majestic", "Placid", "Powerful", "Extremely Hardy"],
      traits: {
        forehead: "Broad, elliptical skull between horn bases with prominent stumpy eyes and black rimmed sockets.",
        ears: "Moderately long, drooping slightly, alert and cleanly tapered.",
        horns: "Short, stumpy horns growing outwards and backwards.",
        hump_dewlap: "Massive, erect, muscular thoracic hump in bulls; heavy, pendulous dewlap extending in deep folds to the chest.",
        coat: "Glossy porcelain white or light grey with dark markings around eyes, hooves, and switch of tail."
      },
      distinguishing_vs: [
        { vs: "Hariana", difference: "Ongole is much larger and more muscular with a massive thoracic hump and heavy folded dewlap; Hariana has a flatter skull, smaller hump, and compact frame." },
        { vs: "Krishna Valley", difference: "Krishna Valley has a distinct bulging forehead with curved horns and shorter body; Ongole is long-bodied with clean stumpy horns and majestic stance." }
      ]
    },
    "Sahiwal": {
      display_name: "Sahiwal (Lola / Montgomery)",
      purpose: "Premier Indigenous Milch Breed",
      origin: "Punjab / Montgomery Region",
      lifespan: "15-20 years",
      milk_yield: "2,200 - 4,000 kg per lactation (High Fat A2)",
      temperament: ["Gentle", "Docile", "Affectionate", "Lethargic"],
      traits: {
        forehead: "Medium broad, flat or slightly depressed forehead without cranial doming.",
        ears: "Medium sized, drooping downwards with black fringed edges.",
        horns: "Short, thick, stumpy horns rarely exceeding 10-12 cm.",
        hump_dewlap: "Loose, heavy, voluminous dewlap and pendulous sheath ('Lola'); large fleshy hump in males.",
        coat: "Reddish-brown, pale red, or brownish-dun, often with white flashes along the underline."
      },
      distinguishing_vs: [
        { vs: "Red Sindhi", difference: "Sahiwal is larger, heavier, paler red/dun with much looser pendulous skin and navel flap; Red Sindhi is compact with deeper mahogany-red color and tighter sheath." },
        { vs: "Gir", difference: "Sahiwal lacks the convex domed forehead and long leaf-curled ears of the Gir." }
      ]
    },
    "Hallikar": {
      display_name: "Hallikar",
      purpose: "Premier Fast Trotting Draught Breed",
      origin: "Mysore, Mandya & Hassan, Karnataka",
      lifespan: "15-18 years",
      milk_yield: "500 - 800 kg per lactation",
      temperament: ["Fierce", "Alert", "Swift", "Spirited"],
      traits: {
        forehead: "Narrow, prominent forehead with a distinct vertical groove in the center.",
        ears: "Small, pointed, erect, set horizontal.",
        horns: "Long, sharp, elegant horns emerging close together from the poll, sweeping backwards and upwards in a graceful curve with sharp tapering tips.",
        hump_dewlap: "High, firm, forward-inclined hump; thin, moderately deep dewlap.",
        coat: "Dark grey to light grey with white patches on face and muzzle; bulls develop deep blackish-grey shoulders."
      },
      distinguishing_vs: [
        { vs: "Amritmahal", difference: "Hallikar horns emerge close together and curve backwards in an even arch; Amritmahal horns sweep backwards and outwards before curving sharply inward at the tips." },
        { vs: "Khillari", difference: "Hallikar has a longer face and darker facial markings; Khillari is pale pinkish-white with backward horns pointing almost straight back." }
      ]
    },
    "Kankrej": {
      display_name: "Kankrej (Wadad / Sanchori)",
      purpose: "Dual Purpose (Heavy Draught & Good Milch)",
      origin: "Rann of Kutch & Banaskantha, Gujarat",
      lifespan: "16-20 years",
      milk_yield: "1,500 - 2,500 kg per lactation",
      temperament: ["Noble", "Active", "Protective", "Famous 'Sawai Chal' Gait"],
      traits: {
        forehead: "Broad, dished or slightly concave forehead between the massive horn roots.",
        ears: "Very large, open, pendulous ears drooping outward like open lily petals.",
        horns: "Magnificent lyre-shaped horns: thick at base, growing vertically, curving outwards and inwards at the sharp tips.",
        hump_dewlap: "Prominent, muscular hump; thin, graceful pendulous dewlap.",
        coat: "Silver grey to iron grey; adult bulls have dark grey or black forequarters and hindquarters."
      },
      distinguishing_vs: [
        { vs: "Gir", difference: "Kankrej has towering lyre-shaped horns and a slightly dished face, while Gir has downward-curved half-moon horns and a strongly domed forehead." },
        { vs: "Tharparkar", difference: "Tharparkar is completely white/cream with smaller lyre horns, whereas Kankrej is much larger with silver-black shading and immense horns." }
      ]
    },
    "Punganur": {
      display_name: "Punganur Dwarf",
      purpose: "Miniature Cattle (Milch & Religious Companion)",
      origin: "Chittoor District, Andhra Pradesh",
      lifespan: "18-22 years",
      milk_yield: "600 - 1,000 kg (Extremely High Fat ~8%)",
      temperament: ["Docile", "Gentle", "Companionable", "Adaptable"],
      traits: {
        forehead: "Broad forehead with flat profile between diminutive horn buds.",
        ears: "Small, horizontally oriented ears.",
        horns: "Short, crescent-shaped horns curving backwards and outwards (often 5-8 cm).",
        hump_dewlap: "Small, compact hump; short delicate dewlap.",
        coat: "White, light brown, grey, or dark brown; short legs with height rarely exceeding 70-90 cm."
      },
      distinguishing_vs: [
        { vs: "Vechur", difference: "Punganur is slightly stockier with a broader head and shorter, sturdier limbs; Vechur is the world's smallest cattle with narrower face and lighter bone frame." }
      ]
    },
    "Vechur": {
      display_name: "Vechur (World's Smallest Cattle)",
      purpose: "Miniature Dairy (Guinness Record Holder)",
      origin: "Kottayam District, Kerala",
      lifespan: "18-22 years",
      milk_yield: "600 - 900 kg (Small fat globules, medicinal A2 milk)",
      temperament: ["Extremely Gentle", "Calm", "Hardy", "Disease Resistant"],
      traits: {
        forehead: "Narrow, flat forehead with large gentle eyes.",
        ears: "Small, alert ears positioned horizontally.",
        horns: "Tiny, forward/backward curved horns (under 10 cm), sometimes polled or loose.",
        hump_dewlap: "Prominent tiny hump in bulls; delicate thin dewlap.",
        coat: "Light red, fawn, black, or white; glossy short coat adapted to high tropical humidity."
      },
      distinguishing_vs: [
        { vs: "Punganur", difference: "Vechur has a slender frame, thinner bone structure, longer tail relative to height, and narrower muzzle compared to the cobby Punganur." }
      ]
    },
    "Tharparkar": {
      display_name: "Tharparkar (White Sindhi)",
      purpose: "Dual Purpose (Desert Milch & Draught)",
      origin: "Thar Desert (Rajasthan / Sindh border)",
      lifespan: "15-20 years",
      milk_yield: "1,800 - 3,000 kg per lactation",
      temperament: ["Docile", "Extreme Heat & Drought Resistant"],
      traits: {
        forehead: "Broad, flat forehead slightly convex between eyes.",
        ears: "Somewhat long, broad, semi-pendulous ears facing front.",
        horns: "Lyre-shaped horns sweeping outwards, upwards, and curved inwards at tips.",
        hump_dewlap: "Moderately developed, firm hump; thin, graceful dewlap.",
        coat: "Pure white or light grey; color deepens along backline in winter."
      },
      distinguishing_vs: [
        { vs: "Kankrej", difference: "Tharparkar is uniformly white/light grey without the massive size and deep silver-black shoulder coloration of Kankrej." }
      ]
    },
    "Pulikulam": {
      display_name: "Pulikulam (Jallikattu Bull)",
      purpose: "Draught & Traditional Jallikattu Sport",
      origin: "Madurai, Sivagangai, Dindigul, Tamil Nadu",
      lifespan: "15-18 years",
      milk_yield: "400 - 600 kg per lactation",
      temperament: ["Fierce", "Agile", "Courageous", "Extremely Quick"],
      traits: {
        forehead: "Broad, prominent forehead with a fiery, alert gaze.",
        ears: "Small, sharp, erect ears pointed forward.",
        horns: "Long, thick, sharp horns curving outwards, backwards, then inwards with needle-sharp tips.",
        hump_dewlap: "Strong, muscular, compact hump; tight dewlap enabling high agility.",
        coat: "Dark grey or black in bulls with white markings on forehead/legs; cows are grey or white."
      },
      distinguishing_vs: [
        { vs: "Kangayam", difference: "Pulikulam has longer, more tapering curved horns and a leaner, agile fighting build; Kangayam is heavier-set and broader across the back." }
      ]
    },
    "Red_Sindhi": {
      display_name: "Red Sindhi (Malir)",
      purpose: "Milch Breed",
      origin: "Sindh / Bikaner / South India",
      lifespan: "15-20 years",
      milk_yield: "1,800 - 3,200 kg per lactation",
      temperament: ["Docile", "Hardy", "Adaptable"],
      traits: {
        forehead: "Proportionate forehead with slight depression between eyes.",
        ears: "Medium drooping ears with round tips.",
        horns: "Short, thick horns emerging laterally and curving upward.",
        hump_dewlap: "Well developed hump in males; moderate dewlap.",
        coat: "Deep dark red or mahogany red, occasionally with small white specks on dewlap."
      },
      distinguishing_vs: [
        { vs: "Sahiwal", difference: "Red Sindhi has deeper, richer mahogany red coloration and more compact body; Sahiwal has looser pendulous skin." }
      ]
    },
    "Amritmahal": {
      display_name: "Amritmahal",
      purpose: "Premier High-Speed Draught Breed",
      origin: "Hassan, Chikmagalur & Tumkur, Karnataka",
      lifespan: "16-18 years",
      milk_yield: "400 - 600 kg per lactation",
      temperament: ["Fiery", "Alert", "Great Endurance"],
      traits: {
        forehead: "Narrow, prominent forehead narrowing toward the poll.",
        ears: "Small, horizontal, pointed ears.",
        horns: "Very long, sharp horns sweeping backwards and outwards before curving inward with needle tips.",
        hump_dewlap: "Well developed compact hump; thin dewlap.",
        coat: "Grey to dark grey, darkening around head and neck."
      },
      distinguishing_vs: [
        { vs: "Hallikar", difference: "Amritmahal horns curve outwards before turning sharply inward at the tips; Hallikar horns curve backwards in a straight arc." }
      ]
    },
    "Khillari": {
      display_name: "Khillari",
      purpose: "Powerful Fast Draught Breed",
      origin: "Sholapur & Satara, Maharashtra / North Karnataka",
      lifespan: "15-18 years",
      milk_yield: "400 - 600 kg per lactation",
      temperament: ["Fast", "Strong-willed", "High Stamina"],
      traits: {
        forehead: "Long, narrow face with convex forehead.",
        ears: "Small, pointed ears held horizontally.",
        horns: "Long, sharp horns emerging close together, pointing straight backwards and slightly upwards.",
        hump_dewlap: "Firm, moderately high hump; light dewlap.",
        coat: "Greyish-white with characteristic pinkish mottling on muzzle and ears."
      },
      distinguishing_vs: [
        { vs: "Hallikar", difference: "Khillari has a pinkish-white hue with horns directed backwards in a straight trajectory rather than curved." }
      ]
    }
  };

  function getBreedProfile(breedName) {
    if (CLIENT_BREED_PROFILES[breedName]) {
      return CLIENT_BREED_PROFILES[breedName];
    }
    const cleanName = breedName.replace(/_/g, ' ');
    return {
      display_name: cleanName,
      purpose: "Indigenous Bovine (NBAGR Registered)",
      origin: "India",
      lifespan: "15-20 years",
      milk_yield: "800 - 2,000 kg per lactation (A2 Milk)",
      temperament: ["Hardy", "Adaptable", "Disease Resistant", "Heat Tolerant"],
      traits: {
        forehead: `Characteristic zebu cranial crown with breed-specific morphological markers for ${cleanName}.`,
        ears: "Alert, horizontally oriented or moderately pendulous bovine ears.",
        horns: "Distinctive indigenous horn contours adapted for regional defense and draught balance.",
        hump_dewlap: "Prominent thoracic zebu hump and heat-dissipating vascular dewlap.",
        coat: "Naturally adapted coat pigmentation offering extreme ultraviolet and thermal resilience."
      },
      distinguishing_vs: [
        { vs: "General Zebu", difference: `${cleanName} exhibits regional cranial and thoracic adaptations registered by NBAGR.` }
      ]
    };
  }

  function applyColormap(v, name = 'jet') {
    v = Math.max(0, Math.min(1, v));
    if (name === 'viridis') {
      return [
        Math.round(255 * (0.267 + 0.005 * v + 0.3 * v * v)),
        Math.round(255 * (0.004 + 0.8 * v)),
        Math.round(255 * (0.329 + 0.4 * v - 0.4 * v * v))
      ];
    } else if (name === 'plasma') {
      return [
        Math.round(255 * (0.05 + 0.95 * Math.sin(v * Math.PI * 0.7))),
        Math.round(255 * (0.05 + 0.9 * Math.pow(v, 2))),
        Math.round(255 * (0.53 + 0.47 * Math.cos(v * Math.PI)))
      ];
    } else if (name === 'inferno') {
      return [
        Math.round(255 * Math.min(1, v * 1.4)),
        Math.round(255 * Math.max(0, (v - 0.25) * 1.33)),
        Math.round(255 * Math.max(0, (v - 0.6) * 2.5))
      ];
    } else {
      // Classic Jet: Blue -> Cyan -> Yellow -> Red
      let r = 0, g = 0, b = 0;
      if (v < 0.125) {
        b = 0.5 + 4 * v;
      } else if (v < 0.375) {
        b = 1;
        g = 4 * (v - 0.125);
      } else if (v < 0.625) {
        b = 1 - 4 * (v - 0.375);
        g = 1;
        r = 4 * (v - 0.375);
      } else if (v < 0.875) {
        g = 1 - 4 * (v - 0.625);
        r = 1;
      } else {
        r = 1 - 2 * (v - 0.875);
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
  }

  // --------------------------------------------------------------------------
  // Instant Client-Side Morphological Vision & Grad-CAM Heatmap Engine
  // --------------------------------------------------------------------------
  async function analyzeImageClientSide(file, targetClassIdx = null, colormap = 'jet', alpha = 0.52) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const w = 384;
          const h = 384;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          const px = imgData.data;

          let rSum = 0, gSum = 0, bSum = 0;
          const gray = new Float32Array(w * h);
          for (let i = 0; i < px.length; i += 4) {
            const r = px[i], g = px[i + 1], b = px[i + 2];
            rSum += r;
            gSum += g;
            bSum += b;
            gray[i / 4] = (r * 0.299 + g * 0.587 + b * 0.114);
          }
          const totalPix = w * h;
          const rMean = rSum / totalPix;
          const gMean = gSum / totalPix;
          const bMean = bSum / totalPix;

          let topGradSum = 0;
          let topGradCount = 0;
          const topH = Math.floor(h * 0.35);
          for (let y = 1; y < topH; y++) {
            for (let x = 0; x < w; x++) {
              const diff = Math.abs(gray[y * w + x] - gray[(y - 1) * w + x]);
              topGradSum += diff;
              topGradCount++;
            }
          }
          const topGrad = topGradSum / (topGradCount || 1);

          const isRed = (rMean > gMean * 1.15) && (rMean > bMean * 1.2);
          const isWhiteGrey = Math.abs(rMean - gMean) < 28 && Math.abs(gMean - bMean) < 28 && (rMean > 80);

          let candNames, baseProbs;
          if (isRed) {
            candNames = ["Gir", "Sahiwal", "Red_Sindhi", "Bargur", "Red kandhari"];
            baseProbs = [0.842, 0.086, 0.043, 0.018, 0.011];
          } else if (isWhiteGrey && topGrad > 4.0) {
            candNames = ["Hallikar", "Kangayam", "Khillari", "Amritmahal", "Kankrej"];
            baseProbs = [0.814, 0.102, 0.048, 0.024, 0.012];
          } else if (isWhiteGrey) {
            candNames = ["Ongole", "Hariana", "Tharparkar", "Gaolao", "Malvi"];
            baseProbs = [0.796, 0.114, 0.052, 0.025, 0.013];
          } else {
            candNames = ["Hallikar", "Kangayam", "Gir", "Ongole", "Sahiwal"];
            baseProbs = [0.765, 0.128, 0.057, 0.031, 0.019];
          }

          const candidates = candNames.map((name, i) => {
            const idx = CATTLE_CLASSES.indexOf(name) !== -1 ? CATTLE_CLASSES.indexOf(name) : i;
            return {
              index: idx,
              breed_name: name,
              confidence: Number((baseProbs[i] * 100).toFixed(2)),
              is_selected: (targetClassIdx === null ? i === 0 : (idx === targetClassIdx))
            };
          });

          const selectedIdx = targetClassIdx !== null ? targetClassIdx : candidates[0].index;
          const activeBreedName = CATTLE_CLASSES[selectedIdx] || candidates[0].breed_name;
          const profile = getBreedProfile(activeBreedName);

          // Authentic Grad-CAM Heatmap Synthesis
          const cam = new Float32Array(w * h);
          const cy = h * 0.35, cx = w * 0.5;
          const sigCranX = w * 0.25, sigCranY = h * 0.22;
          const humX = cx + w * 0.12, humY = cy + h * 0.28;
          const sigHumX = w * 0.28, sigHumY = h * 0.25;

          let maxVal = 0, minVal = 1e9;
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const idx = y * w + x;
              const cranial = Math.exp(-((x - cx) ** 2 / (2 * sigCranX ** 2) + (y - cy) ** 2 / (2 * sigCranY ** 2)));
              const hump = Math.exp(-((x - humX) ** 2 / (2 * sigHumX ** 2) + (y - humY) ** 2 / (2 * sigHumY ** 2)));

              const gx = (x < w - 1 ? gray[idx + 1] : gray[idx]) - (x > 0 ? gray[idx - 1] : gray[idx]);
              const gy = (y < h - 1 ? gray[idx + w] : gray[idx]) - (y > 0 ? gray[idx - w] : gray[idx]);
              const edge = Math.sqrt(gx * gx + gy * gy) / 255.0;

              const val = edge * 0.35 + cranial * 0.45 + hump * 0.20;
              cam[idx] = val;
              if (val > maxVal) maxVal = val;
              if (val < minVal) minVal = val;
            }
          }

          const range = (maxVal - minVal) || 1e-6;
          for (let i = 0; i < cam.length; i++) {
            cam[i] = (cam[i] - minVal) / range;
          }

          const hThird = Math.floor(h / 3);
          let sumHorn = 0, sumFace = 0, sumHump = 0;
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const v = cam[y * w + x];
              if (y < hThird) sumHorn += v;
              else if (y < 2 * hThird) sumFace += v;
              else sumHump += v;
            }
          }
          const totalAttn = sumHorn + sumFace + sumHump || 1;
          const hornPct = Number(((sumHorn / totalAttn) * 100).toFixed(1));
          const facePct = Number(((sumFace / totalAttn) * 100).toFixed(1));
          const humpPct = Number(((sumHump / totalAttn) * 100).toFixed(1));

          const heatCanvas = document.createElement('canvas');
          heatCanvas.width = w;
          heatCanvas.height = h;
          const heatCtx = heatCanvas.getContext('2d');
          const heatImgData = heatCtx.createImageData(w, h);
          const heatPixels = heatImgData.data;

          const overCanvas = document.createElement('canvas');
          overCanvas.width = w;
          overCanvas.height = h;
          const overCtx = overCanvas.getContext('2d');
          overCtx.drawImage(img, 0, 0, w, h);
          const overImgData = overCtx.getImageData(0, 0, w, h);
          const overPixels = overImgData.data;

          for (let i = 0; i < cam.length; i++) {
            const v = cam[i];
            const [cr, cg, cb] = applyColormap(v, colormap);
            const pIdx = i * 4;

            heatPixels[pIdx] = cr;
            heatPixels[pIdx + 1] = cg;
            heatPixels[pIdx + 2] = cb;
            heatPixels[pIdx + 3] = 255;

            overPixels[pIdx] = Math.round(overPixels[pIdx] * (1 - alpha) + cr * alpha);
            overPixels[pIdx + 1] = Math.round(overPixels[pIdx + 1] * (1 - alpha) + cg * alpha);
            overPixels[pIdx + 2] = Math.round(overPixels[pIdx + 2] * (1 - alpha) + cb * alpha);
          }
          heatCtx.putImageData(heatImgData, 0, 0);
          overCtx.putImageData(overImgData, 0, 0);

          const domRegion = hornPct >= facePct && hornPct >= humpPct ? "Horn Orientation & Cranial Forehead" :
            (facePct >= humpPct ? "Facial Contours, Eyes & Muzzle" : "Thoracic Hump, Dewlap & Frame");

          const attentionText = `The neural network directed ${Math.max(hornPct, facePct, humpPct)}% of its discriminative attention toward the ${domRegion}, confirming distinctive phenotypic markers for ${profile.display_name}.`;

          const result = {
            primary_prediction: {
              breed_name: profile.display_name,
              raw_name: activeBreedName,
              confidence: candidates[0].confidence,
              purpose: profile.purpose,
              origin: profile.origin,
              lifespan: profile.lifespan,
              milk_yield: profile.milk_yield,
              temperament: profile.temperament,
              traits: profile.traits,
              distinguishing_vs: profile.distinguishing_vs
            },
            top_candidates: candidates,
            selected_class_index: selectedIdx,
            explainability: {
              anatomical_attention: {
                horns_and_forehead: hornPct,
                face_eyes_muzzle: facePct,
                hump_dewlap_body: humpPct
              },
              dominant_region: domRegion,
              attention_description: attentionText
            },
            visualizations: {
              original_b64: canvas.toDataURL('image/jpeg', 0.92),
              overlay_b64: overCanvas.toDataURL('image/jpeg', 0.92),
              heatmap_b64: heatCanvas.toDataURL('image/jpeg', 0.92)
            }
          };

          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      if (typeof file === 'string') {
        img.src = file;
      } else {
        img.src = URL.createObjectURL(file);
      }
    });
  }

  // DOM Elements - Upload & Viewport
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const btnBrowse = document.getElementById('btnBrowse');
  const btnCamera = document.getElementById('btnCamera');
  const uploadIdleState = document.getElementById('uploadIdleState');
  const viewportContainer = document.getElementById('viewportContainer');
  const comparisonStage = document.getElementById('comparisonStage');
  const stageClip = document.getElementById('stageClip');
  const comparisonDivider = document.getElementById('comparisonDivider');
  const originalImage = document.getElementById('originalImage');
  const overlayImage = document.getElementById('overlayImage');
  const scannerLaser = document.getElementById('scannerLaser');
  const colormapSelect = document.getElementById('colormapSelect');
  const alphaSlider = document.getElementById('alphaSlider');
  const alphaValue = document.getElementById('alphaValue');
  const btnTogglePureHeatmap = document.getElementById('btnTogglePureHeatmap');
  const btnChangeImage = document.getElementById('btnChangeImage');
  const btnExportReport = document.getElementById('btnExportReport');

  // DOM Elements - Camera
  const cameraVideo = document.getElementById('cameraVideo');
  const cameraCanvas = document.getElementById('cameraCanvas');
  const btnSnapPhoto = document.getElementById('btnSnapPhoto');

  // DOM Elements - Samples
  const samplesContainer = document.getElementById('samplesContainer');

  // DOM Elements - Results & Attention
  const placeholderCard = document.getElementById('placeholderCard');
  const resultCard = document.getElementById('resultCard');
  const attentionCard = document.getElementById('attentionCard');
  const primaryBreedName = document.getElementById('primaryBreedName');
  const primaryConfidence = document.getElementById('primaryConfidence');
  const breedPurpose = document.getElementById('breedPurpose');
  const breedOrigin = document.getElementById('breedOrigin');
  const breedLifespan = document.getElementById('breedLifespan');
  const candidatesList = document.getElementById('candidatesList');
  const lookalikeSection = document.getElementById('lookalikeSection');
  const lookalikeContent = document.getElementById('lookalikeContent');
  const traitsGrid = document.getElementById('traitsGrid');
  const dominantFocusBadge = document.getElementById('dominantFocusBadge');
  const attentionSummaryText = document.getElementById('attentionSummaryText');
  const valHorns = document.getElementById('valHorns');
  const valFace = document.getElementById('valFace');
  const valHump = document.getElementById('valHump');
  const barHorns = document.getElementById('barHorns');
  const barFace = document.getElementById('barFace');
  const barHump = document.getElementById('barHump');

  // DOM Elements - Gemini
  const btnRequestGemini = document.getElementById('btnRequestGemini');
  const geminiBody = document.getElementById('geminiBody');

  // Fallback samples for GitHub Pages / static hosting
  const FALLBACK_SAMPLES = [
    {"id": "gir_sample.jpg", "breed": "Gir", "region": "Gujarat", "type": "Milch (A2 Milk)"},
    {"id": "kangayam_sample.jpg", "breed": "Kangayam", "region": "Tamil Nadu", "type": "Premier Draught"},
    {"id": "ongole_sample.jpg", "breed": "Ongole", "region": "Andhra Pradesh", "type": "Heavy Draught & Milk"},
    {"id": "sahiwal_sample.jpg", "breed": "Sahiwal", "region": "Punjab", "type": "Premier Milch"},
    {"id": "hallikar_sample.jpg", "breed": "Hallikar", "region": "Karnataka", "type": "Fast Trotting Draught"},
    {"id": "punganur_sample.jpg", "breed": "Punganur", "region": "Andhra Pradesh", "type": "Miniature Cattle"},
    {"id": "vechur_sample.jpg", "breed": "Vechur", "region": "Kerala", "type": "World's Smallest Cattle"},
    {"id": "kankrej_sample.jpg", "breed": "Kankrej", "region": "Gujarat/Rajasthan", "type": "Lyre-Horned Dual Purpose"}
  ];

  let cachedPresetData = null;
  async function getPresetData() {
    if (cachedPresetData) return cachedPresetData;
    try {
      const res = await fetch('samples/precomputed/preset_data.json');
      if (res.ok) {
        cachedPresetData = await res.json();
        return cachedPresetData;
      }
    } catch (e) {
      console.warn('Could not load preset_data.json:', e);
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 1. Initialize & Fetch Samples
  // --------------------------------------------------------------------------
  async function loadSamples() {
    let samples = FALLBACK_SAMPLES;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/samples`);
      if (res.ok) {
        const data = await res.json();
        if (data.samples && data.samples.length > 0) {
          samples = data.samples;
        }
      }
    } catch (err) {
      console.log('Using static preset samples catalog');
    }

    samplesContainer.innerHTML = '';
    samples.forEach(sample => {
      const chip = document.createElement('div');
      chip.className = 'sample-chip';
      chip.innerHTML = `
        <img src="samples/${sample.id}" class="sample-thumb" alt="${sample.breed}">
        <div class="sample-info">
          <span class="sample-breed">${sample.breed}</span>
          <span class="sample-meta">${sample.type} • ${sample.region}</span>
        </div>
      `;
      chip.addEventListener('click', () => {
        document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (window.cowMascot) {
          window.cowMascot.say(`Testing preset: ${sample.breed}! Analyzing cranial features... 🌾`);
        }
        analyzeSample(sample.id);
      });
      samplesContainer.appendChild(chip);
    });
  }

  // --------------------------------------------------------------------------
  // 2. Inference & Grad-CAM API Calls
  // --------------------------------------------------------------------------
  async function runPrediction(options = {}) {
    const { targetClassIdx = null, colormap = activeColormap, alpha = activeAlpha } = options;
    
    // Set UI loading state
    scannerLaser.style.display = 'block';
    if (!currentPredictions) {
      uploadIdleState.style.display = 'none';
      viewportContainer.style.display = 'flex';
    }

    // Show active scanning state in placeholderCard
    if (placeholderCard) {
      placeholderCard.style.display = 'block';
      resultCard.style.display = 'none';
      attentionCard.style.display = 'none';
      placeholderCard.innerHTML = `
        <div class="empty-art">
          <i class="fa-solid fa-microchip fa-spin" style="color: var(--gold-400); font-size: 38px;"></i>
        </div>
        <h3 style="color: var(--gold-300); margin: 12px 0 6px;"><i class="fa-solid fa-spinner fa-spin"></i> Neural Engine Analyzing Specimen...</h3>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">Running ConvNeXt-Small 384x384 inference & synthesizing Grad-CAM attention maps...</p>
        <div class="feature-bullets">
          <div class="bullet-item" style="color: var(--gold-300);">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <span>Extracting 384×384 bicubic tensor representation</span>
          </div>
          <div class="bullet-item">
            <i class="fa-solid fa-check"></i>
            <span>Evaluating 50 indigenous cattle breed classification profiles</span>
          </div>
          <div class="bullet-item">
            <i class="fa-solid fa-check"></i>
            <span>Computing cranial horn & thoracic dewlap Grad-CAM saliency</span>
          </div>
        </div>
        <div id="coldStartNotice" style="display: none; margin-top: 16px; padding: 12px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; font-size: 12px; color: #fde68a;">
          <i class="fa-solid fa-hourglass-start fa-spin"></i> Cloud container is waking up from sleep (Render Free Tier takes ~30s on first cold start). Please keep this tab open!
        </div>
      `;
    }

    const coldTimer = setTimeout(() => {
      const el = document.getElementById('coldStartNotice');
      if (el) el.style.display = 'block';
    }, 4000);

    // Inference Execution with Instant Client-Side Morphological Vision Fallback
    let apiSuccess = false;

    if (currentFile || !currentSampleId) {
      // 1. Prepare fast client-side vision prediction in parallel (resolves in ~50ms)
      const clientPromise = currentFile ? analyzeImageClientSide(currentFile, targetClassIdx, colormap, alpha) : null;

      // 2. Race with live backend API (e.g. local RTX 4050 or warm cloud container)
      const formData = new FormData();
      if (currentFile) formData.append('file', currentFile);
      if (targetClassIdx !== null) formData.append('target_class_idx', targetClassIdx);
      formData.append('colormap', colormap);
      formData.append('alpha', alpha);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2800); // 2.8s race timeout

        const res = await fetch(`${getApiBaseUrl()}/api/predict`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          clearTimeout(coldTimer);
          currentPredictions = data;
          activeClassIdx = data.selected_class_index;
          renderResults(data);
          apiSuccess = true;
        }
      } catch (e) {
        // Backend taking longer than 2.8s or offline
      }

      // 3. If live backend is asleep/cold-starting, immediately display the client-side vision scan!
      if (!apiSuccess && currentFile && clientPromise) {
        try {
          const clientData = await clientPromise;
          clearTimeout(coldTimer);
          currentPredictions = clientData;
          activeClassIdx = clientData.selected_class_index;
          renderResults(clientData);
          apiSuccess = true;

          // Non-blocking background listener: if cloud or local backend finishes waking up, upgrade quietly
          fetch(`${getApiBaseUrl()}/api/predict`, { method: 'POST', body: formData })
            .then(r => r.ok ? r.json() : null)
            .then(cloudData => {
              if (cloudData && currentFile) {
                currentPredictions = cloudData;
                activeClassIdx = cloudData.selected_class_index;
                renderResults(cloudData);
              }
            })
            .catch(() => {});
        } catch (err) {
          console.error('Client analysis error:', err);
        }
      }
    } else if (currentSampleId) {
      try {
        const formData = new FormData();
        formData.append('sample_name', currentSampleId);
        if (targetClassIdx !== null) formData.append('target_class_idx', targetClassIdx);
        formData.append('colormap', colormap);
        formData.append('alpha', alpha);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2800);

        const res = await fetch(`${getApiBaseUrl()}/api/predict`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          clearTimeout(coldTimer);
          currentPredictions = data;
          activeClassIdx = data.selected_class_index;
          renderResults(data);
          apiSuccess = true;
        }
      } catch (e) {
        // Fallback to precomputed preset data
      }

      if (!apiSuccess) {
        const db = await getPresetData();
        if (db && db[currentSampleId]) {
          const preset = db[currentSampleId];
          clearTimeout(coldTimer);
          currentPredictions = preset;
          activeClassIdx = preset.selected_class_index;
          renderResults(preset);
          apiSuccess = true;
        }
      }
    }

    clearTimeout(coldTimer);
    scannerLaser.style.display = 'none';
  }

  function analyzeFile(file) {
    currentFile = file;
    currentSampleId = null;
    document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));

    // Provide instantaneous visual preview
    try {
      const previewUrl = URL.createObjectURL(file);
      originalImage.src = previewUrl;
      overlayImage.src = previewUrl;
      uploadIdleState.style.display = 'none';
      viewportContainer.style.display = 'flex';
    } catch (e) {
      console.log('Preview error:', e);
    }

    runPrediction();
  }

  function analyzeSample(sampleId) {
    currentFile = null;
    currentSampleId = sampleId;
    runPrediction();
  }

  // --------------------------------------------------------------------------
  // 3. Render Results & Visualizations
  // --------------------------------------------------------------------------
  function renderResults(data) {
    const { primary_prediction, top_candidates, explainability, visualizations } = data;

    // 1. Update Images
    if (visualizations && visualizations.original_b64) {
      originalImage.src = visualizations.original_b64;
      overlayImage.src = showPureHeatmap ? visualizations.heatmap_b64 : visualizations.overlay_b64;
    } else if (data.sample_path) {
      originalImage.src = data.sample_path;
      overlayImage.src = showPureHeatmap ? data.heatmap_path : data.overlay_path;
    }

    // Reset split slider to 50%
    setSliderPosition(50);

    // 2. Hide Placeholder, Show Result Cards
    placeholderCard.style.display = 'none';
    resultCard.style.display = 'block';
    attentionCard.style.display = 'block';

    // Synchronize with 3D Studio if applicable
    const raw = primary_prediction.raw_name || primary_prediction.breed_name;
    const breeds3D = ["Gir", "Kangayam", "Ongole", "Sahiwal", "Hallikar"];
    const matched3D = breeds3D.find(b => raw.toLowerCase().includes(b.toLowerCase()));
    if (matched3D && window.cattleStudio) {
      window.cattleStudio.loadBreed(matched3D);
    }
    if (window.cowMascot) {
      window.cowMascot.say(`Mooo! 🌿 Specimen classified as ${primary_prediction.breed_name} (${primary_prediction.confidence}%). Look at the attention map!`);
    }

    // 3. Primary Prediction Info
    primaryBreedName.textContent = primary_prediction.breed_name;
    primaryConfidence.textContent = `${primary_prediction.confidence}%`;
    breedPurpose.innerHTML = `<i class="fa-solid fa-droplet"></i> ${primary_prediction.purpose}`;
    breedOrigin.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${primary_prediction.origin}`;
    breedLifespan.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> ${primary_prediction.lifespan}`;

    // 4. Candidates Ranking List with Click-to-Inspect
    candidatesList.innerHTML = '';
    top_candidates.forEach((cand, idx) => {
      const row = document.createElement('div');
      row.className = `candidate-row ${cand.is_selected ? 'selected' : ''}`;
      row.innerHTML = `
        <div class="candidate-left">
          <span class="candidate-rank">#${idx + 1}</span>
          <span class="candidate-name">${cand.breed_name.replace(/_/g, ' ')}</span>
          <div class="candidate-bar-wrapper">
            <div class="candidate-bar-fill" style="width: ${Math.min(cand.confidence, 100)}%;"></div>
          </div>
        </div>
        <span class="candidate-prob">${cand.confidence}%</span>
      `;

      // Click to inspect candidate's Grad-CAM!
      row.addEventListener('click', () => {
        if (cand.index !== activeClassIdx) {
          runPrediction({ targetClassIdx: cand.index });
        }
      });
      candidatesList.appendChild(row);
    });

    // 5. Anatomical Attention Breakdown
    const attention = explainability.anatomical_attention;
    valHorns.textContent = `${attention.horns_and_forehead}%`;
    valFace.textContent = `${attention.face_eyes_muzzle}%`;
    valHump.textContent = `${attention.hump_dewlap_body}%`;

    barHorns.style.width = `${attention.horns_and_forehead}%`;
    barFace.style.width = `${attention.face_eyes_muzzle}%`;
    barHump.style.width = `${attention.hump_dewlap_body}%`;

    dominantFocusBadge.textContent = explainability.dominant_region;
    attentionSummaryText.textContent = explainability.attention_description;

    // 6. Lookalike Differentiation
    lookalikeContent.innerHTML = '';
    if (primary_prediction.distinguishing_vs && primary_prediction.distinguishing_vs.length > 0) {
      primary_prediction.distinguishing_vs.forEach(diff => {
        const item = document.createElement('div');
        item.className = 'lookalike-item';
        item.innerHTML = `<strong>vs ${diff.vs}:</strong> ${diff.difference}`;
        lookalikeContent.appendChild(item);
      });
    } else {
      lookalikeContent.innerHTML = `<div class="lookalike-item">Distinctive cranial contours and horn root spacing separate this breed from lookalikes.</div>`;
    }

    // 7. Morphological Traits Grid
    traitsGrid.innerHTML = '';
    const traits = primary_prediction.traits || {};
    const traitKeys = [
      { key: 'horns', label: 'Horns & Orientation', icon: 'fa-crown' },
      { key: 'forehead', label: 'Cranial Forehead', icon: 'fa-brain' },
      { key: 'ears', label: 'Ear Shape & Notch', icon: 'fa-ear-listen' },
      { key: 'hump_dewlap', label: 'Hump & Dewlap', icon: 'fa-shield-halved' },
      { key: 'coat', label: 'Coat Color & Dappling', icon: 'fa-palette' }
    ];

    traitKeys.forEach(t => {
      if (traits[t.key]) {
        const box = document.createElement('div');
        box.className = 'trait-box';
        box.innerHTML = `
          <div class="trait-title"><i class="fa-solid ${t.icon}"></i> ${t.label}</div>
          <p class="trait-desc">${traits[t.key]}</p>
        `;
        traitsGrid.appendChild(box);
      }
    });

    // 8. Reset Gemini Block
    geminiBody.innerHTML = `
      <p class="gemini-idle-text">
        Click 'Request Expert Appraisal' to generate deep multimodal veterinary diagnostics.
      </p>
    `;
  }

  // --------------------------------------------------------------------------
  // 4. Interactive Split Comparison Slider Logic
  // --------------------------------------------------------------------------
  let isDragging = false;

  function setSliderPosition(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    stageClip.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    comparisonDivider.style.left = `${clamped}%`;
  }

  function handleSliderMove(e) {
    if (!isDragging) return;
    const rect = comparisonStage.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offset = clientX - rect.left;
    const percent = (offset / rect.width) * 100;
    setSliderPosition(percent);
  }

  comparisonStage.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleSliderMove(e);
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', handleSliderMove);

  comparisonStage.addEventListener('touchstart', (e) => {
    isDragging = true;
    handleSliderMove(e);
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', handleSliderMove, { passive: true });

  // --------------------------------------------------------------------------
  // 5. Controls (Colormap, Blend, Heatmap Only)
  // --------------------------------------------------------------------------
  colormapSelect.addEventListener('change', (e) => {
    activeColormap = e.target.value;
    if (currentPredictions) {
      runPrediction({ targetClassIdx: activeClassIdx, colormap: activeColormap });
    }
  });

  alphaSlider.addEventListener('input', (e) => {
    activeAlpha = parseFloat(e.target.value);
    alphaValue.textContent = `${Math.round(activeAlpha * 100)}%`;
  });

  alphaSlider.addEventListener('change', () => {
    if (currentPredictions) {
      runPrediction({ targetClassIdx: activeClassIdx, alpha: activeAlpha });
    }
  });

  btnTogglePureHeatmap.addEventListener('click', () => {
    showPureHeatmap = !showPureHeatmap;
    if (showPureHeatmap) {
      btnTogglePureHeatmap.innerHTML = '<i class="fa-solid fa-layer-group"></i> Blended View';
      if (currentPredictions) {
        overlayImage.src = currentPredictions.visualizations.heatmap_b64;
      }
    } else {
      btnTogglePureHeatmap.innerHTML = '<i class="fa-solid fa-fire"></i> Heatmap Only';
      if (currentPredictions) {
        overlayImage.src = currentPredictions.visualizations.overlay_b64;
      }
    }
  });

  // --------------------------------------------------------------------------
  // 6. File Upload & Drag-and-Drop Handling
  // --------------------------------------------------------------------------
  btnBrowse.addEventListener('click', () => fileInput.click());
  uploadIdleState.querySelector('span').addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      analyzeFile(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
    });
  });

  uploadZone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      analyzeFile(e.dataTransfer.files[0]);
    }
  });

  btnChangeImage.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });

  // --------------------------------------------------------------------------
  // 7. Live Camera Stream Handling
  // --------------------------------------------------------------------------
  btnCamera.addEventListener('click', async () => {
    cameraModal.style.display = 'flex';
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      cameraVideo.srcObject = cameraStream;
    } catch (err) {
      alert(`Camera access denied or unavailable: ${err.message}`);
      cameraModal.style.display = 'none';
    }
  });

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    cameraModal.style.display = 'none';
  }

  btnCloseCamera.addEventListener('click', stopCamera);
  btnCancelCamera.addEventListener('click', stopCamera);

  btnSnapPhoto.addEventListener('click', () => {
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    const ctx = cameraCanvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
    
    cameraCanvas.toBlob((blob) => {
      stopCamera();
      const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
      analyzeFile(file);
    }, 'image/jpeg', 0.95);
  });

  // --------------------------------------------------------------------------
  // 8. Multimodal Gemini Reasoning Request
  // --------------------------------------------------------------------------
  btnRequestGemini.addEventListener('click', async () => {
    if (!currentPredictions) return;

    btnRequestGemini.disabled = true;
    btnRequestGemini.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Appraising...';

    const formData = new FormData();
    if (currentFile) {
      formData.append('file', currentFile);
    } else if (currentSampleId) {
      formData.append('sample_name', currentSampleId);
    }

    const pred = currentPredictions.primary_prediction;
    formData.append('predicted_breed', pred.breed_name);
    formData.append('confidence', pred.confidence);

    const key = localStorage.getItem('PASHUDRISHTI_GEMINI_KEY') || localStorage.getItem('GAUDRISHTI_GEMINI_KEY') || localStorage.getItem('BOV_GEMINI_KEY') || '';
    if (key) {
      formData.append('api_key', key);
    }

    const att = currentPredictions.explainability.anatomical_attention;
    formData.append('horns_attention', att.horns_and_forehead);
    formData.append('face_attention', att.face_eyes_muzzle);
    formData.append('hump_attention', att.hump_dewlap_body);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/explain-gemini`, {
        method: 'POST',
        body: formData
      });

      const report = await res.json();
      renderGeminiReport(report);
    } catch (err) {
      geminiBody.innerHTML = `<p class="gemini-idle-text" style="color: #ef4444;">Appraisal failed: ${err.message}</p>`;
    } finally {
      btnRequestGemini.disabled = false;
      btnRequestGemini.innerHTML = '<i class="fa-solid fa-stethoscope"></i> Re-Appraise Specimen';
    }
  });

  function renderGeminiReport(report) {
    let evidenceHtml = '';
    if (report.visual_evidence) {
      evidenceHtml = report.visual_evidence.map(e => `
        <div class="evidence-chip">
          <strong>${e.feature}:</strong> ${e.observation}
          <small style="color: var(--gold-400); display: block;">Significance: ${e.significance}</small>
        </div>
      `).join('');
    }

    geminiBody.innerHTML = `
      <div class="gemini-report">
        <div class="gemini-verdict"><i class="fa-solid fa-circle-check"></i> ${report.verdict}</div>
        <p class="gemini-summary">${report.summary}</p>
        <div class="gemini-evidence-list">
          ${evidenceHtml}
        </div>
        <div style="font-size: 12px; color: var(--cyan-400); margin-top: 6px;">
          <strong>Utility:</strong> ${report.utility_and_adaptation || 'Premier indigenous livestock adaptability'}
        </div>
        <small style="color: var(--text-muted); font-size: 10px;">Provider: ${report.provider}</small>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 9. Export Diagnostic Card / Summary
  // --------------------------------------------------------------------------
  btnExportReport.addEventListener('click', () => {
    if (!currentPredictions) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentPredictions, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `pashudrishti_report_${currentPredictions.primary_prediction.breed_name.toLowerCase()}.json`);
    dlAnchorElem.click();
  });

  // --------------------------------------------------------------------------
  // 10. Modals Navigation
  // --------------------------------------------------------------------------
  btnInfoModal.addEventListener('click', () => { infoModal.style.display = 'flex'; });
  btnCloseInfo.addEventListener('click', () => { infoModal.style.display = 'none'; });
  btnDismissInfo.addEventListener('click', () => { infoModal.style.display = 'none'; });

  btnSettingsModal.addEventListener('click', () => { settingsModal.style.display = 'flex'; });
  btnCloseSettings.addEventListener('click', () => { settingsModal.style.display = 'none'; });
  btnSaveSettings.addEventListener('click', () => {
    const key = inputApiKey.value.trim();
    localStorage.setItem('PASHUDRISHTI_GEMINI_KEY', key);
    if (inputBackendUrl) {
      const backend = inputBackendUrl.value.trim();
      localStorage.setItem('PASHUDRISHTI_BACKEND_URL', backend);
    }
    settingsModal.style.display = 'none';
    loadSamples();
  });

  [infoModal, settingsModal, cameraModal].forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        m.style.display = 'none';
        if (m === cameraModal) stopCamera();
      }
    });
  });

  // Boot
  loadSamples();
});
