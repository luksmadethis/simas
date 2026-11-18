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

// ---------- gente ----------
function desenharPessoa(g, p, opt = {}) {
  const { x, y } = p, a = p.a || 0, s = (opt.escala || 1) * 1.35;
  g.save(); g.translate(x, y);
  if (p.galinha) {
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(3, 5, 14, 10, 0, 0, 7); g.fill();
    g.rotate(a); const pa = Math.sin(p.anda || 0) * 4;
    g.fillStyle = '#f39c12'; g.fillRect(-4 + pa, -6, 8, 2); g.fillRect(-4 - pa, 4, 8, 2);
    g.fillStyle = '#fdfefe'; g.beginPath(); g.ellipse(-3, 0, 14, 10, 0, 0, 7); g.fill(); g.strokeStyle = '#bbb'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = '#ecf0f1'; g.beginPath(); g.ellipse(-6, -8, 8, 4, -0.3, 0, 7); g.ellipse(-6, 8, 8, 4, 0.3, 0, 7); g.fill();
    g.fillStyle = '#e74c3c'; g.fillRect(14, -3, 6, 6); g.fillStyle = '#f39c12'; g.beginPath(); g.moveTo(20, -3); g.lineTo(27, 0); g.lineTo(20, 3); g.fill();
    g.rotate(-a);
    const im = ROSTOS.gelado; const hx = Math.cos(a) * 12, hy = Math.sin(a) * 12;
    if (im && im.complete && im.naturalWidth) { g.save(); g.beginPath(); g.arc(hx, hy, 9, 0, 7); g.clip(); g.drawImage(im, hx - 9, hy - 9, 18, 18); g.restore(); g.strokeStyle = '#e74c3c'; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, 9, 0, 7); g.stroke(); }
    g.restore();
    if (dist(x, y, W.jog.x, W.jog.y) < 520) { g.font = 'bold 10px system-ui'; g.textAlign = 'center'; g.fillStyle = '#f39c12'; g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText('Galado 🐔', x, y - 22); g.fillText('Galado 🐔', x, y - 22); }
    return;
  }
  if (p.morto) {
    g.rotate(a); g.fillStyle = p.calca || '#2c3e50'; g.fillRect(-20 * s, -5 * s, 10 * s, 10 * s);
    g.fillStyle = p.camisa; g.fillRect(-12 * s, -7 * s, 18 * s, 14 * s); g.fillStyle = p.pele; g.beginPath(); g.arc(10 * s, 0, 6 * s, 0, 7); g.fill(); g.restore(); return;
  }
  if (opt.anel) { const pu = 1 + Math.sin(W.tempo * 5) * 0.1; g.strokeStyle = 'rgba(255,210,63,.85)'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 2, 20 * s * pu, 16 * s * pu, 0, 0, 7); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(4, 6, 12 * s, 9 * s, 0, 0, 7); g.fill();
  g.rotate(a);
  if (p.skate || p.rodaAtiva === 'skate') { g.fillStyle = '#2d3436'; rr(g, -17 * s, -6 * s, 34 * s, 12 * s, 6 * s); g.fill(); g.fillStyle = '#ff6ec7'; g.fillRect(-12 * s, -1.5 * s, 24 * s, 3 * s); g.fillStyle = '#f1c40f'; for (const [wx, wy] of [[-11, -7], [-11, 5], [9, -7], [9, 5]]) g.fillRect(wx * s, wy * s, 3 * s, 2.5 * s); }
  const passo = (p.skate || p.rodaAtiva) ? 0 : Math.sin(p.anda || 0) * 6 * s;
  // pernas
  g.fillStyle = p.calca || '#2c3e50';
  g.fillRect(-4 * s + passo, -6.5 * s, 9 * s, 5 * s); g.fillRect(-4 * s - passo, 1.5 * s, 9 * s, 5 * s);
  g.fillStyle = p.tenisCor || '#111'; g.fillRect(4 * s + passo, -6.5 * s, 3 * s, 5 * s); g.fillRect(4 * s - passo, 1.5 * s, 3 * s, 5 * s);
  if (p.rodaAtiva === 'patins') { g.fillStyle = '#e84393'; g.fillRect(-4 * s, -8 * s, 11 * s, 2 * s); g.fillRect(-4 * s, 6 * s, 11 * s, 2 * s); g.fillStyle = '#f1c40f'; for (const xx of [-3, 1, 5]) { g.fillRect(xx * s, -9 * s, 1.6 * s, 1.6 * s); g.fillRect(xx * s, 7.4 * s, 1.6 * s, 1.6 * s); } }
  // braços
  g.fillStyle = p.camisa;
  const armado = opt.arma && opt.arma !== 'punho';
  if (armado) {
    g.fillRect(0, -9 * s, 12 * s, 4 * s); g.fillRect(0, 5 * s, 12 * s, 4 * s);
    g.fillStyle = p.pele; g.beginPath(); g.arc(13 * s, -2 * s, 3 * s, 0, 7); g.arc(13 * s, 2 * s, 3 * s, 0, 7); g.fill();
    g.fillStyle = '#1b1b1b';
    const L = { escopeta: 16, foguete: 18, uzi: 11, fuzil: 18, lancachamas: 16, taco: 20, granada: 3, molotov: 5 }[opt.arma] || 8;
    g.fillStyle = opt.arma === 'taco' ? '#c8a165' : opt.arma === 'molotov' ? '#1e8449' : opt.arma === 'granada' ? '#4a5d23' : opt.arma === 'lancachamas' ? '#b03a2e' : '#1b1b1b';
    g.fillRect(13 * s, -1.6 * s, L * s, (opt.arma === 'taco' ? 4.2 : 3.2) * s);
    if (opt.arma === 'foguete') { g.fillStyle = '#4a5d23'; g.fillRect(-8 * s, 5 * s, 30 * s, 6 * s); }
  } else {
    g.fillRect(-2 * s - passo * 0.5, -13 * s, 8 * s, 4 * s); g.fillRect(-2 * s + passo * 0.5, 9 * s, 8 * s, 4 * s);
    g.fillStyle = p.pele; g.beginPath(); g.arc(6 * s - passo * 0.5, -11 * s, 2.6 * s, 0, 7); g.arc(6 * s + passo * 0.5, 11 * s, 2.6 * s, 0, 7); g.fill();
  }
  // tronco
  g.fillStyle = p.camisa; g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1.5;
  rr(g, -6.5 * s, -11.5 * s, 12 * s, 23 * s, 4.5 * s); g.fill(); g.stroke();
  if (p.estampa) {
    g.save(); rr(g, -6.5 * s, -11.5 * s, 12 * s, 23 * s, 4.5 * s); g.clip();
    if (p.estampa === 'listrada') { g.fillStyle = 'rgba(255,255,255,.75)'; for (let k = -10; k < 10; k += 4) g.fillRect(-6 * s, k * s, 11 * s, 1.6 * s); }
    else if (p.estampa === 'simas') { ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'].forEach((c, k) => { g.fillStyle = c; g.fillRect(-6 * s, (-10 + k * 3.4) * s, 11 * s, 3.4 * s); }); }
    else if (p.estampa === 'xadrez') { g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = -10; k < 10; k += 4) { g.fillRect(-6 * s, k * s, 11 * s, 1.8 * s); } for (let k = -6; k < 6; k += 4) g.fillRect(k * s, -10 * s, 1.8 * s, 20 * s); }
    else if (p.estampa === 'camuflada') { const cs = ['#4a5d23', '#6b4f2a', '#2d3a1a']; for (let k = 0; k < 9; k++) { g.fillStyle = cs[k % 3]; g.beginPath(); g.arc((-5 + (k * 37) % 10) * s, (-9 + (k * 53) % 18) * s, 3 * s, 0, 7); g.fill(); } }
    else if (p.estampa === 'flamengo') { for (let k = -10; k < 10; k += 4) { g.fillStyle = k % 8 === 2 || k % 8 === -6 ? '#111' : '#c0392b'; g.fillRect(-6 * s, k * s, 11 * s, 2 * s); } }
    g.restore();
  }
  if (p.jaqueta) { g.fillStyle = p.jaqueta; rr(g, -7 * s, -11 * s, 9 * s, 7 * s, 3 * s); g.fill(); rr(g, -7 * s, 4 * s, 9 * s, 7 * s, 3 * s); g.fill(); g.fillRect(-7 * s, -4 * s, 4 * s, 8 * s); }
  if (p.mochila) { g.fillStyle = p.mochila; rr(g, -11 * s, -7 * s, 6 * s, 14 * s, 2 * s); g.fill(); g.strokeStyle = 'rgba(0,0,0,.5)'; g.stroke(); }
  if (p.corrente) { g.strokeStyle = '#f1c40f'; g.lineWidth = 1.8 * s; g.beginPath(); g.arc(0, 0, 8 * s, -0.9, 0.9); g.stroke(); g.fillStyle = '#f1c40f'; g.beginPath(); g.arc(8 * s, 0, 1.8 * s, 0, 7); g.fill(); }
  if (p.policia) { g.fillStyle = '#ffd700'; g.fillRect(-1 * s, -6 * s, 3 * s, 3 * s); }
  g.rotate(-a);
  // cabeça
  const rosto = p.rosto && ROSTOS[p.rosto];
  if (rosto && rosto.complete && rosto.naturalWidth) {
    const r = (p === W.jog || opt.jog ? 6.6 : 8.2) * s;
    g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.arc(0, 0, r + 2.5, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip(); g.drawImage(rosto, -r, -r * 1.05, r * 2, r * 2.1); g.restore();
    g.strokeStyle = p.corNome || p.borda || '#fff'; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    if (p.chapeu) { g.fillStyle = p.chapeu; if (p.chapeuTipo === 'cowboy') { g.beginPath(); g.ellipse(0, -r * 0.45, r * 1.5, r * 0.45, 0, 0, 7); g.fill(); g.beginPath(); g.arc(0, -r * 0.5, r * 0.7, Math.PI, 0); g.fill(); } else if (p.chapeuTipo === 'bucket') { g.beginPath(); g.arc(0, -r * 0.1, r * 1.12, Math.PI * 1.02, Math.PI * 1.98); g.fill(); g.fillRect(-r * 1.2, -r * 0.2, r * 2.4, r * 0.22); } else { g.beginPath(); g.arc(0, 0, r + 1, Math.PI * 1.05, Math.PI * 1.95); g.fill(); g.fillRect(-r * 0.2, -r * 0.62, r * 1.5, r * 0.3); } }
    if (p.oculos) { g.fillStyle = 'rgba(10,10,10,.92)'; g.fillRect(-r * 0.75, -r * 0.2, r * 0.65, r * 0.32); g.fillRect(r * 0.1, -r * 0.2, r * 0.65, r * 0.32); g.fillRect(-r * 0.15, -r * 0.12, r * 0.3, r * 0.1); }
  } else {
    g.rotate(a);
    g.fillStyle = p.pele; g.beginPath(); g.arc(1 * s, 0, 6 * s, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = p.cabelo || '#111'; g.beginPath(); g.arc(-0.5 * s, 0, 5.6 * s, Math.PI * 0.55, Math.PI * 1.45); g.fill();
    if (p.cabeloLongo) { g.fillRect(-9 * s, -5 * s, 7 * s, 10 * s); }
    if (p.chapeu) { g.fillStyle = p.chapeu; g.beginPath(); g.arc(0, 0, 6.5 * s, 0, 7); g.fill(); g.fillRect(2 * s, -4 * s, 8 * s, 8 * s); }
    if (p.oculos) { g.fillStyle = '#111'; g.fillRect(4.5 * s, -4.5 * s, 2.5 * s, 9 * s); }
    if (p.policia) { g.fillStyle = p.seguranca ? '#111' : '#1b2a6b'; g.beginPath(); g.arc(0, 0, 6.6 * s, 0, 7); g.fill(); g.fillRect(3 * s, -4.5 * s, 6 * s, 9 * s); }
    g.rotate(-a);
  }
  g.restore();
  if (p.nome && opt.nomes !== false && dist(x, y, W.jog.x, W.jog.y) < 520) {
    const ty = y - (p.rosto ? 16 : 13) * s;
    g.font = 'bold 10px system-ui, sans-serif'; g.textAlign = 'center';
    const w = g.measureText(p.nome).width + 8;
    g.fillStyle = 'rgba(0,0,0,.6)'; rr(g, x - w / 2, ty - 10, w, 13, 4); g.fill();
    g.fillStyle = p.corNome || '#ffd23f'; g.fillText(p.nome, x, ty);
  }
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
  g.fillStyle = 'rgba(0,0,0,.35)'; g.save(); g.translate(4, 6); g.rotate(c.a); rr(g, -L / 2, -8, L, 16, 7); g.fill(); g.restore();
  g.rotate(c.a);
  g.fillStyle = '#111'; rr(g, L / 2 - 14, -5, 14, 10, 4); g.fill(); rr(g, -L / 2, -5, 14, 10, 4); g.fill();
  g.fillStyle = c.hp <= 0 ? '#333' : c.cor; rr(g, -L / 2 + 8, -7, L - 16, 14, 6); g.fill(); g.strokeStyle = escurecer(c.cor, 0.6); g.lineWidth = 2; g.stroke();
  g.fillStyle = '#bdc3c7'; g.fillRect(L / 2 - 16, -11, 3, 22);
  g.fillStyle = '#fff6b0'; g.fillRect(L / 2 - 3, -3, 3, 6);
  if (c.modelo === 'biz') { g.fillStyle = '#c0392b'; g.fillRect(-L / 2 + 2, -9, 12, 18); g.fillStyle = '#fff'; g.font = 'bold 7px system-ui'; g.fillText('iFOME', -L / 2 + 2, 3); }
  const m = c.motorista;
  if (m) {
    g.fillStyle = m.camisa || '#555'; rr(g, -9, -9, 16, 18, 5); g.fill();
    g.fillStyle = m.pele || '#c68642'; g.fillRect(4, -11, 10, 4); g.fillRect(4, 7, 10, 4);
    g.rotate(-c.a);
    const im = m.rosto && ROSTOS[m.rosto];
    if (im && im.complete && im.naturalWidth) { const r = 12; g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.arc(0, 0, r + 2, 0, 7); g.fill(); g.save(); g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip(); g.drawImage(im, -r, -r, r * 2, r * 2); g.restore(); g.strokeStyle = '#ffd23f'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); }
    else { g.fillStyle = m.capacete || '#2c3e50'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); g.fillStyle = 'rgba(150,200,255,.6)'; g.beginPath(); g.arc(3, 0, 5, -1, 1); g.fill(); }
  }
  g.restore();
  if (c.nome && dist(c.x, c.y, W.jog.x, W.jog.y) < 700) { g.font = 'bold 11px system-ui'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText(c.nome, c.x, c.y - 30); g.fillStyle = c.gangue ? '#ff8c00' : '#ff6b6b'; g.fillText(c.nome, c.x, c.y - 30); }
}
function desenharCarro(g, c) {
  const L = c.l, Wd = c.w, t = TIPOS_CARRO[c.modelo];
  if (t.moto) return desenharMoto(g, c, t);
  if (t.barco) return desenharBarco(g, c, t);
  g.save(); g.translate(c.x, c.y);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.save(); g.translate(5, 7); g.rotate(c.a); rr(g, -L / 2, -Wd / 2, L, Wd, 10); g.fill(); g.restore();
  g.rotate(c.a);
  const cor = c.hp <= 0 ? '#2a2a2a' : c.cor;
  // rodas
  g.fillStyle = '#111';
  for (const [px, py] of [[L * 0.3, -Wd / 2 - 2], [L * 0.3, Wd / 2 - 5], [-L * 0.3, -Wd / 2 - 2], [-L * 0.3, Wd / 2 - 5]]) g.fillRect(px - 8, py, 16, 7);
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
    g.font = '900 13px "Arial Black", system-ui'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#000';
    const sobe = Math.sin(W.tempo * 6) * 2;
    g.strokeText('🚨 SEGURANÇA GELADO', c.x, c.y - 62 + sobe); g.fillStyle = '#ffd23f'; g.fillText('🚨 SEGURANÇA GELADO', c.x, c.y - 62 + sobe);
  }
  if (c.nome) { g.font = 'bold 12px system-ui'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText(c.nome, c.x, c.y - 50); g.fillStyle = '#ff6b6b'; g.fillText(c.nome, c.x, c.y - 50); }
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
function desenharPredio(g, p, ccx, ccy) {
  const k = 0.42 * p.alt;
  const ox = (p.x + p.w / 2 - ccx) * k * 0.6, oy = (p.y + p.h / 2 - ccy) * k * 0.6;
  const x0 = p.x, y0 = p.y, x1 = p.x + p.w, y1 = p.y + p.h;
  const rx0 = x0 + ox, ry0 = y0 + oy, rx1 = x1 + ox, ry1 = y1 + oy;
  const parede = escurecer(p.cor, 0.62), parede2 = escurecer(p.cor, 0.78);
  // paredes visíveis (as do lado oposto ao centro da tela)
  g.fillStyle = parede;
  if (oy > 0) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.lineTo(rx1, ry0); g.lineTo(rx0, ry0); g.fill(); }
  if (oy < 0) { g.beginPath(); g.moveTo(x0, y1); g.lineTo(x1, y1); g.lineTo(rx1, ry1); g.lineTo(rx0, ry1); g.fill(); janelas(g, x0, y1, rx0, ry1, x1, rx1, p, true); }
  g.fillStyle = parede2;
  if (ox > 0) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.lineTo(rx0, ry1); g.lineTo(rx0, ry0); g.fill(); }
  if (ox < 0) { g.beginPath(); g.moveTo(x1, y0); g.lineTo(x1, y1); g.lineTo(rx1, ry1); g.lineTo(rx1, ry0); g.fill(); }
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
  const g = ctx, z = cam.zoom;
  const tx = (Math.random() - 0.5) * cam.tremor, ty = (Math.random() - 0.5) * cam.tremor;
  g.setTransform(DPR * z, 0, 0, DPR * z, DPR * (VW / 2 + tx), DPR * (VH / 2 + ty));
  g.translate(-cam.x, -cam.y);
  const vx0 = cam.x - VW / 2 / z - 200, vy0 = cam.y - VH / 2 / z - 200, vx1 = cam.x + VW / 2 / z + 200, vy1 = cam.y + VH / 2 / z + 200;
  const dentro = (x, y, m = 0) => x > vx0 - m && x < vx1 + m && y > vy0 - m && y < vy1 + m;
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
  for (const d of decoVis) if (d.t !== 'arvore' && d.t !== 'palmeira' && d.t !== 'poste') desenharDeco(g, d);
  // faróis nos cruzamentos
  const corF = f => f === 'verde' ? '#2ecc71' : f === 'amarelo' ? '#f1c40f' : '#e74c3c';
  for (let ky = Math.max(1, Math.floor(vy0 / T / GRID)); ky <= Math.min(15, Math.ceil(vy1 / T / GRID)); ky++) for (let kx = Math.max(1, Math.floor(vx0 / T / GRID)); kx <= Math.min(15, Math.ceil(vx1 / T / GRID)); kx++) {
    if (!cruzamentoComFarol(kx, ky)) continue;
    const x0 = GRID * kx * T, y0 = GRID * ky * T, S2 = 2 * T, fv = corF(faroFase(true)), fh = corF(faroFase(false));
    for (const [px, py, c] of [[x0 - 10, y0 - 10, fv], [x0 + S2 + 10, y0 + S2 + 10, fv], [x0 + S2 + 10, y0 - 10, fh], [x0 - 10, y0 + S2 + 10, fh]]) {
      g.fillStyle = '#222'; g.fillRect(px - 7, py - 7, 14, 14); g.fillStyle = c; g.beginPath(); g.arc(px, py, 5, 0, 7); g.fill();
      g.fillStyle = c + '33'; g.beginPath(); g.arc(px, py, 11, 0, 7); g.fill();
    }
  }
  // marcadores de missão no chão
  desenharMarcadores(g);
  // itens
  for (const it of W.itens) if (dentro(it.x, it.y)) desenharItem(g, it);
  // gente e carros
  for (const p of W.peds) if (p.morto && !p.dentroCarro && dentro(p.x, p.y)) desenharPessoa(g, p);
  for (const c of W.carros) if (dentro(c.x, c.y)) desenharCarro(g, c);
  for (const p of W.peds) if (!p.morto && !p.dentroCarro && !p.escondido && dentro(p.x, p.y)) desenharPessoa(g, p, { arma: p.armaVisivel, escala: p.rosto || p.nome ? 1.25 : 1.1 });
  const j = W.jog;
  if (!j.carro && !j.morto) { if (j.nadando) { g.save(); g.globalAlpha = 0.55; g.fillStyle = '#1d4f8f'; g.beginPath(); g.arc(j.x, j.y, 30, 0, 7); g.fill(); g.restore(); } desenharPessoa(g, j, { arma: j.nadando ? null : j.arma, nomes: false, anel: true, escala: 1.45 }); if (j.nadando) { g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(j.x, j.y, 24 + Math.sin(W.tempo * 6) * 4, 0, 7); g.stroke(); } }
  if (!j.carro && j.morto) desenharPessoa(g, { ...j, morto: true });
  for (const ch of W.chefes) ch.desenhar && ch.desenhar(g);
  ONLINE.desenhar(g);
  // balas
  g.strokeStyle = '#fff3a0'; g.lineWidth = 3;
  for (const b of W.balas) { g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x - b.vx * 0.018, b.y - b.vy * 0.018); g.stroke(); }
  for (const f of W.fogos) { const k = Math.min(1, f.vida); for (let i = 0; i < 6; i++) { const a = i + W.tempo * 3, rr2 = f.r * (0.3 + 0.5 * ((i * 37) % 10) / 10); g.fillStyle = `rgba(255,${120 + i * 20},0,${0.55 * k})`; g.beginPath(); g.arc(f.x + Math.cos(a) * rr2, f.y + Math.sin(a * 1.3) * rr2, 14 + Math.random() * 10, 0, 7); g.fill(); } }
  for (const c of W.chamas) { const k = c.vida / 0.42; g.fillStyle = `rgba(255,${Math.floor(80 + 150 * k)},0,${0.8 * k})`; g.beginPath(); g.arc(c.x, c.y, 8 + (1 - k) * 16, 0, 7); g.fill(); }
  for (const o of W.jogados) { g.save(); g.translate(o.x, o.y); g.rotate(o.gira); if (o.t === 'granada') { g.fillStyle = '#4a5d23'; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); g.fillStyle = '#222'; g.fillRect(-2, -10, 4, 4); } else { g.fillStyle = '#1e8449'; g.fillRect(-4, -9, 8, 16); g.fillStyle = '#ff8c00'; g.beginPath(); g.arc(0, -11, 4 + Math.random() * 2, 0, 7); g.fill(); } g.restore(); }
  for (const f of W.foguetes) { g.save(); g.translate(f.x, f.y); g.rotate(Math.atan2(f.vy, f.vx)); g.fillStyle = '#556b2f'; g.fillRect(-12, -4, 24, 8); g.fillStyle = '#ff8c00'; g.beginPath(); g.arc(-14, 0, 5 + Math.random() * 3, 0, 7); g.fill(); g.restore(); }
  // árvores por cima
  for (const d of decoVis) if (d.t === 'arvore' || d.t === 'palmeira' || d.t === 'poste') desenharDeco(g, d);
  // prédios
  const vis = predios.filter(p => p.x + p.w > vx0 - 300 && p.x < vx1 + 300 && p.y + p.h > vy0 - 300 && p.y < vy1 + 300);
  vis.sort((a, b) => dist(b.x + b.w / 2, b.y + b.h / 2, cam.x, cam.y) - dist(a.x + a.w / 2, a.y + a.h / 2, cam.x, cam.y));
  for (const p of vis) desenharPredio(g, p, cam.x, cam.y);
  // efeitos
  for (const e of W.efeitos) {
    if (e.x !== undefined && !dentro(e.x, e.y)) continue;
    const k = e.vida / e.max;
    if (e.t === 'explosao') {
      const r = e.r * (1.2 - k * 0.6);
      const gr = g.createRadialGradient(e.x, e.y, 0, e.x, e.y, r); gr.addColorStop(0, `rgba(255,255,200,${k})`); gr.addColorStop(0.4, `rgba(255,140,0,${k})`); gr.addColorStop(1, 'rgba(120,20,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(e.x, e.y, r, 0, 7); g.fill();
    } else if (e.t === 'fumaca') { g.fillStyle = e.escura ? `rgba(30,30,30,${k * 0.5})` : `rgba(90,90,90,${k * 0.45})`; g.beginPath(); g.arc(e.x, e.y, e.r, 0, 7); g.fill(); }
    else if (e.t === 'onda') { g.strokeStyle = `rgba(255,255,255,${k * 0.6})`; g.lineWidth = 2; g.beginPath(); g.arc(e.x, e.y, 10 + (1 - k) * 30, 0, 7); g.stroke(); }
    else if (e.t === 'clarao') { g.fillStyle = 'rgba(255,240,150,.9)'; g.beginPath(); g.arc(e.x, e.y, 10, 0, 7); g.fill(); }
    else if (e.t === 'faisca') { g.fillStyle = '#ffd23f'; for (let i = 0; i < 4; i++) g.fillRect(e.x + rnd(-8, 8), e.y + rnd(-8, 8), 3, 3); }
    else if (e.t === 'raio') { g.strokeStyle = `rgba(0,229,255,${k})`; g.lineWidth = 4; g.beginPath(); g.moveTo(e.x, e.y); for (let i = 1; i <= 6; i++) g.lineTo(lerp(e.x, e.x2, i / 6) + (i < 6 ? rnd(-14, 14) : 0), lerp(e.y, e.y2, i / 6) + (i < 6 ? rnd(-14, 14) : 0)); g.stroke(); }
    else if (e.t === 'anel') { g.strokeStyle = `rgba(0,229,255,${k})`; g.lineWidth = 8 * k + 2; g.beginPath(); g.arc(e.x, e.y, e.r * (1 - k) + 20, 0, 7); g.stroke(); }
    else if (e.t === 'laser') { g.strokeStyle = `rgba(255,30,60,${k})`; g.lineWidth = 10 * k + 2; g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(e.x2, e.y2); g.stroke(); g.strokeStyle = `rgba(255,255,255,${k})`; g.lineWidth = 3; g.stroke(); }
    else if (e.t === 'mira') { g.strokeStyle = `rgba(255,30,60,${0.4 + 0.6 * Math.abs(Math.sin(W.tempo * 12))})`; g.lineWidth = 3; g.beginPath(); g.arc(e.x, e.y, e.r, 0, 7); g.stroke(); g.beginPath(); g.moveTo(e.x - e.r, e.y); g.lineTo(e.x + e.r, e.y); g.moveTo(e.x, e.y - e.r); g.lineTo(e.x, e.y + e.r); g.stroke(); }
  }
  for (const e of W.efeitos) if (e.t === 'texto' && dentro(e.x, e.y)) {
    g.font = 'bold 15px system-ui'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.85)'; g.globalAlpha = Math.min(1, e.vida / e.max * 2);
    g.strokeText(e.txt, e.x, e.y); g.fillStyle = e.cor; g.fillText(e.txt, e.x, e.y); g.globalAlpha = 1;
  }
  // noite leve em Recife/BH no fim do jogo? (efeito de região)
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (const e of W.efeitos) if (e.t === 'flashVermelho') { g.fillStyle = `rgba(255,0,0,${e.vida / e.max * 0.35})`; g.fillRect(0, 0, VW, VH); }
}
