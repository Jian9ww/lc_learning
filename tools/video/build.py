"""把模板和场景脚本拼成一个独立的讲解网页。

用法（在仓库根目录执行）：
    python tools/video/build.py lc48        # 只构建一个
    python tools/video/build.py all         # 构建 videos.json 里的全部

模板 template.html 提供版式、工具函数和播放器；每个视频的内容在 scenes/<id>.js 里。
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def load():
    return json.loads((HERE / 'videos.json').read_text(encoding='utf-8'))


def build(vid, cfg):
    html = (HERE / 'template.html').read_text(encoding='utf-8')
    # scenes 可以是一个文件，也可以是几个文件的列表（按顺序拼接，公共部分放前面）
    files = cfg['scenes'] if isinstance(cfg['scenes'], list) else [cfg['scenes']]
    scenes = '\n\n'.join((HERE / f).read_text(encoding='utf-8').rstrip() for f in files)
    for key, value in [('{{TITLE}}', cfg['title']), ('{{HEADER}}', cfg['header']),
                       ('{{EXTRA_CSS}}', cfg.get('css', '')), ('{{SCENES}}', scenes)]:
        assert html.count(key) == 1, key
        html = html.replace(key, value)
    out = ROOT / cfg['out']
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8', newline='\n')
    return out


if __name__ == '__main__':
    videos = load()
    if len(sys.argv) != 2 or (sys.argv[1] != 'all' and sys.argv[1] not in videos):
        sys.exit('用法：python tools/video/build.py <' + ' | '.join(videos) + ' | all>')
    for vid in (videos if sys.argv[1] == 'all' else [sys.argv[1]]):
        print('built', build(vid, videos[vid]).relative_to(ROOT).as_posix())
