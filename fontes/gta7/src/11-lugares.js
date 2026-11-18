// =========================================================
// ENTRAR NOS LUGARES (com tela de dentro), ÁGUA, NADO E BARCO
// =========================================================
const LUGARES = [
  { k: 'garagem', nome: 'Garagem do Nerivan', ic: '🔧', carro: true, int: 'garagem', acao: () => { MENU_GAR_LUGAR = LUGAR.garagem; menuGaragem(); } },
  { k: 'garagemBH', nome: 'Garagem do Nerivan (BH)', ic: '🔧', carro: true, int: 'garagem', acao: () => { MENU_GAR_LUGAR = LUGAR.garagemBH; menuGaragem(); } },
  { k: 'desmanche', nome: 'Desmanche', ic: '🔩', carro: true, so: 'carro', int: 'desmanche', acao: () => menuDesmanche() },
  { k: 'roupas', nome: 'Simas Store', ic: '👕', int: 'roupas', acao: () => menuRoupas() },
  { k: 'armas', nome: 'Arsenal', ic: '🔫', int: 'armas', acao: () => menuArmas() },
  { k: 'motors', nome: 'Simas Motors', ic: '🏍️', int: 'motors', acao: () => menuMotors() },
  { k: 'padaria', nome: 'Padaria', ic: '🥐', int: 'padaria', acao: () => menuPadaria() },
  { k: 'fatal', nome: 'Fatal Model', ic: '💋', int: 'fatal', acao: () => FATAL_ABERTO ? menuFatal() : (falar('luketa', 'tá FECHADO: o Ltzin derrubou o sistema do Fatal Model. derrota ele que reabre', 3.5), sairInterior()) },
  { k: 'hospital', nome: 'Hospital', ic: '🏥', int: 'hospital', acao: () => menuHospital() },
  { k: 'policia', nome: 'Delegacia', ic: '🚔', int: 'delegacia', acao: () => menuDelegacia() },
  { k: 'dudu', nome: 'Esconderijo do Dudu', ic: '💻', int: 'dudu', acao: () => menuEsconderijo() },
  { k: 'cafe', nome: 'Café do Porto', ic: '☕', int: 'cafe', acao: () => menuCafe() },
  { k: 'masadakun', nome: 'Templo', ic: '🛕', int: 'templo', acao: () => menuTemplo() }
];
let INTERACAO = null, INTERIOR = null;
function lugarPerto() {
  const j = W.jog; if (j.morto) return null;
  let m = null, md = 1e9;
  for (const l of LUGARES) {
    const p = LUGAR[l.k]; if (!p) continue;
    if (j.carro && !l.carro) continue; if (!j.carro && l.so === 'carro') continue;
    const d = dist(j.x, j.y, p.x, p.y), r = j.carro ? 95 : 75;
    if (d < r && d < md) { md = d; m = l; }
  }
  return m;
}
function entrarLugar(l) {
  const j = W.jog;
  if (j.carro) { j.carro.vx = j.carro.vy = 0; j.carro.vel = 0; }
  INTERIOR = { tipo: l.int, nome: l.nome, t: 0 };
  SOM.bip(330, 0.15, 0.1, 'sine'); setTimeout(() => SOM.bip(440, 0.12, 0.1, 'sine'), 90);
  document.getElementById('menu').classList.add('interior');
  l.acao();
}
function sairInterior() {
  INTERIOR = null; document.getElementById('menu').classList.remove('interior');
}

