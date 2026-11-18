// =========================================================
// PRINCIPAL: começar, salvar, laço do jogo
// =========================================================
W.stats = { roubos: 0, missoes: 0 };
W.garagem = [];
W.itensReaparecer = [];
let RODANDO = false, ultimo = 0, carroAntes = null, lojaAtual = null;

function salvar() {
  const j = W.jog; if (!j) return;
  const d = { v: 1, grana: j.grana, tem: j.tem, municao: { ...j.municao, punho: 0 }, camisa: j.camisa, calca: j.calca, chapeu: j.chapeu, oculos: j.oculos, feitas: MISSAO.feitas, garagem: W.garagem, stats: W.stats };
  try { localStorage.setItem('gta7-save', JSON.stringify(d)); } catch (e) { }
}
function carregar() { try { const s = localStorage.getItem('gta7-save'); return s ? JSON.parse(s) : null; } catch (e) { return null; } }

function redimensionar() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  VW = innerWidth; VH = innerHeight;
  cv.width = VW * DPR; cv.height = VH * DPR; cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
}

function povoarInicial() {
  const j = W.jog;
  for (let k = 0; k < 14; k++) {
    const p = pontoNaRuaPerto(j.x, j.y, 250, 1100);
    if (p && !W.carros.some(c => dist(c.x, c.y, p.x, p.y) < 160)) {
      const c = novoCarro(modeloDaRegiao(regiaoEm(p.x, p.y)), p.x, p.y, Math.atan2(DIRS[p.dir][1], DIRS[p.dir][0]));
      c.ia = { tipo: 'transito', dir: p.dir, decidiu: false, velAlvo: rnd(150, 240) }; c.motorista = novoPed(c.x, c.y); c.vel = c.ia.velAlvo; W.carros.push(c);
    }
  }
  for (let k = 0; k < 26; k++) { const p = pontoNaCalcadaPerto(j.x, j.y, 120, 1000); if (p) W.peds.push(novoPed(p.x, p.y)); }
  for (const v of vagas) if (dist(v.x, v.y, j.x, j.y) < 1200) { v.tentou = true; if (rnd() < 0.55) { const c = novoCarro(pick(['popular', 'sedan', 'sedan', 'esporte', 'pickup']), v.x, v.y, v.a); c.vaga = v; v.c = c; W.carros.push(c); } }
}
function estacionados() {
  for (const k of ['policia', 'hospital', 'padaria', 'mercado', 'dudu', 'armas', 'roupas', 'yori', 'gelado']) {
    const l = LUGAR[k]; if (!l) continue;
    for (const lado of [-1, 1]) {
      const x = l.x + lado * 170, y = l.y - 4;
      if (solidoEm(x, y)) continue;
      const m = k === 'yori' ? 'pickup' : k === 'policia' ? (lado < 0 ? 'policia' : 'sedan') : pick(['popular', 'sedan', 'esporte', 'popular']);
      const c = novoCarro(m, x, y, 0, { fixo: true }); if (m === 'policia') c.sirene = false;
      W.carros.push(c);
    }
  }
}

function comecar(save) {
  gerarMapa(); gerarMini(); carregarRostos();
  const ini = save ? LUGAR.dudu : LUGAR.policia;
  W.jog = novoJogador(ini.x, ini.y + 60);
  const j = W.jog; j.rosto = 'nerivan'; j.a = Math.PI / 2;
  if (save) {
    j.grana = save.grana; Object.assign(j.tem, save.tem); Object.assign(j.municao, save.municao); j.municao.punho = Infinity;
    j.camisa = save.camisa; j.calca = save.calca; j.chapeu = save.chapeu; j.oculos = save.oculos;
    MISSAO.feitas = save.feitas || 0; W.garagem = save.garagem || []; W.stats = { ...W.stats, ...(save.stats || {}) };
  }
  espalharItens(); criarFixos(); estacionados();
  cam.x = j.x; cam.y = j.y;
  povoarInicial();
  RODANDO = true; ultimo = performance.now();
  if (ehToque()) montarToque();
  if (MISSAO.feitas === 0) setTimeout(() => iniciarMissao(MISSOES[0]), 600);
  else falar('luketa', `bem-vindo de volta, Nerivan! ${proximaMissao() ? 'próxima missão: ' + NOMES[proximaMissao().quem] + '. segue a seta' : 'a cidade é tua'}`, 4.5);
  requestAnimationFrame(laco);
}

