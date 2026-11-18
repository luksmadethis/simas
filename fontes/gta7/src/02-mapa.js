// =========================================================
// MAPA: tiles, regiões, prédios e lugares importantes
// =========================================================
const TL = { AGUA: 0, AREIA: 1, GRAMA: 2, RUA: 3, CALCADA: 4, PREDIO: 5, PRACA: 6, ROCA: 7, TERRA: 8, PISTA: 9, CAIS: 10, ESTAC: 11, BECO: 12, ESTRADA: 13 };
const SOLIDO = new Set([TL.AGUA, TL.PREDIO]);
const mapa = new Uint8Array(MW * MH);
const regiaoTile = new Uint8Array(MW * MH);
const REG = { CENTRO: 0, JUAZEIRO: 1, RIO: 2, BH: 3, RECIFE: 4, SUBURBIO: 5, INDONESIA: 6, SERRA: 7, LITORAL: 8 };
const NOME_REG = ['São Simas (centro)', 'Juazeiro', 'Rio de Janeiro', 'BH', 'Recife', 'Subúrbio', 'Indonésia', 'Serra do Simas', 'Litoral Sul'];
const predios = [];
const LUGAR = {};     // lugares importantes: {x, y (mundo), nome}
const deco = [];      // decoração no chão: árvores, palmeiras, rampas, contêineres

const tile = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? TL.AGUA : mapa[y * MW + x];
const setTile = (x, y, t) => { if (x >= 0 && y >= 0 && x < MW && y < MH) mapa[y * MW + x] = t; };
const tileEm = (wx, wy) => tile(Math.floor(wx / T), Math.floor(wy / T));
const solidoEm = (wx, wy) => SOLIDO.has(tileEm(wx, wy));
// parede de verdade (tiro e granada passam por cima da água)
const paredeEm = (wx, wy) => tileEm(wx, wy) === TL.PREDIO;
const regiaoEm = (wx, wy) => { const x = Math.floor(wx / T), y = Math.floor(wy / T); return (x < 0 || y < 0 || x >= MW || y >= MH) ? REG.CENTRO : regiaoTile[y * MW + x]; };
const ehRua = (x, y) => tile(x, y) === TL.RUA;
const ehPista = (x, y) => { const t = tile(x, y); return t === TL.RUA || t === TL.ESTRADA; };

function regiaoDoBloco(i, j) {
  if (j <= 3) return REG.JUAZEIRO;
  if (i <= 4 && j >= 11) return REG.RIO;
  if (i >= 11 && j >= 4 && j <= 10) return REG.BH;
  if (i >= 10 && j >= 11) return REG.RECIFE;
  if (i <= 4 && j >= 4 && j <= 5) return REG.SUBURBIO;
  return REG.CENTRO;
}
const blocoX = i => GRID * i + 2, blocoY = j => GRID * j + 2;          // primeiro tile do bloco (calçada)
const centroBloco = (i, j) => ({ x: (GRID * i + 7) * T, y: (GRID * j + 7) * T });
const portaBloco = (i, j) => ({ x: (GRID * i + 7) * T, y: (GRID * j + 2.5) * T }); // calçada de cima, no meio

// lugares especiais (bloco i, j)
const ESPECIAIS = {
  dudu: [6, 6], garagem: [7, 7], garagemBH: [12, 6], hospital: [5, 7], policia: [8, 5], cas: [3, 4],
  skate: [4, 8], padaria: [5, 5], mercado: [8, 8], yori: [6, 1], nauj: [2, 13], baile: [13, 7],
  matheus: [9, 10], ltzin: [13, 13], armas: [6, 8], roupas: [7, 5], gelado: [9, 6], desmanche: [12, 12], poli: [8, 6], fatal: [6, 5], cafe: [11, 14], motors: [8, 4]
};
const CORES_PREDIO = ['#5b5f73', '#6e6058', '#4f6670', '#77705f', '#5d566e', '#666', '#5a6b5a', '#7a6a7e'];
const CORES_BH = ['#c0573e', '#d39b3a', '#5c8fb3', '#7bab5a', '#c46f99', '#e0c25b', '#8a6bc2', '#b5734e'];

function addPredio(x0, y0, w, h, alt, cor, extra = {}) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { setTile(x, y, TL.PREDIO); }
  const p = { x: x0 * T, y: y0 * T, w: w * T, h: h * T, alt, cor, teto: extra.teto || cor, ...extra };
  predios.push(p); return p;
}

// ruas como segmentos entre cruzamentos (k = 1..15). Alguns somem pra formar quarteirões maiores.
const segH = {}, segV = {}, ponte = new Uint8Array(MW * MH), vagas = [];
const kH = (kx, ky) => kx + ',' + ky;
const temH = (kx, ky) => kx >= 1 && kx <= 14 && ky >= 1 && ky <= 15 && segH[kH(kx, ky)] !== false;
const temV = (kx, ky) => kx >= 1 && kx <= 15 && ky >= 1 && ky <= 14 && segV[kH(kx, ky)] !== false;
const ehPonte = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH && ponte[y * MW + x] === 1;
const RIO_X = y => 127 + Math.sin(y * 0.09) * 2.4 + Math.sin(y * 0.031 + 1) * 1.6;
const ruido = (a, s) => (Math.sin(a * 0.11 + s) + Math.sin(a * 0.047 + s * 2.3) * 0.8 + Math.sin(a * 0.23 + s * 0.7) * 0.4) / 2.2 * 0.5 + 0.5;

