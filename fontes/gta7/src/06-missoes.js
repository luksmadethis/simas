// =========================================================
// HISTÓRIA E MISSÕES
// =========================================================
class Aborta extends Error {}
const NOMES = { nerivan: 'Nerivan', luketa: 'Luketa', dudu: 'Dudu', cas: 'Tio Cas', ana: 'Ana (patroa do Cas)', alan: 'Alan', yori: 'Yori', nauj: 'Nauj', meco: 'Meco', popai: 'Popai', gelado: 'Segurança Gelado', matt: 'Matheus', ltzin: 'Ltzin, Rei de Recife', poli: 'Poli (Rádio Poli FM)' };
const COR_NOME = { luketa: '#ff6ec7', dudu: '#00ff9c', cas: '#ffb347', ana: '#ff7675', alan: '#74b9ff', yori: '#a3e635', nauj: '#2ecc71', meco: '#f1c40f', popai: '#fd79a8', gelado: '#5dade2', matt: '#e17055', ltzin: '#f1c40f', poli: '#a29bfe', nerivan: '#ffd23f' };

const MISSAO = {
  ativa: null, esperas: [], alvo: null, marcadores: [], limite: null, objetivo: '', dialogo: null, feitas: 0, barra: null, ger: 0, chapado: 0,
  esperar(cond) { const ger = this.ger; return new Promise((res, rej) => this.esperas.push({ cond, res, rej, ger })); },
  tick(dt) {
    if (this.limite && this.ativa && !this.dialogo) { this.limite.t -= dt; if (this.limite.t <= 0) { this.falhar(this.limite.msg || 'acabou o tempo'); return; } }
    const lista = this.esperas; this.esperas = [];
    for (const e of lista) {
      if (e.ger !== this.ger) { e.rej(new Aborta()); continue; }
      let ok = false; try { ok = e.cond(dt); } catch (err) { console.error(err); }
      if (e.ger !== this.ger) { e.rej(new Aborta()); continue; }
      if (ok) e.res(); else this.esperas.push(e);
    }
  },
  limpar() {
    this.ger++;
    for (const e of this.esperas) e.rej(new Aborta()); this.esperas = [];
    if (this.dialogo) { this.dialogo.res && this.dialogo.rej(new Aborta()); this.dialogo = null; }
    this.alvo = null; this.marcadores = []; this.limite = null; this.objetivo = ''; this.barra = null; this.chapado = 0;
    W.peds = W.peds.filter(p => !p.missao); W.carros = W.carros.filter(c => !c.missao || c === W.jog.carro);
    if (W.jog.carro && W.jog.carro.missao) { W.jog.carro.missao = false; W.jog.carro.semEntrar = false; }
    W.itens = W.itens.filter(i => !i.missao); W.chefes = []; W.semPolicia = false;
  },
  falhar(msg) {
    if (!this.ativa) return;
    const m = this.ativa; this.ativa = null; this.limpar();
    AVISO = { titulo: 'MISSÃO FALHOU', sub: msg, cor: '#ff4d4d', t: 0, dur: 4 }; SOM.falha();
    if (m.id !== 'intro') mostrarRetry(m);
    setTimeout(() => { if (!this.ativa && !W.jog.morto) falar('luketa', `relaxa! clica em TENTAR DE NOVO ou volta lá no ${NOMES[m.quem]}`, 3.5); }, 4500);
  }
};
let AVISO = null;

// ---------- ferramentas pras missões ----------
function chk() { if (!MISSAO.ativa) throw new Aborta(); }
function diz(quem, txt) {
  chk();
  return new Promise((res, rej) => { MISSAO.dialogo = { quem, txt, res, rej, t: 0 }; }).then(() => chk());
}
async function conversa(...linhas) { for (const [q, t] of linhas) await diz(q, t); }
function objetivo(txt) { MISSAO.objetivo = txt; }
function aPe() { return !W.jog.carro; }
function noCarro() { return !!W.jog.carro; }
async function ate(cond) { chk(); await MISSAO.esperar(cond); chk(); }
async function segundos(s) { let t = 0; await ate(dt => (t += dt) >= s); }
async function vai(x, y, opt = {}) {
  const r = opt.r || 70;
  MISSAO.alvo = { x, y }; const mk = { x, y, r, cor: opt.cor || '#ffd23f' }; MISSAO.marcadores.push(mk);
  if (opt.texto) objetivo(opt.texto);
  await ate(() => (opt.pre ? (opt.pre(), true) : true) && dist(W.jog.x, W.jog.y, x, y) < r && (!opt.aPe || aPe()) && (!opt.carro || noCarro()) && (!opt.cond || opt.cond()));
  MISSAO.marcadores = MISSAO.marcadores.filter(m => m !== mk);
}
function limiteTempo(s, msg) { MISSAO.limite = { t: s, msg }; }
function semLimite() { MISSAO.limite = null; }
function npc(nome, rosto, x, y, extra = {}) {
  const p = novoPed(x, y, { nome: NOMES[rosto] ? NOMES[rosto].split(' (')[0] : nome, rosto, fixo: true, invuln: true, olhaJog: true, semGrana: true, corNome: COR_NOME[rosto] || '#ffd23f', ...extra });
  if (nome) p.nome = nome;
  W.peds.push(p); return p;
}
function inimigo(x, y, extra = {}) {
  const p = novoPed(x, y, { hostil: true, hp: 45, camisa: '#222', armaVisivel: 'pistola', missao: true, semGrana: false, ...extra });
  p.ia = iaInimigo; W.peds.push(p); return p;
}
function iaInimigo(p, dt) {
  const j = W.jog, alvo = j.carro || j, d = dist(p.x, p.y, alvo.x, alvo.y);
  p.a = Math.atan2(alvo.y - p.y, alvo.x - p.x);
  if (d > 900 && !p.persegue) return;
  let v = 0; if (d > (p.longe || 220)) v = p.vel * 2.6; else if (d < 120) v = -p.vel * 1.5;
  if (v) { const nx = p.x + Math.cos(p.a) * v * dt, ny = p.y + Math.sin(p.a) * v * dt; if (!solidoEm(nx, ny) && tileEm(nx, ny) !== TL.AGUA) { p.x = nx; p.y = ny; p.anda += dt * 9; } }
  p.recarga = (p.recarga || rnd(0.5, 1.5)) - dt;
  if (d < (p.alcance || 520) && p.recarga <= 0) {
    p.recarga = p.cad || rnd(1.2, 2.1);
    if (p.armaVisivel === 'escopeta') for (let k = 0; k < 4; k++) inimigoAtira(p, alvo.x, alvo.y, 5, 0.3);
    else if (p.armaVisivel === 'uzi') { for (let k = 0; k < 3; k++) setTimeout(() => !p.morto && inimigoAtira(p, alvo.x, alvo.y, 4, 0.18), k * 90); }
    else inimigoAtira(p, alvo.x, alvo.y, p.dano || 6, 0.2);
  }
}
function premio(v, extra) { W.jog.grana += v; SOM.grana(); }
function pontoRua(i, j, lado = 'cima') { // ponto na rua ao lado do bloco i,j
  if (lado === 'cima') return { x: (GRID * i + 7) * T, y: (GRID * j + 1) * T };
  if (lado === 'baixo') return { x: (GRID * i + 7) * T, y: (GRID * (j + 1) + 1) * T };
  if (lado === 'esq') return { x: (GRID * i + 1) * T, y: (GRID * j + 7) * T };
  return { x: (GRID * (i + 1) + 1) * T, y: (GRID * j + 7) * T };
}
function livrePerto(x, y) {
  for (let r = 0; r < 600; r += 40) for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r; const t = tileEm(nx, ny); if (!SOLIDO.has(t)) return { x: nx, y: ny }; if (r === 0) break; }
  return { x, y };
}
function calcada(i, j) { return { x: (GRID * i + 7) * T, y: (GRID * j + 2.5) * T }; }

