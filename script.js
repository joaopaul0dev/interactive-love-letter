/* ═══════════════════════════════════════════════════════════════
   SECRETS SYSTEM
   Each secret: { id, icon, title, desc, found: false }
═══════════════════════════════════════════════════════════════ */
const SECRETS = [
  { id:"star1",   icon:"✦",  title:"Primeira Estrela",       desc:"Uma fagulha acesa — você é a melhor parte de mim.",         found:false },
  { id:"star2",   icon:"✦",  title:"Segunda Estrela",        desc:"A frase continua a se completar.",                          found:false },
  { id:"star3",   icon:"✦",  title:"Terceira Estrela",       desc:"A constelação completa: você é a melhor parte de mim.",     found:false },
  { id:"allstars",icon:"✦✦✦",title:"Constelação Completa",   desc:"As três estrelas revelaram uma mensagem no fim da carta.",  found:false },
  { id:"ghost",   icon:"👁", title:"Sussurro Fantasma",      desc:"O título guarda uma confissão sussurrada.",                 found:false },
  { id:"fold",    icon:"📄", title:"Canto Dobrado",          desc:"Um PS:  escondido no canto da folha.",            found:false },
  { id:"blot",    icon:"🖋", title:"Borrão de Tinta",        desc:"Rascunhos apagados que te escondi.",            found:false },
  { id:"ms",      icon:"📜", title:"Manuscrito Revelado",   desc:"Uma das passagens expandidas foi aberta.",                  found:false },
  { id:"inkblock",icon:"🖊", title:"Tinta Invisível",        desc:"A assinatura revelou palavras que nunca foram escritas.",   found:false },
  { id:"fadedps", icon:"✉️", title:"Post-scriptum Apagado", desc:"Uma confissão quase invisível no rodapé da carta.",         found:false },
  { id:"annot",   icon:"🌙", title:"Anotação Noturna",       desc:"Escrito na hora que mais queria te ter comigo.",      found:false },
  { id:"wax",     icon:"🔴", title:"Selo de Cera",           desc:"O selo vermelho que marca esta carta.", found:false },
];

const STORAGE_KEY_DATE    = "ana_clara_start_date_v2";
const STORAGE_KEY_SECRETS = "ana_clara_secrets_v1";

/* restore found secrets from localStorage */
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_SECRETS) || "{}");
  SECRETS.forEach(s => { if (saved[s.id]) s.found = true; });
} catch(e) {}

function saveSecrets() {
  const map = {};
  SECRETS.forEach(s => { if (s.found) map[s.id] = true; });
  localStorage.setItem(STORAGE_KEY_SECRETS, JSON.stringify(map));
}

function findSecret(id) {
  const s = SECRETS.find(x => x.id === id);
  if (!s || s.found) return;
  s.found = true;
  saveSecrets();
  renderSecretsPanel();
  flashBadge();
  // Play discovery sound if audio context is ready
  if (audioCtx) playSecretFound();
  else {
    // queue for after first user interaction
    document.addEventListener("click", function _once() {
      document.removeEventListener("click", _once);
      ensureAudioCtx();
      setTimeout(playSecretFound, 80);
    }, { once: true });
  }
}

function renderSecretsPanel() {
  const found = SECRETS.filter(s => s.found);
  const total = SECRETS.length;
  document.getElementById("secretsCount").textContent = `${found.length} de ${total} segredos descobertos`;

  const list = document.getElementById("secretsList");
  if (found.length === 0) {
    list.innerHTML = `<div class="secrets-empty">Explore a carta com cuidado.<br>Há coisas escondidas<br>para quem sabe procurar.</div>`;
    return;
  }
  list.innerHTML = "";
  found.forEach(s => {
    const el = document.createElement("div");
    el.className = "secret-entry";
    el.innerHTML = `<div class="secret-entry-icon">${s.icon}</div>
      <div class="secret-entry-title">${s.title}</div>
      <div class="secret-entry-desc">${s.desc}</div>`;
    list.appendChild(el);
  });
}

function flashBadge() {
  const badge = document.getElementById("secretsBadge");
  const count = SECRETS.filter(s => s.found).length;
  badge.textContent = count;
  badge.classList.add("show");
  badge.style.animation = "none"; void badge.offsetWidth;
  badge.style.animation = "dotPulse 0.4s ease 2";
}