function conectado() {
  const vis = new Set(['1,1']), fila = [[1, 1]];
  while (fila.length) {
    const [x, y] = fila.pop();
    const viz = [];
    if (temH(x, y)) viz.push([x + 1, y]); if (temH(x - 1, y)) viz.push([x - 1, y]);
    if (temV(x, y)) viz.push([x, y + 1]); if (temV(x, y - 1)) viz.push([x, y - 1]);
    for (const v of viz) { const k = v[0] + ',' + v[1]; if (!vis.has(k)) { vis.add(k); fila.push(v); } }
  }
  for (let y = 1; y <= 15; y++) for (let x = 1; x <= 15; x++) {
    const usado = temH(x, y) || temH(x - 1, y) || temV(x, y) || temV(x, y - 1);
    if (usado && !vis.has(x + ',' + y)) return false;
  }
  return true;
}
function decidirRuas(r) {
  const prot = new Set();
  const protBloco = (i, j) => { prot.add('H' + kH(i, j)); prot.add('H' + kH(i, j + 1)); prot.add('V' + kH(i, j)); prot.add('V' + kH(i + 1, j)); };
  for (const k in ESPECIAIS) protBloco(...ESPECIAIS[k]);
  // ruas usadas nas missões (racha do Alan, rolê do Nauj, caixas do Dudu, Kombi dos capangas)
  for (const [i, j] of [[4, 8], [6, 8], [8, 5], [6, 4], [1, 13], [4, 11], [5, 4], [9, 8], [6, 10]]) prot.add('H' + kH(i, j));
  prot.add('V' + kH(9, 7)); prot.add('V' + kH(4, 6)); prot.add('H' + kH(3, 15)); prot.add('H' + kH(12, 10));
  // parque grande no meio da cidade
  segH[kH(7, 10)] = false;
  const cands = [];
  for (let ky = 2; ky <= 14; ky++) for (let kx = 1; kx <= 14; kx++) cands.push(['H', kx, ky]);
  for (let ky = 1; ky <= 14; ky++) for (let kx = 2; kx <= 14; kx++) cands.push(['V', kx, ky]);
  for (const [t, kx, ky] of cands) {
    if (prot.has(t + kH(kx, ky))) continue;
    const reg = regiaoDoBloco(kx, ky);
    const chance = reg === REG.JUAZEIRO ? 0.45 : reg === REG.BH ? 0.2 : 0.3;
    if (r() > chance) continue;
    const obj = t === 'H' ? segH : segV; obj[kH(kx, ky)] = false;
    if (!conectado()) delete obj[kH(kx, ky)];
  }
}

function gerarMapa() {
  const r = seeded(7777);
  decidirRuas(r);
  // terra com litoral irregular
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const esq = 3 + ruido(y, 1) * 7, dir = CIDADE - 4 - ruido(y, 5) * 7, cima = 3 + ruido(x, 9) * 7, baixo = CIDADE - 4 - ruido(x, 13) * 7;
    const terra = x >= esq && x <= dir && y >= cima && y <= baixo;
    mapa[y * MW + x] = terra ? TL.GRAMA : TL.AGUA;
    const i = Math.floor(x / GRID), j = Math.floor(y / GRID);
    regiaoTile[y * MW + x] = y >= 240 ? REG.LITORAL : x >= CIDADE ? REG.INDONESIA : y >= CIDADE ? REG.SERRA : regiaoDoBloco(clamp(i, 0, 15), clamp(j, 0, 15));
  }
  // chão de cada região perto da água
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (tile(x, y) === TL.AGUA) continue;
    const reg = regiaoTile[y * MW + x];
    let perto = false; for (let d = 1; d <= 3 && !perto; d++) if (tile(x - d, y) === TL.AGUA || tile(x + d, y) === TL.AGUA || tile(x, y - d) === TL.AGUA || tile(x, y + d) === TL.AGUA) perto = true;
    if (reg === REG.JUAZEIRO) setTile(x, y, perto ? TL.AREIA : TL.TERRA);
    else if (perto) setTile(x, y, reg === REG.RECIFE ? TL.CAIS : TL.AREIA);
  }
  // píer em Recife
  for (let k = 0; k < 5; k++) { const y0 = 140 + k * 9; for (let y = y0; y < y0 + 3; y++) for (let x = 178; x < 190; x++) setTile(x, y, TL.CAIS); deco.push({ t: 'navio', x: 186 * T, y: (y0 + 5.5) * T, cor: pick(['#2471a3', '#c0392b', '#1e8449']) }); }
  // ruas
  const pinta = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setTile(x, y, TL.RUA); };
  for (let ky = 1; ky <= 15; ky++) for (let kx = 1; kx <= 14; kx++) if (temH(kx, ky)) pinta(GRID * kx, GRID * ky, GRID * kx + 13, GRID * ky + 1);
  for (let ky = 1; ky <= 14; ky++) for (let kx = 1; kx <= 15; kx++) if (temV(kx, ky)) pinta(GRID * kx, GRID * ky, GRID * kx + 1, GRID * ky + 13);
  // rio (Velho Chico) cortando o mapa de norte a sul, com pontes
  for (let y = 0; y < CIDADE; y++) {
    const cx = RIO_X(y);
    for (let x = Math.floor(cx - 4); x <= Math.ceil(cx + 4); x++) {
      const d = Math.abs(x + 0.5 - cx);
      if (d < 2.3) { if (tile(x, y) === TL.RUA) ponte[y * MW + x] = 1; else setTile(x, y, TL.AGUA); }
      else if (d < 3.4 && tile(x, y) !== TL.RUA && tile(x, y) !== TL.AGUA) setTile(x, y, TL.GRAMA);
    }
  }
  // calçadas
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const t = tile(x, y); if (t === TL.RUA || t === TL.AGUA) continue;
    let perto = false;
    for (let dy = -1; dy <= 1 && !perto; dy++) for (let dx = -1; dx <= 1; dx++) if (tile(x + dx, y + dy) === TL.RUA && !ehPonte(x + dx, y + dy)) { perto = true; break; }
    if (perto) setTile(x, y, regiaoTile[y * MW + x] === REG.JUAZEIRO ? TL.TERRA : TL.CALCADA);
  }
  // quarteirões
  const especialEm = {};
  for (const k in ESPECIAIS) { const [i, j] = ESPECIAIS[k]; especialEm[i + ',' + j] = k; }
  for (let j = 1; j <= 14; j++) for (let i = 1; i <= 14; i++) {
    const esp = especialEm[i + ',' + j];
    if (esp) { montarEspecial(esp, i, j, blocoX(i) + 1, blocoY(j) + 1, 8, r); continue; }
    // retângulo do lote: cresce por cima da rua que sumiu
    let x0 = GRID * i + 3, y0 = GRID * j + 3, x1 = GRID * i + 10, y1 = GRID * j + 10;
    if (!temV(i + 1, j)) x1 = GRID * (i + 1) + 2;
    if (!temH(i, j + 1)) y1 = GRID * (j + 1) + 2;
    if (!temV(i, j)) x0 = GRID * i + 3;
    if (i === 7 && (j === 9 || j === 10)) { montarParque(x0, y0, x1, y1, j === 9, r); continue; }
    preencherLote(regiaoDoBloco(i, j), x0, y0, x1, y1, r);
  }
  gerarIndonesia(r); gerarSerra(r); gerarLitoral(r); orlaDoRio(r); mobiliaUrbana(r);
  for (let k = deco.length - 1; k >= 0; k--) { const d = deco[k]; if (['arvore', 'palmeira', 'cacto', 'banco', 'poste', 'hidrante', 'lixeira', 'pedra', 'placa'].includes(d.t) && (tileEm(d.x, d.y) === TL.AGUA || tileEm(d.x, d.y) === TL.PREDIO || tileEm(d.x, d.y) === TL.RUA)) deco.splice(k, 1); }
  for (let k = 0; k < 50; k++) { const x = rnd(4, 40), y = rnd(130, 188); if (tile(x | 0, y | 0) === TL.AREIA) deco.push({ t: 'palmeira', x: x * T, y: y * T, s: 1 }); }
  for (let k = 0; k < 50; k++) { const x = rnd(10, 80), y = rnd(178, 189); if (tile(x | 0, y | 0) === TL.AREIA) deco.push({ t: 'palmeira', x: x * T, y: y * T, s: 1 }); }
  indexarDeco();
}

