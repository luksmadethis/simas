'use strict';
/* =========================================================
   GTA 7
   jogo de mundo aberto visto de cima (estilo GTA de PS1)
   ========================================================= */
const T = 64;                 // tamanho do bloquinho (tile) em pixels do mundo
const MW = 248, MH = 240;     // mapa em tiles (cidade em 0..191, Indonésia a leste, Serra ao sul)
const CIDADE = 192;
const GRID = 12;              // ruas a cada 12 tiles
const LAND0 = 6, LAND1 = MW - 7;

// ---------- utilidades ----------
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const fmt$ = n => 'R$ ' + Math.floor(n).toLocaleString('pt-BR');

// ---------- entrada (teclado, mouse, toque) ----------
const KEY = {}, PRESS = {};
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  const k = e.key.toLowerCase();
  if (!KEY[k]) PRESS[k] = true;
  KEY[k] = true;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(k)) e.preventDefault();
});
addEventListener('keyup', e => { KEY[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in KEY) KEY[k] = false; });
const MOUSE = { x: 0, y: 0, down: false, used: false };
const TOQUE = { ativo: false, jx: 0, jy: 0, atira: false, freio: false };
function apertou(...ks) { for (const k of ks) if (PRESS[k]) return true; return false; }
function segura(...ks) { for (const k of ks) if (KEY[k]) return true; return false; }

// ---------- áudio (efeitos + rádio gerados na hora) ----------
const SOM = {
  ctx: null, master: null, sfx: null, radioGain: null, motor: null, motorGain: null, sirene: null, sireneGain: null,
  init() {
    if (this.ctx) return;
    try {
      const C = window.AudioContext || window.webkitAudioContext; this.ctx = new C();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.8; this.master.connect(this.ctx.destination);
      this.sfx = this.ctx.createGain(); this.sfx.gain.value = 0.7; this.sfx.connect(this.master);
      this.radioGain = this.ctx.createGain(); this.radioGain.gain.value = 0; this.radioGain.connect(this.master);
      this.motor = this.ctx.createOscillator(); this.motor.type = 'sawtooth'; this.motor.frequency.value = 40;
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
      this.motorGain = this.ctx.createGain(); this.motorGain.gain.value = 0;
      this.motor.connect(lp); lp.connect(this.motorGain); this.motorGain.connect(this.sfx); this.motor.start();
      this.sirene = this.ctx.createOscillator(); this.sirene.type = 'square'; this.sirene.frequency.value = 700;
      this.sireneGain = this.ctx.createGain(); this.sireneGain.gain.value = 0;
      const lp2 = this.ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 1800;
      this.sirene.connect(lp2); lp2.connect(this.sireneGain); this.sireneGain.connect(this.sfx); this.sirene.start();
      this.ruido = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { this.ctx = null; }
  },
  barulho(dur, vol, freq, tipo = 'lowpass') {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    const s = this.ctx.createBufferSource(); s.buffer = this.ruido;
    const f = this.ctx.createBiquadFilter(); f.type = tipo; f.frequency.value = freq;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfx); s.start(t); s.stop(t + dur + 0.05);
  },
  bip(freq, dur, vol = 0.2, tipo = 'square', fim) {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(freq, t);
    if (fim) o.frequency.exponentialRampToValueAtTime(fim, t + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + dur + 0.02);
  },
  tiro(tipo) {
    if (tipo === 'escopeta') { this.barulho(0.35, 0.9, 900); this.bip(90, 0.2, 0.4, 'sine', 40); }
    else if (tipo === 'foguete') { this.barulho(0.5, 0.5, 600, 'bandpass'); }
    else if (tipo === 'punho') { this.barulho(0.08, 0.4, 400); }
    else { this.barulho(0.15, 0.6, 2200); this.bip(160, 0.08, 0.25, 'square', 60); }
  },
  explosao() { this.barulho(1.2, 1, 300); this.bip(70, 0.8, 0.6, 'sine', 25); },
  batida(f) { this.barulho(0.25, clamp(f, 0.1, 0.9), 500); },
  pega() { this.bip(660, 0.08, 0.15, 'square'); setTimeout(() => this.bip(990, 0.12, 0.15, 'square'), 70); },
  grana() { this.bip(1200, 0.06, 0.12, 'square'); setTimeout(() => this.bip(1600, 0.1, 0.12, 'square'), 60); },
  missao() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.bip(f, 0.18, 0.15, 'triangle'), i * 120)); },
  falha() { [400, 300, 200].forEach((f, i) => setTimeout(() => this.bip(f, 0.25, 0.15, 'sawtooth'), i * 160)); },
  buzina() { this.bip(420, 0.35, 0.15, 'square'); this.bip(520, 0.35, 0.1, 'square'); },
  atualizaMotor(vel, ligado) {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    this.motor.frequency.setTargetAtTime(35 + Math.abs(vel) * 0.18, t, 0.08);
    this.motorGain.gain.setTargetAtTime(ligado ? 0.07 + Math.min(0.08, Math.abs(vel) / 6000) : 0, t, 0.1);
  },
  atualizaSirene(ligada) {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    this.sireneGain.gain.setTargetAtTime(ligada ? 0.035 : 0, t, 0.2);
    if (ligada) this.sirene.frequency.setValueAtTime((t * 2.2 | 0) % 2 ? 640 : 860, t);
  }
};

