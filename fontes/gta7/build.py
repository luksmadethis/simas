# monta o jogo num arquivo só: python3 fontes/gta7/build.py (rodar na raiz do repo)
import base64, io, glob, os, json
from PIL import Image
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.dirname(os.path.dirname(AQUI))
fotos = {}
for f in sorted(glob.glob(os.path.join(RAIZ, 'public/galera/*.jpg'))):
    im = Image.open(f).convert('RGB'); w, h = im.size; c = int(min(w, h) * 0.62); cx, cy = w // 2, int(h * 0.45)
    im = im.crop((cx - c // 2, cy - c // 2, cx + c // 2, cy + c // 2)).resize((96, 96), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=80)
    fotos[os.path.basename(f)[:-4]] = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
js = '\n'.join(open(f).read() for f in sorted(glob.glob(os.path.join(AQUI, 'src/*.js'))))
t = open(os.path.join(AQUI, 'template.html')).read().replace('/*FOTOS*/', 'const FOTOS = ' + json.dumps(fotos) + ';').replace('/*JOGO*/', js)
dest = os.path.join(RAIZ, 'public/jogos/gta7'); os.makedirs(dest, exist_ok=True)
open(os.path.join(dest, 'index.html'), 'w').write(t); print('ok', len(t) // 1024, 'KB')
