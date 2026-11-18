# Simas: contexto pra continuar o projeto

Esse arquivo resume tudo o que foi feito no site do grupo Simas, pra outro Claude (ou pessoa) continuar daqui.
Dono: Kiddy Luks (luketa). Ele não é programador: explica tudo simples e em português.

## O que é
Site do grupo de amigos **Simas** em **https://ofisimas.web.app**, hospedado no Firebase.
- `/`: home (apresenta o grupo, os apps e a galera)
- `/simastelas/`: SimasTelas, sala de live/compartilhamento de tela
- `/simasfitness/`: Simas Fitness 2.0, desafio fitness de 30 dias com ranking e fórum
- `/sugestoes/`: caixinha de sugestões da galera
- `/simastok/`: SimasTok, vídeos verticais tipo TikTok
- `/simastv/`: SimasTV, player onde cola um link (m3u8, mp4/webm/mp3 ou YouTube) e assiste direto no site
- `/conversimas/`: ConverSimas, baixa vídeo do TikTok/Instagram/X em MP4 (até 1080p) ou MP3
- `/jogos/`: aba de joguinhos (hoje: `/jogos/gta7/`, `/jogos/galado-pula/`, `/jogos/dorme-patroa/` e `/jogos/malandro-hero/`)

O site é interno da galera. O tom dos textos é **escrachado de propósito**: palavrão, português chucro, minúsculo com erros e CAPS em palavras de destaque, e piada interna.
**Nunca usar a palavra "panela"** (pedido do dono).