const livre = (x, y) => { const t = tile(x, y); return t !== TL.RUA && t !== TL.CALCADA && t !== TL.AGUA && t !== TL.PREDIO && !(regiaoTile[y * MW + x] === REG.JUAZEIRO && t === TL.TERRA && vizRua(x, y)); };
const vizRua = (x, y) => tile(x - 1, y) === TL.RUA || tile(x + 1, y) === TL.RUA || tile(x, y - 1) === TL.RUA || tile(x, y + 1) === TL.RUA;
function retLivre(x0, y0, w, h) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (!livre(x, y)) return false; return true; }
function chao(x0, y0, x1, y1, t) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (livre(x, y)) setTile(x, y, t); }

function bsp(x0, y0, x1, y1, r, min, out) {
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  if ((w <= min * 2 + 1 && h <= min * 2 + 1) || (r() < 0.18 && w <= min * 3 && h <= min * 3)) { out.push([x0, y0, x1, y1]); return out; }
  if (w >= h && w > min * 2 + 1) { const c = x0 + min + Math.floor(r() * (w - min * 2 - 1)); bsp(x0, y0, c - 1, y1, r, min, out); out.push(['beco', c, y0, c, y1]); bsp(c + 1, y0, x1, y1, r, min, out); }
  else if (h > min * 2 + 1) { const c = y0 + min + Math.floor(r() * (h - min * 2 - 1)); bsp(x0, y0, x1, c - 1, r, min, out); out.push(['beco', x0, c, x1, c]); bsp(x0, c + 1, x1, y1, r, min, out); }
  else out.push([x0, y0, x1, y1]);
  return out;
}

