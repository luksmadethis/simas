#!/bin/sh
# liga o gerador de token do YouTube em segundo plano e depois o ConverSimas
node /bgutil/server/build/main.js > /tmp/bgutil.log 2>&1 &
exec uvicorn app:app --host 0.0.0.0 --port "${PORT:-10000}"