function gatilhos() {
  const j = W.jog; if (j.morto || MISSAO.dialogo) return;
  // lojas e garagem
  let perto = null;
  for (const k of ['garagem', 'garagemBH']) if (dist(j.x, j.y, LUGAR[k].x, LUGAR[k].y) < (j.carro ? 75 : 55)) perto = k;
  if (!j.carro) { if (dist(j.x, j.y, LUGAR.roupas.x, LUGAR.roupas.y) < 45) perto = 'roupas'; if (dist(j.x, j.y, LUGAR.armas.x, LUGAR.armas.y) < 45) perto = 'armas'; }
  if (perto && perto !== lojaAtual && !(j.carro && Math.abs(j.carro.vel) > 260)) {
    lojaAtual = perto;
    if (perto === 'roupas') menuRoupas(); else if (perto === 'armas') menuArmas(); else { MENU_GAR_LUGAR = LUGAR[perto]; menuGaragem(); }
    if (j.carro) { j.carro.vx = j.carro.vy = 0; j.carro.vel = 0; }
  }
  if (!perto) lojaAtual = null;
  // desmanche: vende o carro
  if (j.carro && !j.carro.missao && dist(j.x, j.y, LUGAR.desmanche.x, LUGAR.desmanche.y) < 80 && Math.abs(j.carro.vel) < 300) {
    const c = j.carro, base = { popular: 300, sedan: 450, esporte: 900, pickup: 600, caminhao: 800, policia: 1000, gelado: 2500 }[c.modelo] || 400;
    const v = Math.round(base * (0.4 + 0.6 * c.hp / c.hpMax) * (1 + c.motor * 0.2 + c.blind * 0.2) / 10) * 10;
    entrarSair(); c.lixo = true; W.carros = W.carros.filter(x => x !== c);
    j.grana += v; SOM.grana(); tremer(6);
    AVISO = { titulo: '+' + fmt$(v), sub: 'o desmanche comprou teu ' + TIPOS_CARRO[c.modelo].nome, cor: '#7CFC00', t: 0, dur: 2.5 };
    falar('luketa', pick(['vendido! carro roubado vira peça no Mercado Livre', 'grana fácil, Nerivan. rouba outro', 'negócio fechado!']), 3);
    salvar();
  }
  // começar missão
  if (!MISSAO.ativa) {
    const m = proximaMissao(), p = lugarMissao(m);
    if (p && dist(j.x, j.y, p.x, p.y + 50) < (j.carro ? 70 : 55)) {
      if (W.procurado > 0) { if (!W.avisoProcurado || W.tempo - W.avisoProcurado > 6) { W.avisoProcurado = W.tempo; falar('luketa', 'despista a polícia antes de começar a missão!', 3); } }
      else { if (j.carro) { j.carro.vx = j.carro.vy = 0; j.carro.vel = 0; } iniciarMissao(m); }
    }
  }
}

function atualizaCamera(dt) {
  const j = W.jog, c = j.carro;
  const base = clamp(Math.min(VW, VH * 1.7) / 1150, 0.5, 1.05);
  const zAlvo = c ? base * clamp(0.92 - Math.abs(c.vel) / 2000, 0.6, 0.92) : base;
  cam.zoom = lerp(cam.zoom, zAlvo, Math.min(1, dt * 1.5));
  let tx = j.x, ty = j.y;
  if (c) { tx += c.vx * 0.45; ty += c.vy * 0.45; }
  cam.x = lerp(cam.x, tx, Math.min(1, dt * 4)); cam.y = lerp(cam.y, ty, Math.min(1, dt * 4));
  cam.tremor = Math.max(0, cam.tremor - dt * 40);
}

function passo(dt) {
  W.tempo += dt;
  const j = W.jog;
  // teclas que funcionam sempre
  if (apertou('escape', 'p')) { if (MENU) fecharMenu(); else if (MAPA_ABERTO) MAPA_ABERTO = false; else if (!CREDITOS) menuPausa(); }
  if (apertou('m') && !MENU) MAPA_ABERTO = !MAPA_ABERTO;
  if (CREDITOS) return;
  if (MENU || MAPA_ABERTO) return;
  if (MISSAO.dialogo) { if (apertou('e', 'enter', ' ', 'f')) avancarDialogo(); atualizaEfeitos(dt * 0.3); return; }
  if (TELA_FIM) {
    if (TELA_FIM.t > 2 && apertou('e', 'enter', ' ', 'f')) renascer();
    atualizaPeds(dt); atualizaCarros(dt); atualizaBalas(dt); atualizaEfeitos(dt); atualizaChefes(dt);
    return;
  }
  if (apertou('e', 'f')) entrarSair();
  if (apertou('tab', 'q')) trocarArma(1);
  if (apertou('r') && j.carro) {
    { RADIO.atual = (RADIO.atual + 1) % RADIOS.length; RADIO.tocar(true); RADIO_AVISO = { t: 0 }; }
  }
  if (W.escorregou > 0) W.escorregou -= dt;
  if (!j.morto && j.hp < 100 && W.tempo - (W.ultDano || 0) > 5) j.hp = Math.min(100, j.hp + 4 * dt);
  j.recarga = Math.max(0, j.recarga - dt);
  if (j.carro) atualizaJogadorCarro(dt); else atualizaJogadorPe(dt);
  if (j.carro !== carroAntes) { if (j.carro) { CARRO_AVISO = { txt: TIPOS_CARRO[j.carro.modelo].nome, t: 0 }; RADIO_AVISO = { t: 0 }; } carroAntes = j.carro; }
  if (!j.carro) SOM.atualizaMotor(0, false);
  atualizaPeds(dt); atualizaCarros(dt); colisoes(dt); atualizaBalas(dt); atualizaItens(dt); atualizaChefes(dt);
  atualizaProcurado(dt); atualizaEfeitos(dt); povoar(dt, VW / cam.zoom, VH / cam.zoom);
  MISSAO.tick(dt); gatilhos(); atualizaDicas(dt);
}