// ---------- personagens fixos no mapa ----------
const FIXOS = {};
function criarFixos() {
  const L = LUGAR;
  FIXOS.dudu = npc(null, 'dudu', L.dudu.x + 40, L.dudu.y - 10, { camisa: '#111', calca: '#222' });
  FIXOS.cas = npc(null, 'cas', L.cas.x, L.cas.y + 12, { camisa: '#e67e22', sentado: true });
  FIXOS.ana = npc(null, 'ana', L.cas.x + 60, L.cas.y + 6, { camisa: '#e84393', pele: '#e0ac69', cabelo: '#3b2412', nome: 'Ana' });
  FIXOS.alan = npc(null, 'alan', L.skate.x, L.skate.y, { camisa: '#0984e3' });
  FIXOS.yori = npc(null, 'yori', L.yori.x, L.yori.y, { camisa: '#6ab04c', chapeu: '#c8a165' });
  FIXOS.nauj = npc(null, 'nauj', L.nauj.x, L.nauj.y, { camisa: '#f9ca24', calca: '#6ab04c' });
  FIXOS.meco = npc(null, 'meco', L.baile.x, L.baile.y, { camisa: '#f1c40f', calca: '#111' });
  FIXOS.gelado = npc(null, 'gelado', L.gelado.x, L.gelado.y, { camisa: '#111', calca: '#111' });
  FIXOS.matt = npc(null, 'matt', L.matheus.x, L.matheus.y, { camisa: '#d63031' });
  FIXOS.ltzin = npc(null, 'ltzin', L.ltzin.x, L.ltzin.y, { camisa: '#f1c40f', calca: '#b8860b' });
  FIXOS.ltzin.escondido = true; FIXOS.matt.escondido = true;
}

// ---------- lista de missões ----------
const MISSOES = [
  { id: 'intro', nome: 'Saidinha', quem: 'luketa', lugar: null, fn: missaoIntro },
  { id: 'dudu', nome: 'Hack no Caixa Eletrônico', quem: 'dudu', lugar: 'dudu', fn: missaoDudu },
  { id: 'cas', nome: 'Vai Buscar o Pão, Cas', quem: 'cas', lugar: 'cas', fn: missaoCas },
  { id: 'alan', nome: 'Racha do Alan', quem: 'alan', lugar: 'skate', fn: missaoAlan },
  { id: 'yori', nome: 'Safra Recorde', quem: 'yori', lugar: 'yori', fn: missaoYori },
  { id: 'nauj', nome: 'Rolêzinho com o Nauj', quem: 'nauj', lugar: 'nauj', fn: missaoNauj },
  { id: 'meco', nome: 'Devolve o Grave do Meco', quem: 'meco', lugar: 'baile', fn: missaoMeco },
  { id: 'gelado', nome: 'O HD do Segurança Gelado', quem: 'dudu', lugar: 'dudu', fn: missaoGelado },
  { id: 'matt', nome: 'CLAUDE-BOT 3000', quem: 'matt', lugar: 'matheus', fn: missaoMatheus },
  { id: 'ltzin', nome: 'O Rei de Recife', quem: 'ltzin', lugar: 'ltzin', fn: missaoLtzin }
];
function proximaMissao() { return MISSOES[MISSAO.feitas] || null; }
function lugarMissao(m) {
  if (!m || !m.lugar) return null;
  const L = LUGAR[m.lugar]; if (m.lugar === 'cas') return { x: L.x, y: L.y - 40 };
  return { x: L.x, y: L.y };
}

async function iniciarMissao(m) {
  if (MISSAO.ativa) return;
  MISSAO.ativa = m; MISSAO.ger++;
  AVISO = { titulo: m.nome.toUpperCase(), sub: m.id === 'intro' ? 'GTA 7: SIMAS EDITION' : 'missão ' + MISSOES.indexOf(m), cor: '#ffd23f', t: 0, dur: 3 };
  try {
    await m.fn();
    if (MISSAO.ativa !== m) return;
    MISSAO.ativa = null; MISSAO.limpar();
    MISSAO.feitas = Math.max(MISSAO.feitas, MISSOES.indexOf(m) + 1);
    W.stats.missoes = MISSAO.feitas;
    if (m.id !== 'ltzin') { AVISO = { titulo: 'MISSÃO CUMPRIDA', sub: m.premio ? '+' + fmt$(m.premio) : 'respeito +100', cor: '#7CFC00', t: 0, dur: 4 }; SOM.missao(); }
    salvar();
    const prox = proximaMissao();
    if (prox && m.id !== 'intro') setTimeout(() => { if (!MISSAO.ativa) falar('luketa', `próxima parada: ${NOMES[prox.quem]}. segue a seta amarela`, 4); }, 4200);
  } catch (e) {
    if (!(e instanceof Aborta)) { console.error(e); MISSAO.falhar('deu ruim no jogo: ' + e.message); }
  }
}