// ---------- rádio (música gerada) ----------
const RADIOS = [
  { nome: 'Rádio Poli FM', sub: 'só as do Popai 🎤', bpm: 130, estilo: 'funk' },
  { nome: 'Sertanejo do Yori', sub: 'direto de Juazeiro 🤠', bpm: 96, estilo: 'sertanejo' },
  { nome: 'Simas Trap', sub: 'só os grave 🔊', bpm: 140, estilo: 'trap' },
  { nome: 'Rádio Desligada', sub: '', bpm: 0, estilo: 'off' }
];
const RADIO = {
  atual: 0, prox: 0, passo: 0, travadoAte: 0,
  tocar(on) { if (!SOM.ctx) return; const yt = this.atual === 0 && typeof ytAtivo === 'function' && ytAtivo(); SOM.radioGain.gain.setTargetAtTime(on && !yt && RADIOS[this.atual].estilo !== 'off' ? 0.32 : 0, SOM.ctx.currentTime, 0.3); },
  nota(t, freq, dur, tipo, vol, dest) {
    const c = SOM.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = tipo; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || SOM.radioGain); o.start(t); o.stop(t + dur + 0.02);
  },
  bumbo(t, v = 0.9) { const c = SOM.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(SOM.radioGain); o.start(t); o.stop(t + 0.32); },
  caixa(t, v = 0.4) { const c = SOM.ctx, s = c.createBufferSource(); s.buffer = SOM.ruido; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1500; const g = c.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15); s.connect(f); f.connect(g); g.connect(SOM.radioGain); s.start(t, Math.random() * 0.5); s.stop(t + 0.16); },
  chimbal(t, v = 0.12) { const c = SOM.ctx, s = c.createBufferSource(); s.buffer = SOM.ruido; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; const g = c.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05); s.connect(f); f.connect(g); g.connect(SOM.radioGain); s.start(t, Math.random() * 0.5); s.stop(t + 0.06); },
  atualiza() {
    if (!SOM.ctx) return;
    const r = RADIOS[this.atual]; if (r.estilo === 'off') return;
    if (this.atual === 0 && typeof ytAtivo === 'function' && ytAtivo()) return;
    const c = SOM.ctx, passoDur = 60 / r.bpm / 4;
    if (this.prox < c.currentTime) this.prox = c.currentTime + 0.05;
    while (this.prox < c.currentTime + 0.2) {
      const t = this.prox, p = this.passo % 16, comp = Math.floor(this.passo / 16) % 4;
      if (r.estilo === 'funk') {
        // tamborzão
        if ([0, 3, 6, 10, 12].includes(p)) this.bumbo(t, 0.8);
        if ([4, 12].includes(p)) this.caixa(t, 0.35);
        if ([2, 7, 9, 14].includes(p)) this.caixa(t, 0.15);
        if (p % 2 === 0) this.chimbal(t);
        const baixo = [55, 55, 65.4, 49][comp];
        if ([0, 6, 10].includes(p)) this.nota(t, baixo, 0.25, 'sawtooth', 0.12);
        if (p === 8 && comp % 2) this.nota(t, baixo * 4, 0.1, 'square', 0.04);
      } else if (r.estilo === 'sertanejo') {
        if (p % 8 === 0) this.bumbo(t, 0.6);
        if (p % 8 === 4) this.caixa(t, 0.25);
        const acordes = [[196, 247, 294], [262, 330, 392], [294, 370, 440], [196, 247, 294]][comp];
        if ([0, 3, 6, 8, 11, 14].includes(p)) acordes.forEach((f, i) => this.nota(t + i * 0.012, f, 0.35, 'triangle', 0.05));
        if (p % 8 === 0) this.nota(t, acordes[0] / 2, 0.4, 'triangle', 0.12);
        if (p === 10 && comp === 1) this.nota(t, acordes[2] * 2, 0.4, 'sine', 0.05);
      } else if (r.estilo === 'trap') {
        if (p === 0 || (p === 10 && comp % 2)) this.nota(t, comp === 2 ? 41 : 49, 0.9, 'sine', 0.5);
        if (p === 8) this.caixa(t, 0.45);
        this.chimbal(t, p % 4 === 2 ? 0.08 : 0.05);
        if (comp === 3 && p > 11) this.chimbal(t + passoDur / 2, 0.05);
        if (p % 4 === 0) this.nota(t, [523, 494, 440, 392][comp], 0.2, 'triangle', 0.03);
      }
      this.prox += passoDur; this.passo++;
    }
  }
};
