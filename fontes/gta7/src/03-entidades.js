// =========================================================
// ENTIDADES: jogador, pedestres, carros, polícia, tiros, itens
// =========================================================
const ARMAS = {
  punho:     { nome: 'Soco', icone: '👊', dano: 18, cad: 0.4, alcance: 34, vel: 0, bala: 0 },
  pistola:   { nome: 'Pistola', icone: '🔫', dano: 26, cad: 0.32, alcance: 650, vel: 1100, bala: 1, espalha: 0.04 },
  uzi:       { nome: 'Submetralhadora', icone: '🔫', dano: 13, cad: 0.08, alcance: 600, vel: 1150, bala: 1, espalha: 0.1 },
  escopeta:  { nome: 'Escopeta', icone: '💥', dano: 15, cad: 0.85, alcance: 380, vel: 1000, bala: 7, espalha: 0.28 },
  foguete:   { nome: 'Lança-foguete', icone: '🚀', dano: 0, cad: 1.2, alcance: 900, vel: 620, bala: 1, espalha: 0, explode: true },
  taco:      { nome: 'Taco de Beisebol', icone: '🏏', dano: 40, cad: 0.5, alcance: 44, vel: 0, bala: 0, corpo: true },
  fuzil:     { nome: 'Fuzil', icone: '🔫', dano: 24, cad: 0.11, alcance: 800, vel: 1400, bala: 1, espalha: 0.05 },
  granada:   { nome: 'Granada', icone: '💣', dano: 0, cad: 0.9, alcance: 420, vel: 520, bala: 1, joga: 'granada' },
  molotov:   { nome: 'Coquetel Molotov', icone: '🍾', dano: 0, cad: 0.9, alcance: 380, vel: 480, bala: 1, joga: 'molotov' },
  lancachamas: { nome: 'Lança-chamas', icone: '🔥', dano: 5, cad: 0.04, alcance: 180, vel: 420, bala: 1, chama: true }
};
const ORDEM_ARMAS = ['punho', 'taco', 'pistola', 'uzi', 'fuzil', 'escopeta', 'granada', 'molotov', 'lancachamas', 'foguete'];

const TIPOS_CARRO = {
  popular:  { nome: 'Uno com escada', vmax: 520, acel: 380, curva: 2.6, aderencia: 6, hp: 110, w: 38, l: 74, cores: ['#d0d0d0', '#c0392b', '#2e86c1', '#f4d03f', '#117a65'] },
  sedan:    { nome: 'Corsa Rebaixado', vmax: 600, acel: 420, curva: 2.4, aderencia: 6.5, hp: 130, w: 42, l: 84, cores: ['#1c2833', '#7b241c', '#d5d8dc', '#5d6d7e', '#6c3483'] },
  esporte:  { nome: 'Opala Turbo', vmax: 780, acel: 620, curva: 2.7, aderencia: 7.5, hp: 120, w: 42, l: 86, cores: ['#e74c3c', '#f1c40f', '#ff6ec7', '#1abc9c', '#111'] },
  pickup:   { nome: 'Hilux do Sítio', vmax: 560, acel: 400, curva: 2.2, aderencia: 5.5, hp: 170, w: 46, l: 92, cores: ['#7e5109', '#f0f3f4', '#922b21', '#1b4f72'] },
  caminhao: { nome: 'Caminhão de Carga', vmax: 430, acel: 260, curva: 1.7, aderencia: 5, hp: 260, w: 54, l: 128, cores: ['#d35400', '#2471a3'] },
  policia:  { nome: 'Viatura', vmax: 690, acel: 520, curva: 2.6, aderencia: 7, hp: 160, w: 44, l: 88, cores: ['#f8f9f9'], policia: true },
  gelado:   { nome: 'SUV do Segurança Gelado', vmax: 720, acel: 560, curva: 2.4, aderencia: 7, hp: 320, w: 50, l: 96, cores: ['#0b0b0b'], policia: true, gelado: true },
  fusca:    { nome: 'Fusca Azul', vmax: 460, acel: 330, curva: 2.7, aderencia: 6, hp: 100, w: 38, l: 70, cores: ['#5dade2', '#f4d03f', '#e74c3c', '#ecf0f1'], fusca: true },
  gol:      { nome: 'Gol Bola', vmax: 560, acel: 410, curva: 2.6, aderencia: 6.3, hp: 115, w: 40, l: 78, cores: ['#c0392b', '#ecf0f1', '#2c3e50', '#7f8c8d'] },
  taxi:     { nome: 'Táxi', vmax: 580, acel: 420, curva: 2.5, aderencia: 6.5, hp: 125, w: 42, l: 84, cores: ['#f1c40f'], taxi: true },
  lambo:    { nome: 'Lamborghini Genérica', vmax: 980, acel: 880, curva: 2.9, aderencia: 8, hp: 110, w: 46, l: 88, cores: ['#a3e635', '#ff6ec7', '#f39c12', '#111'], lambo: true },
  sw4:      { nome: 'SW4 Blindada', vmax: 650, acel: 470, curva: 2.3, aderencia: 6.8, hp: 280, w: 48, l: 94, cores: ['#111', '#ecf0f1', '#566573'] },
  onibus:   { nome: 'Ônibus da Linha 171', vmax: 400, acel: 220, curva: 1.5, aderencia: 5, hp: 320, w: 56, l: 150, cores: ['#2471a3', '#c0392b', '#1e8449'], onibus: true },
  biz:      { nome: 'Biz do Entregador', vmax: 540, acel: 560, curva: 3.6, aderencia: 7.5, hp: 50, w: 18, l: 46, cores: ['#c0392b', '#ecf0f1', '#f39c12'], moto: true },
  cg:       { nome: 'CG Titan 160', vmax: 640, acel: 650, curva: 3.5, aderencia: 7.5, hp: 60, w: 18, l: 50, cores: ['#111', '#c0392b', '#2471a3'], moto: true },
  trilha:   { nome: 'Moto de Trilha', vmax: 660, acel: 760, curva: 3.8, aderencia: 6.5, hp: 65, w: 18, l: 50, cores: ['#f39c12', '#27ae60', '#ecf0f1'], moto: true },
  xj6:      { nome: 'XJ6 do Grau', vmax: 900, acel: 950, curva: 3.4, aderencia: 8, hp: 70, w: 20, l: 54, cores: ['#111', '#ff6ec7', '#2980b9'], moto: true },
  lancha:   { nome: 'Lancha', vmax: 640, acel: 420, curva: 2.0, aderencia: 2.2, hp: 200, w: 40, l: 96, cores: ['#ecf0f1', '#2471a3', '#c0392b'], barco: true },
  jetski:   { nome: 'Jet Ski', vmax: 720, acel: 650, curva: 3.0, aderencia: 2.6, hp: 90, w: 22, l: 52, cores: ['#f1c40f', '#ff6ec7', '#1abc9c'], barco: true, jetski: true },
  choque:   { nome: 'Choque-Móvel do Ltzin', vmax: 600, acel: 500, curva: 2.2, aderencia: 7, hp: 1800, w: 60, l: 112, cores: ['#d4ac0d'], chefe: true }
};