// ----- 0: intro -----
async function missaoIntro() {
  W.semPolicia = true;
  await conversa(
    ['luketa', 'Fala, fala! Aqui é o Luketa, teu guia, narrador e melhor amigo do Claude. Bem-vindo ao GTA 7: Simas Edition.'],
    ['luketa', 'Esse aí é o NERIVAN. Rei da engenharia social, especialista em ligar pra idosa fingindo ser do banco. Acabou de sair da saidinha de fim de ano.'],
    ['nerivan', 'liberdade, porra. cadê meu celular? tenho 47 vovó pra ligar ainda hoje'],
    ['luketa', `Calma. Primeiro tu vai precisar de um carro. Chega perto de um e ${ehToque() ? 'toca no botão 🚗' : 'aperta E (ou F)'} pra ROUBAR. Se tiver alguém dentro, tu puxa pra fora mesmo, é GTA.`]
  );
  objetivo(ehToque() ? 'rouba um carro (chega perto e toca no 🚗)' : 'rouba um carro (chega perto e aperta E)');
  await ate(() => noCarro());
  await conversa(['luketa', 'Isso! Agora vai pro esconderijo do Dudu, o hacker. Segue a seta amarela. ' + (ehToque() ? 'O botão 🗺️ mostra o mapa inteiro.' : 'Aperta M pra ver o mapa inteiro.')]);
  await vai(LUGAR.dudu.x, LUGAR.dudu.y + 50, { texto: 'vai pro esconderijo do Dudu', r: 110 });
  W.semPolicia = false;
  await conversa(
    ['dudu', 'Nerivaaaan! Tu saiu! O mundo voltou a ser perigoso pras vovós.'],
    ['dudu', 'Escuta: o Ltzin virou o REI DE RECIFE. Ele tá dando choque no sistema de todo mundo, derrubou meu wi-fi, minha conta do Fatal Model... tudo.'],
    ['nerivan', 'mexeu com o Fatal Model mexeu comigo'],
    ['dudu', 'Pra chegar nele a gente precisa de grana, arma e moral com a galera. Bora começar. Quando quiser trampo, pisa no círculo amarelo.'],
    ['luketa', 'Dica do narrador: tem 💵, 🔫, ❤️ e 🛡️ jogados pela cidade. A GARAGEM do Nerivan pinta teu carro (e tira a polícia da cola). A Simas Store vende roupa e o Arsenal vende munição.']
  );
}

// ----- 1: Dudu, hack no caixa -----
async function missaoDudu() {
  MISSOES[1].premio = 1500;
  await conversa(
    ['dudu', 'Missão simples: eu programei um pendrive que faz o caixa eletrônico cuspir dinheiro. Tem 3 caixas na cidade.'],
    ['dudu', 'Tu para do lado de cada um e espera eu terminar o hack. Vai demorar uns segundos e a polícia vai ficar sabendo.'],
    ['nerivan', 'e se o caixa pedir senha?'],
    ['dudu', 'aí tu liga pra ele fingindo ser do banco, tu é bom nisso']
  );
  const caixas = [calcada(5, 4), calcada(9, 8), calcada(6, 10)];
  for (let k = 0; k < caixas.length; k++) {
    const c = caixas[k];
    const it = { t: 'pacote', icone: '🏧', x: c.x, y: c.y, fica: true, missao: true }; W.itens.push(it);
    await vai(c.x, c.y, { r: 85, texto: `vai até o caixa eletrônico ${k + 1}/3` });
    objetivo('fica perto do caixa enquanto o Dudu hackeia');
    let prog = 0; MISSAO.barra = { txt: 'hackeando...', v: 0 };
    await ate(dt => { if (dist(W.jog.x, W.jog.y, c.x, c.y) < 130) prog += dt; MISSAO.barra.v = prog / 5; return prog >= 5; });
    MISSAO.barra = null; it.morto = true; W.itens = W.itens.filter(i => i !== it);
    for (let n = 0; n < 8; n++) W.itens.push({ t: 'grana', x: c.x + rnd(-50, 50), y: c.y + rnd(-50, 50), v: 60, missao: true });
    falar('dudu', pick(['PLIM PLIM PLIM 💸', 'o caixa tá cuspindo igual o Cas no baile', 'catando, catando!']), 2.5);
    crime(3 + k);
    await segundos(1.5);
  }
  objetivo('despista a polícia (some da vista deles ou pinta o carro na garagem)');
  falar('luketa', 'dica: a GARAGEM pinta teu carro e zera as estrelas', 4);
  await ate(() => W.procurado === 0);
  await vai(LUGAR.dudu.x, LUGAR.dudu.y + 50, { texto: 'volta pro Dudu', r: 110 });
  await conversa(['dudu', 'Bonito! Tua parte tá aí. Ah, o Tio Cas tá te chamando lá no subúrbio, parece que é urgente.'], ['nerivan', 'urgente pro Cas é acabar a cerveja']);
  premio(1500);
}

// ----- 2: Tio Cas e a patroa -----
async function missaoCas() {
  MISSOES[2].premio = 900;
  await conversa(
    ['cas', '*balançando na cadeira* ô Nerivan, meu sobrinho preferido...'],
    ['ana', 'CAS!!! eu já falei TRÊS VEZES pra tu ir buscar o pão!!'],
    ['cas', 'eu tô trabalhando, amor. tô mixando um set mentalmente.'],
    ['ana', 'TRABALHANDO É O CARALHO, tu tá aí nessa cadeira desde terça!'],
    ['cas', 'Nerivan, pelo amor de deus, vai lá na padaria pra mim. Tem quase 2 minutos antes dela me matar.']
  );
  limiteTempo(110, 'a Ana matou o Cas (demorou demais)');
  await vai(LUGAR.padaria.x, LUGAR.padaria.y + 30, { texto: 'busca o pão na padaria', r: 90 });
  falar('nerivan', 'me vê 10 pão francês e não conta pro Cas que eu comi um', 2.5);
  limiteTempo(110, 'o pão esfriou e a Ana matou o Cas');
  await vai(LUGAR.cas.x, LUGAR.cas.y - 20, { texto: 'leva o pão pro Tio Cas', r: 90 });
  semLimite();
  await conversa(
    ['ana', 'Até que enfim! ... CAS, e o GÁS? acabou o gás!'],
    ['cas', '*fecha o olho fingindo que dormiu*'],
    ['ana', 'eu tô VENDO que tu tá acordado, Cas.'],
    ['cas', 'Nerivan... o gás é no Mercadão. Vai com cuidado que o Popai anda aprontando por aí.']
  );
  limiteTempo(130, 'a Ana desistiu e foi morar com a mãe dela');
  await vai(LUGAR.mercado.x, LUGAR.mercado.y + 30, { texto: 'busca o botijão no Mercadão', r: 95 });
  // pegadinha do Popai no caminho
  trollPopai('casca', true);
  await vai(LUGAR.cas.x, LUGAR.cas.y - 20, { texto: 'leva o gás pro Tio Cas', r: 90 });
  semLimite();
  await conversa(
    ['ana', 'Obrigada, Nerivan. Pelo menos ALGUÉM nessa família trabalha.'],
    ['cas', 'aí é brincadeira, dj cas trabalhou muito hoje. toma uma grana aí, sobrinho.'],
    ['luketa', 'O Alan tá te esperando na pista de skate. Ele é desenhista desvalorizado, mas no volante ele é valorizado.']
  );
  premio(900);
}

