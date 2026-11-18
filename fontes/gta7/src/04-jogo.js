// =========================================================
// LÓGICA: jogador, armas, pedestres, polícia, itens, câmera
// =========================================================
let DEUS = false;
const DIFIC = 0.45;   // dano que o jogador recebe (1 = normal). Tava difícil demais.
let GELADO_AVISO = null;
const cam = { x: 0, y: 0, zoom: 1, tremor: 0 };
function tremer(n) { cam.tremor = Math.min(22, Math.max(cam.tremor, n)); }

// ---------- falas (balão com rosto) ----------
const FALAS = [];
function falar(quem, txt, dur = 3.5) {
  FALAS.push({ quem, txt, dur, t: 0 });
  if (FALAS.length > 3) FALAS.shift();
}

// ---------- entrar/sair de carro ----------
function carroMaisPerto(x, y, r) {
  let melhor = null, md = r;
  for (const c of W.carros) { if (c.hp <= 0 || c.chefe || c.semEntrar) continue; const d = dist(c.x, c.y, x, y); if (d < md) { md = d; melhor = c; } }
  return melhor;
}
function entrarSair() {
  const j = W.jog;
  if (j.carro) {
    const c = j.carro;
    if (Math.abs(c.vel) > (TIPOS_CARRO[c.modelo].moto ? 220 : 140)) return;
    // sai pelo lado esquerdo
    const ang = c.a - Math.PI / 2;
    let sx = c.x + Math.cos(ang) * (c.w / 2 + 18), sy = c.y + Math.sin(ang) * (c.w / 2 + 18);
    if (solidoEm(sx, sy)) { sx = c.x - Math.cos(ang) * (c.w / 2 + 18); sy = c.y - Math.sin(ang) * (c.w / 2 + 18); }
    j.x = sx; j.y = sy; j.carro = null; c.motorista = null; c.ia = null; c.vx *= 0.3; c.vy *= 0.3; c.vel = 0;
    SOM.atualizaMotor(0, false); RADIO.tocar(false);
    return;
  }
  const c = carroMaisPerto(j.x, j.y, 95);
  if (!c) return;
  if (j.skate) { falar('alan', 'CARRO NÃO VALE, Nerivan! é racha de SKATE', 2); return; }
  if (c.motorista && !c.motorista.morto) {
    // assalto: puxa o motorista pra fora
    const m = c.motorista; m.x = c.x + Math.cos(c.a + Math.PI / 2) * 40; m.y = c.y + Math.sin(c.a + Math.PI / 2) * 40;
    m.medo = 8; m.dentroCarro = false; m.hp = Math.min(m.hp, 30);
    if (m.policia) { crime(4); m.bravo = true; } else { crime(rnd() < 0.5 ? 1 : 0); m.xinga = 2; }
    W.peds.push(m);
    if (rnd() < 0.5) falarPed(m, pick(['MEU CARRO!!', 'ô ladrão!!', 'socorro, roubaram meu possante', 'vai se fuder nerivan', 'tava quitado, desgraça']));
    if (c.policia) crime(3);
    W.stats.roubos++;
  }
  c.motorista = j; c.ia = null; j.carro = c; c.vel = Math.hypot(c.vx, c.vy) * 0.5;
  RADIO.tocar(true);
  if (!W.radioAviso) { W.radioAviso = true; falar('poli', 'aqui é a Rádio Poli FM, o rei do entretenimento! aperta R pra trocar de estação', 4); }
}
function falarPed(p, txt) { W.efeitos.push({ t: 'texto', x: p.x, y: p.y - 30, txt, vida: 2.2, max: 2.2, cor: '#fff' }); }

