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
  return `<img src="${foto}"><div><h3>${p.nomes[0]}</h3><b>${p.titulo}</b><p>${p.lore}</p><p class="poder">⚡ PODER: ${p.poder}</p></div>`;
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
