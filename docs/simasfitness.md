# Desafio Simasfitness 2 — resumo completo do projeto

Contexto para continuar o projeto em outro chat/ferramenta. Tudo que foi construído, como funciona e as decisões tomadas.

## O que é

Site de um desafio fitness de 30 dias entre amigos: inscrição, ficha diária por pessoa, ranking ao vivo, fórum de provas e tela de encerramento. Tom bem informal, com gírias regionais e piadas internas do grupo. Visual escuro com detalhes nas cores da bandeira LGBT.

- **Endereço atual:** https://ofisimas.web.app/simasfitness/ (Firebase Hosting, dentro do site do grupo Simas)
- **Endereço antigo:** https://luksmadethis.github.io/simasfitness2/ — hoje só redireciona pro novo (repo GitHub `luksmadethis/simasfitness2`)
- **Banco/login:** Firebase, projeto `simasfitness2`
- O site é **um único arquivo `index.html`** (HTML + CSS + JS, imagens embutidas em base64) + `og.jpg` e ícones.

## Datas e regras do desafio

- Início **03/11/2026**, 30 dias **pulando domingos** → termina **07/12/2026** (domingos 08, 15, 22 e 29/11 compensados com 03, 04, 05 e 07/12).
- Inscrições iam até 03/11 00:00 (Brasília) com contagem regressiva; depois foram **reabertas** (constante `REG_REOPEN = true` no código + regra do Firestore liberando `create`).
- Só o **dia de hoje** é editável. Dias passados fecham à meia-noite (quadradinho verde com ✓ se fez ≥1 ponto, vermelho com ✕ se 0, pontuação escrita). Dias futuros trancados.
- **Inscrito atrasado** (inscreveu depois de 03/11): pode preencher os dias anteriores à inscrição até o fim do dia seguinte ao cadastro.
- **Liberação manual** por pessoa/dia: lista `EXTRA_UNLOCK` no código (`{who, day, until, since}`), vale uma vez — salvou, fecha. Usado pro Lukinhas no Dia 2.

### Pontuação
| Item | Pontos |
|---|---|
| Musculação | 1 |
| Aeróbico | 1 |
| Água (meta = 35 ml × kg do peso) | 1 |
| Zero açúcar | 1 |
| NoFap no dia | 1 |
| Bônus: completou as 5 no dia | +1 (pop-up de parabéns) |
| Bônus: post de prova no fórum | +1 (máx. 1 por dia de desafio) |
| Bônus: NoFap nos 30 dias | +30 |

Máximo: 30 × 6 + 30 + posts.

### Texto oficial do quadro de regras
- Regras: musculação; aeróbico; zero açúcar; água certa; NoFap; usar o SimasTabelas pra anotar; postar provas no fórum.
- Premiação: 1º medalha + 1 mês de IPTV 📺🥇 · 2º medalha + 1 mês de CapCut (provido pelo Cas) · 3º medalha (bagre).
- Requisitos mínimos: Musculação = 20 flexões + 15 abdominais 🏋️ · Aeróbico = 10 min de cardio 🏃.
- "Inscrição isenta, totalmente gratuita (aguarde os impostos)".

## Funcionalidades

**Inscrição:** foto obrigatória (reduzida p/ 200px), nome, idade, altura, peso inicial, meta (Consistência / Ganhar / Perder peso), PIN de 4 números e um **termo de compromisso zoeiro obrigatório** ("juro pela minha mãe (viva, morta ou só profundamente decepcionada comigo)…"). Nome único. Depois de criada, só a **foto** pode mudar ("Trocar foto").

**Login:** nome + PIN. Por baixo vira e-mail/senha do Firebase (`<nome-sem-acento>@simasfitness2.app` / `sf2-pin-<PIN>`). Antes do login a pessoa entra como anônima (vê ranking/fórum). "Já tem conta? Faz login aqui" para entrar em outro aparelho. Tratado o caso de conta criada sem ficha ("Termina tua inscrição").

**Ficha:** foto, meta, idade, altura, peso, IMC (com classificação), pontos, dias feitos, sequência (🔥 a partir de 2 dias seguidos), recado público no ranking (balãozinho, até 80 caracteres), grade dos 30 dias, editor do dia, status do dia comparando com a galera (verde/vermelho), zoeira quando não marca NoFap, gráfico de linha de progresso (você × média) no final.

**Ranking:** 🏆 no 1º, foto, nome + 🔥 sequência, etiqueta de peso (Abaixo/Acima do peso em vermelho, Peso ideal em verde), recado, pontos e dias feitos.

**Fórum (aba 2):** post com texto + até 2 fotos (comprimidas), 42 reações de emoji (❤️ 🔥 💪 😂 🐂 🐄 🦍 🐓 🗿 🤡 🧌 🦆 🐌 🍞 🥩 🫃 🧂 💀 🫡 🤌 🪳 🐊 🦨 🦐 🐸 🥚 🦭 🐖 🧅 🪑 🍆 🐔 🍗 🏳️‍🌈 🏳️‍⚧️ 🌈 💅 👬 👭 🇧🇷 🇮🇱 🖕 — a ordem não pode mudar, o índice fica salvo), comentários, apagar o próprio post.