// som do baile do Meco: uma música do "Malando com Zensat", sem grave até devolver o paredão
const BAILE = { pronto: false, el: null, filtro: null, ganho: null };
function atualizaBaile() {
  if (!SOM.ctx || !W.jog || !LUGAR.baile) return;
  const d = dist(W.jog.x, W.jog.y, LUGAR.baile.x, LUGAR.baile.y), vol = Math.pow(clamp(1 - d / 1500, 0, 1), 1.4) * 0.95;
  if (!BAILE.pronto) {
    if (vol <= 0) return;
    BAILE.pronto = true;
    try {
      const el = new Audio('/jogos/malandro-hero/musicas/' + pick(['kika', 'meuerro', 'sigilo']) + '.mp3'); el.loop = true;
      const src = SOM.ctx.createMediaElementSource(el), f = SOM.ctx.createBiquadFilter(), g = SOM.ctx.createGain();
      f.type = 'highpass'; f.frequency.value = 700; g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(SOM.master);
      Object.assign(BAILE, { el, filtro: f, ganho: g });
    } catch (e) { return; }
  }
  if (!BAILE.el) return;
  const idx = MISSOES.findIndex(m => m.id === 'meco'), temGrave = MISSAO.feitas > idx;
  const t = SOM.ctx.currentTime;
  BAILE.filtro.frequency.setTargetAtTime(temGrave ? 10 : 700, t, 0.4);
  BAILE.ganho.gain.setTargetAtTime(vol * (PAUSA_SOM ? 0 : 1), t, 0.2);
  if (vol > 0 && BAILE.el.paused) BAILE.el.play().catch(() => { });
  else if (vol <= 0 && !BAILE.el.paused) BAILE.el.pause();
}

function laco(agora) {
  if (!RODANDO) return;
  const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
  try {
    passo(dt);
    atualizaCamera(dt);
    RADIO.atualiza(); atualizaBaile();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#1d4f8f'; ctx.fillRect(0, 0, cv.width, cv.height);
    desenharMundo(); desenharHUD(dt);
  } catch (e) { console.error(e); }
  for (const k in PRESS) PRESS[k] = false;
  requestAnimationFrame(laco);
}

function iniciarTela() {
  cv = document.getElementById('jogo'); ctx = cv.getContext('2d');
  redimensionar(); addEventListener('resize', redimensionar);
  cv.addEventListener('mousemove', e => { MOUSE.x = e.clientX; MOUSE.y = e.clientY; MOUSE.used = true; });
  cv.addEventListener('mousedown', e => {
    SOM.init(); if (e.button !== 0) return;
    if (MISSAO.dialogo) { avancarDialogo(); return; }
    if (TELA_FIM && TELA_FIM.t > 2) { renascer(); return; }
    if (CREDITOS) { CREDITOS.pular = true; return; }
    if (MAPA_ABERTO) { MAPA_ABERTO = false; return; }
    MOUSE.down = true;
  });
  addEventListener('mouseup', () => { MOUSE.down = false; });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('wheel', e => { if (RODANDO) trocarArma(e.deltaY > 0 ? 1 : -1); }, { passive: true });
  cv.addEventListener('touchstart', e => {
    SOM.init(); MOUSE.used = false;
    if (MISSAO.dialogo) avancarDialogo(); else if (TELA_FIM && TELA_FIM.t > 2) renascer(); else if (CREDITOS) CREDITOS.pular = true; else if (MAPA_ABERTO) MAPA_ABERTO = false;
  }, { passive: true });
  const save = carregar();
  const t = document.getElementById('titulo');
  const bj = t.querySelector('.jogar'), bn = t.querySelector('.novo');
  if (save && save.feitas > 0) { bj.textContent = `▶ continuar (missão ${Math.min(save.feitas, MISSOES.length - 1)})`; bn.style.display = ''; }
  t.addEventListener('pointerdown', () => { try { if (ytAtivo() && !RODANDO) YTR.player.playVideo(); } catch (e) { } }, { once: true });
  const vai = s => { SOM.init(); RADIO.atual = 0; t.classList.add('some'); document.body.classList.remove('titulo-on'); setTimeout(() => t.remove(), 500); comecar(s); };
  bj.onclick = () => vai(save && save.feitas > 0 ? save : null);
  bn.onclick = () => { if (!bn.dataset.ok) { bn.dataset.ok = 1; bn.textContent = '⚠️ certeza? clica de novo (apaga o save)'; return; } try { localStorage.removeItem('gta7-save'); } catch (e) { } vai(null); };
  document.getElementById('dicas-ctrl').textContent = ehToque() ? 'celular: analógico na esquerda, botões na direita. Vira o celular de lado!' : CONTROLES_TXT;
  if (new URLSearchParams(location.search).has('deus')) DEUS = true;
  carregarYT();
}
addEventListener('load', iniciarTela);