const PELES = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'];
const CABELOS = ['#111', '#3b2412', '#6b4423', '#c9a227', '#222'];
const CAMISAS = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1', '#34495e', '#e67e22', '#16a085', '#d35400'];

// ---------- estado do mundo ----------
const W = {
  jog: null, peds: [], carros: [], balas: [], efeitos: [], itens: [], manchas: [], foguetes: [], jogados: [], chamas: [], fogos: [],
  procurado: 0, calor: 0, semVer: 0, tempo: 0, chefes: [], escudos: []
};

function novoJogador(x, y) {
  return { tipo: 'jog', x, y, a: 0, vx: 0, vy: 0, hp: 100, colete: 0, carro: null, arma: 'punho', municao: { punho: Infinity, pistola: 0, uzi: 0, escopeta: 0, foguete: 0, taco: 0, fuzil: 0, granada: 0, molotov: 0, lancachamas: 0 },
    tem: { punho: true }, recarga: 0, anda: 0, grana: 200, camisa: '#ff6ec7', calca: '#1a1a2e', chapeu: null, oculos: false, pele: '#c68642', cabelo: '#111', morto: false };
}

function novoPed(x, y, extra = {}) {
  return { tipo: 'ped', x, y, a: rnd(Math.PI * 2), vel: rnd(45, 70), dir: rndi(0, 3), hp: 30, pele: pick(PELES), cabelo: pick(CABELOS), camisa: pick(CAMISAS),
    medo: 0, anda: rnd(10), troca: rnd(1, 4), ...extra };
}

function novoCarro(tipo, x, y, a, extra = {}) {
  const t = TIPOS_CARRO[tipo];
  return { tipo: 'carro', modelo: tipo, x, y, a, vel: 0, vx: 0, vy: 0, hp: t.hp, hpMax: t.hp, cor: extra.cor || pick(t.cores), w: t.w, l: t.l,
    motor: 0, blind: 0, motorista: null, ia: null, fogo: 0, lixo: false, sirene: !!t.policia, policia: !!t.policia, chefe: !!t.chefe, derrapa: 0, ...extra };
}

// ---------- spawn de trânsito e pedestres em volta da câmera ----------
function pontoNaRuaPerto(cx, cy, rmin, rmax) {
  for (let tent = 0; tent < 20; tent++) {
    const ang = rnd(Math.PI * 2), d = rnd(rmin, rmax);
    const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d;
    const tx = Math.floor(x / T), ty = Math.floor(y / T);
    if (!ehRua(tx, ty)) continue;
    const vert = tx % GRID < 2, hor = ty % GRID < 2;
    if (vert && hor) continue; // não nasce no cruzamento
    if (vert) { const dir = rnd() < 0.5 ? 1 : 3, k = Math.floor(tx / GRID); return { x: centroFaixa(dir, k), y: (ty + 0.5) * T, dir }; }
    if (hor) { const dir = rnd() < 0.5 ? 0 : 2, k = Math.floor(ty / GRID); return { x: (tx + 0.5) * T, y: centroFaixa(dir, k), dir }; }
  }
  return null;
}
function pontoNaCalcadaPerto(cx, cy, rmin, rmax) {
  for (let tent = 0; tent < 25; tent++) {
    const ang = rnd(Math.PI * 2), d = rnd(rmin, rmax);
    const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d;
    const t = tileEm(x, y);
    if (t === TL.CALCADA || t === TL.PRACA || t === TL.AREIA || t === TL.TERRA || t === TL.BECO) return { x: Math.floor(x / T) * T + T / 2, y: Math.floor(y / T) * T + T / 2 };
  }
  return null;
}
function modeloDaRegiao(reg) {
  if (reg === REG.JUAZEIRO) return pick(['pickup', 'pickup', 'popular', 'caminhao', 'trilha', 'cg', 'fusca']);
  if (reg === REG.RECIFE) return pick(['caminhao', 'sedan', 'popular', 'pickup', 'onibus', 'biz', 'gol', 'taxi']);
  if (reg === REG.BH) return pick(['popular', 'popular', 'sedan', 'gol', 'cg', 'biz', 'fusca', 'onibus']);
  if (reg === REG.INDONESIA) return pick(['biz', 'biz', 'cg', 'trilha', 'popular']);
  if (reg === REG.SERRA) return pick(['pickup', 'trilha', 'sw4', 'fusca']);
  return pick(['popular', 'sedan', 'sedan', 'esporte', 'popular', 'pickup', 'taxi', 'taxi', 'gol', 'fusca', 'biz', 'cg', 'xj6', 'sw4', 'onibus', 'lambo']);
}