**Encerramento** (a partir de 08/12): pódio 🏆🥈🥉, pizzas de atividades (individual e geral), gráfico de evolução de todos.

**Painel do organizador** (embaixo do ranking, só pra uids em `config/admins.uids`): data de início, modo teste (libera todos os dias), mostrar encerramento (teste), apagar meus dias de teste, liberar inscrição atrasada por nome, transferir ficha para outro aparelho. Código do aparelho aparece abrindo o site com `#admin`.

**Visual/conteúdo:** fundo = colagem de fotos da galera (polaroids) com selo "SIMASFITNESS · Desafio 2"; botões e campos com borda arco-íris (selecionado = fundo escuro, texto branco); contagem regressiva gigante arco-íris animada; ícone "S2"; imagem de prévia de link `og.jpg`; textos com **sotaque do dia** alternando carioca / paulista / nordestino / mineiro / sulista; piadas internas (Empregos Bahia "casado ou solteiro", Boxeo a Puño Limpio em Chivarreto, preço final R$ 353,62 / R$ 700,00, perdão de dívida do MEI, ritual de invocação, fim da escala 6x1); animação de leite ao marcar NoFap.

**Coisas que existiram e foram removidas a pedido:** frango voando/pousando/botando ovo, avião "LTzin indo pra Recife / Voo LT-081: Minas Gerais → Recife", berinjela com asas, todos os sons (gemidão no NoFap e no fórum, áudio do frango, som de avião).

**Coisas recusadas por mim (Claude) no chat:** imagens sexuais explícitas ou de pessoas reais em contexto sexual, a pessoa de fora do grupo (Tinder, jogadora, político), arte com direito autoral (GTA VI, marca d'água de banco de imagem), o gorila ao lado das fotos da galera, pênis com asas e o "líquido branco" da berinjela.

## Firebase

```js
const firebaseConfig = {
  apiKey: "AIzaSyA0G_qSK5eEVzGnLskGS8leXCwC7XNzK0A",
  authDomain: "simasfitness2.firebaseapp.com",
  projectId: "simasfitness2",
  storageBucket: "simasfitness2.firebasestorage.app",
  messagingSenderId: "1068623437415",
  appId: "1:1068623437415:web:63ccdb065e991452563ec2"
};
```
SDK compat 10.12.2 via gstatic. Authentication: provedores **Anônimo** e **E-mail/senha** ativados. Firestore em `southamerica-east1`. Plano Spark (gratuito) — por isso as fotos ficam em base64 dentro do Firestore, não no Storage.

### Coleções
- `config/challenge` — `{ startDate:"2026-11-03", testUnlock:bool, forceEnd:bool, lateSignups:[slugs] }`
- `config/admins` — `{ uids:[...] }` (lista de organizadores)
- `participants/{uid}` — `{ name, login, age, height, weight, goal, photo, joined, status, score, updatedAt, days:{ "1":{musculacao,aerobico,agua,acucar,nofap,salvoEm}, ... } }`
- `posts/{id}` — `{ author, text, photos:[dataURL], sound, createdAt, day }`
- `likes/{post--uid[--emojiIndex]}` — `{ post, user, e, createdAt }`
- `comments/{id}` — `{ post, author, text, createdAt }`

### Regras de segurança
Arquivo `firestore.rules` (enviado junto). Resumo: tudo exige login (anônimo serve pra ler); `config` só organizador escreve; cada um cria/edita só a própria ficha e não altera nome/idade/altura/peso/meta depois de criada; posts/comentários/curtidas só do próprio autor (dono do post pode apagar comentários e curtidas no post dele). A criação de ficha está liberada sem prazo (inscrições reabertas).

**Atualizado:** as regras agora ficam em `firestore.rules` na raiz do repo `simas` (que também tem as regras da caixinha de sugestões) e são publicadas sozinhas pelo GitHub Actions. **Não colar regras manualmente no console**: uma versão antiga sem as regras das sugestões quebra a caixinha.

## Limitações conhecidas
- Travas de dia (dias passados/futuros) estão na tela, não nas regras do Firestore: alguém que mexa nas ferramentas do navegador conseguiria editar dias antigos.
- Quem esquecer o PIN: o organizador pode usar "Transferir ficha" (precisa do código do aparelho novo via `#admin`).
- Navegadores no Windows mostram bandeiras-emoji como letras (BR, IL).

## Código
A versão em produção é `public/simasfitness/index.html` no repo `simas`. Ela é idêntica à última versão do GitHub (commit 9d3d708), só com os links trocados pro endereço novo e com o cabeçalho de navegação do site Simas no topo.