function preencherLote(reg, X0, Y0, X1, Y1, r) {
  const base = reg === REG.JUAZEIRO ? TL.TERRA : reg === REG.RIO ? (Y0 > 160 ? TL.AREIA : TL.PRACA) : reg === REG.RECIFE ? TL.CAIS : reg === REG.SUBURBIO ? TL.GRAMA : reg === REG.BH ? TL.CALCADA : TL.PRACA;
  chao(X0, Y0, X1, Y1, base);
  const min = reg === REG.BH ? 2 : reg === REG.JUAZEIRO ? 4 : 3;
  const folhas = bsp(X0, Y0, X1, Y1, r, min, []);
  for (const f of folhas) {
    if (f[0] === 'beco') { const [, a, b, c, d] = f; chao(a, b, c, d, reg === REG.JUAZEIRO ? TL.TERRA : reg === REG.SUBURBIO ? TL.GRAMA : TL.BECO); continue; }
    const [x0, y0, x1, y1] = f, w = x1 - x0 + 1, h = y1 - y0 + 1, cx = (x0 + x1 + 1) / 2 * T, cy = (y0 + y1 + 1) / 2 * T;
    const ok = retLivre(x0, y0, w, h), sorte = r();
    if (!ok) { // só um pedaço livre: vira pracinha
      if (reg !== REG.JUAZEIRO && reg !== REG.RECIFE) for (let k = 0; k < 2; k++) deco.push({ t: reg === REG.RIO ? 'palmeira' : 'arvore', x: (x0 + r() * w) * T, y: (y0 + r() * h) * T, s: 0.8 });
      continue;
    }
    if (reg === REG.CENTRO) {
      if (sorte < 0.6) addPredio(x0, y0, w, h, 0.4 + r() * 1.2 * Math.min(1, (w * h) / 30), pick(CORES_PREDIO), { estilo: rndi(0, 3) });
      else if (sorte < 0.74 && w >= 3 && h >= 3) estacionamento(x0, y0, x1, y1, r);
      else if (sorte < 0.8 && w >= 4 && h >= 4) posto(x0, y0, x1, y1);
      else { chao(x0, y0, x1, y1, TL.PRACA); for (let k = 0; k < Math.max(1, w * h / 8); k++) deco.push({ t: 'arvore', x: (x0 + 0.5 + r() * (w - 1)) * T, y: (y0 + 0.5 + r() * (h - 1)) * T, s: 0.7 + r() * 0.5 }); if (r() < 0.5) deco.push({ t: 'banco', x: cx, y: cy }); }
    } else if (reg === REG.JUAZEIRO) {
      if (sorte < 0.45) { chao(x0, y0, x1, y1, TL.ROCA); }
      else if (sorte < 0.7) { addPredio(x0 + 1, y0 + 1, Math.min(3, w - 1), Math.min(2, h - 1), 0.25, '#c8a165', { teto: '#a0442c' }); }
      else if (sorte < 0.85) { deco.push({ t: 'curral', x: cx, y: cy, w: w * T * 0.8, h: h * T * 0.8 }); }
      for (let k = 0; k < 2; k++) deco.push({ t: 'cacto', x: (x0 + r() * w) * T, y: (y0 + r() * h) * T, s: 0.7 + r() * 0.4 });
    } else if (reg === REG.RIO) {
      if (sorte < 0.6 && Y0 < 160) addPredio(x0, y0, w, h, 0.5 + r() * 0.9, pick(['#e6d6b8', '#d9c3a0', '#c9b9a9', '#f0e0c0', '#e8c0b0']), { estilo: 1 });
      else { for (let k = 0; k < 3; k++) deco.push({ t: 'palmeira', x: (x0 + r() * w) * T, y: (y0 + r() * h) * T, s: 0.8 + r() * 0.4 }); if (Y0 >= 160 && r() < 0.5) deco.push({ t: 'guarda_sol', x: cx, y: cy, cor: pick(['#e74c3c', '#f1c40f', '#3498db']) }); }
    } else if (reg === REG.BH) {
      if (sorte < 0.1 && w >= 4 && h >= 3) { chao(x0, y0, x1, y1, TL.GRAMA); deco.push({ t: 'campinho', x: cx, y: cy, w: w * T - 16, h: h * T - 16 }); }
      else for (let yy = y0; yy <= y1; yy += 2) for (let xx = x0; xx <= x1; xx += 2) {
        const ww = Math.min(2, x1 - xx + 1), hh = Math.min(2, y1 - yy + 1);
        if (r() < 0.85 && retLivre(xx, yy, ww, hh)) addPredio(xx, yy, ww, hh, 0.22 + r() * 0.32, pick(CORES_BH), { teto: '#8e8a86', tijolo: true, caixa: r() < 0.4 });
      }
    } else if (reg === REG.RECIFE) {
      if (sorte < 0.55) addPredio(x0, y0, w, h, 0.32, pick(['#7d8b97', '#8f7a63', '#6d7d6d']), { teto: '#5b6a75', galpao: true });
      else for (let yy = y0; yy + 1 <= y1; yy += 2) deco.push({ t: 'conteiner', x: cx, y: (yy + 1) * T, cor: pick(['#c0392b', '#2471a3', '#d4ac0d', '#1e8449']) });
    } else if (reg === REG.SUBURBIO) {
      const ww = Math.min(3, w), hh = Math.min(3, h);
      addPredio(x0, y0, ww, hh, 0.28, pick(['#e8d5b5', '#d6e0c7', '#e0c9c9', '#c9d6e0']), { teto: pick(['#a64b3c', '#8a4a3a', '#6b4a3a']) });
      if (w > 3 || h > 3) { if (r() < 0.5) deco.push({ t: 'piscina', x: (x0 + ww + 0.8) * T, y: (y0 + 1) * T }); else deco.push({ t: 'arvore', x: (x0 + ww + 0.8) * T, y: (y0 + 1.2) * T, s: 1 }); }
    }
  }
}
function estacionamento(x0, y0, x1, y1, r) {
  chao(x0, y0, x1, y1, TL.ESTAC);
  const vert = (x1 - x0) < (y1 - y0);
  if (vert) for (let y = y0; y <= y1; y++) { vagas.push({ x: (x0 + 0.7) * T, y: (y + 0.5) * T, a: 0 }); if (x1 - x0 >= 2) vagas.push({ x: (x1 + 0.3) * T, y: (y + 0.5) * T, a: Math.PI }); }
  else for (let x = x0; x <= x1; x++) { vagas.push({ x: (x + 0.5) * T, y: (y0 + 0.7) * T, a: Math.PI / 2 }); if (y1 - y0 >= 2) vagas.push({ x: (x + 0.5) * T, y: (y1 + 0.3) * T, a: -Math.PI / 2 }); }
}
function posto(x0, y0, x1, y1) {
  chao(x0, y0, x1, y1, TL.ESTAC);
  addPredio(x0, y0, Math.min(2, x1 - x0), 2, 0.25, '#ecf0f1', { teto: '#e74c3c', placa: 'POSTO' });
  deco.push({ t: 'bomba', x: (x0 + (x1 - x0) * 0.7 + 0.5) * T, y: ((y0 + y1) / 2 + 0.8) * T });
}
function montarParque(x0, y0, x1, y1, cima, r) {
  chao(x0, y0, x1, y1, TL.GRAMA);
  if (cima) {
    LUGAR.parque = { x: ((x0 + x1) / 2) * T, y: (y1 + 1) * T, nome: 'Parque Ibirasimas' };
  } else {
    // lago no meio
    const cx = (x0 + x1) / 2, cy = y0 + 2;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const d = Math.hypot((x + 0.5 - cx) / 3.2, (y + 0.5 - cy) / 2.6); if (d < 1) setTile(x, y, TL.AGUA); }
  }
  for (let k = 0; k < 10; k++) { const x = x0 + r() * (x1 - x0 + 1), y = y0 + r() * (y1 - y0 + 1); if (tile(x | 0, y | 0) === TL.GRAMA) deco.push({ t: 'arvore', x: x * T, y: y * T, s: 0.8 + r() * 0.6 }); }
  for (let x = x0; x <= x1; x++) if (tile(x, y0 + 5) === TL.GRAMA) setTile(x, y0 + 5, TL.TERRA);
}