// ----- 3: racha do Alan -----
async function missaoAlan() {
  MISSOES[3].premio = 1200;
  await conversa(
    ['alan', 'Fala Nerivan! Desenhei um traçado de racha pela cidade inteira. Ninguém valoriza meu desenho, então vou valorizar no racha.'],
    ['alan', 'Pega um carro e me encontra na rua aqui do lado. Quem passar por todos os pontos primeiro ganha.']
  );
  objetivo('pega um carro');
  await ate(() => noCarro());
  const largada = pontoRua(4, 8, 'cima');
  await vai(largada.x, largada.y, { texto: 'vai pra largada', r: 110, carro: true });
  const cps = [pontoRua(6, 8, 'cima'), pontoRua(8, 7, 'dir'), pontoRua(8, 5, 'cima'), pontoRua(6, 4, 'cima'), pontoRua(4, 6, 'esq'), pontoRua(4, 8, 'cima')];
  const ac = novoCarro('esporte', largada.x - 120, largada.y, 0, { cor: '#74b9ff', missao: true, semEntrar: true, nome: 'Alan', listra: '#fff' });
  const alanPed = novoPed(ac.x, ac.y, { rosto: 'alan' }); ac.motorista = alanPed;
  let cpAlan = 0;
  ac.ia = { tipo: 'script', fn: (c, dt) => { if (!CORRIDA.foi) return; const alvo = cps[cpAlan]; if (!alvo) { c.vx *= 0.9; c.vy *= 0.9; moverCarro(c, dt); return; } iaPersegue(c, dt, alvo.x, alvo.y); if (dist(c.x, c.y, alvo.x, alvo.y) < 120) cpAlan++; } };
  TIPOS_CARRO.esporte_alan = { ...TIPOS_CARRO.esporte, vmax: 470, acel: 360 }; ac.modelo = 'esporte_alan';
  W.carros.push(ac);
  const CORRIDA = { foi: false };
  for (const n of ['3', '2', '1']) { AVISO = { titulo: n, sub: 'racha do Alan', cor: '#fff', t: 0, dur: 0.9 }; SOM.bip(440, 0.2, 0.2); await segundos(1); }
  AVISO = { titulo: 'VAI!!', sub: '', cor: '#7CFC00', t: 0, dur: 1 }; SOM.bip(880, 0.4, 0.2); CORRIDA.foi = true;
  limiteTempo(160, 'demorou demais, o Alan foi embora');
  for (let k = 0; k < cps.length; k++) {
    const cp = cps[k];
    await vai(cp.x, cp.y, { r: 120, texto: `racha: ponto ${k + 1}/${cps.length}`, cor: '#00e5ff' });
    SOM.pega();
    if (cpAlan >= cps.length) { MISSAO.falhar('o Alan chegou primeiro. desvalorizado agora é tu'); return new Promise(() => { }); }
  }
  semLimite();
  if (cpAlan >= cps.length) { MISSAO.falhar('o Alan chegou primeiro'); return new Promise(() => { }); }
  await conversa(
    ['alan', 'Caraca, tu é liso! Toma, esse desenho aqui eu fiz de tu... brincadeira, toma grana.'],
    ['alan', 'E fica com meu Opala Turbo, tá lá na tua garagem. Eu vou de skate mesmo.'],
    ['luketa', 'Opala Turbo na garagem! O Yori, lá em Juazeiro, tá precisando de ajuda com a safra.']
  );
  W.garagem.push({ modelo: 'esporte', cor: '#74b9ff', motor: 1, blind: 0, listra: '#fff' });
  premio(1200);
}

// ----- 4: Yori, safra recorde -----
async function missaoYori() {
  MISSOES[4].premio = 1500;
  await conversa(
    ['yori', 'Ô sô Nerivan! Aqui em Juazeiro onde eu piso nasce safra recorde. Colhi tanta manga que não cabe no sítio.'],
    ['yori', 'Leva essa Hilux carregada até o Mercadão na cidade. Mas vai com cuidado: se bater muito, a manga vira suco.'],
    ['nerivan', 'e se eu comer umas no caminho?'],
    ['yori', 'eu conto as manga, Nerivan. Eu alimento o Brasil, não tu.']
  );
  const L = LUGAR.yori;
  const h = novoCarro('pickup', L.x + 120, L.y - 20, 0, { cor: '#7e5109', missao: true, nome: 'Hilux da manga', carga: true });
  W.carros.push(h);
  await vai(h.x, h.y, { r: 60, texto: 'entra na Hilux do Yori', cond: () => W.jog.carro === h });
  h.nome = null;
  limiteTempo(220, 'as manga apodreceu');
  MISSAO.barra = { txt: 'mangas inteiras', v: 1 };
  const falhaCarga = () => { if (!W.carros.includes(h) || h.hp <= 0) MISSAO.falhar('a Hilux explodiu, choveu manga'); else if (h.hp < h.hpMax * 0.2) MISSAO.falhar('bateu demais, a manga virou suco'); };
  await vai(LUGAR.mercado.x, LUGAR.mercado.y + 30, { r: 110, texto: 'leva a Hilux até o Mercadão', cond: () => W.jog.carro === h, pre: falhaCarga });
  MISSAO.barra = null; semLimite();
  if (h.hp < h.hpMax * 0.2) return;
  await conversa(['yori', '*no rádio* Chegou tudo inteiro? Nó, trem bão demais! Já mandei tua parte.'], ['luketa', 'O Nauj tá te chamando lá no Rio. Ele diz que conhece os lugares mais belos da cidade... e eu acredito.']);
  premio(1500);
}