// ---------- menus dos lugares novos ----------
function menuHospital() {
  const j = W.jog;
  abrirMenu('🏥 HOSPITAL SIMAS', [
    { txt: '🩹 Curativo (vida cheia)', preco: 100, off: j.hp >= 100, fn: () => { j.hp = 100; } },
    { txt: '💉 Vacina anti-Gelado (colete cheio)', preco: 350, off: j.colete >= 100, fn: () => { j.colete = 100; } },
    { txt: '🧠 Consulta com psicólogo (pelo que tu fez)', preco: 60, fn: () => { falar('luketa', 'o psicólogo desistiu de tu na metade da sessão', 3); } }
  ], 'SUS de luxo, aceita PIX');
}
function menuDelegacia() {
  const j = W.jog, est = W.procurado, preco = 400 * Math.max(1, est);
  abrirMenu('🚔 DELEGACIA', [
    { txt: est ? `💸 Suborno pro delegado (zera ${est} estrela${est > 1 ? 's' : ''})` : '💸 Suborno (tu nem tá procurado, mas ele aceita)', preco, fn: () => { W.procurado = 0; W.calor = 0; W.carros = W.carros.filter(c => !(c.ia && c.ia.tipo === 'policia')); falar('luketa', 'o delegado contou a grana e esqueceu tua cara', 3); } },
    { txt: '📋 Fazer B.O. contra o Ltzin', fn: () => { falar('luketa', 'o escrivão riu e jogou o papel fora', 2.5); } }
  ], 'aqui tudo se resolve, é só ter o dinheiro certo');
}
function menuEsconderijo() {
  const j = W.jog;
  abrirMenu('💻 ESCONDERIJO DO DUDU', [
    { txt: '💾 Salvar o jogo e dormir (vida cheia)', fn: () => { j.hp = 100; salvar(); CORTINA = { t: 0, txt: 'o Nerivan dormiu no sofá do Dudu. jogo salvo ✔' }; } },
    { txt: '📺 Ver as câmeras hackeadas da cidade', fn: () => { MAPA_ABERTO = true; } },
    { txt: '📞 Ligar pras vovós (engenharia social)', preco: 0, fn: () => { const g = rndi(50, 400); j.grana += g; falar('luketa', `uma vovó caiu no golpe: +${fmt$(g)}. que feio, Nerivan`, 3); conta('golpes'); } }
  ], 'wi-fi bom, cheiro de energético');
}
function menuCafe() {
  const j = W.jog;
  abrirMenu('☕ CAFÉ DO PORTO', [
    { txt: '☕ Cafezinho (+15 de vida)', preco: 6, fn: () => { j.hp = Math.min(100, j.hp + 15); falar('sibito', pick(XINGOS_SIBITO), 2.5); conta('xingado'); } },
    { txt: '🥮 Bolo de rolo (+35 de vida)', preco: 18, fn: () => { j.hp = Math.min(100, j.hp + 35); } },
    { txt: '🗣️ Puxar papo com a Sibito', fn: () => { for (let k = 0; k < 3; k++) setTimeout(() => { falar('sibito', pick(XINGOS_SIBITO), 2.2); conta('xingado'); }, k * 900); } }
  ], 'o melhor café de Recife (a atendente não)');
}
function menuTemplo() {
  const j = W.jog;
  abrirMenu('🛕 PURA SIMAS', [
    { txt: '🧘 Meditar (vida e colete cheios)', fn: () => { j.hp = 100; j.colete = 100; CORTINA = { t: 0, txt: 'o Nerivan meditou com a Masadakun e achou a paz interior. por 5 minutos.' }; } },
    { txt: '🙏 Pedir perdão pelos golpes', fn: () => { falar('masadakun', 'até os deuses riram, mano', 3); } }
  ], 'om... selamat datang');
}
function menuDesmanche() {
  const j = W.jog, c = j.carro;
  if (!c) { sairInterior(); return; }
  const base = { popular: 300, sedan: 450, esporte: 900, pickup: 600, caminhao: 800, policia: 1000, gelado: 2500, lambo: 6000, sw4: 1500, onibus: 900, xj6: 1100, cg: 400, biz: 250, trilha: 500, fusca: 350, gol: 400, taxi: 500 }[c.modelo] || 400;
  const v = Math.round(base * (0.4 + 0.6 * c.hp / c.hpMax) * (1 + c.motor * 0.2 + c.blind * 0.2) / 10) * 10;
  abrirMenu('🔩 DESMANCHE', [
    { txt: `💰 Vender ${TIPOS_CARRO[c.modelo].nome} por ${fmt$(v)}`, off: !!c.missao, fn: () => {
      entrarSair(); c.lixo = true; W.carros = W.carros.filter(x => x !== c);
      j.grana += v; SOM.grana(); tremer(6); pontuar(Math.floor(v / 20));
      AVISO = { titulo: '+' + fmt$(v), sub: 'o desmanche comprou teu ' + TIPOS_CARRO[c.modelo].nome, cor: '#7CFC00', t: 0, dur: 2.5 };
      falar('luketa', pick(['vendido! carro roubado vira peça no Mercado Livre', 'grana fácil, Nerivan. rouba outro', 'negócio fechado!']), 3); salvar();
    } }
  ], 'a gente não pergunta de onde veio');
}