function povoar(dt, vw, vh) {
  const j = W.jog, cx = cam.x, cy = cam.y, raio = Math.hypot(vw, vh) / 2;
  // tira o que ficou longe
  W.peds = W.peds.filter(p => p.fixo || p.missao || dist(p.x, p.y, cx, cy) < raio * 2.2);
  W.carros = W.carros.filter(c => c === j.carro || c.fixo || c.missao || c.gangue || c.guardado || (c.policia && W.procurado > 0) || dist(c.x, c.y, cx, cy) < raio * 2.4);
  const nPeds = W.peds.filter(p => !p.fixo).length, nCarros = W.carros.filter(c => c.ia && c.ia.tipo === 'transito').length;
  if (nPeds < 34) { const p = pontoNaCalcadaPerto(cx, cy, raio * 1.05, raio * 1.6); if (p) W.peds.push(novoPed(p.x, p.y)); }
  if (nCarros < 22) {
    const p = pontoNaRuaPerto(cx, cy, raio * 1.05, raio * 1.7);
    if (p && !W.carros.some(c => dist(c.x, c.y, p.x, p.y) < 150)) {
      const m = modeloDaRegiao(regiaoEm(p.x, p.y)), c = novoCarro(m, p.x, p.y, Math.atan2(DIRS[p.dir][1], DIRS[p.dir][0]));
      c.ia = { tipo: 'transito', dir: p.dir, decidiu: false, velAlvo: rnd(150, 240) };
      c.motorista = novoPed(c.x, c.y); c.vel = c.ia.velAlvo * 0.8;
      W.carros.push(c);
    }
  }
  // carros estacionados
  for (const v of vagas) {
    const d = dist(v.x, v.y, cx, cy);
    if (!v.tentou && d < raio * 1.6) { v.tentou = true; if (rnd() < 0.55 && !v.c) { const c = novoCarro(pick(['popular', 'popular', 'sedan', 'sedan', 'esporte', 'pickup']), v.x, v.y, v.a); c.vaga = v; v.c = c; W.carros.push(c); } }
    else if (v.tentou && d > raio * 2.8) { v.tentou = false; if (v.c && !W.carros.includes(v.c)) v.c = null; }
  }
  // polícia conforme o nível de procurado
  const policiais = W.carros.filter(c => c.ia && c.ia.tipo === 'policia' && c.hp > 0);
  const querem = Math.min(3, W.procurado) + (W.procurado >= 3 ? 1 : 0);
  if (W.procurado > 0 && policiais.length < querem && rnd() < dt * 0.5) {
    const p = pontoNaRuaPerto(j.x, j.y, raio * 1.1, raio * 1.6);
    if (p) {
      const ehGelado = W.procurado >= 3 && !policiais.some(c => c.modelo === 'gelado');
      const c = novoCarro(ehGelado ? 'gelado' : 'policia', p.x, p.y, Math.atan2(DIRS[p.dir][1], DIRS[p.dir][0]));
      c.ia = { tipo: 'policia' }; c.policia = true; c.motorista = novoPed(c.x, c.y, { policia: true, camisa: '#1f3a93' });
      if (ehGelado) { c.motorista.nome = 'Segurança Gelado'; c.motorista.rosto = 'gelado'; GELADO_AVISO = { t: 0 }; falar('gelado', pick(['PARADO AÍ NERIVAN! aqui é o SEGURANÇA GELADO', 'eu não faço menos que R$500 por dia, e hoje o dia é TEU', 'vai preso, vagabundo!']), 3); }
      W.carros.push(c);
    }
  }
}

// ---------- física dos carros ----------
function cantosCarro(c, folga = 0) {
  const ca = Math.cos(c.a), sa = Math.sin(c.a), hl = c.l / 2 + folga, hw = c.w / 2 + folga;
  return [[hl, hw], [hl, -hw], [-hl, hw], [-hl, -hw], [hl, 0], [-hl, 0], [0, hw], [0, -hw]].map(([px, py]) => [c.x + px * ca - py * sa, c.y + px * sa + py * ca]);
}
function bateuPredio(c) {
  if (TIPOS_CARRO[c.modelo].barco) { for (const [x, y] of cantosCarro(c)) if (!ehAguaBarco(x, y)) return true; return false; }
  for (const [x, y] of cantosCarro(c)) if (tileEm(x, y) === TL.PREDIO) return true; return false;
}

