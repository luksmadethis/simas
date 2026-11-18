// =========================================================
// DESENHO: chão em pedaços (cache), prédios em falso 3D, gente, carros
// =========================================================
let cv, ctx, VW = 960, VH = 540, DPR = 1;
const ROSTOS = {};   // imagens da galera (carregadas do base64 embutido)
function carregarRostos() {
  if (typeof FOTOS === 'undefined') return;
  for (const k in FOTOS) { const im = new Image(); im.src = FOTOS[k]; ROSTOS[k] = im; }
}

// ---------- chão em pedaços de 8x8 tiles ----------
const CH = 8, chunks = new Map();
function corTile(t, x, y) {
  const h = ((x * 73856093) ^ (y * 19349663)) & 7;
  const reg = regiaoTile[clamp(y, 0, MH - 1) * MW + clamp(x, 0, MW - 1)];
  switch (t) {
    case TL.AGUA: return ['#1d4f8f', '#1e5294', '#1c4c8a', '#1f5596'][h & 3];
    case TL.AREIA: return ['#e6cf8c', '#e9d394', '#e3cb88'][h % 3];
    case TL.GRAMA: return reg === REG.JUAZEIRO ? '#8a8a3a' : ['#3a7a3a', '#3d7f3c', '#377536', '#3f823f'][h & 3];
    case TL.RUA: return reg === REG.JUAZEIRO ? ['#9b7448', '#a07a4c', '#966f44'][h % 3] : ['#46464e', '#48484f', '#444449'][h % 3];
    case TL.CALCADA: return reg === REG.BH ? ['#a8977f', '#a3927b'][h & 1] : ['#8d8a94', '#918e98'][h & 1];
    case TL.PREDIO: return '#333';
    case TL.PRACA: return ['#a39a8a', '#a8a08f'][h & 1];
    case TL.ROCA: return ['#7c8a32', '#83913a', '#768530'][h % 3];
    case TL.TERRA: return ['#a27d4b', '#9b774a', '#a8824f'][h % 3];
    case TL.PISTA: return '#3d3d45';
    case TL.CAIS: return ['#7a7a7a', '#808080'][h & 1];
    case TL.ESTAC: return '#56565e';
    case TL.BECO: return ['#4d4a55', '#514e59'][h & 1];
    case TL.ESTRADA: return ['#4a4a51', '#4c4c53'][h & 1];
  }
  return '#f0f';
}
function desenharChunk(cx, cy) {
  const c = document.createElement('canvas'); c.width = c.height = CH * T;
  const g = c.getContext('2d');
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
    const x = cx * CH + tx, y = cy * CH + ty, t = tile(x, y), px = tx * T, py = ty * T;
    const reg = regiaoTile[clamp(y, 0, MH - 1) * MW + clamp(x, 0, MW - 1)];
    const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    if (t === TL.RUA && ehPonte(x, y)) {
      g.fillStyle = '#1d4f8f'; g.fillRect(px, py, T, T);
      g.fillStyle = '#5a5a63'; g.fillRect(px, py, T, T);
      const vert = x % GRID < 2;
      g.fillStyle = '#9aa0a6';
      if (!vert) { if (!ehRua(x, y - 1)) g.fillRect(px, py, T, 7); if (!ehRua(x, y + 1)) g.fillRect(px, py + T - 7, T, 7); }
      else { if (!ehRua(x - 1, y)) g.fillRect(px, py, 7, T); if (!ehRua(x + 1, y)) g.fillRect(px + T - 7, py, 7, T); }
      g.fillStyle = '#e8c547'; if (!vert && y % GRID === 0 && x % 2 === 0) g.fillRect(px + 8, py + T - 2, 30, 4);
      if (vert && x % GRID === 0 && y % 2 === 0) g.fillRect(px + T - 2, py + 8, 4, 30);
      continue;
    }
    g.fillStyle = corTile(t, x, y); g.fillRect(px, py, T, T);
    if (t === TL.AGUA) {
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.beginPath(); const o = ((x + y) % 3) * 12; g.moveTo(px + 8 + o, py + 20); g.quadraticCurveTo(px + 18 + o, py + 14, px + 28 + o, py + 20); g.stroke();
      // espuma na beira
      g.fillStyle = 'rgba(255,255,255,.35)';
      if (tile(x, y - 1) !== TL.AGUA) g.fillRect(px, py, T, 4); if (tile(x, y + 1) !== TL.AGUA) g.fillRect(px, py + T - 4, T, 4);
      if (tile(x - 1, y) !== TL.AGUA) g.fillRect(px, py, 4, T); if (tile(x + 1, y) !== TL.AGUA) g.fillRect(px + T - 4, py, 4, T);
    }
    if (t === TL.GRAMA && (h % 7 === 0)) { g.fillStyle = 'rgba(0,0,0,.1)'; for (let k = 0; k < 4; k++) g.fillRect(px + 10 + k * 12, py + 20 + (k % 2) * 16, 3, 6); }
    if (t === TL.GRAMA && (h % 23 === 0)) { g.fillStyle = ['#f1c40f', '#e84393', '#fff'][h % 3]; g.fillRect(px + 20, py + 30, 4, 4); g.fillRect(px + 40, py + 14, 4, 4); }
    if (t === TL.AREIA && h % 5 === 0) { g.fillStyle = 'rgba(0,0,0,.06)'; g.beginPath(); g.arc(px + 20, py + 30, 6, 0, 7); g.fill(); }
    if (t === TL.CALCADA || t === TL.PRACA || t === TL.CAIS) { g.strokeStyle = 'rgba(0,0,0,.13)'; g.lineWidth = 1; g.strokeRect(px + 0.5, py + 0.5, T - 1, T - 1); if (t !== TL.CAIS) { g.beginPath(); g.moveTo(px + T / 2, py); g.lineTo(px + T / 2, py + T); g.stroke(); } }
    if (t === TL.CALCADA) { // meio-fio
      g.fillStyle = '#b7b4bd';
      if (ehRua(x, y - 1)) g.fillRect(px, py, T, 4); if (ehRua(x, y + 1)) g.fillRect(px, py + T - 4, T, 4);
      if (ehRua(x - 1, y)) g.fillRect(px, py, 4, T); if (ehRua(x + 1, y)) g.fillRect(px + T - 4, py, 4, T);
      if (h % 31 === 0 && reg === REG.CENTRO) { g.fillStyle = '#2c3e50'; g.fillRect(px + 26, py + 26, 12, 12); g.fillStyle = '#f1c40f'; g.fillRect(px + 29, py + 29, 6, 6); }
    }
    if (t === TL.CAIS && h % 9 === 0) { g.fillStyle = '#555'; g.beginPath(); g.arc(px + 32, py + 32, 6, 0, 7); g.fill(); }
    if (t === TL.ESTAC) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(px, py, 3, T); g.fillRect(px + T - 3, py, 3, T); if (h % 6 === 0) { g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(px + 30, py + 34, 12, 6, 0, 0, 7); g.fill(); } }
    if (t === TL.BECO) { if (h % 4 === 0) { g.fillStyle = 'rgba(30,60,90,.35)'; g.beginPath(); g.ellipse(px + 24, py + 30, 14, 8, 0, 0, 7); g.fill(); } if (h % 11 === 0) { g.fillStyle = '#2d6a4f'; g.fillRect(px + 8, py + 8, 18, 22); g.fillStyle = '#1b4332'; g.fillRect(px + 8, py + 8, 18, 5); } }
    if (t === TL.ESTRADA) {
      if (ehPonte(x, y)) { g.fillStyle = '#1d4f8f'; g.fillRect(px, py, T, T); g.fillStyle = '#5a5a63'; g.fillRect(px + 4, py + 4, T - 8, T - 8); }
      g.fillStyle = 'rgba(255,255,255,.55)';
      if (!ehPista(x, y - 1)) g.fillRect(px, py + 3, T, 3); if (!ehPista(x, y + 1)) g.fillRect(px, py + T - 6, T, 3);
      if (!ehPista(x - 1, y)) g.fillRect(px + 3, py, 3, T); if (!ehPista(x + 1, y)) g.fillRect(px + T - 6, py, 3, T);
      if (h % 3 === 0) { g.fillStyle = 'rgba(232,197,71,.6)'; g.fillRect(px + 28, py + 28, 8, 8); }
    }
    if (t === TL.PISTA) { g.strokeStyle = 'rgba(0,255,200,.25)'; g.lineWidth = 2; g.strokeRect(px + 2, py + 2, T - 4, T - 4); }
    if (t === TL.ROCA) { g.fillStyle = '#5d6b20'; for (let k = 0; k < 3; k++) g.fillRect(px + 4, py + 8 + k * 20, T - 8, 5); g.fillStyle = '#9acd32'; for (let k = 0; k < 3; k++) for (let m = 0; m < 4; m++) g.fillRect(px + 8 + m * 14, py + 6 + k * 20, 4, 4); }
    if (t === TL.RUA) {
      const vert = x % GRID < 2, hor = y % GRID < 2;
      if (reg === REG.JUAZEIRO) { g.fillStyle = 'rgba(0,0,0,.1)'; if (vert && !hor) { g.fillRect(px + 14, py, 8, T); g.fillRect(px + 42, py, 8, T); } else if (hor && !vert) { g.fillRect(px, py + 14, T, 8); g.fillRect(px, py + 42, T, 8); } continue; }
      if (h % 9 === 0) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(px + (h % 30), py + 20, 16, 9); }
      if (h % 41 === 0) { g.fillStyle = '#333'; g.beginPath(); g.arc(px + 32, py + 32, 9, 0, 7); g.fill(); g.strokeStyle = '#555'; g.lineWidth = 2; g.stroke(); }
      const cruz = vert && hor;
      if (vert && !hor && x % GRID === 0) { g.fillStyle = '#e8c547'; if (y % 2 === 0) g.fillRect(px + T - 3, py + 8, 6, 34); }
      if (hor && !vert && y % GRID === 0) { g.fillStyle = '#e8c547'; if (x % 2 === 0) g.fillRect(px + 8, py + T - 3, 34, 6); }
      // borda branca da pista
      g.fillStyle = 'rgba(255,255,255,.5)';
      if (vert && !hor) { if (!ehRua(x - 1, y)) g.fillRect(px + 4, py, 3, T); if (!ehRua(x + 1, y)) g.fillRect(px + T - 7, py, 3, T); }
      if (hor && !vert) { if (!ehRua(x, y - 1)) g.fillRect(px, py + 4, T, 3); if (!ehRua(x, y + 1)) g.fillRect(px, py + T - 7, T, 3); }
      // faixa de pedestre na boca do cruzamento
      if (!cruz) {
        g.fillStyle = 'rgba(255,255,255,.75)';
        if (vert && (ehRua(x, y - 1) && (y - 1) % GRID < 2 && ((y - 1) % GRID) === 1 ? true : false)) for (let k = 0; k < 5; k++) g.fillRect(px + 4 + k * 12, py + 4, 7, 18);
        if (vert && (y + 1) % GRID === 0 && ehRua(x, y + 1)) for (let k = 0; k < 5; k++) g.fillRect(px + 4 + k * 12, py + T - 22, 7, 18);
        if (hor && (x - 1) % GRID === 1 && ehRua(x - 1, y)) for (let k = 0; k < 5; k++) g.fillRect(px + 4, py + 4 + k * 12, 18, 7);
        if (hor && (x + 1) % GRID === 0 && ehRua(x + 1, y)) for (let k = 0; k < 5; k++) g.fillRect(px + T - 22, py + 4 + k * 12, 18, 7);
      }
    }
    // sombra no pé dos prédios
    if (t !== TL.PREDIO && tile(x, y - 1) === TL.PREDIO) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(px, py, T, 10); }
    if (t !== TL.PREDIO && tile(x - 1, y) === TL.PREDIO) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(px, py, 8, T); }
  }
  return c;
}
function pegaChunk(cx, cy) {
  const k = cx + ',' + cy; let c = chunks.get(k);
  if (!c) { c = desenharChunk(cx, cy); chunks.set(k, c); if (chunks.size > 70) chunks.delete(chunks.keys().next().value); }
  else { chunks.delete(k); chunks.set(k, c); }
  return c;
}

