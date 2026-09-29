# C++14 算法与 AI 手撕练习

按 CodeFun2000 的[华为面试学习路线](https://codefun2000.com/codenote/hot100/P0044)组织。Day01–07 保留原站每天的主题；Day08 是补充专题，Day09–10 是我们按依赖关系安排的 AI 手撕题。一天代表一个阶段，可以分多次完成。

## 每天的目录

| 天数 | 主题 | 入口 |
| --- | --- | --- |
| Day01 | 哈希、数组技巧、矩阵 | [专题清单](Day01_hash_array_matrix/README.md) |
| Day02 | 栈与双指针 | [专题清单](Day02_stack_two_pointers/README.md) |
| Day03 | 回溯 | [专题清单](Day03_backtracking/README.md) |
| Day04 | BFS 与动态规划基础 | [专题清单](Day04_bfs_dp_basics/README.md) |
| Day05 | 背包与多维动态规划 | [专题清单](Day05_dp_advanced/README.md) |
| Day06 | 贪心与二叉树 | [专题清单](Day06_greedy_binary_tree/README.md) |
| Day07 | 堆与二分查找 | [专题清单](Day07_heap_binary_search/README.md) |
| Day08 | 技巧、数学、链表（补充专题） | [专题清单](Day08_tricks_math_linked_list/README.md) |
| Day09 | 机器学习手撕 | [专题清单](Day09_machine_learning/README.md) |
| Day10 | 神经网络与注意力手撕 | [专题清单](Day10_neural_network_attention/README.md) |

完整题目入口与学习建议见[学习路线](学习路线.md)。每个专题目录的 `README.md` 包含原站入口、练习清单和 C++ 重点。

刷题时遇到的 STL 用法、原理和易错点记录在 [note.md](note.md)，按知识点持续补充。

## 两台电脑的协作与同步

目标：按上面的路线准备华为 AI 岗面试，使用 C++14 练习。两台电脑通过 Git 同步，学习上下文保存在仓库中。

- 开始学习前：在工作区没有未处理改动时执行 `git pull --ff-only`，阅读本文件、学习路线、当前专题清单和 `note.md`。
- 每题完成后：保留自己的代码，更新专题清单；把本题用到的数据结构 API、思路、复杂度和易错点补进 `note.md`。
- 换电脑前：用 `git status` 检查变更，添加本次需要同步的文件，`git commit` 后再 `git push`；另一台电脑先拉取再继续。
- 配合方式：以当前题目为单位讲解和复盘，常用 API 按数据结构归纳；“完成题目”和“已掌握知识点”分别记录，笔记自查项由学习者确认。

当前进度（2026-09-29）：[Day01 / 哈希](Day01_hash_array_matrix/01_hash/README.md) 已完成，包含 LC217、LC1、LC49、LC128、LC560，共 5/5 题。完成状态依据学习者确认；知识点自查单独保留在 [note.md](note.md)。

下一步：[Day01 / 数组技巧](Day01_hash_array_matrix/02_array/README.md)。Day01 的矩阵专题仍待完成。

LC560 复习使用学习者提供的 [可视化材料](Day01_hash_array_matrix/01_hash/lc_560_visual/README.md)：[HTML 演示](Day01_hash_array_matrix/01_hash/lc_560_visual/lc560_prefix_sum.html)、[视频](Day01_hash_array_matrix/01_hash/lc_560_visual/lc560_prefix_sum.mp4)、[GIF](Day01_hash_array_matrix/01_hash/lc_560_visual/lc560_hash_steps.gif)。LC49 的本地运行前整理项见哈希专题清单。

## 练习方式

1. 进入当天的专题目录，新建并保存题目文件，例如 `Day01_hash_array_matrix/01_hash/LC0001_two_sum.cpp`。编译用的目录和源码文件名统一使用英文；中文题名放在注释和练习清单中。当前 Windows 工具链处理中文路径时出现过乱码和 `Illegal byte sequence` 错误。
2. 每题独立编写核心函数；本地版本补上 `main()` 和输入输出。
3. 原站支持 C++ 时按题面要求提交；不支持时在本地用 C++14 运行并核对样例和边界情况。AI 题目前未看到 C++ 选项，先在本地练习。
4. 完成后勾选专题清单，记录思路、复杂度、易错点；AI 题同时记录矩阵形状和浮点误差。

## 编译、运行与调试

根目录的 `.vscode` 配置适用于所有子目录，无需复制。打开并保存当前要操作的 `.cpp` 文件：

- `Ctrl+Shift+B`：以 C++14 编译当前文件。
- `F5`：编译并调试当前文件，断点打在目标源码中。
- 菜单“终端 → 运行任务 → C++14: Run active file”：编译并运行当前文件，在终端输入数据。

生成的 `.exe` 位于源码旁边。编译器路径是 `C:/msys64/ucrt64/bin/g++.exe`。

`demo/main.cpp` 是现有练习文件，`demo/hash_table.cpp` 是哈希表原理示例；后续题目放入对应专题目录。
