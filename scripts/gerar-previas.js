// Gera uma página por vídeo do SimasTok em public/v/<id>/ com a prévia (og:image/og:video) daquele vídeo,
// pra quando mandarem o link no WhatsApp/Discord aparecer a capa do vídeo. A página é o próprio SimasTok.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const a = require('firebase-admin');
a.initializeApp({ credential: a.credential.cert(JSON.parse(process.env.SA)) });
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
(async () => {
  const pub = path.join(__dirname, '..', 'public');
  const tpl = fs.readFileSync(path.join(pub, 'simastok', 'index.html'), 'utf8');
  const ini = tpl.indexOf('<meta property="og:title"'), fim = tpl.indexOf('<link rel="apple-touch-icon"');
  if (ini < 0 || fim < 0) throw new Error('nao achei o bloco de og no simastok/index.html');
  const q = await a.firestore().collection('tok').orderBy('t', 'desc').limit(500).get();
  const vids = q.docs.map(d => ({ id: d.id, ...d.data() })).filter(v => /^[A-Za-z0-9]{10,40}$/.test(v.id) && v.cloud && v.pid);
  fs.rmSync(path.join(pub, 'v'), { recursive: true, force: true });
  for (const v of vids) {
    const base = `https://res.cloudinary.com/${v.cloud}/video/upload`;
    const img = `${base}/so_0,w_720,h_720,c_fill,g_auto,q_auto/${v.pid}.jpg`;
    const mp4 = `${base}/q_auto,vc_h264,w_720,c_limit/${v.pid}.mp4`;
    const url = `https://ofisimas.web.app/v/${v.id}/`;
    const tit = `@${v.nome || '?'} no SimasTok 🎬`;
    const desc = v.legenda ? v.legenda : 'olha esse video ai porra';
    const og = `<meta property="og:title" content="${esc(tit)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:site_name" content="SimasTok">
<meta property="og:type" content="video.other">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="720">
<meta property="og:image:height" content="720">
<meta property="og:video" content="${mp4}">
<meta property="og:video:secure_url" content="${mp4}">
<meta property="og:video:type" content="video/mp4">
<meta property="og:video:width" content="${v.w || 720}">
<meta property="og:video:height" content="${v.h || 1280}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${img}">
`;
    let html = tpl.slice(0, ini) + og + tpl.slice(fim);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(tit)}</title>`);
    fs.mkdirSync(path.join(pub, 'v', v.id), { recursive: true });
    fs.writeFileSync(path.join(pub, 'v', v.id, 'index.html'), html);
  }
  const resumo = { tpl: crypto.createHash('sha1').update(tpl).digest('hex'), vids: vids.map(v => [v.id, v.nome, v.legenda, v.pid]) };
  const hash = crypto.createHash('sha1').update(JSON.stringify(resumo)).digest('hex');
  fs.mkdirSync(path.join(pub, 'v'), { recursive: true });
  fs.writeFileSync(path.join(pub, 'v', 'manifest.json'), JSON.stringify({ hash, n: vids.length }));
  console.log('previas:', vids.length, 'hash', hash);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `hash=${hash}\n`);
})().catch(e => { console.error(e); process.exit(1); });
