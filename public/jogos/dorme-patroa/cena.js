// "Dorme que a patroa tá chegando": quarto, Cas e Ana.
// Canvas lógico: 900 x 500.
//   drawQuarto(ctx, t, porta)          porta: 0 = fechada ... 1 = aberta; luz: 0..1 (luz do corredor por baixo da porta)
//   drawCas(ctx, estado, t, k)          estado: 'jogando' | 'dormindo' | 'pego' ; k = 0..1 (pulando da cadeira pra cama)
//   drawAna(ctx, estado, t)             estado: 'espiando' | 'entrando' | 'brava' | 'deboa'
// Rostos: rostoCas()/rostoAna() (desenhados, sem foto) logo abaixo.

const QW = 900, QH = 500, PISO = 392;
const ESTRELAS_Q = Array.from({ length: 26 }, (_, i) => [78 + ((i * 53) % 214), 70 + ((i * 37) % 70), (i % 3) * .4 + .5]);
const LUZES_RIO = Array.from({ length: 46 }, (_, i) => [74 + ((i * 41) % 222), 196 + ((i * 17) % 28), ['#ffd76a', '#ffefb0', '#ff9f43'][i % 3]]);

function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

// ================= QUARTO =================
function drawQuarto(ctx, t, porta = 0, luz = 0) {
  // parede
  const g = ctx.createLinearGradient(0, 0, 0, PISO);
  g.addColorStop(0, '#232142'); g.addColorStop(1, '#34305a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, QW, PISO);
  // rodapé + piso de taco
  ctx.fillStyle = '#5a3d2b'; ctx.fillRect(0, PISO, QW, QH - PISO);
  ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1;
  for (let y = PISO + 18; y < QH; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(QW, y); ctx.stroke(); }
  for (let r = 0; r * 18 < QH - PISO; r++) for (let x = (r % 2) * 45; x < QW; x += 90) { ctx.beginPath(); ctx.moveTo(x, PISO + r * 18); ctx.lineTo(x, PISO + r * 18 + 18); ctx.stroke(); }
  ctx.fillStyle = '#1b1930'; ctx.fillRect(0, PISO - 8, QW, 8);

  // ---- janela com o Cristo ----
  const jx = 70, jy = 58, jw = 230, jh = 170;
  const ceu = ctx.createLinearGradient(0, jy, 0, jy + jh);
  ceu.addColorStop(0, '#071331'); ceu.addColorStop(1, '#27477e');
  ctx.fillStyle = ceu; ctx.fillRect(jx, jy, jw, jh);
  ctx.fillStyle = '#fff';
  ESTRELAS_Q.forEach(([sx, sy, sr], i) => { ctx.globalAlpha = .4 + .4 * Math.sin(t / 600 + i); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 7); ctx.fill(); });
  ctx.globalAlpha = 1;
  // lua
  ctx.fillStyle = '#f6f0d2'; ctx.beginPath(); ctx.arc(268, 84, 11, 0, 7); ctx.fill();
  // morros (Corcovado no meio)
  ctx.fillStyle = '#0d1f1a';
  ctx.beginPath(); ctx.moveTo(jx, jy + jh); ctx.lineTo(jx, 180); ctx.quadraticCurveTo(110, 168, 140, 160);
  ctx.lineTo(176, 126); ctx.lineTo(192, 120); ctx.lineTo(206, 128); ctx.quadraticCurveTo(240, 160, 268, 170);
  ctx.quadraticCurveTo(290, 166, jx + jw, 176); ctx.lineTo(jx + jw, jy + jh); ctx.fill();
  // Cristo Redentor iluminado
  ctx.save(); ctx.translate(191, 120);
  ctx.shadowColor = '#fff7d6'; ctx.shadowBlur = 14;
  ctx.fillStyle = '#f5f1e3';
  ctx.fillRect(-2.5, -26, 5, 26);               // corpo
  ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(3, -6); ctx.lineTo(5, 0); ctx.lineTo(-5, 0); ctx.fill(); // manto
  ctx.fillRect(-15, -22, 30, 3.2);              // braços abertos
  ctx.beginPath(); ctx.arc(0, -29, 3, 0, 7); ctx.fill();   // cabeça
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#3c4a44'; ctx.fillRect(-4, 0, 8, 5);     // pedestal
  ctx.restore();
  // luzes da cidade
  LUZES_RIO.forEach(([lx, ly, c], i) => { ctx.fillStyle = c; ctx.globalAlpha = .55 + .45 * Math.sin(t / 900 + i * 1.7); ctx.fillRect(lx, ly, 2, 2); });
  ctx.globalAlpha = 1;
  // moldura + cruz
  ctx.strokeStyle = '#e9e4da'; ctx.lineWidth = 8; ctx.strokeRect(jx, jy, jw, jh);
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(jx + jw / 2, jy); ctx.lineTo(jx + jw / 2, jy + jh); ctx.stroke();
  ctx.fillStyle = '#d8d2c6'; ctx.fillRect(jx - 12, jy + jh + 2, jw + 24, 8);   // parapeito
  // cortinas
  ctx.fillStyle = '#6b2f5e';
  [[jx - 26, -1], [jx + jw + 4, 1]].forEach(([cx]) => {
    ctx.beginPath(); ctx.moveTo(cx, jy - 16); ctx.lineTo(cx + 22, jy - 16);
    ctx.quadraticCurveTo(cx + 16, jy + jh / 2, cx + 24, jy + jh + 20); ctx.lineTo(cx - 2, jy + jh + 20);
    ctx.quadraticCurveTo(cx + 6, jy + jh / 2, cx, jy - 16); ctx.fill();
  });
  ctx.fillStyle = '#2b2a3a'; ctx.fillRect(jx - 34, jy - 20, jw + 68, 5);

  // ---- ar condicionado ----
  rr(ctx, 372, 44, 168, 50, 10); ctx.fillStyle = '#eef0f3'; ctx.fill();
  ctx.fillStyle = '#c9ced6'; ctx.fillRect(382, 80, 148, 8);
  ctx.fillStyle = '#9aa1ad'; for (let i = 0; i < 6; i++) ctx.fillRect(388 + i * 24, 83, 16, 2);
  ctx.fillStyle = '#2ee66b'; ctx.beginPath(); ctx.arc(526, 58, 2.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#8a92a0'; ctx.font = 'bold 9px system-ui'; ctx.fillText('18°C', 384, 62);
  // ventinho
  ctx.strokeStyle = 'rgba(170,220,255,.35)'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const fase = ((t / 1400) + i / 4) % 1;
    ctx.globalAlpha = 1 - fase;
    ctx.beginPath();
    const bx = 400 + i * 36, by = 96 + fase * 60;
    ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + 8, by + 8, bx, by + 16); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // ---- cama ----
  ctx.fillStyle = '#3d2a20'; rr(ctx, 30, 250, 22, 150, 6); ctx.fill();            // cabeceira
  ctx.fillStyle = '#3d2a20'; ctx.fillRect(340, 330, 16, 70);                       // pé
  ctx.fillStyle = '#f2efe9'; rr(ctx, 48, 318, 300, 40, 10); ctx.fill();          // colchão
  ctx.fillStyle = '#ffffff'; rr(ctx, 60, 300, 82, 30, 14); ctx.fill();           // travesseiro
  ctx.fillStyle = '#2f5d9e'; rr(ctx, 150, 326, 196, 36, 10); ctx.fill();         // cobertor dobrado (sem ninguém)
  ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 4; i++) ctx.fillRect(160 + i * 48, 330, 20, 28);

  // ---- mesa + PC ----
  ctx.fillStyle = '#20202a'; ctx.fillRect(560, 298, 210, 10);                      // tampo
  ctx.fillRect(570, 308, 8, 86); ctx.fillRect(752, 308, 8, 86);
  // monitor
  ctx.fillStyle = '#111'; rr(ctx, 612, 214, 124, 78, 6); ctx.fill();
  const tela = ctx.createLinearGradient(616, 218, 732, 288);
  const h = (t / 30) % 360;
  tela.addColorStop(0, `hsl(${h},80%,55%)`); tela.addColorStop(1, `hsl(${(h + 120) % 360},80%,45%)`);
  ctx.fillStyle = tela; ctx.fillRect(617, 219, 114, 68);
  ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = 'bold 9px ui-monospace,monospace'; ctx.fillText('GAME ON', 650, 257);
  ctx.fillStyle = '#111'; ctx.fillRect(668, 292, 12, 7);
  // teclado com led
  ctx.fillStyle = '#1a1a22'; rr(ctx, 612, 288, 90, 9, 3); ctx.fill();
  ctx.fillStyle = `hsl(${h},90%,60%)`; ctx.fillRect(616, 290, 82, 2);
  // gabinete
  ctx.fillStyle = '#16161e'; rr(ctx, 712, 330, 40, 62, 4); ctx.fill();
  ctx.fillStyle = `hsl(${(h + 60) % 360},90%,60%)`; ctx.fillRect(718, 336, 4, 50);
  // cadeira gamer
  ctx.fillStyle = '#c0262d'; rr(ctx, 512, 212, 34, 108, 10); ctx.fill();
  ctx.fillStyle = '#1b1b1b'; rr(ctx, 508, 312, 76, 14, 6); ctx.fill();
  ctx.fillRect(540, 326, 8, 46); ctx.fillRect(516, 372, 56, 6);

  // ---- porta (direita) ----
  const px = 790, py = 104, pw = 92, ph = PISO - py;
  ctx.fillStyle = '#efe7d6'; ctx.fillRect(px - 8, py - 8, pw + 16, ph + 8);       // batente
  ctx.fillStyle = '#0d0c14'; ctx.fillRect(px, py, pw, ph);                         // vão escuro
  if (porta > 0) {                                                                  // corredor iluminado
    ctx.fillStyle = 'rgba(255,214,140,' + (.25 + .5 * porta) + ')'; ctx.fillRect(px, py, pw, ph);
  }
  // folha da porta abrindo pra dentro (fica mais estreita)
  const fw = pw * (1 - porta * .82);
  ctx.fillStyle = '#9b6b45';
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + fw, py + porta * 10); ctx.lineTo(px + fw, py + ph - porta * 6); ctx.lineTo(px, py + ph); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
  if (porta < .5) { ctx.strokeRect(px + 12, py + 16, fw - 24, ph * .38); ctx.strokeRect(px + 12, py + ph * .5, fw - 24, ph * .42); }
  ctx.fillStyle = '#e6c25a'; ctx.beginPath(); ctx.arc(px + fw - 12, py + ph * .52, 4, 0, 7); ctx.fill();   // maçaneta
  // luz por baixo da porta (ela chegando)
  if (luz > 0 && porta === 0) {
    const lg = ctx.createLinearGradient(0, PISO, 0, PISO + 40);
    lg.addColorStop(0, 'rgba(255,210,120,' + .7 * luz + ')'); lg.addColorStop(1, 'rgba(255,210,120,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(px, PISO); ctx.lineTo(px + pw, PISO); ctx.lineTo(px + pw + 30, PISO + 40); ctx.lineTo(px - 30, PISO + 40); ctx.fill();
    ctx.fillStyle = 'rgba(255,210,120,' + luz + ')'; ctx.fillRect(px, PISO - 3, pw, 3);
  }
  // quadro na parede
  ctx.fillStyle = '#d9c38a'; ctx.fillRect(600, 110, 92, 64);
  ctx.fillStyle = '#16121f'; ctx.fillRect(606, 116, 80, 52);
  ctx.fillStyle = '#ff8c00'; ctx.font = '900 15px system-ui'; ctx.fillText('SIMAS', 621, 148);
}