// ---------- armas ----------
function atirar(dx, dy) {
  const j = W.jog, a = ARMAS[j.arma];
  if (j.recarga > 0 || j.morto) return;
  if (j.arma !== 'punho' && !a.corpo && j.municao[j.arma] <= 0) { trocarArma(-1, true); return; }
  j.recarga = a.cad;
  const ang = Math.atan2(dy, dx); j.a = ang;
  SOM.tiro(j.arma);
  if (j.arma === 'punho' || a.corpo) {
    for (const p of W.peds) if (!p.morto && dist(p.x, p.y, j.x + Math.cos(ang) * 22, j.y + Math.sin(ang) * 22) < a.alcance) { feriPed(p, a.dano, j); p.x += Math.cos(ang) * 14; p.y += Math.sin(ang) * 14; }
    for (const ch of W.chefes) if (ch.levaSoco) ch.levaSoco(j.x + Math.cos(ang) * 22, j.y + Math.sin(ang) * 22, a.dano);
    return;
  }
  j.municao[j.arma]--;
  const ox = j.x + Math.cos(ang) * 20, oy = j.y + Math.sin(ang) * 20;
  if (a.joga) { W.jogados.push({ t: a.joga, x: ox, y: oy, vx: Math.cos(ang) * a.vel, vy: Math.sin(ang) * a.vel, vida: a.joga === 'granada' ? 1.6 : 0.75, dono: j, gira: 0 }); return; }
  if (a.chama) { for (let k = 0; k < 2; k++) { const aa = ang + rnd(-0.18, 0.18), v = rnd(300, 460); W.chamas.push({ x: ox, y: oy, vx: Math.cos(aa) * v, vy: Math.sin(aa) * v, vida: 0.42, dono: j }); } if (copsPerto(700)) crime(0.1); return; }
  if (a.explode) { W.foguetes.push({ x: ox, y: oy, vx: Math.cos(ang) * a.vel, vy: Math.sin(ang) * a.vel, vida: a.alcance / a.vel, dono: j }); return; }
  for (let k = 0; k < a.bala; k++) {
    const aa = ang + rnd(-a.espalha, a.espalha);
    W.balas.push({ x: ox, y: oy, vx: Math.cos(aa) * a.vel, vy: Math.sin(aa) * a.vel, vida: a.alcance / a.vel, dano: a.dano, dono: j });
  }
  W.efeitos.push({ t: 'clarao', x: ox, y: oy, vida: 0.06, max: 0.06 });
  // tiro assusta todo mundo e chama a polícia se tiver perto
  for (const p of W.peds) if (dist(p.x, p.y, j.x, j.y) < 500) p.medo = Math.max(p.medo, 5);
  if (copsPerto(700)) crime(0.5);
}
function trocarArma(d, silencioso) {
  const j = W.jog, tem = ORDEM_ARMAS.filter(k => j.tem[k] && (k === 'punho' || ARMAS[k].corpo || j.municao[k] > 0));
  let i = tem.indexOf(j.arma); i = (i + d + tem.length) % tem.length; j.arma = tem[i] || 'punho';
}
function inimigoAtira(de, alvoX, alvoY, dano, espalha = 0.12, vel = 900) {
  const ang = Math.atan2(alvoY - de.y, alvoX - de.x) + rnd(-espalha, espalha);
  W.balas.push({ x: de.x + Math.cos(ang) * 20, y: de.y + Math.sin(ang) * 20, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vida: 0.9, dano, dono: de });
  if (dist(de.x, de.y, W.jog.x, W.jog.y) < 900) SOM.barulho(0.1, 0.25, 2000);
}

