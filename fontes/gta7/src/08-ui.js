// =========================================================
// TELA: HUD, mini-mapa, mapa, diálogos, menus, celular
// =========================================================
let REGIAO_ATUAL = -1, REGIAO_AVISO = null, RADIO_AVISO = null, CARRO_AVISO = null, MAPA_ABERTO = false, PAUSA = false, MENU = null;
const ehToque = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function rostoHUD(g, quem, x, y, r) {
  const im = ROSTOS[quem];
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.closePath();
  if (im && im.complete && im.naturalWidth) { g.clip(); g.drawImage(im, x - r, y - r, r * 2, r * 2); }
  else { g.fillStyle = COR_NOME[quem] || '#888'; g.fill(); g.fillStyle = '#111'; g.font = `900 ${r}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(quem === 'ana' ? '👩' : (NOMES[quem] || '?')[0], x, y + 1); g.textBaseline = 'alphabetic'; }
  g.restore();
  g.strokeStyle = COR_NOME[quem] || '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
}
function quebraTexto(g, txt, larg) {
  const pal = txt.split(' '), linhas = []; let l = '';
  for (const p of pal) { const t = l ? l + ' ' + p : p; if (g.measureText(t).width > larg && l) { linhas.push(l); l = p; } else l = t; }
  if (l) linhas.push(l); return linhas;
}
function textoContorno(g, t, x, y, cor, larg = 4) { g.lineWidth = larg; g.strokeStyle = 'rgba(0,0,0,.9)'; g.strokeText(t, x, y); g.fillStyle = cor; g.fillText(t, x, y); }

const FONTE = '"Arial Black", Impact, system-ui';
function cabecaPolicia(g, x, y, r, ativo, gelado) {
  g.save(); g.globalAlpha = ativo ? 1 : 0.22;
  if (gelado && ativo && ROSTOS.gelado && ROSTOS.gelado.naturalWidth) {
    g.beginPath(); g.arc(x, y, r, 0, 7); g.save(); g.clip(); g.drawImage(ROSTOS.gelado, x - r, y - r, r * 2, r * 2); g.restore();
    g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.stroke();
  } else {
    g.fillStyle = '#f1c27d'; g.beginPath(); g.arc(x, y + 2, r * 0.8, 0, 7); g.fill();
    g.fillStyle = '#1b2a6b'; g.beginPath(); g.arc(x, y - r * 0.15, r * 0.85, Math.PI, 0); g.fill(); g.fillRect(x - r, y - r * 0.2, r * 2, r * 0.3);
    g.fillStyle = '#ffd700'; g.fillRect(x - 3, y - r * 0.6, 6, 5);
    g.fillStyle = '#111'; g.fillRect(x - r * 0.4, y + 2, 3, 3); g.fillRect(x + r * 0.4 - 3, y + 2, 3, 3);
    g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(x, y + 2, r * 0.8, 0, 7); g.stroke();
  }
  g.restore();
}
function coracao(g, x, y, r, v) {
  const forma = () => { g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.6, y - r * 1.1, x, y - r * 0.35); g.bezierCurveTo(x + r * 0.6, y - r * 1.1, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); g.closePath(); };
  forma(); g.fillStyle = '#3a0d0d'; g.fill();
  if (v > 0) { g.save(); forma(); g.clip(); g.fillStyle = '#ff2d3d'; g.fillRect(x - r * 1.5, y - r * 1.2, r * 3 * v, r * 2.4); g.restore(); }
  forma(); g.strokeStyle = '#000'; g.lineWidth = 2; g.stroke();
}

function desenharHUD(dt) {
  const g = ctx, j = W.jog, peq = VW < 760, toque = ehToque();
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (MISSAO.chapado > 0) { g.fillStyle = `hsla(${(W.tempo * 60) % 360},80%,50%,${0.12 * MISSAO.chapado})`; g.fillRect(0, 0, VW, VH); }
  // borda piscando com polícia forte (estilo GTA 2)
  if (W.procurado >= 3 && !j.morto) { const k = (W.tempo * 3 | 0) % 2; g.strokeStyle = k ? 'rgba(255,40,40,.45)' : 'rgba(40,90,255,.45)'; g.lineWidth = 10; g.strokeRect(5, 5, VW - 10, VH - 10); }
  // seta do objetivo
  let alvo = MISSAO.alvo;
  if (!MISSAO.ativa) alvo = lugarMissao(proximaMissao());
  if (alvo && !j.morto) desenharSeta(g, alvo, '#ffd23f');
  // seta vermelha pro Gelado
  const gel = W.carros.find(c => c.modelo === 'gelado' && c.hp > 0 && c.ia && c.ia.tipo === 'policia');
  if (gel && !j.morto) desenharSeta(g, gel, '#ff3b3b', 'gelado');

  // ===== canto esquerdo: arma, vida, colete =====
  const x0 = 12, y0 = 10, bw = peq ? 118 : 150, bh = peq ? 50 : 60;
  g.fillStyle = 'rgba(10,8,20,.78)'; rr(g, x0, y0, bw, bh, 10); g.fill(); g.strokeStyle = '#ffd23f'; g.lineWidth = 2; g.stroke();
  iconeArma(g, j.arma, x0 + (peq ? 30 : 36), y0 + bh / 2, peq ? 1.3 : 1.6, '#fff');
  g.textAlign = 'right'; g.font = `900 ${peq ? 20 : 26}px ${FONTE}`;
  textoContorno(g, (j.arma === 'punho' || ARMAS[j.arma].corpo) ? '∞' : String(j.municao[j.arma]), x0 + bw - 10, y0 + bh / 2 + (peq ? 8 : 10), j.arma !== 'punho' && !ARMAS[j.arma].corpo && j.municao[j.arma] < 5 ? '#ff6b6b' : '#ffd23f', 4);
  g.textAlign = 'left'; g.font = `bold ${peq ? 9 : 10}px system-ui`; g.fillStyle = '#bbb'; g.fillText(ARMAS[j.arma].nome.toUpperCase(), x0 + 8, y0 + bh - 6);
  let yv = y0 + bh + (peq ? 12 : 15);
  const rc = peq ? 8 : 10;
  for (let k = 0; k < 5; k++) coracao(g, x0 + rc + 2 + k * (rc * 2.4), yv, rc, clamp((j.hp - k * 20) / 20, 0, 1));
  yv += rc + 6;
  if (j.colete > 0) { barra(g, x0 + 2, yv, rc * 11.6, 6, j.colete / 100, '#5dade2'); yv += 12; }
  if (j.carro) { const c = j.carro; barra(g, x0 + 2, yv, rc * 11.6, 5, c.hp / c.hpMax, c.hp < c.hpMax * 0.3 ? '#e74c3c' : '#f39c12'); g.font = 'bold 10px system-ui'; g.textAlign = 'left'; textoContorno(g, Math.round(Math.abs(c.vel) / 5) + ' km/h', x0 + rc * 11.6 + 8, yv + 6, '#fff', 3); yv += 12; }
  HUD_Y = yv;

  // ===== meio: estrelas (cabeças de polícia) =====
  const rp = peq ? 11 : 14, wp = rp * 2.5;
  for (let k = 0; k < 5; k++) {
    const ativo = k < W.procurado, pisca = ativo && W.semVer > 4 && (W.tempo * 4 | 0) % 2;
    cabecaPolicia(g, VW / 2 - wp * 2 + k * wp, 22, rp, ativo && !pisca, k >= 2 && !!gel);
  }
  // ===== canto direito: grana =====
  g.textAlign = 'right'; g.font = `900 ${peq ? 22 : 30}px ${FONTE}`;
  const gv = j.grana; HUD_GRANA = lerp(HUD_GRANA, gv, Math.min(1, dt * 6)); if (Math.abs(HUD_GRANA - gv) < 1) HUD_GRANA = gv;
  textoContorno(g, fmt$(HUD_GRANA), VW - 14, peq ? 30 : 38, '#ffe14d', 6);
  g.font = `900 ${peq ? 12 : 14}px ${FONTE}`; HUD_PTS_T = Math.max(0, HUD_PTS_T - dt); textoContorno(g, '★ ' + Math.floor(W.pontos).toLocaleString('pt-BR') + ' pts', VW - 14, (peq ? 30 : 38) + (peq ? 16 : 20), HUD_PTS_T > 0 ? '#ffffff' : '#7fd7ff', 4);

  // objetivo, tempo, barra
  g.textAlign = 'center';
  let yc = peq ? 46 : 54;
  const nGang = W.raivaMoto ? W.carros.filter(c => c.gangue && c.hp > 0 && c.motorista).length : 0;
  if (W.raivaMoto && !j.morto) {
    const w = peq ? 250 : 320;
    g.fillStyle = (W.tempo * 4 | 0) % 2 ? 'rgba(120,60,0,.88)' : 'rgba(30,30,30,.88)'; rr(g, VW / 2 - w / 2, yc, w, 30, 8); g.fill();
    g.font = `900 ${peq ? 11 : 13}px ${FONTE}`; g.fillStyle = '#ffd23f'; g.fillText(`🏍️ GANGUE DOS MOTOQUEIRO NA COLA · ${nGang}`, VW / 2, yc + 20);
    yc += 38;
  }
  if (gel && !j.morto) {
    const d = Math.round(dist(gel.x, gel.y, j.x, j.y) / 16), w = peq ? 250 : 320;
    g.fillStyle = (W.tempo * 4 | 0) % 2 ? 'rgba(160,0,0,.85)' : 'rgba(20,40,160,.85)'; rr(g, VW / 2 - w / 2, yc, w, 30, 8); g.fill();
    rostoHUD(g, 'gelado', VW / 2 - w / 2 + 16, yc + 15, 13);
    g.font = `900 ${peq ? 11 : 13}px ${FONTE}`; g.fillStyle = '#fff'; g.fillText(`🚨 SEGURANÇA GELADO NA COLA · ${d}m`, VW / 2 + 10, yc + 20);
    yc += 38;
  }
  if (MISSAO.objetivo && MISSAO.ativa && !MISSAO.dialogo) {
    g.font = `bold ${peq ? 13 : 16}px system-ui`;
    const ls = quebraTexto(g, MISSAO.objetivo, Math.min(520, VW - 2 * (bw + 30)));
    for (const l of ls) { textoContorno(g, l, VW / 2, yc + 16, '#ffd23f', 4); yc += 21; }
  }
  if (MISSAO.limite && MISSAO.ativa) {
    const t = Math.max(0, MISSAO.limite.t), s = Math.ceil(t);
    g.font = `900 ${peq ? 22 : 28}px ${FONTE}`; textoContorno(g, `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`, VW / 2, yc + 30, t < 15 ? '#ff4d4d' : '#fff', 5); yc += 36;
  }
  if (MISSAO.barra && MISSAO.ativa) {
    const w = Math.min(300, VW - 60); g.font = 'bold 11px system-ui'; textoContorno(g, MISSAO.barra.txt.toUpperCase(), VW / 2, yc + 16, '#fff', 3);
    barra(g, VW / 2 - w / 2, yc + 21, w, 9, clamp(MISSAO.barra.v, 0, 1), '#ff6b6b');
  }
  desenharMini(g);
  // nome da região / carro / rádio (grandão no meio, estilo GTA 2)
  const reg = regiaoEm(j.x, j.y);
  if (reg !== REGIAO_ATUAL) { if (REGIAO_ATUAL !== -1) REGIAO_AVISO = { txt: NOME_REG[reg], t: 0 }; REGIAO_ATUAL = reg; }
  const meio = (o, txt, sub, yy, cor, tam) => {
    if (!o) return; o.t += dt; const k = o.t < 0.3 ? o.t / 0.3 : o.t > 2.6 ? Math.max(0, (3 - o.t) / 0.4) : 1;
    g.globalAlpha = k; g.textAlign = 'center'; g.font = `900 ${tam}px ${FONTE}`; textoContorno(g, txt, VW / 2, yy, cor, 6);
    if (sub) { g.font = 'italic bold 13px system-ui'; textoContorno(g, sub, VW / 2, yy + 18, '#ddd', 3); }
    g.globalAlpha = 1;
  };
  const base = VH - (toque ? 190 : 70);
  meio(REGIAO_AVISO, REGIAO_AVISO && REGIAO_AVISO.txt.toUpperCase(), null, base - 60, '#fff', peq ? 22 : 32);
  if (REGIAO_AVISO && REGIAO_AVISO.t > 3) REGIAO_AVISO = null;
  meio(CARRO_AVISO, CARRO_AVISO && CARRO_AVISO.txt, null, base - 26, '#ffd23f', peq ? 15 : 19);
  if (CARRO_AVISO && CARRO_AVISO.t > 3) CARRO_AVISO = null;
  meio(RADIO_AVISO, RADIO_AVISO && '📻 ' + RADIOS[RADIO.atual].nome, RADIO_AVISO && radioSub(), base, '#c9b6ff', peq ? 14 : 17);
  if (RADIO_AVISO && RADIO_AVISO.t > 3) RADIO_AVISO = null;
  // falas (pager estilo GTA 1)
  let yf = Math.max(HUD_Y + 8, toque ? 210 : 0);
  if (!toque) yf = HUD_Y + 10;
  g.textAlign = 'left';
  for (const f of FALAS) {
    const k = Math.min(1, f.t / 0.2, (f.dur - f.t) / 0.3);
    g.globalAlpha = clamp(k, 0, 1);
    g.font = `bold ${peq ? 12 : 14}px system-ui`;
    const larg = Math.min(peq ? VW * 0.5 : 400, VW - 90), ls = quebraTexto(g, f.txt, larg - 24), h = 26 + ls.length * 17;
    g.fillStyle = 'rgba(14,30,18,.9)'; rr(g, 56, yf, larg, h, 8); g.fill();
    g.strokeStyle = COR_NOME[f.quem] || '#9f9'; g.lineWidth = 2; g.stroke();
    rostoHUD(g, f.quem, 32, yf + 20, 19);
    g.font = 'bold 10px system-ui'; g.fillStyle = COR_NOME[f.quem] || '#fff'; g.fillText((NOMES[f.quem] || f.quem).toUpperCase(), 66, yf + 14);
    g.font = `${peq ? 12 : 14}px system-ui`; g.fillStyle = '#d8ffd8'; ls.forEach((l, i) => g.fillText(l, 66, yf + 31 + i * 17));
    yf += h + 6; g.globalAlpha = 1;
  }
  // aviso grande no meio
  if (AVISO) {
    AVISO.t += dt; const k = AVISO.t < 0.25 ? AVISO.t / 0.25 : AVISO.t > AVISO.dur - 0.4 ? Math.max(0, (AVISO.dur - AVISO.t) / 0.4) : 1;
    g.globalAlpha = k; g.textAlign = 'center';
    const esc = 1 + Math.max(0, 0.25 - AVISO.t) * 2;
    g.save(); g.translate(VW / 2, VH * 0.36); g.scale(esc, esc);
    g.font = `900 ${peq ? 34 : 58}px ${FONTE}`; textoContorno(g, AVISO.titulo, 0, 0, AVISO.cor, 9);
    g.restore();
    if (AVISO.sub) { g.font = `bold ${peq ? 15 : 21}px system-ui`; textoContorno(g, AVISO.sub, VW / 2, VH * 0.36 + (peq ? 30 : 42), '#fff', 4); }
    g.globalAlpha = 1; if (AVISO.t > AVISO.dur) AVISO = null;
  }
  if (!j.carro && !j.morto && !MISSAO.dialogo) {
    const c = carroMaisPerto(j.x, j.y, 95);
    if (c) { g.textAlign = 'center'; g.font = 'bold 14px system-ui'; textoContorno(g, (toque ? 'toca 🚗' : 'E') + ' pra ' + (c.motorista ? 'ASSALTAR' : 'entrar') + ' · ' + TIPOS_CARRO[c.modelo].nome, VW / 2, VH - (toque ? 200 : 40), '#fff', 4); }
  }
  if (CORTINA) {
    CORTINA.t += dt; const k = CORTINA.t < 0.5 ? CORTINA.t / 0.5 : CORTINA.t > 3.6 ? Math.max(0, (4.1 - CORTINA.t) / 0.5) : 1;
    g.fillStyle = `rgba(20,0,10,${0.95 * k})`; g.fillRect(0, 0, VW, VH);
    g.globalAlpha = k; g.textAlign = 'center'; g.font = `900 ${peq ? 26 : 40}px ${FONTE}`; textoContorno(g, '💋 FATAL MODEL', VW / 2, VH * 0.4, '#ff3d8b', 6);
    g.font = `bold ${peq ? 14 : 18}px system-ui`; quebraTexto(g, CORTINA.txt, Math.min(620, VW - 40)).forEach((l, i) => textoContorno(g, l, VW / 2, VH * 0.4 + 44 + i * 26, '#fff', 4));
    g.globalAlpha = 1; if (CORTINA.t > 4.1) CORTINA = null;
  }
  // entrar nos lugares
  if (INTERACAO && !j.morto && !MISSAO.dialogo) {
    const tx = (toque ? 'toca 🚗' : 'E') + ' · entrar: ' + INTERACAO.ic + ' ' + INTERACAO.nome, w = Math.min(VW - 30, 60 + tx.length * 8);
    const y0b = VH - (toque ? 236 : 96);
    g.fillStyle = 'rgba(10,8,20,.85)'; rr(g, VW / 2 - w / 2, y0b, w, 34, 10); g.fill(); g.strokeStyle = '#ffd23f'; g.lineWidth = 2; g.stroke();
    g.font = 'bold 15px system-ui'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(tx, VW / 2, y0b + 22);
  }
  // fôlego nadando
  if (j.nadando) { const w = 160; g.font = 'bold 11px system-ui'; g.textAlign = 'center'; textoContorno(g, '🫧 FÔLEGO', VW / 2, VH - (toque ? 270 : 130), '#bfe9ff', 3); barra(g, VW / 2 - w / 2, VH - (toque ? 264 : 124), w, 9, (j.folego ?? 100) / 100, j.folego < 25 ? '#e74c3c' : '#5dade2'); }
  desenharTrofeuAviso(g, dt);
  if (INTERIOR) desenharInterior(g, dt);
  if (MISSAO.dialogo) desenharDialogo(g, dt);
  if (TELA_FIM) desenharFim(g, dt);
  if (MAPA_ABERTO) desenharMapaGrande(g);
  if (CREDITOS) desenharCreditos(g, dt);
}
let HUD_Y = 100, HUD_GRANA = 0;
function barra(g, x, y, w, h, v, cor) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x - 2, y - 2, w + 4, h + 4); g.fillStyle = '#333'; g.fillRect(x, y, w, h); g.fillStyle = cor; g.fillRect(x, y, w * clamp(v, 0, 1), h); }

function desenharSeta(g, alvo, cor, rosto) {
  const z = cam.zoom, sx = (alvo.x - cam.x) * z + VW / 2, sy = (alvo.y - cam.y) * z + VH / 2;
  const m = 70, dentro = sx > m && sx < VW - m && sy > m && sy < VH - m;
  const d = Math.round(dist(W.jog.x, W.jog.y, alvo.x, alvo.y) / 16);
  g.save();
  if (dentro) {
    if (rosto) { g.restore(); return; }
    const b = Math.sin(W.tempo * 6) * 6;
    g.translate(sx, sy - 70 + b); g.fillStyle = cor; g.strokeStyle = '#000'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-16, -18); g.lineTo(16, -18); g.lineTo(0, 8); g.closePath(); g.fill(); g.stroke();
  } else {
    const cx = VW / 2, cy = VH / 2, ang = Math.atan2(sy - cy, sx - cx);
    const r = Math.min((VW / 2 - m) / Math.abs(Math.cos(ang) || 0.001), (VH / 2 - m) / Math.abs(Math.sin(ang) || 0.001));
    g.translate(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    if (rosto) rostoHUD(g, rosto, -Math.cos(ang) * 30, -Math.sin(ang) * 30, 15);
    g.font = 'bold 12px system-ui'; g.textAlign = 'center'; textoContorno(g, d + 'm', 0, 34, cor, 3);
    g.rotate(ang); g.fillStyle = cor; g.strokeStyle = '#000'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(22, 0); g.lineTo(-12, -16); g.lineTo(-4, 0); g.lineTo(-12, 16); g.closePath(); g.fill(); g.stroke();
  }
  g.restore();
}

function desenharMini(g) {
  const j = W.jog, s = ehToque() ? 120 : 190, x0 = ehToque() ? VW - 120 - 14 : 14, y0 = ehToque() ? 50 : VH - s - 14, zoom = 1.25; // tiles por pixel inverso
  g.save();
  g.beginPath(); g.arc(x0 + s / 2, y0 + s / 2, s / 2, 0, 7); g.fillStyle = '#123'; g.fill(); g.clip();
  const tx = j.x / T, ty = j.y / T;
  g.imageSmoothingEnabled = false;
  g.drawImage(MINI, tx - s / 2 / zoom, ty - s / 2 / zoom, s / zoom, s / zoom, x0, y0, s, s);
  const blip = (wx, wy, cor, r = 4, ic) => {
    let bx = (wx / T - tx) * zoom + x0 + s / 2, by = (wy / T - ty) * zoom + y0 + s / 2;
    const dx = bx - (x0 + s / 2), dy = by - (y0 + s / 2), dd = Math.hypot(dx, dy), max = s / 2 - 7;
    if (dd > max) { bx = x0 + s / 2 + dx / dd * max; by = y0 + s / 2 + dy / dd * max; }
    if (ic) { g.font = (s > 150 ? 13 : 11) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ic, bx, by); g.textBaseline = 'alphabetic'; return; }
    g.fillStyle = cor; g.beginPath(); g.arc(bx, by, r, 0, 7); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1.5; g.stroke();
  };
  for (const c of W.carros) if (c.policia && c.ia && c.ia.tipo === 'policia') blip(c.x, c.y, c.modelo === 'gelado' ? '#ffd23f' : (W.tempo * 4 | 0) % 2 ? '#ff3b3b' : '#3b6bff', c.modelo === 'gelado' ? 6 : 3);
  for (const p of W.peds) if ((p.hostil || p.policia) && !p.morto) blip(p.x, p.y, '#ff3b3b', 2.5);
  for (const c of W.carros) if (c.gangue && c.hp > 0) blip(c.x, c.y, '#ff8c00', 3.5);
  for (const l of LUGARES) { const p = LUGAR[l.k]; if (p) blip(p.x, p.y, 0, 0, l.ic); }
  for (const [k, ic] of [['cas', '🪑'], ['skate', '🛹'], ['yori', '🥭'], ['nauj', '🌿'], ['baile', '🔊'], ['gelado', '🕶️'], ['poli', '🎙️'], ['matheus', '🤖'], ['ltzin', '👑'], ['mirante', '⛰️']]) if (LUGAR[k]) blip(LUGAR[k].x, LUGAR[k].y, 0, 0, ic);
  for (const m of extrasDisponiveis()) { const p = lugarMissao(m); blip(p.x, p.y, '#00e5ff', 5); }
  for (const c of W.carros) if (TIPOS_CARRO[c.modelo].barco && !c.motorista) blip(c.x, c.y, 0, 0, '🚤');
  const alvo = MISSAO.ativa ? MISSAO.alvo : lugarMissao(proximaMissao());
  if (alvo) blip(alvo.x, alvo.y, '#ffd23f', 6);
  g.restore();
  g.strokeStyle = '#000'; g.lineWidth = 4; g.beginPath(); g.arc(x0 + s / 2, y0 + s / 2, s / 2, 0, 7); g.stroke();
  g.strokeStyle = '#ff6ec7'; g.lineWidth = 2; g.stroke();
  // seta do jogador
  g.save(); g.translate(x0 + s / 2, y0 + s / 2); g.rotate(j.carro ? j.carro.a : j.a);
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(8, 0); g.lineTo(-6, -6); g.lineTo(-3, 0); g.lineTo(-6, 6); g.closePath(); g.fill(); g.restore();
  g.font = 'bold 11px system-ui'; g.textAlign = 'center'; textoContorno(g, 'N', x0 + s / 2, y0 + 12, '#fff', 3);
}

function desenharMapaGrande(g) {
  g.fillStyle = 'rgba(5,5,12,.92)'; g.fillRect(0, 0, VW, VH);
  const k = Math.min((VW - 40) / MW, (VH - 70) / MH), s = MW * k, hh = MH * k, x0 = (VW - s) / 2, y0 = 44;
  g.imageSmoothingEnabled = false; g.drawImage(MINI, x0, y0, s, hh); g.imageSmoothingEnabled = true;
  g.strokeStyle = '#ff6ec7'; g.lineWidth = 3; g.strokeRect(x0, y0, s, hh);
  g.textAlign = 'center'; g.font = '900 22px "Arial Black", system-ui'; textoContorno(g, 'MAPA — GTA 7', VW / 2, 30, '#ffd23f', 4);
  // nomes das regiões
  g.font = `900 ${Math.max(10, s / 40)}px system-ui`; g.globalAlpha = 0.85;
  const reg = [['JUAZEIRO', 96, 24], ['RIO DE JANEIRO', 36, 160], ['BH', 155, 96], ['RECIFE', 150, 160], ['SUBÚRBIO', 36, 58], ['SÃO SIMAS', 90, 90], ['INDONÉSIA', 222, 70], ['SERRA DO SIMAS', 96, 228]];
  for (const [n, tx, ty] of reg) textoContorno(g, n, x0 + tx * k, y0 + ty * k, '#fff', 4);
  g.globalAlpha = 1;
  const ic = (l, ico, nome) => { if (!l) return; const x = x0 + l.x / T * k, y = y0 + l.y / T * k; g.font = `${Math.max(12, s / 34)}px system-ui`; g.fillText(ico, x, y + 6); if (nome && s > 400) { g.font = `bold ${Math.max(9, s / 60)}px system-ui`; textoContorno(g, nome, x, y + 22, '#fff', 3); } };
  ic(LUGAR.garagem, '🔧', 'garagem'); ic(LUGAR.garagemBH, '🔧', 'garagem'); ic(LUGAR.roupas, '👕', 'roupas'); ic(LUGAR.armas, '🔫', 'arsenal'); ic(LUGAR.hospital, '🏥'); ic(LUGAR.policia, '🚔');
  ic(LUGAR.dudu, '💻', 'Dudu'); ic(LUGAR.cas, '🪑', 'Tio Cas'); ic(LUGAR.skate, '🛹', 'Alan'); ic(LUGAR.yori, '🥭', 'Yori'); ic(LUGAR.nauj, '🌿', 'Nauj'); ic(LUGAR.baile, '🔊', 'Meco');
  ic(LUGAR.gelado, '🕶️', 'Gelado'); ic(LUGAR.poli, '🎙️', 'Poli'); ic(LUGAR.fatal, '💋', 'Fatal Model'); ic(LUGAR.matheus, '🤖', 'Matheus'); ic(LUGAR.ltzin, '👑', 'Ltzin');
  ic(LUGAR.cafe, '☕', 'Café do Porto'); ic(LUGAR.masadakun, '🛕', 'Masadakun'); ic(LUGAR.motors, '🏍️', 'Simas Motors'); ic(LUGAR.mirante, '⛰️', 'Mirante');
  const alvo = MISSAO.ativa ? MISSAO.alvo : lugarMissao(proximaMissao());
  if (alvo) { const x = x0 + alvo.x / T * k, y = y0 + alvo.y / T * k; g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 10 + Math.sin(W.tempo * 6) * 3, 0, 7); g.stroke(); }
  const j = W.jog, jx = x0 + j.x / T * k, jy = y0 + j.y / T * k;
  g.fillStyle = (W.tempo * 3 | 0) % 2 ? '#fff' : '#ff6ec7'; g.beginPath(); g.arc(jx, jy, 6, 0, 7); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 2; g.stroke();
  g.font = 'bold 13px system-ui'; textoContorno(g, (ehToque() ? 'toca no 🗺️' : 'M') + ' pra fechar · tem segredo escondido no mapa todo 👀', VW / 2, VH - 8, '#ddd', 3);
}

let dialogoDigita = 0;
function desenharDialogo(g, dt) {
  const d = MISSAO.dialogo; d.t += dt;
  const peq = VW < 700, h = peq ? 150 : 140, y = VH - h - (ehToque() ? 12 : 18), x = peq ? 10 : Math.max(20, VW / 2 - 420), w = peq ? VW - 20 : Math.min(840, VW - 40);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, VW, VH);
  g.fillStyle = 'rgba(12,10,22,.95)'; rr(g, x, y, w, h, 16); g.fill();
  g.strokeStyle = COR_NOME[d.quem] || '#fff'; g.lineWidth = 3; g.stroke();
  const r = peq ? 34 : 46; rostoHUD(g, d.quem, x + r + 16, y + h / 2, r);
  g.textAlign = 'left'; g.font = `900 ${peq ? 14 : 17}px system-ui`; g.fillStyle = COR_NOME[d.quem] || '#fff';
  g.fillText((NOMES[d.quem] || d.quem).toUpperCase(), x + r * 2 + 34, y + 28);
  g.font = `${peq ? 14 : 18}px system-ui`; g.fillStyle = '#fff';
  const n = Math.floor(d.t * 55), txt = d.txt.slice(0, n);
  quebraTexto(g, txt, w - r * 2 - 60).forEach((l, i) => g.fillText(l, x + r * 2 + 34, y + 54 + i * (peq ? 19 : 24)));
  if (n >= d.txt.length) { g.textAlign = 'right'; g.font = 'bold 12px system-ui'; g.fillStyle = `rgba(255,210,63,${0.5 + 0.5 * Math.sin(W.tempo * 6)})`; g.fillText(ehToque() ? 'toca pra continuar ▶' : 'E / ENTER / clique ▶', x + w - 16, y + h - 12); }
}
function avancarDialogo() {
  const d = MISSAO.dialogo; if (!d || d.t < 0.15) return;
  if (Math.floor(d.t * 55) < d.txt.length) { d.t = d.txt.length / 55 + 0.01; return; }
  MISSAO.dialogo = null; d.res();
}

function desenharFim(g, dt) {
  TELA_FIM.t += dt; const k = Math.min(1, TELA_FIM.t / 1.2);
  g.fillStyle = TELA_FIM.tipo === 'preso' ? `rgba(10,20,60,${0.6 * k})` : `rgba(80,0,0,${0.6 * k})`; g.fillRect(0, 0, VW, VH);
  g.textAlign = 'center'; g.globalAlpha = k;
  g.font = `900 ${VW < 700 ? 46 : 84}px Impact, "Arial Black", system-ui`;
  textoContorno(g, TELA_FIM.tipo === 'preso' ? 'EM CANA' : 'SE FUDEU', VW / 2, VH / 2, TELA_FIM.tipo === 'preso' ? '#74b9ff' : '#ff3b3b', 10);
  g.font = 'bold 18px system-ui';
  textoContorno(g, TELA_FIM.tipo === 'preso' ? '"o Gelado mandou um abraço"' : '"paga nada, primo"', VW / 2, VH / 2 + 40, '#fff', 4);
  if (TELA_FIM.t > 2) { g.font = 'bold 15px system-ui'; textoContorno(g, ehToque() ? 'toca pra continuar' : 'aperta E / ENTER pra continuar', VW / 2, VH / 2 + 80, '#ffd23f', 4); }
  g.globalAlpha = 1;
}

const LINHAS_CREDITOS = [
  ['GTA 7', 'tit'], ['GRAND THEFT AUTO 7', ''], ['', ''], ['ELENCO', 'sub'],
  ['Nerivan — rei da engenharia social', 'nerivan'], ['Luketa — guia, narrador e beatmaker', 'luketa'], ['Dudu — hacker de sistemas', 'dudu'],
  ['Tio Cas — DJ, sentado desde terça', 'cas'], ['Ana — a patroa', 'ana'], ['Alan — skatista e desenhista desvalorizado', 'alan'],
  ['Yori — alimenta o Brasil', 'yori'], ['Nauj — teu guia favorito', 'nauj'], ['Meco — o Neymar do funk BH', 'meco'],
['Segurança Gelado — R$500 por dia', 'gelado'], ['Matheus — CEO, humorista e piloto de robô', 'matt'],
  ['Ltzin — Rei de Recife', 'ltzin'], ['Poli — ouvido absoluto, Rádio Poli FM', 'poli'], ['', ''], ['robô gigante feito pelo Claude', 'sub'], ['(ele avisou que era má ideia)', ''], ['', ''], ['SIMAS 🌈', 'tit'], ['obrigado por jogar!', '']
];
function desenharCreditos(g, dt) {
  CREDITOS.t += dt;
  g.fillStyle = 'rgba(5,4,10,.94)'; g.fillRect(0, 0, VW, VH);
  g.textAlign = 'center'; let y = VH + 40 - CREDITOS.t * 50;
  for (const [txt, tipo] of LINHAS_CREDITOS) {
    if (tipo === 'tit') { g.font = '900 38px "Arial Black", system-ui'; textoContorno(g, txt, VW / 2, y, '#ff6ec7', 6); y += 60; }
    else if (tipo === 'sub') { g.font = '900 20px system-ui'; textoContorno(g, txt, VW / 2, y, '#ffd23f', 4); y += 40; }
    else if (tipo) { rostoHUD(g, tipo, VW / 2 - 210, y - 6, 18); g.font = 'bold 17px system-ui'; g.textAlign = 'left'; textoContorno(g, txt, VW / 2 - 180, y, '#fff', 3); g.textAlign = 'center'; y += 46; }
    else { g.font = '16px system-ui'; textoContorno(g, txt, VW / 2, y, '#ccc', 3); y += 30; }
  }
  if (y < -20 || (CREDITOS.t > 3 && (apertou('escape', 'enter') || CREDITOS.pular))) { CREDITOS = null; falar('luketa', 'a cidade é tua agora. bora zoar!', 3); }
}

// ---------- menus em HTML (garagem, lojas, pausa) ----------
function abrirMenu(titulo, itens, sub) {
  MENU = { titulo };
  const el = document.getElementById('menu');
  el.innerHTML = `<div class="caixa"><h2>${titulo}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}<div class="lista"></div><button class="fechar">fechar (ESC)</button></div>`;
  const lista = el.querySelector('.lista');
  for (const it of itens) {
    const b = document.createElement('button'); b.className = 'item' + (it.off ? ' off' : '');
    b.innerHTML = `<span>${it.txt}</span>${it.preco !== undefined ? `<b>${it.preco ? fmt$(it.preco) : 'grátis'}</b>` : ''}`;
    if (it.cor) b.style.borderLeft = `10px solid ${it.cor}`;
    b.onclick = () => {
      if (it.off) return;
      if (it.preco && W.jog.grana < it.preco) { b.classList.add('pobre'); b.querySelector('span').textContent = 'tá liso, Nerivan 💸'; SOM.falha(); return; }
      if (it.preco) W.jog.grana -= it.preco;
      SOM.grana(); const r = it.fn(); salvar();
      if (r !== false) (MENU && MENU.reabre) ? MENU.reabre() : fecharMenu();
    };
    lista.appendChild(b);
  }
  el.querySelector('.fechar').onclick = fecharMenu;
  el.classList.add('aberto');
  const prim = el.querySelector('.item:not(.off)') || el.querySelector('.fechar'); if (prim && !ehToque()) prim.focus();
}
function fecharMenu() { const el = document.getElementById('menu'); el.classList.remove('aberto'); el.innerHTML = ''; MENU = null; if (INTERIOR) sairInterior(); }

const CORES_PINTURA = [['Rosa Simas', '#ff6ec7'], ['Preto Fosco', '#151515'], ['Branco Gelo', '#f2f2f2'], ['Vermelho Ferrari', '#d50000'], ['Azul Calcinha', '#7fb3ff'], ['Verde Bandeira', '#1e8e3e'], ['Amarelo Taxi', '#ffd000'], ['Roxo Baile', '#7d3cff'], ['Laranja Galado', '#ff8c1a'], ['Dourado Rei', '#c9a227']];
function menuGaragem() {
  const j = W.jog, c = j.carro;
  if (c) {
    const t = TIPOS_CARRO[c.modelo] || TIPOS_CARRO.sedan;
    const itens = [];
    itens.push({ txt: '🎨 Pintar (zera a polícia)', preco: 300, fn: () => { menuPintura(); return false; } });
    itens.push({ txt: `🔧 Consertar (${Math.round(c.hp / c.hpMax * 100)}%)`, preco: c.hp < c.hpMax ? 200 : undefined, off: c.hp >= c.hpMax, fn: () => { c.hp = c.hpMax; } });
    itens.push({ txt: `🏎️ Motor turbinado (nível ${c.motor}/3)`, preco: c.motor < 3 ? 800 * (c.motor + 1) : undefined, off: c.motor >= 3, fn: () => { c.motor++; } });
    itens.push({ txt: `🛡️ Blindagem (nível ${c.blind}/3)`, preco: c.blind < 3 ? 1000 * (c.blind + 1) : undefined, off: c.blind >= 3, fn: () => { c.blind++; } });
    itens.push({ txt: `⚡ Listra de corrida`, preco: c.listra ? undefined : 250, off: !!c.listra, fn: () => { c.listra = '#ffffff'; } });
    const podeGuardar = W.garagem.length < 4 && !c.missao && !c.policia;
    itens.push({ txt: `🅿️ Guardar na garagem (${W.garagem.length}/4)`, off: !podeGuardar, fn: () => {
      W.garagem.push({ modelo: c.modelo, cor: c.cor, motor: c.motor, blind: c.blind, listra: c.listra || null });
      entrarSair(); c.lixo = true; W.carros = W.carros.filter(x => x !== c); falar('luketa', 'guardado! volta a pé aqui quando quiser ele de novo', 3);
    } });
    abrirMenu('🔧 GARAGEM DO NERIVAN', itens, `${t.nome} · ${fmt$(j.grana)} no bolso`);
  } else {
    const itens = W.garagem.map((g, i) => ({ txt: `🚗 ${TIPOS_CARRO[g.modelo] ? TIPOS_CARRO[g.modelo].nome : g.modelo} (motor ${g.motor}, blindagem ${g.blind})`, cor: g.cor, fn: () => {
      W.garagem.splice(i, 1);
      const l = MENU_GAR_LUGAR, c = novoCarro(g.modelo, l.x, l.y - 10, 0, { cor: g.cor, motor: g.motor, blind: g.blind, listra: g.listra, doJogador: true });
      W.carros.push(c); j.x = c.x; j.y = c.y; c.motorista = j; j.carro = c; RADIO.tocar(true); CARRO_AVISO = { txt: TIPOS_CARRO[g.modelo].nome, t: 0 };
    } }));
    if (!itens.length) itens.push({ txt: 'garagem vazia. traz um carro aqui pra guardar ou turbinar', off: true, fn: () => { } });
    abrirMenu('🔧 GARAGEM DO NERIVAN', itens, 'teus carros guardados');
  }
}
let MENU_GAR_LUGAR = null;
function menuPintura() {
  const c = W.jog.carro;
  abrirMenu('🎨 ESCOLHE A COR', CORES_PINTURA.map(([n, cor]) => ({ txt: n, cor, fn: () => {
    c.cor = cor; if (W.procurado > 0) { W.procurado = 0; W.calor = 0; W.carros = W.carros.filter(x => !(x.ia && x.ia.tipo === 'policia' && dist(x.x, x.y, c.x, c.y) > 300)); falar('luketa', 'carro novo, placa nova. os home perderam teu rastro', 3); }
  } })), 'já pago, só escolher');
}
const TENIS = {
  chinelo: { nome: 'Chinelo Havaiano', vel: 1, cor: '#2471a3', preco: 0 },
  kenner: { nome: 'Kenner de Cria', vel: 1.08, cor: '#111', preco: 250 },
  mola: { nome: 'Tênis de Mola', vel: 1.18, cor: '#ecf0f1', preco: 900 },
  neymar: { nome: 'Chuteira do Meco (pré-lesão)', vel: 1.3, cor: '#f1c40f', preco: 2500 },
  dourado: { nome: 'Tênis Dourado do Rei', vel: 1.38, cor: '#c9a227', preco: 6000 }
};
function menuRoupas() {
  const j = W.jog;
  const sub = (titulo, itens) => () => { abrirMenu(titulo, [...itens(), { txt: '⬅️ voltar', fn: () => { menuRoupas(); return false; } }], `${fmt$(j.grana)} no bolso`); return false; };
  const cores = [['Rosa Simas', '#ff6ec7'], ['Vermelha', '#c0392b'], ['Preta Básica', '#151515'], ['Branca de Rico', '#f5f5f5'], ['Verde Galado', '#27ae60'], ['Amarela Seleção', '#f1c40f'], ['Azul Royal', '#2471a3'], ['Roxa Baile', '#7d3cff'], ['Laranja', '#e67e22'], ['Vinho', '#7b241c']];
  abrirMenu('👕 SIMAS STORE', [
    { txt: '👕 Camisas (10 cores)', fn: sub('👕 CAMISAS', () => cores.map(([n, c]) => ({ txt: 'Camisa ' + n, cor: c, preco: 100, fn: () => { j.camisa = c; j.estampa = null; } }))) },
    { txt: '🎨 Estampas', fn: sub('🎨 ESTAMPAS', () => [['Listrada', 'listrada', 180], ['Arco-íris do Simas', 'simas', 400], ['Xadrez de Festa Junina', 'xadrez', 200], ['Camuflada', 'camuflada', 300], ['Rubro-negra (genérica)', 'flamengo', 250]].map(([n, e, p]) => ({ txt: n, preco: p, fn: () => { j.estampa = e; } })).concat([{ txt: 'tirar estampa', fn: () => { j.estampa = null; } }])) },
    { txt: '🧥 Jaquetas', fn: sub('🧥 JAQUETAS', () => [['Jaqueta Jeans', '#5d6d7e', 350], ['Jaqueta de Couro', '#1b1b1b', 700], ['Corta-vento Neon', '#a3e635', 400], ['Moletom Rosa', '#ff6ec7', 300]].map(([n, c, p]) => ({ txt: n, cor: c, preco: p, fn: () => { j.jaqueta = c; } })).concat([{ txt: 'tirar jaqueta', fn: () => { j.jaqueta = null; } }])) },
    { txt: '👖 Calças e bermudas', fn: sub('👖 CALÇAS', () => [['Bermuda Jeans', '#2c3e50'], ['Calça Preta', '#111'], ['Bermuda Florida', '#e67e22'], ['Calça Branca de Pagodeiro', '#f5f5f5'], ['Tactel Azul', '#2980b9'], ['Moletom Cinza', '#7f8c8d']].map(([n, c]) => ({ txt: n, cor: c, preco: 100, fn: () => { j.calca = c; } }))) },
    { txt: '🧢 Bonés e chapéus', fn: sub('🧢 CABEÇA', () => [['Boné Rosa', '#ff6ec7', 'bone', 150], ['Boné Preto', '#111', 'bone', 150], ['Boné Vermelho', '#c0392b', 'bone', 150], ['Chapéu de Cowboy (Juazeiro)', '#8e5a2b', 'cowboy', 400], ['Bucket Hat', '#f5f5f5', 'bucket', 250], ['Bucket Hat Preto', '#111', 'bucket', 250]].map(([n, c, t, p]) => ({ txt: n, cor: c, preco: p, fn: () => { j.chapeu = c; j.chapeuTipo = t; } })).concat([{ txt: 'tirar o que tá na cabeça', off: !j.chapeu, fn: () => { j.chapeu = null; } }])) },
    { txt: '💎 Acessórios', fn: sub('💎 ACESSÓRIOS', () => [
      { txt: j.oculos ? '🕶️ Tirar a Juliet' : '🕶️ Óculos Juliet', preco: j.oculos ? undefined : 200, fn: () => { j.oculos = !j.oculos; } },
      { txt: j.corrente ? '⛓️ Tirar a corrente' : '⛓️ Corrente de ouro (ostentação)', preco: j.corrente ? undefined : 2000, fn: () => { j.corrente = !j.corrente; } },
      { txt: j.mochila ? '🎒 Tirar a mochila' : '🎒 Mochila de entregador', preco: j.mochila ? undefined : 150, fn: () => { j.mochila = j.mochila ? null : '#c0392b'; } }]) },
    { txt: '👟 Tênis (corre mais)', fn: sub('👟 TÊNIS', () => Object.entries(TENIS).map(([k, t]) => ({ txt: `${t.nome} (+${Math.round((t.vel - 1) * 100)}% correndo)${j.tenis === k ? ' ✔' : ''}`, cor: t.cor, preco: (j.temTenis || {})[k] || !t.preco ? undefined : t.preco, fn: () => { j.temTenis = j.temTenis || {}; j.temTenis[k] = true; j.tenis = k; j.tenisCor = t.cor; } }))) },
    { txt: '🛹 Skate e patins (aperta K pra usar)', fn: sub('🛹 RODAS', () => [
      { txt: '🛹 Skate Simas SK8' + ((j.temRodas || {}).skate ? ' ✔ (tem)' : ''), preco: (j.temRodas || {}).skate ? undefined : 600, off: !!(j.temRodas || {}).skate, fn: () => { j.temRodas = j.temRodas || {}; j.temRodas.skate = true; j.rodaAtiva = 'skate'; } },
      { txt: '⛸️ Patins Neon' + ((j.temRodas || {}).patins ? ' ✔ (tem)' : ''), preco: (j.temRodas || {}).patins ? undefined : 900, off: !!(j.temRodas || {}).patins, fn: () => { j.temRodas = j.temRodas || {}; j.temRodas.patins = true; j.rodaAtiva = 'patins'; } }]) }
  ], 'estilo é tudo, Nerivan · ' + fmt$(j.grana) + ' no bolso');
}
function trocarRodas() {
  const j = W.jog; if (j.carro || j.skate) return;
  const tem = ['', ...Object.keys(j.temRodas || {})];
  if (tem.length < 2) { falar('luketa', 'tu não tem skate nem patins. compra na Simas Store', 2.5); return; }
  const i = tem.indexOf(j.rodaAtiva || ''); j.rodaAtiva = tem[(i + 1) % tem.length] || null;
  SOM.pega(); CARRO_AVISO = { txt: j.rodaAtiva === 'skate' ? '🛹 de skate' : j.rodaAtiva === 'patins' ? '⛸️ de patins' : '🚶 a pé', t: 0 };
}
const VEICULOS_VENDA = [['biz', 1500], ['cg', 2500], ['trilha', 3500], ['xj6', 9000], ['fusca', 2000], ['gol', 3000], ['taxi', 4000], ['sw4', 12000], ['esporte', 8000], ['lambo', 35000], ['onibus', 7000]];
const IMOVEIS = [
  { id: 'kitnet', nome: 'Kitnet no Subúrbio', preco: 6000, renda: 80 },
  { id: 'apeRio', nome: 'Apê na praia do Rio', preco: 15000, renda: 220 },
  { id: 'barraco', nome: 'Barraco com laje em BH', preco: 9000, renda: 140 },
  { id: 'sitio', nome: 'Sítio vizinho do Yori (Juazeiro)', preco: 12000, renda: 190 },
  { id: 'mansao', nome: 'Mansão no porto de Recife', preco: 40000, renda: 650 },
  { id: 'vila', nome: 'Vila na Indonésia', preco: 25000, renda: 400 }
];
function menuMotors() {
  const j = W.jog;
  abrirMenu('🏍️ SIMAS MOTORS & IMÓVEIS', [
    { txt: '🚗 Comprar veículo', fn: () => { abrirMenu('🚗 VEÍCULOS', VEICULOS_VENDA.map(([m, p]) => ({ txt: TIPOS_CARRO[m].nome + (TIPOS_CARRO[m].moto ? ' 🏍️' : ''), preco: p, fn: () => {
      const L = LUGAR.motors, c = novoCarro(m, L.x, L.y + 10, 0, { doJogador: true }); W.carros.push(c);
      if (j.carro) entrarSair(); j.x = c.x; j.y = c.y; c.motorista = j; j.carro = c; RADIO.tocar(true); CARRO_AVISO = { txt: TIPOS_CARRO[m].nome, t: 0 };
      falar('luketa', 'comprado! e é teu de verdade, sem nota fiscal falsa. guarda na garagem pra não perder', 3.5);
    } })), 'zero bala, com 0 km (de rolê)'); return false; } },
    { txt: '🏠 Comprar imóvel (dá aluguel todo dia)', fn: () => { abrirMenu('🏠 IMÓVEIS', IMOVEIS.map(im => ({ txt: `${im.nome} · rende ${fmt$(im.renda)}/dia${(W.imoveis || []).includes(im.id) ? ' ✔ teu' : ''}`, preco: (W.imoveis || []).includes(im.id) ? undefined : im.preco, off: (W.imoveis || []).includes(im.id), fn: () => {
      W.imoveis = W.imoveis || []; W.imoveis.push(im.id); falar('luketa', `${im.nome} é teu! o aluguel cai de 2 em 2 minutos`, 3.5);
    } })), 'cada dia no jogo dura 2 minutos'); return false; } }
  ], `${fmt$(j.grana)} no bolso`);
}
function menuPadaria() {
  const j = W.jog;
  abrirMenu('🥐 PADARIA', [
    { txt: '🥟 Coxinha (+25 de vida)', preco: 15, fn: () => { j.hp = Math.min(100, j.hp + 25); } },
    { txt: '🧀 Pão de queijo mineiro (+40)', preco: 30, fn: () => { j.hp = Math.min(100, j.hp + 40); } },
    { txt: '🍱 Marmitão do Yori (vida cheia)', preco: 80, fn: () => { j.hp = 100; } },
    { txt: '🍧 Açaí de 1 litro (vida cheia + 30 de colete)', preco: 150, fn: () => { j.hp = 100; j.colete = Math.min(100, j.colete + 30); } },
    { txt: '☕ Pingado com pão na chapa (só pela vibe)', preco: 8, fn: () => { falar('luketa', 'que pão na chapa, hein', 2); } }
  ], 'tudo fresquinho (mais ou menos)');
}
let rendaTimer = 120;
function atualizaRenda(dt) {
  if (!W.imoveis || !W.imoveis.length) return;
  rendaTimer -= dt; if (rendaTimer > 0) return; rendaTimer = 120;
  const v = W.imoveis.reduce((a, id) => a + (IMOVEIS.find(i => i.id === id) || { renda: 0 }).renda, 0);
  W.jog.grana += v; SOM.grana(); falar('luketa', `caiu o aluguel dos teus imóveis: +${fmt$(v)}`, 3); salvar();
}
function menuArmas() {
  const j = W.jog;
  abrirMenu('🔫 ARSENAL', [
    { txt: '🔫 Pistola + 24 balas', preco: 150, fn: () => { j.tem.pistola = true; j.municao.pistola += 24; } },
    { txt: '🔫 Submetralhadora + 90 balas', preco: 400, fn: () => { j.tem.uzi = true; j.municao.uzi += 90; } },
    { txt: '💥 Escopeta + 16 cartuchos', preco: 500, fn: () => { j.tem.escopeta = true; j.municao.escopeta += 16; } },
    { txt: '🚀 Lança-foguete + 3 foguetes', preco: 1200, fn: () => { j.tem.foguete = true; j.municao.foguete += 3; } },
    { txt: '🏏 Taco de beisebol', preco: 120, off: !!j.tem.taco, fn: () => { j.tem.taco = true; } },
    { txt: '🔫 Fuzil + 60 balas', preco: 900, fn: () => { j.tem.fuzil = true; j.municao.fuzil += 60; } },
    { txt: '💣 Granada x5', preco: 600, fn: () => { j.tem.granada = true; j.municao.granada += 5; } },
    { txt: '🍾 Coquetel molotov x5', preco: 450, fn: () => { j.tem.molotov = true; j.municao.molotov += 5; } },
    { txt: '🔥 Lança-chamas + 200 de gás', preco: 1500, fn: () => { j.tem.lancachamas = true; j.municao.lancachamas += 200; } },
    { txt: '🛡️ Colete', preco: 300, off: j.colete >= 100, fn: () => { j.colete = 100; } },
    { txt: '❤️ Kit médico', preco: 100, off: j.hp >= 100, fn: () => { j.hp = 100; } }
  ], `${fmt$(j.grana)} no bolso`);
}
function menuPausa() {
  abrirMenu('⏸️ PAUSA', [
    { txt: '▶️ Continuar', fn: () => { } },
    { txt: '🗺️ Ver o mapa', fn: () => { MAPA_ABERTO = true; } },
    { txt: `🏆 Troféus: ${(W.trofeus || []).length}/${TROFEUS.length}`, fn: () => { menuTrofeus(); return false; } },
    { txt: `📊 Ranking (teus pontos: ${W.pontos.toLocaleString('pt-BR')})`, fn: () => { menuRanking(); return false; } },
    { txt: `🔍 Segredos achados: ${(W.segredos || []).length}/${SEGREDOS.length}`, fn: () => { abrirMenu('🔍 SEGREDOS', SEGREDOS.map(sg => ({ txt: (W.segredos || []).includes(sg[0]) ? '✅ ' + sg[1] : '❓ ' + sg[2], off: true, fn: () => { } })).concat([{ txt: '⬅️ voltar', fn: () => { menuPausa(); return false; } }]), 'acha todos e ganha a PLATINA SIMAS'); return false; } },
    { txt: '💾 Salvar agora', fn: () => { salvar(); falar('luketa', 'jogo salvo!', 2); } },
    { txt: PAUSA_SOM ? '🔊 Ligar o som' : '🔇 Tirar o som', fn: () => { PAUSA_SOM = !PAUSA_SOM; if (SOM.master) SOM.master.gain.value = PAUSA_SOM ? 0 : 0.8; atualizaYT(); } },
    { txt: '🚪 Sair pros Jogos do Simas', fn: () => { salvar(); location.href = '/jogos/'; } },
    { txt: '🗑️ Começar do zero (apaga o save)', fn: () => { if (!MENU.confirma) { MENU.confirma = true; const it = document.querySelectorAll('#menu .item span'); it[it.length - 1].textContent = '⚠️ certeza? clica de novo pra apagar tudo'; return false; } try { localStorage.removeItem('gta7-save'); } catch (e) { } location.reload(); } }
  ], CONTROLES_TXT);
}
const CONTROLES_TXT = 'WASD/setas: andar e dirigir · E ou F: entrar/sair/assaltar · mouse ou CTRL/ESPAÇO: atirar · TAB/Q: trocar arma · ESPAÇO no carro: freio de mão · SHIFT: correr · K: skate/patins · R: rádio · H: buzina · M: mapa · ESC: pausa';

// ---------- controles de celular ----------
function montarToque() {
  const el = document.getElementById('toque'); el.classList.add('on');
  const jo = el.querySelector('.jo'), bola = el.querySelector('.bola');
  let id = null, cx = 0, cy = 0;
  jo.addEventListener('touchstart', e => { const t = e.changedTouches[0]; id = t.identifier; const r = jo.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; TOQUE.ativo = true; mexe(t); e.preventDefault(); }, { passive: false });
  const mexe = t => { let dx = t.clientX - cx, dy = t.clientY - cy; const d = Math.hypot(dx, dy), m = 55; if (d > m) { dx = dx / d * m; dy = dy / d * m; } TOQUE.jx = dx / m; TOQUE.jy = dy / m; bola.style.transform = `translate(${dx}px,${dy}px)`; };
  addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === id) mexe(t); }, { passive: true });
  const solta = e => { for (const t of e.changedTouches) if (t.identifier === id) { id = null; TOQUE.jx = TOQUE.jy = 0; bola.style.transform = ''; } };
  addEventListener('touchend', solta); addEventListener('touchcancel', solta);
  const bt = (sel, on, off) => { const b = el.querySelector(sel); b.addEventListener('touchstart', e => { e.preventDefault(); SOM.init(); on(); b.classList.add('ap'); }, { passive: false }); b.addEventListener('touchend', e => { e.preventDefault(); off && off(); b.classList.remove('ap'); }, { passive: false }); };
  bt('.b-tiro', () => { TOQUE.atira = true; }, () => { TOQUE.atira = false; });
  bt('.b-carro', () => { PRESS.e = true; });
  bt('.b-arma', () => { PRESS.tab = true; });
  bt('.b-freio', () => { TOQUE.freio = true; }, () => { TOQUE.freio = false; });
  bt('.b-radio', () => { PRESS.r = true; });
  bt('.b-rodas', () => { PRESS.k = true; });
  bt('.b-mapa', () => { PRESS.m = true; });
  bt('.b-pausa', () => { PRESS.escape = true; });
}

// navegação do menu pelo teclado (setas + ENTER)
addEventListener('keydown', e => {
  if (!MENU) return;
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key.toLowerCase() !== 's' && e.key.toLowerCase() !== 'w') return;
  const bs = [...document.querySelectorAll('#menu button')].filter(b => !b.classList.contains('off'));
  if (!bs.length) return;
  let i = bs.indexOf(document.activeElement);
  i = (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') ? (i + 1) % bs.length : (i - 1 + bs.length) % bs.length;
  bs[i].focus(); SOM.bip(700, 0.04, 0.06); e.preventDefault();
});

// ---------- Rádio Poli FM: playlist do YouTube (player oficial, aparece na tela) ----------
const PLAYLIST = 'PLBEAC-rzONdU7x12z0eO76SSCLHIx-lhL';
const YTR = { estado: 'carregando', player: null, tocando: false, titulo: '' };
let PAUSA_SOM = false;
function carregarYT() {
  if (location.protocol === 'file:') { YTR.estado = 'falhou'; return; }
  window.onYouTubeIframeAPIReady = () => {
    try {
      YTR.player = new YT.Player('yt', {
        width: 200, height: 200, videoId: 'eDB6f1eul00',
        playerVars: { list: PLAYLIST, listType: 'playlist', playsinline: 1, controls: 1, rel: 0 },
        events: {
          onReady: () => { YTR.estado = 'pronto'; try { YTR.player.setShuffle(true); YTR.player.setLoop(true); YTR.player.setVolume(75); } catch (e) { } },
          onStateChange: e => { if (e.data === 1) { try { const d = YTR.player.getVideoData(); YTR.titulo = (d && d.title) || ''; } catch (er) { } } if (e.data === 0) { try { YTR.player.nextVideo(); } catch (er) { } } },
          onError: () => { try { YTR.player.nextVideo(); } catch (e) { } }
        }
      });
    } catch (e) { YTR.estado = 'falhou'; }
  };
  const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => { YTR.estado = 'falhou'; }; document.head.appendChild(s);
  setTimeout(() => { if (YTR.estado === 'carregando') YTR.estado = 'falhou'; }, 10000);
}
const ytAtivo = () => YTR.estado === 'pronto';
function querTrilha() {
  if (!RODANDO) return true;              // tela de título: trilha sonora
  if (CREDITOS) return true;
  const j = W.jog;
  return !!(j && j.carro && RADIO.atual === 0 && !j.morto);
}
function atualizaYT() {
  if (YTR.estado !== 'pronto') return;
  const quer = querTrilha() && !PAUSA_SOM, el = document.getElementById('radio');
  if (el) el.classList.toggle('on', quer);
  try {
    if (quer !== YTR.tocando) { if (quer) YTR.player.playVideo(); else YTR.player.pauseVideo(); YTR.tocando = quer; }
  } catch (e) { }
}
function radioSub() {
  if (RADIO.atual === 0) return ytAtivo() ? ('🎤 ' + (YTR.titulo || 'Popai')) : YTR.estado === 'falhou' ? 'as do Popai tocam quando o jogo tá no site' : 'carregando a playlist...';
  return RADIOS[RADIO.atual].sub;
}
setInterval(atualizaYT, 400);
