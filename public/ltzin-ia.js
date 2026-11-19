// Ltzin IA: o assistente de inteligência artificial mais avançado do Simas.
// Toda pergunta passa por um processamento profundo e a resposta é sempre a mesma.
(function () {
  if (window.__ltzinIA) return; window.__ltzinIA = true;
  const FOTO = '/galera/ltzin.jpg';
  const css = `
#ltz-bolha{position:fixed;right:18px;bottom:18px;z-index:99990;width:62px;height:62px;border-radius:50%;border:3px solid transparent;background:linear-gradient(#0d0c12,#0d0c12) padding-box,linear-gradient(135deg,#e40303,#ff8c00,#ffed00,#008026,#004dff,#750787) border-box;padding:0;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.5);transition:transform .15s}
#ltz-bolha:hover{transform:scale(1.07)}
#ltz-bolha img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
#ltz-bolha .on{position:absolute;right:2px;bottom:2px;width:14px;height:14px;border-radius:50%;background:#2ecc71;border:2px solid #0d0c12}
#ltz-bolha .dica{position:absolute;right:72px;bottom:14px;white-space:nowrap;background:#fff;color:#111;font:700 13px system-ui,sans-serif;padding:7px 11px;border-radius:12px 12px 2px 12px;box-shadow:0 4px 14px rgba(0,0,0,.35);animation:ltzPula 2.4s infinite}
@keyframes ltzPula{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
#ltz-chat{position:fixed;right:18px;bottom:92px;z-index:99991;width:min(360px,calc(100vw - 24px));height:min(520px,calc(100vh - 120px));display:none;flex-direction:column;background:#15131d;border:1px solid #2c2838;border-radius:18px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,.6);font-family:system-ui,sans-serif;color:#eee}
#ltz-chat.aberto{display:flex;animation:ltzAbre .18s ease-out}
@keyframes ltzAbre{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
#ltz-chat header{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#1c1927;border-bottom:3px solid transparent;border-image:linear-gradient(90deg,#e40303,#ff8c00,#ffed00,#008026,#004dff,#750787) 1}
#ltz-chat header img{width:38px;height:38px;border-radius:50%;object-fit:cover}
#ltz-chat header b{display:block;font-size:15px}
#ltz-chat header small{color:#2ecc71;font-size:11px}
#ltz-chat header button{margin-left:auto;background:none;border:0;color:#aaa;font-size:22px;cursor:pointer;line-height:1}
#ltz-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
.ltz-m{max-width:82%;padding:9px 12px;border-radius:16px;font-size:14px;line-height:1.4;word-wrap:break-word;white-space:pre-wrap}
.ltz-m.ia{align-self:flex-start;background:#262236;border-bottom-left-radius:4px}
.ltz-m.eu{align-self:flex-end;background:linear-gradient(135deg,#ff2fa0,#7d3cff);color:#fff;border-bottom-right-radius:4px}
.ltz-pensa{align-self:flex-start;color:#aaa;font-size:13px;font-style:italic;display:flex;align-items:center;gap:6px}
.ltz-pensa i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#aaa;animation:ltzPonto 1s infinite}
.ltz-pensa i:nth-child(2){animation-delay:.15s}.ltz-pensa i:nth-child(3){animation-delay:.3s}
@keyframes ltzPonto{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}
#ltz-form{display:flex;gap:8px;padding:10px;border-top:1px solid #2c2838;background:#1c1927}
#ltz-form input{flex:1;min-width:0;background:#0d0c12;border:1px solid #333;border-radius:20px;color:#fff;padding:10px 14px;font-size:14px;outline:none}
#ltz-form input:focus{border-color:#ff6ec7}
#ltz-form button{background:#ff6ec7;border:0;border-radius:50%;width:40px;height:40px;color:#fff;font-size:17px;cursor:pointer;flex:none}
#ltz-form button:disabled{opacity:.4;cursor:default}
#ltz-rodape{text-align:center;font-size:10px;color:#666;padding:0 0 8px;background:#1c1927}
@media (max-width:520px){#ltz-bolha{width:54px;height:54px;right:12px;bottom:12px}#ltz-chat{right:12px;bottom:76px}#ltz-bolha .dica{display:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const bolha = document.createElement('button');
  bolha.id = 'ltz-bolha'; bolha.title = 'Ltzin IA';
  bolha.innerHTML = `<img src="${FOTO}" alt="Ltzin"><span class="on"></span>`;
  const chat = document.createElement('div');
  chat.id = 'ltz-chat';
  chat.innerHTML = `<header><img src="${FOTO}" alt=""><div><b>Ltzin IA</b><small>● online · modelo LTZ-7 Ultra</small></div><button aria-label="fechar">×</button></header>
<div id="ltz-msgs"></div>
<form id="ltz-form" autocomplete="off"><input placeholder="pergunta qualquer coisa pro Ltzin..." maxlength="400"><button type="submit" aria-label="enviar">➤</button></form>
<div id="ltz-rodape">o Ltzin IA pode cometer erros. ele nunca comete.</div>`;
  const montar = () => {
    document.body.appendChild(chat); document.body.appendChild(bolha);
    if (!sessionStorage.getItem('ltz-viu')) { const d = document.createElement('span'); d.className = 'dica'; d.textContent = 'pergunta pro Ltzin 🤖'; bolha.appendChild(d); }
  };
  if (document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);

  const msgs = chat.querySelector('#ltz-msgs'), form = chat.querySelector('#ltz-form'), inp = form.querySelector('input'), btn = form.querySelector('button');
  let ocupado = false, saudou = false;
  const add = (txt, quem) => { const m = document.createElement('div'); m.className = 'ltz-m ' + quem; m.textContent = txt; msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight; return m; };
  const abre = () => {
    chat.classList.add('aberto'); sessionStorage.setItem('ltz-viu', 1); const d = bolha.querySelector('.dica'); if (d) d.remove();
    if (!saudou) { saudou = true; add('E aí. Sou o Ltzin, a inteligência artificial do Simas. Pode perguntar qualquer coisa.', 'ia'); }
    if (matchMedia('(pointer:fine)').matches) setTimeout(() => inp.focus(), 50);
  };
  const fecha = () => chat.classList.remove('aberto');
  bolha.onclick = () => chat.classList.contains('aberto') ? fecha() : abre();
  chat.querySelector('header button').onclick = fecha;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && chat.classList.contains('aberto')) fecha(); });

  const FRASES_PENSA = ['pensando', 'analisando', 'consultando os universos', 'processando', 'calculando', 'refletindo profundamente'];
  form.onsubmit = e => {
    e.preventDefault();
    const txt = inp.value.trim(); if (!txt || ocupado) return;
    add(txt, 'eu'); inp.value = ''; ocupado = true; btn.disabled = true;
    const p = document.createElement('div'); p.className = 'ltz-pensa';
    const fr = FRASES_PENSA[Math.floor(Math.random() * FRASES_PENSA.length)];
    p.innerHTML = `<span>${fr}</span><i></i><i></i><i></i>`; msgs.appendChild(p); msgs.scrollTop = msgs.scrollHeight;
    // tempo aleatório entre 1,2s e 4,5s
    setTimeout(() => { p.remove(); add('Depende...', 'ia'); ocupado = false; btn.disabled = false; if (matchMedia('(pointer:fine)').matches) inp.focus(); }, 1200 + Math.random() * 3300);
  };
})();