function atualizaBalas(dt) {
  const j = W.jog;
  for (const b of W.balas) {
    const passos = 3;
    for (let s = 0; s < passos && b.vida > 0; s++) {
      b.x += b.vx * dt / passos; b.y += b.vy * dt / passos;
      if (solidoEm(b.x, b.y)) { b.vida = 0; W.efeitos.push({ t: 'faisca', x: b.x, y: b.y, vida: 0.15, max: 0.15 }); break; }
      if (b.dono === j) {
        for (const p of W.peds) if (!p.morto && !p.dentroCarro && dist(p.x, p.y, b.x, b.y) < 13) { feriPed(p, b.dano, j); b.vida = 0; break; }
        if (b.vida > 0) for (const c of W.carros) if (c !== j.carro && c.hp > 0 && dist(c.x, c.y, b.x, b.y) < c.l * 0.42) { danoCarro(c, b.dano * 0.7, j); b.vida = 0; W.efeitos.push({ t: 'faisca', x: b.x, y: b.y, vida: 0.12, max: 0.12 }); break; }
        if (b.vida > 0) for (const ch of W.chefes) if (ch.levaTiro && ch.levaTiro(b.x, b.y, b.dano)) { b.vida = 0; break; }
      } else {
        const alvo = j.carro || j, r = j.carro ? j.carro.l * 0.42 : 13;
        if (dist(alvo.x, alvo.y, b.x, b.y) < r) { if (j.carro) danoCarro(j.carro, b.dano * 0.3); else ferirJogador(b.dano); b.vida = 0; }
        else if (b.dono && b.dono.aliado === false) { /* nada */ }
      }
    }
    b.vida -= dt;
  }
  W.balas = W.balas.filter(b => b.vida > 0);
  for (const f of W.foguetes) {
    f.x += f.vx * dt; f.y += f.vy * dt; f.vida -= dt;
    if (rnd() < 0.8) W.efeitos.push({ t: 'fumaca', x: f.x, y: f.y, r: 8, vida: 0.5, max: 0.5 });
    let bum = f.vida <= 0 || solidoEm(f.x, f.y);
    if (!bum) for (const c of W.carros) if (c !== W.jog.carro && c.hp > 0 && dist(c.x, c.y, f.x, f.y) < c.l * 0.45) bum = true;
    if (!bum) for (const p of W.peds) if (!p.morto && dist(p.x, p.y, f.x, f.y) < 18) bum = true;
    if (!bum) for (const ch of W.chefes) if (ch.acertaArea && ch.acertaArea(f.x, f.y)) bum = true;
    if (!bum && f.dono !== W.jog) { const al = W.jog.carro || W.jog; if (dist(al.x, al.y, f.x, f.y) < 30) bum = true; }
    if (bum) { f.vida = -1; explodir(f.x, f.y, 140, 140, f.dono); }
  }
  W.foguetes = W.foguetes.filter(f => f.vida > 0);
  // granada e molotov
  for (const o of W.jogados) {
    o.vx *= Math.pow(0.35, dt); o.vy *= Math.pow(0.35, dt);
    const nx = o.x + o.vx * dt, ny = o.y + o.vy * dt;
    if (solidoEm(nx, ny)) { o.vx *= -0.4; o.vy *= -0.4; } else { o.x = nx; o.y = ny; }
    o.vida -= dt; o.gira += dt * 12;
    if (o.vida <= 0) {
      if (o.t === 'granada') explodir(o.x, o.y, 150, 130, o.dono);
      else { SOM.barulho(0.5, 0.5, 900); W.fogos.push({ x: o.x, y: o.y, r: 80, vida: 6, dono: o.dono }); }
    }
  }
  W.jogados = W.jogados.filter(o => o.vida > 0);
  // chamas do lança-chamas
  for (const c of W.chamas) {
    c.x += c.vx * dt; c.y += c.vy * dt; c.vida -= dt;
    if (solidoEm(c.x, c.y)) c.vida = 0;
    for (const p of W.peds) if (!p.morto && !p.escondido && dist(p.x, p.y, c.x, c.y) < 22) { feriPed(p, ARMAS.lancachamas.dano, c.dono); p.pegaFogo = 2.5; }
    for (const car of W.carros) if (car !== W.jog.carro && car.hp > 0 && dist(car.x, car.y, c.x, c.y) < car.l * 0.45) danoCarro(car, 2.5, c.dono);
    for (const ch of W.chefes) if (ch.levaTiro && ch.levaTiro(c.x, c.y, 2)) { c.vida = 0; break; }
  }
  W.chamas = W.chamas.filter(c => c.vida > 0);
  // fogo no chão (molotov)
  for (const f of W.fogos) {
    f.vida -= dt;
    if (rnd() < 0.6) W.efeitos.push({ t: 'fumaca', x: f.x + rnd(-f.r, f.r) * 0.7, y: f.y + rnd(-f.r, f.r) * 0.7, r: 10, vida: 0.7, max: 0.7, escura: true });
    for (const p of W.peds) if (!p.morto && !p.escondido && dist(p.x, p.y, f.x, f.y) < f.r) { feriPed(p, 25 * dt, f.dono); p.pegaFogo = 2; }
    for (const car of W.carros) if (car.hp > 0 && dist(car.x, car.y, f.x, f.y) < f.r) danoCarro(car, 20 * dt, f.dono);
    for (const ch of W.chefes) ch.explosao && ch.explosao(f.x, f.y, f.r * 0.6, 12 * dt);
    const j = W.jog; if (!j.carro && dist(j.x, j.y, f.x, f.y) < f.r * 0.8) ferirJogador(14 * dt);
  }
  W.fogos = W.fogos.filter(f => f.vida > 0);
}

