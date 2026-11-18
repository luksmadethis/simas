"""ConverSimas: converte link do YouTube/TikTok/Instagram em MP4 (até 1080p) ou MP3.
Roda no Render (grátis). Cada conversão vira um "job" com progresso; o site pergunta o progresso e depois baixa o arquivo."""
import os, re, time, uuid, shutil, threading, subprocess, tempfile
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import yt_dlp

MAX_SEG = int(os.environ.get('MAX_SEG', 900))          # vídeo de no máximo 15 min
POR_DIA = int(os.environ.get('POR_DIA', 25))           # conversões por IP por dia
ORIGENS = ['https://ofisimas.web.app', 'https://simasfitness2.web.app', 'http://localhost:5000']
SITES = re.compile(r'^https?://([a-z0-9-]+\.)*(youtube\.com|youtu\.be|tiktok\.com|instagram\.com|x\.com|twitter\.com|facebook\.com|fb\.watch|kwai\.com|vm\.tiktok\.com)/', re.I)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=ORIGENS, allow_methods=['*'], allow_headers=['*'], expose_headers=['Content-Disposition'])
JOBS, USO, TRAVA = {}, {}, threading.Lock()
BASE = tempfile.mkdtemp(prefix='conversimas-')

def ip_de(req: Request):
    return (req.headers.get('x-forwarded-for') or req.client.host or '?').split(',')[0].strip()

def limpa_velhos():
    agora = time.time()
    for jid, j in list(JOBS.items()):
        if agora - j['criado'] > 1800:
            shutil.rmtree(j['dir'], ignore_errors=True); JOBS.pop(jid, None)

def nome_limpo(s):
    s = re.sub(r'[\\/:*?"<>|\n\r\t]+', ' ', s or 'video').strip()
    return (s[:80] or 'video')

@app.get('/')
@app.get('/health')
def health():
    return {'ok': True, 'yt_dlp': yt_dlp.version.__version__, 'jobs': len(JOBS)}

def roda(jid, url, tipo, q):
    j = JOBS[jid]
    def gancho(d):
        if d.get('status') == 'downloading':
            tot = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
            if tot: j['pct'] = min(95, round(d.get('downloaded_bytes', 0) / tot * 95 * (0.5 if j.get('dois') else 1) + (47.5 if j.get('parte2') else 0), 1))
            j['fase'] = 'baixando'
        elif d.get('status') == 'finished':
            if j.get('dois'): j['parte2'] = True
            j['fase'] = 'convertendo'
    base = {'outtmpl': os.path.join(j['dir'], '%(id)s.%(ext)s'), 'quiet': True, 'noprogress': True, 'noplaylist': True,
            'progress_hooks': [gancho], 'socket_timeout': 20, 'retries': 3, 'concurrent_fragment_downloads': 4}
    try:
        with yt_dlp.YoutubeDL({**base, 'skip_download': True}) as y:
            info = y.extract_info(url, download=False)
        if info.get('_type') == 'playlist' and info.get('entries'):
            info = next(e for e in info['entries'] if e)
        dur = info.get('duration') or 0
        if dur and dur > MAX_SEG:
            raise ValueError(f'video muito longo ({int(dur//60)} min). o maximo é {MAX_SEG//60} min')
        j['titulo'] = info.get('title') or 'video'; j['thumb'] = info.get('thumbnail'); j['dur'] = dur
        if tipo == 'mp3':
            opts = {**base, 'format': 'bestaudio/best',
                    'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3', 'preferredquality': '192'}]}
        else:
            j['dois'] = True
            opts = {**base, 'merge_output_format': 'mp4',
                    'format': f'bv*[height<={q}][vcodec^=avc1]+ba[ext=m4a]/bv*[height<={q}]+ba/b[height<={q}]/b',
                    'postprocessor_args': {'merger': ['-movflags', '+faststart']}}
        with yt_dlp.YoutubeDL(opts) as y:
            y.download([info.get('webpage_url') or url])
        arqs = [f for f in os.listdir(j['dir']) if f.endswith('.mp3' if tipo == 'mp3' else '.mp4')]
        if not arqs:
            arqs = [f for f in os.listdir(j['dir']) if not f.endswith(('.part', '.ytdl'))]
        if not arqs: raise ValueError('nao saiu arquivo nenhum')
        j['arquivo'] = os.path.join(j['dir'], arqs[0])
        ext = os.path.splitext(arqs[0])[1]
        j['nome'] = nome_limpo(j['titulo']) + ext
        j['tamanho'] = os.path.getsize(j['arquivo'])
        j['pct'] = 100; j['fase'] = 'pronto'
    except Exception as e:
        msg = str(e)
        if 'Sign in to confirm' in msg or 'bot' in msg.lower(): msg = 'o youtube bloqueou o servidor (acha que é robô). tenta de novo mais tarde ou outro link'
        elif 'login' in msg.lower() or 'private' in msg.lower(): msg = 'esse video precisa de login ou é privado'
        elif 'Unsupported URL' in msg: msg = 'esse link nao é suportado'
        j['fase'] = 'erro'; j['erro'] = re.sub(r'\x1b\[[0-9;]*m', '', msg)[:300]

@app.post('/job')
async def novo_job(req: Request):
    d = await req.json()
    url, tipo = str(d.get('url', '')).strip(), d.get('tipo', 'mp4')
    try: q = int(d.get('q', 1080))
    except Exception: q = 1080
    q = min(1080, max(144, q))
    if tipo not in ('mp4', 'mp3'): raise HTTPException(400, 'tipo invalido')
    if not SITES.match(url): raise HTTPException(400, 'manda link do youtube, tiktok, instagram, x ou facebook')
    ip, hoje = ip_de(req), time.strftime('%Y-%m-%d')
    with TRAVA:
        limpa_velhos()
        k = (ip, hoje); USO[k] = USO.get(k, 0) + 1
        if USO[k] > POR_DIA: raise HTTPException(429, f'passou do limite de {POR_DIA} conversoes hoje, volta amanha')
        if sum(1 for j in JOBS.values() if j['fase'] in ('fila', 'baixando', 'convertendo')) >= 3:
            USO[k] -= 1; raise HTTPException(503, 'servidor ocupado com outras conversoes, tenta em 1 minuto')
        jid = uuid.uuid4().hex[:16]
        JOBS[jid] = {'criado': time.time(), 'dir': tempfile.mkdtemp(dir=BASE), 'fase': 'fila', 'pct': 0}
    threading.Thread(target=roda, args=(jid, url, tipo, q), daemon=True).start()
    return {'id': jid}

@app.get('/job/{jid}')
def ver_job(jid: str):
    j = JOBS.get(jid)
    if not j: raise HTTPException(404, 'nao achei essa conversao (o servidor pode ter reiniciado)')
    return {k: j.get(k) for k in ('fase', 'pct', 'titulo', 'thumb', 'dur', 'erro', 'nome', 'tamanho')}

@app.get('/job/{jid}/arquivo')
def baixar(jid: str):
    j = JOBS.get(jid)
    if not j or j.get('fase') != 'pronto': raise HTTPException(404, 'ainda nao ta pronto')
    mt = 'audio/mpeg' if j['nome'].endswith('.mp3') else 'video/mp4'
    return FileResponse(j['arquivo'], media_type=mt, filename=j['nome'])