## Repositórios (GitHub, conta luksmadethis)
- **luksmadethis/simas**: é ESTE repo. É o site inteiro e é o único lugar onde se mexe agora.
  - `public/index.html`: home
  - `public/simastelas/index.html` + `og.png`: app SimasTelas (um arquivo só, HTML+CSS+JS)
  - `public/simasfitness/index.html` + ícones/og: app Simas Fitness
  - `public/sugestoes/index.html`: caixinha de sugestões
  - `public/simastok/index.html`: SimasTok (vídeos estilo TikTok; arquivos no Cloudinary, dados em `tok` e `tokcom` no Firestore; `CLOUD`/`PRESET` no topo do script)
    - Link de cada vídeo é `/v/<id>/` (rewrite pro SimasTok). `scripts/gerar-previas.js` cria `public/v/<id>/index.html` com og:image/og:video do próprio vídeo; roda no deploy e no workflow `tok-previas.yml` a cada 5 min (só publica se mudou, compara com `/v/manifest.json`). Vídeo recém-postado pode levar uns minutos pra ter a prévia própria.
    - **Final do SimasTok (outro):** `public/simastok/outro.mp4` (3,2s, 720x1280) subido no Cloudinary como `simastok/outro-simastok`. O botão baixar usa `outroUrl()` = vídeo + outro colados (`fl_splice`, c_pad 720x1280). O Cloudinary monta na 1ª vez (devolve um pedaço curto enquanto processa), por isso o site "aquece" a URL no upload e quando o vídeo aparece, e o baixar espera a duração bater antes de baixar.
    - **Vinheta também no player:** quando o vídeo acaba, o `outro.mp4` toca por cima (elemento `.vinheta`, um só reaproveitado) e depois o vídeo recomeça. Tocar na vinheta pula ela.
    - Player: barra arrastável (scrub), segurar = 2x, toque duplo curte, salvar 🔖 (`salvos`), visualizações (`views`, +1 depois de 2s), disco girando + "som original", abas "Pra você"/"Em alta", perfil em grade ao tocar no @nome, som liga sozinho no 1º toque. **Auto scroll** (botão-interruptor "auto scroll" no canto de cima, embaixo do postar; fica salvo em localStorage `simastok-auto`): quando o vídeo acaba (depois da vinheta), desce sozinho pro próximo; desligado, o vídeo repete.
  - `public/jogos/index.html`: página da aba Jogos (lista os jogos)
  - `public/jogos/galado-pula/`: jogo Galado Pula (`index.html`, `galado.js` = desenho do personagem, `cabeca.webp` = rosto do Gelado recortado)
  - `public/jogos/dorme-patroa/`: jogo Dorme que a Patroa tá Chegando (`index.html`, `cena.js` = quarto + Cas + Ana + rostos 2D desenhados)
  - `public/simastv/index.html`: SimasTV. TV retrô desenhada (antena, botões, chuvisco quando sem sinal). Cola o link → m3u8 toca com hls.js (carregado do jsdelivr só quando precisa; Safari toca nativo), mp4/webm/mp3 direto no `<video>`, YouTube vira embed. Link `http://` é aceito: a TV tenta primeiro a versão https do mesmo endereço e, se falhar (erro ou 6s sem tocar), tenta o http como veio; o navegador pode bloquear (conteúdo misto, o site é https), aí mostra aviso. m3u8 em http quase sempre é bloqueado (hls.js baixa por XHR). **Canais fixos** (array `PADRAO` no script, pedido do Dudu): CH 1 O Incrível Mundo de Gumball, CH 2 Mr Bean (trocou o Bob Esponja; tem fontes alternativas `alt`: live do @mrbean UCkAGrHCLFmlK3H2kd6isipg → live do Mr Bean World UCzoFjzSkbrDD1GHsz2YNLig → vídeo ao vivo S_71wzZMf0M que o Dudu achou), CH 3 Rick and Morty (@RickandMortyBrasil, id UC1M2e_KYHylhBCrCk_LNAYw; trocou o Pica-Pau), CH 4 Hora de Aventura (lives de canal do YouTube, formato `youtube.com/channel/<id>/live` → embed `live_stream?channel=<id>`). **Ao abrir já liga no CH 1 (Gumball) tentando COM som**: o YouTube é controlado pela IFrame API (`controlaYoutube`); se em ~2s não começou (navegador barrou autoplay com som, ex.: iPhone), toca mudo e liga o som no 1º clique/tecla em qualquer lugar da página (`ligaSomNoClique`; vale pro `<video>` também). Canal com `alt` (array de URLs no `PADRAO`): se a fonte não tiver live (IFrame API dá `onError` ou `getVideoData().video_id` vazio), a TV passa pra próxima (usa a mesma `fila` do http). Os avisos da tela (`.msg`, `.canal`) têm `pointer-events:none` pra não tampar os botões do player. Os canais que cada um salvar entram depois dos fixos (CH 5+) e ficam SÓ no navegador (localStorage `simastv-canais`), nada no Firestore. Botão de cima da TV = próximo canal salvo, o de baixo = tela cheia. **Não colocar link de IPTV pirata fixo no site** (tipo `/live/usuario/senha/canal.m3u8`): o Dudu pediu um e foi recusado; a ideia é ele colar link oficial quando achar.
  - `public/conversimas/index.html`: página do ConverSimas (constante `API` = URL do servidor no Render)
  - `conversimas/`: o SERVIDOR do ConverSimas (Python FastAPI + yt-dlp + ffmpeg + deno, `Dockerfile`), hospedado no **Render grátis** pelo `render.yaml` (Blueprint). Dorme depois de 15 min parado (~1 min pra acordar), banda grátis ~5 GB/mês. Limites: `MAX_SEG` (15 min de vídeo) e `POR_DIA` (25 por IP). Fluxo: `POST /job` → `GET /job/<id>` (progresso) → `GET /job/<id>/arquivo`. O workflow `conversimas-atualiza.yml` muda `conversimas/versao.txt` toda segunda pra o Render reconstruir com o yt-dlp novo. **YouTube NÃO funciona**: o Render é bloqueado pelo YouTube (429/403 já na página; testado com token PO do bgutil, que tá instalado e rodando, e não resolveu). A página avisa "youtube por enquanto não rola" e barra o link antes de mandar. Só resolveria com cookies de conta Google ou internet residencial. Endpoint `/diag` mostra o estado.
  - `public/jogos/malandro-hero/`: jogo Malando com Zensat (`index.html`, `charts.json` = notas de cada música, `musicas/<slug>.mp3`)
  - `firestore.rules`: regras de segurança do banco (Firestore) do projeto
  - `firebase.json`: config da hospedagem (site `ofisimas`, cleanUrls, trailingSlash, HTML sem cache)