// ---------- jogador a pé ----------
function controleMovimento() {
  let mx = 0, my = 0;
  if (segura('a', 'arrowleft')) mx -= 1; if (segura('d', 'arrowright')) mx += 1;
  if (segura('w', 'arrowup')) my -= 1; if (segura('s', 'arrowdown')) my += 1;
  if (TOQUE.ativo && (TOQUE.jx || TOQUE.jy)) { mx = TOQUE.jx; my = TOQUE.jy; }
  return [mx, my];
}
function atualizaJogadorPe(dt) {
  const j = W.jog;
  const [mx, my] = controleMovimento();
  const corre = segura('shift') || (TOQUE.ativo && Math.hypot(mx, my) > 0.9);
  const roda = j.skate ? 'skate' : j.rodaAtiva;
  const tn = TENIS[j.tenis] || TENIS.chinelo;
  const vel = roda === 'skate' ? (corre ? 430 : 360) : roda === 'patins' ? (corre ? 500 : 410) : (corre ? 250 : 160) * tn.vel;
  const len = Math.hypot(mx, my);
  if (len > 0.1) {
    const nx = mx / Math.max(1, len), ny = my / Math.max(1, len);
    const ox = j.x, oy = j.y;
    j.x += nx * vel * dt; if (solidoEm(j.x, j.y) || solidoEm(j.x + Math.sign(nx) * 10, j.y)) j.x = ox;
    j.y += ny * vel * dt; if (solidoEm(j.x, j.y) || solidoEm(j.x, j.y + Math.sign(ny) * 10)) j.y = oy;
    if (!MOUSE.used || TOQUE.ativo) j.a = Math.atan2(ny, nx);
    j.anda += dt * (corre ? 14 : 9);
  }
  if (tileEm(j.x, j.y) === TL.AGUA) { ferirJogador(40 * dt); if (!W.avisoAgua) { W.avisoAgua = true; falar('luketa', 'sai da água, tu não sabe nadar não, cria de favela!', 3); } }
  // mira
  let ax = Math.cos(j.a), ay = Math.sin(j.a);
  if (MOUSE.used && !TOQUE.ativo) { const wx = MOUSE.x / cam.zoom + cam.x - VW / 2 / cam.zoom, wy = MOUSE.y / cam.zoom + cam.y - VH / 2 / cam.zoom; ax = wx - j.x; ay = wy - j.y; j.a = Math.atan2(ay, ax); }
  else if (TOQUE.atira || segura(' ', 'control')) {
    // mira automática no inimigo mais perto
    const alvo = alvoMaisPerto(j.x, j.y, 520);
    if (alvo) { ax = alvo.x - j.x; ay = alvo.y - j.y; }
  }
  if (MOUSE.down || TOQUE.atira || segura(' ', 'control')) atirar(ax, ay);
}
function alvoMaisPerto(x, y, r) {
  let m = null, md = r;
  const cands = [];
  for (const p of W.peds) if (!p.morto && !p.dentroCarro && (p.hostil || p.policia || p.bravo)) cands.push(p);
  for (const ch of W.chefes) if (ch.alvos) cands.push(...ch.alvos());
  for (const c of W.carros) if (c.hp > 0 && (c.chefe || (c.ia && (c.ia.tipo === 'policia' || c.ia.tipo === 'inimigo')))) cands.push(c);
  if (!cands.length) for (const p of W.peds) if (!p.morto && !p.dentroCarro) cands.push(p);
  for (const p of cands) { const d = dist(p.x, p.y, x, y); if (d < md) { md = d; m = p; } }
  return m;
}