// ---------- tela de dentro de cada lugar ----------
function desenharInterior(g, dt) {
  const I = INTERIOR; if (!I) return;
  I.t += dt; const k = Math.min(1, I.t / 0.35);
  g.save(); g.globalAlpha = k;
  const pisoCor = { garagem: '#3d3d45', desmanche: '#3a2f2a', roupas: '#e8dfd2', armas: '#2b2b2b', motors: '#d8dce0', padaria: '#c9a77c', fatal: '#2a0a1e', hospital: '#e9f1f4', delegacia: '#4a5560', dudu: '#14181c', cafe: '#6e4b2a', templo: '#7b241c' }[I.tipo] || '#333';
  g.fillStyle = pisoCor; g.fillRect(0, 0, VW, VH);
  const W2 = VW * 0.62, cx = W2 / 2, cy = VH / 2;
  // parede de cima
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, VW, VH * 0.22);
  g.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 0; x < VW; x += 60) g.fillRect(x, VH * 0.22, 2, VH);
  const t = W.tempo;
  const placa = txt => { g.font = `900 ${Math.min(36, VW / 22)}px "Arial Black", system-ui`; g.textAlign = 'center'; textoContorno(g, txt, cx, VH * 0.13, '#ffd23f', 6); };
  if (I.tipo === 'garagem' || I.tipo === 'desmanche') {
    g.strokeStyle = '#f1c40f'; g.lineWidth = 6; g.setLineDash([30, 20]); g.strokeRect(cx - 150, cy - 100, 300, 260); g.setLineDash([]);
    for (let k2 = 0; k2 < 8; k2++) { g.fillStyle = ['#c0392b', '#7f8c8d', '#2c3e50'][k2 % 3]; g.fillRect(40 + k2 * 50, VH * 0.06, 30, 50); }
    if (I.tipo === 'desmanche') for (let k2 = 0; k2 < 6; k2++) { g.fillStyle = '#5d4037'; g.beginPath(); g.arc(60 + k2 * 70, VH - 80, 26, 0, 7); g.fill(); }
    const c = W.jog.carro;
    if (c) { g.save(); g.translate(cx, cy + 30); g.scale(2.6, 2.6); const ox = c.x, oy = c.y, oa = c.a, on = c.nome; c.x = 0; c.y = 0; c.a = -Math.PI / 2; c.nome = null; desenharCarro(g, c); c.x = ox; c.y = oy; c.a = oa; c.nome = on; g.restore(); }
    else { g.font = '20px system-ui'; g.textAlign = 'center'; textoContorno(g, 'vaga livre', cx, cy + 30, '#aaa', 3); }
    placa(I.tipo === 'desmanche' ? 'DESMANCHE' : 'GARAGEM DO NERIVAN');
  } else if (I.tipo === 'roupas') {
    for (let k2 = 0; k2 < 10; k2++) { g.fillStyle = CAMISAS[k2 % CAMISAS.length]; g.fillRect(30 + k2 * 42, VH * 0.08, 30, 70); }
    g.fillStyle = '#b8c6d1'; rr(g, cx - 120, cy - 150, 240, 330, 20); g.fill(); g.fillStyle = '#dfe9f1'; rr(g, cx - 108, cy - 138, 216, 306, 16); g.fill();
    const j = W.jog; g.save(); g.translate(cx, cy + 20); g.scale(4.2, 4.2);
    desenharPessoa(g, { ...j, x: 0, y: 0, a: -Math.PI / 2 + Math.sin(t * 1.2) * 0.4, anda: t * 4 }, { nomes: false, arma: null, jog: true });
    g.restore(); placa('SIMAS STORE · PROVADOR');
  } else if (I.tipo === 'armas') {
    for (let k2 = 0; k2 < ORDEM_ARMAS.length; k2++) { const a = ORDEM_ARMAS[k2]; g.fillStyle = '#3d2b1f'; g.fillRect(30 + (k2 % 5) * 110, VH * 0.25 + Math.floor(k2 / 5) * 110, 96, 90); iconeArma(g, a, 78 + (k2 % 5) * 110, VH * 0.25 + 45 + Math.floor(k2 / 5) * 110, 2.4, '#ddd'); }
    placa('ARSENAL');
  } else if (I.tipo === 'motors') {
    const ms = ['lambo', 'xj6', 'sw4'];
    ms.forEach((m, i) => { const c = novoCarro(m, 0, 0, -Math.PI / 2); g.save(); g.translate(cx - 160 + i * 160, cy + 40); g.rotate(Math.sin(t + i) * 0.15); g.scale(1.8, 1.8); desenharCarro(g, c); g.restore(); g.fillStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.ellipse(cx - 160 + i * 160, cy + 40, 90, 30, 0, 0, 7); g.fill(); });
    placa('SIMAS MOTORS & IMÓVEIS');
  } else if (I.tipo === 'padaria' || I.tipo === 'cafe') {
    g.fillStyle = '#8d6e63'; g.fillRect(40, cy - 40, W2 - 80, 80); g.fillStyle = 'rgba(200,230,255,.35)'; g.fillRect(40, cy - 40, W2 - 80, 30);
    for (let k2 = 0; k2 < 9; k2++) { g.fillStyle = '#e0a458'; g.beginPath(); g.ellipse(80 + k2 * ((W2 - 160) / 8), cy + 10, 22, 12, 0, 0, 7); g.fill(); }
    if (I.tipo === 'cafe') { const sib = { x: cx, y: cy - 110, a: Math.PI / 2, camisa: '#e67e22', calca: '#2c3e50', pele: '#c68642', cabelo: '#111', cabeloLongo: true }; g.save(); g.translate(cx, cy - 110); g.scale(3, 3); desenharPessoa(g, { ...sib, x: 0, y: 0 }, { nomes: false }); g.restore(); if ((t * 0.7 | 0) % 2) { g.font = 'bold 18px system-ui'; g.textAlign = 'center'; textoContorno(g, '"' + XINGOS_SIBITO[(t * 0.35 | 0) % XINGOS_SIBITO.length] + '"', cx, cy - 170, '#ffb3b3', 4); } }
    placa(I.tipo === 'cafe' ? 'CAFÉ DO PORTO' : 'PADARIA');
  } else if (I.tipo === 'fatal') {
    for (let k2 = 0; k2 < 6; k2++) { g.fillStyle = `hsla(${320 + k2 * 8},90%,${45 + Math.sin(t * 3 + k2) * 10}%,.5)`; g.beginPath(); g.arc(80 + k2 * 120, VH * 0.4 + Math.sin(t + k2) * 20, 50, 0, 7); g.fill(); }
    g.fillStyle = '#b3134f'; rr(g, cx - 200, cy + 60, 400, 70, 30); g.fill();
    placa('FATAL MODEL');
  } else if (I.tipo === 'hospital') {
    for (let k2 = 0; k2 < 3; k2++) { g.fillStyle = '#fff'; g.fillRect(60 + k2 * 160, cy - 30, 110, 180); g.fillStyle = '#74b9ff'; g.fillRect(60 + k2 * 160, cy - 30, 110, 40); }
    g.fillStyle = '#e74c3c'; g.fillRect(cx - 40, VH * 0.05, 80, 24); g.fillRect(cx - 12, VH * 0.05 - 28, 24, 80); placa('');
  } else if (I.tipo === 'delegacia') {
    g.fillStyle = '#5d4037'; g.fillRect(cx - 180, cy - 20, 360, 90); g.fillStyle = '#ecf0f1'; for (let k2 = 0; k2 < 5; k2++) g.fillRect(cx - 160 + k2 * 70, cy - 10, 40, 28);
    for (let k2 = 0; k2 < 7; k2++) { g.fillStyle = '#7f8c8d'; g.fillRect(30 + k2 * 26, VH * 0.25, 8, VH * 0.55); }
    placa('DELEGACIA');
  } else if (I.tipo === 'dudu') {
    for (let k2 = 0; k2 < 6; k2++) { g.fillStyle = '#111'; g.fillRect(40 + (k2 % 3) * 160, VH * 0.25 + Math.floor(k2 / 3) * 120, 140, 90); g.fillStyle = '#00ff9c'; g.font = '11px monospace'; g.textAlign = 'left'; for (let l = 0; l < 6; l++) g.fillText(((t * 7 + l * 13 + k2 * 5) | 0).toString(16).repeat(3).slice(0, 18), 48 + (k2 % 3) * 160, VH * 0.25 + 18 + l * 12 + Math.floor(k2 / 3) * 120); }
    placa('ESCONDERIJO DO DUDU');
  } else if (I.tipo === 'templo') {
    for (let k2 = 0; k2 < 3; k2++) { g.fillStyle = k2 % 2 ? '#a93226' : '#7b241c'; g.fillRect(cx - 200 + k2 * 40, cy - 140 + k2 * 40, 400 - k2 * 80, 300 - k2 * 80); }
    g.fillStyle = '#f1c40f'; g.beginPath(); g.arc(cx, cy + 10, 40 + Math.sin(t * 2) * 4, 0, 7); g.fill(); placa('PURA SIMAS');
  }
  g.font = 'bold 13px system-ui'; g.textAlign = 'center'; textoContorno(g, ehToque() ? 'toca em "fechar" pra sair' : 'ESC pra sair', cx, VH - 24, '#ddd', 3);
  g.restore();
}