// ----- 5: Nauj, rolê no Rio -----
async function missaoNauj() {
  MISSOES[5].premio = 1200;
  await conversa(
    ['nauj', 'Paz e amor, irmão. Eu sou o Nauj, teu guia favorito. Alma de artista.'],
    ['nauj', 'Hoje eu vou te levar nos lugares mais belos do Rio. Arruma um carro que eu vou de carona, meu bem. A energia tá boa.'],
    ['nerivan', 'que cheiro é esse, Nauj?'],
    ['nauj', 'é incenso, irmão. *tosse* incenso.']
  );
  objetivo('arruma um carro');
  await ate(() => noCarro());
  await vai(FIXOS.nauj.x, FIXOS.nauj.y, { r: 100, texto: 'busca o Nauj', carro: true });
  FIXOS.nauj.escondido = true;
  falar('nauj', 'bora! sente essa brisa...', 2.5);
  const pts = [
    { p: pontoRua(1, 13, 'cima'), fala: 'Olha esse pôr do sol, irmão. Parece um quadro. Eu pintaria se tivesse pincel. E talento.' },
    { p: pontoRua(3, 14, 'baixo'), fala: 'Aqui é a praia onde eu vi um golfinho. Ou era uma sacola. Mesma energia.' },
    { p: pontoRua(4, 11, 'cima'), fala: 'Esse muro tem a melhor vibe do Rio. O muro me entende, sabe?' }
  ];
  for (let k = 0; k < pts.length; k++) {
    MISSAO.chapado = Math.min(1, MISSAO.chapado + 0.35);
    await vai(pts[k].p.x, pts[k].p.y, { r: 120, texto: `rolê do Nauj: ponto turístico ${k + 1}/3`, carro: true, cor: '#2ecc71' });
    await diz('nauj', pts[k].fala);
    if (k === 1) trollPopai('policia');
  }
  await vai(FIXOS.nauj.x, FIXOS.nauj.y + 40, { r: 110, texto: 'deixa o Nauj de volta na barraca', carro: true });
  FIXOS.nauj.escondido = false; MISSAO.chapado = 0;
  await conversa(
    ['nauj', 'Valeu, irmão. Toma uma grana e um presente: achei esse lança-foguete enterrado na areia. Não sei de quem é. Paz.'],
    ['luketa', 'LANÇA-FOGUETE desbloqueado! Agora o Meco, lá em BH, tá desesperado. Roubaram o paredão do baile dele.']
  );
  W.jog.tem.foguete = true; W.jog.municao.foguete += 5;
  premio(1200);
}

// ----- 6: Meco, devolve o grave -----
async function missaoMeco() {
  MISSOES[6].premio = 2000;
  await conversa(
    ['meco', 'NERIVAN! uai sô, roubaram o PAREDÃO do baile! Sem grave não tem baile, sem baile eu não sou o Neymar do funk!'],
    ['nerivan', 'quem foi o filho da puta?'],
    ['meco', 'o POPAI! aquele trollador. Saiu cantando pneu numa Kombi branca agora mesmo. Pega ele!'],
    ['popai', '*de longe* KKKKKKKKK PEGADINHA DO POPAI, QUERO VER ME PEGAR!']
  );
  objetivo('pega um carro e vai atrás do Popai');
  const sp = pontoRua(12, 9, 'baixo');
  const van = novoCarro('pickup', sp.x, sp.y, 0, { cor: '#f5f6fa', missao: true, nome: 'POPAI 🤡', semEntrar: true, hp: 150, hpMax: 150 });
  TIPOS_CARRO.kombi = { ...TIPOS_CARRO.pickup, nome: 'Kombi do Popai', vmax: 420, acel: 320 }; van.modelo = 'kombi';
  van.motorista = novoPed(van.x, van.y, { rosto: null, nome: 'Popai' });
  let fugindo = false, rendido = false;
  van.aoZerar = () => { rendido = true; van.ia = null; van.hp = 1; };
  van.ia = { tipo: 'script', fn: (c, dt) => {
    const j = W.jog, d = dist(c.x, c.y, j.x, j.y);
    if (d < 700) fugindo = true;
    if (!fugindo) return;
    if (d > 2200) { iaPersegue(c, dt, j.x, j.y, 1); return; }
    iaPersegue(c, dt, j.x, j.y, 1, true);
    if (rnd() < dt * 0.25) { W.manchas.push({ t: 'casca', x: c.x - Math.cos(c.a) * 60, y: c.y - Math.sin(c.a) * 60 }); W.itens.push({ t: 'armadilha', icone: '🍌', x: c.x - Math.cos(c.a) * 60, y: c.y - Math.sin(c.a) * 60, missao: true, vida: 20, fn: escorregou }); }
  } };
  W.carros.push(van);
  MISSAO.barra = { txt: 'Kombi do Popai', v: 1 };
  MISSAO.alvoObj = van;
  await ate(() => { MISSAO.alvo = { x: van.x, y: van.y }; MISSAO.barra.v = van.hp / van.hpMax; objetivo(noCarro() ? 'destrói a Kombi do Popai (bate ou atira)' : 'pega um carro e vai atrás do Popai'); return rendido; });
  MISSAO.barra = null; MISSAO.alvoObj = null;
  van.nome = null; van.cor = '#7f8c8d';
  const pop = novoPed(van.x + 40, van.y, { nome: 'Popai', missao: true, invuln: true, camisa: '#fd79a8', corNome: COR_NOME.popai, chapeu: '#e84393' });
  pop.ia = (p, dt) => { const a = Math.atan2(p.y - W.jog.y, p.x - W.jog.x); p.a = a; const nx = p.x + Math.cos(a) * 230 * dt, ny = p.y + Math.sin(a) * 230 * dt; if (!solidoEm(nx, ny)) { p.x = nx; p.y = ny; p.anda += dt * 12; } };
  W.peds.push(pop); falarPed(pop, 'NÃO VALEU, NÃO VALEU! KKKK');
  const cx = van.x, cy = van.y;
  W.itens.push({ t: 'pacote', icone: '🔊', x: cx, y: cy + 60, missao: true, fn: () => { } });
  await vai(cx, cy + 60, { r: 60, texto: 'pega o paredão do Meco' });
  await vai(LUGAR.baile.x, LUGAR.baile.y + 40, { r: 110, texto: 'leva o paredão de volta pro baile' });
  await conversa(
    ['meco', 'O GRAVE VOLTOU!!! BH É QUEM? BH É NÓIS!!'],
    ['meco', 'Se eu não tivesse lesionado tanto eu ia te dar um drible de agradecimento. Toma uma grana.'],
    ['luketa', 'O Dudu descobriu um jeito de chegar no Ltzin. Mas antes... vocês vão ter que mexer com o Segurança Gelado.']
  );
  premio(2000);
}

