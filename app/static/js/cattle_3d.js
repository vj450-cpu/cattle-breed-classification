/**
 * PashuDrishti AI - Realistic 3D Indigenous Cattle Breed Studio
 * Uses authentic photographic cattle specimens of the 5 iconic Indian breeds:
 * Gir, Kangayam, Ongole, Sahiwal, Hallikar.
 * Features 3D perspective tilt/orbit, scroll-to-zoom for close-up anatomical inspection,
 * lighting, pedestal, and interactive hotspot pins on real breed features.
 */

class RealisticCattle3DStudio {
  constructor(containerId = "cattle3dCanvasContainer") {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.currentBreed = "Gir";
    this.autoRotate = false;
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.camDistance = 5.2;
    this.targetCamDistance = 5.2;
    this.rotY = 0;
    this.rotX = 0;
    this.targetRotY = 0;
    this.targetRotX = 0;
    this.targetPan = new THREE.Vector3(0, 0.45, 0);
    this.currentPan = new THREE.Vector3(0, 0.45, 0);

    // 5 Authentic Breed Photographic Specimens & Traits
    this.breedData = {
      Gir: {
        name: "Gir (Gyr)",
        image: "images/realistic_breeds/gir.jpg",
        origin: "Kathiawar, Gujarat",
        purpose: "Milch (A2 Dairy)",
        traits: {
          horns: "Half-moon horns curving backwards, downwards, then sweeping upwards",
          forehead: "Prominently convex bulging forehead shield protecting eyes from sun",
          hump: "Pronounced rounded thoracic hump",
          dewlap: "Voluminous pendulous skin folds cascading below neck"
        },
        hotspots: [
          { name: "Horn Curvature", pos: [-0.65, 1.25, 0.05], text: "Iconic half-moon curl curving backwards, downwards, then sweeping upwards." },
          { name: "Cranial Dome", pos: [-0.5, 0.95, 0.05], text: "Convex ultra-domed forehead shield characteristic of purebred Gir." },
          { name: "Pendulous Ears", pos: [-0.75, 0.65, 0.05], text: "Long, drooping leaf-like curled ears with terminal notch." },
          { name: "Thoracic Hump", pos: [-0.05, 1.15, 0.05], text: "Well-developed rounded zebu thoracic hump." },
          { name: "Loose Dewlap", pos: [-0.35, 0.25, 0.05], text: "Voluminous pendulous folds for superior heat dissipation." }
        ]
      },
      Kangayam: {
        name: "Kangayam",
        image: "images/realistic_breeds/kangayam.jpg",
        origin: "Kongu Nadu, Tamil Nadu",
        purpose: "Premier Draught",
        traits: {
          horns: "Strong, stout horns curving outwards and backwards with inward tips",
          forehead: "Broad, level flat forehead with central groove",
          hump: "Compact, firm, muscular draught hump with dark charcoal shading",
          dewlap: "Moderate, neatly folded thin dewlap"
        },
        hotspots: [
          { name: "Stout Horns", pos: [-0.7, 1.35, 0.05], text: "Stout, outward-backward curved horns with sharp inward tips." },
          { name: "Flat Forehead", pos: [-0.6, 0.85, 0.05], text: "Broad, level forehead with slight groove between horn roots." },
          { name: "Muscular Hump", pos: [-0.1, 1.2, 0.05], text: "Compact, firm draught hump with dark charcoal carbon shading." },
          { name: "Steel Grey Coat", pos: [0.2, 0.4, 0.05], text: "Solid steel-grey with darker points on knees and poll." }
        ]
      },
      Ongole: {
        name: "Ongole (Nellore)",
        image: "images/realistic_breeds/ongole.jpg",
        origin: "Prakasam, Andhra Pradesh",
        purpose: "Dual Purpose (Milch & Heavy Draught)",
        traits: {
          horns: "Short, stumpy horns growing outwards and backwards",
          forehead: "Broad elliptical forehead with prominent black eye orbits",
          hump: "Massive, erect, iconic thoracic hump in bulls",
          dewlap: "Heavy, cascading dewlap reaching down to chest"
        },
        hotspots: [
          { name: "Stumpy Horns", pos: [-0.7, 1.25, 0.05], text: "Short, thick stumpy horns rarely exceeding 10-14cm." },
          { name: "Massive Hump", pos: [-0.05, 1.35, 0.05], text: "Massive, erect, iconic thoracic hump unique to Ongole bulls." },
          { name: "Cascading Dewlap", pos: [-0.5, 0.35, 0.05], text: "Voluminous, deep cascading folds reaching down to the brisket." },
          { name: "Porcelain White Hide", pos: [0.3, 0.4, 0.05], text: "Glossy white heat-reflecting coat with tick-resistant tight hide." }
        ]
      },
      Sahiwal: {
        name: "Sahiwal (Lola)",
        image: "images/realistic_breeds/sahiwal.jpg",
        origin: "Punjab / Montgomery",
        purpose: "Premier Indigenous Milch",
        traits: {
          horns: "Short, thick conical horns rarely exceeding 12cm",
          forehead: "Medium flat forehead without cranial dome",
          hump: "Broad, fleshy milch hump",
          dewlap: "Extremely loose, pendulous dewlap & naval flap ('Lola')"
        },
        hotspots: [
          { name: "Conical Horns", pos: [0.65, 1.15, 0.05], text: "Short, thick conical stumpy horns." },
          { name: "Loose Dewlap ('Lola')", pos: [0.55, 0.25, 0.05], text: "Extremely loose, voluminous pendulous skin folds extending to navel." },
          { name: "Reddish-Dun Coat", pos: [-0.2, 0.5, 0.05], text: "Rich mahogany red-dun coat with high milk yield genetics." }
        ]
      },
      Hallikar: {
        name: "Hallikar",
        image: "images/realistic_breeds/hallikar.jpg",
        origin: "Mysuru, Karnataka",
        purpose: "High-Speed Draught Trotting",
        traits: {
          horns: "Iconic very long, sharp, backward-swept spear horns close at base",
          forehead: "Narrow, elongated poll with alert expression",
          hump: "Compact, tight draught hump",
          dewlap: "Light, streamlined dewlap for high-speed road trotting"
        },
        hotspots: [
          { name: "Spear Horns", pos: [0.45, 1.45, 0.05], text: "Iconic long, sharp, backward-swept spear horns emerging close together." },
          { name: "Alert Poll", pos: [0.45, 0.65, 0.05], text: "Narrow, elongated poll with fiery trotting expression." },
          { name: "Athletic Frame", pos: [-0.2, 0.3, 0.05], text: "Lean, muscular draught stature bred for hours of continuous trotting." }
        ]
      }
    };

    this.initScene();
    this.loadBreed(this.currentBreed);
    this.setupInteraction();
    this.animate();
  }