function montarEspecial(nome, i, j, x0, y0, n, r) {
  const c = centroBloco(i, j), porta = portaBloco(i, j);
  const praca = () => { for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) setTile(x, y, TL.PRACA); };
  switch (nome) {
    case 'dudu':
      addPredio(x0 + 1, y0 + 2, 6, 6, 0.9, '#2d3436', { teto: '#1e272e', placa: 'DUDU.EXE', neon: '#00ff9c' });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 2; y++) setTile(x, y, TL.PRACA);
      LUGAR.dudu = { x: porta.x, y: (y0 + 1) * T, nome: 'Esconderijo do Dudu' }; break;
    case 'garagem': case 'garagemBH':
      addPredio(x0, y0 + 3, n, 5, 0.45, '#4a4a55', { teto: '#2f2f38', placa: 'GARAGEM', neon: '#ff9f1c' });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 3; y++) setTile(x, y, TL.PRACA);
      LUGAR[nome] = { x: porta.x, y: (y0 + 1.5) * T, nome: 'Garagem do Nerivan' }; break;
    case 'hospital':
      addPredio(x0, y0 + 2, n, 6, 1.0, '#e8ecef', { teto: '#cfd8dc', placa: 'HOSPITAL', cruz: true });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 2; y++) setTile(x, y, TL.PRACA);
      LUGAR.hospital = { x: porta.x, y: (y0 + 1) * T, nome: 'Hospital' }; break;
    case 'policia': case 'gelado':
      addPredio(x0, y0 + 2, n, 6, nome === 'gelado' ? 1.4 : 0.8, nome === 'gelado' ? '#1f2a44' : '#34495e', { teto: '#22313f', placa: nome === 'gelado' ? 'SEGURANÇA GELADO' : 'POLÍCIA', neon: '#3498db' });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 2; y++) setTile(x, y, TL.PRACA);
      LUGAR[nome] = { x: porta.x, y: (y0 + 1) * T, nome: nome === 'gelado' ? 'Central do Segurança Gelado' : 'Delegacia' }; break;
    case 'cas':
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) setTile(x, y, TL.GRAMA);
      addPredio(x0 + 2, y0 + 3, 4, 4, 0.3, '#e9d8a6', { teto: '#9b4d3a', placa: 'CASA DO TIO CAS' });
      LUGAR.cas = { x: (x0 + 4) * T, y: (y0 + 2.4) * T, nome: 'Varanda do Tio Cas' };
      deco.push({ t: 'cadeira', x: (x0 + 4) * T, y: (y0 + 2.6) * T });
      deco.push({ t: 'arvore', x: (x0 + 0.8) * T, y: (y0 + 1) * T, s: 1.1 }); break;
    case 'skate':
      praca();
      for (let k = 0; k < 4; k++) deco.push({ t: 'rampa', x: (x0 + 1.5 + (k % 2) * 4.5) * T, y: (y0 + 1.5 + (k >> 1) * 4.5) * T, a: k * Math.PI / 2 });
      deco.push({ t: 'bowl', x: c.x, y: c.y });
      LUGAR.skate = { x: c.x, y: c.y + 2 * T, nome: 'Pista de Skate' }; break;
    case 'padaria':
      addPredio(x0 + 1, y0 + 2, 6, 5, 0.4, '#d9a066', { teto: '#8e5a2b', placa: 'PADARIA' });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 2; y++) setTile(x, y, TL.PRACA);
      LUGAR.padaria = { x: porta.x, y: (y0 + 1) * T, nome: 'Padaria' }; break;
    case 'mercado':
      addPredio(x0, y0 + 3, n, 5, 0.5, '#7f8c8d', { teto: '#5d6d7e', placa: 'MERCADÃO' });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 3; y++) setTile(x, y, TL.PRACA);
      LUGAR.mercado = { x: porta.x, y: (y0 + 1.5) * T, nome: 'Mercadão' }; break;
    case 'armas':
      addPredio(x0 + 1, y0 + 2, 6, 6, 0.6, '#3d3d3d', { teto: '#2a2a2a', placa: 'ARSENAL', neon: '#e74c3c' });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 2; y++) setTile(x, y, TL.PRACA);
      LUGAR.armas = { x: porta.x, y: (y0 + 1) * T, nome: 'Arsenal' }; break;
    case 'roupas':
      addPredio(x0 + 1, y0 + 2, 6, 6, 0.7, '#8e44ad', { teto: '#6c3483', placa: 'SIMAS STORE', neon: '#ff6ec7' });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 2; y++) setTile(x, y, TL.PRACA);
      LUGAR.roupas = { x: porta.x, y: (y0 + 1) * T, nome: 'Simas Store (roupas)' }; break;
    case 'yori':
      for (let y = y0 - 1; y < y0 + n + 1; y++) for (let x = x0 - 1; x < x0 + n + 1; x++) setTile(x, y, tile(x, y) === TL.CALCADA ? TL.TERRA : TL.ROCA);
      for (let y = y0; y < y0 + 3; y++) for (let x = x0; x < x0 + n; x++) setTile(x, y, TL.TERRA);
      addPredio(x0 + 1, y0 + 4, 4, 3, 0.35, '#c8a165', { teto: '#8b3a2b', placa: 'SÍTIO DO YORI' });
      addPredio(x0 + 6, y0 + 4, 2, 4, 0.5, '#a33', { teto: '#7a2020' });
      LUGAR.yori = { x: porta.x, y: (y0 + 1.5) * T, nome: 'Sítio do Yori (Juazeiro)' }; break;
    case 'nauj':
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) setTile(x, y, TL.AREIA);
      deco.push({ t: 'barraca', x: c.x, y: c.y });
      for (let k = 0; k < 5; k++) deco.push({ t: 'palmeira', x: (x0 + r() * 8) * T, y: (y0 + r() * 8) * T, s: 1 });
      LUGAR.nauj = { x: c.x, y: c.y + T, nome: 'Barraca do Nauj (Rio)' }; break;
    case 'baile':
      praca();
      deco.push({ t: 'palco', x: c.x, y: (y0 + 2) * T });
      for (let k = 0; k < 4; k++) deco.push({ t: 'caixa_som', x: (x0 + 1 + k * 2) * T, y: (y0 + 1) * T });
      LUGAR.baile = { x: c.x, y: c.y + T, nome: 'Baile do Meco (BH)' }; break;
    case 'matheus':
      for (let y = y0 - 1; y < y0 + n + 1; y++) for (let x = x0 - 1; x < x0 + n + 1; x++) setTile(x, y, TL.PISTA);
      LUGAR.matheus = { x: c.x, y: c.y, nome: 'Laboratório do Matheus' }; break;
    case 'cafe':
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) setTile(x, y, TL.PRACA);
      addPredio(x0 + 1, y0 + 3, 6, 5, 0.45, '#6e4b2a', { teto: '#4a3219', placa: 'CAFÉ DO PORTO', neon: '#f5cba7' });
      for (let k = 0; k < 4; k++) deco.push({ t: 'mesa', x: (x0 + 1.5 + k * 1.7) * T, y: (y0 + 1.6) * T });
      LUGAR.cafe = { x: porta.x, y: (y0 + 2.4) * T, nome: 'Café do Porto (Recife)' }; break;
    case 'motors':
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) setTile(x, y, TL.ESTAC);
      addPredio(x0 + 1, y0 + 4, 6, 4, 0.55, '#d0d3d4', { teto: '#2e4053', placa: 'SIMAS MOTORS', neon: '#3498db' });
      LUGAR.motors = { x: porta.x, y: (y0 + 2.2) * T, nome: 'Simas Motors' }; break;
    case 'fatal':
      addPredio(x0 + 1, y0 + 2, 6, 6, 0.8, '#6b1240', { teto: '#4a0c2c', placa: 'FATAL MODEL', neon: '#ff3d8b' });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 2; y++) setTile(x, y, TL.PRACA);
      deco.push({ t: 'tapete', x: porta.x, y: (y0 + 1.4) * T });
      LUGAR.fatal = { x: porta.x, y: (y0 + 1) * T, nome: 'Fatal Model' }; break;
    case 'poli':
      addPredio(x0 + 1, y0 + 2, 6, 6, 1.1, '#3c2a6b', { teto: '#2a1d4d', placa: 'RÁDIO POLI FM', neon: '#a29bfe', antena: true });
      for (let x = x0; x < x0 + n; x++) for (let y = y0; y < y0 + 2; y++) setTile(x, y, TL.PRACA);
      LUGAR.poli = { x: porta.x, y: (y0 + 1) * T, nome: 'Rádio Poli FM' }; break;
    case 'desmanche':
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) setTile(x, y, TL.CAIS);
      addPredio(x0 + 1, y0 + 4, 6, 4, 0.6, '#6e2c00', { teto: '#4a2000', placa: 'DESMANCHE', neon: '#fd79a8' });
      for (let k = 0; k < 3; k++) deco.push({ t: 'sucata', x: (x0 + 1 + k * 2.5) * T, y: (y0 + 1.2) * T });
      LUGAR.desmanche = { x: porta.x, y: (y0 + 2.6) * T, nome: 'Desmanche' }; break;
    case 'ltzin':
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) setTile(x, y, TL.CAIS);
      addPredio(x0 + 1, y0 + 4, 6, 4, 1.2, '#b8860b', { teto: '#8b6508', placa: 'REI DE RECIFE', neon: '#f1c40f' });
      LUGAR.ltzin = { x: porta.x, y: (y0 + 2) * T, nome: 'Palácio do Rei de Recife' }; break;
  }
}