// ----- 7: Gelado -----
async function missaoGelado() {
  MISSOES[7].premio = 3000;
  await conversa(
    ['dudu', 'O Segurança Gelado guarda um HD com a localização do palácio do Ltzin. Ele é empresário, magnata e segurança nas horas vagas.'],
    ['dudu', 'Ele não faz menos que R$500 por dia. Então ele vai defender esse HD com a vida.'],
    ['nerivan', 'eu ligo pra ele fingindo ser do banco?'],
    ['dudu', 'já tentei. ele desligou e me cobrou R$500 pela ligação. Vai ter que ser na porrada.']
  );
  const L = LUGAR.gelado;
  await vai(L.x, L.y + 120, { r: 150, texto: 'vai pra Central do Segurança Gelado' });
  FIXOS.gelado.escondido = true;
  const g = npc(null, 'gelado', L.x, L.y - 10, { fixo: false, invuln: false, hostil: true, hp: 170, missao: true, armaVisivel: 'escopeta', camisa: '#111', calca: '#111', dano: 6, olhaJog: false });
  g.ia = iaInimigo; g.cad = 1.1; g.alcance = 380;
  const guardas = [];
  for (let k = 0; k < 4; k++) guardas.push(inimigo(L.x + rnd(-260, 260), L.y + rnd(30, 200), { camisa: '#1f2a44', armaVisivel: k % 3 === 0 ? 'uzi' : 'pistola', nome: k === 0 ? 'Segurança' : undefined }));
  await diz('gelado', 'NERIVAN? Aqui não, parceiro. Aqui é SEGURANÇA GELADO. Seguranças: ATIRA!');
  crime(4);
  objetivo('derruba o Segurança Gelado e os seguranças dele');
  MISSAO.barra = { txt: 'Segurança Gelado', v: 1 };
  await ate(() => { MISSAO.alvo = g.morto ? null : { x: g.x, y: g.y }; MISSAO.barra.v = Math.max(0, g.hp / 170); return g.morto; });
  MISSAO.barra = null;
  falar('gelado', 'aaai... eu volto... e ainda faço R$500 hoje...', 3);
  const hd = { t: 'pacote', icone: '💾', x: g.x, y: g.y, missao: true };
  W.itens.push(hd);
  await vai(g.x, g.y, { r: 50, texto: 'pega o HD' });
  crime(9);
  await conversa(['luketa', 'TRÊS ESTRELAS e o Gelado acordou! Despista (a GARAGEM pinta o carro e some com a polícia) e leva o HD pro Dudu.']);
  objetivo('despista a polícia (garagem pinta o carro!) e leva o HD pro Dudu');
  await ate(() => W.procurado === 0);
  await vai(LUGAR.dudu.x, LUGAR.dudu.y + 50, { r: 110, texto: 'leva o HD pro Dudu' });
  FIXOS.gelado.escondido = false;
  await conversa(
    ['dudu', '*pluga o HD* ... achei! O palácio do Ltzin fica no porto de Recife. Mas tem um problema.'],
    ['dudu', 'O caminho é guardado pelo MATHEUS. Ele construiu um robô gigante com ajuda do Claude. Especialista em Claude, né.'],
    ['luketa', 'O laboratório do Matheus é aquele quadrado neon no mapa. Leva arma pesada. MUITA.']
  );
  premio(3000);
}

// ----- 8: Matheus e o robô -----
async function missaoMatheus() {
  MISSOES[8].premio = 5000;
  const L = LUGAR.matheus;
  FIXOS.matt.escondido = true;
  await vai(L.x, L.y + 380, { r: 160, texto: 'entra no laboratório do Matheus' });
  await conversa(
    ['matt', 'Ora ora. O famoso Nerivan. Eu sou o Matheus: artista, criador de games, CEO e humorista nas horas vagas.'],
    ['matt', 'E agora PILOTO. Eu pedi pro Claude: "faz um robô destruidor". Ele fez. Com testes unitários e tudo.'],
    ['nerivan', 'o Claude fez isso? mas ele é tão educado'],
    ['matt', 'ele avisou que era má ideia, mas eu insisti. CLAUDE-BOT 3000: ATIVAR!']
  );
  W.semPolicia = true; W.procurado = 0;
  for (const [dx, dy, t, a] of [[-330, -330, 'arma', 'foguete'], [330, -330, 'arma', 'escopeta'], [-330, 330, 'vida'], [330, 330, 'arma', 'foguete'], [0, 360, 'colete']])
    W.itens.push({ t, arma: a, x: L.x + dx, y: L.y + dy, missao: true, respawn: 20, fica: false });
  const bot = criarRobo(L.x, L.y - 60);
  W.chefes.push(bot);
  objetivo('destrói os braços do robô, depois o núcleo');
  MISSAO.barra = { txt: 'CLAUDE-BOT 3000', v: 1 };
  await ate(() => { MISSAO.barra.v = bot.vidaTotal(); MISSAO.alvo = null; return bot.morto; });
  MISSAO.barra = null; W.semPolicia = false;
  await conversa(
    ['matt', '*saindo da fumaça* ok ok... o Claude tinha avisado. Vou abrir um ticket.'],
    ['matt', 'O porto de Recife tá liberado. O Ltzin tá te esperando. Ele pode dar choque no seu sistema, cuidado.'],
    ['luketa', 'É agora, Nerivan. A missão final. O palácio do Rei de Recife.']
  );
  FIXOS.matt.escondido = false;
  premio(5000);
}