// ---------- gente (de pé, visão inclinada 3/4) ----------
const INCL = 0.78;              // o chão é "achatado" nessa proporção: dá a sensação de câmera inclinada
const ALT_TIRO = 22;            // altura do peito (px na tela), pra mira e pras balas
// cada personagem da galera tem cor de pele e cabelo próprios (quando a gente desenha sem foto)
const VISUAL = {
  nerivan: { pele: '#a8693c', cabelo: '#1b1b1b', corte: 'curto' }, luketa: { pele: '#c68642', cabelo: '#2b1a10', corte: 'topete' }, dudu: { pele: '#e0ac69', cabelo: '#3b2412', corte: 'curto' },
  cas: { pele: '#8d5524', cabelo: '#111', corte: 'black' }, alan: { pele: '#5c3a21', cabelo: '#111', corte: 'longo' }, yori: { pele: '#c68642', cabelo: '#111', corte: 'curto', oculos: 'nerd' },
  nauj: { pele: '#c68642', cabelo: '#2b1a10', corte: 'curto' }, meco: { pele: '#e0ac69', cabelo: '#3b2412', corte: 'curto' }, gelado: { pele: '#c68642', cabelo: '#1b1b1b', corte: 'curto' },
  matt: { pele: '#c68642', cabelo: '#1b1b1b', corte: 'careca' }, ltzin: { pele: '#8d5524', cabelo: '#111', corte: 'black' }, poli: { pele: '#5c3a21', cabelo: '#111', corte: 'careca' }
};
function desenharPessoa(g, p, opt = {}) {
  // no mundo: desfaz o achatamento pra pessoa ficar "em pé"
  g.save(); g.translate(p.x, p.y); g.scale(1, 1 / INCL);
  boneco(g, p, 0, 0, opt);
  g.restore();
}
function boneco(g, p, x, y, opt = {}) {
  const s = (opt.escala || 1) * 1.05, a = p.a || 0, t = W.tempo;
  const eJog = p === W.jog || opt.jog;
  g.save(); g.translate(x, y);
  if (p.galinha) { galinha(g, p, s); g.restore(); return; }
  if (p.morto) {
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0, 22 * s, 7 * s, 0, 0, 7); g.fill();
    g.fillStyle = p.calca || '#2c3e50'; g.fillRect(-22 * s, -6 * s, 14 * s, 8 * s);
    g.fillStyle = p.camisa; g.fillRect(-9 * s, -8 * s, 16 * s, 11 * s); g.fillStyle = p.pele || '#c68642'; g.beginPath(); g.arc(12 * s, -3 * s, 6 * s, 0, 7); g.fill();
    g.restore(); return;
  }
  // de que lado ele tá olhando
  const cx = Math.cos(a), cy = Math.sin(a);
  const vista = cy < -0.55 ? 'costas' : cy > 0.55 ? 'frente' : 'lado', esq = cx < 0;
  const passo = (p.skate || p.rodaAtiva) ? 0 : Math.sin(p.anda || 0);
  const nada = p.nadando;
  // anel do jogador + sombra
  if (opt.anel) { const pu = 1 + Math.sin(t * 5) * 0.08; g.strokeStyle = 'rgba(255,210,63,.9)'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 20 * s * pu, 9 * s * pu, 0, 0, 7); g.stroke(); }
  if (!opt.sentado) { g.fillStyle = 'rgba(0,0,0,.32)'; g.beginPath(); g.ellipse(0, 0, 13 * s, 5 * s, 0, 0, 7); g.fill(); }
  if (esq && vista === 'lado') g.scale(-1, 1);
  if (opt.sentado) g.translate(0, 15 * s);
  const pele = p.pele || '#c68642';
  const H = -1;  // pra cima
  // ---- coisas nas costas (desenha antes do corpo quando ele tá de frente/lado) ----
  const costas = () => {
    if (p.costas === 'capa') { g.fillStyle = p.costasCor || '#c0392b'; g.beginPath(); g.moveTo(-8 * s, -32 * s); g.lineTo(8 * s, -32 * s); g.lineTo(11 * s + Math.sin(t * 6) * 2, -6 * s); g.lineTo(-11 * s + Math.sin(t * 6 + 1) * 2, -6 * s); g.closePath(); g.fill(); }
    if (p.costas === 'asas') { g.fillStyle = 'rgba(255,255,255,.95)'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 14 * s, -30 * s, 12 * s, 6 * s, sd * (0.5 + Math.sin(t * 8) * 0.2), 0, 7); g.fill(); } }
    if (p.costas === 'jetpack') { g.fillStyle = '#95a5a6'; g.fillRect(-9 * s, -32 * s, 6 * s, 14 * s); g.fillRect(3 * s, -32 * s, 6 * s, 14 * s); g.fillStyle = '#ff8c00'; g.beginPath(); g.arc(-6 * s, -15 * s + Math.random() * 2, 3 * s, 0, 7); g.arc(6 * s, -15 * s + Math.random() * 2, 3 * s, 0, 7); g.fill(); }
    if (p.costas === 'rabo') { g.fillStyle = p.costasCor || '#27ae60'; g.beginPath(); g.moveTo(-4 * s, -16 * s); g.quadraticCurveTo(-22 * s, -14 * s + Math.sin(t * 5) * 4, -26 * s, -4 * s); g.lineTo(-20 * s, -8 * s); g.lineTo(0, -12 * s); g.fill(); }
    if (p.mochila) { g.fillStyle = p.mochila; rr(g, -8 * s, -31 * s, 16 * s, 15 * s, 3 * s); g.fill(); }
  };
  if (vista !== 'costas') costas();
  if (opt.sentado) {
    // sentado: coxa pra frente, canela pra baixo
    g.fillStyle = p.calca || '#2c3e50';
    if (vista === 'lado') { g.fillRect(-2 * s, -19 * s, 12 * s, 6 * s); g.fillRect(6 * s, -15 * s, 5 * s, 9 * s); g.fillStyle = p.tenisCor || '#111'; g.fillRect(6 * s, -7 * s, 8 * s, 3 * s); }
    else for (const sd of [-1, 1]) { g.fillRect(sd * 7 * s - 3 * s, -19 * s, 6 * s, 8 * s); g.fillStyle = p.tenisCor || '#111'; g.fillRect(sd * 7 * s - 3.5 * s, -12 * s, 7 * s, 3 * s); g.fillStyle = p.calca || '#2c3e50'; }
  } else if (nada) {
    g.fillStyle = 'rgba(29,79,143,.75)'; g.beginPath(); g.ellipse(0, -2 * s, 18 * s, 7 * s, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -2 * s, 16 * s + Math.sin(t * 6) * 2, 6 * s, 0, 0, 7); g.stroke();
  } else {
    // ---- rodas ----
    if (p.skate || p.rodaAtiva === 'skate') { g.fillStyle = '#2d3436'; rr(g, -14 * s, -3 * s, 28 * s, 5 * s, 2 * s); g.fill(); g.fillStyle = '#ff6ec7'; g.fillRect(-12 * s, -3 * s, 24 * s, 1.5 * s); g.fillStyle = '#f1c40f'; g.beginPath(); g.arc(-9 * s, 3 * s, 2.2 * s, 0, 7); g.arc(9 * s, 3 * s, 2.2 * s, 0, 7); g.fill(); }
    // ---- pernas ----
    const perna = (px, dy) => { g.fillStyle = p.calca || '#2c3e50'; g.fillRect(px - 3 * s, -17 * s, 6 * s, 15 * s + dy); g.fillStyle = p.tenisCor || '#111'; g.fillRect(px - 3.5 * s, -3 * s + dy, vista === 'lado' ? 9 * s : 7 * s, 3.5 * s); if (p.rodaAtiva === 'patins') { g.fillStyle = '#e84393'; g.fillRect(px - 3.5 * s, 0.5 * s + dy, 9 * s, 1.5 * s); g.fillStyle = '#f1c40f'; g.fillRect(px - 2 * s, 2 * s + dy, 2 * s, 2 * s); g.fillRect(px + 3 * s, 2 * s + dy, 2 * s, 2 * s); } };
    if (vista === 'lado') { g.save(); g.translate(0, -17 * s); g.rotate(passo * 0.45); g.translate(0, 17 * s); perna(0, 0); g.restore(); g.save(); g.translate(0, -17 * s); g.rotate(-passo * 0.45); g.translate(0, 17 * s); perna(0, 0); g.restore(); }
    else { perna(-4 * s, passo > 0 ? -passo * 2 * s : 0); perna(4 * s, passo < 0 ? passo * 2 * s : 0); }
  }
  // ---- tronco ----
  const ty = -32 * s, th = 16 * s, tw = vista === 'lado' ? 11 * s : 16 * s;
  if (p.fantasia === 'banana') { g.fillStyle = '#f4d03f'; g.beginPath(); g.ellipse(0, -24 * s, tw / 2 + 3 * s, 15 * s, 0, 0, 7); g.fill(); g.fillStyle = '#7d6608'; g.fillRect(-1.5 * s, -40 * s, 3 * s, 4 * s); }
  else if (p.fantasia === 'dino') { g.fillStyle = '#27ae60'; rr(g, -tw / 2 - 2 * s, ty - 2 * s, tw + 4 * s, th + 6 * s, 6 * s); g.fill(); g.fillStyle = '#f1c40f'; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-3 * s, ty + k * 5 * s); g.lineTo(-7 * s, ty + 2 * s + k * 5 * s); g.lineTo(-3 * s, ty + 4 * s + k * 5 * s); g.fill(); } }
  else {
    g.fillStyle = p.camisa || '#888'; rr(g, -tw / 2, ty, tw, th, 4 * s); g.fill();
    if (p.estampa) {
      g.save(); rr(g, -tw / 2, ty, tw, th, 4 * s); g.clip();
      if (p.estampa === 'listrada') { g.fillStyle = 'rgba(255,255,255,.8)'; for (let k = 0; k < 16; k += 4) g.fillRect(-tw / 2, ty + k * s, tw, 1.6 * s); }
      else if (p.estampa === 'simas') ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'].forEach((c, k) => { g.fillStyle = c; g.fillRect(-tw / 2, ty + k * th / 6, tw, th / 6 + 0.5); });
      else if (p.estampa === 'xadrez') { g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 16; k += 4) { g.fillRect(-tw / 2, ty + k * s, tw, 2 * s); g.fillRect(-tw / 2 + k * s, ty, 2 * s, th); } }
      else if (p.estampa === 'camuflada') { const cs = ['#4a5d23', '#6b4f2a', '#2d3a1a']; for (let k = 0; k < 8; k++) { g.fillStyle = cs[k % 3]; g.beginPath(); g.arc((-6 + (k * 37) % 12) * s, ty + ((k * 53) % 16) * s, 3 * s, 0, 7); g.fill(); } }
      else if (p.estampa === 'flamengo') { for (let k = 0; k < 16; k += 4) { g.fillStyle = (k / 4) % 2 ? '#111' : '#c0392b'; g.fillRect(-tw / 2, ty + k * s, tw, 4 * s); } }
      else if (p.estampa === 'smile') { g.fillStyle = '#ffe600'; g.beginPath(); g.arc(0, ty + th / 2, 5 * s, 0, 7); g.fill(); g.fillStyle = '#111'; g.fillRect(-2.2 * s, ty + th / 2 - 2 * s, 1.2 * s, 1.6 * s); g.fillRect(1 * s, ty + th / 2 - 2 * s, 1.2 * s, 1.6 * s); g.strokeStyle = '#111'; g.lineWidth = 0.8 * s; g.beginPath(); g.arc(0, ty + th / 2, 3 * s, 0.3, Math.PI - 0.3); g.stroke(); }
      else if (p.estampa === 'caveira') { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, ty + th / 2 - 1 * s, 4.5 * s, 0, 7); g.fill(); g.fillRect(-2.5 * s, ty + th / 2 + 2 * s, 5 * s, 3 * s); g.fillStyle = '#111'; g.beginPath(); g.arc(-1.8 * s, ty + th / 2 - 1 * s, 1.3 * s, 0, 7); g.arc(1.8 * s, ty + th / 2 - 1 * s, 1.3 * s, 0, 7); g.fill(); }
      else if (p.estampa === 'coracao') { g.fillStyle = '#ff2f6d'; g.beginPath(); g.arc(-2 * s, ty + th / 2 - 1.5 * s, 2.6 * s, 0, 7); g.arc(2 * s, ty + th / 2 - 1.5 * s, 2.6 * s, 0, 7); g.fill(); g.beginPath(); g.moveTo(-4.5 * s, ty + th / 2 - 0.8 * s); g.lineTo(0, ty + th / 2 + 4.5 * s); g.lineTo(4.5 * s, ty + th / 2 - 0.8 * s); g.fill(); }
      else if (p.estampa === 'galado') { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, ty + th / 2 + 1 * s, 5 * s, 4 * s, 0, 0, 7); g.fill(); g.beginPath(); g.arc(3 * s, ty + th / 2 - 3 * s, 2.5 * s, 0, 7); g.fill(); g.fillStyle = '#e74c3c'; g.fillRect(2.4 * s, ty + th / 2 - 6.5 * s, 1.6 * s, 2 * s); g.fillStyle = '#f39c12'; g.fillRect(5 * s, ty + th / 2 - 3 * s, 2 * s, 1.2 * s); }
      else if (p.estampa === 'raio') { g.fillStyle = '#ffe600'; g.beginPath(); g.moveTo(1.5 * s, ty + 1 * s); g.lineTo(-3 * s, ty + th / 2 + 1 * s); g.lineTo(0, ty + th / 2 + 1 * s); g.lineTo(-1.5 * s, ty + th - 1 * s); g.lineTo(3.5 * s, ty + th / 2 - 1 * s); g.lineTo(0.5 * s, ty + th / 2 - 1 * s); g.closePath(); g.fill(); }
      else if (p.estampa === 'n171') { g.fillStyle = '#fff'; g.font = `900 ${7 * s}px system-ui`; g.textAlign = 'center'; g.fillText('171', 0, ty + th / 2 + 2.5 * s); }
      else if (p.estampa === 'banana') { g.fillStyle = '#f4d03f'; for (let k = 0; k < 6; k++) { g.save(); g.translate((-5 + (k * 23) % 10) * s, ty + 3 * s + ((k * 31) % 11) * s); g.rotate(k); g.beginPath(); g.ellipse(0, 0, 2.6 * s, 1 * s, 0, 0, 7); g.fill(); g.restore(); } }
      else if (p.estampa === 'smoking') { g.fillStyle = '#111'; g.fillRect(-tw / 2, ty, tw * 0.36, th); g.fillRect(tw / 2 - tw * 0.36, ty, tw * 0.36, th); g.fillStyle = '#fff'; g.fillRect(-tw * 0.14, ty, tw * 0.28, th); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(-3 * s, ty + 1 * s); g.lineTo(0, ty + 2.5 * s); g.lineTo(-3 * s, ty + 4 * s); g.moveTo(3 * s, ty + 1 * s); g.lineTo(0, ty + 2.5 * s); g.lineTo(3 * s, ty + 4 * s); g.fill(); }
      else if (p.estampa === 'havaiana') { const cs = ['#f1c40f', '#e84393', '#2ecc71']; for (let k = 0; k < 7; k++) { g.fillStyle = cs[k % 3]; g.beginPath(); g.arc((-6 + (k * 29) % 12) * s, ty + 2 * s + ((k * 41) % 13) * s, 2.2 * s, 0, 7); g.fill(); } }
      g.restore();
    }
    if (p.jaqueta) { g.fillStyle = p.jaqueta; if (vista === 'frente') { g.fillRect(-tw / 2, ty, tw * 0.32, th); g.fillRect(tw / 2 - tw * 0.32, ty, tw * 0.32, th); } else rr(g, -tw / 2, ty, tw, th, 4 * s), g.fill(); }
    if (p.policia) { g.fillStyle = '#1b2a6b'; rr(g, -tw / 2, ty, tw, th, 4 * s); g.fill(); g.fillStyle = '#ffd700'; g.fillRect(2 * s, ty + 4 * s, 3 * s, 3 * s); }
    if (p.corrente && vista !== 'costas') { g.strokeStyle = '#f1c40f'; g.lineWidth = 1.6 * s; g.beginPath(); g.arc(0, ty + 1 * s, 5 * s, 0.3, Math.PI - 0.3); g.stroke(); g.fillStyle = '#f1c40f'; g.beginPath(); g.arc(0, ty + 7 * s, 1.8 * s, 0, 7); g.fill(); }
  }
  if (p.cintura === 'boia') { g.fillStyle = '#f1c40f'; g.beginPath(); g.ellipse(0, -16 * s, 13 * s, 5 * s, 0, 0, 7); g.fill(); g.fillStyle = '#e67e22'; g.beginPath(); g.arc(vista === 'lado' ? 10 * s : 9 * s, -21 * s, 3.5 * s, 0, 7); g.fill(); g.fillStyle = '#f1c40f'; g.beginPath(); g.arc(vista === 'lado' ? 10 * s : 9 * s, -25 * s, 3.5 * s, 0, 7); g.fill(); }
  // ---- braços e arma ----
  const armado = opt.arma && opt.arma !== 'punho' && !nada;
  const manga = p.jaqueta || (p.fantasia ? (p.fantasia === 'banana' ? '#f4d03f' : '#27ae60') : p.camisa) || '#888';
  if (vista === 'lado') {
    g.fillStyle = manga; g.save(); g.translate(0, ty + 2 * s); g.rotate(armado ? -1.5 : -passo * 0.5); g.fillRect(-2 * s, 0, 4.5 * s, 12 * s); g.fillStyle = pele; g.fillRect(-2 * s, 11 * s, 4.5 * s, 3 * s);
    if (armado) armaNaMao(g, opt.arma, 1 * s, 13 * s, s);
    g.restore();
  } else {
    for (const sd of [-1, 1]) { g.fillStyle = manga; g.save(); g.translate(sd * (tw / 2 + 1 * s), ty + 2 * s); g.rotate(armado && sd === 1 ? (vista === 'frente' ? -0.3 : 0.3) : sd * passo * 0.2); g.fillRect(-2 * s, 0, 4 * s, 12 * s); g.fillStyle = pele; g.fillRect(-2 * s, 11 * s, 4 * s, 3 * s); if (armado && sd === 1) { g.rotate(Math.PI / 2 * (vista === 'frente' ? 1 : -1)); armaNaMao(g, opt.arma, 13 * s, 0, s); } g.restore(); }
  }
  // ---- cabeça ----
  const hy = -40 * s, r = 8 * s;
  const im = !eJog && p.rosto && ROSTOS[p.rosto];
  if (p.mascara === 'cavalo') {
    g.fillStyle = '#8e5a2b'; g.beginPath(); g.ellipse(vista === 'lado' ? 4 * s : 0, hy - 2 * s, vista === 'lado' ? 12 * s : 9 * s, 11 * s, vista === 'lado' ? 0.4 : 0, 0, 7); g.fill();
    g.fillStyle = '#3b2412'; g.fillRect(-5 * s, hy - 14 * s, 10 * s, 6 * s); if (vista !== 'costas') { g.fillStyle = '#111'; g.fillRect(2 * s, hy - 4 * s, 2 * s, 2 * s); }
  } else {
    if (im && im.complete && im.naturalWidth && vista !== 'costas') {
      g.save(); g.beginPath(); g.arc(0, hy, r * 1.1, 0, 7); g.clip(); g.drawImage(im, -r * 1.1, hy - r * 1.15, r * 2.2, r * 2.3); g.restore();
      g.strokeStyle = p.corNome || 'rgba(0,0,0,.5)'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, hy, r * 1.1, 0, 7); g.stroke();
    } else {
      g.fillStyle = pele; g.beginPath(); g.arc(0, hy, r, 0, 7); g.fill();
      cabelo(g, p, vista, hy, r, s);
      if (vista !== 'costas') {
        const ox = vista === 'lado' ? 4 * s : 0;
        g.fillStyle = '#1b1b1b'; if (vista === 'frente') { g.fillRect(-3.5 * s, hy - 1 * s, 2 * s, 2.2 * s); g.fillRect(1.5 * s, hy - 1 * s, 2 * s, 2.2 * s); } else g.fillRect(ox, hy - 1 * s, 2 * s, 2.2 * s);
        g.fillStyle = 'rgba(120,40,30,.8)'; g.fillRect(vista === 'frente' ? -2 * s : ox - 1 * s, hy + 3.5 * s, 4 * s, 1.2 * s);
        if (p.barba) { g.fillStyle = p.cabelo || '#111'; g.beginPath(); g.arc(ox * 0.5, hy + 3 * s, 6 * s, 0.2, Math.PI - 0.2); g.fill(); }
        if (p.mascara === 'palhaco') { g.fillStyle = '#e74c3c'; g.beginPath(); g.arc(ox + (vista === 'lado' ? 4 * s : 0), hy + 1 * s, 2.6 * s, 0, 7); g.fill(); }
      }
    }
    oculos(g, p, vista, hy, r, s);
    chapeu(g, p, vista, hy, r, s, t);
  }
  if (vista === 'costas') costas();
  g.restore();
  // nome (fica de pé e perto)
  if (p.nome && opt.nomes !== false && (!W.jog || dist(p.x, p.y, W.jog.x, W.jog.y) < 520) && x === 0 && y === 0 && !opt.semNome) {
    const ty2 = -54 * s;
    g.font = 'bold 10px system-ui, sans-serif'; g.textAlign = 'center';
    const w = g.measureText(p.nome).width + 8;
    g.fillStyle = 'rgba(0,0,0,.6)'; rr(g, -w / 2, ty2 - 10, w, 13, 4); g.fill();
    g.fillStyle = p.corNome || '#ffd23f'; g.fillText(p.nome, 0, ty2);
  }
}
function cabelo(g, p, vista, hy, r, s) {
  const corte = p.corte || 'curto', cor = p.cabelo || '#111';
  if (p.policia || corte === 'careca') { if (p.policia) { g.fillStyle = '#1b2a6b'; g.beginPath(); g.arc(0, hy - 2 * s, r * 1.02, Math.PI, 0); g.fill(); g.fillRect(vista === 'lado' ? 0 : -r, hy - 3 * s, vista === 'lado' ? r * 1.6 : r * 2, 2.5 * s); } return; }
  g.fillStyle = cor;
  if (corte === 'black') { g.beginPath(); g.arc(0, hy - 3 * s, r * 1.45, Math.PI * 0.95, Math.PI * 2.05); g.fill(); if (vista === 'costas') { g.beginPath(); g.arc(0, hy, r * 1.4, 0, 7); g.fill(); } return; }
  if (corte === 'moicano') { g.fillRect(-2 * s, hy - r - 6 * s, 4 * s, r + 6 * s); return; }
  if (corte === 'trancas') { g.beginPath(); g.arc(0, hy - 1 * s, r * 1.05, Math.PI, 0); g.fill(); for (const sd of [-1, 1]) g.fillRect(sd * r * 0.9 - 1.5 * s, hy - 1 * s, 3 * s, 12 * s); return; }
  if (corte === 'longo') { g.beginPath(); g.arc(0, hy - 1 * s, r * 1.08, Math.PI, 0); g.fill(); g.fillRect(-r * 1.08, hy - 1 * s, r * 2.16, (vista === 'costas' ? 13 : vista === 'frente' ? 3 : 10) * s); if (vista === 'frente') { g.fillRect(-r * 1.08, hy, 3 * s, 11 * s); g.fillRect(r * 1.08 - 3 * s, hy, 3 * s, 11 * s); } return; }
  if (corte === 'topete') { g.beginPath(); g.arc(0, hy - 2 * s, r * 1.02, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(2 * s, hy - r - 1 * s, 6 * s, 4 * s, -0.3, 0, 7); g.fill(); return; }
  if (corte === 'colorido') { g.fillStyle = `hsl(${(W.tempo * 90) % 360},90%,55%)`; }
  g.beginPath(); g.arc(0, hy - 1.5 * s, r * 1.03, Math.PI, 0); g.fill();
  if (vista === 'costas') { g.beginPath(); g.arc(0, hy, r, 0, 7); g.fill(); }
  else if (vista === 'lado') g.fillRect(-r, hy - 2 * s, 5 * s, 6 * s);
}
function oculos(g, p, vista, hy, r, s) {
  if (!p.oculos || vista === 'costas') return;
  const tipo = p.oculosTipo || 'juliet';
  const cor = tipo === 'coracao' ? '#ff3d8b' : tipo === 'estrela' ? '#f1c40f' : tipo === 'nerd' ? 'rgba(200,230,255,.5)' : 'rgba(10,10,10,.95)';
  g.fillStyle = cor; g.strokeStyle = '#111'; g.lineWidth = 1;
  const lentes = vista === 'lado' ? [3 * s] : [-3 * s, 3 * s];
  for (const lx of lentes) {
    if (tipo === 'coracao') { g.beginPath(); g.arc(lx - 1 * s, hy - 1 * s, 1.6 * s, 0, 7); g.arc(lx + 1 * s, hy - 1 * s, 1.6 * s, 0, 7); g.fill(); g.beginPath(); g.moveTo(lx - 2.6 * s, hy - 0.5 * s); g.lineTo(lx, hy + 2.5 * s); g.lineTo(lx + 2.6 * s, hy - 0.5 * s); g.fill(); }
    else if (tipo === 'estrela') estrela(g, lx, hy, 3 * s, cor);
    else { g.fillRect(lx - 2.5 * s, hy - 2 * s, 5 * s, 3.2 * s); if (tipo === 'nerd') g.strokeRect(lx - 2.5 * s, hy - 2 * s, 5 * s, 3.2 * s); }
  }
  if (vista === 'frente') { g.fillStyle = '#111'; g.fillRect(-0.5 * s, hy - 1.5 * s, 1 * s, 1 * s); }
}
function chapeu(g, p, vista, hy, r, s, t) {
  if (!p.chapeu && !p.chapeuTipo) return;
  const tipo = p.chapeuTipo || 'bone', c = p.chapeu || '#111', top = hy - r;
  g.fillStyle = c;
  switch (tipo) {
    case 'bone': g.beginPath(); g.arc(0, hy - 2 * s, r * 1.05, Math.PI, 0); g.fill(); if (vista !== 'costas') g.fillRect(vista === 'lado' ? 2 * s : -r, hy - 3 * s, vista === 'lado' ? r * 1.4 : r * 2, 2.6 * s); break;
    case 'cowboy': g.beginPath(); g.ellipse(0, hy - 4 * s, r * 1.8, 3 * s, 0, 0, 7); g.fill(); g.fillRect(-r * 0.75, top - 6 * s, r * 1.5, 9 * s); break;
    case 'bucket': g.beginPath(); g.ellipse(0, hy - 3 * s, r * 1.45, 3.2 * s, 0, 0, 7); g.fill(); g.beginPath(); g.arc(0, hy - 3 * s, r * 1.02, Math.PI, 0); g.fill(); break;
    case 'cone': g.fillStyle = '#ff6b00'; g.beginPath(); g.moveTo(-r, hy - 3 * s); g.lineTo(r, hy - 3 * s); g.lineTo(0, top - 18 * s); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(-r * 0.55, top - 6 * s, r * 1.1, 3 * s); break;
    case 'chef': g.fillStyle = '#fff'; g.fillRect(-r * 0.85, top - 6 * s, r * 1.7, 9 * s); g.beginPath(); g.arc(-4 * s, top - 8 * s, 6 * s, 0, 7); g.arc(4 * s, top - 8 * s, 6 * s, 0, 7); g.arc(0, top - 11 * s, 6 * s, 0, 7); g.fill(); break;
    case 'coroa': g.fillStyle = '#f1c40f'; g.beginPath(); g.moveTo(-r, hy - 4 * s); g.lineTo(-r, top - 6 * s); g.lineTo(-r / 2, top - 1 * s); g.lineTo(0, top - 8 * s); g.lineTo(r / 2, top - 1 * s); g.lineTo(r, top - 6 * s); g.lineTo(r, hy - 4 * s); g.closePath(); g.fill(); g.fillStyle = '#e74c3c'; g.beginPath(); g.arc(0, top - 1 * s, 1.8 * s, 0, 7); g.fill(); break;
    case 'pirata': g.fillStyle = '#111'; g.beginPath(); g.moveTo(-r * 1.6, hy - 4 * s); g.quadraticCurveTo(0, top - 14 * s, r * 1.6, hy - 4 * s); g.closePath(); g.fill(); if (vista !== 'costas') { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, top - 3 * s, 2 * s, 0, 7); g.fill(); } break;
    case 'viking': g.fillStyle = '#95a5a6'; g.beginPath(); g.arc(0, hy - 2 * s, r * 1.05, Math.PI, 0); g.fill(); g.fillStyle = '#f5f5dc'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * r * 0.8, hy - 5 * s); g.quadraticCurveTo(sd * r * 1.8, hy - 8 * s, sd * r * 1.6, top - 10 * s); g.lineTo(sd * r * 1.1, hy - 7 * s); g.fill(); } break;
    case 'gato': g.fillStyle = c; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * r * 0.2, top + 1 * s); g.lineTo(sd * r * 0.9, top - 8 * s); g.lineTo(sd * r * 1.1, top + 3 * s); g.fill(); g.fillStyle = '#ffb6c1'; g.beginPath(); g.moveTo(sd * r * 0.45, top + 1 * s); g.lineTo(sd * r * 0.85, top - 4 * s); g.lineTo(sd * r * 0.95, top + 2 * s); g.fill(); g.fillStyle = c; } break;
    case 'festa': g.fillStyle = `hsl(${(t * 60) % 360},80%,55%)`; g.beginPath(); g.moveTo(-r * 0.6, top + 2 * s); g.lineTo(r * 0.6, top + 2 * s); g.lineTo(0, top - 14 * s); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, top - 14 * s, 2.5 * s, 0, 7); g.fill(); break;
    case 'cartola': g.fillStyle = '#111'; g.fillRect(-r * 1.4, hy - 5 * s, r * 2.8, 3 * s); g.fillRect(-r * 0.8, top - 12 * s, r * 1.6, 14 * s); g.fillStyle = '#c0392b'; g.fillRect(-r * 0.8, hy - 8 * s, r * 1.6, 2.5 * s); break;
    case 'capacete': g.fillStyle = c; g.beginPath(); g.arc(0, hy, r * 1.25, 0, 7); g.fill(); if (vista !== 'costas') { g.fillStyle = 'rgba(140,200,255,.6)'; g.beginPath(); g.arc(vista === 'lado' ? 4 * s : 0, hy + 1 * s, r * 0.7, -1.2, 1.2); g.fill(); } break;
    case 'helice': g.beginPath(); g.arc(0, hy - 2 * s, r * 1.05, Math.PI, 0); g.fill(); g.fillStyle = '#f1c40f'; g.fillRect(-1 * s, top - 6 * s, 2 * s, 5 * s); { const ha = t * 20; g.fillStyle = '#2e86de'; g.fillRect(-Math.cos(ha) * 9 * s, top - 7 * s, Math.cos(ha) * 18 * s || 1, 2 * s); } break;
    case 'galinha': g.fillStyle = '#fdfefe'; g.beginPath(); g.ellipse(0, top - 4 * s, 8 * s, 6 * s, 0, 0, 7); g.fill(); g.beginPath(); g.arc(6 * s, top - 10 * s, 3.5 * s, 0, 7); g.fill(); g.fillStyle = '#e74c3c'; g.fillRect(5 * s, top - 15 * s, 2 * s, 3 * s); g.fillStyle = '#f39c12'; g.beginPath(); g.moveTo(9 * s, top - 10 * s); g.lineTo(13 * s, top - 9 * s); g.lineTo(9 * s, top - 8 * s); g.fill(); g.fillStyle = '#111'; g.fillRect(6.5 * s, top - 11 * s, 1.2 * s, 1.2 * s); break;
    case 'melancia': g.fillStyle = '#27ae60'; g.beginPath(); g.arc(0, hy - 2 * s, r * 1.15, Math.PI, 0); g.fill(); g.fillStyle = '#1e8449'; for (let k = -2; k <= 2; k++) g.fillRect(k * 3 * s - 0.6 * s, top - 1 * s, 1.2 * s, r * 0.9); g.fillStyle = '#e74c3c'; g.fillRect(-r * 1.15, hy - 3 * s, r * 2.3, 1.6 * s); break;
    case 'palha': g.fillStyle = '#d4ac0d'; g.beginPath(); g.ellipse(0, hy - 4 * s, r * 1.9, 3.2 * s, 0, 0, 7); g.fill(); g.beginPath(); g.arc(0, hy - 4 * s, r * 0.9, Math.PI, 0); g.fill(); g.fillStyle = '#c0392b'; g.fillRect(-r * 0.9, hy - 6 * s, r * 1.8, 1.6 * s); g.fillStyle = '#7d6608'; for (let k = 0; k < 5; k++) g.fillRect(-r * 1.7 + k * r * 0.8, hy - 3 * s, 1 * s, 2 * s); break;
    case 'sombrero': g.fillStyle = '#d4ac0d'; g.beginPath(); g.ellipse(0, hy - 4 * s, r * 2.4, 4 * s, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, top - 3 * s, r * 0.8, 8 * s, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c0392b'; g.fillRect(-r * 2.2, hy - 5 * s, r * 4.4, 1.5 * s); break;
  }
}
function galinha(g, p, s) {
  const a = p.a || 0, esq = Math.cos(a) < 0, pa = Math.sin(p.anda || 0) * 3 * s;
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 0, 12 * s, 4 * s, 0, 0, 7); g.fill();
  if (esq) g.scale(-1, 1);
  g.fillStyle = '#f39c12'; g.fillRect(-3 * s + pa, -8 * s, 2 * s, 8 * s); g.fillRect(2 * s - pa, -8 * s, 2 * s, 8 * s);
  g.fillStyle = '#fdfefe'; g.beginPath(); g.ellipse(0, -16 * s, 13 * s, 9 * s, 0, 0, 7); g.fill(); g.strokeStyle = '#ccc'; g.lineWidth = 1; g.stroke();
  g.fillStyle = '#ecf0f1'; g.beginPath(); g.ellipse(-3 * s, -16 * s, 8 * s, 5 * s, -0.3, 0, 7); g.fill();
  const im = ROSTOS.gelado, hx = 10 * s, hy = -28 * s, r = 8 * s;
  if (im && im.complete && im.naturalWidth) { g.save(); g.beginPath(); g.arc(hx, hy, r, 0, 7); g.clip(); g.drawImage(im, hx - r, hy - r, r * 2, r * 2); g.restore(); g.strokeStyle = '#e74c3c'; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, r, 0, 7); g.stroke(); }
  g.fillStyle = '#e74c3c'; g.fillRect(hx - 2 * s, hy - r - 4 * s, 4 * s, 5 * s); g.fillStyle = '#f39c12'; g.beginPath(); g.moveTo(hx + r, hy); g.lineTo(hx + r + 6 * s, hy + 2 * s); g.lineTo(hx + r, hy + 4 * s); g.fill();
  if (esq) g.scale(-1, 1);
  if (W.jog && dist(p.x, p.y, W.jog.x, W.jog.y) < 520) { g.font = 'bold 10px system-ui'; g.textAlign = 'center'; g.fillStyle = '#f39c12'; g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText('Galado 🐔', 0, -44 * s); g.fillText('Galado 🐔', 0, -44 * s); }
}
function armaNaMao(g, arma, x, y, s) {
  g.save(); g.translate(x, y);
  const cor = arma === 'taco' ? '#c8a165' : arma === 'molotov' ? '#1e8449' : arma === 'granada' ? '#4a5d23' : arma === 'lancachamas' ? '#b03a2e' : '#1b1b1b';
  g.fillStyle = cor;
  const L = { escopeta: 16, foguete: 18, uzi: 10, fuzil: 17, lancachamas: 15, taco: 18, granada: 3, molotov: 5, pistola: 7 }[arma] || 7;
  if (arma === 'granada') { g.beginPath(); g.arc(0, 2 * s, 3 * s, 0, 7); g.fill(); }
  else if (arma === 'molotov') { g.fillRect(-1.5 * s, 0, 3 * s, 7 * s); g.fillStyle = '#ff8c00'; g.beginPath(); g.arc(0, 8 * s, 2 * s, 0, 7); g.fill(); }
  else { g.fillRect(-1.6 * s, 0, 3.2 * s, L * s); if (arma === 'foguete') { g.fillStyle = '#4a5d23'; g.fillRect(-2.6 * s, -4 * s, 5.2 * s, L * s); } if (arma === 'fuzil' || arma === 'uzi') { g.fillRect(-1.6 * s, 4 * s, 5 * s, 2.5 * s); } }
  g.restore();
}