// ---------- água: nado, barco, afundar ----------
function ehAguaBarco(x, y) { const t = tileEm(x, y); return t === TL.AGUA || ehPonte(Math.floor(x / T), Math.floor(y / T)); }
function atualizaNado(dt) {
  const j = W.jog; if (j.carro || j.morto) { j.nadando = false; return; }
  j.nadando = tileEm(j.x, j.y) === TL.AGUA;
  if (j.nadando) {
    j.folego = (j.folego ?? 100) - dt * 9;
    if (rnd() < dt * 4) W.efeitos.push({ t: 'onda', x: j.x, y: j.y, vida: 1, max: 1 });
    if (j.folego <= 0) { j.folego = 0; ferirJogador(30 * dt / DIFIC); if (!W.avisoFolego) { W.avisoFolego = true; falar('luketa', 'tá sem fôlego! volta pra terra ou pega um barco!', 3); } }
    else if (!W.avisoNado) { W.avisoNado = true; falar('luketa', 'nadando! fica de olho no fôlego (barra azul). a lancha e o jet ski ficam nos píer', 4); }
  } else { j.folego = Math.min(100, (j.folego ?? 100) + dt * 30); W.avisoFolego = false; }
}
function afundarCarro(c, dt) {
  c.afunda = (c.afunda || 0) + dt; c.vx *= Math.pow(0.15, dt); c.vy *= Math.pow(0.15, dt);
  if (rnd() < 0.6) W.efeitos.push({ t: 'onda', x: c.x + rnd(-20, 20), y: c.y + rnd(-20, 20), vida: 1, max: 1 });
  if (c.afunda > 1.8) {
    c.lixo = true; c.hp = 0;
    if (c === W.jog.carro) { const j = W.jog; j.carro = null; c.motorista = null; j.x = c.x; j.y = c.y; SOM.atualizaMotor(0, false); RADIO.tocar(false); falar('luketa', pick(['AFUNDOU! nada, Nerivan, NADA', 'carro não é submarino, gênio']), 3); }
  }
}
// barcos parados nos píer
const PIERS = [[8, 172], [190, 141], [190, 150], [242, 128], [100, 190]];
function criarBarcos() {
  const tipos = ['lancha', 'jetski'];
  PIERS.forEach(([tx, ty], i) => {
    let p = null;
    for (let r = 0; r < 8 && !p; r++) for (let a = 0; a < 16; a++) { const x = tx + Math.cos(a / 16 * 7) * r, y = ty + Math.sin(a / 16 * 7) * r; if (tile(x | 0, y | 0) === TL.AGUA && tile((x + 1) | 0, y | 0) === TL.AGUA && tile((x - 1) | 0, y | 0) === TL.AGUA) { p = { x: x * T, y: y * T }; break; } }
    if (p) W.carros.push(novoCarro(tipos[i % 2], p.x, p.y, 0, { fixo: true }));
  });
}
function desenharBarco(g, c, t) {
  const L = c.l, Wd = c.w;
  g.save(); g.translate(c.x, c.y); g.rotate(c.a);
  const v = Math.hypot(c.vx, c.vy);
  if (v > 60) { g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(-L / 2, -Wd / 2); g.lineTo(-L / 2 - v * 0.35, -Wd * 1.4); g.lineTo(-L / 2 - v * 0.35, Wd * 1.4); g.lineTo(-L / 2, Wd / 2); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(4, 4, L / 2, Wd / 2, 0, 0, 7); g.fill();
  g.fillStyle = c.cor; g.beginPath(); g.moveTo(L / 2, 0); g.quadraticCurveTo(L * 0.2, -Wd / 2, -L / 2, -Wd / 2); g.lineTo(-L / 2, Wd / 2); g.quadraticCurveTo(L * 0.2, Wd / 2, L / 2, 0); g.fill();
  g.strokeStyle = escurecer(c.cor, 0.6); g.lineWidth = 2; g.stroke();
  g.fillStyle = '#ecf0f1'; if (t.jetski) g.fillRect(-L * 0.25, -Wd * 0.25, L * 0.35, Wd * 0.5); else { g.fillRect(-L * 0.15, -Wd * 0.35, L * 0.3, Wd * 0.7); g.fillStyle = 'rgba(150,200,255,.7)'; g.fillRect(L * 0.1, -Wd * 0.3, 6, Wd * 0.6); }
  const m = c.motorista;
  if (m) { g.rotate(-c.a); const im = m.rosto && ROSTOS[m.rosto]; if (im && im.naturalWidth) { g.save(); g.beginPath(); g.arc(0, 0, 11, 0, 7); g.clip(); g.drawImage(im, -11, -11, 22, 22); g.restore(); g.strokeStyle = '#ffd23f'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 11, 0, 7); g.stroke(); } else { g.fillStyle = m.pele || '#c68642'; g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fill(); } }
  g.restore();
}

function criarTesouro() {
  if ((W.stats || {}).bau) return;
  W.itens.push({ t: 'pacote', icone: '💰', x: 215.5 * T, y: 25.5 * T, fica: false, fn: () => { conta('bau'); W.jog.grana += 2000; pontuar(400); AVISO = { titulo: 'BAÚ DO PIRATA', sub: 'achou o tesouro da Ilha do Gelado: +R$ 2.000', cor: '#f1c40f', t: 0, dur: 4 }; SOM.missao(); salvar(); } });
}