// ----- 9: Ltzin, chefão final -----
async function missaoLtzin() {
  MISSOES[9].premio = 10000;
  const L = LUGAR.ltzin;
  await vai(L.x, L.y + 20, { r: 130, texto: 'invade o palácio do Rei de Recife' });
  const A = { x: L.x, y: L.y - 80 };
  await conversa(
    ['ltzin', 'Quem ousa entrar no palácio do REI DE RECIFE?'],
    ['nerivan', 'é o Nerivan. tu derrubou o wi-fi do Dudu e o meu Fatal Model.'],
    ['ltzin', 'Eu dou choque no sistema de quem eu quiser. Eu sou o rei. E o Luketa é o amor da minha vida.'],
    ['luketa', '...isso não vem ao caso agora, Ltzin.'],
    ['ltzin', 'GUARDAS! MOSTRA PRA ELE COMO É RECIFE!']
  );
  W.semPolicia = true; W.procurado = 0;
  for (const [dx, dy, t, a] of [[-420, 0, 'arma', 'foguete'], [420, 0, 'arma', 'uzi'], [0, -200, 'vida'], [-420, -260, 'colete'], [420, -260, 'arma', 'foguete']]) {
    const q = livrePerto(A.x + dx, A.y + dy);
    W.itens.push({ t, arma: a, x: q.x, y: q.y, missao: true, respawn: 18 });
  }
  for (let onda = 1; onda <= 3; onda++) {
    objetivo(`derruba a guarda do Rei (onda ${onda}/3)`);
    const gs = [];
    for (let k = 0; k < 1 + onda * 2; k++) {
      const a = rnd(Math.PI * 2), d = rnd(350, 520);
      const q = livrePerto(A.x + Math.cos(a) * d, A.y + Math.sin(a) * d), x = q.x, y = q.y;
      gs.push(inimigo(x, y, { camisa: '#b8860b', armaVisivel: onda === 3 && k % 2 ? 'uzi' : 'pistola', hp: 35 + onda * 8, persegue: true, cad: rnd(1.3, 2) }));
    }
    await ate(() => gs.every(p => p.morto));
    if (onda < 3) falar('ltzin', pick(['mais guarda! eu tenho guarda infinito, sou rei!', 'TÁ ACHANDO QUE É FÁCIL?']), 2.5);
    await segundos(1.5);
  }
  await conversa(
    ['ltzin', 'Chega. Vou resolver pessoalmente. CHOQUE-MÓVEL!'],
    ['luketa', 'Ele tá num carro blindado que solta CHOQUE em anel. Quando ver o anel azul, se afasta! Usa os foguetes!']
  );
  FIXOS.ltzin.escondido = true;
  const chefe = criarChoqueMovel(A.x + 300, A.y - 120);
  W.chefes.push(chefe);
  objetivo('destrói o Choque-Móvel do Ltzin');
  MISSAO.barra = { txt: 'CHOQUE-MÓVEL DO REI', v: 1 };
  await ate(() => { MISSAO.barra.v = chefe.vida(); return chefe.fase === 2; });
  await diz('ltzin', 'MEU CARRO! ...tudo bem. Eu ainda tenho minhas mãos. E elas dão choque.');
  objetivo('derrota o Ltzin');
  MISSAO.barra = { txt: 'LTZIN, REI DE RECIFE', v: 1 };
  await ate(() => { MISSAO.barra.v = chefe.vida(); return chefe.morto; });
  MISSAO.barra = null; W.semPolicia = false;
  await conversa(
    ['ltzin', '*ajoelhado* tá bom... tá bom. Tu venceu, Nerivan. Tu é o novo Rei de Recife.'],
    ['nerivan', 'não quero ser rei não. só quero meu wi-fi e meu Fatal Model de volta.'],
    ['ltzin', '*religa o sistema* pronto. Mas o Luketa continua sendo o amor da minha vida.'],
    ['luketa', 'Ltzin, a gente conversa depois.'],
    ['dudu', 'WI-FI VOLTOU!!! 📶'],
    ['cas', '*acordando na cadeira* perdi alguma coisa?'],
    ['ana', 'CAS!!!'],
    ['luketa', 'E assim termina a história do GTA 7: Simas Edition. Mas a cidade é tua, Nerivan. Pode continuar zoando por aí.']
  );
  premio(10000);
  CREDITOS = { t: 0 };
}
let CREDITOS = null;

// ---------- trollagens do Popai ----------
let trollTimer = 200;
function escorregou() {
  W.escorregou = 1.2; SOM.bip(900, 0.4, 0.15, 'sine', 200);
  const j = W.jog;
  if (j.carro) { j.carro.a += rnd(-1.4, 1.4); j.carro.vx *= 0.8; j.carro.vy *= 0.8; tremer(6); }
  falar('popai', pick(['KKKKKKKKK ESCORREGOU', 'PEGADINHA DO POPAI!!', 'é casca de banana, otário KKKK']), 2.5);
}
function trollPopai(tipo, forcado) {
  const j = W.jog;
  tipo = tipo || pick(['casca', 'policia', 'radio', 'grana', 'carro']);
  if (tipo === 'carro' && (!j.carro || MISSAO.ativa)) tipo = 'casca';
  if (tipo === 'casca') {
    const c = j.carro, a = c ? c.a : j.a, d = c ? Math.max(200, Math.abs(c.vel) * 0.8) : 90;
    for (let k = -1; k <= 1; k++) {
      const x = j.x + Math.cos(a) * d + Math.cos(a + Math.PI / 2) * k * 40, y = j.y + Math.sin(a) * d + Math.sin(a + Math.PI / 2) * k * 40;
      W.manchas.push({ t: 'casca', x, y }); W.itens.push({ t: 'armadilha', icone: '🍌', x, y, vida: 25, fn: escorregou });
    }
    falar('popai', 'ô Nerivan, olha pra frente! KKKK', 2.5);
  } else if (tipo === 'policia') {
    crime(2); falar('popai', 'alô, polícia? o Nerivan tá roubando carro! KKKKK PEGADINHA DO POPAI', 3.5);
  } else if (tipo === 'radio') {
    RADIO.atual = 2; RADIO.travadoAte = W.tempo + 20; RADIO.tocar(!!j.carro);
    falar('popai', 'hackeei teu rádio! agora é SÓ TRAP por 20 segundos KKKKK', 3.5);
  } else if (tipo === 'grana') {
    const a = rnd(Math.PI * 2);
    W.itens.push({ t: 'armadilha', icone: '💰', x: j.x + Math.cos(a) * 160, y: j.y + Math.sin(a) * 160, vida: 40, fn: () => {
      W.efeitos.push({ t: 'texto', x: j.x, y: j.y - 30, txt: 'É NOTA DE 3 REAIS 🤡', vida: 2, max: 2, cor: '#fd79a8' });
      for (let k = 0; k < 20; k++) W.efeitos.push({ t: 'faisca', x: j.x + rnd(-40, 40), y: j.y + rnd(-40, 40), vida: 0.6, max: 0.6 });
      falar('popai', 'DINHEIRO FALSO! PEGADINHA DO POPAI KKKKKKK', 3);
    } });
    falar('luketa', 'olha uma maleta de dinheiro ali do lado... suspeito', 2.5);
  } else if (tipo === 'carro') {
    const c = j.carro;
    falar('popai', 'esse carro é meu agora! KKKKKK', 3);
    setTimeout(() => {
      if (W.jog.carro !== c || W.jog.morto) return;
      entrarSair(); c.semEntrar = true; c.nome = 'Popai 🤡';
      c.motorista = novoPed(c.x, c.y, { nome: 'Popai' });
      c.ia = { tipo: 'script', fn: (cc, dt) => { iaPersegue(cc, dt, W.jog.x, W.jog.y, 1, true); cc.fugiu = (cc.fugiu || 0) + dt; if (cc.fugiu > 6) { cc.ia = null; cc.semEntrar = false; cc.nome = null; cc.motorista = null; } } };
    }, 1500);
  }
  W.stats.trollagens++;
}
function atualizaTroll(dt) {
  if (MISSAO.ativa || MISSAO.feitas < 2 || W.jog.morto) return;
  trollTimer -= dt;
  if (trollTimer <= 0) { trollTimer = rnd(180, 300); trollPopai(); }
}