// ================= CAS =================
function cabecaCas(ctx, cx, cy, hh, expr, ang = 0, t = 0) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
  rostoCas(ctx, 0, 0, hh, expr, t);
  ctx.restore();
}

function drawCas(ctx, estado, t, k = 0) {
  if (estado === 'voando') {
    // k: 0 = cadeira, 1 = cama
    const x = 560 + (150 - 560) * k, y = 250 + (300 - 250) * k - Math.sin(k * Math.PI) * 110;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-k * 1.2);
    ctx.fillStyle = '#3b3f4a'; rr(ctx, -36, -10, 72, 70, 24); ctx.fill();
    ctx.strokeStyle = '#8a573f'; ctx.lineWidth = 13; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-52, -26); ctx.moveTo(30, 0); ctx.lineTo(52, -26); ctx.stroke();
    ctx.strokeStyle = '#2b3445'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(-14, 56); ctx.lineTo(-24, 84); ctx.moveTo(14, 56); ctx.lineTo(26, 80); ctx.stroke();
    rostoCas(ctx, 0, -50, 84, 'susto', t);
    ctx.restore();
    // rastro
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 3;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + i * 18 * (k < 1 ? 1 : -1), y - 20 + i * 8); ctx.lineTo(x + i * 18 + 24, y - 20 + i * 8); ctx.stroke(); }
    return;
  }
  if (estado === 'dormindo') {
    // deitado na cama, coberto até o pescoço
    ctx.fillStyle = '#2f5d9e';
    rr(ctx, 120, 306, 228, 56, 22); ctx.fill();                       // corpo debaixo do cobertor
    ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 4; i++) ctx.fillRect(150 + i * 46, 312, 18, 44);
    const resp = Math.sin(t / 700) * 1.5;                             // respirando
    cabecaCas(ctx, 104, 290, 74, 'dormindo', -0.35, t);
    ctx.fillStyle = '#2b5490'; rr(ctx, 128, 306 - resp, 190, 24, 12); ctx.fill();   // dobra do cobertor no queixo
    // Zzz
    ctx.fillStyle = '#cfe3ff'; ctx.font = '900 18px system-ui';
    for (let i = 0; i < 3; i++) {
      const f = ((t / 1600) + i / 3) % 1;
      ctx.globalAlpha = 1 - f; ctx.font = `900 ${14 + i * 4}px system-ui`;
      ctx.fillText('z', 130 + f * 40 + i * 12, 250 - f * 50 - i * 8);
    }
    ctx.globalAlpha = 1;
    return;
  }
  // sentado jogando (ou pego no flagra)
  const pego = estado === 'pego';
  const tre = pego ? Math.sin(t / 25) * 1.5 : 0;                       // tremendo de medo
  ctx.save(); ctx.translate(tre, 0);
  // pernas
  ctx.fillStyle = '#2b3445';
  rr(ctx, 528, 296, 74, 24, 10); ctx.fill();
  rr(ctx, 584, 300, 22, 72, 9); ctx.fill();
  ctx.fillStyle = '#ddd'; rr(ctx, 580, 366, 34, 12, 5); ctx.fill();   // chinelo
  // corpo (camiseta)
  ctx.fillStyle = '#3b3f4a';
  rr(ctx, 520, 222, 78, 86, 26); ctx.fill();
  ctx.fillStyle = '#ff8c00'; ctx.font = '900 12px system-ui'; ctx.fillText('SIMAS', 536, 268);
  // braço indo pro teclado
  const dig = pego ? 0 : Math.sin(t / 60) * 2;
  ctx.strokeStyle = '#8a573f'; ctx.lineWidth = 15; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(575, 240); ctx.lineTo(600, 274); ctx.lineTo(626 + dig, 284); ctx.stroke();
  if (pego) { ctx.beginPath(); ctx.moveTo(530, 240); ctx.lineTo(512, 205); ctx.stroke(); }   // mão pra cima
  // cabeça
  const balanca = pego ? 0 : Math.sin(t / 400) * .03;
  cabecaCas(ctx, 560, 180, 96, pego ? 'susto' : 'jogando', balanca, t);
  // luz do monitor nele
  if (pego) {
    ctx.fillStyle = '#7fd3ff';
    [[606, 150], [612, 172]].forEach(([gx, gy], i) => {                 // gota de suor
      const y = gy + ((t / 8 + i * 40) % 40);
      ctx.beginPath(); ctx.moveTo(gx, y - 8); ctx.quadraticCurveTo(gx + 6, y, gx, y + 4); ctx.quadraticCurveTo(gx - 6, y, gx, y - 8); ctx.fill();
    });
    ctx.fillStyle = '#ffed00'; ctx.font = '900 34px system-ui'; ctx.fillText('!!', 528, 124);
  }
  ctx.restore();
}

