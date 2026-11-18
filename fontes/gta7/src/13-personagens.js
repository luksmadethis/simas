// =========================================================
// ESCOLHA DE PERSONAGEM: cada um da galera tem lore e um poder
// Quem tu escolhe vira o protagonista; o Nerivan assume o papel dele na história.
// =========================================================
let PERS = 'nerivan';
const PERSONAGENS = {
  nerivan: { nomes: ['Nerivan'], titulo: 'Rei da Engenharia Social', poder: 'golpe nas vovós rende o DOBRO e começa com R$ 500 a mais',
    lore: 'Nasceu ouvindo o barulho do telefone fixo da avó e entendeu ali o seu propósito. Aos 14 já tinha convencido 3 bancos de que era um banco. Rei do call center, rei do Fatal Model, acabou de sair da saidinha de fim de ano com uma missão: recuperar o wi-fi e a dignidade. Só o wi-fi, na real.' },
  luketa: { nomes: ['Luketa'], titulo: 'Beatmaker e Guia Oficial', poder: 'sente segredos por perto (aparecem no minimapa)',
    lore: 'Produtor de FL Studio, melhor amigo do Claude e amor da vida do Ltzin (contra a vontade dele). Sabe onde fica cada esquina de São Simas porque já se perdeu em todas. Dessa vez cansou de só narrar a história e resolveu viver ela.' },
  dudu: { nomes: ['Dudu'], titulo: 'Hacker de Sistemas', poder: 'a polícia esquece de ti 2x mais rápido',
    lore: 'Galanteador, viajante e muito conhecido pelas asiáticas. Hackeia caixa eletrônico com um pendrive de 8GB que ele chama de "Princesa". Quando o Ltzin derrubou o wi-fi dele, ele ficou 4 horas sem internet e isso nunca vai ser perdoado.' },
  cas: { nomes: ['Tio Cas', 'Cas'], titulo: 'DJ Muito Bem Casado', poder: 'regenera vida 2x mais rápido (descansado de tanto ficar na cadeira)',
    lore: 'Diz que tá trabalhando, mas todo mundo sabe que é mentira. Mixa sets mentalmente numa cadeira de balanço desde terça. A Ana grita "CAS!" em média 47 vezes por dia. Um dia ele levantou da cadeira, e é esse dia que tu vai jogar.' },
  alan: { nomes: ['Alan'], titulo: 'Desenhista Desvalorizado', poder: 'começa com skate e o skate é 15% mais rápido',
    lore: 'Desenha melhor que muito famoso por aí e ninguém valoriza. Skatista e marido nas horas vagas. Desenhou o mapa inteiro de São Simas num guardanapo e ninguém pagou. Agora vai cobrar na rua.' },
  yori: { nomes: ['Yori'], titulo: 'Agricultor e Produtor Rural', poder: 'imóveis rendem 50% a mais (safra recorde)',
    lore: 'Onde ele pisa nasce safra recorde. Alimenta o Brasil inteiro de Juazeiro, com uma Hilux e um óculos de quem leu muito. Fala "sô" mesmo sendo do sertão. Ninguém explica.' },
  nauj: { nomes: ['Nauj'], titulo: 'Teu Guia Favorito', poder: 'fôlego 3x maior (nada até a Indonésia)',
    lore: 'Alma de artista. Te leva aos lugares mais belos da cidade e jura que viu golfinho no Rio (era uma sacola). Paz, amor e um cheirinho suspeito de incenso. Pela primeira vez vai dirigir em vez de ir de carona.' },
  meco: { nomes: ['Meco'], titulo: 'O Neymar do Funk BH', poder: 'corre 25% mais rápido (pré-lesão)',
    lore: 'Se não tivesse lesionado tanto, seria uma lenda. Dono do baile mais pesado de BH, BH é quem? BH é nóis. Corre igual um raio até cair sozinho. Dessa vez promete não cair. Promete.' },
  gelado: { nomes: ['Segurança Gelado', 'Gelado'], titulo: 'Empresário e Magnata', poder: 'crimes geram metade das estrelas (ele conhece todo mundo)',
    lore: 'Não faz menos que R$500 por dia. Empresário, magnata, segurança nas horas vagas e galinha nas horas mais vagas ainda (longa história). Cansou de correr atrás dos outros e agora quer ver como é do outro lado.' },
  matt: { nomes: ['Matheus', 'Matt'], titulo: 'CEO, Artista e Humorista', poder: 'começa com fuzil e 60 balas',
    lore: 'Especialista em Claude. Criador de games, CEO, humorista nas horas vagas e piloto de robô gigante quando o Claude deixa. Pediu pro Claude um robô destruidor e ganhou um com testes unitários. Agora resolveu sair do laboratório.' },
  ltzin: { nomes: ['Ltzin'], titulo: 'O Rei de Recife', poder: 'soco dá CHOQUE (3x mais dano)',
    lore: 'Ele pode dar choque no seu sistema. Literalmente. Rei de Recife, dono do porto, do palácio e de um carro que solta raio. Ama o Luketa em silêncio (não é silêncio, ele fala pra todo mundo). Nessa versão, a coroa tá em jogo.' },
  poli: { nomes: ['Poli'], titulo: 'Especialista em Áudio', poder: 'ganha 25% a mais de pontos em tudo',
    lore: 'Ouvido absoluto e rei do entretenimento. Dono da Rádio Poli FM, onde toca só as do Popai. Consegue ouvir uma buzina de caminhão a 3 quarteirões e dizer a nota. Largou o microfone por um dia pra botar a mão na massa.' }
};
const nomePers = () => PERSONAGENS[PERS].nomes[PERSONAGENS[PERS].nomes.length - 1];
// troca os nomes no texto (Nerivan <-> personagem escolhido)
function trocaNomes(txt) {
  if (PERS === 'nerivan' || ONLINE.ativo || typeof txt !== 'string') return txt;
  const ns = PERSONAGENS[PERS].nomes;
  let t = txt.replace(/\bNerivan\b/g, '\u0001').replace(/\bNERIVAN\b/g, '\u0002');
  for (const n of ns) { t = t.split(n).join('\u0003'); t = t.split(n.toUpperCase()).join('\u0004'); }
  return t.replace(/\u0001/g, ns[ns.length - 1]).replace(/\u0002/g, ns[ns.length - 1].toUpperCase()).replace(/\u0003/g, 'Nerivan').replace(/\u0004/g, 'NERIVAN');
}
function aplicarPersonagem(id, novo) {
  PERS = PERSONAGENS[id] ? id : 'nerivan';
  const j = W.jog, v = VISUAL[PERS] || {};
  j.rosto = 'nerivan'; j.pers = PERS;
  if (novo) { j.pele = v.pele; j.cabelo = v.cabelo; j.corte = v.corte; if (v.oculos) { j.oculos = true; j.oculosTipo = v.oculos; } }
  j.pele = j.pele || v.pele; j.cabelo = j.cabelo || v.cabelo; j.corte = j.corte || v.corte;
  if (PERS !== 'nerivan') {
    // o escolhido vira protagonista: troca foto, nome e cor com o Nerivan em toda a história
    [ROSTOS.nerivan, ROSTOS[PERS]] = [ROSTOS[PERS], ROSTOS.nerivan];
    [NOMES.nerivan, NOMES[PERS]] = [NOMES[PERS], NOMES.nerivan];
    [COR_NOME.nerivan, COR_NOME[PERS]] = [COR_NOME[PERS], COR_NOME.nerivan];
  }
  if (novo) {
    if (PERS === 'nerivan') j.grana += 500;
    if (PERS === 'alan') { j.temRodas = { skate: true }; }
    if (PERS === 'matt') { j.tem.fuzil = true; j.municao.fuzil += 60; }
  }
}
// no ONLINE: cada um escolhe quem é (cara, visual e poder), sem mexer na história
function aplicarPersonagemOnline(id) {
  PERS = PERSONAGENS[id] ? id : 'nerivan';
  const j = W.jog, v = VISUAL[PERS] || {};
  j.pele = v.pele || j.pele; j.cabelo = v.cabelo || j.cabelo; j.corte = v.corte; if (v.oculos) { j.oculos = true; j.oculosTipo = v.oculos; }
  if (PERS === 'alan') { j.temRodas = { ...(j.temRodas || {}), skate: true }; }
  if (PERS === 'matt') { j.tem.fuzil = true; j.municao.fuzil = Math.max(j.municao.fuzil, 60); }
  if (PERS === 'nerivan') j.grana += 500;
}
function fichaPersonagem(id) {
  const p = PERSONAGENS[id] || PERSONAGENS.nerivan, foto = (typeof FOTOS !== 'undefined' && FOTOS[id]) || '';
  return `<img src="${foto}"><div><h3>${p.nomes[0]}</h3><b>${p.titulo}</b><p>${p.lore}</p><p class="poder">⚡ PODER: ${p.poder}</p><p class="poder">🎮 HABILIDADE (X): ${HABILIDADES[id] ? HABILIDADES[id].ic + ' ' + HABILIDADES[id].nome + ' — ' + HABILIDADES[id].desc : ''}</p></div>`;
}
function telaPersonagens(aoEscolher) {
  const el = document.getElementById('lobby'); el.style.display = 'flex';
  let sel = 'nerivan';
  const foto = k => (typeof FOTOS !== 'undefined' && FOTOS[k]) || '';
  const mostra = () => {
    const p = PERSONAGENS[sel];
    el.querySelector('.ficha').innerHTML = `<img src="${foto(sel)}"><div><h3>${p.nomes[0]}</h3><b>${p.titulo}</b><p>${p.lore}</p><p class="poder">⚡ PODER: ${p.poder}</p></div>`;
    el.querySelectorAll('.skins button').forEach(b => b.classList.toggle('on', b.dataset.s === sel));
  };
  el.innerHTML = `<div class="caixa"><h2>🎭 ESCOLHE TEU PERSONAGEM</h2><p class="sub">cada um tem uma história e um poder. quem tu não escolher continua na história (o Nerivan assume o papel de quem tu pegar).</p>
    <div class="skins">${Object.keys(PERSONAGENS).map(s => `<button data-s="${s}"><img src="${foto(s)}"><span>${PERSONAGENS[s].nomes[PERSONAGENS[s].nomes.length - 1]}</span></button>`).join('')}</div>
    <div class="ficha"></div><button class="vai">▶ JOGAR COM ELE</button><button class="volta">voltar</button></div>`;
  el.querySelectorAll('.skins button').forEach(b => b.onclick = () => { sel = b.dataset.s; mostra(); });
  el.querySelector('.volta').onclick = () => { el.style.display = 'none'; };
  el.querySelector('.vai').onclick = () => { el.style.display = 'none'; aoEscolher(sel); };
  mostra();
}
// =========================================================
// HABILIDADE ESPECIAL (tecla X / botão ⚡): uma única pra cada personagem
// =========================================================
const HABILIDADES = {
  nerivan: { nome: 'Ligação da Vovó', ic: '📞', cd: 40, desc: 'liga pra uma vovó e cai um PIX na hora' },
  luketa: { nome: 'Atalho do GPS', ic: '🧭', cd: 18, desc: 'se teletransporta uns metros pra onde tá olhando' },
  dudu: { nome: 'Hackeia a Polícia', ic: '💻', cd: 60, desc: 'zera as estrelas e trava as viaturas perto' },
  cas: { nome: 'Soneca na Cadeira', ic: '😴', cd: 45, desc: 'vida e colete cheios na hora' },
  alan: { nome: 'Manobra de Skate', ic: '🛹', cd: 25, desc: 'skate turbo por 6 segundos (atropela e derruba)' },
  yori: { nome: 'Chama a Hilux', ic: '🛻', cd: 50, desc: 'a Hilux de manga aparece do teu lado' },
  nauj: { nome: 'Incenso da Paz', ic: '🌿', cd: 40, desc: 'todo mundo em volta fica zen e para de brigar (tira 2 estrelas)' },
  meco: { nome: 'Arrancada do Neymar', ic: '⚡', cd: 20, desc: 'corre o dobro por 5 segundos (vai que não lesiona)' },
  gelado: { nome: 'Modo Galinha', ic: '🐔', cd: 50, desc: 'vira o Galado por 10s: a polícia não te reconhece' },
  matt: { nome: 'Laser do CLAUDE-BOT', ic: '🤖', cd: 22, desc: 'dispara uma rajada de laser pra onde mira' },
  ltzin: { nome: 'Choque Real', ic: '👑', cd: 25, desc: 'solta um choque em volta e derruba geral' },
  poli: { nome: 'Buzina do Sample', ic: '📯', cd: 30, desc: 'buzina absurda: carros freiam e o povo foge' }
};
function anguloMira() {
  const j = W.jog;
  if (MOUSE.used && !TOQUE.ativo) { const mw = telaPraMundo(MOUSE.x, MOUSE.y); return Math.atan2(mw.y - j.y, mw.x - j.x); }
  return j.carro ? j.carro.a : j.a;
}
function balaHab(x, y, ang, vel, dano, vida) { const j = W.jog, bl = { x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vida, dano, dono: j }; W.balas.push(bl); ONLINE.tiro(bl); }
function usarHabilidade() {
  const j = W.jog, h = HABILIDADES[PERS]; if (!h || j.morto) return;
  if ((j.habCd || 0) > 0) { CARRO_AVISO = { txt: `${h.ic} ${h.nome}: espera ${Math.ceil(j.habCd)}s`, t: 0 }; return; }
  const al = j.carro || j;
  let ok = true;
  switch (PERS) {
    case 'nerivan': { const g = rndi(300, 900); j.grana += g; SOM.grana(); falar('nerivan', pick(['alô vó? aqui é do banco...', 'vovó, teu neto tá preso, manda um PIX', 'oi tia, é o rapaz da Claro']), 2.5); W.efeitos.push({ t: 'texto', x: j.x, y: j.y - 40, txt: '+' + fmt$(g), vida: 1.6, max: 1.6, cor: '#7CFC00' }); break; }
    case 'luketa': {
      if (j.carro) { ok = false; break; }
      const a = anguloMira(); let d = 0; for (let k = 20; k <= 340; k += 20) { if (solidoEm(j.x + Math.cos(a) * k, j.y + Math.sin(a) * k)) break; d = k; }
      if (d < 40) { ok = false; break; }
      W.efeitos.push({ t: 'anel', x: j.x, y: j.y, r: 40, vida: 0.35, max: 0.35 }); j.x += Math.cos(a) * d; j.y += Math.sin(a) * d; W.efeitos.push({ t: 'anel', x: j.x, y: j.y, r: 40, vida: 0.35, max: 0.35 }); SOM.pega(); break;
    }
    case 'dudu': W.procurado = 0; W.calor = 0; for (const c of W.carros) if (c.ia && c.ia.tipo === 'policia' && dist(c.x, c.y, al.x, al.y) < 900) { c.vel = 0; c.vx = c.vy = 0; c.ia.hack = 8; W.efeitos.push({ t: 'texto', x: c.x, y: c.y - 30, txt: '💻 HACKEADO', vida: 2, max: 2, cor: '#00ff9c' }); } falar('dudu', 'sistema da polícia: deletado. princesa nunca falha', 2.5); break;
    case 'cas': j.hp = 100; j.colete = 100; if (j.carro) j.carro.hp = Math.max(j.carro.hp, j.carro.hpMax * 0.5); W.efeitos.push({ t: 'texto', x: j.x, y: j.y - 40, txt: '😴 zzz... recarregado', vida: 1.8, max: 1.8, cor: '#9fe' }); break;
    case 'alan': if (j.carro) { ok = false; break; } j.rodaAtiva = 'skate'; j.turbo = 6; j.turboMult = 1.7; j.atropela = 6; break;
    case 'yori': { const a = j.a + Math.PI / 2; let x = al.x + Math.cos(a) * 70, y = al.y + Math.sin(a) * 70; if (solidoEm(x, y)) { x = al.x - Math.cos(a) * 70; y = al.y - Math.sin(a) * 70; } if (solidoEm(x, y)) { ok = false; break; } const c = novoCarro('pickup', x, y, j.a, { cor: '#f1c40f', doJogador: true, motor: 2, blind: 1 }); c.nome = 'Hilux do Yori'; W.carros.push(c); W.efeitos.push({ t: 'fumaca', x, y, r: 30, vida: 0.6, max: 0.6 }); falar('yori', 'chegou a Hilux, sô. tem manga na caçamba', 2.5); break; }
    case 'nauj': W.procurado = Math.max(0, W.procurado - 2); W.calor = Math.min(W.calor, W.procurado * 10); for (const p of W.peds) if (!p.morto && dist(p.x, p.y, al.x, al.y) < 380) { p.hostil = false; p.bravo = false; p.medo = 0; p.zen = 8; } for (let k = 0; k < 8; k++) W.efeitos.push({ t: 'fumaca', x: al.x + rnd(-120, 120), y: al.y + rnd(-120, 120), r: rnd(18, 30), vida: 2, max: 2 }); W.efeitos.push({ t: 'texto', x: al.x, y: al.y - 40, txt: '🌿 paz e amor', vida: 2, max: 2, cor: '#a3e635' }); break;
    case 'meco': if (j.carro) { j.carro.nitroOn = true; j.carro.vel += 300; const c = j.carro; c.vx += Math.cos(c.a) * 400; c.vy += Math.sin(c.a) * 400; break; } j.turbo = 5; j.turboMult = 2; break;
    case 'gelado': if (j.carro) { ok = false; break; } j.galinha = true; j.galinhaT = 10; W.procurado = 0; W.calor = 0; W.efeitos.push({ t: 'fumaca', x: j.x, y: j.y, r: 30, vida: 0.6, max: 0.6 }); falar('gelado', 'pó pó pó... polícia? que polícia?', 2.5); break;
    case 'matt': { const a = anguloMira(); for (let k = -2; k <= 2; k++) balaHab(al.x + Math.cos(a) * 24, al.y + Math.sin(a) * 24, a + k * 0.07, 1300, 45, 0.5); W.efeitos.push({ t: 'laser', x: al.x, y: al.y - ALT_TIRO / INCL, x2: al.x + Math.cos(a) * 600, y2: al.y + Math.sin(a) * 600 - ALT_TIRO / INCL, vida: 0.25, max: 0.25 }); SOM.tiro('fuzil'); break; }
    case 'ltzin': for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; balaHab(al.x + Math.cos(a) * 30, al.y + Math.sin(a) * 30, a, 700, 34, 0.32); } W.efeitos.push({ t: 'anel', x: al.x, y: al.y, r: 220, vida: 0.4, max: 0.4 }); for (let k = 0; k < 6; k++) { const a = rnd(Math.PI * 2); W.efeitos.push({ t: 'raio', x: al.x, y: al.y, x2: al.x + Math.cos(a) * 200, y2: al.y + Math.sin(a) * 200, vida: 0.25, max: 0.25 }); } break;
    case 'poli': SOM.buzina('caminhao'); SOM.buzina('corneta'); for (let k = 0; k < 3; k++) W.efeitos.push({ t: 'onda', x: al.x, y: al.y, vida: 0.6 + k * 0.25, max: 0.6 + k * 0.25 }); for (const p of W.peds) if (!p.morto && dist(p.x, p.y, al.x, al.y) < 420) { p.medo = 6; p.perigoX = al.x; p.perigoY = al.y; if (p.hostil && dist(p.x, p.y, al.x, al.y) < 220) feriPed(p, 25, j); } for (const c of W.carros) if (c !== j.carro && c.ia && dist(c.x, c.y, al.x, al.y) < 420) { c.vel *= 0.1; c.vx *= 0.1; c.vy *= 0.1; } for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; balaHab(al.x, al.y, a, 500, 12, 0.35); } break;
  }
  if (!ok) { CARRO_AVISO = { txt: `${h.ic} ${h.nome}: não dá agora`, t: 0 }; return; }
  j.habCd = h.cd; CARRO_AVISO = { txt: `${h.ic} ${h.nome}!`, t: 0 }; SOM.pega();
}
function atualizaHabilidade(dt) {
  const j = W.jog;
  if (j.habCd > 0) j.habCd -= dt;
  if (j.turbo > 0) { j.turbo -= dt; if (j.turbo <= 0) { j.turboMult = 1; j.atropela = 0; } }
  if (j.galinhaT > 0) { j.galinhaT -= dt; W.procurado = 0; W.calor = 0; if (j.galinhaT <= 0) { j.galinha = false; W.efeitos.push({ t: 'fumaca', x: j.x, y: j.y, r: 30, vida: 0.6, max: 0.6 }); } }
  // skate turbo do Alan derruba quem tá no caminho
  if (j.atropela > 0 && !j.carro) for (const p of W.peds) if (!p.morto && dist(p.x, p.y, j.x, j.y) < 22) feriPed(p, 30, j);
  for (const c of W.carros) if (c.ia && c.ia.hack > 0) { c.ia.hack -= dt; c.vel = 0; c.vx *= 0.5; c.vy *= 0.5; }
}
function hudHabilidade(g, x, y, peq) {
  const h = HABILIDADES[PERS]; if (!h) return;
  const j = W.jog, pronto = !(j.habCd > 0), w = peq ? 132 : 164, hh = peq ? 22 : 26;
  g.fillStyle = 'rgba(10,8,20,.78)'; rr(g, x, y, w, hh, 8); g.fill(); g.strokeStyle = pronto ? '#00e5ff' : '#555'; g.lineWidth = 2; g.stroke();
  if (!pronto) { g.fillStyle = 'rgba(0,229,255,.25)'; rr(g, x, y, w * (1 - j.habCd / h.cd), hh, 8); g.fill(); }
  g.font = `bold ${peq ? 10 : 11}px system-ui`; g.textAlign = 'left';
  textoContorno(g, `${ehToque() ? '⚡' : 'X'} ${h.ic} ${pronto ? h.nome : Math.ceil(j.habCd) + 's'}`, x + 7, y + hh / 2 + 4, pronto ? '#fff' : '#999', 3);
}