  initScene() {
    const width = this.container.clientWidth || 640;
    const height = this.container.clientHeight || 420;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.45, this.camDistance);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    // Warm Studio Lighting
    const key = new THREE.DirectionalLight(0xfff5e6, 2.2);
    key.position.set(4, 6, 5);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xf59e0b, 2.8);
    rim.position.set(-5, 4, -4);
    this.scene.add(rim);

    const ambient = new THREE.AmbientLight(0x4a2e18, 1.8);
    this.scene.add(ambient);

    // 3D Rotating Stage Group
    this.stageGroup = new THREE.Group();
    this.scene.add(this.stageGroup);

    // Pedestal Base
    const pedGeo = new THREE.CylinderGeometry(2.3, 2.5, 0.18, 48);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x1a1109,
      roughness: 0.45,
      metalness: 0.6
    });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.y = -1.1;
    this.stageGroup.add(ped);

    // Inscribed Golden Ring on Pedestal
    const ringGeo = new THREE.RingGeometry(1.9, 1.96, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.0;
    this.stageGroup.add(ring);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  loadBreed(breedKey) {
    if (!this.breedData[breedKey]) return;
    this.currentBreed = breedKey;
    const data = this.breedData[breedKey];

    // Remove old specimen mesh
    if (this.specimenMesh) {
      this.stageGroup.remove(this.specimenMesh);
      if (this.specimenMesh.geometry) this.specimenMesh.geometry.dispose();
      if (this.specimenMesh.material) this.specimenMesh.material.dispose();
    }

    // Remove old hotspots
    if (this.hotspotsGroup) {
      this.stageGroup.remove(this.hotspotsGroup);
    }

    // Load High-Resolution Authentic Cattle Photo
    const loader = new THREE.TextureLoader();
    loader.load(data.image, (texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      // Realistic 4:3 Aspect Ratio Plane
      const planeGeo = new THREE.PlaneGeometry(3.6, 2.7, 32, 32);
      
      // Slightly curve the plane for subtle depth feel
      const pos = planeGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const curveZ = -0.15 * Math.pow(x / 1.8, 2);
        pos.setZ(i, curveZ);
      }
      planeGeo.computeVertexNormals();

      const planeMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.15,
        side: THREE.DoubleSide
      });

      this.specimenMesh = new THREE.Mesh(planeGeo, planeMat);
      this.specimenMesh.position.set(0, 0.45, 0);
      this.stageGroup.add(this.specimenMesh);

      // Create Hotspots
      this.createHotspots(data.hotspots);
    });

    this.updateCard(breedKey);
  }

  createHotspots(hotspotList) {
    this.hotspotsGroup = new THREE.Group();

    hotspotList.forEach((h) => {
      const pin = new THREE.Group();
      pin.position.set(h.pos[0], h.pos[1] + 0.45, h.pos[2]);
      pin.userData = h;

      // Pulsing golden ring
      const ringGeo = new THREE.RingGeometry(0.08, 0.11, 20);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      pin.add(ringMesh);

      // Glowing center core
      const coreGeo = new THREE.CircleGeometry(0.05, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      pin.add(coreMesh);

      this.hotspotsGroup.add(pin);
    });

    this.stageGroup.add(this.hotspotsGroup);
  }

  updateCard(breedKey) {
    const data = this.breedData[breedKey];
    const nameEl = document.getElementById("threedBreedName");
    const originEl = document.getElementById("threedBreedOrigin");
    const purposeEl = document.getElementById("threedBreedPurpose");
    const traitEl = document.getElementById("threedBreedTraits");

    if (nameEl) nameEl.textContent = data.name;
    if (originEl) originEl.textContent = data.origin;
    if (purposeEl) purposeEl.textContent = data.purpose;
    if (traitEl) {
      traitEl.innerHTML = `
        <div><strong>Horns:</strong> ${data.traits.horns}</div>
        <div><strong>Forehead:</strong> ${data.traits.forehead}</div>
        <div><strong>Hump:</strong> ${data.traits.hump}</div>
        <div><strong>Dewlap:</strong> ${data.traits.dewlap}</div>
      `;
    }

    document.querySelectorAll(".breed-3d-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.breed === breedKey);
    });
  }

  setupInteraction() {
    const dom = this.renderer.domElement;

    dom.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.prevMouse = { x: e.clientX, y: e.clientY };
      this.autoRotate = false;
      const toggle = document.getElementById("toggleAutoRotate");
      if (toggle) toggle.classList.remove("active");
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;

      this.targetRotY += dx * 0.007;
      this.targetRotX = Math.max(-0.45, Math.min(0.45, this.targetRotX + dy * 0.005));

      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    // Touch Support
    dom.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.autoRotate = false;
      }
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.prevMouse.x;
      const dy = e.touches[0].clientY - this.prevMouse.y;

      this.targetRotY += dx * 0.007;
      this.targetRotX = Math.max(-0.45, Math.min(0.45, this.targetRotX + dy * 0.005));

      this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    window.addEventListener("touchend", () => {
      this.isDragging = false;
    });

    // Scroll Wheel Zoom (Smoothly inspect fine photographic details)
    dom.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.004;
      this.targetCamDistance = Math.max(2.4, Math.min(8.5, this.targetCamDistance + delta));
    }, { passive: false });

    // Click Hotspot Pins
    dom.addEventListener("click", (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.hotspotsGroup) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.hotspotsGroup.children, true);
        if (hits.length > 0) {
          let pin = hits[0].object;
          while (pin.parent && !pin.userData.name) pin = pin.parent;
          if (pin.userData && pin.userData.name) {
            this.showTooltip(pin.userData, e.clientX, e.clientY);
            // Smoothly pan camera towards hotspot
            this.targetPan.set(pin.position.x * 0.4, pin.position.y, 0);
            this.targetCamDistance = 3.6;
          }
        }
      }
    });

    window.addEventListener("resize", () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  showTooltip(data, screenX, screenY) {
    let tip = document.getElementById("threedHotspotTooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "threedHotspotTooltip";
      tip.className = "threed-hotspot-tooltip";
      document.body.appendChild(tip);
    }

    tip.innerHTML = `
      <div class="tooltip-header"><i class="fa-solid fa-bullseye"></i> ${data.name}</div>
      <div class="tooltip-body">${data.text}</div>
    `;
    tip.style.left = `${screenX + 12}px`;
    tip.style.top = `${screenY + 12}px`;
    tip.style.display = "block";

    clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => { tip.style.display = "none"; }, 5000);
  }

  setCameraAngle(angle) {
    this.autoRotate = false;
    const toggle = document.getElementById("toggleAutoRotate");
    if (toggle) toggle.classList.remove("active");

    if (angle === "horns") {
      this.targetPan.set(this.currentBreed === "Sahiwal" || this.currentBreed === "Hallikar" ? 0.4 : -0.5, 1.2, 0);
      this.targetCamDistance = 2.8;
      this.targetRotY = 0;
      this.targetRotX = 0.05;
    } else if (angle === "hump") {
      this.targetPan.set(0, 1.0, 0);
      this.targetCamDistance = 3.2;
      this.targetRotY = 0;
      this.targetRotX = 0;
    } else if (angle === "side") {
      this.targetPan.set(0, 0.45, 0);
      this.targetCamDistance = 5.2;
      this.targetRotY = 0.35;
      this.targetRotX = 0;
    } else if (angle === "full") {
      this.targetPan.set(0, 0.45, 0);
      this.targetCamDistance = 5.2;
      this.targetRotY = 0;
      this.targetRotX = 0;
    }
  }

  toggleAutoRotation() {
    this.autoRotate = !this.autoRotate;
    const toggle = document.getElementById("toggleAutoRotate");
    if (toggle) toggle.classList.toggle("active", this.autoRotate);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Interpolate rotation
    if (this.autoRotate) {
      this.targetRotY += 0.005;
    }
    this.rotY += (this.targetRotY - this.rotY) * 0.1;
    this.rotX += (this.targetRotX - this.rotX) * 0.1;
    this.stageGroup.rotation.y = this.rotY;
    this.stageGroup.rotation.x = this.rotX;

    // Interpolate pan & zoom
    this.camDistance += (this.targetCamDistance - this.camDistance) * 0.1;
    this.currentPan.lerp(this.targetPan, 0.1);

    this.camera.position.set(this.currentPan.x, this.currentPan.y, this.camDistance);
    this.camera.lookAt(this.currentPan.x, this.currentPan.y, 0);

    // Pulse Hotspots
    if (this.hotspotsGroup) {
      const t = Date.now() * 0.004;
      this.hotspotsGroup.children.forEach((pin, i) => {
        const ring = pin.children[0];
        if (ring) {
          const s = 1.0 + 0.25 * Math.sin(t + i * 1.3);
          ring.scale.set(s, s, s);
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.initCattle3D = function () {
  if (typeof THREE !== "undefined") {
    window.cattleStudio = new RealisticCattle3DStudio("cattle3dCanvasContainer");
  }
};
