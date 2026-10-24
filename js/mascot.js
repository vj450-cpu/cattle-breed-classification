/**
 * PashuDrishti AI - Interactive Cattle Portrait & Cud-Chewing Animation
 * Uses authentic cattle imagery with mouth-opening & cud-chewing animations,
 * strictly constrained to a compact, elegant corner widget.
 */

class RealCowChewingWidget {
  constructor(containerId = "cowMascotContainer") {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.soundEnabled = true;
    this.isMooing = false;
    this.audioCtx = null;
    this.quotes = [
      "Gir cows chew cud up to 8 hours a day, digesting cellulose with specialized rumen microbes!",
      "Kangayam cattle have remarkable drought endurance and muscular draught power! 🌾",
      "Ongole cattle are revered for their heat tolerance and tick-resistant sleek hide!",
      "Sahiwal milk contains pure A2 beta-casein proteins with high butterfat content!",
      "Hallikar bullocks possess unparalleled stamina for fast-paced road trotting! ⚡"
    ];
    this.quoteIdx = 0;

    this.render();
    this.setupEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="real-cow-widget" style="position: relative; width: 92px; height: 92px;">
        <!-- Speech Tooltip -->
        <div class="cow-speech-card" id="cowSpeechCard" style="display: none;">
          <div id="cowSpeechText" style="font-size: 11px; color: #fffbeb; line-height: 1.4;">
            Mooo! 🌿 Click me to see cud chewing or test a cattle photo!
          </div>
        </div>

        <!-- Compact Circular Gold Frame with Real Cattle Specimen -->
        <div class="cow-portrait-circle" id="cowPortraitCircle" title="Click to feed grass & see mouth opening!" style="width: 88px; height: 88px; border-radius: 50%; border: 3px solid #f59e0b; overflow: hidden; box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); cursor: pointer; position: relative; background: #26160c;">
          <!-- Upper Head -->
          <img src="samples/gir_sample.jpg" id="cowUpperHead" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s ease;">
          
          <!-- Animated Lower Jaw / Mouth Opening Overlay -->
          <div id="cowJawClip" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 42%; overflow: hidden; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);">
            <img src="samples/gir_sample.jpg" style="position: absolute; bottom: 0; left: 0; width: 88px; height: 88px; object-fit: cover;">
          </div>

          <!-- Fresh Green Grass Sprig (Hidden until chewing/mouth opens) -->
          <div id="cowGrassSprig" style="position: absolute; bottom: 12px; right: 8px; font-size: 16px; opacity: 0; transition: opacity 0.2s; pointer-events: none;">
            🌿
          </div>
        </div>

        <!-- Audio toggle button -->
        <button id="btnCowSound" title="Toggle Sound" style="position: absolute; top: -4px; left: -4px; width: 22px; height: 22px; border-radius: 50%; background: #211208; border: 1px solid #f59e0b; color: #f59e0b; font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>
    `;
  }

  setupEvents() {
    const portrait = document.getElementById("cowPortraitCircle");
    const soundBtn = document.getElementById("btnCowSound");

    if (portrait) {
      portrait.addEventListener("click", () => {
        this.openMouthAndChew();
      });
    }

    if (soundBtn) {
      soundBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.soundEnabled = !this.soundEnabled;
        soundBtn.innerHTML = this.soundEnabled
          ? `<i class="fa-solid fa-volume-high"></i>`
          : `<i class="fa-solid fa-volume-xmark"></i>`;
      });
    }

    // Gentle cud-chewing rhythm every 6 seconds
    setInterval(() => {
      if (!this.isMooing) {
        this.gentleChewCycle();
      }
    }, 5500);
  }

  gentleChewCycle() {
    const jaw = document.getElementById("cowJawClip");
    const grass = document.getElementById("cowGrassSprig");
    if (!jaw) return;

    if (grass) grass.style.opacity = "0.7";
    jaw.style.transform = "translate(2px, 3px)";
    setTimeout(() => {
      jaw.style.transform = "translate(-2px, 2px)";
      setTimeout(() => {
        jaw.style.transform = "translate(0, 0)";
        if (grass) grass.style.opacity = "0";
      }, 250);
    }, 250);
  }

  openMouthAndChew(customText = null) {
    if (this.isMooing) return;
    this.isMooing = true;

    this.playMoo();

    const jaw = document.getElementById("cowJawClip");
    const upper = document.getElementById("cowUpperHead");
    const grass = document.getElementById("cowGrassSprig");
    const speechCard = document.getElementById("cowSpeechCard");
    const speechText = document.getElementById("cowSpeechText");

    // Wide mouth opening animation
    if (jaw) jaw.style.transform = "translateY(8px)";
    if (upper) upper.style.transform = "translateY(-3px)";
    if (grass) grass.style.opacity = "1";

    if (speechCard && speechText) {
      speechText.textContent = customText || this.quotes[this.quoteIdx % this.quotes.length];
      this.quoteIdx++;
      speechCard.style.display = "block";
      clearTimeout(this.speechTimer);
      this.speechTimer = setTimeout(() => {
        speechCard.style.display = "none";
      }, 6000);
    }

    // Close mouth back to normal
    setTimeout(() => {
      if (jaw) jaw.style.transform = "translateY(0)";
      if (upper) upper.style.transform = "translateY(0)";
      if (grass) grass.style.opacity = "0";
      this.isMooing = false;
    }, 1100);
  }

  playMoo() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === "suspended") this.audioCtx.resume();

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(138, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(95, now + 1.1);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(350, now + 1.1);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {}
  }

  say(text) {
    this.openMouthAndChew(text);
  }
}

window.initCowMascot = function () {
  window.cowMascot = new RealCowChewingWidget("cowMascotContainer");
};