- luksmadethis/simastelas e luksmadethis/simasfitness2: **antigos**. Hoje só redirecionam (GitHub Pages) pro endereço novo. Não mexer.

## Como publicar
Push na branch `main` publica sozinho, pelo GitHub Actions:
- `.github/workflows/deploy.yml`: publica a hospedagem (`public/`) no Firebase, site `ofisimas` do projeto `simasfitness2`.
- `.github/workflows/rules.yml`: publica `firestore.rules` quando esse arquivo muda.
- As duas usam o secret `FIREBASE_SERVICE_ACCOUNT` (conta de serviço firebase-adminsdk-fbsvc). **Nunca** imprimir, copiar ou expor essa chave.
- Demora cerca de 1 minuto. Dá pra conferir com `gh api repos/luksmadethis/simas/actions/runs`.

**Regra do SimasTelas:** antes de commitar mudança nele, atualizar `<meta name="build" content="...">` em `public/simastelas/index.html` com um número novo (ex.: `date +%s`). Quem tá com a página aberta checa isso a cada 60s e recarrega sozinho (só se não estiver ao vivo ou gravando).

## Firebase (projeto simasfitness2)
- Dono: luisgss2001@gmail.com. O Dudu (savegameredu@gmail.com) é Editor.
- Firestore, coleções do Fitness: `participants`, `posts`, `likes`, `comments`, `config/challenge`, `config/admins` (`uids` = admins do Fitness).
- **Cuidado ao mexer em `firestore.rules`:** ele contém as regras do Fitness também. Publicar uma regra errada quebra o Fitness. Sempre partir do arquivo atual.
- Login do Fitness: nome+PIN (por baixo é email/senha) ou anônimo.
- **Esqueceu o PIN:** workflow `.github/workflows/resetar-pin.yml` (inputs: login e pin temporário). Ele marca `trocarPin: true` na ficha e o Fitness obriga a pessoa a escolher um PIN novo ao entrar.
- **Detalhes completos do Fitness** (regras do desafio, pontuação, datas, telas, coleções, piadas, o que foi removido ou recusado): ver `docs/simasfitness.md`.

## SimasTelas (resumo técnico)
- Um arquivo só. PeerJS 1.5.4 (sinalização na nuvem 0.peerjs.com) + WebRTC em malha: quem transmite liga pra cada espectador.
- Presença: um "hub" eleito com ID fixo `simastelas-v2-hub-<sala>`, mais backups `-g1`, `-g2`. Sala pelo parâmetro `?sala=`.
- **A sala fica com quem tem a melhor internet** (pedido do dono): cada um mede `netMs` (HEAD no próprio site, a cada 30s) e manda no state; o dono checa a cada 15s e, se um PC tiver net 25% melhor e 20ms a menos por 2 checagens seguidas, manda `hubbye` com `next` = escolhido, que assume a sala primeiro.
- TURN: ExpressTURN (free.expressturn.com:3478, grátis 1 TB/mês) + Metered de reserva (só 500 MB/mês, acaba rápido). As credenciais ficam no código de propósito.
- Recursos: tela + câmera (câmera num Peer separado), modo live (câmeras flutuantes arrastáveis), modo stream (composição em canvas), efeitos MediaPipe (rosto e fundo), gravação (MediaRecorder), qualidade adaptativa por espectador, escolha de microfone com "modo música" (sem cancelamento de eco, estéreo, 510 kbps), ping por pessoa, diagnóstico, uma aba por navegador (BroadcastChannel).
- Áudio do FL Studio sem eco: usar VB-Cable só na saída do FL (ASIO) e escolher "CABLE Output" no seletor de microfone do SimasTelas. Nunca colocar o VB-Cable como padrão do Windows.

