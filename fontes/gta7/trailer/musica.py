# trilha original do trailer (gerada por síntese, sem música de ninguém)
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile
SR = 44100; DUR = 30.0; N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def env(n, a=0.005, d=0.3, curva=4):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d * 1.0) if d else np.minimum(1, t / max(a, 1e-4))
    return e
def lp(x, f, ordem=2):
    return sosfilt(butter(ordem, min(f, SR / 2 - 100) / (SR / 2), 'low', output='sos'), x)
def hp(x, f):
    return sosfilt(butter(2, f / (SR / 2), 'high', output='sos'), x)
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; out = 0
    for d in (-det, 0, det): out = out + 2 * ((t * f * (1 + d)) % 1) - 1
    return out / 3
def put(sig, t0, gl=1.0, gr=None):
    i = int(t0 * SR); gr = gl if gr is None else gr
    if i >= N: return
    n = min(len(sig), N - i); L[i:i + n] += sig[:n] * gl; R[i:i + n] += sig[:n] * gr

def braam(t0, dur=2.5, base=55, vol=0.5):
    n = int(dur * SR); s = sum(saw(base * m, n, 0.006) * a for m, a in ((1, 1), (1.5, 0.5), (2, 0.6), (3, 0.25)))
    # filtro abrindo e fechando
    t = np.arange(n) / SR; out = np.zeros(n); blocos = 64
    for k in range(0, n, n // blocos):
        seg = s[k:k + n // blocos]; fc = 200 + 2600 * np.exp(-((k / SR) - 0.15) ** 2 / 0.25)
        out[k:k + len(seg)] = lp(seg, fc)
    e = np.minimum(1, t / 0.04) * np.exp(-t / (dur * 0.45))
    put(np.tanh(out * 2.2) * e * vol, t0)
def impacto(t0, vol=0.9):
    n = int(1.8 * SR); t = np.arange(n) / SR
    f = 120 * np.exp(-t * 9) + 32; kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    ruido = lp(rng.standard_normal(n), 1800) * np.exp(-t * 6) * 0.5
    put(np.tanh((kick + ruido) * 1.6) * vol, t0)
def subida(t0, t1, vol=0.35):  # riser de ruído
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; k = t / t[-1]
    x = rng.standard_normal(n); out = np.zeros(n); blocos = 40
    for b in range(blocos):
        a, z = b * n // blocos, (b + 1) * n // blocos; out[a:z] = hp(lp(x[a:z], 400 + 7000 * (b / blocos) ** 2), 200)
    tom = np.sin(2 * np.pi * np.cumsum(110 + 700 * k ** 2) / SR) * 0.3
    put((out + tom) * k ** 2 * vol, t0, 0.9, 1.0)
def whoosh(t0, vol=0.3):
    n = int(0.45 * SR); t = np.arange(n) / SR; e = np.sin(np.pi * t / t[-1]) ** 2
    x = lp(hp(rng.standard_normal(n), 600), 5000) * e * vol; put(x, t0, 1.0, 0.6); put(x, t0 + 0.02, 0.6, 1.0)
def tambor(t0, vol=0.5, f0=90):
    n = int(0.7 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 6) + 45) / SR) * np.exp(-t * 7) + lp(rng.standard_normal(n), 900) * np.exp(-t * 18) * 0.4
    put(np.tanh(s * 1.4) * vol, t0)
def caixa(t0, vol=0.35):
    n = int(0.3 * SR); t = np.arange(n) / SR
    s = hp(rng.standard_normal(n), 1200) * np.exp(-t * 16) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * 0.6
    put(s * vol, t0, 0.8, 1.0)
def nota(t0, f, dur, vol, pan=0.5, brilho=2500):
    n = int(dur * SR); t = np.arange(n) / SR
    s = lp(saw(f, n, 0.004), brilho) * np.minimum(1, t / 0.005) * np.exp(-t / (dur * 0.35))
    put(s * vol, t0, 1 - pan * 0.6, 0.4 + pan * 0.6)