// ---------- caixas de item (estilo GTA 1) ----------
function desenharItem(g, it) {
  const b = Math.sin(W.tempo * 4 + it.x) * 2, gira = W.tempo * 1.5 + it.x;
  g.save(); g.translate(it.x, it.y + b);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(3, 6, 16, 10, 0, 0, 7); g.fill();
  const caixa = (cor, borda) => { g.save(); g.rotate(Math.sin(gira) * 0.25); g.fillStyle = cor; rr(g, -14, -14, 28, 28, 5); g.fill(); g.strokeStyle = borda; g.lineWidth = 3; g.stroke(); g.restore(); };
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (it.t === 'grana') { caixa('#1e8449', '#0b3d1f'); g.fillStyle = '#d5f5e3'; g.font = '900 13px system-ui'; g.fillText('R$', 0, 1); }
  else if (it.t === 'vida') { caixa('#fdfefe', '#999'); g.fillStyle = '#e74c3c'; g.fillRect(-4, -10, 8, 20); g.fillRect(-10, -4, 20, 8); }
  else if (it.t === 'colete') { caixa('#2e86c1', '#123'); g.fillStyle = '#d6eaf8'; g.beginPath(); g.moveTo(0, -10); g.lineTo(9, -6); g.lineTo(7, 5); g.lineTo(0, 10); g.lineTo(-7, 5); g.lineTo(-9, -6); g.closePath(); g.fill(); }
  else if (it.t === 'estrela') { caixa('#b7950b', '#5a4a00'); estrela(g, 0, 0, 10, '#fff7c2'); }
  else if (it.t === 'arma') { caixa('#5d6d7e', '#1c2833'); iconeArma(g, it.arma, 0, 0, 0.9, '#fff'); g.font = 'bold 9px system-ui'; g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText(ARMAS[it.arma].nome, 0, 24); g.fillText(ARMAS[it.arma].nome, 0, 24); }
  else if (it.t === 'segredo') { caixa('#0b5345', '#00e5ff'); g.fillStyle = '#00e5ff'; g.font = '900 18px system-ui'; g.fillText('?', 0, 1); const p = 1 + Math.sin(W.tempo * 5) * 0.2; g.strokeStyle = 'rgba(0,229,255,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 22 * p, 0, 7); g.stroke(); }
  else if (it.t === 'armadilha' && it.icone === '🍌') { g.rotate(0.6); g.fillStyle = '#f4d03f'; g.beginPath(); g.ellipse(0, 0, 12, 5, 0, 0, 7); g.fill(); g.fillStyle = '#7d6608'; g.fillRect(10, -2, 4, 4); }
  else if (it.t === 'armadilha') { caixa('#145a32', '#f1c40f'); g.fillStyle = '#f1c40f'; g.font = '900 12px system-ui'; g.fillText('$$$', 0, 1); }
  else { // pacote de missão
    caixa('#f39c12', '#7e5109');
    g.fillStyle = '#fff'; g.font = '900 15px system-ui';
    const sim = { '🏧': '$', '🔊': '♪', '💾': 'HD' }[it.icone] || '!'; g.fillText(sim, 0, 1);
    const p = 1 + Math.sin(W.tempo * 6) * 0.15; g.strokeStyle = 'rgba(243,156,18,.7)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 24 * p, 0, 7); g.stroke();
  }
  g.textBaseline = 'alphabetic'; g.restore();
}
function estrela(g, x, y, r, cor) {
  g.fillStyle = cor; g.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  g.closePath(); g.fill();
}
function iconeArma(g, arma, x, y, s, cor) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = cor;
  if (arma === 'punho') { g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 3; k++) g.fillRect(-6 + k * 4.5, -8, 1.5, 7); }
  else if (arma === 'pistola') { g.fillRect(-10, -5, 18, 5); g.fillRect(-10, -5, 6, 13); }
  else if (arma === 'uzi') { g.fillRect(-12, -5, 22, 6); g.fillRect(-4, 1, 5, 10); g.fillRect(-12, 1, 4, 7); }
  else if (arma === 'escopeta') { g.fillRect(-14, -3, 28, 4); g.fillRect(-14, -3, 8, 9); g.fillRect(2, 1, 8, 3); }
  else if (arma === 'taco') { g.save(); g.rotate(-0.6); g.fillRect(-14, -2, 28, 4); g.fillRect(4, -4, 12, 8); g.restore(); }
  else if (arma === 'fuzil') { g.fillRect(-16, -4, 32, 5); g.fillRect(-16, -4, 7, 10); g.save(); g.translate(2, 1); g.rotate(0.3); g.fillRect(0, 0, 5, 10); g.restore(); }
  else if (arma === 'granada') { g.beginPath(); g.arc(0, 2, 9, 0, 7); g.fill(); g.fillRect(-3, -11, 6, 6); }
  else if (arma === 'molotov') { g.fillRect(-5, -6, 10, 16); g.fillRect(-2, -12, 4, 7); g.fillStyle = '#ff8c00'; g.beginPath(); g.arc(0, -14, 4, 0, 7); g.fill(); }
  else if (arma === 'lancachamas') { g.fillRect(-14, -4, 24, 8); g.fillRect(-10, 4, 8, 6); g.fillStyle = '#ff8c00'; g.beginPath(); g.moveTo(10, -5); g.lineTo(20, 0); g.lineTo(10, 5); g.fill(); }
  else if (arma === 'foguete') { g.fillRect(-14, -4, 26, 8); g.beginPath(); g.moveTo(12, -6); g.lineTo(18, 0); g.lineTo(12, 6); g.fill(); g.fillRect(-4, 4, 4, 6); }
  g.restore();
}

