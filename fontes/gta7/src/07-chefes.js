// =========================================================
// CHEFES: CLAUDE-BOT 3000 (Matheus) e Choque-Móvel (Ltzin)
// =========================================================
function danoNoJogador(d) { const j = W.jog; if (j.carro) danoCarro(j.carro, d * 1.6); else ferirJogador(d); }
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = clamp(t, 0, 1);
  return dist(px, py, ax + dx * t, ay + dy * t);
}

function criarRobo(x, y) {
  const cx = x, cy = y;
  const R = {
    x, y, a: Math.PI / 2, passo: 0, morto: false, morrendo: 0,
    partes: { esq: { hp: 300, max: 300, ox: 0, oy: -95, r: 44 }, dir: { hp: 300, max: 300, ox: 0, oy: 95, r: 44 }, nucleo: { hp: 600, max: 600, ox: 10, oy: 0, r: 50 } },
    ataque: 'andar', t: 2.5, mira: null, misseis: [], falou: {},
    pos(p) { const ca = Math.cos(this.a), sa = Math.sin(this.a); return { x: this.x + p.ox * ca - p.oy * sa, y: this.y + p.ox * sa + p.oy * ca }; },
    bracos() { return (this.partes.esq.hp > 0) + (this.partes.dir.hp > 0); },
    vidaTotal() { const p = this.partes; return (Math.max(0, p.esq.hp) + Math.max(0, p.dir.hp) + Math.max(0, p.nucleo.hp)) / 1200; },
    machuca(nome, d) {
      const p = this.partes[nome]; if (p.hp <= 0) return;
      if (nome === 'nucleo' && this.bracos() > 0) { W.efeitos.push({ t: 'faisca', ...this.pos(p), vida: 0.2, max: 0.2 }); if (!this.falou.blind) { this.falou.blind = 1; falar('luketa', 'o núcleo tá blindado! arrebenta os BRAÇOS primeiro', 3); } return; }
      p.hp -= d; W.efeitos.push({ t: 'faisca', ...this.pos(p), vida: 0.2, max: 0.2 });
      if (p.hp <= 0) {
        const q = this.pos(p); explodir(q.x, q.y, 90, 0);
        if (nome !== 'nucleo') falar('matt', this.bracos() === 1 ? 'MEU BRAÇO! isso não tava nos testes unitários!' : 'os dois braços?! Claude, socorro!', 3);
        else { this.morrendo = 3; falar('matt', 'NÃÃÃO! o Claude avisou que era má ideia!!', 3); }
      }
    },
    levaTiro(x, y, d) {
      if (this.morto || this.morrendo) return false;
      for (const k in this.partes) { const p = this.partes[k]; if (p.hp <= 0) continue; const q = this.pos(p); if (dist(q.x, q.y, x, y) < p.r) { this.machuca(k, d); return true; } }
      for (const m of this.misseis) if (dist(m.x, m.y, x, y) < 16) { m.vida = 0; explodir(m.x, m.y, 60, 0); return true; }
      if (dist(this.x, this.y, x, y) < 85) { W.efeitos.push({ t: 'faisca', x, y, vida: 0.12, max: 0.12 }); return true; }
      return false;
    },
    levaSoco(x, y, d) { this.levaTiro(x, y, d * 0.5); },
    acertaArea(x, y) { return !this.morto && dist(this.x, this.y, x, y) < 105; },
    explosao(x, y, r, dano) {
      if (this.morto || this.morrendo || dano <= 0) return;
      for (const k in this.partes) { const p = this.partes[k]; if (p.hp <= 0) continue; const q = this.pos(p); const d = dist(q.x, q.y, x, y); if (d < r + 40) this.machuca(k, dano * 1.9 * (1 - d / (r + 60))); }
    },
    alvos() { if (this.morto) return []; const r = []; for (const k in this.partes) { const p = this.partes[k]; if (p.hp > 0 && (k !== 'nucleo' || this.bracos() === 0)) r.push(this.pos(p)); } return r; },
    update(dt) {
      if (this.morto) return;
      if (this.morrendo) {
        this.morrendo -= dt; if (rnd() < 0.3) explodir(this.x + rnd(-90, 90), this.y + rnd(-90, 90), 70, 0);
        if (this.morrendo <= 0) { this.morto = true; explodir(this.x, this.y, 220, 0); }
        return;
      }
      const j = W.jog, alvo = j.carro || j;
      const angAlvo = Math.atan2(alvo.y - this.y, alvo.x - this.x);
      this.a += clamp(angDiff(this.a, angAlvo), -1.2 * dt, 1.2 * dt);
      const fúria = this.bracos() === 0 ? 1.6 : this.bracos() === 1 ? 1.25 : 1;
      this.t -= dt * fúria;
      const d = dist(this.x, this.y, alvo.x, alvo.y);
      if (this.ataque === 'andar') {
        if (d > 200) { this.x += Math.cos(this.a) * 75 * fúria * dt; this.y += Math.sin(this.a) * 75 * fúria * dt; this.passo += dt * 4; }
        this.x = clamp(this.x, cx - 380, cx + 380); this.y = clamp(this.y, cy - 380, cy + 420);
        if (d < 170 && this.t < 1.5) { this.ataque = 'pisao'; this.t = 0.8; W.efeitos.push({ t: 'mira', x: this.x, y: this.y, r: 200, vida: 0.8, max: 0.8 }); }
        else if (this.t <= 0) {
          const op = ['laser', 'laser'];
          if (this.bracos() > 0) op.push('misseis', 'misseis');
          this.ataque = pick(op);
          if (this.ataque === 'laser') { this.t = 1.1; this.mira = { x: alvo.x, y: alvo.y }; }
          else this.t = 0.6;
          if (!this.falou[this.ataque]) { this.falou[this.ataque] = 1; falar('matt', this.ataque === 'laser' ? 'LASER DOS OLHOS! sai da linha vermelha!' : 'MÍSSEIS TELEGUIADOS! dá pra derrubar com tiro, se tu conseguir KKK', 3); }
        }
      } else if (this.ataque === 'laser') {
        // a mira vai seguindo devagar
        this.mira.x = lerp(this.mira.x, alvo.x, dt * 1.5); this.mira.y = lerp(this.mira.y, alvo.y, dt * 1.5);
        if (this.t <= 0) {
          const ang = Math.atan2(this.mira.y - this.y, this.mira.x - this.x), ex = this.x + Math.cos(ang) * 1200, ey = this.y + Math.sin(ang) * 1200;
          W.efeitos.push({ t: 'laser', x: this.x, y: this.y, x2: ex, y2: ey, vida: 0.35, max: 0.35 });
          SOM.bip(200, 0.5, 0.3, 'sawtooth', 60); tremer(8);
          if (distSeg(alvo.x, alvo.y, this.x, this.y, ex, ey) < (j.carro ? 45 : 30)) danoNoJogador(30);
          this.ataque = 'andar'; this.t = rnd(2, 3.2); this.mira = null;
        }
      } else if (this.ataque === 'misseis') {
        if (this.t <= 0) {
          for (const k of ['esq', 'dir']) { const p = this.partes[k]; if (p.hp <= 0) continue; const q = this.pos(p); for (let n = 0; n < 2; n++) this.misseis.push({ x: q.x, y: q.y, a: this.a + rnd(-1, 1), vida: 5 }); }
          SOM.barulho(0.4, 0.4, 700, 'bandpass'); this.ataque = 'andar'; this.t = rnd(2.2, 3.5);
        }
      } else if (this.ataque === 'pisao') {
        if (this.t <= 0) {
          W.efeitos.push({ t: 'anel', x: this.x, y: this.y, r: 220, vida: 0.5, max: 0.5 }); tremer(16); SOM.explosao();
          if (dist(this.x, this.y, alvo.x, alvo.y) < 210) { danoNoJogador(22); if (!j.carro) { const a = Math.atan2(j.y - this.y, j.x - this.x); for (let k = 0; k < 10; k++) { const nx = j.x + Math.cos(a) * 12, ny = j.y + Math.sin(a) * 12; if (!solidoEm(nx, ny)) { j.x = nx; j.y = ny; } } } }
          this.ataque = 'andar'; this.t = rnd(1.8, 2.6);
        }
      }
      for (const m of this.misseis) {
        const am = Math.atan2(alvo.y - m.y, alvo.x - m.x); m.a += clamp(angDiff(m.a, am), -2 * dt, 2 * dt);
        m.x += Math.cos(m.a) * 270 * dt; m.y += Math.sin(m.a) * 270 * dt; m.vida -= dt;
        if (rnd() < 0.6) W.efeitos.push({ t: 'fumaca', x: m.x, y: m.y, r: 6, vida: 0.4, max: 0.4 });
        if (dist(m.x, m.y, alvo.x, alvo.y) < (j.carro ? 40 : 24)) { m.vida = 0; W.efeitos.push({ t: 'explosao', x: m.x, y: m.y, r: 70, vida: 0.5, max: 0.5 }); SOM.explosao(); danoNoJogador(14); }
        else if (m.vida <= 0 || solidoEm(m.x, m.y)) { m.vida = 0; W.efeitos.push({ t: 'explosao', x: m.x, y: m.y, r: 50, vida: 0.4, max: 0.4 }); }
      }
      this.misseis = this.misseis.filter(m => m.vida > 0);
    },
    desenhar(g) {
      if (this.morto) {
        g.fillStyle = '#2d2d2d'; g.beginPath(); g.arc(this.x, this.y, 90, 0, 7); g.fill();
        g.fillStyle = '#555'; for (let k = 0; k < 7; k++) g.fillRect(this.x + Math.cos(k) * 60 - 10, this.y + Math.sin(k * 2) * 60 - 6, 20, 12);
        return;
      }
      if (this.mira) {
        g.strokeStyle = `rgba(255,30,60,${0.3 + 0.5 * Math.abs(Math.sin(W.tempo * 15))})`; g.lineWidth = 3; g.setLineDash([12, 10]);
        const ang = Math.atan2(this.mira.y - this.y, this.mira.x - this.x); g.beginPath(); g.moveTo(this.x, this.y); g.lineTo(this.x + Math.cos(ang) * 1200, this.y + Math.sin(ang) * 1200); g.stroke(); g.setLineDash([]);
      }
      for (const m of this.misseis) { g.save(); g.translate(m.x, m.y); g.rotate(m.a); g.fillStyle = '#ddd'; g.fillRect(-10, -4, 20, 8); g.fillStyle = '#e74c3c'; g.fillRect(6, -4, 6, 8); g.fillStyle = '#ffa500'; g.beginPath(); g.arc(-12, 0, 4 + Math.random() * 3, 0, 7); g.fill(); g.restore(); }
      g.save(); g.translate(this.x, this.y);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(14, 18, 130, 110, 0, 0, 7); g.fill();
      g.rotate(this.a);
      // pernas
      const pa = Math.sin(this.passo) * 22;
      g.fillStyle = '#444b55';
      g.fillRect(-60 + pa, -70, 50, 30); g.fillRect(-60 - pa, 40, 50, 30);
      g.fillStyle = '#2d3436'; g.fillRect(-20 + pa, -78, 26, 46); g.fillRect(-20 - pa, 32, 26, 46);
      // corpo
      g.fillStyle = '#c0392b'; rr(g, -70, -62, 140, 124, 22); g.fill();
      g.fillStyle = '#e74c3c'; rr(g, -58, -50, 116, 100, 16); g.fill();
      g.strokeStyle = '#7b241c'; g.lineWidth = 4; rr(g, -70, -62, 140, 124, 22); g.stroke();
      // braços
      for (const [k, s] of [['esq', -1], ['dir', 1]]) {
        const p = this.partes[k];
        if (p.hp > 0) {
          g.fillStyle = '#636e72'; rr(g, -30, s * 95 - 26, 90, 52, 12); g.fill();
          g.fillStyle = '#2d3436'; g.fillRect(50, s * 95 - 14, 46, 10); g.fillRect(50, s * 95 + 4, 46, 10);
          g.fillStyle = '#ffd23f'; g.fillRect(-20, s * 95 - 22, 60 * (p.hp / p.max), 6);
        } else {
          g.fillStyle = '#2d2d2d'; g.beginPath(); g.arc(0, s * 80, 22, 0, 7); g.fill();
          if (Math.random() < 0.5) { g.fillStyle = '#ffd23f'; g.fillRect(rnd(-10, 10), s * 80 + rnd(-10, 10), 4, 4); }
        }
      }
      // núcleo
      const nuc = this.partes.nucleo, aberto = this.bracos() === 0;
      g.fillStyle = aberto ? `hsl(${25 + Math.sin(W.tempo * 10) * 15},100%,55%)` : '#7f8c8d';
      g.beginPath(); g.arc(nuc.ox - 20, 0, 26, 0, 7); g.fill();
      if (!aberto) { g.strokeStyle = '#2d3436'; g.lineWidth = 5; g.beginPath(); g.moveTo(nuc.ox - 46, -10); g.lineTo(nuc.ox + 6, -10); g.moveTo(nuc.ox - 46, 10); g.lineTo(nuc.ox + 6, 10); g.stroke(); }
      // olhos (laser)
      g.fillStyle = this.mira ? '#ff1e3c' : '#ff7675'; g.fillRect(56, -20, 12, 12); g.fillRect(56, 8, 12, 12);
      g.restore();
      // cabine com o Matheus (fica sempre de pé, sem girar)
      const rosto = ROSTOS.matt; const hx = this.x + Math.cos(this.a) * 32, hy = this.y + Math.sin(this.a) * 32;
      g.fillStyle = 'rgba(140,200,255,.55)'; g.beginPath(); g.arc(hx, hy, 26, 0, 7); g.fill();
      if (rosto && rosto.complete && rosto.naturalWidth) { g.save(); g.beginPath(); g.arc(hx, hy, 20, 0, 7); g.clip(); g.drawImage(rosto, hx - 20, hy - 21, 40, 42); g.restore(); }
      g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(hx, hy, 26, 0, 7); g.stroke();
      g.font = '900 15px system-ui'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#000'; g.strokeText('CLAUDE-BOT 3000', this.x, this.y - 135); g.fillStyle = '#ff7675'; g.fillText('CLAUDE-BOT 3000', this.x, this.y - 135);
    }
  };
  falar('matt', 'CLAUDE-BOT 3000 ONLINE. todos os testes passaram ✅', 3);
  return R;
}