// ================= ANA =================
function cabecaAna(ctx, cx, cy, hh, expr, ang = 0, t = 0) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
  rostoAna(ctx, 0, 0, hh, expr, t);
  ctx.restore();
}

function corpoAna(ctx, x, y, brava, t) {
  // x = centro, y = pés no chão
  // pernas (calça)
  ctx.fillStyle = '#26334d';
  rr(ctx, x - 22, y - 92, 20, 92, 8); ctx.fill();
  rr(ctx, x + 2, y - 92, 20, 92, 8); ctx.fill();
  ctx.fillStyle = '#f2a7c3'; rr(ctx, x - 26, y - 8, 26, 10, 5); ctx.fill(); rr(ctx, x, y - 8, 26, 10, 5); ctx.fill();   // pantufa
  // corpo (blusa)
  ctx.fillStyle = '#d94f8a';
  rr(ctx, x - 34, y - 176, 68, 92, 24); ctx.fill();
  // braços
  ctx.strokeStyle = '#c98f6b'; ctx.lineWidth = 13; ctx.lineCap = 'round';
  if (brava) {   // mão na cintura
    ctx.beginPath(); ctx.moveTo(x - 30, y - 160); ctx.lineTo(x - 56, y - 128); ctx.lineTo(x - 30, y - 104); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 30, y - 160); ctx.lineTo(x + 56, y - 128); ctx.lineTo(x + 30, y - 104); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(x - 30, y - 160); ctx.lineTo(x - 40, y - 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 30, y - 160); ctx.lineTo(x + 40, y - 100); ctx.stroke();
  }
}