function fisicaCarro(c, dt, acel, freio, vira, freioMao) {
  const t = TIPOS_CARRO[c.modelo];
  const vmax = t.vmax * (1 + c.motor * 0.12) * (c.hp < c.hpMax * 0.25 ? 0.7 : 1);
  const fx = Math.cos(c.a), fy = Math.sin(c.a);
  // velocidade pra frente (no sentido do carro) e de lado
  let vFrente = c.vx * fx + c.vy * fy, vLado = -c.vx * fy + c.vy * fx;
  if (acel) vFrente += t.acel * (1 + c.motor * 0.15) * dt;
  if (freio) vFrente -= (vFrente > 20 ? t.acel * 1.6 : t.acel * 0.6) * dt;
  if (!acel && !freio) vFrente *= Math.pow(0.55, dt);
  vFrente = clamp(vFrente, -vmax * 0.4, vmax);
  const ader = freioMao ? 1.2 : t.aderencia;
  vLado *= Math.exp(-ader * dt);
  if (freioMao) vFrente *= Math.pow(0.35, dt);
  const fatorVira = clamp(Math.abs(vFrente) / 160, 0, 1) * Math.sign(vFrente || 1);
  c.a += vira * t.curva * fatorVira * dt * (freioMao ? 1.35 : 1);
  const nfx = Math.cos(c.a), nfy = Math.sin(c.a);
  c.vx = nfx * vFrente - nfy * vLado; c.vy = nfy * vFrente + nfx * vLado;
  c.derrapa = Math.abs(vLado);
  c.vel = vFrente;
  moverCarro(c, dt);
}

function moverCarro(c, dt) {
  const ox = c.x, oy = c.y;
  c.x += c.vx * dt; c.y += c.vy * dt;
  if (bateuPredio(c)) {
    const v = Math.hypot(c.vx, c.vy);
    // tenta deslizar em um eixo só
    c.x = ox + c.vx * dt; c.y = oy;
    if (bateuPredio(c)) { c.x = ox; c.y = oy + c.vy * dt; if (bateuPredio(c)) { c.x = ox; c.y = oy; c.vx *= -0.3; c.vy *= -0.3; } else c.vx *= -0.3; }
    else c.vy *= -0.3;
    if (v > 120) { danoCarro(c, v * 0.05); SOM.batida(v / 700); if (v > 300) tremer(4); if (c === W.jog.carro) { W.ultBatida = W.tempo; W.forcaBatida = v; if (TIPOS_CARRO[c.modelo].moto && v > 360) cairDaMoto(c, v); } }
  }
  // poste, árvore, hidrante...
  const alc = c.l * 0.5 + 30;
  decoNaArea(c.x - alc, c.y - alc, c.x + alc, c.y + alc, d => {
    if (d.quebrado) return; const cd = COLIDE[d.t]; if (!cd) return;
    const r = cd.r * (d.t === 'arvore' || d.t === 'pedra' ? (d.s || 1) : 1) + c.w * 0.42, dd = dist(c.x, c.y, d.x, d.y);
    if (dd >= r) return;
    const v = Math.hypot(c.vx, c.vy);
    if (cd.quebra && v > cd.quebra) { quebrarDeco(d, c); c.vx *= 0.8; c.vy *= 0.8; danoCarro(c, 3); return; }
    const nx = (c.x - d.x) / (dd || 1), ny = (c.y - d.y) / (dd || 1); c.x = d.x + nx * r; c.y = d.y + ny * r;
    const vn = c.vx * nx + c.vy * ny; if (vn < 0) { c.vx -= 1.5 * vn * nx; c.vy -= 1.5 * vn * ny; }
    if (v > 180) { danoCarro(c, v * 0.04); SOM.batida(v / 700); if (c === W.jog.carro) { W.ultBatida = W.tempo; W.forcaBatida = v; tremer(5); } }
  });
  // tá na água? afunda (barco não)
  if (!TIPOS_CARRO[c.modelo].barco && tileEm(c.x, c.y) === TL.AGUA && !ehPonte(Math.floor(c.x / T), Math.floor(c.y / T))) afundarCarro(c, dt);
}

function cairDaMoto(c, v) {
  const j = W.jog; if (j.carro !== c) return;
  j.carro = null; c.motorista = null; c.ia = null;
  const a = Math.atan2(c.vy, c.vx); j.x = c.x; j.y = c.y;
  for (let k = 0; k < 12; k++) { const nx = j.x + Math.cos(a) * 8, ny = j.y + Math.sin(a) * 8; if (solidoEm(nx, ny)) break; j.x = nx; j.y = ny; }
  ferirJogador(Math.min(40, v * 0.05)); tremer(10); SOM.atualizaMotor(0, false); RADIO.tocar(false);
  c.vx *= 0.2; c.vy *= 0.2;
  falar('luketa', pick(['VOOOOU! tomou um tombo da moto', 'capacete é pra quem tem medo né, Nerivan', 'caiu igual o Meco no campinho']), 2.5);
}
function quebrarDeco(d, c) {
  d.quebrado = W.tempo + 0.001; d.aQ = Math.atan2(c.vy, c.vx);
  SOM.batida(0.35); W.efeitos.push({ t: 'faisca', x: d.x, y: d.y, vida: 0.3, max: 0.3 });
  if (d.t === 'hidrante') { d.jorra = 10; }
  if (d.t === 'poste') for (let k = 0; k < 6; k++) W.efeitos.push({ t: 'faisca', x: d.x + rnd(-20, 20), y: d.y + rnd(-20, 20), vida: 0.4, max: 0.4 });
  if (c === W.jog.carro) { W.stats.quebrou = (W.stats.quebrou || 0) + 1; pontuar(5); if (d.t === 'hidrante' && rnd() < 0.3) falar('luketa', pick(['hidrante no chão! a SABESP vai te cobrar isso', 'que chuveirão, hein']), 2.5); }
}
function danoCarro(c, d, quem) {
  if (c.hp <= 0) return;
  if (DEUS && c === W.jog.carro) return;
  c.hp -= d / (1 + c.blind * 0.35);
  if (quem) c.ultimoDano = quem;
  if (c.hp <= 0 && c.aoZerar) { c.hp = 1; c.aoZerar(); c.aoZerar = null; return; }
  if (quem === W.jog && c.policia) crime(1);
  if (c.chefe && c.aoDano) c.aoDano(d);
  if (c.hp <= 0) {
    c.hp = 0; c.fogo = 2.5;
    if (c.policia && quem === W.jog) crime(1);
    if (quem === W.jog) pontuar(c.policia ? 80 : 40, 'CARRO DESTRUÍDO');
    // moto destruída: o motoqueiro cai morto
    const m = c.motorista;
    if (TIPOS_CARRO[c.modelo].moto && m && m !== W.jog) {
      c.fogo = 0.6; c.motorista = null; c.ia = null;
      m.x = c.x; m.y = c.y; m.hp = 0; m.morto = true; m.dentroCarro = false; W.peds.push(m);
      W.manchas.push({ t: 'sangue', x: m.x, y: m.y, r: 16, a: 0 });
      if (quem === W.jog) { matouMotoqueiro(c); conta('motoqueiros'); pontuar(30); }
    }
  }
}

