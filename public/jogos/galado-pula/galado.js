// Galado: a galinha-Gelado. Desenha o personagem num canvas.
// drawGalado(ctx, x, y, s, estado, t)
//  x,y = ponto do chão embaixo dos pés; s = escala (1 = ~110px de altura)
//  estado = 'correr' | 'pular' | 'parado' | 'morto'; t = tempo em ms
const GALADO_CABECA = new Image();
GALADO_CABECA.src = "/jogos/galado-pula/cabeca.webp?v=1";

function drawGalado(ctx, x, y, s, estado, t) {
  const fase = (t / 90) % (Math.PI * 2);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  if (estado === 'morto') { ctx.translate(0, -8); ctx.rotate(-0.35); }
  const pulo = estado === 'pular';
  const correndo = estado === 'correr';
  const balanco = correndo ? Math.abs(Math.sin(fase)) * -3 : 0;
  ctx.translate(0, balanco);

  // ---- rabo (penas de galo) ----
  const penas = [['#3b1f5c', -0.9], ['#1f5a40', -0.55], ['#8f2222', -0.2], ['#2a1840', 0.15]];
  penas.forEach(([cor, ang], i) => {
    ctx.save();
    ctx.translate(-24, -52);
    ctx.rotate(ang - 0.5 + (correndo ? Math.sin(fase + i) * 0.06 : 0));
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-9, -20, -3, -34 + i * 3);
    ctx.quadraticCurveTo(6, -24, 6, 0);
    ctx.fill();
    ctx.restore();
  });

  // ---- pernas ----
  ctx.strokeStyle = '#e8a317';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const perna = (px, ang) => {
    ctx.save();
    ctx.translate(px, -30);
    ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.stroke();
    // pé com 3 dedos
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 26); ctx.lineTo(9, 29);
    ctx.moveTo(0, 26); ctx.lineTo(7, 23);
    ctx.moveTo(0, 26); ctx.lineTo(-5, 29);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.restore();
  };
  if (pulo) { perna(-6, 0.9); perna(5, 0.7); }
  else if (correndo) { perna(-6, Math.sin(fase) * 0.6); perna(5, -Math.sin(fase) * 0.6); }
  else if (estado === 'morto') { perna(-6, -0.4); perna(5, 0.3); }
  else { perna(-6, 0); perna(5, 0); }

  // ---- corpo ----
  const g = ctx.createRadialGradient(-2, -54, 4, -4, -46, 30);
  g.addColorStop(0, '#e07a30');
  g.addColorStop(1, '#a8480f');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(-4, -46, 27, 20, -0.08, 0, Math.PI * 2);
  ctx.fill();
  // peito mais claro
  ctx.fillStyle = 'rgba(255,190,120,.35)';
  ctx.beginPath();
  ctx.ellipse(12, -42, 11, 14, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // ---- asa ----
  ctx.save();
  ctx.translate(-8, -50);
  ctx.rotate(pulo ? -0.9 + Math.sin(t / 50) * 0.35 : (correndo ? Math.sin(fase) * 0.15 : 0.1));
  ctx.fillStyle = '#7d3309';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-20, -4, -22, 8);
  ctx.quadraticCurveTo(-8, 16, 8, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-6, 4); ctx.lineTo(-17, 8);
  ctx.moveTo(-2, 7); ctx.lineTo(-12, 12);
  ctx.stroke();
  ctx.restore();

  // ---- pescoço de pena ----
  ctx.fillStyle = '#c8611c';
  ctx.beginPath();
  ctx.ellipse(13, -60, 17, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- cabeça (o rosto do Gelado) ----
  if (GALADO_CABECA.complete && GALADO_CABECA.naturalWidth) {
    const hw = 52, hh = hw * GALADO_CABECA.naturalHeight / GALADO_CABECA.naturalWidth;
    ctx.save();
    ctx.translate(14, -54);
    ctx.rotate(correndo ? Math.sin(fase * 2) * 0.04 : 0);
    ctx.drawImage(GALADO_CABECA, -hw / 2, -hh + 14, hw, hh);
    ctx.restore();
  }

  // ---- morto: estrelinhas ----
  if (estado === 'morto') {
    ctx.fillStyle = '#ffd400';
    ctx.font = 'bold 14px sans-serif';
    for (let i = 0; i < 3; i++) {
      const a = t / 300 + i * 2.1;
      ctx.fillText('★', 14 + Math.cos(a) * 22 - 5, -118 + Math.sin(a) * 6);
    }
  }
  ctx.restore();
}