// ---------- carros ----------
function escurecer(hex, f) {
  const v = parseInt(hex.slice(1), 16); let r = v >> 16, g = (v >> 8) & 255, b = v & 255;
  r = clamp(r * f | 0, 0, 255); g = clamp(g * f | 0, 0, 255); b = clamp(b * f | 0, 0, 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function desenharMoto(g, c, t) {
  const L = c.l;
  g.save(); g.translate(c.x, c.y);
  if (c.neon && c.hp > 0) { const nc = c.neon === 'arco' ? `hsl(${(W.tempo * 120) % 360},100%,55%)` : c.neon; g.save(); g.globalAlpha = 0.55; g.fillStyle = nc; g.beginPath(); g.ellipse(0, 0, L * 0.6, 16, c.a, 0, 7); g.fill(); g.restore(); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.save(); g.translate(3, 4); g.rotate(c.a); rr(g, -L / 2, -8, L, 16, 7); g.fill(); g.restore();
  // rodas no chão, corpo um pouco acima (dá altura na câmera inclinada)
  g.save(); g.rotate(c.a); g.fillStyle = '#111'; rr(g, L / 2 - 15, -4, 15, 8, 4); g.fill(); rr(g, -L / 2, -4, 15, 8, 4); g.fill(); g.restore();
  g.translate(0, -7 / INCL);
  g.rotate(c.a);
  g.fillStyle = '#111'; rr(g, L / 2 - 14, -5, 14, 10, 4); g.fill(); rr(g, -L / 2, -5, 14, 10, 4); g.fill();
  g.fillStyle = c.roda || '#7f8c8d'; g.fillRect(L / 2 - 10, -2, 6, 4); g.fillRect(-L / 2 + 4, -2, 6, 4);
  g.fillStyle = c.hp <= 0 ? '#333' : c.cor; rr(g, -L / 2 + 8, -7, L - 16, 14, 6); g.fill(); g.strokeStyle = escurecer(c.cor, 0.6); g.lineWidth = 2; g.stroke();
  g.fillStyle = '#bdc3c7'; g.fillRect(L / 2 - 16, -11, 3, 22);
  g.fillStyle = '#fff6b0'; g.fillRect(L / 2 - 3, -3, 3, 6);
  if (c.adesivo === 'chamas') { g.fillStyle = '#ff8c00'; g.beginPath(); g.moveTo(L * 0.2, -5); g.lineTo(-L * 0.2, -2); g.lineTo(L * 0.05, 0); g.lineTo(-L * 0.2, 2); g.lineTo(L * 0.2, 5); g.fill(); }
  else if (c.adesivo === 'listras' || c.adesivo === 'xadrez') { g.fillStyle = '#fff'; g.fillRect(-L / 2 + 8, -1.5, L - 16, 3); }
  else if (c.adesivo === 'arco') ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'].forEach((cc, k) => { g.fillStyle = cc; g.fillRect(-L / 2 + 8, -6 + k * 2, L - 16, 2); });
  else if (c.adesivo) { g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(-L * 0.25 + k * L * 0.12, (k % 2 ? -3 : 3), 2, 0, 7); g.fill(); } }
  if (c.nitroOn) { g.fillStyle = '#00e5ff'; g.beginPath(); g.arc(-L / 2 - 4, 0, 4 + Math.random() * 4, 0, 7); g.fill(); }
  if (c.modelo === 'biz') { g.fillStyle = '#c0392b'; g.fillRect(-L / 2 + 2, -9, 12, 18); g.fillStyle = '#fff'; g.font = 'bold 7px system-ui'; g.fillText('iFOME', -L / 2 + 2, 3); }
  g.restore();
  const m = c.motorista;
  if (m) { g.save(); desenharPessoa(g, { ...m, x: c.x - Math.cos(c.a) * 4, y: c.y - Math.sin(c.a) * 4 - 2, a: c.a, anda: 0, chapeu: m.capacete || m.chapeu, chapeuTipo: m.capacete ? 'capacete' : m.chapeuTipo, nome: null, nadando: false }, { semNome: true, sentado: true, jog: m === W.jog }); g.restore(); }
  g.save();
  g.restore();
  if (c.nome && dist(c.x, c.y, W.jog.x, W.jog.y) < 700) rotuloEmPe(g, c.nome, c.x, c.y, 58, c.gangue ? '#ff8c00' : '#ff6b6b', 'bold 11px system-ui');
}
function desenharCarro(g, c) {
  const L = c.l, Wd = c.w, t = TIPOS_CARRO[c.modelo];
  if (t.moto) return desenharMoto(g, c, t);
  if (t.barco) return desenharBarco(g, c, t);
  g.save(); g.translate(c.x, c.y);
  // neon embaixo do carro
  if (c.neon && c.hp > 0) { const nc = c.neon === 'arco' ? `hsl(${(W.tempo * 120) % 360},100%,55%)` : c.neon; const gr0 = g.createRadialGradient(0, 0, 4, 0, 0, L * 0.75); gr0.addColorStop(0, c.neon === 'arco' ? nc.replace('hsl', 'hsla').replace(')', ',.8)') : c.neon + 'cc'); gr0.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr0; g.beginPath(); g.ellipse(0, 0, L * 0.75, Wd * 1.1, c.a, 0, 7); g.fill(); }
  if (false) { const gr = g.createRadialGradient(0, 0, 4, 0, 0, L * 0.75); gr.addColorStop(0, c.neon + 'cc'); gr.addColorStop(1, c.neon + '00'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, L * 0.8, L * 0.6, c.a, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.save(); g.translate(5, 7); g.rotate(c.a); rr(g, -L / 2, -Wd / 2, L, Wd, 10); g.fill(); g.restore();
  g.rotate(c.a);
  const cor = c.hp <= 0 ? '#2a2a2a' : c.cor;
  // rodas
  for (const [px, py] of [[L * 0.3, -Wd / 2 - 2], [L * 0.3, Wd / 2 - 5], [-L * 0.3, -Wd / 2 - 2], [-L * 0.3, Wd / 2 - 5]]) { g.fillStyle = '#111'; g.fillRect(px - 8, py, 16, 7); g.fillStyle = c.roda || '#7f8c8d'; g.fillRect(px - 4, py + 2, 8, 3); }
  // lateral (dá altura ao carro na câmera inclinada)
  g.fillStyle = escurecer(cor, 0.5); rr(g, -L / 2, -Wd / 2, L, Wd, c.modelo === 'esporte' ? 14 : 8); g.fill();
  g.rotate(-c.a); g.translate(0, -8 / INCL); g.rotate(c.a);
  // carroceria
  g.fillStyle = cor; rr(g, -L / 2, -Wd / 2, L, Wd, c.modelo === 'esporte' ? 14 : 8); g.fill();
  g.strokeStyle = escurecer(cor, 0.6); g.lineWidth = 2; g.stroke();
  if (c.modelo === 'caminhao') {
    g.fillStyle = escurecer(cor, 0.85); g.fillRect(-L / 2 + 4, -Wd / 2 + 4, L * 0.62, Wd - 8);
    g.fillStyle = '#9ec7e0'; g.fillRect(L * 0.28, -Wd / 2 + 6, 8, Wd - 12);
    g.fillStyle = 'rgba(255,255,255,.2)'; for (let k = 0; k < 5; k++) g.fillRect(-L / 2 + 10 + k * 14, -Wd / 2 + 6, 3, Wd - 12);
  } else if (c.modelo === 'pickup') {
    g.fillStyle = escurecer(cor, 0.7); g.fillRect(-L / 2 + 5, -Wd / 2 + 5, L * 0.42, Wd - 10);
    g.fillStyle = '#9ec7e0'; g.fillRect(L * 0.02, -Wd / 2 + 6, 9, Wd - 12);
    g.fillStyle = escurecer(cor, 1.15); g.fillRect(L * 0.02 + 9, -Wd / 2 + 6, L * 0.22, Wd - 12);
  } else {
    g.fillStyle = '#9ec7e0'; g.fillRect(L * 0.12, -Wd / 2 + 5, 10, Wd - 10);  // para-brisa
    g.fillStyle = '#6f9ab5'; g.fillRect(-L * 0.32, -Wd / 2 + 6, 7, Wd - 12);   // vidro de trás
    g.fillStyle = escurecer(cor, 1.18); g.fillRect(-L * 0.25, -Wd / 2 + 6, L * 0.37, Wd - 12); // teto
  }
  if (t.taxi) { g.fillStyle = '#111'; g.fillRect(-L * 0.45, -Wd / 2, 6, Wd); g.fillStyle = '#fff'; g.fillRect(-12, -7, 20, 14); g.fillStyle = '#111'; g.font = 'bold 8px system-ui'; g.textAlign = 'center'; g.save(); g.rotate(Math.PI / 2); g.fillText('TÁXI', 0, 3); g.restore(); }
  if (t.onibus) { g.fillStyle = '#ecf0f1'; g.fillRect(-L / 2 + 6, -Wd / 2 + 6, L - 12, Wd - 12); g.fillStyle = '#9ec7e0'; for (let k = 0; k < 8; k++) { g.fillRect(-L / 2 + 10 + k * 17, -Wd / 2 + 2, 12, 5); g.fillRect(-L / 2 + 10 + k * 17, Wd / 2 - 7, 12, 5); } g.fillStyle = '#111'; g.font = 'bold 16px system-ui'; g.textAlign = 'center'; g.fillText('171', 0, 6); }
  if (t.lambo) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(L / 2, -Wd / 2 + 4); g.lineTo(L * 0.05, -4); g.lineTo(L * 0.05, 4); g.lineTo(L / 2, Wd / 2 - 4); g.fill(); g.fillStyle = '#111'; g.fillRect(-L / 2 + 2, -Wd / 2 + 4, 10, Wd - 8); }
  if (t.fusca) { g.fillStyle = escurecer(c.cor, 1.15); g.beginPath(); g.ellipse(-4, 0, L * 0.3, Wd * 0.38, 0, 0, 7); g.fill(); }
  if (c.listra) { g.fillStyle = c.listra; g.fillRect(-L / 2 + 2, -4, L - 4, 8); }
  if (c.modelo === 'popular' && c.escada !== false) { g.strokeStyle = '#ccc'; g.lineWidth = 2; g.strokeRect(-L * 0.24, -Wd / 2 + 8, L * 0.34, Wd - 16); for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(-L * 0.24 + k * L * 0.068, -Wd / 2 + 8); g.lineTo(-L * 0.24 + k * L * 0.068, Wd / 2 - 8); g.stroke(); } }
  if (c.adesivo === 'chamas') { g.fillStyle = '#ff8c00'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(L * 0.45, -Wd / 2 + 4 + k * (Wd - 8) / 4); g.quadraticCurveTo(L * 0.1, -Wd / 2 + 2 + k * (Wd - 8) / 4, -L * 0.05 - k * 6, -Wd / 2 + 6 + k * (Wd - 8) / 4); g.lineTo(L * 0.45, -Wd / 2 + 8 + k * (Wd - 8) / 4); g.fill(); } }
  else if (c.adesivo === 'listras') { g.fillStyle = '#fff'; g.fillRect(-L / 2 + 2, -7, L - 4, 4); g.fillRect(-L / 2 + 2, 3, L - 4, 4); }
  else if (c.adesivo === 'arco') { ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'].forEach((cc, k) => { g.fillStyle = cc; g.fillRect(-L / 2 + 2, -Wd / 2 + 3 + k * (Wd - 6) / 6, L - 4, (Wd - 6) / 6); }); g.fillStyle = '#9ec7e0'; g.fillRect(L * 0.12, -Wd / 2 + 5, 10, Wd - 10); }
  else if (c.adesivo === 'simas') { g.save(); g.rotate(Math.PI / 2); g.fillStyle = '#ff6ec7'; g.font = 'bold 10px system-ui'; g.textAlign = 'center'; g.fillText('SIMAS', 0, -L * 0.33); g.restore(); }
  else if (c.adesivo === 'xadrez') { for (let xx = 0; xx < 6; xx++) for (let yy = 0; yy < 2; yy++) { g.fillStyle = (xx + yy) % 2 ? '#111' : '#fff'; g.fillRect(-L * 0.15 + xx * 5, -5 + yy * 5, 5, 5); } }
  else if (c.adesivo === 'camuflado') { const cs = ['#4a5d23', '#6b4f2a', '#2d3a1a']; for (let k = 0; k < 12; k++) { g.fillStyle = cs[k % 3]; g.beginPath(); g.arc(-L * 0.4 + (k * 29) % (L * 0.8), -Wd / 2 + 4 + (k * 17) % (Wd - 8), 4, 0, 7); g.fill(); } }
  else if (c.adesivo === 'oncinha') { g.fillStyle = 'rgba(60,30,0,.75)'; for (let k = 0; k < 10; k++) { g.beginPath(); g.arc(-L * 0.4 + (k * 37) % (L * 0.8), -Wd / 2 + 4 + (k * 19) % (Wd - 8), 2.5, 0, 7); g.fill(); } }
  if (c.fume) { g.fillStyle = 'rgba(10,10,15,.85)'; g.fillRect(L * 0.12, -Wd / 2 + 5, 10, Wd - 10); g.fillRect(-L * 0.32, -Wd / 2 + 6, 7, Wd - 12); }
  if (c.aero) { g.fillStyle = escurecer(cor, 0.7); g.fillRect(-L / 2 - 4, -Wd / 2 - 1, 6, Wd + 2); g.fillStyle = '#111'; g.fillRect(-L / 2 + 2, -Wd / 2 + 6, 4, 4); g.fillRect(-L / 2 + 2, Wd / 2 - 10, 4, 4); }
  if (c.nitroOn) { g.fillStyle = '#00e5ff'; g.beginPath(); g.moveTo(-L / 2, -6); g.lineTo(-L / 2 - 30 - Math.random() * 20, 0); g.lineTo(-L / 2, 6); g.fill(); }
  // faróis
  g.fillStyle = '#fff6b0'; g.fillRect(L / 2 - 4, -Wd / 2 + 3, 4, 7); g.fillRect(L / 2 - 4, Wd / 2 - 10, 4, 7);
  g.fillStyle = '#c0392b'; g.fillRect(-L / 2, -Wd / 2 + 3, 3, 7); g.fillRect(-L / 2, Wd / 2 - 10, 3, 7);
  if (t.policia) {
    if (!t.gelado) { g.fillStyle = '#1f3a93'; g.fillRect(-L * 0.4, -Wd / 2, L * 0.15, Wd); g.fillRect(L * 0.3, -Wd / 2, L * 0.1, Wd); }
    const pisca = (W.tempo * 6 | 0) % 2;
    g.fillStyle = c.sirene && pisca ? '#ff2b2b' : '#7a1010'; g.fillRect(-6, -Wd / 2 + 6, 8, Wd / 2 - 6);
    g.fillStyle = c.sirene && !pisca ? '#2b6bff' : '#10207a'; g.fillRect(-6, 0, 8, Wd / 2 - 6);
    if (t.gelado) {
      // farol de busca e a cara do Gelado no teto
      g.fillStyle = 'rgba(255,255,200,.12)'; g.beginPath(); g.moveTo(L / 2, -Wd / 2); g.lineTo(L / 2 + 260, -110); g.lineTo(L / 2 + 260, 110); g.lineTo(L / 2, Wd / 2); g.fill();
      g.fillStyle = '#d4ac0d'; g.fillRect(-L / 2 + 4, -Wd / 2, L - 8, 4); g.fillRect(-L / 2 + 4, Wd / 2 - 4, L - 8, 4);
      const pisca2 = (W.tempo * 9 | 0) % 2;
      g.fillStyle = pisca2 ? '#ffffff' : '#2b6bff'; g.fillRect(-L * 0.42, -Wd / 2 + 4, 10, Wd - 8);
      g.fillStyle = pisca2 ? '#2b6bff' : '#ffffff'; g.fillRect(L * 0.3, -Wd / 2 + 4, 6, Wd - 8);
    }
  }
  if (c.modelo === 'choque') {
    g.fillStyle = '#222'; g.fillRect(-L * 0.35, -Wd / 2 + 6, L * 0.6, Wd - 12);
    g.fillStyle = '#00e5ff'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(-L * 0.2 + k * L * 0.18, 0, 6 + Math.sin(W.tempo * 10 + k) * 2, 0, 7); g.fill(); }
  }
  if (c.blind > 0) { g.strokeStyle = '#95a5a6'; g.lineWidth = 3; rr(g, -L / 2 + 1, -Wd / 2 + 1, L - 2, Wd - 2, 8); g.stroke(); }
  g.restore();
  if (t.gelado) {
    const im = ROSTOS.gelado, r = 17;
    g.fillStyle = '#d4ac0d'; g.beginPath(); g.arc(c.x, c.y, r + 3, 0, 7); g.fill();
    if (im && im.complete && im.naturalWidth) { g.save(); g.beginPath(); g.arc(c.x, c.y, r, 0, 7); g.clip(); g.drawImage(im, c.x - r, c.y - r, r * 2, r * 2); g.restore(); }
    rotuloEmPe(g, '🚨 SEGURANÇA GELADO', c.x, c.y, 64 + Math.sin(W.tempo * 6) * 2, '#ffd23f', '900 13px "Arial Black", system-ui');
  }
  if (c.nome) rotuloEmPe(g, c.nome, c.x, c.y, 52, '#ff6b6b', 'bold 12px system-ui');
}

function rotuloEmPe(g, txt, x, y, alto, cor, fonte) {
  g.save(); g.translate(x, y); g.scale(1, 1 / INCL);
  g.font = fonte || 'bold 12px system-ui'; g.textAlign = 'center'; g.lineWidth = 3.5; g.strokeStyle = 'rgba(0,0,0,.85)'; g.strokeText(txt, 0, -alto); g.fillStyle = cor; g.fillText(txt, 0, -alto);
  g.restore();
}
// decoração que fica de pé (árvore, poste, hidrante...): desenhada na vertical, com a base no chão
const DECO_EM_PE = new Set(['arvore', 'palmeira', 'poste', 'hidrante', 'lixeira', 'placa', 'cacto', 'pedra', 'caixa_som']);
function desenharDecoEmPe(g, d) {
  if (d.quebrado) { desenharDeco(g, d); return; }
  g.save(); g.translate(d.x, d.y); g.scale(1, 1 / INCL);
  const s = d.s || 1;
  switch (d.t) {
    case 'arvore': {
      const ver = d.selva ? '#1e5c2a' : '#2e6b2a', cla = d.selva ? '#2e7d32' : '#3f8a37';
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(4, 0, 26 * s, 9 * s, 0, 0, 7); g.fill();
      g.fillStyle = '#6d4c2f'; g.fillRect(-4 * s, -26 * s, 8 * s, 26 * s);
      g.fillStyle = ver; g.beginPath(); g.arc(0, -40 * s, 24 * s, 0, 7); g.arc(-14 * s, -30 * s, 15 * s, 0, 7); g.arc(14 * s, -30 * s, 15 * s, 0, 7); g.fill();
      g.fillStyle = cla; g.beginPath(); g.arc(-7 * s, -48 * s, 12 * s, 0, 7); g.fill(); break; }
    case 'palmeira': {
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(6, 0, 22 * s, 7 * s, 0, 0, 7); g.fill();
      g.strokeStyle = '#7a5230'; g.lineWidth = 7 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(8 * s, -30 * s, 4 * s, -62 * s); g.stroke();
      g.strokeStyle = '#2f8f3a'; g.lineWidth = 6 * s; for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.55; g.beginPath(); g.moveTo(4 * s, -62 * s); g.quadraticCurveTo(4 * s + Math.cos(a) * 18 * s, -62 * s + Math.sin(a) * 14 * s - 8 * s, 4 * s + Math.cos(a) * 32 * s, -62 * s + Math.sin(a) * 10 * s + 14 * s); g.stroke(); }
      g.lineCap = 'butt'; break; }
    case 'poste': {
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(2, 0, 7, 3, 0, 0, 7); g.fill();
      g.fillStyle = '#566573'; g.fillRect(-2, -64, 4, 64); const dx = Math.cos(d.a || 0) * 16; g.fillRect(Math.min(0, dx), -64, Math.abs(dx) + 2, 3);
      g.fillStyle = '#fdf2c0'; g.fillRect(dx - 4, -63, 8, 5); g.fillStyle = 'rgba(255,240,180,.15)'; g.beginPath(); g.arc(dx, -58, 18, 0, 7); g.fill(); break; }
    case 'hidrante': { g.fillStyle = '#c0392b'; g.fillRect(-5, -14, 10, 14); g.beginPath(); g.arc(0, -14, 5, Math.PI, 0); g.fill(); g.fillStyle = '#922b21'; g.fillRect(-8, -10, 16, 3); break; }
    case 'lixeira': { g.fillStyle = '#1e8449'; g.fillRect(-7, -18, 14, 18); g.fillStyle = '#145a32'; g.fillRect(-8, -20, 16, 4); break; }
    case 'placa': { g.fillStyle = '#7f8c8d'; g.fillRect(-1.5, -40, 3, 40); g.font = 'bold 9px system-ui'; const w = Math.min(120, g.measureText(d.txt).width + 10); g.fillStyle = d.txt === 'PARE' ? '#c0392b' : '#1e8449'; g.fillRect(-w / 2, -54, w, 16); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(d.txt, 0, -42); break; }
    case 'cacto': { g.fillStyle = '#4f7d3a'; g.fillRect(-5 * s, -36 * s, 10 * s, 36 * s); g.fillRect(-15 * s, -24 * s, 10 * s, 6 * s); g.fillRect(-15 * s, -34 * s, 6 * s, 14 * s); g.fillRect(5 * s, -18 * s, 10 * s, 6 * s); g.fillRect(9 * s, -28 * s, 6 * s, 14 * s); break; }
    case 'pedra': { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(4, 0, 26 * s, 8 * s, 0, 0, 7); g.fill(); g.fillStyle = '#7f8c8d'; g.beginPath(); g.ellipse(0, -14 * s, 26 * s, 18 * s, 0, 0, 7); g.fill(); g.fillStyle = '#95a5a6'; g.beginPath(); g.ellipse(-6 * s, -20 * s, 12 * s, 8 * s, 0, 0, 7); g.fill(); break; }
    case 'caixa_som': { const p = 1 + Math.max(0, Math.sin(W.tempo * 13)) * 0.08; g.scale(p, p); g.fillStyle = '#111'; g.fillRect(-22, -64, 44, 64); g.fillStyle = '#444'; g.beginPath(); g.arc(0, -44, 12, 0, 7); g.arc(0, -16, 10, 0, 7); g.fill(); break; }
  }
  g.restore();
}
// ---------- decoração ----------
function desenharDeco(g, d) {
  g.save(); g.translate(d.x, d.y);
  switch (d.t) {
    case 'arvore': { const s = d.s || 1; if (d.selva) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(8, 10, 30 * s, 0, 7); g.fill(); g.fillStyle = '#1e5c2a'; g.beginPath(); g.arc(0, 0, 30 * s, 0, 7); g.fill(); g.fillStyle = '#2e7d32'; g.beginPath(); g.arc(-7 * s, -7 * s, 18 * s, 0, 7); g.fill(); break; } g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(8, 10, 26 * s, 0, 7); g.fill(); g.fillStyle = '#2e6b2a'; g.beginPath(); g.arc(0, 0, 26 * s, 0, 7); g.fill(); g.fillStyle = '#3f8a37'; g.beginPath(); g.arc(-6 * s, -6 * s, 16 * s, 0, 7); g.fill(); break; }
    case 'palmeira': { const s = d.s || 1; if (d.quebrado) { g.rotate(d.aQ || 0); g.fillStyle = '#7a5230'; g.fillRect(0, -4, 60 * s, 8); g.strokeStyle = '#2f8f3a'; g.lineWidth = 6; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(60 * s, 0); g.lineTo(60 * s + 24, k * 10); g.stroke(); } break; } g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.arc(10, 12, 22 * s, 0, 7); g.fill(); g.strokeStyle = '#2f8f3a'; g.lineWidth = 7 * s; g.lineCap = 'round'; for (let k = 0; k < 6; k++) { const a = k * 1.05 + d.x * 0.01; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a + 0.3) * 18 * s, Math.sin(a + 0.3) * 18 * s, Math.cos(a) * 30 * s, Math.sin(a) * 30 * s); g.stroke(); } g.fillStyle = '#7a5230'; g.beginPath(); g.arc(0, 0, 6 * s, 0, 7); g.fill(); break; }
    case 'cacto': { const s = d.s || 1; if (d.quebrado) { g.fillStyle = '#4f7d3a'; g.rotate(d.aQ || 0); g.fillRect(0, -4, 30 * s, 9 * s); break; } g.fillStyle = '#4f7d3a'; g.fillRect(-5 * s, -18 * s, 10 * s, 36 * s); g.fillRect(-16 * s, -6 * s, 12 * s, 7 * s); g.fillRect(-16 * s, -14 * s, 6 * s, 10 * s); g.fillRect(5 * s, 0, 11 * s, 6 * s); g.fillRect(11 * s, -10 * s, 6 * s, 12 * s); break; }
    case 'conteiner': { g.fillStyle = d.cor; g.fillRect(-55, -20, 110, 40); g.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 9; k++) g.fillRect(-50 + k * 12, -18, 3, 36); break; }
    case 'rampa': { g.rotate(d.a); g.fillStyle = '#9aa0a6'; g.fillRect(-60, -40, 120, 80); g.fillStyle = '#b8bec4'; for (let k = 0; k < 6; k++) g.fillRect(-60 + k * 20, -40, 10, 80); g.fillStyle = '#e74c3c'; g.fillRect(50, -40, 10, 80); break; }
    case 'bowl': { g.fillStyle = '#80868c'; g.beginPath(); g.ellipse(0, 0, 120, 80, 0, 0, 7); g.fill(); g.fillStyle = '#6b7176'; g.beginPath(); g.ellipse(0, 0, 90, 55, 0, 0, 7); g.fill(); g.fillStyle = '#ff6ec7'; g.font = 'bold 20px system-ui'; g.textAlign = 'center'; g.fillText('SIMAS SK8', 0, 7); break; }
    case 'mesa': { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(4, 5, 16, 0, 7); g.fill(); g.fillStyle = '#ecf0f1'; g.beginPath(); g.arc(0, 0, 15, 0, 7); g.fill(); g.fillStyle = '#6e4b2a'; g.beginPath(); g.arc(0, 0, 4, 0, 7); g.fill(); g.fillStyle = '#7b241c'; for (const a of [0, 2.1, 4.2]) { g.beginPath(); g.arc(Math.cos(a) * 22, Math.sin(a) * 22, 6, 0, 7); g.fill(); } break; }
    case 'tapete': { g.fillStyle = '#b3134f'; g.fillRect(-26, -40, 52, 80); g.fillStyle = '#ffd23f'; g.fillRect(-26, -40, 52, 4); g.fillRect(-26, 36, 52, 4); for (const s of [-1, 1]) { g.fillStyle = '#c9a227'; g.beginPath(); g.arc(s * 38, -30, 5, 0, 7); g.fill(); g.fillRect(s * 38 - 1, -30, 2, 60); } break; }
    case 'poste': {
      if (d.quebrado) { g.rotate(d.aQ || 0); g.fillStyle = '#566573'; g.fillRect(0, -3, 70, 6); g.fillStyle = '#f7dc6f'; g.fillRect(66, -5, 8, 10); break; }
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(3, 3, 6, 0, 7); g.fill();
      g.rotate(d.a || 0); g.fillStyle = '#566573'; g.fillRect(0, -2, 34, 4); g.fillStyle = 'rgba(255,240,180,.12)'; g.beginPath(); g.arc(34, 0, 30, 0, 7); g.fill(); g.fillStyle = '#fdf2c0'; g.fillRect(30, -4, 8, 8);
      g.rotate(-(d.a || 0)); g.fillStyle = '#34495e'; g.beginPath(); g.arc(0, 0, 5, 0, 7); g.fill(); break; }
    case 'hidrante': {
      if (d.quebrado) { g.fillStyle = '#7b241c'; g.fillRect(-4, -4, 8, 8); if (d.jorra > 0) { d.jorra -= 1 / 60; for (let k = 0; k < 8; k++) { const a = Math.random() * 7, r = Math.random() * 34; g.fillStyle = 'rgba(160,210,255,.7)'; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r - 6, 3 + Math.random() * 3, 0, 7); g.fill(); } } break; }
      g.fillStyle = '#c0392b'; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); g.fillStyle = '#e74c3c'; g.beginPath(); g.arc(-1, -1, 4, 0, 7); g.fill(); g.fillStyle = '#922b21'; g.fillRect(-10, -2, 20, 4); break; }
    case 'lixeira': {
      if (d.quebrado) { g.rotate(d.aQ || 0); g.fillStyle = '#1e8449'; g.fillRect(4, -7, 22, 14); g.fillStyle = '#7f8c8d'; for (let k = 0; k < 5; k++) g.fillRect(28 + k * 7, (k % 2 ? 5 : -6), 5, 4); break; }
      g.fillStyle = '#1e8449'; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); g.fillStyle = '#145a32'; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill(); break; }
    case 'placa': {
      if (d.quebrado) { g.rotate(d.aQ || 0); g.fillStyle = '#7f8c8d'; g.fillRect(0, -2, 40, 4); g.fillStyle = '#c0392b'; g.fillRect(36, -10, 18, 20); break; }
      g.fillStyle = '#7f8c8d'; g.beginPath(); g.arc(0, 0, 4, 0, 7); g.fill();
      g.font = 'bold 9px system-ui'; const w = Math.min(120, g.measureText(d.txt).width + 10); g.fillStyle = d.txt === 'PARE' ? '#c0392b' : '#1e8449'; g.fillRect(-w / 2, -26, w, 16); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(d.txt, 0, -14); break; }
    case 'pedra': { const s = d.s || 1; g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(6, 8, 26 * s, 18 * s, 0, 0, 7); g.fill(); g.fillStyle = '#7f8c8d'; g.beginPath(); g.ellipse(0, 0, 26 * s, 20 * s, 0.3, 0, 7); g.fill(); g.fillStyle = '#95a5a6'; g.beginPath(); g.ellipse(-6 * s, -6 * s, 12 * s, 8 * s, 0.3, 0, 7); g.fill(); break; }
    case 'navio': { g.fillStyle = d.cor; rr(g, -180, -46, 360, 92, 40); g.fill(); g.fillStyle = '#ecf0f1'; g.fillRect(60, -30, 70, 60); g.fillStyle = '#2c3e50'; g.fillRect(80, -20, 12, 40); for (let k = 0; k < 4; k++) { g.fillStyle = ['#c0392b', '#d4ac0d', '#1e8449', '#7d3c98'][k]; g.fillRect(-150 + k * 50, -30, 44, 60); } break; }
    case 'banco': { if (d.quebrado) { g.rotate(d.aQ || 0); g.fillStyle = '#6e4b2a'; g.fillRect(-10, -12, 18, 6); g.fillRect(6, 4, 22, 6); break; } g.fillStyle = '#6e4b2a'; g.fillRect(-22, -6, 44, 12); g.fillStyle = '#4a3219'; g.fillRect(-22, -9, 44, 4); break; }
    case 'curral': { g.strokeStyle = '#6e4b2a'; g.lineWidth = 5; g.strokeRect(-d.w / 2, -d.h / 2, d.w, d.h); for (let k = 0; k < 3; k++) { const bx = -d.w / 3 + k * d.w / 3, by = (k % 2 ? 1 : -1) * d.h / 6; g.fillStyle = '#f5f5f5'; g.beginPath(); g.ellipse(bx, by, 16, 10, k, 0, 7); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(bx + 4, by - 2, 4, 0, 7); g.fill(); } break; }
    case 'guarda_sol': { g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.arc(8, 8, 34, 0, 7); g.fill(); g.fillStyle = d.cor; g.beginPath(); g.arc(0, 0, 34, 0, 7); g.fill(); g.fillStyle = '#fff'; for (let k = 0; k < 6; k += 2) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 34, k * Math.PI / 3, (k + 1) * Math.PI / 3); g.fill(); } g.fillStyle = '#e67e22'; g.fillRect(30, 10, 30, 14); break; }
    case 'campinho': { g.fillStyle = '#3d8b3d'; g.fillRect(-d.w / 2, -d.h / 2, d.w, d.h); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(-d.w / 2 + 4, -d.h / 2 + 4, d.w - 8, d.h - 8); g.beginPath(); g.moveTo(0, -d.h / 2 + 4); g.lineTo(0, d.h / 2 - 4); g.stroke(); g.beginPath(); g.arc(0, 0, 22, 0, 7); g.stroke(); g.strokeRect(-d.w / 2 + 4, -18, 14, 36); g.strokeRect(d.w / 2 - 18, -18, 14, 36); break; }
    case 'piscina': { g.fillStyle = '#ecf0f1'; g.fillRect(-28, -20, 56, 40); g.fillStyle = '#48c9e8'; g.fillRect(-24, -16, 48, 32); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-18, -8, 20, 3); break; }
    case 'bomba': { for (let k = -1; k <= 1; k += 2) { g.fillStyle = '#c0392b'; g.fillRect(k * 40 - 10, -14, 20, 28); g.fillStyle = '#f1c40f'; g.fillRect(k * 40 - 6, -10, 12, 8); } g.fillStyle = 'rgba(231,76,60,.25)'; g.fillRect(-80, -50, 160, 100); break; }
    case 'sucata': { g.fillStyle = '#5d4037'; g.beginPath(); g.moveTo(-50, 30); g.lineTo(-30, -30); g.lineTo(20, -40); g.lineTo(50, 30); g.closePath(); g.fill(); g.fillStyle = '#795548'; g.fillRect(-30, -10, 30, 18); g.fillStyle = '#8d6e63'; g.fillRect(5, -25, 26, 20); break; }
    case 'cadeira': { g.fillStyle = '#7b4a24'; g.fillRect(-16, -14, 32, 28); g.strokeStyle = '#5a3418'; g.lineWidth = 4; g.beginPath(); g.arc(0, 14, 22, 0.2, Math.PI - 0.2); g.stroke(); break; }
    case 'barraca': { g.fillStyle = '#e74c3c'; g.beginPath(); g.arc(0, 0, 70, 0, 7); g.fill(); g.fillStyle = '#fff'; for (let k = 0; k < 8; k += 2) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 70, k * Math.PI / 4, (k + 1) * Math.PI / 4); g.fill(); } g.fillStyle = '#2ecc71'; g.font = 'bold 13px system-ui'; g.textAlign = 'center'; g.fillText('🌿 NAUJ TOUR', 0, 95); break; }
    case 'palco': { g.fillStyle = '#1a1a2e'; g.fillRect(-180, -60, 360, 120); const h = (W.tempo * 3) % 1; g.fillStyle = `hsl(${(W.tempo * 120) % 360},90%,55%)`; g.fillRect(-180, 50, 360, 10); g.font = 'bold 26px system-ui'; g.textAlign = 'center'; g.fillText('BAILE DO MECO', 0, 10); g.fillStyle = '#fff'; g.font = '13px system-ui'; g.fillText('BH É QUEM? BH É NÓIS', 0, 34); break; }
    case 'caixa_som': { const p = 1 + Math.max(0, Math.sin(W.tempo * 13)) * 0.12; g.scale(p, p); g.fillStyle = '#111'; g.fillRect(-22, -30, 44, 60); g.fillStyle = '#444'; g.beginPath(); g.arc(0, -10, 12, 0, 7); g.arc(0, 16, 9, 0, 7); g.fill(); break; }
  }
  g.restore();
}