renderSecretsPanel();
const initialFound = SECRETS.filter(s => s.found).length;
if (initialFound > 0) {
  document.getElementById("secretsBadge").textContent = initialFound;
  document.getElementById("secretsBadge").classList.add("show");
}

/* Secrets panel toggle */
document.getElementById("secretsBtn").addEventListener("click", () => {
  document.getElementById("secretsPanel").classList.toggle("open");
});
document.getElementById("secretsPanelClose").addEventListener("click", () => {
  document.getElementById("secretsPanel").classList.remove("open");
});

/* ═══ BOTTOM SECRETS TRIGGERS ═══ */

/* Invisible ink: hover signature for 1.5s to reveal */
let inkHoverTimer = null;
const sigEl = document.getElementById("signatureEl");
if (sigEl) {
  sigEl.style.cursor = "default";
  sigEl.addEventListener("mouseenter", () => {
    inkHoverTimer = setTimeout(() => {
      const block = document.getElementById("inkBlock");
      block.classList.add("revealed");
      block.style.pointerEvents = "auto";
      findSecret("inkblock");
    }, 1500);
  });
  sigEl.addEventListener("mouseleave", () => clearTimeout(inkHoverTimer));
}

/* Faded PS: reveals after 8 seconds on page */
setTimeout(() => {
  const fp = document.getElementById("fadedPs");
  if (fp) fp.classList.add("revealed");
}, 8000);

/* Secret annotation: triple-click signature */
let sigClickCount = 0, sigClickTimer = null;
if (sigEl) {
  sigEl.addEventListener("click", () => {
    sigClickCount++;
    clearTimeout(sigClickTimer);
    if (sigClickCount >= 3) {
      sigClickCount = 0;
      document.getElementById("secretAnnotation").classList.add("revealed");
      findSecret("annot");
    } else {
      sigClickTimer = setTimeout(() => { sigClickCount = 0; }, 700);
    }
  });
}

/* Faded PS secret — register when it becomes visible */
setTimeout(() => findSecret("fadedps"), 8500);

/* ── WAX SEAL — click to stamp ── */
const waxEl = document.getElementById("waxSeal");
let waxSealed = false;
// Restore sealed state from localStorage
if (localStorage.getItem("ana_clara_wax_sealed")) {
  waxSealed = true;
  waxEl.classList.add("sealed");
  document.getElementById("sealRevealText").classList.add("visible");
}

