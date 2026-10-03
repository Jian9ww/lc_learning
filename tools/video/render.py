"""构建网页并渲染成 MP4：分段并行截图，最后无损拼接。

用法（在仓库根目录执行）：
    python tools/video/render.py lc48                 # 完整渲染，输出到网页旁边的同名 .mp4
    python tools/video/render.py lc48 --parts 3       # 分 3 段并行（默认 2 段）
    python tools/video/render.py lc48 --range 0 6     # 只渲染第 0~6 秒，用来试效果

环境变量：
    FFMPEG      ffmpeg.exe 的路径（默认先找 PATH，再找剪映自带的那份）
    VIDEO_ENC   编码参数，默认用 NVIDIA 显卡编码；没有 N 卡时可设为
                "-c:v libx264 -crf 20 -preset slow"（需要带 libx264 的 ffmpeg）或 "-c:v h264_mf -b:v 1500k"
"""
import argparse
import glob
import os
import pathlib
import shutil
import subprocess
import sys
import uuid

from build import HERE, ROOT, build, load

DEFAULT_ENC = '-c:v h264_nvenc -preset slow -rc vbr -cq 24 -b:v 0'


def find_ffmpeg():
    cand = [os.environ.get('FFMPEG'), shutil.which('ffmpeg')] + sorted(glob.glob('D:/JianyingPro/*/ffmpeg.exe'), reverse=True)
    for c in cand:
        if c and os.path.exists(c):
            return c
    sys.exit('找不到 ffmpeg，请用环境变量 FFMPEG 指定路径')


def cleanup(tmp):
    """结束残留的无头浏览器（命令行里带着这次的临时目录名），再删掉临时目录。"""
    if os.name == 'nt':
        subprocess.run(['powershell', '-NoProfile', '-Command',
                        "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + tmp.name + "*' -and $_.Name -ne 'powershell.exe' } | "
                        'ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }'],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    shutil.rmtree(tmp, ignore_errors=True)
    try:
        tmp.parent.rmdir()          # .tmp 空了就一起删掉
    except OSError:
        pass


def main():
    videos = load()
    ap = argparse.ArgumentParser()
    ap.add_argument('id', choices=list(videos))
    ap.add_argument('--parts', type=int, default=2)
    ap.add_argument('--fps', type=int, default=30)
    ap.add_argument('--range', type=float, nargs=2, metavar=('T0', 'T1'))
    a = ap.parse_args()

    html = build(a.id, videos[a.id])
    ffmpeg = find_ffmpeg()
    enc = os.environ.get('VIDEO_ENC', DEFAULT_ENC).split()
    if 'nvenc' in ' '.join(enc) and a.parts > 3:
        print('显卡编码器同时最多开 3 路，分段数改为 3')      # 第 4 路会报 OpenEncodeSessionEx failed: out of memory
        a.parts = 3
    cap = str(HERE / 'capture.mjs')
    total = float(subprocess.run(['node', cap, 'info', str(html)], capture_output=True, text=True, check=True).stdout.strip())
    t0, t1 = a.range if a.range else (0.0, total)
    t1 = min(t1, total)

    # 每一段都从整秒开始，这样帧数是整数，拼接处不会多帧或少帧
    cuts = [t0] + [float(round(t0 + (t1 - t0) * k / a.parts)) for k in range(1, a.parts)] + [t1]
    # 临时文件放在本目录的 .tmp 下（和仓库同一个盘），不占系统盘；结束时整个删除
    tmp = HERE / '.tmp' / ('render-' + uuid.uuid4().hex[:10])
    tmp.mkdir(parents=True)
    env = dict(os.environ, FMT=os.environ.get('FMT', 'png'), LC_VIDEO_TMP=str(tmp))
    procs = []
    for k in range(a.parts):
        part = tmp / f'part{k}.mp4'
        cmd = ['node', cap, 'video', str(html), str(part), ffmpeg, str(a.fps), str(cuts[k]), str(cuts[k + 1]),
               *enc, '-pix_fmt', 'yuv420p', '-g', str(a.fps * 5)]
        procs.append((part, subprocess.Popen(cmd, env=env, stdout=subprocess.DEVNULL)))
    print(f'{a.id}: {t1 - t0:.1f} 秒，分 {a.parts} 段并行渲染……')
    failed = [part.name for part, p in procs if p.wait() != 0]      # 等所有分段都结束，再判断有没有失败的
    if failed:
        cleanup(tmp)
        sys.exit('渲染失败：' + '、'.join(failed))

    out = html.with_suffix('.mp4') if not a.range else html.with_name(html.stem + '_preview.mp4')
    listing = tmp / 'list.txt'
    listing.write_text(''.join(f"file '{part.as_posix()}'\n" for part, _ in procs), encoding='utf-8')
    subprocess.run([ffmpeg, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(listing),
                    '-c', 'copy', '-movflags', '+faststart', str(out)], check=True)
    cleanup(tmp)
    print('written', out.relative_to(ROOT).as_posix(), f'({out.stat().st_size / 1e6:.1f} MB)')


if __name__ == '__main__':
    main()