function criarChoqueMovel(x, y) {
  const c = novoCarro('choque', x, y, -Math.PI / 2, { missao: true, semEntrar: true, nome: 'LTZIN 👑', hp: 900, hpMax: 900 });
  c.motorista = novoPed(x, y, { rosto: 'ltzin' });
  const B = { carro: c, ped: null, fase: 1, morto: false, tAnel: 4, tRaio: 2.5, anel: null };
  c.aoZerar = () => {
    B.fase = 2; c.ia = null; c.nome = null; c.cor = '#5c4a0a'; c.fogo = 0; c.hp = 1;
    explodir(c.x, c.y, 100, 0);
    const p = novoPed(c.x + 60, c.y, { nome: 'Ltzin 👑', rosto: 'ltzin', hostil: true, hp: 240, missao: true, armaVisivel: 'uzi', camisa: '#f1c40f', corNome: '#f1c40f', persegue: true, longe: 160, alcance: 460, cad: 0.9 });
    p.ia = iaInimigo; p.vel = 70; W.peds.push(p); B.ped = p;
    p.aoMorrer = () => { B.morto = true; };
  };
  c.ia = { tipo: 'script', fn: (car, dt) => {
    const j = W.jog, alvo = j.carro || j;
    iaPersegue(car, dt, alvo.x, alvo.y, 1);
    // gruda no palácio (não foge pro mapa todo)
    const L = LUGAR.ltzin; if (dist(car.x, car.y, L.x, L.y) > 1500) { car.vx *= 0.5; car.vy *= 0.5; }
  } };
  W.carros.push(c);
  B.vida = () => B.fase === 1 ? Math.max(0, c.hp / c.hpMax) : Math.max(0, (B.ped ? B.ped.hp : 0) / 240);
  B.update = dt => {
    if (B.morto) return;
    const j = W.jog, alvo = j.carro || j, de = B.fase === 1 ? c : B.ped;
    if (!de) return;
    B.tAnel -= dt; B.tRaio -= dt;
    if (B.tAnel <= 0) {
      B.tAnel = B.fase === 1 ? rnd(4.5, 6) : rnd(5, 7);
      W.efeitos.push({ t: 'mira', x: de.x, y: de.y, r: 270, vida: 1.1, max: 1.1 });
      B.anel = { x: de.x, y: de.y, t: 1.1 };
      if (!B.falouAnel) { B.falouAnel = 1; falar('ltzin', 'CHOQUE NO SISTEMA!!! ⚡', 2.5); }
    }
    if (B.anel) {
      B.anel.t -= dt; if (B.anel.t <= 0) {
        W.efeitos.push({ t: 'anel', x: B.anel.x, y: B.anel.y, r: 270, vida: 0.5, max: 0.5 }); SOM.bip(120, 0.5, 0.35, 'sawtooth', 40); tremer(10);
        if (dist(alvo.x, alvo.y, B.anel.x, B.anel.y) < 280) danoNoJogador(26);
        B.anel = null;
      }
    }
    if (B.tRaio <= 0) {
      B.tRaio = rnd(2.4, 3.6);
      if (dist(alvo.x, alvo.y, de.x, de.y) < 480) {
        W.efeitos.push({ t: 'raio', x: de.x, y: de.y, x2: alvo.x, y2: alvo.y, vida: 0.3, max: 0.3 }); SOM.bip(1500, 0.15, 0.15, 'sawtooth', 300);
        danoNoJogador(9);
      }
    }
  };
  B.levaTiro = () => false;
  B.alvos = () => [];
  B.desenhar = g => {
    if (B.anel) { g.strokeStyle = 'rgba(0,229,255,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(B.anel.x, B.anel.y, 270, 0, 7); g.stroke(); }
    if (B.fase === 2 && B.ped && !B.ped.morto) { g.strokeStyle = `rgba(0,229,255,${0.5 + Math.random() * 0.5})`; g.lineWidth = 2; g.beginPath(); g.arc(B.ped.x, B.ped.y, 18 + Math.random() * 4, 0, 7); g.stroke(); }
  };
  return B;
}

function atualizaChefes(dt) { for (const ch of W.chefes) ch.update && ch.update(dt); }