// dicas do Luketa quando tá à toa
let dicaTimer = 45;
const DICAS = [
  'dica: aperta TAB (ou Q) pra trocar de arma',
  'dica: na garagem tu turbina o motor, blinda o carro e guarda até 4 possantes',
  'dica: o freio de mão é ESPAÇO. faz uma drift aí pra mim',
  'dica: ⭐ no chão é suborno, zera a polícia na hora',
  'dica: a Simas Store tem boné, óculos e camisa nova. estilo é tudo, Nerivan',
  'dica: aperta R no carro pra trocar a rádio. A Rádio Poli FM é a melhor, o Poli tem ouvido absoluto',
  'dica: tem lança-foguete escondido pela cidade. procura no mapa (M)',
  'dica: buzina é H. serve pra nada, mas é engraçado'
];
function atualizaDicas(dt) {
  if (MISSAO.ativa || W.jog.morto) return;
  dicaTimer -= dt;
  if (dicaTimer <= 0) {
    dicaTimer = rnd(70, 110);
    const m = proximaMissao();
    if (m && rnd() < 0.5) falar('luketa', `a próxima missão é com ${NOMES[m.quem]}. segue a seta amarela!`, 4);
    else falar('luketa', pick(DICAS), 4.5);
  }
}

// marcadores de missão e lojas no chão
function desenharMarcadores(g) {
  const pulso = 1 + Math.sin(W.tempo * 4) * 0.08;
  const anel = (x, y, r, cor) => {
    g.save(); g.translate(x, y); g.scale(pulso, pulso);
    g.fillStyle = cor + '30'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.strokeStyle = cor; g.lineWidth = 5; g.setLineDash([14, 8]); g.lineDashOffset = -W.tempo * 30; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); g.setLineDash([]);
    g.restore();
  };
  const placa = (x, y, txt, cor) => { g.font = '900 13px "Arial Black", system-ui'; g.textAlign = 'center'; const w = g.measureText(txt).width + 14; g.fillStyle = cor; rr(g, x - w / 2, y - 12, w, 18, 5); g.fill(); g.fillStyle = '#111'; g.fillText(txt, x, y + 2); };
  if (!MISSAO.ativa) {
    const m = proximaMissao(), p = lugarMissao(m);
    if (p) {
      // orelhão tocando (missão começa no telefone, igual GTA 2)
      const x = p.x, y = p.y + 50;
      anel(x, y, 48, '#ffd23f');
      g.save(); g.translate(x, y - 6);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(4, 18, 18, 8, 0, 0, 7); g.fill();
      g.fillStyle = '#f39c12'; g.beginPath(); g.ellipse(0, 0, 18, 22, 0, Math.PI, 0); g.fill(); g.fillRect(-18, 0, 36, 6);
      g.fillStyle = '#7e5109'; g.fillRect(-3, 4, 6, 14); g.fillStyle = '#2c3e50'; g.fillRect(-8, -12, 16, 12);
      const tr = (W.tempo * 2) % 1;
      g.strokeStyle = `rgba(255,210,63,${1 - tr})`; g.lineWidth = 3; g.beginPath(); g.arc(0, -6, 22 + tr * 26, -2.5, -0.6); g.stroke();
      g.restore();
      if ((W.tempo * 2 | 0) % 2) placa(x, y - 44, 'TRIM TRIM ☎', '#ffd23f');
    }
    for (const k of ['garagem', 'garagemBH']) { anel(LUGAR[k].x, LUGAR[k].y, 52, '#ff9f1c'); placa(LUGAR[k].x, LUGAR[k].y + 4, 'PINTA & TURBINA', '#ff9f1c'); }
    anel(LUGAR.roupas.x, LUGAR.roupas.y, 40, '#ff6ec7'); placa(LUGAR.roupas.x, LUGAR.roupas.y + 4, 'ROUPAS', '#ff6ec7');
    anel(LUGAR.armas.x, LUGAR.armas.y, 40, '#e74c3c'); placa(LUGAR.armas.x, LUGAR.armas.y + 4, 'ARMAS', '#e74c3c');
    anel(LUGAR.desmanche.x, LUGAR.desmanche.y, 56, '#fd79a8'); placa(LUGAR.desmanche.x, LUGAR.desmanche.y + 4, 'VENDE CARRO', '#fd79a8');
  }
  for (const mk of MISSAO.marcadores) anel(mk.x, mk.y, Math.min(mk.r, 80), mk.cor);
}

function mostrarRetry(m) {
  const b = document.getElementById('retry'); if (!b) return;
  b.style.display = 'block';
  clearTimeout(mostrarRetry.t); mostrarRetry.t = setTimeout(() => { b.style.display = 'none'; }, 12000);
  b.onclick = () => {
    b.style.display = 'none'; if (MISSAO.ativa) return;
    const j = W.jog; if (j.morto) renascer();
    if (j.carro) entrarSair();
    const p = lugarMissao(m) || LUGAR.dudu; j.x = p.x; j.y = p.y + 50; cam.x = j.x; cam.y = j.y;
    W.procurado = 0; W.calor = 0; j.hp = Math.max(j.hp, 100);
    iniciarMissao(m);
  };
}
