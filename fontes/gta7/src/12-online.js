// =========================================================
// GTA 7 ONLINE: todo mundo na mesma cidade (PeerJS, sem servidor pago)
// Topologia em estrela: o primeiro que entra vira o "dono da sala" (hub) e repassa as mensagens.
// =========================================================
const SKINS = ['nerivan', 'luketa', 'dudu', 'cas', 'alan', 'yori', 'nauj', 'meco', 'gelado', 'matt', 'ltzin', 'poli'];
const CORES_ON = ['#ff6ec7', '#00e5ff', '#a3e635', '#ffd23f', '#ff8c00', '#c39bff', '#ff4d4d', '#2ecc71'];
const XT_ON = { username: '000000002110340597', credential: 'U4qy8QoeIvlClfNWfeKEe5H5SEg=' };
const MT_ON = { username: '548494ace23c20cd695390e4', credential: '8J1k5FjHjBiCcjCh' };
const PEER_ON = { debug: 0, config: { iceServers: [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun.relay.metered.ca:80'] },
  { urls: ['turn:free.expressturn.com:3478', 'turn:free.expressturn.com:3478?transport=tcp'], ...XT_ON },
  { urls: 'turn:global.relay.metered.ca:80', ...MT_ON },
  { urls: 'turns:global.relay.metered.ca:443?transport=tcp', ...MT_ON }
] } };
const ONLINE = {
  ativo: false, sala: 'geral', skin: 'nerivan', cor: '#ff6ec7', peer: null, hub: null, hubConns: new Map(), conn: null, id: null,
  outros: new Map(), feed: [], abates: 0, mortes: 0, tEnvio: 0, status: 'conectando…', ultAtac: null, ultAtacT: 0,
  hubId() { return 'gta7-online-' + this.sala.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20); },
  iniciar() {
    if (typeof Peer === 'undefined') { this.status = 'online fora do ar (não carregou a conexão)'; return; }
    this.peer = new Peer(PEER_ON);
    this.peer.on('open', id => { this.id = id; this.entrar(); });
    this.peer.on('error', e => { if (e.type === 'peer-unavailable' && String(e.message).includes(this.hubId())) this.virarDono(); });
    this.peer.on('disconnected', () => setTimeout(() => { try { if (this.peer && !this.peer.destroyed && this.peer.disconnected) this.peer.reconnect(); } catch (er) { } }, 1000));
  },
  entrar() {
    if (!this.peer || !this.peer.open) return;
    this.status = 'entrando na sala…';
    const c = this.peer.connect(this.hubId(), { reliable: false });
    let abriu = false;
    c.on('open', () => { abriu = true; this.conn = c; this.status = 'online'; this.noFeed('🌐 tu entrou na sala ' + this.sala, '#7fd7ff'); });
    c.on('data', d => this.receber(d));
    c.on('close', () => { if (this.conn === c) { this.conn = null; this.status = 'reconectando…'; setTimeout(() => this.entrar(), 800 + Math.random() * 1500); } });
    setTimeout(() => { if (!abriu && this.conn !== c) { try { c.close(); } catch (e) { } this.virarDono(); } }, 6000);
  },
  virarDono() {
    if (this.hub || this.virando) return; this.virando = true;
    const h = new Peer(this.hubId(), PEER_ON);
    h.on('open', () => {
      this.virando = false; this.hub = h;
      h.on('connection', c => {
        c.on('open', () => this.hubConns.set(c.peer, c));
        c.on('data', d => { if (!d || typeof d !== 'object') return; d.de = c.peer; for (const [id, o] of this.hubConns) if (id !== c.peer && o.open) try { o.send(d); } catch (e) { } });
        c.on('close', () => { this.hubConns.delete(c.peer); for (const o of this.hubConns.values()) try { o.send({ t: 'saiu', de: c.peer }); } catch (e) { } });
      });
      setTimeout(() => this.entrar(), 300);
    });
    h.on('error', e => { this.virando = false; if (e.type === 'unavailable-id') { try { h.destroy(); } catch (er) { } setTimeout(() => this.entrar(), 500 + Math.random() * 1000); } });
  },
  enviar(d) { if (this.conn && this.conn.open) try { this.conn.send(d); } catch (e) { } },
  receber(d) {
    if (!d || typeof d !== 'object' || d.de === this.id) return;
    const id = d.de;
    if (d.t === 'st') {
      let o = this.outros.get(id);
      if (!o) { o = { id, x: d.x, y: d.y, a: d.a, anda: 0 }; this.outros.set(id, o); this.noFeed(`🟢 ${String(d.n || '???').slice(0, 20)} entrou`, '#7CFC00'); }
      Object.assign(o, { tx: d.x, ty: d.y, ta: d.a, n: String(d.n || '???').slice(0, 20), sk: SKINS.includes(d.sk) ? d.sk : 'nerivan', cor: d.cor, ar: d.ar, c: d.c, r: d.r || {}, hp: d.hp, ab: d.ab | 0, visto: performance.now(), morto: d.m });
    } else if (d.t === 'tiro') {
      W.balas.push({ x: d.x, y: d.y, vx: d.vx, vy: d.vy, vida: d.v || 0.6, dano: Math.min(30, d.dano || 10), dono: { remoto: id } });
      if (dist(d.x, d.y, W.jog.x, W.jog.y) < 900) SOM.barulho(0.1, 0.2, 2000);
    } else if (d.t === 'exp') {
      W.efeitos.push({ t: 'explosao', x: d.x, y: d.y, r: d.r, vida: 0.7, max: 0.7 }); SOM.explosao();
      const j = W.jog, al = j.carro || j, dd = dist(al.x, al.y, d.x, d.y);
      if (dd < d.r) { this.marcaAtacante(id); if (j.carro) danoCarro(j.carro, d.dano * (1 - dd / d.r) * 1.2); else ferirJogador(d.dano * (1 - dd / d.r)); }
    } else if (d.t === 'morri') {
      const vit = this.outros.get(id), nomeV = vit ? vit.n : '???';
      if (d.por === this.id) { this.abates++; W.jog.grana += 500; pontuar(150, 'ABATE'); conta('abatesOnline'); this.noFeed(`💀 tu derrubou ${nomeV} (+R$ 500)`, '#ffd23f'); }
      else { const k = this.outros.get(d.por); this.noFeed(k ? `💀 ${k.n} derrubou ${nomeV}` : `💀 ${nomeV} se fudeu sozinho`, '#ff9f9f'); }
    } else if (d.t === 'chat') {
      const o = this.outros.get(id), txt = String(d.txt || '').slice(0, 80);
      if (o) { o.balao = txt; o.balaoT = 5; } this.noFeed(`💬 ${o ? o.n : '???'}: ${txt}`, '#fff');
    } else if (d.t === 'saiu') {
      const o = this.outros.get(id); if (o) { this.noFeed(`🔴 ${o.n} saiu`, '#aaa'); this.outros.delete(id); }
    }
  },
  noFeed(txt, cor) { this.feed.push({ txt, cor, t: 0 }); if (this.feed.length > 6) this.feed.shift(); },
  marcaAtacante(id) { this.ultAtac = id; this.ultAtacT = W.tempo; },
  morri() { if (!this.ativo) return; this.mortes++; this.enviar({ t: 'morri', por: W.tempo - this.ultAtacT < 8 ? this.ultAtac : null }); },
  tiro(b) { if (this.ativo) this.enviar({ t: 'tiro', x: Math.round(b.x), y: Math.round(b.y), vx: Math.round(b.vx), vy: Math.round(b.vy), v: +b.vida.toFixed(2), dano: b.dano }); },
  explosao(x, y, r, dano) { if (this.ativo) this.enviar({ t: 'exp', x: Math.round(x), y: Math.round(y), r, dano }); },
  tick(dt) {
    if (!this.ativo) return;
    const j = W.jog; if (!j) return;
    this.tEnvio -= dt;
    if (this.tEnvio <= 0) {
      this.tEnvio = 0.1;
      const c = j.carro;
      this.enviar({ t: 'st', n: RANK.nome() || 'sem nome', sk: this.skin, cor: this.cor, x: Math.round(j.x), y: Math.round(j.y), a: +(c ? c.a : j.a).toFixed(2), ar: j.arma, hp: Math.round(j.hp), m: j.morto ? 1 : 0, ab: this.abates,
        c: c ? { m: c.modelo, cor: c.cor, l: c.listra || 0, v: Math.round(Math.hypot(c.vx, c.vy)) } : null,
        r: { ca: j.camisa, cl: j.calca, ch: j.chapeu, ct: j.chapeuTipo, o: j.oculos ? 1 : 0, e: j.estampa, ja: j.jaqueta, co: j.corrente ? 1 : 0, mo: j.mochila, tc: j.tenisCor, ro: j.rodaAtiva, ot: j.oculosTipo, ma: j.mascara, cs: j.costas, cc: j.costasCor, ci: j.cintura, fa: j.fantasia, cr: j.corte, cb: j.cabelo, ba: j.barba ? 1 : 0, pe: j.pele, ga: j.galinha ? 1 : 0 } });
    }
    const agora = performance.now();
    for (const [id, o] of this.outros) {
      if (agora - o.visto > 6000) { this.outros.delete(id); continue; }
      const k = Math.min(1, dt * 12);
      const dx = o.tx - o.x, dy = o.ty - o.y;
      if (Math.hypot(dx, dy) > 600) { o.x = o.tx; o.y = o.ty; } else { o.x += dx * k; o.y += dy * k; }
      o.a += angDiff(o.a, o.ta) * k; o.anda += Math.hypot(dx, dy) * 0.05;
      if (o.balaoT > 0) o.balaoT -= dt;
      // carro do outro empurra o meu / me atropela
      if (o.c && !o.morto) {
        const tc = TIPOS_CARRO[o.c.m] || TIPOS_CARRO.sedan, al = j.carro || j, d = dist(al.x, al.y, o.x, o.y), r = j.carro ? (tc.l + j.carro.l) * 0.32 : tc.l * 0.42;
        if (d < r && d > 1) {
          const nx = (al.x - o.x) / d, ny = (al.y - o.y) / d;
          if (j.carro) { j.carro.x = o.x + nx * r; j.carro.y = o.y + ny * r; j.carro.vx += nx * 120; j.carro.vy += ny * 120; }
          else if (!j.morto) { j.x = o.x + nx * r; j.y = o.y + ny * r; if (o.c.v > 150) { this.marcaAtacante(id); ferirJogador(o.c.v * 0.05); } }
        }
      }
    }
    for (const f of this.feed) f.t += dt;
    this.feed = this.feed.filter(f => f.t < 7);
  },
  desenhar(g) {
    if (!this.ativo) return;
    for (const o of this.outros.values()) {
      if (o.morto) continue;
      const r = o.r || {};
      const pessoa = { x: o.x, y: o.y, a: o.a, anda: o.anda, rosto: o.sk, pele: '#c68642', camisa: r.ca || '#ff6ec7', calca: r.cl || '#1a1a2e', chapeu: r.ch, chapeuTipo: r.ct, oculos: !!r.o, estampa: r.e, jaqueta: r.ja, corrente: !!r.co, mochila: r.mo, tenisCor: r.tc, rodaAtiva: r.ro, corNome: o.cor, oculosTipo: r.ot, mascara: r.ma, costas: r.cs, costasCor: r.cc, cintura: r.ci, fantasia: r.fa, corte: r.cr, cabelo: r.cb, barba: !!r.ba };
      if (r.pe) pessoa.pele = r.pe;
      if (r.ga) pessoa.galinha = true;
      if (o.c) {
        const tc = TIPOS_CARRO[o.c.m] || TIPOS_CARRO.sedan;
        desenharCarro(g, { modelo: TIPOS_CARRO[o.c.m] ? o.c.m : 'sedan', x: o.x, y: o.y, a: o.a, w: tc.w, l: tc.l, hp: 1, hpMax: 1, cor: o.c.cor || '#888', listra: o.c.l || null, vx: Math.cos(o.a) * o.c.v, vy: Math.sin(o.a) * o.c.v, motor: 0, blind: 0, sirene: false, motorista: pessoa });
      } else desenharPessoa(g, pessoa, { arma: o.ar, nomes: false, escala: 1.45, jog: true });
      g.save(); g.translate(o.x, o.y); g.scale(1, 1 / INCL);
      g.font = '900 13px system-ui'; g.textAlign = 'center'; const tag = `${o.n}${o.ab ? ' · 💀' + o.ab : ''}`, w = g.measureText(tag).width + 14;
      g.fillStyle = 'rgba(0,0,0,.7)'; rr(g, -w / 2, -100, w, 18, 6); g.fill(); g.fillStyle = o.cor || '#fff'; g.fillText(tag, 0, -87);
      barra(g, -22, -80, 44, 4, (o.hp || 0) / 100, '#e74c3c');
      if (o.balaoT > 0 && o.balao) { g.font = 'bold 13px system-ui'; const bw = Math.min(260, g.measureText(o.balao).width + 18); g.fillStyle = 'rgba(255,255,255,.95)'; rr(g, -bw / 2, -134, bw, 26, 10); g.fill(); g.fillStyle = '#111'; g.fillText(o.balao, 0, -116); }
      g.restore();
    }
  },
  hud(g) {
    if (!this.ativo) return;
    const peq = VW < 760, x = VW - 14;
    g.textAlign = 'right'; g.font = `900 ${peq ? 11 : 12}px system-ui`;
    const n = this.outros.size + 1;
    textoContorno(g, `🌐 ${this.status === 'online' ? 'ONLINE' : this.status} · sala ${this.sala} · ${n} jogador${n > 1 ? 'es' : ''} · 💀 ${this.abates}`, x, (peq ? 30 : 38) + (peq ? 32 : 40), this.status === 'online' ? '#7CFC00' : '#ffd23f', 3);
    let y = VH - (ehToque() ? 330 : 230);
    g.font = `bold ${peq ? 11 : 13}px system-ui`;
    for (const f of this.feed) { g.globalAlpha = Math.min(1, (7 - f.t) / 1); textoContorno(g, f.txt, x, y, f.cor, 3); y += peq ? 15 : 18; }
    g.globalAlpha = 1;
  },
  mini(blip) { for (const o of this.outros.values()) if (!o.morto) blip(o.x, o.y, o.cor || '#fff', 5); },
  chat() {
    if (!this.ativo) return;
    const el = document.getElementById('chatOn'); el.style.display = 'flex'; const inp = el.querySelector('input'); inp.value = ''; setTimeout(() => inp.focus(), 30);
    inp.onkeydown = e => {
      e.stopPropagation();
      if (e.key === 'Enter') { const t = inp.value.trim().slice(0, 80); if (t) { this.enviar({ t: 'chat', txt: t }); this.noFeed('💬 tu: ' + t, '#fff'); falarPed(W.jog, t); } el.style.display = 'none'; inp.blur(); }
      if (e.key === 'Escape') { el.style.display = 'none'; inp.blur(); }
    };
  }
};
// lobby do online (escolhe nome, cara e sala)
function abrirLobbyOnline(save) {
  const el = document.getElementById('lobby'); el.style.display = 'flex';
  const nomeAt = (() => { try { return localStorage.getItem('galado-nome') || ''; } catch (e) { return ''; } })();
  let skin = (() => { try { return localStorage.getItem('gta7-skin') || 'nerivan'; } catch (e) { return 'nerivan'; } })();
  const sala0 = new URLSearchParams(location.search).get('sala') || 'geral';
  el.innerHTML = `<div class="caixa"><h2>🌐 GTA 7 ONLINE</h2><p class="sub">modo livre com a galera: mesma cidade, tiro valendo, placar de abate. a história fica no modo normal.</p>
    <label>teu nome</label><input id="lbNome" maxlength="20" value="${nomeAt.replace(/"/g, '')}" placeholder="teu nome">
    <label>escolhe teu personagem (cada um tem história e poder)</label><div class="skins">${SKINS.map(s => `<button data-s="${s}" class="${s === skin ? 'on' : ''}"><img src="${(typeof FOTOS !== 'undefined' && FOTOS[s]) || ''}"><span>${NOMES[s] && PERSONAGENS[s] ? PERSONAGENS[s].nomes[PERSONAGENS[s].nomes.length - 1] : s}</span></button>`).join('')}</div><div class="ficha">${fichaPersonagem(skin)}</div>
    <label>sala</label><input id="lbSala" maxlength="20" value="${sala0.replace(/"/g, '')}">
    <button class="vai">▶ ENTRAR NO ONLINE</button><button class="volta">voltar</button></div>`;
  el.querySelectorAll('.skins button').forEach(b => b.onclick = () => { skin = b.dataset.s; el.querySelectorAll('.skins button').forEach(x => x.classList.toggle('on', x === b)); el.querySelector('.ficha').innerHTML = fichaPersonagem(skin); });
  el.querySelector('.volta').onclick = () => { el.style.display = 'none'; };
  el.querySelector('.vai').onclick = () => {
    const n = el.querySelector('#lbNome').value.replace(/\s+/g, ' ').trim().slice(0, 20); if (!n) { el.querySelector('#lbNome').focus(); return; }
    try { localStorage.setItem('galado-nome', n); localStorage.setItem('gta7-skin', skin); } catch (e) { }
    ONLINE.ativo = true; ONLINE.skin = skin; ONLINE.sala = el.querySelector('#lbSala').value.trim() || 'geral'; ONLINE.cor = pick(CORES_ON);
    el.style.display = 'none';
    iniciarJogo(save, true);
  };
}