// ---------- jogador no carro ----------
function atualizaJogadorCarro(dt) {
  const j = W.jog, c = j.carro;
  let [mx, my] = controleMovimento();
  let acel = segura('w', 'arrowup'), freio = segura('s', 'arrowdown'), vira = 0;
  if (segura('a', 'arrowleft')) vira -= 1; if (segura('d', 'arrowright')) vira += 1;
  const mao = segura(' ') || TOQUE.freio;
  if (TOQUE.ativo && (mx || my)) {
    // no celular: o joystick aponta pra onde quer ir
    const alvoAng = Math.atan2(my, mx), d = angDiff(c.a, alvoAng);
    if (Math.abs(d) < 2.3) { acel = true; vira = clamp(d * 2, -1, 1); } else { freio = true; vira = clamp(-d * 2, -1, 1); }
  }
  if (c.hp <= 0) { acel = false; }
  fisicaCarro(c, dt, acel, freio, vira, mao);
  j.x = c.x; j.y = c.y;
  SOM.atualizaMotor(c.vel, true);
  if (c.derrapa > 180 && Math.abs(c.vel) > 200) { W.manchas.push({ t: 'pneu', x: c.x - Math.cos(c.a) * c.l * 0.35, y: c.y - Math.sin(c.a) * c.l * 0.35, a: c.a }); if (W.manchas.length > 500) W.manchas.splice(0, 60); }
  // atirar de dentro do carro (drive-by pros lados) com pistola/uzi
  if ((MOUSE.down || TOQUE.atira || segura('control')) && ['pistola', 'uzi'].includes(j.arma)) {
    const alvo = alvoMaisPerto(c.x, c.y, 500);
    const ang = alvo ? Math.atan2(alvo.y - c.y, alvo.x - c.x) : c.a;
    const sa = j.a; atirar(Math.cos(ang), Math.sin(ang)); j.a = sa;
  }
  if (apertou('h')) { SOM.buzina(); for (const p of W.peds) if (dist(p.x, p.y, c.x, c.y) < 200) p.medo = Math.max(p.medo, 2); }
}

// ---------- pedestres ----------
function atualizaPeds(dt) {
  const j = W.jog;
  for (const p of W.peds) {
    if (p.morto || p.dentroCarro) continue;
    if (p.ia) { p.ia(p, dt); continue; }
    if (p.fixo) { p.anda += dt * 0.3; if (p.olhaJog) p.a = Math.atan2(j.y - p.y, j.x - p.x); continue; }
    p.medo = Math.max(0, p.medo - dt);
    let vx = 0, vy = 0;
    if (p.policia || p.bravo) {
      // policial a pé: corre atrás e atira (ou bate, se só estiver bravo)
      const alvo = j.carro || j, d = dist(p.x, p.y, alvo.x, alvo.y);
      if (W.procurado > 0 || p.bravo) {
        const ang = Math.atan2(alvo.y - p.y, alvo.x - p.x); p.a = ang;
        if (d > 140) { vx = Math.cos(ang) * 200; vy = Math.sin(ang) * 200; }
        p.recarga = (p.recarga || 0) - dt;
        if (p.policia && W.procurado >= 2 && d < 420 && p.recarga <= 0) { p.recarga = rnd(1.1, 2); inimigoAtira(p, alvo.x, alvo.y, W.procurado >= 4 ? 8 : 6, 0.22); }
        if (!p.policia && d < 30 && p.recarga <= 0) { p.recarga = 1; ferirJogador(5); }
        if (p.bravo && !p.policia && d > 700) p.bravo = false;
      } else { p.policia = p.policia; }
    } else if (p.medo > 0) {
      const ang = Math.atan2(p.y - j.y, p.x - j.x); p.a = ang; vx = Math.cos(ang) * 210; vy = Math.sin(ang) * 210;
    } else {
      p.troca -= dt;
      if (p.troca <= 0) { p.troca = rnd(2, 6); p.a = [0, Math.PI / 2, Math.PI, -Math.PI / 2][rndi(0, 3)] + rnd(-0.15, 0.15); if (rnd() < 0.15) p.parado = rnd(1, 3); }
      if (p.parado > 0) p.parado -= dt; else { vx = Math.cos(p.a) * p.vel; vy = Math.sin(p.a) * p.vel; }
    }
    if (vx || vy) {
      const nx = p.x + vx * dt, ny = p.y + vy * dt, t = tileEm(nx, ny);
      const ok = !SOLIDO.has(t) && (p.medo > 0 || p.policia || p.bravo || t !== TL.RUA);
      if (ok) { p.x = nx; p.y = ny; p.anda += dt * 9; } else { p.a += Math.PI * rnd(0.5, 1.5); p.troca = rnd(1, 3); }
    }
  }
  W.peds = W.peds.filter(p => !(p.morto && dist(p.x, p.y, cam.x, cam.y) > 1600));
}