// ---------- gangue dos motoqueiros: matou motoboy, eles vêm atrás ----------
W.raivaMoto = null;
function matouMotoqueiro(c) {
  const r = W.raivaMoto;
  if (!r) {
    W.raivaMoto = { ate: W.tempo + 120, vieram: 0, quer: 3, longe: 0 };
    falar('luketa', (c && c.modelo === 'biz') ? 'TU MATOU O MOTOBOY DO iFOME?! agora a GANGUE DOS MOTOQUEIRO vem atrás de tu!' : 'matou motoqueiro?! a GANGUE DOS MOTOQUEIRO vem aí, corre!', 4);
    SOM.buzina();
  } else { r.ate = W.tempo + 120; r.quer = Math.min(8, r.quer + 1); falar('luketa', pick(['mais um! agora vem mais moto', 'eles tão ficando PUTO', 'a gangue tá chamando reforço']), 2.5); }
}
function atualizaGangueMoto(dt) {
  const r = W.raivaMoto; if (!r) return;
  const j = W.jog, alvo = j.carro || j;
  const vivos = W.carros.filter(c => c.gangue && c.hp > 0 && c.motorista);
  if (dist(alvo.x, alvo.y, cam.x, cam.y) < 10 && false) return;
  if (vivos.every(c => dist(c.x, c.y, alvo.x, alvo.y) > 2600)) r.longe += dt; else r.longe = 0;
  if (W.tempo > r.ate || r.longe > 25 || j.morto) {
    for (const c of W.carros) if (c.gangue) { c.gangue = false; c.nome = null; c.ia = { tipo: 'transito', dir: rndi(0, 3), velAlvo: 200 }; }
    for (const p of W.peds) if (p.gangue && !p.morto) { p.gangue = false; p.hostil = false; p.ia = null; p.medo = 5; }
    W.raivaMoto = null; if (!j.morto) falar('luketa', 'os motoqueiro desistiram. ufa', 2.5); return;
  }
  if (vivos.length < r.quer && r.vieram < 14 && rnd() < dt * 0.9) {
    const raio = Math.hypot(VW, VH) / 2 / cam.zoom, p = pontoNaRuaPerto(alvo.x, alvo.y, raio * 1.05, raio * 1.5);
    if (p) {
      const c = novoCarro(rnd() < 0.5 ? 'biz' : 'cg', p.x, p.y, Math.atan2(alvo.y - p.y, alvo.x - p.x), { gangue: true, nome: 'MOTOQUEIRO 🏍️' });
      c.motorista = novoPed(c.x, c.y, { capacete: pick(['#111', '#c0392b', '#f1c40f']), camisa: pick(['#111', '#c0392b', '#2c3e50']), gangue: true, motoqueiro: true });
      c.ia = { tipo: 'script', fn: (cc, dt2) => {
        const a = W.jog.carro || W.jog; iaPersegue(cc, dt2, a.x, a.y, 1);
        cc.recarga = (cc.recarga || rnd(0.5, 1.5)) - dt2;
        const d = dist(cc.x, cc.y, a.x, a.y);
        if (d < 380 && cc.recarga <= 0) { cc.recarga = rnd(1.1, 2); inimigoAtira(cc, a.x, a.y, 5, 0.22); }
      } };
      W.carros.push(c); r.vieram++;
    }
  }
}

function explodir(x, y, raio = 130, dano = 120, quem) {
  SOM.explosao(); tremer(14);
  if (quem === W.jog) ONLINE.explosao(x, y, raio, dano);
  W.efeitos.push({ t: 'explosao', x, y, r: raio, vida: 0.7, max: 0.7 });
  W.manchas.push({ t: 'queimado', x, y, r: raio * 0.6 });
  for (const p of W.peds) { const d = dist(p.x, p.y, x, y); if (d < raio) feriPed(p, dano * (1 - d / raio), quem); }
  for (const c of W.carros) { const d = dist(c.x, c.y, x, y); if (d < raio && c.hp > 0) { danoCarro(c, dano * (1 - d / raio) * 1.4, quem); const a = Math.atan2(c.y - y, c.x - x); c.vx += Math.cos(a) * 300; c.vy += Math.sin(a) * 300; } }
  const j = W.jog, d = dist(j.carro ? j.carro.x : j.x, j.carro ? j.carro.y : j.y, x, y);
  if (d < raio && !j.carro) ferirJogador(dano * (1 - d / raio));
  for (const ch of W.chefes) ch.explosao && ch.explosao(x, y, raio, dano);
}

function ferirJogador(d) {
  const j = W.jog; if (j.morto || DEUS) return;
  d *= DIFIC; W.ultDano = W.tempo;
  if (j.colete > 0) { const a = Math.min(j.colete, d * 0.7); j.colete -= a; d -= a; }
  j.hp -= d; W.efeitos.push({ t: 'flashVermelho', vida: 0.25, max: 0.25 });
  if (j.hp <= 0) { j.hp = 0; morreu('morto'); }
}