if (waxEl) {
  waxEl.addEventListener("mouseenter", () => findSecret("wax"));

  waxEl.addEventListener("click", () => {
    if (waxSealed) return;
    waxSealed = true;
    localStorage.setItem("ana_clara_wax_sealed", "1");

    // Stamp animation
    waxEl.classList.add("stamping");
    playWaxSeal();

    setTimeout(() => {
      waxEl.classList.remove("stamping");
      waxEl.classList.add("sealed");
      // Reveal text below
      const rt = document.getElementById("sealRevealText");
      if (rt) rt.classList.add("visible");
      // Burst particles from seal
      const r = waxEl.getBoundingClientRect();
      const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      for (let i = 0; i < 30; i++) {
        const p = mkBurstParticle(ox, oy);
        p.hue = Math.random() * 20 + 5; // deep red/amber tones
        p.r   = Math.random() * 2.5 + 0.8;
        particles.push(p);
      }
    }, 680);
  });
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function formatDatePT(d) {
  const months = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}
function formatTimePT(d) {
  return `${String(d.getHours()).padStart(2,"0")}h${String(d.getMinutes()).padStart(2,"0")}`;
}

/* ═══════════════════════════════════════════════════════════════
   DATE / COUNTER
═══════════════════════════════════════════════════════════════ */
let startDate = null, counterInterval = null;

function showDateBlock(date) {
  const block = document.getElementById("dateCounterFinal");
  const since = document.getElementById("sinceDateBig");
  const ctr   = document.getElementById("counterBig");
  block.style.display = "block";
  block.style.animation = "dateAppear 1.2s ease forwards";
  since.textContent = `Desde ${formatDatePT(date)}, minha história tem o seu nome.`;
  updateCounterBig(date, ctr);
  if (!counterInterval) counterInterval = setInterval(() => updateCounterBig(date, ctr), 30000);
}

function updateCounterBig(date, el) {
  const diff  = Date.now() - date.getTime();
  if (diff < 0) { el.textContent = "O futuro começa em breve…"; return; }
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  el.style.animation = "none"; void el.offsetWidth;
  el.style.animation = "counterReveal 0.8s ease forwards";
  el.textContent = `Estamos escrevendo essa história há ${days} dia${days!==1?"s":""}, ${hours} hora${hours!==1?"s":""} e ${mins} minuto${mins!==1?"s":""}.`;
}

const stored = localStorage.getItem(STORAGE_KEY_DATE);
if (stored) {
  startDate = new Date(stored);
  showDateBlock(startDate);
  hideCommitSection();
}

function hideCommitSection() {
  const sec = document.getElementById("commitSection");
  if (sec) { sec.style.maxHeight = "0"; sec.style.opacity = "0"; sec.style.pointerEvents = "none"; sec.style.marginTop = "0"; sec.style.paddingTop = "0"; }
}

document.getElementById("commitBtn").addEventListener("click", function() {
  if (localStorage.getItem(STORAGE_KEY_DATE)) return;
  const now = new Date();
  localStorage.setItem(STORAGE_KEY_DATE, now.toISOString());
  startDate = now;
  this.classList.add("burning");
  if (audioCtx) playChime();
  for (let i = 0; i < 45; i++) particles.push(mkBurstParticle(window.innerWidth*0.5, window.innerHeight*0.55));
  setTimeout(() => {
    this.classList.remove("burning");
    this.textContent = "✦  Nossa história já começou  ✦";
    this.classList.add("done");
    this.disabled = true;
    document.getElementById("commitHint").textContent = `Este capítulo foi aberto em ${formatDatePT(now)} às ${formatTimePT(now)}.`;
    document.getElementById("commitHint").style.color = "#7a5020";
    showDateBlock(now);
  }, 1050);
});

/* ═══════════════════════════════════════════════════════════════
   DIVIDER STARS
═══════════════════════════════════════════════════════════════ */
const starGlyphs = document.querySelectorAll(".star-glyph");
const litStars   = new Set();

starGlyphs.forEach(star => {
  const idx = parseInt(star.dataset.star);

  star.addEventListener("click", function(e) {
    e.stopPropagation();

    if (litStars.has(idx)) {
      litStars.delete(idx);
      star.classList.remove("lit");
      // hide reveal section if not all lit
      document.getElementById("starRevealSection").classList.remove("revealed");
      document.getElementById("secretPs").classList.remove("revealed");
    } else {
      litStars.add(idx);
      star.classList.add("lit");
      burstGoldParticles(star);
      playStarClick();

      // Register secret
      findSecret("star" + (idx+1));

      // All 3 lit?
      if (litStars.size === 3) {
        setTimeout(() => {
          document.getElementById("secretPs").classList.add("revealed");
          document.getElementById("starRevealSection").classList.add("revealed");
          // Scroll to reveal section
          setTimeout(() => {
            document.getElementById("starRevealSection").scrollIntoView({ behavior: "smooth", block: "center" });
          }, 600);
        }, 400);
        findSecret("allstars");
      }
    }
  });
});

/* ═══════════════════════════════════════════════════════════════
   EXPANDABLE WORDS (manuscript panels)
═══════════════════════════════════════════════════════════════ */
document.querySelectorAll(".expand-word").forEach(word => {
  word.addEventListener("click", function() {
    const id    = this.dataset.id;
    const panel = document.getElementById(id);
    if (!panel) return;
    if (panel.classList.contains("open")) {
      panel.classList.add("closing");
      setTimeout(() => panel.classList.remove("open","closing"), 350);
    } else {
      document.querySelectorAll(".manuscript-panel.open").forEach(p => {
        p.classList.add("closing");
        setTimeout(() => p.classList.remove("open","closing"), 350);
      });
      setTimeout(() => panel.classList.add("open"), 60);
      findSecret("ms");
    }
  });
});

/* ═══════════════════════════════════════════════════════════════
   HIDDEN SECRETS — triggers
═══════════════════════════════════════════════════════════════ */
/* Ghost title hover */
document.querySelector(".letter-title").addEventListener("mouseenter", () => findSecret("ghost"));
/* Corner fold hover */
document.querySelector(".corner-fold").addEventListener("mouseenter", () => findSecret("fold"));
/* Ink blots */
document.querySelectorAll(".secret-blot").forEach(b => b.addEventListener("mouseenter", () => findSecret("blot")));

/* ═══════════════════════════════════════════════════════════════
   AUDIO CONTEXT & SOUNDS
═══════════════════════════════════════════════════════════════ */
let audioCtx = null;

function ensureAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

/* ── Star click: gentle soft chime (very quiet bell-like tone) ── */
function playStarClick() {
  ensureAudioCtx();
  // Create a soft triangle + sine bell at gentle volume
  const t = audioCtx.currentTime;
  const osc  = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filt = audioCtx.createBiquadFilter();

  filt.type = "lowpass"; filt.frequency.value = 2200; filt.Q.value = 0.5;

  osc.type  = "sine";     osc.frequency.setValueAtTime(880, t);
  osc2.type = "triangle"; osc2.frequency.setValueAtTime(1320, t);

  const g2 = audioCtx.createGain(); g2.gain.value = 0.25;

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.055, t + 0.02); // very soft
  gain.gain.exponentialRampToValueAtTime(0.018, t + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);

  osc.connect(filt); osc2.connect(g2); g2.connect(filt);
  filt.connect(gain); gain.connect(audioCtx.destination);

  osc.start(t);  osc.stop(t + 1.2);
  osc2.start(t); osc2.stop(t + 1.2);
}