function balaoQ(ctx, txt, bx, by, lado = -1, cor = '#fff') {
  ctx.font = '900 18px system-ui';
  const w = ctx.measureText(txt).width + 26, h = 38;
  const x0 = lado < 0 ? bx - w : bx, y0 = by - h;
  ctx.fillStyle = cor; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5;
  rr(ctx, x0, y0, w, h, 14); ctx.fill(); ctx.stroke();
  const tx = lado < 0 ? x0 + w - 26 : x0 + 26;
  ctx.beginPath(); ctx.moveTo(tx - 8, y0 + h); ctx.lineTo(tx + lado * -14, y0 + h + 18); ctx.lineTo(tx + 8, y0 + h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx - 10, y0 + h - 2); ctx.lineTo(tx + lado * -14, y0 + h + 18); ctx.lineTo(tx + 10, y0 + h - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#111'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x0 + 13, y0 + h / 2 + 1); ctx.textBaseline = 'alphabetic';
}

function drawAna(ctx, estado, t) {
  if (estado === 'espiando') {
    // só a cabeça e a mão aparecendo na fresta da porta
    cabecaAna(ctx, 818, 214, 92, 'desconfiada', -0.12, t);
    ctx.fillStyle = '#c98f6b'; rr(ctx, 790, 258, 14, 22, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '900 22px system-ui'; ctx.fillText('?', 770, 170);
    return;
  }
  const brava = estado === 'brava';
  const x = 836, y = PISO + 4;
  if (brava) {   // aura vermelha
    const a = ctx.createRadialGradient(x, y - 150, 10, x, y - 150, 150);
    a.addColorStop(0, 'rgba(255,40,40,.45)'); a.addColorStop(1, 'rgba(255,40,40,0)');
    ctx.fillStyle = a; ctx.fillRect(x - 160, y - 310, 320, 320);
  }
  const pisa = estado === 'entrando' ? Math.sin(t / 120) * 2 : 0;
  ctx.save(); ctx.translate(0, pisa);
  corpoAna(ctx, x, y, brava, t);
  cabecaAna(ctx, x + 2, y - 228, 104, brava ? 'brava' : (estado === 'deboa' ? 'feliz' : 'desconfiada'), brava ? Math.sin(t / 40) * .04 : 0, t);
  ctx.restore();
  if (brava) {
    ctx.fillStyle = '#ff2b2b'; ctx.font = '900 30px system-ui'; ctx.fillText('💢', x + 30, y - 278);
    // fumacinha
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3;
    for (let i = 0; i < 2; i++) {
      const f = ((t / 500) + i / 2) % 1; ctx.globalAlpha = 1 - f;
      ctx.beginPath(); const sx = x - 40 + i * 80, sy = y - 284 - f * 30;
      ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx - 8, sy - 10, sx, sy - 20); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    balaoQ(ctx, 'CAS!!! TU TAVA JOGANDO?!', x - 56, y - 292, -1, '#ffe2e2');
  }
  if (estado === 'deboa') balaoQ(ctx, 'dormindo, que anjinho 🥰', x - 56, y - 292, -1);
}

// Rostos 2D (desenhados, sem foto) do Cas e da Ana.
//   rostoCas(ctx, cx, cy, tam, expr, t)   expr: 'normal' | 'jogando' | 'dormindo' | 'susto'
//   rostoAna(ctx, cx, cy, tam, expr, t)   expr: 'normal' | 'desconfiada' | 'brava' | 'feliz'
// cx,cy = centro do rosto; tam = altura aproximada da cabeça em px.
// Desenhado numa grade de ~100 unidades de altura e escalado.

function _el(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }

// ======================= CAS =======================
function rostoCas(ctx, cx, cy, tam, expr = 'normal', t = 0) {
  const PELE = '#8a573f', PELE2 = '#73452f', PELE3 = '#a06a50', CAB = '#17110e', BARBA = '#231812';
  ctx.save(); ctx.translate(cx, cy); ctx.scale(tam / 112, tam / 112);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // pescoço + correntinha
  ctx.fillStyle = PELE2; ctx.fillRect(-22, 38, 44, 30);
  ctx.strokeStyle = '#d9dde3'; ctx.lineWidth = 2.2;
  ctx.setLineDash([2.5, 1.5]);
  ctx.beginPath(); ctx.moveTo(-21, 56); ctx.quadraticCurveTo(0, 70, 21, 56); ctx.stroke();
  ctx.setLineDash([]);

  // orelhas
  ctx.fillStyle = PELE2;
  _el(ctx, -47, 2, 8, 12); ctx.fill(); _el(ctx, 47, 2, 8, 12); ctx.fill();
  ctx.fillStyle = PELE; _el(ctx, -46, 2, 5, 8); ctx.fill(); _el(ctx, 46, 2, 5, 8); ctx.fill();

  // cabeça (redondona, bochechuda embaixo)
  ctx.fillStyle = PELE;
  ctx.beginPath();
  ctx.moveTo(-44, -14);
  ctx.bezierCurveTo(-46, -52, 46, -52, 44, -14);
  ctx.bezierCurveTo(48, 14, 44, 38, 22, 48);
  ctx.quadraticCurveTo(0, 56, -22, 48);
  ctx.bezierCurveTo(-44, 38, -48, 14, -44, -14);
  ctx.fill();
  // sombra nas laterais
  ctx.fillStyle = 'rgba(0,0,0,.08)';
  ctx.beginPath(); ctx.moveTo(30, -30); ctx.bezierCurveTo(48, -10, 46, 30, 20, 47); ctx.quadraticCurveTo(38, 20, 30, -30); ctx.fill();

  // barba (queixo + bochecha baixa) e bigode
  ctx.fillStyle = BARBA; ctx.globalAlpha = .62;
  ctx.beginPath();
  ctx.moveTo(-43, 12);
  ctx.quadraticCurveTo(-40, 30, -26, 43);
  ctx.quadraticCurveTo(0, 57, 26, 43);
  ctx.quadraticCurveTo(40, 30, 43, 12);
  ctx.quadraticCurveTo(36, 30, 20, 35);
  ctx.quadraticCurveTo(0, 40, -20, 35);
  ctx.quadraticCurveTo(-36, 30, -43, 12);
  ctx.fill();
  // cavanhaque descendo do lábio
  ctx.beginPath(); ctx.moveTo(-7, 33); ctx.quadraticCurveTo(0, 36, 7, 33); ctx.lineTo(9, 47); ctx.lineTo(-9, 47); ctx.fill();
  ctx.globalAlpha = 1;
  // pontinhos de barba (textura)
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI, r = 34 + (i % 3) * 4; ctx.fillRect(Math.cos(a) * r * .95, 26 + Math.sin(a) * 18 - 4, 1.4, 1.4); }

  // cabelo crespo curto (topo) com degradê nas laterais
  ctx.fillStyle = CAB;
  ctx.beginPath();
  ctx.moveTo(-44, -12);
  ctx.bezierCurveTo(-48, -44, -20, -58, 4, -56);
  ctx.bezierCurveTo(30, -56, 48, -42, 44, -12);
  ctx.quadraticCurveTo(40, -26, 30, -32);
  ctx.quadraticCurveTo(0, -40, -30, -32);
  ctx.quadraticCurveTo(-40, -26, -44, -12);
  ctx.fill();
  for (let i = 0; i < 13; i++) {          // cachinhos no topo
    const a = Math.PI + (i / 12) * Math.PI;
    _el(ctx, Math.cos(a) * 38, -30 + Math.sin(a) * 25, 7, 6); ctx.fill();
  }
  ctx.fillStyle = 'rgba(23,17,14,.45)';    // degradê
  ctx.fillRect(-45, -16, 6, 14); ctx.fillRect(39, -16, 6, 14);

  // sobrancelhas
  const sob = expr === 'susto' ? -8 : (expr === 'jogando' ? 2 : 0);
  ctx.strokeStyle = CAB; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-33, -17 + sob); ctx.quadraticCurveTo(-21, -22 + sob, -9, -17 + sob + (expr === 'jogando' ? 2 : 0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9, -17 + sob + (expr === 'jogando' ? 2 : 0)); ctx.quadraticCurveTo(21, -22 + sob, 33, -17 + sob); ctx.stroke();

  // olhos
  [-20, 20].forEach(ex => {
    if (expr === 'dormindo') {
      ctx.strokeStyle = '#2a1a14'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(ex - 8, -4); ctx.quadraticCurveTo(ex, 2, ex + 8, -4); ctx.stroke();
      return;
    }
    const aberto = expr === 'susto' ? 6.5 : 3.6;     // normalmente meio sonolento
    ctx.fillStyle = '#fff'; _el(ctx, ex, -3, 7.5, aberto); ctx.fill();
    ctx.fillStyle = '#2b1810'; _el(ctx, ex + (expr === 'jogando' ? 2 : 0), -3, expr === 'susto' ? 2.6 : 3.4, Math.min(aberto, 3.4)); ctx.fill();
    if (expr !== 'susto') { ctx.fillStyle = PELE; ctx.fillRect(ex - 9, -9.5, 18, 4.2); }   // pálpebra caída
    ctx.strokeStyle = '#2a1a14'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(ex - 8, -3 - aberto + (expr === 'susto' ? 0 : 1.6)); ctx.lineTo(ex + 8, -3 - aberto + (expr === 'susto' ? 0 : 1.6)); ctx.stroke();
  });

  // óculos redondos (armação marrom translúcida)
  ctx.strokeStyle = '#a8735a'; ctx.lineWidth = 3.4;
  ctx.fillStyle = 'rgba(150,190,255,.16)';
  _el(ctx, -20, -3, 15, 13); ctx.fill(); ctx.stroke();
  _el(ctx, 20, -3, 15, 13); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-5, -6); ctx.quadraticCurveTo(0, -9, 5, -6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-35, -6); ctx.lineTo(-45, -8); ctx.moveTo(35, -6); ctx.lineTo(45, -8); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;   // reflexo
  ctx.beginPath(); ctx.arc(-24, -7, 8, 3.6, 4.4); ctx.stroke();
  ctx.beginPath(); ctx.arc(16, -7, 8, 3.6, 4.4); ctx.stroke();

  ctx.fillStyle = '#3d2419'; ctx.beginPath(); ctx.arc(-25, 13, 1.3, 0, 7); ctx.fill();   // pintinha na bochecha
  // nariz largo + piercing no septo
  ctx.fillStyle = PELE3; _el(ctx, 0, 10, 9, 7); ctx.fill();
  ctx.fillStyle = PELE2; _el(ctx, -6, 13, 3.5, 2.4); ctx.fill(); _el(ctx, 6, 13, 3.5, 2.4); ctx.fill();
  ctx.strokeStyle = PELE2; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-3, -2); ctx.quadraticCurveTo(-5, 6, -9, 10); ctx.stroke();
  ctx.strokeStyle = '#e6e9ee'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(0, 15.5, 3, 0.2, Math.PI - 0.2); ctx.stroke();

  // bigode
  ctx.fillStyle = BARBA; ctx.globalAlpha = .7;
  ctx.beginPath(); ctx.moveTo(-14, 22); ctx.quadraticCurveTo(0, 15, 14, 22); ctx.quadraticCurveTo(0, 19.5, -14, 22); ctx.fill();
  ctx.fillRect(-12, 19.5, 24, 2.2);
  ctx.globalAlpha = 1;

  // boca
  if (expr === 'susto') {
    ctx.fillStyle = '#3a1612'; _el(ctx, 0, 30, 6, 7); ctx.fill();
  } else if (expr === 'dormindo') {
    ctx.fillStyle = '#4a201a'; _el(ctx, 2, 28, 4, 2.6); ctx.fill();
    // babinha
    const b = (Math.sin(t / 600) + 1) * 2;
    ctx.fillStyle = 'rgba(180,220,255,.8)'; _el(ctx, 7, 31 + b, 1.6, 2.4 + b * .4); ctx.fill();
  } else {
    ctx.fillStyle = '#9a5a4c';
    ctx.beginPath(); ctx.moveTo(-11, 26); ctx.quadraticCurveTo(0, expr === 'jogando' ? 33 : 31, 11, 26); ctx.quadraticCurveTo(0, 27, -11, 26); ctx.fill();
    ctx.fillStyle = '#7d4438';
    ctx.beginPath(); ctx.moveTo(-11, 26); ctx.quadraticCurveTo(-4, 23, 0, 24.5); ctx.quadraticCurveTo(4, 23, 11, 26); ctx.quadraticCurveTo(0, 27, -11, 26); ctx.fill();
    ctx.strokeStyle = '#4d2720'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-10, 26); ctx.quadraticCurveTo(0, 27.5, 10, 26); ctx.stroke();
  }
  ctx.restore();
}