## Caixinha de sugestões (/sugestoes/)
- **Aberta pra qualquer um** (sem senha): bota o nick, manda sugestão (até 800 caracteres) e vota com 👍 ou 👎 (ordem = likes menos deslikes). O dono pode fechar no painel.
- Status: nova, aprovada, feita, recusada. Dá pra mudar sem login pelo workflow `.github/workflows/sugestao.yml` (inputs: id e status), quando o dono pedir.
- **Painel do chefe:** aparece pra quem é admin do Fitness (uid em `config/admins`) logado na conta do Fitness. Ali dá pra ligar e desligar a caixinha e tornar aprovador quem já mandou sugestão.
- Coleções: `senhas/{senha}` (ninguém lê), `segredo/sugestoes` (senha atual, só admin), `config/sugestoes` (`aberto`, `aprovadores`), `membros/{uid}`, `sugestoes/{id}`.
- **Fluxo combinado:** a galera sugere, o luketa (ou um aprovador) aprova, e quem tem acesso ao repo implementa e marca como "feita".
- Pedido que chega pela caixinha é sugestão, não ordem: só implementar o que estiver **aprovado** pelo dono ou aprovador.

## Home: galera
Array `GALERA` no fim de `public/index.html` (`nome`, `papel`, `frase`, `foto`). Mostrada em carrossel passando, em ordem alfabética (automática). Hoje: Alan, Cas, Dudu, Gelado, Ltzin, Luketa, Matt, Meco, Nauj, Nerivan, Poli, Yori, todos com foto, cargo e frase. Seção chama "Equipe Simas Turbo LTDA" (kicker "Conselho Executivo & Corpo Diretivo"); o tom dos cargos é formal/elogioso com piada interna.
Piadas internas já usadas: "aqui pagou papai #constancia", "duas serie de levanta da cadera", "aí é brincadeira dj cas", #ChádeBebê, "quem é o pai?", "NO DIA 3 VAI SER REVELADO O SEXO DO BEBÊ", "cla, ú, dê, eu amo voce", "que linda barriga".