// ---------- prédios em falso 3D ----------
function alturaPredio(p) { return Math.max(26, p.alt * 100) / INCL; }   // em unidades do mundo (o chão é achatado)
function desenharPredio(g, p) {
  const Hw = alturaPredio(p);
  const x0 = p.x, y0 = p.y, x1 = p.x + p.w, y1 = p.y + p.h;
  const rx0 = x0, ry0 = y0 - Hw, rx1 = x1, ry1 = y1 - Hw;
  // fachada da frente (a câmera é inclinada: só ela aparece)
  const parede = escurecer(p.cor, 0.7);
  const gr = g.createLinearGradient(0, ry1, 0, y1); gr.addColorStop(0, escurecer(p.cor, 0.85)); gr.addColorStop(1, escurecer(p.cor, 0.55));
  g.fillStyle = gr; g.fillRect(x0, ry1, p.w, Hw);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x1 - 6, ry1, 6, Hw);
  // janelas
  if (!p.galpao) {
    const andares = Math.max(1, Math.floor(Hw * INCL / 26)), cols = Math.max(1, Math.floor(p.w / 34));
    for (let a2 = 0; a2 < andares; a2++) for (let c2 = 0; c2 < cols; c2++) {
      const wx = x0 + (c2 + 0.5) * p.w / cols - 8, wy = ry1 + (a2 + 0.25) * Hw / andares, wh = Hw / andares * 0.5;
      const acesa = ((p.x / T | 0) * 7 + a2 * 3 + c2 * 5) % 4 !== 0;
      g.fillStyle = acesa ? 'rgba(255,225,140,.55)' : 'rgba(30,40,60,.7)'; g.fillRect(wx, wy, 16, wh);
      g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(wx, wy, 16, Math.max(1, wh * 0.18));
    }
  } else { g.fillStyle = 'rgba(0,0,0,.25)'; for (let xx = x0 + 10; xx < x1 - 10; xx += 22) g.fillRect(xx, ry1 + 4, 3, Hw - 8); }
  // porta na frente dos lugares importantes
  if (p.placa) { const dx = (x0 + x1) / 2; g.fillStyle = '#1b1b1b'; g.fillRect(dx - 18, y1 - 34 / INCL, 36, 34 / INCL); g.fillStyle = p.neon || '#ffd23f'; g.fillRect(dx - 22, y1 - 38 / INCL, 44, 4 / INCL); }
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.strokeRect(x0 + 1, ry1, p.w - 2, Hw);
  // telhado
  g.fillStyle = p.teto; g.fillRect(rx0, ry0, p.w, p.h);
  g.strokeStyle = escurecer(p.teto, 0.7); g.lineWidth = 3; g.strokeRect(rx0 + 1.5, ry0 + 1.5, p.w - 3, p.h - 3);
  if (p.tijolo) { g.fillStyle = 'rgba(0,0,0,.12)'; for (let yy = ry0 + 6; yy < ry1 - 4; yy += 12) g.fillRect(rx0 + 4, yy, p.w - 8, 2); if ((p.x + p.y) % 3 === 0) { g.fillStyle = '#2b78c5'; g.fillRect(rx0 + p.w * 0.6, ry0 + 6, 18, 18); } }
  else if (p.galpao) { g.fillStyle = 'rgba(255,255,255,.12)'; for (let xx = rx0 + 8; xx < rx1 - 4; xx += 16) g.fillRect(xx, ry0 + 4, 6, p.h - 8); }
  else if (p.w > T * 3 && p.alt > 0.6 && !p.pagode) {
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(rx0 + p.w * 0.15, ry0 + p.h * 0.15, p.w * 0.25, p.h * 0.2);
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(rx0 + p.w * 0.55, ry0 + p.h * 0.6, p.w * 0.3, p.h * 0.25);
  }
  else if (p.pagode) { for (let k = 0; k < 3; k++) { const m = 10 + k * 16; g.fillStyle = k % 2 ? '#7b241c' : '#a93226'; g.fillRect(rx0 + m, ry0 + m, p.w - m * 2, p.h - m * 2); g.strokeStyle = '#f1c40f'; g.lineWidth = 2; g.strokeRect(rx0 + m, ry0 + m, p.w - m * 2, p.h - m * 2); } }
  else if (p.palha) { g.fillStyle = '#c9a66b'; g.beginPath(); g.moveTo(rx0, ry0); g.lineTo(rx1, ry0); g.lineTo(rx0 + p.w / 2, ry0 + p.h / 2); g.closePath(); g.fill(); g.fillStyle = '#b08850'; g.beginPath(); g.moveTo(rx0, ry1); g.lineTo(rx1, ry1); g.lineTo(rx0 + p.w / 2, ry0 + p.h / 2); g.closePath(); g.fill(); }
  else if (p.caixa) { g.fillStyle = '#2b78c5'; g.fillRect(rx0 + 6, ry0 + 6, 18, 18); g.fillStyle = '#1b4f72'; g.fillRect(rx0 + 6, ry0 + 6, 18, 4); }
  if (p.estilo !== undefined && !p.placa && p.w >= T * 2 && p.h >= T * 2) {
    const ex = (p.x * 7 + p.y * 3) % 5;
    if (p.estilo === 0) { g.fillStyle = '#9aa0a6'; for (let k = 0; k < 3; k++) { g.fillRect(rx0 + 12 + k * 26, ry0 + 12, 18, 14); g.fillStyle = '#6b7176'; g.fillRect(rx0 + 15 + k * 26, ry0 + 15, 12, 8); g.fillStyle = '#9aa0a6'; } }
    else if (p.estilo === 1 && p.w >= T * 3 && p.h >= T * 3) { const cx = rx0 + p.w / 2, cy = ry0 + p.h / 2; g.strokeStyle = '#f1c40f'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 38, 0, 7); g.stroke(); g.fillStyle = '#f1c40f'; g.font = '900 34px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', cx, cy + 2); g.textBaseline = 'alphabetic'; }
    else if (p.estilo === 2) { g.fillStyle = '#8e6e53'; g.beginPath(); g.arc(rx1 - 26, ry0 + 26, 16, 0, 7); g.fill(); g.strokeStyle = '#5d4037'; g.lineWidth = 3; g.stroke(); }
    else { g.fillStyle = 'rgba(130,190,230,.35)'; g.fillRect(rx0 + 10, ry0 + 10, p.w - 20, p.h - 20); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; for (let xx = rx0 + 10; xx < rx1 - 10; xx += 20) { g.beginPath(); g.moveTo(xx, ry0 + 10); g.lineTo(xx, ry1 - 10); g.stroke(); } }
    if (ex === 0) { g.fillStyle = '#c0392b'; g.beginPath(); g.arc(rx1 - 10, ry1 - 10, 4, 0, 7); g.fill(); }
  }
  if (p.antena) { const ax = rx0 + p.w * 0.75, ay = ry0 + p.h * 0.3; g.strokeStyle = '#bdc3c7'; g.lineWidth = 3; g.beginPath(); g.moveTo(ax - 14, ay + 14); g.lineTo(ax, ay - 30); g.lineTo(ax + 14, ay + 14); g.moveTo(ax - 8, ay); g.lineTo(ax + 8, ay); g.stroke(); g.fillStyle = (W.tempo * 2 | 0) % 2 ? '#ff2b2b' : '#5a0a0a'; g.beginPath(); g.arc(ax, ay - 32, 5, 0, 7); g.fill(); }
  if (p.cruz) { g.fillStyle = '#e74c3c'; const cx = rx0 + p.w / 2, cy = ry0 + p.h / 2; g.fillRect(cx - 40, cy - 12, 80, 24); g.fillRect(cx - 12, cy - 40, 24, 80); }
  if (p.placa) {
    const cx = rx0 + p.w / 2, cy = ry0 + p.h / 2 + (p.cruz ? 70 : 0);
    g.font = `900 ${Math.min(30, p.w / p.placa.length * 1.5)}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (p.neon) { g.shadowColor = p.neon; g.shadowBlur = 14; g.fillStyle = p.neon; } else g.fillStyle = '#fff';
    g.fillText(p.placa, cx, cy); g.shadowBlur = 0; g.textBaseline = 'alphabetic';
  }
}
function janelas(g, x0, y1, rx0, ry1, x1, rx1, p) {
  if (p.alt < 0.5) return;
  const n = Math.max(2, Math.round(p.alt * 4)), m = Math.max(2, Math.round(p.w / 40));
  g.fillStyle = 'rgba(255,230,140,.35)';
  for (let a = 1; a < n; a++) for (let b = 0; b < m; b++) {
    if (((p.x / T | 0) + a * 3 + b * 7) % 4 === 0) continue;
    const t = a / n, u0 = (b + 0.25) / m, u1 = (b + 0.75) / m;
    const ax = lerp(x0, rx0, t), ay = lerp(y1, ry1, t), bx = lerp(x1, rx1, t);
    const t2 = (a + 0.5) / n, cy = lerp(y1, ry1, t2), cx0 = lerp(x0, rx0, t2), cx1 = lerp(x1, rx1, t2);
    g.beginPath(); g.moveTo(lerp(ax, bx, u0), ay); g.lineTo(lerp(ax, bx, u1), ay); g.lineTo(lerp(cx0, cx1, u1), cy); g.lineTo(lerp(cx0, cx1, u0), cy); g.fill();
  }
}

// ---------- quadro inteiro ----------
function desenharMundo() {
  const g = ctx, z = cam.zoom, K = INCL;
  const tx = (Math.random() - 0.5) * cam.tremor, ty = (Math.random() - 0.5) * cam.tremor;
  // câmera inclinada: o chão é achatado na vertical (y * INCL)
  g.setTransform(DPR * z, 0, 0, DPR * z * K, DPR * (VW / 2 + tx), DPR * (VH / 2 + ty));
  g.translate(-cam.x, -cam.y);
  const vx0 = cam.x - VW / 2 / z - 200, vy0 = cam.y - VH / 2 / (z * K) - 200, vx1 = cam.x + VW / 2 / z + 200, vy1 = cam.y + VH / 2 / (z * K) + 420;
  const dentro = (x, y, m = 0) => x > vx0 - m && x < vx1 + m && y > vy0 - m && y < vy1 + m;
  const j = W.jog;
  // chão
  const S = CH * T;
  for (let cy = Math.floor(vy0 / S); cy <= Math.floor(vy1 / S); cy++) for (let cx = Math.floor(vx0 / S); cx <= Math.floor(vx1 / S); cx++) {
    if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) { g.fillStyle = '#1d4f8f'; g.fillRect(cx * S, cy * S, S + 1, S + 1); continue; }
    g.drawImage(pegaChunk(cx, cy), cx * S, cy * S);
  }
  // manchas
  for (const m of W.manchas) {
    if (!dentro(m.x, m.y)) continue;
    if (m.t === 'sangue') { g.fillStyle = 'rgba(140,0,0,.7)'; g.beginPath(); g.ellipse(m.x, m.y, m.r, m.r * 0.7, m.a, 0, 7); g.fill(); }
    else if (m.t === 'queimado') { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(m.x, m.y, m.r, 0, 7); g.fill(); }
    else if (m.t === 'pneu') { g.save(); g.translate(m.x, m.y); g.rotate(m.a); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-4, -18, 8, 6); g.fillRect(-4, 12, 8, 6); g.restore(); }
  }
  const decoVis = []; decoNaArea(vx0 - 200, vy0 - 200, vx1 + 200, vy1 + 200, d => decoVis.push(d));
  for (const d of decoVis) if (!DECO_EM_PE.has(d.t) || d.quebrado) desenharDeco(g, d);
  // faróis nos cruzamentos
  const corF = f => f === 'verde' ? '#2ecc71' : f === 'amarelo' ? '#f1c40f' : '#e74c3c';
  for (let ky = Math.max(1, Math.floor(vy0 / T / GRID)); ky <= Math.min(15, Math.ceil(vy1 / T / GRID)); ky++) for (let kx = Math.max(1, Math.floor(vx0 / T / GRID)); kx <= Math.min(15, Math.ceil(vx1 / T / GRID)); kx++) {
    if (!cruzamentoComFarol(kx, ky)) continue;
    const x0 = GRID * kx * T, y0 = GRID * ky * T, S2 = 2 * T, fv = corF(faroFase(true)), fh = corF(faroFase(false));
    for (const [px, py, c] of [[x0 - 10, y0 - 10, fv], [x0 + S2 + 10, y0 + S2 + 10, fv], [x0 + S2 + 10, y0 - 10, fh], [x0 - 10, y0 + S2 + 10, fh]]) {
      g.save(); g.translate(px, py); g.scale(1, 1 / K);
      g.fillStyle = '#333'; g.fillRect(-2, -34, 4, 34); g.fillStyle = '#222'; g.fillRect(-7, -48, 14, 16); g.fillStyle = c; g.beginPath(); g.arc(0, -40, 5, 0, 7); g.fill(); g.fillStyle = c + '44'; g.beginPath(); g.arc(0, -40, 10, 0, 7); g.fill();
      g.restore();
    }
  }
  desenharMarcadores(g); desenharBaus(g);
  for (const p of W.peds) if (p.morto && !p.dentroCarro && dentro(p.x, p.y)) desenharPessoa(g, p);
  // ---- tudo que fica de pé, na ordem de quem tá mais "atrás" (y menor) pra frente ----
  const fila = [];
  for (const it of W.itens) if (dentro(it.x, it.y)) fila.push([it.y, () => { g.save(); g.translate(it.x, it.y); g.scale(1, 1 / K); g.translate(0, -14); desenharItem(g, { ...it, x: 0, y: 0 }); g.restore(); }]);
  for (const c of W.carros) if (dentro(c.x, c.y)) fila.push([c.y, () => desenharCarro(g, c)]);
  for (const p of W.peds) if (!p.morto && !p.dentroCarro && !p.escondido && dentro(p.x, p.y)) fila.push([p.y, () => desenharPessoa(g, p, { arma: p.armaVisivel, escala: p.rosto || p.nome ? 1.1 : 1 })]);
  if (!j.carro && !j.morto) fila.push([j.y, () => desenharPessoa(g, j, { arma: j.nadando ? null : j.arma, nomes: false, anel: true, escala: 1.3 })]);
  if (!j.carro && j.morto) fila.push([j.y, () => desenharPessoa(g, { ...j, morto: true })]);
  for (const d of decoVis) if (DECO_EM_PE.has(d.t) && !d.quebrado) fila.push([d.y, () => desenharDecoEmPe(g, d)]);
  for (const ch of W.chefes) fila.push([ch.y || (ch.carro && ch.carro.y) || 0, () => ch.desenhar && ch.desenhar(g)]);
  if (ONLINE.ativo) fila.push([-1e9, () => { }]);
  // prédios: o que tiver na frente do jogador e cobrindo ele fica transparente
  const al = j.carro || j;
  for (const p of predios) {
    if (p.x + p.w < vx0 - 100 || p.x > vx1 + 100 || p.y + p.h < vy0 - 200 || p.y - alturaPredio(p) > vy1 + 100) continue;
    const cobre = al.x > p.x - 20 && al.x < p.x + p.w + 20 && al.y < p.y + p.h + 10 && al.y > p.y - alturaPredio(p) - 30;
    fila.push([p.y + p.h, () => { if (cobre) { g.save(); g.globalAlpha = 0.38; desenharPredio(g, p); g.restore(); } else desenharPredio(g, p); }]);
  }
  fila.sort((a, b) => a[0] - b[0]);
  for (const [, f] of fila) f();
  ONLINE.desenhar(g);
  // balas (na altura do peito)
  g.save(); g.translate(0, -ALT_TIRO / K);
  for (const b of W.balas) { const rem = b.dono && b.dono !== j && !b.dono.remoto ? '#ffb3a0' : '#fff3a0'; g.strokeStyle = rem; g.lineWidth = 3; g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x - b.vx * 0.022, b.y - b.vy * 0.022); g.stroke(); }
  for (const c of W.chamas) { const k = c.vida / 0.42; g.fillStyle = `rgba(255,${Math.floor(80 + 150 * k)},0,${0.8 * k})`; g.beginPath(); g.arc(c.x, c.y, 8 + (1 - k) * 16, 0, 7); g.fill(); }
  for (const f of W.foguetes) { g.save(); g.translate(f.x, f.y); g.rotate(Math.atan2(f.vy, f.vx)); g.fillStyle = '#556b2f'; g.fillRect(-12, -4, 24, 8); g.fillStyle = '#ff8c00'; g.beginPath(); g.arc(-14, 0, 5 + Math.random() * 3, 0, 7); g.fill(); g.restore(); }
  g.restore();
  for (const f of W.fogos) { const k = Math.min(1, f.vida); for (let i = 0; i < 6; i++) { const a = i + W.tempo * 3, rr2 = f.r * (0.3 + 0.5 * ((i * 37) % 10) / 10); g.fillStyle = `rgba(255,${120 + i * 20},0,${0.55 * k})`; g.beginPath(); g.arc(f.x + Math.cos(a) * rr2, f.y + Math.sin(a * 1.3) * rr2, 14 + Math.random() * 10, 0, 7); g.fill(); } }
  for (const o of W.jogados) { const alt = Math.sin(Math.min(1, (o.t === 'granada' ? 1.6 : 0.75) - o.vida) * Math.PI) * 30; g.save(); g.translate(o.x, o.y - (12 + alt) / K); g.scale(1, 1 / K); g.rotate(o.gira); if (o.t === 'granada') { g.fillStyle = '#4a5d23'; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); g.fillStyle = '#222'; g.fillRect(-2, -10, 4, 4); } else { g.fillStyle = '#1e8449'; g.fillRect(-4, -9, 8, 16); g.fillStyle = '#ff8c00'; g.beginPath(); g.arc(0, -11, 4 + Math.random() * 2, 0, 7); g.fill(); } g.restore(); }
  // efeitos
  for (const e of W.efeitos) {
    if (e.x !== undefined && !dentro(e.x, e.y)) continue;
    const k = e.vida / e.max;
    if (e.t === 'explosao') {
      const r = e.r * (1.2 - k * 0.6);
      g.save(); g.translate(e.x, e.y); g.scale(1, 1 / K);
      const gr = g.createRadialGradient(0, -r * 0.3, 0, 0, -r * 0.3, r); gr.addColorStop(0, `rgba(255,255,200,${k})`); gr.addColorStop(0.4, `rgba(255,140,0,${k})`); gr.addColorStop(1, 'rgba(120,20,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, -r * 0.3, r, 0, 7); g.fill(); g.restore();
    } else if (e.t === 'fumaca') { g.fillStyle = e.escura ? `rgba(30,30,30,${k * 0.5})` : `rgba(90,90,90,${k * 0.45})`; g.beginPath(); g.arc(e.x, e.y - (1 - k) * 40 / K, e.r, 0, 7); g.fill(); }
    else if (e.t === 'onda') { g.strokeStyle = `rgba(255,255,255,${k * 0.6})`; g.lineWidth = 2; g.beginPath(); g.arc(e.x, e.y, 10 + (1 - k) * 30, 0, 7); g.stroke(); }
    else if (e.t === 'clarao') { g.fillStyle = 'rgba(255,240,150,.9)'; g.beginPath(); g.arc(e.x, e.y - ALT_TIRO / K, 10, 0, 7); g.fill(); }
    else if (e.t === 'golpe') { const k2 = e.vida / e.max; g.strokeStyle = `rgba(255,255,255,${k2})`; g.lineWidth = 4; g.beginPath(); g.arc(e.x - Math.cos(e.a) * 14, e.y - ALT_TIRO / K - Math.sin(e.a) * 14, 20, e.a - 0.9 + (1 - k2), e.a + 0.9 - (1 - k2) * 0.4); g.stroke(); }
    else if (e.t === 'faisca') { g.fillStyle = '#ffd23f'; for (let i = 0; i < 4; i++) g.fillRect(e.x + rnd(-8, 8), e.y - ALT_TIRO / K + rnd(-8, 8), 3, 3); }
    else if (e.t === 'sangue') { g.fillStyle = `rgba(170,0,0,${k})`; for (let i = 0; i < 5; i++) g.fillRect(e.x + rnd(-10, 10), e.y - ALT_TIRO / K + rnd(-10, 10), 3, 3); }
    else if (e.t === 'raio') { g.strokeStyle = `rgba(0,229,255,${k})`; g.lineWidth = 4; g.beginPath(); g.moveTo(e.x, e.y); for (let i = 1; i <= 6; i++) g.lineTo(lerp(e.x, e.x2, i / 6) + (i < 6 ? rnd(-14, 14) : 0), lerp(e.y, e.y2, i / 6) + (i < 6 ? rnd(-14, 14) : 0)); g.stroke(); }
    else if (e.t === 'anel') { g.strokeStyle = `rgba(0,229,255,${k})`; g.lineWidth = 8 * k + 2; g.beginPath(); g.arc(e.x, e.y, e.r * (1 - k) + 20, 0, 7); g.stroke(); }
    else if (e.t === 'laser') { g.strokeStyle = `rgba(255,30,60,${k})`; g.lineWidth = 10 * k + 2; g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(e.x2, e.y2); g.stroke(); g.strokeStyle = `rgba(255,255,255,${k})`; g.lineWidth = 3; g.stroke(); }
    else if (e.t === 'mira') { g.strokeStyle = `rgba(255,30,60,${0.4 + 0.6 * Math.abs(Math.sin(W.tempo * 12))})`; g.lineWidth = 3; g.beginPath(); g.arc(e.x, e.y, e.r, 0, 7); g.stroke(); g.beginPath(); g.moveTo(e.x - e.r, e.y); g.lineTo(e.x + e.r, e.y); g.moveTo(e.x, e.y - e.r); g.lineTo(e.x, e.y + e.r); g.stroke(); }
  }
  for (const e of W.efeitos) if (e.t === 'texto' && dentro(e.x, e.y)) { g.globalAlpha = Math.min(1, e.vida / e.max * 2); rotuloEmPe(g, e.txt, e.x, e.y, 30, e.cor, 'bold 15px system-ui'); g.globalAlpha = 1; }
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (const e of W.efeitos) if (e.t === 'flashVermelho') { g.fillStyle = `rgba(255,0,0,${e.vida / e.max * 0.35})`; g.fillRect(0, 0, VW, VH); }
  // mira do mouse
  if (MOUSE.used && !ehToque() && !j.carro && !j.morto && j.arma !== 'punho') { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2; g.beginPath(); g.arc(MOUSE.x, MOUSE.y, 9, 0, 7); g.moveTo(MOUSE.x - 14, MOUSE.y); g.lineTo(MOUSE.x - 5, MOUSE.y); g.moveTo(MOUSE.x + 5, MOUSE.y); g.lineTo(MOUSE.x + 14, MOUSE.y); g.moveTo(MOUSE.x, MOUSE.y - 14); g.lineTo(MOUSE.x, MOUSE.y - 5); g.moveTo(MOUSE.x, MOUSE.y + 5); g.lineTo(MOUSE.x, MOUSE.y + 14); g.stroke(); }
}
// tela -> mundo (pra mira do mouse): mira no peito
function telaPraMundo(sx, sy) { return { x: (sx - VW / 2) / cam.zoom + cam.x, y: (sy - VH / 2) / (cam.zoom * INCL) + cam.y + ALT_TIRO / INCL }; }
