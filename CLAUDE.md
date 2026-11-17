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

O site é interno da galera. O tom dos textos é **escrachado de propósito**: palavrão, português chucro, minúsculo com erros e CAPS em palavras de destaque, e piada interna.
**Nunca usar a palavra "panela"** (pedido do dono).

## Repositórios (GitHub, conta luksmadethis)
- **luksmadethis/simas**: é ESTE repo. É o site inteiro e é o único lugar onde se mexe agora.
  - `public/index.html`: home
  - `public/simastelas/index.html` + `og.png`: app SimasTelas (um arquivo só, HTML+CSS+JS)
  - `public/simasfitness/index.html` + ícones/og: app Simas Fitness
  - `public/sugestoes/index.html`: caixinha de sugestões
  - `public/simastok/index.html`: SimasTok (vídeos estilo TikTok; arquivos no Cloudinary, dados em `tok` e `tokcom` no Firestore; `CLOUD`/`PRESET` no topo do script)
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
Array `GALERA` no fim de `public/index.html` (`nome`, `papel`, `frase`, `foto`). Mostrada em carrossel passando, em ordem alfabética (automática). Hoje: Alan, Cas, Dudu, Gelado, Ltzin, Luketa, Matt, Meco, Nauj, Nerivan, Poli, Yori (legendas ainda vazias, o dono vai mandando).
Piadas internas já usadas: "aqui pagou papai #constancia", "duas serie de levanta da cadera", "aí é brincadeira dj cas", #ChádeBebê, "quem é o pai?", "NO DIA 3 VAI SER REVELADO O SEXO DO BEBÊ", "cla, ú, dê, eu amo voce", "que linda barriga".

## Visual
Fundo escuro (#0d0c12), cores do arco-íris LGBT. O cabeçalho (`.snav`) é igual em todas as páginas: logo Simas + Home, SimasTelas, Fitness, SimasTok e Sugestões.
Home: arco-íris que desce serpenteando conforme o scroll e barra de progresso arco-íris no topo. O mouse é o normal: a varinha e o brilho foram removidos porque deixavam o site lento.

## Pendências
- Colocar foto de cada um da galera, se mandarem.
- Cloudinary do SimasTok: cloud `k4mjzxdz`, preset unsigned `nv5gv6px` (pasta simastok). Tem um vídeo de teste `simastok/emymgeykftu2cajkjiir` lá (não tá no feed).
- (caixinha já começa aberta)