function feriPed(p, d, quem) {
  if (p.hp <= 0 || p.escondido) return;
  if (p.invuln) { p.medo = 3; if (p.fixo && quem === W.jog && rnd() < 0.3) falarPed(p, pick(['ô, para com isso!', 'tá maluco, Nerivan?', 'ai! sou teu parceiro, porra'])); return; }
  p.hp -= d; p.medo = 6;
  if (quem === W.jog && !p.policia && !p.hostil && p.hp > 0 && d < 30 && !p.covarde) { if (p.brigao === undefined) p.brigao = rnd() < 0.35; if (p.brigao) { p.bravo = true; p.medo = 0; falarPed(p, pick(['QUÉ BRIGAR?!', 'vem, vagabundo', 'tu vai ver agora', 'ô, respeita!'])); } else p.covarde = true; }
  if (p.chefeAlvo && p.aoDano) p.aoDano(d);
  if (p.hp <= 0) {
    p.morto = true;
    W.manchas.push({ t: 'sangue', x: p.x, y: p.y, r: rnd(12, 20), a: rnd(6) });
    if (!p.semGrana && rnd() < 0.3) W.itens.push({ t: 'grana', x: p.x + rnd(-8, 8), y: p.y + rnd(-8, 8), v: rndi(5, 40), vida: 30 });
    if (quem === W.jog) pontuar(p.policia ? 50 : p.motoqueiro ? 30 : p.hostil ? 40 : 10);
    if (quem === W.jog && p.motoqueiro) { matouMotoqueiro(null); conta('motoqueiros'); }
    if (quem === W.jog) crime(p.policia ? 2 : (copsPerto(600) || rnd() < 0.25 ? 1 : 0));
    if (p.aoMorrer) p.aoMorrer();
  }
  // todo mundo perto se assusta
  for (const o of W.peds) if (dist(o.x, o.y, p.x, p.y) < 260) o.medo = Math.max(o.medo, 5);
}

function copsPerto(r) {
  const j = W.jog;
  return W.carros.some(c => c.policia && c.hp > 0 && dist(c.x, c.y, j.x, j.y) < r) || W.peds.some(p => p.policia && !p.morto && dist(p.x, p.y, j.x, j.y) < r);
}

function crime(n) {
  if (!n || W.semPolicia) return;
  W.calor += n; W.semVer = 0;
  const novo = clamp(Math.ceil(W.calor / 3), 0, 5);
  if (novo > W.procurado) {
    W.procurado = novo; W.picoFuga = Math.max(W.picoFuga || 0, novo);
    if (novo === 1) falar('luketa', pick(['ih rapaz, os home tão na tua cola', 'polícia na área! some daí']), 2.5);
    if (novo === 3) falar('luketa', 'TRÊS ESTRELA?! o SEGURANÇA GELADO vai vir pessoalmente atrás de tu!', 3.5);
  }
}

