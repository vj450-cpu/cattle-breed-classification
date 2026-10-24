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
    return custom ? custom.replace(/\/+$/, '') : '';
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

    // Attempt live API call if possible
    let apiSuccess = false;
    if (currentFile || !currentSampleId) {
      const formData = new FormData();
      if (currentFile) formData.append('file', currentFile);
      if (targetClassIdx !== null) formData.append('target_class_idx', targetClassIdx);
      formData.append('colormap', colormap);
      formData.append('alpha', alpha);

      try {
        const res = await fetch(`${getApiBaseUrl()}/api/predict`, { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          clearTimeout(coldTimer);
          currentPredictions = data;
          activeClassIdx = data.selected_class_index;
          renderResults(data);
          apiSuccess = true;
        }
      } catch (e) {
        console.warn('API call failed, checking fallback:', e);
      }
    } else if (currentSampleId) {
      try {
        const formData = new FormData();
        formData.append('sample_name', currentSampleId);
        if (targetClassIdx !== null) formData.append('target_class_idx', targetClassIdx);
        formData.append('colormap', colormap);
        formData.append('alpha', alpha);

        const res = await fetch(`${getApiBaseUrl()}/api/predict`, { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          clearTimeout(coldTimer);
          currentPredictions = data;
          activeClassIdx = data.selected_class_index;
          renderResults(data);
          apiSuccess = true;
        }
      } catch (e) {
        console.log('Live backend unavailable, falling back to precomputed Grad-CAM demo cache');
      }

      // If backend not reachable, use precomputed cache for GitHub Pages
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

    if (!apiSuccess && currentFile) {
      if (placeholderCard) {
        placeholderCard.innerHTML = `
          <div class="empty-art">
            <i class="fa-solid fa-circle-exclamation" style="color: #f59e0b; font-size: 40px;"></i>
          </div>
          <h3 style="color: #f59e0b; margin: 12px 0 6px;">Server Waking Up or Connecting</h3>
          <p style="color: var(--text-secondary); font-size: 13px;">The free cloud container is currently booting up (Render Free Tier cold start) or processing.</p>
          <div style="margin: 18px 0; display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-primary" id="btnRetryInference">
              <i class="fa-solid fa-rotate-right"></i> Retry Analysis
            </button>
          </div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">
            💡 <strong>Fastest Local Option:</strong> Run <code>python run.py</code> on your laptop to run inference on your local RTX 4050 GPU in <strong>18ms</strong> with your checkpoint!
          </p>
        `;
        const retryBtn = document.getElementById('btnRetryInference');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => runPrediction());
        }
      }
      if (window.cowMascot) {
        window.cowMascot.say("Cloud server is booting up! Click 'Retry Analysis' in a few seconds! 🐂");
      }
    }

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