// ---------- carros ----------
function atualizaCarros(dt) {
  const j = W.jog, alvo = j.carro || j;
  for (const c of W.carros) {
    if (c.fogo > 0) {
      c.fogo -= dt; if (rnd() < 0.5) W.efeitos.push({ t: 'fumaca', x: c.x + rnd(-15, 15), y: c.y + rnd(-15, 15), r: 14, vida: 0.9, max: 0.9 });
      if (c.fogo <= 0) {
        explodir(c.x, c.y, 140, 100, c.ultimoDano); c.lixo = true; c.fogo = 0;
        if (c === j.carro) { j.carro = null; ferirJogador(200); }
        if (c.motorista && c.motorista !== j) { c.motorista.hp = 0; c.motorista.morto = true; }
      }
      if (c !== j.carro) { c.vx *= Math.pow(0.3, dt); c.vy *= Math.pow(0.3, dt); c.x += c.vx * dt; c.y += c.vy * dt; }
      continue;
    }
    if (c.lixo || c === j.carro) continue;
    if (c.hp > 0 && c.hp < c.hpMax * 0.3 && rnd() < 0.2) W.efeitos.push({ t: 'fumaca', x: c.x + Math.cos(c.a) * c.l * 0.35, y: c.y + Math.sin(c.a) * c.l * 0.35, r: 9, vida: 0.8, max: 0.8, escura: true });
    if (c.ia && c.hp > 0) {
      if (c.ia.tipo === 'transito') {
        if (c.motorista && c.motorista.medo > 3 && rnd() < 0.002) { /* às vezes o motorista larga o carro e foge */ }
        iaTransito(c, dt);
      } else if (c.ia.tipo === 'policia') {
        if (W.procurado === 0) { c.ia = { tipo: 'transito', dir: rndi(0, 3), velAlvo: 180 }; c.sirene = false; continue; }
        iaPersegue(c, dt, alvo.x, alvo.y, 1);
        c.recarga = (c.recarga || 0) - dt;
        const d = dist(c.x, c.y, alvo.x, alvo.y);
        if (W.procurado >= 3 && d < 400 && c.recarga <= 0) { c.recarga = c.modelo === 'gelado' ? 0.7 : rnd(1.4, 2.4); inimigoAtira(c, alvo.x, alvo.y, c.modelo === 'gelado' ? 6 : 5, 0.22); }
        // policial sai do carro se o jogador tá a pé e perto
        if (!j.carro && d < 260 && Math.abs(c.vel) < 60 && c.motorista && !c.desceu) {
          c.desceu = true; const m = c.motorista; m.x = c.x + 40; m.y = c.y; m.policia = true; m.hp = 45; W.peds.push(m); c.motorista = null; c.ia = null;
        }
      } else if (c.ia.tipo === 'script') {
        c.ia.fn(c, dt);
      }
    } else if (!c.ia || c.hp <= 0) {
      c.vx *= Math.pow(0.2, dt); c.vy *= Math.pow(0.2, dt); moverCarro(c, dt);
    }
  }
  W.carros = W.carros.filter(c => !c.lixo);
  // sirene toca se tem viatura perseguindo perto
  SOM.atualizaSirene(W.procurado > 0 && W.carros.some(c => c.sirene && c.ia && c.ia.tipo === 'policia' && dist(c.x, c.y, alvo.x, alvo.y) < 900));
}