// ---------- Indonésia: ilha a leste de Recife, ligada por uma ponte comprida ----------
function estrada(pts, larg = 1.3) { // pinta estrada curva passando pelos pontos (em tiles)
  for (let k = 0; k < pts.length - 1; k++) {
    const [ax, ay] = pts[k], [bx, by] = pts[k + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 3);
    for (let s = 0; s <= n; s++) {
      const x = lerp(ax, bx, s / n), y = lerp(ay, by, s / n);
      for (let yy = Math.floor(y - larg); yy <= Math.ceil(y + larg); yy++) for (let xx = Math.floor(x - larg); xx <= Math.ceil(x + larg); xx++) {
        if (Math.hypot(xx + 0.5 - x, yy + 0.5 - y) > larg) continue;
        const t = tile(xx, yy); if (t === TL.RUA) continue;
        if (t === TL.AGUA) ponte[yy * MW + xx] = 1;
        if (t !== TL.PREDIO) setTile(xx, yy, TL.ESTRADA);
      }
    }
  }
}
function curva(f, a, b, passo = 2) { const pts = []; for (let t = a; t <= b; t += passo) pts.push(f(t)); pts.push(f(b)); return pts; }
function gerarIndonesia(r) {
  const cx = 222, cy = 128;
  for (let y = 50; y < 210; y++) for (let x = CIDADE; x < MW - 2; x++) {
    const rx = 18 + ruido(y, 21) * 6, ry = 70;
    const d = Math.hypot((x - cx - Math.sin(y * 0.05) * 4) / rx, (y - cy) / ry);
    if (d < 1) setTile(x, y, d > 0.88 ? TL.AREIA : TL.GRAMA);
  }
  // terraço de arroz
  for (let y = 70; y < 190; y++) for (let x = 210; x < 236; x++) if (tile(x, y) === TL.GRAMA && Math.sin(y * 0.5) > 0.2 && ruido(x + y, 3) > 0.45) setTile(x, y, TL.ROCA);
  // ponte comprida de Recife até a ilha (continua a rua da linha 13)
  for (let x = 182; x < 212; x++) for (const y of [GRID * 13, GRID * 13 + 1]) { if (tile(x, y) === TL.AGUA) ponte[y * MW + x] = 1; setTile(x, y, TL.RUA); }
  // estrada curva dando a volta na ilha
  estrada(curva(t => [cx + Math.cos(t) * 13 + Math.sin(t * 3) * 1.5, cy + Math.sin(t) * 58], 0, Math.PI * 2 + 0.1, 0.05));
  estrada([[211, 157], [212, 157], [214, 160]]);
  // templo, casinhas e a barraca da Masadakun
  addPredio(217, 92, 8, 8, 0.9, '#b03a2e', { teto: '#7b241c', placa: 'PURA SIMAS', neon: '#f1c40f', pagode: true });
  for (const [x, y] of [[214, 140], [226, 146], [216, 168], [228, 112], [214, 118]]) if (retLivre(x, y, 3, 3)) addPredio(x, y, 3, 3, 0.3, pick(['#c8a165', '#a0522d', '#d2b48c']), { teto: '#5d4037', palha: true });
  LUGAR.masadakun = { x: 221 * T, y: 102 * T, nome: 'Templo (Indonésia)' };
  // Ilha do Gelado: só dá pra chegar de barco (ou nadando muito)
  for (let y = 18; y < 33; y++) for (let x = 207; x < 224; x++) { const d = Math.hypot((x - 215.5) / 7, (y - 25.5) / 6); if (d < 1) setTile(x, y, d > 0.65 ? TL.AREIA : TL.GRAMA); }
  for (let k = 0; k < 6; k++) deco.push({ t: 'palmeira', x: (211 + r() * 9) * T, y: (21 + r() * 9) * T, s: 1 });
  LUGAR.ilha = { x: 215.5 * T, y: 25.5 * T };
  LUGAR.indonesia = { x: 214 * T, y: 157 * T };
  for (let k = 0; k < 140; k++) { const x = 196 + r() * 46, y = 55 + r() * 150; const t = tile(x | 0, y | 0); if (t === TL.GRAMA || t === TL.AREIA) deco.push({ t: t === TL.AREIA ? 'palmeira' : (r() < 0.5 ? 'palmeira' : 'arvore'), x: x * T, y: y * T, s: 0.8 + r() * 0.6, selva: true }); }
}
// ---------- Serra do Simas: morro ao sul, estrada cheia de curva ----------
function gerarSerra(r) {
  for (let y = CIDADE; y < 238; y++) for (let x = 14; x < 180; x++) {
    const topo = 196 + ruido(x, 31) * 5, fundo = 236 - ruido(x, 37) * 5, esq = 18 + ruido(y, 41) * 6, dir = 176 - ruido(y, 43) * 6;
    if (y > topo && y < fundo && x > esq && x < dir) setTile(x, y, ruido(x * 1.7 + y, 7) > 0.62 ? TL.TERRA : TL.GRAMA);
  }
  // duas ligações com a cidade (continuação das ruas verticais 7 e 3)
  for (const kx of [3, 7]) for (let y = 180; y < 204; y++) for (const x of [GRID * kx, GRID * kx + 1]) { if (tile(x, y) === TL.AGUA) ponte[y * MW + x] = 1; setTile(x, y, TL.RUA); }
  // estrada sinuosa de ponta a ponta + subida pro mirante
  estrada(curva(t => [t, 214 + Math.sin(t * 0.09) * 9 + Math.sin(t * 0.031) * 4], 26, 168, 0.5));
  estrada([[GRID * 3 + 1, 203], [GRID * 3 + 1, 205], [37, 214 + Math.sin(37 * 0.09) * 9 + Math.sin(37 * 0.031) * 4]]);
  estrada([[GRID * 7 + 1, 203], [GRID * 7 + 1, 206], [85, 214 + Math.sin(85 * 0.09) * 9 + Math.sin(85 * 0.031) * 4]]);
  estrada(curva(t => [120 + Math.sin(t * 0.7) * 8, t], 214, 232, 0.4));
  LUGAR.mirante = { x: 120 * T, y: 232 * T, nome: 'Mirante da Serra' };
  for (let y = 230; y < 236; y++) for (let x = 115; x < 126; x++) if (tile(x, y) !== TL.AGUA) setTile(x, y, TL.PRACA);
  for (let k = 0; k < 260; k++) { const x = 16 + r() * 162, y = 196 + r() * 42, t = tile(x | 0, y | 0); if (t === TL.GRAMA || t === TL.TERRA) deco.push({ t: r() < 0.75 ? 'arvore' : 'pedra', x: x * T, y: y * T, s: 0.9 + r() * 0.7 }); }
}
// ---------- Litoral Sul: faixa de praia nova, rodovia cheia de curva, autódromo e farol ----------
function gerarLitoral(r) {
  const yTopo = x => 247 + ruido(x, 51) * 5, yFundo = x => 289 - ruido(x, 57) * 5;
  for (let y = 240; y < MH - 2; y++) for (let x = 16; x < MW - 6; x++) {
    const esq = 18 + ruido(y, 61) * 5, dir = MW - 10 - ruido(y, 63) * 6;
    if (y > yTopo(x) && y < yFundo(x) && x > esq && x < dir) setTile(x, y, y > yFundo(x) - 7 ? TL.AREIA : (ruido(x * 1.3 + y, 9) > 0.66 ? TL.TERRA : TL.GRAMA));
  }
  // rodovia da orla, de ponta a ponta, toda serpenteando
  const orla = t => [t, 266 + Math.sin(t * 0.045) * 7 + Math.sin(t * 0.13) * 2.5];
  estrada(curva(orla, 24, MW - 14, 0.4), 1.5);
  // ligações: da Serra (descendo o morro), do mirante e da ponta sul da Indonésia (ponte comprida)
  estrada(curva(t => [168 + Math.sin(t * 0.25) * 6, t], 214 + Math.sin(168 * 0.09) * 9, 262, 0.4), 1.4);
  estrada(curva(t => [120 + Math.sin(t * 0.4) * 5, t], 232, 266, 0.4), 1.3);
  estrada(curva(t => [222 + Math.sin(t * 0.12) * 10, t], 186, 266, 0.4), 1.4);
  // autódromo Simas: circuito fechado cheio de curva
  const pista = t => [62 + Math.cos(t) * 30 + Math.sin(t * 2) * 5, 274 + Math.sin(t) * 9 + Math.cos(t * 3) * 2];
  for (let y = 260; y < 288; y++) for (let x = 28; x < 98; x++) if (tile(x, y) === TL.GRAMA || tile(x, y) === TL.TERRA) setTile(x, y, TL.GRAMA);
  estrada(curva(pista, 0, Math.PI * 2 + 0.05, 0.03), 1.7);
  LUGAR.autodromo = { x: pista(0)[0] * T, y: pista(0)[1] * T, nome: 'Autódromo Simas' };
  LUGAR.pistaPts = []; for (let k = 1; k <= 10; k++) { const p = pista(k / 10 * Math.PI * 2); LUGAR.pistaPts.push({ x: p[0] * T, y: p[1] * T }); }
  addPredio(56, 262, 12, 3, 0.35, '#c0392b', { teto: '#7b241c', placa: 'AUTÓDROMO SIMAS', neon: '#ff6ec7' });
  // farol na ponta leste
  const fx = MW - 22, fy = 272;
  addPredio(fx, fy, 4, 4, 1.4, '#ecf0f1', { teto: '#c0392b', placa: 'FAROL', neon: '#ffe600' });
  LUGAR.farol = { x: (fx + 2) * T, y: (fy + 5.5) * T, nome: 'Farol do Simas' };
  // vila de pescador, quiosques e casinhas de praia
  for (let k = 0; k < 26; k++) { const x = 100 + Math.floor(r() * (MW - 130)), y = 250 + Math.floor(r() * 30); if (retLivre(x, y, 3, 3) && Math.abs(y - orla(x)[1]) > 4) addPredio(x, y, 3, 3, 0.25 + r() * 0.3, pick(['#c8a165', '#5dade2', '#f5b7b1', '#a3e4d7', '#f9e79f']), { teto: pick(['#5d4037', '#c0392b', '#2471a3']), palha: r() < 0.5 }); }
  for (let k = 0; k < 10; k++) { const x = 30 + Math.floor(r() * (MW - 50)); for (let y = 280; y < 292; y++) if (tile(x, y) === TL.AREIA && tile(x, y + 3) === TL.AREIA && retLivre(x, y, 2, 2)) { addPredio(x, y, 2, 2, 0.2, '#f5cba7', { teto: '#e74c3c', palha: true, placa: k % 2 ? 'COCO' : 'QUIOSQUE' }); break; } }
  LUGAR.litoral = { x: 200 * T, y: orla(200)[1] * T };
  for (let k = 0; k < 220; k++) { const x = 20 + r() * (MW - 30), y = 246 + r() * 46, t = tile(x | 0, y | 0); if (t === TL.AREIA) deco.push({ t: 'palmeira', x: x * T, y: y * T, s: 1 }); else if (t === TL.GRAMA && r() < 0.5) deco.push({ t: r() < 0.8 ? 'arvore' : 'pedra', x: x * T, y: y * T, s: 0.9 + r() * 0.5 }); }
}
// ---------- orla do Rio: avenida curva na beira da praia (oeste) ----------
function orlaDoRio(r) {
  const xo = y => 3 + ruido(y, 1) * 7 + 2.6;
  estrada(curva(t => [xo(t), t], 112, 186, 0.4), 1.3);
  for (const k of [10, 11, 12, 13, 14]) { const y = GRID * k + 1; estrada([[xo(y), y], [GRID + 0.5, y]], 1.2); }
}
// ---------- poste, hidrante, lixeira e placa nas calçadas (tudo dá pra derrubar de carro) ----------
function mobiliaUrbana(r) {
  for (let y = 0; y < CIDADE; y++) for (let x = 0; x < CIDADE; x++) {
    if (tile(x, y) !== TL.CALCADA) continue;
    const h = ((x * 92821) ^ (y * 68917)) >>> 0, reg = regiaoTile[y * MW + x];
    let lado = null;
    if (ehRua(x, y + 1)) lado = [0.5, 0.85]; else if (ehRua(x, y - 1)) lado = [0.5, 0.15]; else if (ehRua(x + 1, y)) lado = [0.85, 0.5]; else if (ehRua(x - 1, y)) lado = [0.15, 0.5];
    if (!lado) continue;
    const px = (x + lado[0]) * T, py = (y + lado[1]) * T;
    if ((x + y) % 5 === 0 && h % 3 === 0) deco.push({ t: 'poste', x: px, y: py, a: Math.atan2(lado[1] - 0.5, lado[0] - 0.5) });
    else if (h % 29 === 0) deco.push({ t: 'hidrante', x: px, y: py });
    else if (h % 23 === 0) deco.push({ t: 'lixeira', x: px, y: py });
    else if (h % 41 === 0 && reg === REG.CENTRO) deco.push({ t: 'placa', x: px, y: py, txt: pick(['PARE', 'BH →', 'RECIFE →', 'PROIBIDO VAGABUNDAGEM', 'DEVAGAR', 'CUIDADO: IDOSAS AO TELEFONE']) });
    else if (h % 13 === 0 && reg === REG.CENTRO) deco.push({ t: 'arvore', x: px, y: py, s: 0.6 });
  }
}