/* ── Wax seal stamp: deep press thud ── */
function playWaxSeal() {
  ensureAudioCtx();
  const t = audioCtx.currentTime;

  // Low thud — impact body
  const thudOsc  = audioCtx.createOscillator();
  const thudGain = audioCtx.createGain();
  thudOsc.type = "sine";
  thudOsc.frequency.setValueAtTime(95, t);
  thudOsc.frequency.exponentialRampToValueAtTime(42, t + 0.18);
  thudGain.gain.setValueAtTime(0, t);
  thudGain.gain.linearRampToValueAtTime(0.38, t + 0.012);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  thudOsc.connect(thudGain); thudGain.connect(audioCtx.destination);
  thudOsc.start(t); thudOsc.stop(t + 0.3);

  // Wax crackle — brief filtered noise burst
  const crackleBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.12, audioCtx.sampleRate);
  const cd = crackleBuf.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / cd.length, 1.8);
  const crackSrc  = audioCtx.createBufferSource();
  const crackFilt = audioCtx.createBiquadFilter();
  const crackGain = audioCtx.createGain();
  crackSrc.buffer = crackleBuf;
  crackFilt.type = "bandpass"; crackFilt.frequency.value = 1800; crackFilt.Q.value = 0.8;
  crackGain.gain.setValueAtTime(0.18, t + 0.02);
  crackGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  crackSrc.connect(crackFilt); crackFilt.connect(crackGain); crackGain.connect(audioCtx.destination);
  crackSrc.start(t + 0.02); crackSrc.stop(t + 0.2);

  // Soft resonant tail — the wax settling
  const tailOsc  = audioCtx.createOscillator();
  const tailGain = audioCtx.createGain();
  tailOsc.type = "sine";
  tailOsc.frequency.setValueAtTime(220, t + 0.08);
  tailOsc.frequency.exponentialRampToValueAtTime(140, t + 0.5);
  tailGain.gain.setValueAtTime(0, t + 0.08);
  tailGain.gain.linearRampToValueAtTime(0.04, t + 0.12);
  tailGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  tailOsc.connect(tailGain); tailGain.connect(audioCtx.destination);
  tailOsc.start(t + 0.08); tailOsc.stop(t + 0.6);
}

/* ── Secret discovered: soft paper whisper ── */
function playSecretFound() {
  ensureAudioCtx();
  const t = audioCtx.currentTime;

  // Rustle — filtered noise
  const buf  = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.35, audioCtx.sampleRate);
  const d    = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    const env = Math.sin(Math.PI * i / d.length);
    d[i] = (Math.random() * 2 - 1) * env * 0.5;
  }
  const src  = audioCtx.createBufferSource();
  const filt = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  src.buffer = buf;
  filt.type = "bandpass"; filt.frequency.value = 2200; filt.Q.value = 1.2;
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.linearRampToValueAtTime(0.0001, t + 0.35);
  src.connect(filt); filt.connect(gain); gain.connect(audioCtx.destination);
  src.start(t); src.stop(t + 0.4);

  // Bright chime overtone
  const osc  = audioCtx.createOscillator();
  const og   = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1480, t + 0.05);
  og.gain.setValueAtTime(0, t + 0.05);
  og.gain.linearRampToValueAtTime(0.038, t + 0.08);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
  osc.connect(og); og.connect(audioCtx.destination);
  osc.start(t + 0.05); osc.stop(t + 0.7);
}