// ---------- IA de trânsito ----------
// farol: vertical e horizontal se revezam (8s cada, com 1,5s de amarelo)
function cruzamentoComFarol(kx, ky) { return (temH(kx - 1, ky) || temH(kx, ky)) && (temV(kx, ky - 1) || temV(kx, ky)) && naCidade(kx * GRID * T, ky * GRID * T) && regiaoDoBloco(kx, ky) !== REG.JUAZEIRO; }
function faroFase(vertical) { const t = W.tempo % 19; const f = vertical ? (t + 9.5) % 19 : t; return f < 8 ? 'verde' : f < 9.5 ? 'amarelo' : 'vermelho'; }
function faroVerde(vertical) { return faroFase(vertical) === 'verde'; }
function iaTransito(c, dt) {
  const ia = c.ia, [dx, dy] = DIRS[ia.dir];
  // carro na frente? para
  let alvo = ia.velAlvo;
  const fx = c.x + dx * 70, fy = c.y + dy * 70;
  for (const o of W.carros) {
    if (o === c) continue;
    const d = dist(o.x, o.y, fx + dx * 20, fy + dy * 20);
    if (d < 70) { alvo = Math.min(alvo, Math.max(0, (d - 30) * 3)); }
  }
  for (const p of W.peds) if (!p.morto && !p.dentroCarro && !p.escondido && tileEm(p.x, p.y) === TL.RUA && dist(p.x, p.y, fx, fy) < 55) { alvo = 0; if (!ia.buzinou && rnd() < 0.01) { ia.buzinou = true; } break; }
  // farol e cruzamento
  const txa = Math.floor((c.x + dx * 80) / T), tya = Math.floor((c.y + dy * 80) / T), txc = Math.floor(c.x / T), tyc = Math.floor(c.y / T);
  const entrando = txa % GRID < 2 && tya % GRID < 2 && !(txc % GRID < 2 && tyc % GRID < 2);
  if (entrando) {
    const kx = Math.floor(txa / GRID), ky = Math.floor(tya / GRID);
    if (cruzamentoComFarol(kx, ky) && !faroVerde(dx === 0)) alvo = 0;
    else for (const o of W.carros) { if (o === c || !o.ia || o.ia.tipo !== 'transito') continue; const ox = Math.floor(o.x / T), oy = Math.floor(o.y / T); if (Math.floor(ox / GRID) === kx && Math.floor(oy / GRID) === ky && ox % GRID < 2 && oy % GRID < 2 && (DIRS[o.ia.dir][0] === 0) !== (dx === 0)) { alvo = 0; break; } }
  }
  const j = W.jog, jx = j.carro ? j.carro.x : j.x, jy = j.carro ? j.carro.y : j.y;
  if (dist(jx, jy, fx + dx * 20, fy + dy * 20) < 60) { alvo = 0; if (!ia.buzinou && rnd() < 0.02) { ia.buzinou = true; if (dist(c.x, c.y, jx, jy) < 400) SOM.buzina(); } }
  if (c.motorista && c.motorista.medo > 0) alvo *= 1.8;
  c.vel = lerp(c.vel, alvo, Math.min(1, dt * 2));
  // segue a faixa
  const vert = dx === 0;
  const eixo = vert ? Math.floor(c.x / T / GRID) : Math.floor(c.y / T / GRID);
  const centro = centroFaixa(ia.dir, eixo);
  if (vert) c.x = lerp(c.x, centro, Math.min(1, dt * 4)); else c.y = lerp(c.y, centro, Math.min(1, dt * 4));
  c.a = Math.atan2(dy, dx);
  // cruzamento: decide virar
  const tx = Math.floor(c.x / T), ty = Math.floor(c.y / T);
  const noCruz = tx % GRID < 2 && ty % GRID < 2;
  if (!noCruz) ia.decidiu = false;
  else if (!ia.decidiu) {
    ia.decidiu = true;
    const opts = [ia.dir, (ia.dir + 1) % 4, (ia.dir + 3) % 4].filter(d => {
      const [ddx, ddy] = DIRS[d]; const nx = Math.floor(c.x / T) + ddx * 3, ny = Math.floor(c.y / T) + ddy * 3; return ehRua(nx, ny);
    });
    ia.virarPara = opts.length ? (rnd() < 0.55 ? (opts.includes(ia.dir) ? ia.dir : pick(opts)) : pick(opts)) : (ia.dir + 2) % 4;
  }
  if (noCruz && ia.virarPara !== undefined && ia.virarPara !== ia.dir) {
    // vira quando chega no centro da faixa nova
    const nd = ia.virarPara, [ndx, ndy] = DIRS[nd];
    const kx = Math.floor(tx / GRID), ky = Math.floor(ty / GRID);
    const linha = ndx === 0 ? centroFaixa(nd, kx) : centroFaixa(nd, ky);
    const pos = ndx === 0 ? c.x : c.y, chegando = (ndx === 0 ? dx : dy);
    if ((chegando > 0 && pos >= linha) || (chegando < 0 && pos <= linha) || Math.abs(pos - linha) < 4) {
      if (ndx === 0) c.x = linha; else c.y = linha;
      ia.dir = nd; ia.virarPara = undefined;
    }
  }
  const [ex, ey] = DIRS[ia.dir];
  c.vx = ex * c.vel; c.vy = ey * c.vel;
  c.x += c.vx * dt; c.y += c.vy * dt;
  if (bateuPredio(c)) { c.x -= c.vx * dt; c.y -= c.vy * dt; ia.dir = (ia.dir + 2) % 4; }
}

// ---------- visão e caminho pelas ruas ----------
function temVisao(ax, ay, bx, by) {
  const d = dist(ax, ay, bx, by), n = Math.ceil(d / 28);
  for (let k = 1; k < n; k++) if (solidoEm(lerp(ax, bx, k / n), lerp(ay, by, k / n))) return false;
  return true;
}
const noPos = (kx, ky) => ({ x: (GRID * kx + 1) * T, y: (GRID * ky + 1) * T });
function noUsado(kx, ky) { return temH(kx, ky) || temH(kx - 1, ky) || temV(kx, ky) || temV(kx, ky - 1); }
function noPerto(x, y) {
  const kx0 = Math.round((x / T - 1) / GRID), ky0 = Math.round((y / T - 1) / GRID);
  let melhor = null, md = 1e9;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const kx = clamp(kx0 + dx, 1, 15), ky = clamp(ky0 + dy, 1, 15);
    if (!noUsado(kx, ky)) continue; const p = noPos(kx, ky), d = dist(p.x, p.y, x, y);
    if (d < md) { md = d; melhor = [kx, ky]; }
  }
  return melhor;
}
function vizinhos(kx, ky) {
  const v = [];
  if (temH(kx, ky)) v.push([kx + 1, ky]); if (temH(kx - 1, ky)) v.push([kx - 1, ky]);
  if (temV(kx, ky)) v.push([kx, ky + 1]); if (temV(kx, ky - 1)) v.push([kx, ky - 1]);
  return v;
}
// próximo cruzamento no caminho mais curto pela rua (BFS na grade de cruzamentos)
function proximoNo(x, y, tx, ty) {
  const a = noPerto(x, y), b = noPerto(tx, ty); if (!a || !b) return null;
  const k = n => n[0] + ',' + n[1];
  if (k(a) === k(b)) return null;
  const veio = new Map([[k(a), null]]), fila = [a];
  while (fila.length) {
    const n = fila.shift(); if (k(n) === k(b)) break;
    for (const v of vizinhos(...n)) if (!veio.has(k(v))) { veio.set(k(v), n); fila.push(v); }
  }
  if (!veio.has(k(b))) return null;
  let n = b, ant = veio.get(k(n));
  while (ant && k(ant) !== k(a)) { n = ant; ant = veio.get(k(n)); }
  // se já tô praticamente no cruzamento "a", vou direto pro próximo; senão primeiro pro "a"
  const pa = noPos(...a);
  return dist(x, y, pa.x, pa.y) > 160 ? pa : noPos(...n);
}
const naCidade = (x, y) => x < CIDADE * T && y < CIDADE * T;