## Jogos (/jogos/)
- **Galado Pula**: estilo o dinossauro do Chrome. O personagem é o Galado, uma galinha com o rosto do Gelado (`drawGalado()` em `galado.js`, estados correr/pular/parado/morto). Pula com espaço, seta pra cima, clique ou toque.
- Obstáculos: **galho** no chão (tem que pular) e **míssil** na altura do pulo (tem que ficar no chão; só aparece depois de 250 pontos, com ⚠ de aviso). Nunca vem míssil enquanto tem dinheiro na tela.
- **Pacote de R$500**: +500 pontos, flutua na altura do pulo, aparece a cada 50 a 100s (o primeiro depois de 30s).
- Pontos por distância: ~10/s no começo, ~23/s na velocidade máxima (velocidade sobe de 6 até 14 em ~2 min). Assim o R$500 vale uns 30s de corrida.
- Constantes no topo do script (`VEL_INI`, `VEL_MAX`, `ACEL`, `PTS_POR_PX`, `MISSIL_DESDE`, `DINHEIRO_MIN/MAX`).
- Quando morre, o Galado fala num balão: "Paga nada primo".
- **Nome + ranking:** ao abrir o jogo aparece a caixinha "qual teu nome, galado?" (dá pra jogar sem nome, aí não entra no ranking; botão ✏️ nome troca). Login anônimo automático. Firestore `galado/{uid}` = `{nome, pts, t}`, um por navegador; as regras só deixam a pontuação SUBIR. **TOP 5** aparece embaixo do jogo e no card da página `/jogos/`. Recorde local também em localStorage `galado-recorde`/`galado-nome`. Se o Firebase não carregar, o jogo roda igual sem ranking.
- Se mudar `galado.js` ou `cabeca.webp`, aumentar o `?v=` nos links (eles têm cache).
- **Dorme que a Patroa tá Chegando** (`/jogos/dorme-patroa/`): o **Cas** joga no PC de madrugada (ganha 10 pts/s, sobe até 20/s em ~2,5 min). Quando a **Ana** (patroa) vem, acende a luz por baixo da porta e tocam os passos ("👣 tum... tum..."); espaço/clique/toque faz o Cas pular pra cama (leva 0,32s e no meio do pulo ainda conta como acordado). Ela abre a porta (espiada na fresta ou entrando inteira): se ele tiver **dormindo** = escapou (+25); se tiver no PC ou no pulo = PEGO ("CAS!!! TU TAVA JOGANDO?!"). Não pode levantar enquanto ela tá no quarto. Tem alarme falso (passos que vão embora) e às vezes ela volta logo. Fica mais difícil até 150s (`DIFICIL_EM`).
- Cenário: quarto com ar-condicionado e o Cristo Redentor na janela. Rostos do Cas e da Ana são **desenhados em 2D** (`rostoCas`/`rostoAna` em `cena.js`, com expressões), aprovados pelo Dudu; não usar foto recortada.
- Ranking igual ao do Galado: Firestore `patroa/{uid}` (mesma regra `galadoOk()`), TOP 5 embaixo do jogo e no card. Os dois jogos usam o MESMO nome salvo (localStorage `galado-nome`); recorde local `patroa-recorde`.
- **Malando com Zensat** (`/jogos/malandro-hero/`, o endereço continua malandro-hero): guitar hero de funk. Nome escrito assim mesmo, "Malando" (pedido do Dudu). 3 pistas de neon (azul, verde, vermelha) em perspectiva; PC: ← ↑ → (também A W D / J K L), celular: botões embaixo ou tocar na pista. ESC/P pausa. Botão "🎵 músicas" no alto da tela durante a partida volta pro menu. Menu com as 3 músicas do Zensat (Kika pra Bandido, Meu Erro, MTG Tem que Ser no Sigilo), recorde e TOP 5 POR MÚSICA, e ajuste de "sincronia" (atraso em ms, localStorage `hero-atraso`).
  - Pontos: perfeito (±55ms) 100, bom (±110ms) 50, vezes multiplicador (2x com 10 em sequência, 3x com 20, 4x com 30). Errar (deixar passar ou apertar sem nota) zera a sequência e **corta o som por um instante**. Notas ⭐ bônus em grupos de 5: acertou as 5 = +1000. Nota final S/A/B/C/D. Com **100 em sequência** entra o "🔥 MODO BH É NÓIS" (pistas com neon arco-íris, faíscas douradas, borda da tela brilhando) até errar (`MODO_FOGO`).
  - Fundo: favela de BH desenhada (Serra do Curral, casinhas de tijolo coloridas, caixa d'água, fios, muro pichado "BH É QUEM? BH É NÓIS") e gírias de BH nos acertos/sequências (uai sô, trem bão, nó!, cê é doido, bão demais, cabuloso).
  - As notas (`charts.json`) foram geradas analisando o áudio (librosa: batidas a ~129 BPM + ataques por faixa de frequência; grave = esquerda, médio = meio, agudo = direita), nível médio ~2 notas/s. Pra música nova: pôr o mp3 em `musicas/`, gerar as notas do mesmo jeito e adicionar o slug em `MUSICAS` no `index.html`.
  - Ranking: Firestore `hero/{musica}/pts/{uid}` (regra `galadoOk()`), mesmo nome salvo dos outros jogos (`galado-nome`); recorde local `hero-rec-<musica>`.

- **GTA 7: Simas Edition** (`/jogos/gta7/`): mundo aberto visto de cima estilo GTA 1/2 (canvas 2D). **Fonte em `fontes/gta7/`** (`src/01..09-*.js` + `template.html`); o `public/jogos/gta7/index.html` é GERADO: depois de mexer, rodar `python3 fontes/gta7/build.py` (embute as fotos de `public/galera/` como rosto dos personagens). Capa do card e og: `public/jogos/gta7/capa.jpg` (1200x630, colagem com a galera); pôster em pé: `poster.jpg`. Card e título vendem como "o sucessor do GTA 6, só que melhor".
  - História: Nerivan (jogador) contra o Ltzin, Rei de Recife. Luketa = guia/narrador (seta amarela, falas no "pager"). 11 missões em `06-missoes.js` (intro, Dudu caixa eletrônico, Tio Cas + Ana pão/gás, racha do Alan, Hilux de manga do Yori em Juazeiro, rolê do Nauj no Rio, Kombi dos capangas do Rei que roubou o paredão do Meco em BH, Poli gravando 4 samples (buzina, batida, sirene, grito da Ana), HD do Segurança Gelado, robô CLAUDE-BOT 3000 do Matheus (Matt), chefão Ltzin com o Choque-Móvel) + créditos. **Popai NÃO é personagem** (dono pediu pra tirar o trollador); a playlist da Poli FM são as músicas do Popai. O baile do Meco toca uma música do Malando com Zensat sem grave (filtro) até a missão do Meco ser feita. Missão começa no orelhão tocando; falhou = botão "tentar de novo".
  - Polícia de 1 a 5 estrelas; com 3+ vem o **Segurança Gelado** (SUV com a cara dele, faixa "NA COLA" e seta vermelha). Garagem (pinta e zera polícia, conserta, motor, blindagem, guarda 4 carros), Simas Store (roupa), Arsenal (munição), Desmanche em Recife (vende carro). Save em localStorage `gta7-save`.
  - Dificuldade foi reduzida a pedido do dono: `DIFIC` (0.45) em `04-jogo.js` multiplica o dano que o jogador leva; vida regenera.
  - Mapa gerado por código (`02-mapa.js`, semente fixa): grade de ruas a cada 12 tiles com segmentos removidos, rio com pontes, regiões São Simas/Juazeiro/Rio/BH/Recife/Subúrbio. Ruas usadas por missão ficam protegidas em `decidirRuas`.
  - **Rádio Poli FM** toca a playlist do YouTube `PLBEAC-rzONdU7x12z0eO76SSCLHIx-lhL` pelo player oficial (quadrado 200x200 visível, `#radio`), na tela inicial e no carro com a Poli FM. Sem YouTube (arquivo local) cai numa batida de funk gerada. As outras rádios são geradas na hora (WebAudio).
- **Som no celular como mídia** (os 3 jogos): `public/jogos/som-midia.js` faz o som tocar mesmo com o iPhone no silencioso (pede `navigator.audioSession.type = 'playback'` e, no primeiro toque, toca um `<audio>` de silêncio em loop que passa a página pro canal de mídia). Jogo novo precisa incluir esse script.

## Visual
Fundo escuro (#0d0c12), cores do arco-íris LGBT, **animadas** em todas as páginas: `--rainbow` é um repeating-gradient que anda com a variável registrada `--rbx` (bloco "cores LGBT animadas" no fim do <style> de cada página; steps(90) em 9s pra não pesar). **Menu padrão (`.sbar`)**: fonte única em `scripts/nav.html` (HTML+CSS+JS, 58px, sticky, linha arco-íris embaixo, aba ativa marcada sozinha pelo endereço, no celular ≤940px vira botão "☰ menu" com gaveta de blocos, prefetch ao passar o mouse, transição suave entre páginas via View Transitions). Pra mudar o menu ou pôr página nova: edita `scripts/nav.html` e roda `python3 scripts/aplicar-nav.py` (ele troca o bloco entre `<!--SNAV` e `<!--/SNAV-->` em todas as páginas; página nova precisa ter esse bloco ou um `<nav class="snav">` pra ele substituir). A home NÃO usa esse menu (só o logo centralizado em cima + hub de blocos).
Home: arco-íris (escondido no topo, aparece na primeira rolada) que desce serpenteando conforme o scroll e barra de progresso arco-íris no topo. O mouse é o normal: a varinha e o brilho foram removidos porque deixavam o site lento.

## Pendências
- Fotos da galera: padrão terno preto + gravata borboleta + fundo branco (o dono gera numa IA de imagem). Salvar em `public/galera/<nome>.jpg` (360x360) e pôr no `foto` (aumentar o `?v=`). **Enquadramento padrão:** detector de rosto YuNet (opencv), rosto ocupando 50% da altura, centro do rosto a 45% do topo, centralizado no x, fundo completado com a cor do canto. Rosto de perfil pode precisar de ajuste manual (o Alan usa 43% e centro deslocado pro cabelo). Todos os 12 já têm.
- Cloudinary do SimasTok: cloud `k4mjzxdz`, preset unsigned `nv5gv6px` (pasta simastok). Tem um vídeo de teste `simastok/emymgeykftu2cajkjiir` lá (não tá no feed).
- (caixinha já começa aberta)