// ---------- procurado: vai baixando se ninguém te vê ----------
function atualizaProcurado(dt) {
  if (W.procurado === 0) { W.calor = 0; return; }
  const visto = copsPerto(650);
  if (visto) W.semVer = 0; else W.semVer += dt;
  const tempo = 6 + W.procurado * 3;
  if (W.semVer > tempo) {
    W.semVer = 0; W.procurado--; W.calor = W.procurado * 2;
    if (W.procurado === 0) falar('luketa', 'despistou os home! boa, nerivan', 2.5);
  }
  // preso: polícia a pé encosta em você a pé
  const j = W.jog;
  if (!j.carro && !j.morto) for (const p of W.peds) if (p.policia && !p.morto && dist(p.x, p.y, j.x, j.y) < 26) { morreu('preso'); break; }
  if (j.carro && Math.abs(j.carro.vel) < 15 && W.procurado > 0) {
    j.paradoPreso = (j.paradoPreso || 0) + dt;
    const cercado = W.carros.filter(c => c.policia && c.hp > 0 && dist(c.x, c.y, j.x, j.y) < 130).length;
    if (cercado >= 3 && j.paradoPreso > 4) morreu('preso');
  } else j.paradoPreso = 0;
}

// ---------- itens no chão ----------
const ITENS_ARMA = { pistola: 24, uzi: 90, escopeta: 16, foguete: 4, taco: 1, fuzil: 60, granada: 5, molotov: 5, lancachamas: 200 };
function atualizaItens(dt) {
  const j = W.jog;
  for (const it of W.itens) {
    if (it.vida !== undefined) { it.vida -= dt; if (it.vida <= 0) it.morto = true; }
    if (it.morto) continue;
    const r = j.carro ? 60 : 32;
    if (dist(it.x, it.y, j.x, j.y) < r && !(it.t !== 'grana' && it.t !== 'armadilha' && j.carro && it.t !== 'pacote')) {
      if (it.t === 'grana') { j.grana += it.v; SOM.grana(); W.efeitos.push({ t: 'texto', x: it.x, y: it.y - 10, txt: '+' + fmt$(it.v), vida: 1, max: 1, cor: '#7CFC00' }); }
      else if (it.t === 'arma') { j.tem[it.arma] = true; j.municao[it.arma] += ITENS_ARMA[it.arma]; j.arma = it.arma; SOM.pega(); W.efeitos.push({ t: 'texto', x: it.x, y: it.y - 10, txt: ARMAS[it.arma].nome + '!', vida: 1.2, max: 1.2, cor: '#ffd23f' }); }
      else if (it.t === 'vida') { j.hp = Math.min(100, j.hp + 40); SOM.pega(); }
      else if (it.t === 'colete') { j.colete = 100; SOM.pega(); }
      else if (it.t === 'estrela') { W.procurado = 0; W.calor = 0; SOM.pega(); falar('luketa', 'suborno pago, a ficha tá limpa', 2); }
      else if (it.t === 'armadilha') { it.fn && it.fn(); }
      else if (it.t === 'pacote') { it.fn && it.fn(); }
      else if (it.t === 'segredo') { achouSegredo(it.id); }
      if (!it.fica) it.morto = true;
      if (it.respawn) { const copia = { ...it, morto: false, escondido: it.respawn }; it.reaparece = copia; }
    }
  }
  for (const it of W.itens) if (it.morto && it.reaparece) { W.itensReaparecer.push({ item: it.reaparece, t: it.respawn }); it.reaparece = null; }
  W.itens = W.itens.filter(i => !i.morto);
  for (const r of W.itensReaparecer) { r.t -= dt; if (r.t <= 0) { const n = r.item; n.escondido = 0; W.itens.push(n); } }
  W.itensReaparecer = W.itensReaparecer.filter(r => r.t > 0);
}
function espalharItens() {
  W.itensReaparecer = [];
  // distância de cada tile até a rua mais perto: os itens ficam escondidos em beco, quintal e praça
  const dr = new Uint8Array(MW * MH).fill(255), fila = [];
  for (let i = 0; i < MW * MH; i++) if (mapa[i] === TL.RUA) { dr[i] = 0; fila.push(i); }
  for (let q = 0; q < fila.length; q++) { const i = fila[q], x = i % MW, y = (i / MW) | 0; for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const n = ny * MW + nx; if (dr[n] > dr[i] + 1) { dr[n] = dr[i] + 1; fila.push(n); } } }
  const ok = (x, y, esconde) => { const t = tile(x, y); if (SOLIDO.has(t) || t === TL.RUA) return false; const d = dr[y * MW + x]; return t === TL.BECO ? d >= 2 : d >= esconde; };
  // [tipo, arma, quantidade, quão escondido (tiles longe da rua)]
  const lista = [['arma', 'pistola', 8, 2], ['arma', 'uzi', 4, 3], ['arma', 'escopeta', 3, 3], ['arma', 'fuzil', 2, 4], ['arma', 'foguete', 2, 4], ['arma', 'taco', 5, 2], ['arma', 'granada', 3, 3], ['arma', 'molotov', 3, 3], ['arma', 'lancachamas', 1, 4],
    ['vida', null, 7, 3], ['colete', null, 4, 4], ['estrela', null, 3, 4], ['grana', null, 14, 3]];
  const r = seeded(4242);
  for (const [t, arma, n, esc] of lista) for (let k = 0; k < n; k++) {
    for (let tent = 0; tent < 400; tent++) {
      const x = (8 + r() * (MW - 16)) | 0, y = (8 + r() * (MH - 16)) | 0;
      if (!ok(x, y, esc)) continue;
      if (W.itens.some(i => Math.abs(i.x / T - x) < 10 && Math.abs(i.y / T - y) < 10)) continue;
      W.itens.push({ t, arma, x: (x + 0.5) * T, y: (y + 0.5) * T, v: t === 'grana' ? rndi(100, 400) : 0, respawn: 300 });
      break;
    }
  }
}

