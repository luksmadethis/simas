// =========================================================
// PONTUAÇÃO, TROFÉUS E RANKING (Firestore gta7/{uid})
// =========================================================
W.pontos = 0;
const ST = () => W.stats;
function pontuar(n, txt) {
  if (!n || !W.jog) return;
  W.pontos += n; HUD_PTS_T = 1.2;
  if (txt) W.efeitos.push({ t: 'texto', x: W.jog.x, y: W.jog.y - 46, txt: `${txt} +${n}`, vida: 1.4, max: 1.4, cor: '#7fd7ff' });
}
let HUD_PTS_T = 0;
function conta(k, n = 1) { const s = ST(); s[k] = (s[k] || 0) + n; }
function maxStat(k, v) { const s = ST(); if (!(s[k] >= v)) s[k] = v; }

const TROFEUS = [
  ['roubo1', '🚗', 'Primeiro Assalto', 'rouba o primeiro carro', s => s.roubos >= 1],
  ['roubo25', '🔑', 'Ladrão Profissional', 'rouba 25 carros', s => s.roubos >= 25],
  ['estrela5', '⭐', 'Inimigo Público nº 1', 'chega a 5 estrelas', s => s.maxEstrela >= 5],
  ['fuga3', '💨', 'Fugiu do Gelado', 'despista a polícia com 3+ estrelas', s => s.fugaGrande >= 1],
  ['fuga10', '🏃', 'Ninguém Me Pega', 'despista a polícia 10 vezes', s => s.fugas >= 10],
  ['moto10', '🏍️', 'Treta com os Motoqueiro', 'derruba 10 motoqueiros', s => s.motoqueiros >= 10],
  ['quebra50', '🔨', 'Quebradeira', 'quebra 50 coisas na rua (poste, hidrante...)', s => s.quebrou >= 50],
  ['drift5', '🛞', 'Rei do Drift', 'faz um drift de 5 segundos', s => s.driftMax >= 5],
  ['fatal3', '💋', 'Cliente VIP', 'vai 3 vezes no Fatal Model', s => s.fatal >= 3],
  ['rico', '💰', 'Não Faz Menos que R$500', 'junta R$ 50.000 no bolso', s => W.jog && W.jog.grana >= 50000],
  ['imovel3', '🏠', 'Magnata do Simas', 'compra 3 imóveis', s => (W.imoveis || []).length >= 3],
  ['garagem4', '🅿️', 'Colecionador', 'enche a garagem (4 carros)', s => W.garagem.length >= 4],
  ['seg8', '🔍', 'Caçador de Segredo', 'acha 8 segredos', s => (W.segredos || []).length >= 8],
  ['platina', '🏆', 'Platina Simas', 'acha os 16 segredos', s => (W.segredos || []).length >= 16],
  ['galinha', '🐔', 'Pegou o Galado', 'pega a galinha com a cara do Gelado', s => (W.segredos || []).includes('galinha')],
  ['alan', '🛹', 'Desvalorizado Não', 'ganha o racha de skate do Alan', s => MISSAO.feitas >= 4],
  ['zerou', '👑', 'Novo Rei de Recife', 'zera a história', s => MISSAO.feitas >= MISSOES.length],
  ['motos3', '🔥', 'Grau Master', 'faz as 3 missões de moto', s => Object.keys(W.extras || {}).length >= 3],
  ['indonesia', '🇮🇩', 'Passaporte Carimbado', 'vai até a Indonésia', s => s.indonesia >= 1],
  ['mirante', '⛰️', 'Turista da Serra', 'chega no Mirante da Serra', s => s.mirante >= 1],
  ['sibito', '🤬', 'Saco de Pancada', 'ouve 20 xingamentos da Sibito', s => s.xingado >= 20],
  ['morreu10', '💀', 'Paga Nada, Primo', 'morre 10 vezes', s => s.mortes >= 10],
  ['preso5', '🚔', 'Freguês da Delegacia', 'é preso 5 vezes', s => s.presos >= 5],
  ['nadador', '🏊', 'Peixe de Favela', 'nada 30 segundos', s => s.nado >= 30],
  ['marinheiro', '🚤', 'Marinheiro de Primeira Viagem', 'pilota um barco', s => s.barco >= 1],
  ['bau', '🏴‍☠️', 'Pirata do Simas', 'acha o baú da Ilha do Gelado', s => s.bau >= 1],
  ['arsenal', '🧨', 'Arsenal Completo', 'tem todas as armas', s => W.jog && ORDEM_ARMAS.every(k => W.jog.tem[k])]
];
let trofeuTimer = 1;
function atualizaConquistas(dt) {
  const j = W.jog; if (!j || j.morto) return;
  const s = ST();
  // drift contínuo
  if (j.carro && j.carro.derrapa > 180 && Math.abs(j.carro.vel) > 220) { W.driftT = (W.driftT || 0) + dt; maxStat('driftMax', W.driftT); }
  else if (W.driftT) { if (W.driftT > 1) pontuar(Math.floor(W.driftT * 25), 'DRIFT ' + W.driftT.toFixed(1) + 's'); W.driftT = 0; }
  maxStat('maxEstrela', W.procurado);
  if (j.nadando) conta('nado', dt);
  if (j.carro && TIPOS_CARRO[j.carro.modelo].barco) maxStat('barco', 1);
  const reg = regiaoEm(j.x, j.y);
  if (reg === REG.INDONESIA) maxStat('indonesia', 1);
  if (LUGAR.mirante && dist(j.x, j.y, LUGAR.mirante.x, LUGAR.mirante.y) < 300) maxStat('mirante', 1);
  trofeuTimer -= dt; if (trofeuTimer > 0) return; trofeuTimer = 1;
  W.trofeus = W.trofeus || [];
  for (const [id, ic, nome, , cond] of TROFEUS) {
    if (W.trofeus.includes(id)) continue;
    let ok = false; try { ok = cond(s); } catch (e) { }
    if (ok) {
      W.trofeus.push(id); pontuar(500); SOM.missao();
      TROFEU_AVISO = { ic, nome, t: 0 };
      salvar(); break;
    }
  }
  // manda pro ranking de vez em quando
  RANK.timer -= 1; if (RANK.timer <= 0) { RANK.timer = 20; RANK.enviar(); }
}
let TROFEU_AVISO = null;
function desenharTrofeuAviso(g, dt) {
  const a = TROFEU_AVISO; if (!a) return;
  a.t += dt; if (a.t > 4.5) { TROFEU_AVISO = null; return; }
  const k = a.t < 0.35 ? a.t / 0.35 : a.t > 4 ? (4.5 - a.t) / 0.5 : 1;
  const w = Math.min(380, VW - 30), x = VW / 2 - w / 2, y = VH - (ehToque() ? 300 : 150) + (1 - k) * 40;
  g.globalAlpha = k; g.fillStyle = 'rgba(15,12,25,.94)'; rr(g, x, y, w, 62, 12); g.fill(); g.strokeStyle = '#f1c40f'; g.lineWidth = 3; g.stroke();
  g.font = '30px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(a.ic, x + 36, y + 31);
  g.textAlign = 'left'; g.font = '900 11px system-ui'; g.fillStyle = '#f1c40f'; g.fillText('🏆 TROFÉU DESBLOQUEADO  +500', x + 66, y + 20);
  g.font = '900 17px system-ui'; g.fillStyle = '#fff'; g.fillText(a.nome, x + 66, y + 42); g.textBaseline = 'alphabetic'; g.globalAlpha = 1;
}
function menuTrofeus() {
  const t = W.trofeus || [];
  abrirMenu(`🏆 TROFÉUS ${t.length}/${TROFEUS.length}`, TROFEUS.map(([id, ic, nome, desc]) => ({ txt: (t.includes(id) ? ic + ' ' + nome : '🔒 ' + nome) + ' — ' + desc, off: true, fn: () => { } }))
    .concat([{ txt: '⬅️ voltar', fn: () => { menuPausa(); return false; } }]), `${W.pontos.toLocaleString('pt-BR')} pontos`);
}

