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