// ---------- efeitos ----------
function atualizaEfeitos(dt) {
  for (const e of W.efeitos) { e.vida -= dt; if (e.t === 'texto') e.y -= 25 * dt; if (e.t === 'fumaca') e.r += 18 * dt; }
  W.efeitos = W.efeitos.filter(e => e.vida > 0);
  for (const f of FALAS) f.t += dt;
  while (FALAS.length && FALAS[0].t > FALAS[0].dur) FALAS.shift();
  if (W.manchas.length > 600) W.manchas.splice(0, 100);
}

// ---------- morte / preso ----------
let TELA_FIM = null;
function morreu(tipo) {
  const j = W.jog; if (j.morto) return;
  j.morto = true; TELA_FIM = { tipo, t: 0 };
  if (j.carro) { j.carro.motorista = null; j.carro = null; }
  SOM.falha(); SOM.atualizaMotor(0, false); RADIO.tocar(false);
  if (MISSAO.ativa) MISSAO.falhar(tipo === 'preso' ? 'tu foi PRESO' : 'tu MORREU');
}
function renascer() {
  const j = W.jog, tipo = TELA_FIM.tipo;
  const perde = Math.min(j.grana, tipo === 'preso' ? 150 : 80);
  j.grana -= perde; j.morto = false; j.hp = 100; j.colete = 0;
  if (tipo === 'preso') { for (const k of ['pistola', 'uzi', 'escopeta', 'foguete']) j.municao[k] = Math.floor(j.municao[k] / 2); }
  const lugar = tipo === 'preso' ? LUGAR.policia : LUGAR.hospital;
  j.x = lugar.x; j.y = lugar.y + 40; W.procurado = 0; W.calor = 0;
  W.carros = W.carros.filter(c => !(c.ia && c.ia.tipo === 'policia'));
  W.peds = W.peds.filter(p => !p.policia);
  TELA_FIM = null; W.escorregou = 0;
  falar('luketa', tipo === 'preso' ? `o Dudu pagou tua fiança (${fmt$(perde)}). levaram metade da munição` : `o SUS te salvou, custou ${fmt$(perde)}. bora de novo`, 4);
  salvar();
}