// ---------- IA de perseguição (polícia, chefes, gangue, quem foge) ----------
function iaPersegue(c, dt, alvoX, alvoY, agressivo = 1, fugir = false) {
  // longe ou sem ver o alvo: vai pelas ruas (de cruzamento em cruzamento) em vez de bater em prédio
  if (!fugir && naCidade(c.x, c.y) && naCidade(alvoX, alvoY)) {
    const dd = dist(c.x, c.y, alvoX, alvoY);
    c.ia.tRota = (c.ia.tRota || 0) - dt;
    if (dd > 380 && (dd > 900 || !temVisao(c.x, c.y, alvoX, alvoY))) {
      if (c.ia.tRota <= 0 || !c.ia.no || dist(c.x, c.y, c.ia.no.x, c.ia.no.y) < 110) { c.ia.no = proximoNo(c.x, c.y, alvoX, alvoY); c.ia.tRota = 0.8; }
      if (c.ia.no) { alvoX = c.ia.no.x; alvoY = c.ia.no.y; }
    } else c.ia.no = null;
  }
  let ang = Math.atan2(alvoY - c.y, alvoX - c.x); if (fugir) ang += Math.PI;
  // antenas pra desviar de prédio
  const olha = 140, lados = [0, 0.5, -0.5, 1, -1];
  let melhor = ang, melhorNota = -1e9;
  for (const off of lados) {
    const a = ang + off;
    let livre = 0; for (let k = 1; k <= 4; k++) { if (solidoEm(c.x + Math.cos(a) * olha * k / 4, c.y + Math.sin(a) * olha * k / 4)) break; livre++; }
    const nota = livre * 10 - Math.abs(off) * 6 - Math.abs(angDiff(c.a, a)) * 2;
    if (nota > melhorNota) { melhorNota = nota; melhor = a; }
  }
  const d = angDiff(c.a, melhor), dAlvo = dist(c.x, c.y, alvoX, alvoY);
  const vira = clamp(d * 2.5, -1, 1);
  const preso = c.ia.preso || 0;
  if (preso > 0) { c.ia.preso -= dt; fisicaCarro(c, dt, false, true, -vira, false); return; }
  const acel = fugir || dAlvo > 90, freio = !fugir && dAlvo < 70;
  fisicaCarro(c, dt, acel && Math.abs(d) < 2.2, freio, vira, Math.abs(d) > 1.2 && Math.abs(c.vel) > 250);
  if (Math.abs(c.vel) < 25 && acel) { c.ia.parado = (c.ia.parado || 0) + dt; if (c.ia.parado > 1.2) { c.ia.preso = 0.9; c.ia.parado = 0; } } else c.ia.parado = 0;
}

// ---------- colisão carro x carro e atropelamento ----------
function colisoes(dt) {
  const cs = W.carros;
  for (let a = 0; a < cs.length; a++) for (let b = a + 1; b < cs.length; b++) {
    const A = cs[a], B = cs[b];
    const r = (A.l + B.l) * 0.32, d = dist(A.x, A.y, B.x, B.y);
    if (d < r && d > 0.01) {
      const nx = (B.x - A.x) / d, ny = (B.y - A.y) / d, sobra = (r - d) / 2;
      A.x -= nx * sobra; A.y -= ny * sobra; B.x += nx * sobra; B.y += ny * sobra;
      const rel = (A.vx - B.vx) * nx + (A.vy - B.vy) * ny;
      if (rel > 0) {
        const imp = rel * 0.8;
        A.vx -= nx * imp; A.vy -= ny * imp; B.vx += nx * imp; B.vy += ny * imp;
        if (A.ia && A.ia.tipo === 'transito') A.vel *= 0.3; if (B.ia && B.ia.tipo === 'transito') B.vel *= 0.3;
        if (rel > 150) {
          const quem = (A === W.jog.carro || B === W.jog.carro) ? W.jog : null;
          danoCarro(A, rel * 0.04, quem === W.jog && A !== W.jog.carro ? W.jog : null);
          danoCarro(B, rel * 0.04, quem === W.jog && B !== W.jog.carro ? W.jog : null);
          SOM.batida(rel / 600); if (quem) { tremer(rel / 80); W.ultBatida = W.tempo; W.forcaBatida = rel * 1.4; const mc = W.jog.carro; if (mc && TIPOS_CARRO[mc.modelo].moto && rel > 300) cairDaMoto(mc, rel); }
          if (A.ia && A.ia.tipo === 'transito' && quem && A !== W.jog.carro && A.motorista) A.motorista.medo = 4;
          if (B.ia && B.ia.tipo === 'transito' && quem && B !== W.jog.carro && B.motorista) B.motorista.medo = 4;
        }
      }
    }
  }
  // atropelar pedestre
  for (const c of cs) {
    const v = Math.hypot(c.vx, c.vy); if (v < 90) continue;
    for (const p of W.peds) {
      if (p.morto || p.dentroCarro || p.escondido) continue;
      if (dist(p.x, p.y, c.x, c.y) < c.l * 0.45) {
        feriPed(p, v * 0.15, c === W.jog.carro ? W.jog : null);
        if (c === W.jog.carro) { SOM.batida(0.4); }
        const ang = Math.atan2(p.y - c.y, p.x - c.x); p.x += Math.cos(ang) * 20; p.y += Math.sin(ang) * 20;
      }
    }
    const j = W.jog;
    if (!j.carro && c !== j.carro && dist(j.x, j.y, c.x, c.y) < c.l * 0.42 && !j.morto) {
      ferirJogador(v * 0.06); const ang = Math.atan2(j.y - c.y, j.x - c.x); j.x += Math.cos(ang) * 24; j.y += Math.sin(ang) * 24;
    }
  }
}