// ---------- ranking online ----------
const RANK = {
  ok: false, uid: null, db: null, melhor: 0, top: [], timer: 20,
  nome() { try { return (localStorage.getItem('galado-nome') || '').trim(); } catch (e) { return ''; } },
  iniciar() {
    if (typeof firebase === 'undefined') return;
    try {
      if (!firebase.apps.length) firebase.initializeApp({ apiKey: 'AIzaSyA0G_qSK5eEVzGnLskGS8leXCwC7XNzK0A', authDomain: 'simasfitness2.firebaseapp.com', projectId: 'simasfitness2', storageBucket: 'simasfitness2.firebasestorage.app', messagingSenderId: '1068623437415', appId: '1:1068623437415:web:63ccdb065e991452563ec2' });
      this.db = firebase.firestore();
      firebase.auth().onAuthStateChanged(async u => {
        if (!u) { firebase.auth().signInAnonymously().catch(() => { }); return; }
        this.uid = u.uid; this.ok = true;
        try { const d = await this.db.collection('gta7').doc(u.uid).get(); if (d.exists) this.melhor = d.data().pts || 0; } catch (e) { }
        this.db.collection('gta7').orderBy('pts', 'desc').limit(10).onSnapshot(q => { const l = []; q.forEach(d => l.push({ ...d.data(), eu: d.id === this.uid })); this.top = l; mostraTopTitulo(); }, () => { });
      });
    } catch (e) { }
  },
  enviar(forca) {
    const nome = this.nome(), p = Math.min(1000000, Math.floor(W.pontos));
    if (!this.ok || !nome || (!forca && p <= this.melhor)) return;
    const novo = Math.max(p, this.melhor);
    this.db.collection('gta7').doc(this.uid).set({ nome: nome.slice(0, 20), pts: novo, t: firebase.firestore.FieldValue.serverTimestamp() }).then(() => { this.melhor = novo; }).catch(() => { });
  }
};
function menuRanking() {
  const esc = t => String(t).replace(/[<>&]/g, '');
  const l = RANK.top.map((r, i) => ({ txt: `${['🥇', '🥈', '🥉'][i] || (i + 1) + 'º'} ${esc(r.nome)}${r.eu ? ' (tu)' : ''} — ${r.pts.toLocaleString('pt-BR')} pts`, off: true, fn: () => { } }));
  abrirMenu('📊 RANKING GTA 7', (l.length ? l : [{ txt: RANK.ok ? 'ninguém no ranking ainda, bora ser o primeiro' : 'ranking fora do ar agora', off: true, fn: () => { } }])
    .concat([{ txt: '✏️ ' + (RANK.nome() ? 'trocar o nome (' + esc(RANK.nome()) + ')' : 'botar nome pra entrar no ranking'), fn: () => { pedeNome(); return false; } }, { txt: '⬅️ voltar', fn: () => { menuPausa(); return false; } }]),
    `teus pontos: ${W.pontos.toLocaleString('pt-BR')} · melhor no ranking: ${RANK.melhor.toLocaleString('pt-BR')}`);
}
function pedeNome() {
  const el = document.getElementById('menu');
  el.innerHTML = `<div class="caixa"><h2>✏️ TEU NOME</h2><p class="sub">aparece no ranking do GTA 7 (o mesmo nome dos outros jogos)</p><div class="lista"><input id="nomeRank" maxlength="20" placeholder="teu nome" style="padding:12px;border-radius:8px;border:2px solid #ffd23f;background:#100d18;color:#fff;font:700 16px system-ui"><button class="item" id="nomeOk"><span>salvar</span></button></div><button class="fechar">voltar</button></div>`;
  const inp = el.querySelector('#nomeRank'); inp.value = RANK.nome(); setTimeout(() => inp.focus(), 50);
  const ok = () => { const n = inp.value.replace(/\s+/g, ' ').trim().slice(0, 20); if (!n) return; try { localStorage.setItem('galado-nome', n); } catch (e) { } RANK.enviar(true); menuRanking(); };
  el.querySelector('#nomeOk').onclick = ok; inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') ok(); };
  el.querySelector('.fechar').onclick = () => menuRanking();
}
function mostraTopTitulo() {
  const el = document.getElementById('topTitulo'); if (!el) return;
  const esc = t => String(t).replace(/[<>&]/g, '');
  el.innerHTML = RANK.top.length ? '<b>📊 TOP 5</b>' + RANK.top.slice(0, 5).map((r, i) => `<span>${['🥇', '🥈', '🥉', '4º', '5º'][i]} ${esc(r.nome)} <i>${r.pts.toLocaleString('pt-BR')}</i></span>`).join('') : '';
}
RANK.iniciar();
