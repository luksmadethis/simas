FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg curl unzip git ca-certificates nodejs npm && rm -rf /var/lib/apt/lists/* \
 && curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s -- -y
# gerador de "token de navegador" (PO token) pro YouTube não achar que é robô
RUN git clone --depth 1 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git /bgutil \
 && cd /bgutil/server && npm ci && npx tsc
WORKDIR /app
COPY versao.txt requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py start.sh ./
ENV PORT=10000
CMD ["sh", "start.sh"]