// ======================= ANA =======================
function rostoAna(ctx, cx, cy, tam, expr = 'normal', t = 0) {
  const PELE = '#c98f6b', PELE2 = '#b37a58', CAB = '#120e0c', CACHO = '#c06f2f', CACHO2 = '#e08d45', CACHO3 = '#8f4e1f';
  ctx.save(); ctx.translate(cx, cy); ctx.scale(tam / 112, tam / 112);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // rabo de cavalo cacheado (atrás, do lado esquerdo)
  const balanco = Math.sin(t / 500) * 1.5;
  const cachos = [[-40, -26, 12], [-50, -14, 13], [-56, 0, 13], [-58, 14, 13], [-56, 28, 12], [-60, 40, 11], [-52, 50, 11],
                  [-62, 54, 9], [-46, 60, 9], [-44, -6, 11], [-46, 18, 11], [-44, 36, 10], [-66, 24, 9], [-64, 4, 9]];
  // massa do rabo
  ctx.fillStyle = CACHO3;
  ctx.beginPath();
  ctx.moveTo(-34, -34);
  ctx.bezierCurveTo(-62, -36, -74, 10, -70 + balanco, 40);
  ctx.bezierCurveTo(-68 + balanco, 64, -46 + balanco, 72, -38, 56);
  ctx.bezierCurveTo(-36, 30, -32, 0, -30, -20);
  ctx.closePath(); ctx.fill();
  // cachinhos (molas)
  cachos.forEach(([x, y, r], i) => {
    const bx = x + balanco * (y + 30) / 60;
    ctx.fillStyle = [CACHO, CACHO2, CACHO][i % 3]; _el(ctx, bx, y, r * .82, r * .72); ctx.fill();
    ctx.strokeStyle = CACHO3; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let a = 0; a < 9; a += .35) { const rr2 = r * .62 * (1 - a / 12); ctx.lineTo(bx + Math.cos(a + i) * rr2, y + Math.sin(a + i) * rr2 * .8); }
    ctx.stroke();
  });
  // elástico
  ctx.fillStyle = '#1b1b1b'; _el(ctx, -34, -28, 4, 6, .5); ctx.fill();

  // pescoço + colarzinho
  ctx.fillStyle = PELE2; ctx.fillRect(-16, 38, 32, 28);
  ctx.strokeStyle = '#e3e6ea'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-17, 50); ctx.quadraticCurveTo(0, 66, 17, 50); ctx.stroke();

  // orelha esquerda com argolinhas
  ctx.fillStyle = PELE2; _el(ctx, -39, 4, 6.5, 11); ctx.fill();
  ctx.strokeStyle = '#d8dce2'; ctx.lineWidth = 1.6;
  [[-42, 8, 3.2], [-41, 13, 3], [-38, 15.5, 3]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y + r, r, 0, Math.PI * 2); ctx.stroke(); });
  ctx.beginPath(); ctx.arc(-38, -4, 2.2, 0, Math.PI * 2); ctx.stroke();

  // rosto oval
  ctx.fillStyle = PELE;
  ctx.beginPath();
  ctx.moveTo(-37, -10);
  ctx.bezierCurveTo(-38, -50, 38, -50, 37, -10);
  ctx.bezierCurveTo(38, 18, 26, 42, 4, 48);
  ctx.quadraticCurveTo(-2, 49, -8, 47);
  ctx.bezierCurveTo(-28, 40, -38, 18, -37, -10);
  ctx.fill();
  // bochechas
  ctx.fillStyle = expr === 'brava' ? 'rgba(230,40,40,.35)' : 'rgba(235,110,110,.22)';
  _el(ctx, -22, 16, 9, 6); ctx.fill(); _el(ctx, 22, 16, 9, 6); ctx.fill();
  // sardinhas
  ctx.fillStyle = 'rgba(120,70,40,.35)';
  [[-12, 8], [-16, 11], [-9, 12], [12, 8], [16, 11], [9, 12], [-4, 6], [4, 6]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, .9, 0, 7); ctx.fill(); });

  // cabelo puxado pra trás, liso e brilhante
  ctx.fillStyle = CAB;
  ctx.beginPath();
  ctx.moveTo(-39, -2);
  ctx.bezierCurveTo(-45, -62, 45, -62, 39, -2);
  ctx.quadraticCurveTo(37, -12, 32, -20);
  ctx.quadraticCurveTo(18, -35, 0, -35);
  ctx.quadraticCurveTo(-18, -35, -32, -20);
  ctx.quadraticCurveTo(-37, -12, -39, -2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;   // brilho do gel
  [[-26, -36, -6, -46], [-12, -38, 12, -47], [4, -40, 26, -38]].forEach(([a, b, c, d]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c) / 2, d - 3, c, d + 4); ctx.stroke(); });
  // baby hair na têmpora
  ctx.strokeStyle = CAB; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-33, -16); ctx.quadraticCurveTo(-29, -12, -32, -8); ctx.quadraticCurveTo(-35, -4, -31, -1); ctx.stroke();

  // pintinha na testa
  ctx.fillStyle = '#5a3322'; ctx.beginPath(); ctx.arc(5, -24, 1.4, 0, 7); ctx.fill();

  // sobrancelhas grossas e arqueadas
  ctx.fillStyle = CAB;
  const sobr = (lado, ang, dy) => {
    ctx.save(); ctx.translate(lado * 18, -15 + dy); ctx.rotate(ang * lado);
    ctx.beginPath(); ctx.moveTo(-lado * 12, 3); ctx.quadraticCurveTo(-lado * 2, -5, lado * 12, 0);
    ctx.quadraticCurveTo(lado * 2, -1.5, -lado * 12, 5.5); ctx.fill(); ctx.restore();
  };
  if (expr === 'brava') { sobr(-1, -.35, 2); sobr(1, -.35, 2); }
  else if (expr === 'desconfiada') { sobr(-1, -.05, 1); sobr(1, .2, -4); }
  else if (expr === 'feliz') { sobr(-1, .05, -3); sobr(1, .05, -3); }
  else { sobr(-1, 0, 0); sobr(1, 0, 0); }

  // olhos amendoados com delineado gatinho
  [-1, 1].forEach(l => {
    const ex = l * 17, ey = -2;
    if (expr === 'feliz') {
      ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(ex - 8, ey + 2); ctx.quadraticCurveTo(ex, ey - 6, ex + 8, ey + 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + l * 8, ey + 1); ctx.lineTo(ex + l * 12, ey - 3); ctx.stroke();
      return;
    }
    const alt = expr === 'desconfiada' ? (l < 0 ? 2.2 : 4) : (expr === 'brava' ? 3.4 : 4.4);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(ex - 8, ey); ctx.quadraticCurveTo(ex, ey - alt * 1.4, ex + 8, ey); ctx.quadraticCurveTo(ex, ey + alt, ex - 8, ey); ctx.fill();
    ctx.fillStyle = '#3a2216'; _el(ctx, ex + (expr === 'desconfiada' ? 2 : 0), ey - .4, 3.6, Math.min(3.6, alt)); ctx.fill();
    ctx.fillStyle = '#0d0907'; _el(ctx, ex + (expr === 'desconfiada' ? 2 : 0), ey - .4, 1.7, Math.min(1.7, alt)); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + 1.2, ey - 1.6, .9, 0, 7); ctx.fill();
    // delineado
    ctx.strokeStyle = '#0d0907'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(ex - l * 8, ey); ctx.quadraticCurveTo(ex, ey - alt * 1.4, ex + l * 8, ey - .5); ctx.lineTo(ex + l * 12.5, ey - 4); ctx.stroke();
  });

  // nariz com piercing
  ctx.strokeStyle = PELE2; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(2, -2); ctx.quadraticCurveTo(4, 8, 7, 12); ctx.stroke();
  ctx.fillStyle = PELE2; _el(ctx, -4, 14, 3, 1.8); ctx.fill(); _el(ctx, 5, 14, 3, 1.8); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; _el(ctx, 1, 8, 2, 4); ctx.fill();
  ctx.strokeStyle = '#e6e9ee'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(-8.5, 12.5, 2, -0.2, 2.9); ctx.stroke();

  // boca
  if (expr === 'brava') {
    ctx.fillStyle = '#5a1a1e';
    ctx.beginPath(); ctx.moveTo(-10, 30); ctx.quadraticCurveTo(0, 22, 10, 30); ctx.quadraticCurveTo(0, 36, -10, 30); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(-6, 26.5, 12, 2.4);
    ctx.strokeStyle = '#c26a72'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(-11, 30); ctx.quadraticCurveTo(0, 21, 11, 30); ctx.stroke();
  } else {
    const sorriso = expr === 'feliz' ? 6 : (expr === 'desconfiada' ? -1 : 2.5);
    const torto = expr === 'desconfiada' ? 3 : 1.5;
    ctx.fillStyle = '#d4848b';                                   // lábio de cima
    ctx.beginPath(); ctx.moveTo(-12, 26); ctx.quadraticCurveTo(-5, 20, 0, 23); ctx.quadraticCurveTo(5, 20, 12, 26 - torto);
    ctx.quadraticCurveTo(0, 26 + sorriso * .3, -12, 26); ctx.fill();
    ctx.fillStyle = '#e6a0a5';                                   // lábio de baixo (cheinho)
    ctx.beginPath(); ctx.moveTo(-12, 26); ctx.quadraticCurveTo(0, 26 + sorriso * .3, 12, 26 - torto);
    ctx.quadraticCurveTo(2, 36 + sorriso * .4, -12, 26); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; _el(ctx, 1, 30, 3.5, 1.2); ctx.fill();   // gloss
    ctx.strokeStyle = '#9c5359'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-12, 26); ctx.quadraticCurveTo(0, 26 + sorriso * .3, 12, 26 - torto); ctx.stroke();
  }
  ctx.restore();
}
