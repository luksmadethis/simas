#!/usr/bin/env python3
"""Coloca o menu padrão (scripts/nav.html) em todas as páginas do site (menos a home e as /v/ geradas).
Troca o que tiver entre <!--SNAV ... --> e <!--/SNAV-->, ou o menu antigo <nav class="snav">."""
import re, glob, os
raiz = os.path.join(os.path.dirname(__file__), '..', 'public')
nav = open(os.path.join(os.path.dirname(__file__), 'nav.html')).read().strip() + '\n'
for f in sorted(glob.glob(os.path.join(raiz, '**', 'index.html'), recursive=True)):
    rel = os.path.relpath(f, raiz)
    if rel == 'index.html' or rel.startswith('v' + os.sep): continue
    s = open(f).read(); antes = s
    if '<!--SNAV' in s:
        s = re.sub(r'<!--SNAV.*?<!--/SNAV-->\n?', lambda m: nav, s, count=1, flags=re.S)
    elif '<nav class="snav">' in s:
        # menu antigo: tira o <nav> (e o <style> dele, se vier colado) e põe o novo no lugar
        s = re.sub(r'<nav class="snav">.*?</nav>\n?(<style>\n\.snav\{.*?</style>\n)?', lambda m: nav, s, count=1, flags=re.S)
    else:
        print('sem menu:', rel); continue
    if s != antes: open(f, 'w').write(s); print('ok:', rel)
