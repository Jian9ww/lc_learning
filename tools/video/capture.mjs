// 用无头 Chrome（DevTools 协议）给讲解网页逐帧截图。需要 Node 22 以上（用到内置的 WebSocket）。
//
//   node tools/video/capture.mjs info  <html>                         输出动画总秒数
//   node tools/video/capture.mjs shots <html> <outDir> <t1,t2,...>    抽帧检查，输出 PNG
//   node tools/video/capture.mjs video <html> <out.mp4> <ffmpeg> [fps] [t0] [t1] [ffmpeg 编码参数...]
//
// 环境变量：CHROME = chrome.exe 的路径；FMT = png（默认，无损）或 jpeg（更快）；
//           LC_VIDEO_TMP = 放浏览器临时目录的位置（默认是本目录下的 .tmp，用完自动删除）。
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const CHROME = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(p => existsSync(p));
if (!CHROME) { console.error('找不到 Chrome 或 Edge，请用环境变量 CHROME 指定浏览器路径'); process.exit(1); }

const FMT = process.env.FMT || 'png';
const [mode, html, out, ...rest] = process.argv.slice(2);
const port = 9300 + Math.floor(Math.random() * 500);
// 浏览器的临时用户目录。不放系统临时目录（C 盘），每次约 100 MB，结束时删除
const TMP = process.env.LC_VIDEO_TMP || path.join(path.dirname(fileURLToPath(import.meta.url)), '.tmp');
mkdirSync(TMP, { recursive: true });
const profile = path.join(TMP, 'lc-video-chrome-' + process.pid + '-' + Date.now().toString(36));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--window-size=1920,1080', '--hide-scrollbars', '--force-device-scale-factor=1', '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function target() {
  for (let k = 0; k < 60; k++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) { /* 浏览器还没起来 */ }
    await sleep(250);
  }
  throw new Error('浏览器没有启动');
}
const ws = new WebSocket(await target());
await new Promise(r => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result));
  ws.send(JSON.stringify({ id, method, params }));
});
const evalJs = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('页面脚本出错: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
};

let failed = null;
try {
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: pathToFileURL(path.resolve(html)).href + '?capture' });
  let ready = false;
  for (let k = 0; k < 80 && !ready; k++) { ready = await evalJs('typeof window.__seek === "function"').catch(() => false); if (!ready) await sleep(100); }
  // 场景脚本有语法错误时 __seek 不会出现；用 node --check 检查拼出来的脚本最快
  if (!ready) throw new Error('页面没有加载成功（window.__seek 不存在），多半是场景脚本有语法错误或变量重名');
  const total = await evalJs('window.__total');
  await evalJs('document.fonts.ready.then(()=>true)');
  const shot = async (t, format) => {
    await evalJs(`window.__seek(${t});new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true))))`);
    const r = await send('Page.captureScreenshot', { format, quality: 96, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } });
    return Buffer.from(r.data, 'base64');
  };

  if (mode === 'info') {
    console.log(total);
  } else if (mode === 'shots') {
    mkdirSync(out, { recursive: true });
    for (const t of rest[0].split(',').map(Number)) {
      writeFileSync(path.join(out, `t${t.toFixed(1).padStart(6, '0')}.png`), await shot(t, 'png'));
    }
    console.log('total seconds:', total);
  } else if (mode === 'video') {
    const [ffmpeg, fpsArg, t0Arg, t1Arg, ...extra] = rest;
    const fps = +(fpsArg || 30), t0 = +(t0Arg || 0), t1 = Math.min(+(t1Arg || total), total);
    const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', FMT === 'png' ? 'png' : 'mjpeg', '-i', '-', ...extra, out];
    const ff = spawn(ffmpeg, args, { stdio: ['pipe', 'inherit', 'inherit'] });
    // ffmpeg 可能中途退出（例如显卡编码器开不出来）。记下来，免得继续往已经关掉的管道里写而一直卡住
    let ffCode = null;
    const ffDone = new Promise(r => ff.on('close', c => { ffCode = c ?? 1; r(ffCode); }));
    ff.on('error', () => { ffCode = 1; });
    ff.stdin.on('error', () => { /* 管道已关闭，下面按 ffCode 处理 */ });
    const frames = Math.round((t1 - t0) * fps);
    const started = Date.now();
    for (let f = 0; f < frames; f++) {
      const buf = await shot(t0 + f / fps, FMT);
      if (ffCode !== null) throw new Error('ffmpeg 提前退出，退出码 ' + ffCode);
      if (!ff.stdin.write(buf)) await Promise.race([new Promise(r => ff.stdin.once('drain', r)), ffDone]);
      if (f % 300 === 0) console.log(`frame ${f}/${frames}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    const code = await ffDone;
    if (code !== 0) throw new Error('ffmpeg 退出码 ' + code);
    console.log(`done: ${frames} frames, ${(frames / fps).toFixed(1)}s video, took ${((Date.now() - started) / 1000).toFixed(0)}s`);
  } else {
    throw new Error('未知模式：' + mode);
  }
} catch (e) {
  failed = e;
} finally {
  // 收尾：让浏览器自己退出 → 退不掉就连同子进程一起结束 → 删掉临时目录。
  // 只调用 chrome.kill() 在 Windows 上杀不掉它的子进程，会留下一堆无头 Chrome 和上百 MB 的目录。
  try { await Promise.race([send('Browser.close'), sleep(3000)]); } catch (e) { /* 连接已经断了 */ }
  try { ws.close(); } catch (e) { /* 同上 */ }
  if (chrome.exitCode === null) await Promise.race([new Promise(r => chrome.once('exit', r)), sleep(4000)]);
  if (process.platform === 'win32') {
    if (chrome.exitCode === null) spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
    const tag = path.basename(profile);
    spawnSync('powershell', ['-NoProfile', '-Command',
      `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*${tag}*' -and $_.Name -ne 'powershell.exe' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: 'ignore' });
  } else if (chrome.exitCode === null) chrome.kill('SIGKILL');
  for (let k = 0; k < 20; k++) {
    try { rmSync(profile, { recursive: true, force: true }); if (!existsSync(profile)) break; } catch (e) { /* 文件还被占用，等一下再删 */ }
    await sleep(300);
  }
}
if (failed) console.error(String(failed.message || failed));
process.exit(failed ? 1 : 0);     // 明确退出，不等残留的句柄