# drone de fundo, o trailer inteiro (Lá menor)
dr = lp(saw(55, N, 0.004) + 0.6 * saw(82.4, N, 0.005), 300)
dr *= np.clip(np.minimum(t_all / 2.5, 1), 0, 1) * (0.5 + 0.5 * np.sin(2 * np.pi * t_all / 7)) * 0.16
dr[int(25 * SR):int(25.3 * SR)] *= np.linspace(1, 0.2, int(0.3 * SR)); dr[int(25.3 * SR):] *= 0.2
put(dr, 0)

# 0-3: abertura
subida(0.6, 3.0, 0.3)
braam(3.0, 3.5, 55, 0.55); impacto(3.0, 0.9)
# 3-8: ostinato tenso (120 bpm, semicolcheias)
bpm = 120; s16 = 60 / bpm / 4
seq = [220, 261.6, 329.6, 261.6, 220, 261.6, 349.2, 261.6]
for k in range(int((8 - 3.2) / s16)):
    tt = 3.2 + k * s16; prog = (tt - 3.2) / 4.8
    nota(tt, seq[k % 8] * (1 if (k // 16) % 2 == 0 else 0.89), s16 * 1.6, 0.06 + 0.06 * prog, (k % 2), 1500 + 2500 * prog)
    if k % 4 == 0: tambor(tt, 0.25 + 0.2 * prog, 70)
subida(6.5, 8.0, 0.25)
# 8-14: um baque em cada personagem
for tt, b in ((8, 55), (10, 49), (12, 58.3)):
    whoosh(tt - 0.4, 0.35); impacto(tt, 0.85); braam(tt, 1.9, b, 0.4)
    for k in range(8): nota(tt + 0.25 + k * 0.22, [440, 523, 659, 523][k % 4] * (b / 55), 0.25, 0.04, k % 2, 3000)
subida(12.6, 14.0, 0.3)
# 14-18: perseguição (tambores rápidos + baixo pulsando)
s16b = 60 / 140 / 4
for k in range(int(4 / s16b)):
    tt = 14 + k * s16b; p = k % 16
    if p in (0, 6, 10): tambor(tt, 0.55, 80)
    if p in (4, 12): caixa(tt, 0.38)
    if p % 2 == 0: nota(tt, 55 if (k // 32) % 2 == 0 else 49, s16b * 1.8, 0.22, 0.5, 600)
    if p % 4 == 2: nota(tt, 880, 0.08, 0.02, 0.8, 6000)
impacto(14, 0.8)
# 18-22: robô, BRAAM pesado a cada segundo
for k in range(4): braam(18 + k, 1.6, 41.2 if k % 2 == 0 else 43.65, 0.6); impacto(18 + k, 0.7)
subida(20.8, 22.0, 0.3)
# 22-25: montagem, um whoosh por corte e tambor acelerando
for k in range(8): whoosh(22 + k * 0.375 - 0.15, 0.22); tambor(22 + k * 0.375, 0.5, 95)
for k in range(12): caixa(24.0 + k * (1.0 / 12), 0.2 + k * 0.03)
subida(23.3, 25.0, 0.45)
# 25: LOGO, o impacto final
impacto(25, 1.0); braam(25, 4.5, 41.2, 0.75); impacto(25.02, 0.6)
for k, f in enumerate([220, 329.6, 440, 659.3]): nota(26.0 + k * 0.5, f, 2.4, 0.05, 0.3 + k * 0.15, 2000)
impacto(28.0, 0.35)

# reverb (sala grande) e master
ir_n = int(2.6 * SR); ir_t = np.arange(ir_n) / SR
for canal in (0, 1):
    ir = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.4); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    src = L if canal == 0 else R
    rev = fftconvolve(src, ir)[:N] * 0.32
    if canal == 0: L = src + rev
    else: R = src + rev
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.3)
fade = np.ones(N); fi = int(0.3 * SR); fo = int(0.8 * SR); fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade[:, None]; mix /= np.max(np.abs(mix)) * 1.05
wavfile.write('trilha.wav', SR, (mix * 32767).astype(np.int16))
print('ok')
