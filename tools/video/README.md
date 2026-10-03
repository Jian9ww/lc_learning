# 讲解动画工具

把一份“场景脚本”做成讲解网页，再渲染成 MP4。LC41、LC54、LC73、LC48、LC240 和华为机试 21 题（5 集）的动画都是这样做的。

## 文件

| 文件 | 作用 |
| --- | --- |
| `template.html` | 版式、工具函数和播放器（取自 LC560 的动画）。所有视频共用 |
| `scenes/<id>.js` | 每个视频自己的内容：数据、每一章的画面和字幕 |
| `scenes/hw21_common.js` | 华为 21 题 5 集共用的部分：算法模拟（和 `ACM_test/HW/21.cpp` 逐句对应）、坐标平面、代码面板等 |
| `videos.json` | 每个视频的场景文件、输出位置、标题和附加样式。`scenes` 可以写一个文件，也可以写几个文件的列表（按顺序拼接，公共部分放前面） |
| `build.py` | 模板 + 场景脚本 → 独立的网页（`.html`） |
| `capture.mjs` | 用无头 Chrome 逐帧截图：抽帧检查，或交给 ffmpeg 编码 |
| `render.py` | 一条命令：构建网页 → 分段并行渲染 → 拼接成 `.mp4` |

网页进 Git；`.mp4` 只留在本地（`.gitignore` 忽略了 `*.mp4`）。

渲染和截图时的临时文件放在本目录的 `.tmp/` 下（和仓库同一个盘，不占系统盘），用完自动删除；想换位置用环境变量 `LC_VIDEO_TMP`。

## 需要的环境

- Python 3、Node 22 以上（`capture.mjs` 用到内置的 WebSocket）。
- Chrome 或 Edge。找不到时用环境变量 `CHROME` 指定路径。
- ffmpeg。默认先找 PATH，再找剪映自带的 `D:/JianyingPro/*/ffmpeg.exe`；也可以用环境变量 `FFMPEG` 指定。
- 编码器默认用 NVIDIA 显卡的 `h264_nvenc`。没有 N 卡时设置环境变量 `VIDEO_ENC`，例如 `-c:v h264_mf -b:v 1500k`。

## 常用命令

都在仓库根目录执行。

```bash
python tools/video/build.py lc48                 # 只拼网页
python tools/video/build.py all                  # 重新拼全部网页
python tools/video/render.py lc48                # 拼网页并渲染完整视频（约 5 分钟）
python tools/video/render.py lc48 --range 0 6    # 只渲染前 6 秒试效果，输出 *_preview.mp4
node tools/video/capture.mjs shots Day01_hash_array_matrix/03_matrix/lc_48_visual/lc48_rotate.html C:/Temp/lc-shots 10,33.6,80
```

最后一条把第 10、33.6、80 秒的画面输出到 `C:/Temp/lc-shots`，用来检查排版。截图目录放在仓库外面，免得混进 Git。

## 做一个新视频

1. 复制一份最接近的 `scenes/<id>.js`，改成新题的内容。
2. 在 `videos.json` 里加一项：场景文件、输出的 `.html` 路径、标题、页眉、附加样式。
3. `python tools/video/build.py <id>`，用 `capture.mjs shots` 抽帧检查每一章。
4. `python tools/video/render.py <id>` 渲染视频。
5. 在题目的 `lc_<题号>_visual/README.md` 里写文字讲解和章节列表。

## 场景脚本怎么写

场景脚本往数组 `SC` 里放场景，每个场景是一章：

```js
SC.push({title:'题目', dur:11, caps:[[.5, 5.2, '第一句字幕'], [5.4, 10.6, '第二句字幕']],
  build(r){ /* 在容器 r 里创建这一章的元素，返回一个对象 c */ },
  update(c, t){ /* 根据这一章内的时间 t（秒）设置每个元素的状态 */ }});
```

- 画面是 1920 × 1080 的固定舞台。`update` 必须只由 `t` 决定画面，不能依赖上一帧，这样才能任意跳转和逐帧截图。
- `caps` 的每一项是 `[开始, 结束, 文字]`，时间从本章开头算起。
- 模板提供的工具：`H`（建 HTML 元素）、`S`（建 SVG 元素）、`ep(t, a, b)`（a 到 b 之间从 0 平滑变到 1）、`pr`、`lerp`、`vis`、`pop`、`drawable`、`penCircle`、`bracket`、`codePanel`。
- 数字键 1–9 跳到前 9 章；超过 9 章时，后面的章节点底部的章节按钮。
- 一个系列有几集时，把公共的数据和画图函数放进一个公共文件，`videos.json` 里写成列表。公共文件里的名字加统一前缀（如 `hw`），免得和模板重名。

## 踩过的坑

- **变量名不要和模板里的重名**。模板的播放器用了 `T`、`cur`、`ctx`、`playing`、`last` 等名字；场景脚本里再定义同名的 `const` 会让整页脚本报语法错误，表现为 `window.__seek 不存在`。
- **路径线不要压在数字上**。把 SVG 建在格子之前，线就画在格子下面。
- **多个格子同时交换会挤成一堆**。成对交换要一对一对来；整行、整列的翻转用“翻牌”效果（见 `scenes/lc48.js` 的 `flip`）。
- **格子默认要先填值**。只在 `update` 里填值的话，没调用到的场景会显示空格子。
- **全片超过 150 秒时不要单段渲染**。分段并行更快，`render.py` 默认分 2 段，最多 3 段：这块显卡的编码器同时只能开 3 路，第 4 路会报 `OpenEncodeSessionEx failed: out of memory`。以前这种失败会让那一段的截图进程一直卡着不退出，现在 ffmpeg 提前退出时截图会立刻报错结束。
- **无头浏览器要确认真的退出了**。在 Windows 上只结束 Chrome 的主进程，它的子进程会留下来，每次还留下约 100 MB 的临时用户目录。出过一次事故：一个晚上积累了 240 个进程、33 个目录，把系统盘占满。现在 `capture.mjs` 结束时会让浏览器自己退出、按临时目录名清掉残留进程、再删除目录；`render.py` 结束时再整体清一遍。改这两个脚本时不要去掉这部分。
- **代码太长放不下时用可滚动的代码面板**（`hw21_common.js` 的 `hwScroll`）：只显示二十来行，讲到哪里滚到哪里，高亮当前的几行。