/* ── Commit button chime ── */
function playChime() {
  ensureAudioCtx();
  const freqs = [523.25, 659.25, 783.99, 1046.5];
  freqs.forEach((f, i) => {
    const t   = audioCtx.currentTime + i * 0.18;
    const osc = audioCtx.createOscillator();
    const g   = audioCtx.createGain();
    osc.type = "sine"; osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 1.6);
  });
}

/* ═══════════════════════════════════════════════════════════════
   BACKGROUND MUSIC — 3 generative tracks
═══════════════════════════════════════════════════════════════ */
let musicRunning = false, currentTrack = -1;
let masterGain = null, musicScheduler = null;

const TRACKS = [
  {
    name: "Noite de Papel",
    // Pentatonic C minor — slow and melancholic
    notes:  [261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 622.25],
    bpm:    42,
    color:  "triangle",
    volume: 0.20,
    pattern: [0,2,4,6,5,3,1,2,4,3,1,0]
  },
  {
    name: "Poeira de Luz",
    // Lydian — dreamlike, floating
    notes:  [293.66, 329.63, 369.99, 415.30, 440.00, 493.88, 554.37, 587.33],
    bpm:    50,
    color:  "sine",
    volume: 0.18,
    pattern: [0,1,3,5,7,6,4,2,3,5,4,2,1,0]
  },
  {
    name: "Carta Aberta",
    // Major pentatonic — warm, hopeful
    notes:  [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
    bpm:    46,
    color:  "triangle",
    volume: 0.22,
    pattern: [0,2,3,5,7,6,4,3,2,1,3,5,4,2,0]
  }
];

function buildReverb(ctx) {
  const conv = ctx.createConvolver();
  const len  = ctx.sampleRate * 4;
  const buf  = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.8);
  }
  conv.buffer = buf;
  return conv;
}

function startTrack(idx) {
  ensureAudioCtx();
  stopMusic(false);
  const track = TRACKS[idx];
  currentTrack = idx;
  musicRunning = true;

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(track.volume, audioCtx.currentTime + 3);
  masterGain.connect(audioCtx.destination);

  const conv    = buildReverb(audioCtx);
  conv.connect(masterGain);
  const dryG = audioCtx.createGain(); dryG.gain.value = 0.4; dryG.connect(masterGain);
  const wetG = audioCtx.createGain(); wetG.gain.value = 0.6; wetG.connect(conv);

  const beat = 60 / track.bpm;
  let step = 0, nextNote = audioCtx.currentTime + 0.5;

  function schedule() {
    if (!musicRunning || currentTrack !== idx) return;
    while (nextNote < audioCtx.currentTime + 2.5) {
      const pi  = track.pattern[step % track.pattern.length];
      const vel = 0.5 + Math.random() * 0.35;
      const dur = beat * (step % 5 === 0 ? 3.2 : step % 3 === 0 ? 2.0 : 1.6);
      const rest = step % 7 === 6;

      if (!rest) {
        const t   = nextNote;
        const osc = audioCtx.createOscillator();
        const osc2= audioCtx.createOscillator();
        const g   = audioCtx.createGain();
        const f   = audioCtx.createBiquadFilter();
        f.type = "lowpass"; f.frequency.value = 1600; f.Q.value = 0.5;

        osc.type  = track.color;
        osc.frequency.setValueAtTime(track.notes[pi], t);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(track.notes[pi]*2, t);
        const g2 = audioCtx.createGain(); g2.gain.value = 0.15;

        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vel*0.26, t+0.06);
        g.gain.exponentialRampToValueAtTime(vel*0.10, t+dur*0.45);
        g.gain.exponentialRampToValueAtTime(0.0001, t+dur);

        osc.connect(f); osc2.connect(g2); g2.connect(f);
        f.connect(g); g.connect(dryG); g.connect(wetG);
        osc.start(t); osc.stop(t+dur+0.1);
        osc2.start(t); osc2.stop(t+dur+0.1);
      }

      nextNote += beat * (step%4===0 ? 2.2 : step%3===0 ? 1.8 : 1.4);
      step++;
    }
    musicScheduler = setTimeout(schedule, 700);
  }
  schedule();
  showTrackName(track.name);
  updateMusicUI(idx);
}

function stopMusic(updateUI = true) {
  musicRunning = false
  if (musicScheduler) { clearTimeout(musicScheduler); musicScheduler = null; }
  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
    masterGain = null;
  }
  if (updateUI) { currentTrack = -1; updateMusicUI(-1); }
}