// ---------- índice espacial da decoração (desenho e batida) ----------
const DCEL = 4 * T, DGRADE = new Map();
const COLIDE = { arvore: { r: 13, solido: true }, pedra: { r: 24, solido: true }, palmeira: { r: 9, quebra: 330 }, poste: { r: 6, quebra: 70 }, hidrante: { r: 8, quebra: 50 },
  lixeira: { r: 10, quebra: 30 }, placa: { r: 6, quebra: 50 }, banco: { r: 16, quebra: 60 }, cacto: { r: 11, quebra: 50 }, guarda_sol: { r: 14, quebra: 40 }, conteiner: { r: 30, solido: true } };
function indexarDeco() {
  DGRADE.clear();
  for (const d of deco) { const k = Math.floor(d.x / DCEL) + ',' + Math.floor(d.y / DCEL); let l = DGRADE.get(k); if (!l) DGRADE.set(k, l = []); l.push(d); }
}
function decoNaArea(x0, y0, x1, y1, fn) {
  for (let cy = Math.floor(y0 / DCEL); cy <= Math.floor(y1 / DCEL); cy++) for (let cx = Math.floor(x0 / DCEL); cx <= Math.floor(x1 / DCEL); cx++) { const l = DGRADE.get(cx + ',' + cy); if (l) for (const d of l) fn(d); }
}

