import asyncio, subprocess, sys
from playwright.async_api import async_playwright
FPS = 30; DUR = 30
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width':1280,'height':720})
        await pg.goto('file:///home/claude/simas/fontes/gta7/trailer/trailer.html')
        await pg.wait_for_function('window.pronto()')
        only = sys.argv[1:] 
        if only:
            for t in only:
                await pg.evaluate(f'draw({t})'); await pg.screenshot(path=f'quadro-{t}.png')
            await b.close(); return
        ff = subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart','-vf','scale=1280:720','trailer.mp4'], stdin=subprocess.PIPE)
        for f in range(FPS*DUR):
            await pg.evaluate(f'draw({f/FPS})')
            ff.stdin.write(await pg.screenshot(type='jpeg', quality=88))
        ff.stdin.close(); ff.wait(); await b.close()
asyncio.run(main())