function updateMusicUI(activeIdx) {
  const soundBtn = document.getElementById("soundBtn");
  soundBtn.textContent = activeIdx >= 0 ? "♬" : "♪";
  soundBtn.style.color = activeIdx >= 0 ? "#e8c060" : "#c49538";
}

let trackNameTimer = null;
function showTrackName(name) {
  const inner = document.getElementById("trackNameInner");
  inner.textContent = name || "";
  inner.classList.remove("visible");
  void inner.offsetWidth; // reflow
  if (name) {
    inner.classList.add("visible");
    if (trackNameTimer) clearTimeout(trackNameTimer);
    trackNameTimer = setTimeout(() => inner.classList.remove("visible"), 3800);
  }
  // Spawn floating note
  spawnMusicNote();
}

function showSilenceLabel() {
  const inner = document.getElementById("trackNameInner");
  inner.textContent = "silêncio";
  inner.classList.remove("visible");
  void inner.offsetWidth;
  inner.classList.add("visible");
  if (trackNameTimer) clearTimeout(trackNameTimer);
  trackNameTimer = setTimeout(() => inner.classList.remove("visible"), 2500);
}

function spawnMusicNote() {
  const btn = document.getElementById("soundBtn");
  const r   = btn.getBoundingClientRect();
  const note = document.createElement("div");
  note.className = "float-note";
  note.textContent = ["♩","♪","♫","♬"][Math.floor(Math.random()*4)];
  note.style.left = r.left + 12 + "px";
  note.style.top  = r.top  - 10 + "px";
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3100);
}

/* Music button — cycles: off → track0 → track1 → track2 → off → … */
const soundBtn = document.getElementById("soundBtn");

soundBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const next = currentTrack + 1; // -1 → 0, 0 → 1, 1 → 2, 2 → 3 (= stop)
  if (next >= TRACKS.length) {
    stopMusic();
    showSilenceLabel();
  } else {
    startTrack(next);
  }
});

/* ═══════════════════════════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════════════════════════ */
const canvas = document.getElementById("particles");
const ctx    = canvas.getContext("2d");
let W, H, particles = [];

function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize(); window.addEventListener("resize", resize);

function mkParticle() {
  return {
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.7+0.3,
    vx: (Math.random()-0.5)*0.18, vy: -(Math.random()*0.24+0.04),
    alpha: Math.random()*0.55+0.1, life: Math.random(),
    decay: Math.random()*0.0014+0.0004, hue: Math.random()*30+22,
    burst: false
  };
}

function mkBurstParticle(ox, oy) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 3.5 + 1.0;
  return {
    x: ox, y: oy,
    r: Math.random()*3.2+1.0,
    vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - 1.5,
    alpha: 0.92, life: Math.random()*0.55+0.5,
    decay: 0.014 + Math.random()*0.008,
    hue: Math.random()*22+36,
    burst: true
  };
}

function burstGoldParticles(el) {
  const r = el.getBoundingClientRect();
  const ox = r.left + r.width/2, oy = r.top + r.height/2;
  for (let i = 0; i < 40; i++) particles.push(mkBurstParticle(ox, oy));
}

for (let i = 0; i < 90; i++) { const p = mkParticle(); p.life = Math.random(); particles.push(p); }

(function anim() {
  ctx.clearRect(0, 0, W, H);
  particles = particles.filter(p => p.life > 0);
  while (particles.filter(p => !p.burst).length < 90) particles.push(mkParticle());

  for (const p of particles) {
    p.life -= p.decay;
    if (p.burst) {
      p.vx *= 0.96; p.vy = p.vy*0.96+0.05;
      p.x += p.vx; p.y += p.vy;
      p.r = Math.max(p.r*0.984, 0.2);
    } else {
      p.x += p.vx + Math.sin(p.life*9)*0.07; p.y += p.vy;
    }
    const a = p.alpha * Math.max(p.life, 0);
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    if (p.burst) {
      ctx.fillStyle   = `hsla(${p.hue}, 92%, 72%, ${a})`;
      ctx.shadowBlur  = 9;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 65%, ${a*0.65})`;
    } else {
      ctx.fillStyle  = `hsla(${p.hue}, 72%, 82%, ${a})`;
      ctx.shadowBlur = 0;
    }
    ctx.fill(); ctx.shadowBlur = 0;
  }
  requestAnimationFrame(anim);
})();