// mini-mapa pré-desenhado (1 pixel por tile)
let MINI = null;
const COR_MINI = { [TL.AGUA]: '#1e4e8c', [TL.AREIA]: '#e8d18f', [TL.GRAMA]: '#356b35', [TL.RUA]: '#9a9aa6', [TL.CALCADA]: '#5c5a66', [TL.PREDIO]: '#2b2934', [TL.PRACA]: '#6f6a78', [TL.ROCA]: '#6b7f2a', [TL.TERRA]: '#9a7a4a', [TL.PISTA]: '#555', [TL.CAIS]: '#6d6d6d', [TL.ESTAC]: '#56565e', [TL.BECO]: '#4d4a55', [TL.ESTRADA]: '#8a8a94' };
function gerarMini() {
  MINI = document.createElement('canvas'); MINI.width = MW; MINI.height = MH;
  const c = MINI.getContext('2d'), img = c.createImageData(MW, MH);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const hex = COR_MINI[tile(x, y)] || '#000', v = parseInt(hex.slice(1), 16), o = (y * MW + x) * 4;
    img.data[o] = v >> 16; img.data[o + 1] = (v >> 8) & 255; img.data[o + 2] = v & 255; img.data[o + 3] = 255;
  }
  c.putImageData(img, 0, 0);
}

// faixas (pistas) pra trânsito: mão direita
// direção: 0 = leste, 1 = sul, 2 = oeste, 3 = norte
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
function centroFaixa(dir, eixo) {
  // eixo = índice da rua (k): rua vertical em x = 12k, 12k+1 ; horizontal em y = 12k, 12k+1
  if (dir === 1) return (GRID * eixo + 0.5) * T;      // descendo: coluna da esquerda (x=12k)
  if (dir === 3) return (GRID * eixo + 1.5) * T;      // subindo: coluna da direita
  if (dir === 0) return (GRID * eixo + 1.5) * T;      // pra leste: linha de baixo
  return (GRID * eixo + 0.5) * T;                     // pra oeste: linha de cima
}
