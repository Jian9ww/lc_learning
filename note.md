# C++14 刷题笔记

这份笔记随刷题补充，按知识点归纳。同一个容器在新题里出现时，补充新的用法和题目链接，不重复抄一份。

每条记录保留：使用场景、来源题目、关键写法、易错点、复杂度。只把能解释清楚的内容标为已掌握。

## 1. unordered_set：记录“某个值是否出现过”

首次记录：2026-09-28。

来源：[LC217 存在重复元素](Day01_hash_array_matrix/01_hash/lc_217.cpp)。

### 为什么这道题用它

题目只需要知道一个数字有没有出现过，不需要记录它出现的次数。

`unordered_set` 是基于哈希的集合，保存不重复的元素，不保证遍历顺序。这里用 `seen` 保存已经遍历过的数字。

如果需要记录“数字 → 出现次数”，再考虑 `unordered_map<int, int>`。

### 本题已经用到的写法

```cpp
#include <unordered_set>
using namespace std;

unordered_set<int> seen;  // 创建存放 int 的集合

seen.count(x);           // x 存在返回 1，不存在返回 0
seen.insert(x);          // 插入 x；已有 x 时不会再保存一份
```

注意：`count(x)` 统计的是集合内有几个等于 x 的元素，普通 `unordered_set` 只可能返回 0 或 1。它不能统计原数组中 x 出现了几次。

本题关键循环：

```cpp
for (int x : nums) {
    if (seen.count(x)) {  // 返回 1 会作为 true，返回 0 会作为 false
        return true;
    }
    seen.insert(x);
}
return false;
```

循环开始处理 x 时，`seen` 中只保存 x 前面的数字。因此，如果 x 已经在集合中，就说明它至少出现了第二次。

### 用一个例子理解顺序

对 `nums = {1, 2, 3, 1}`：

| 当前数字 | 查询前的集合内容（顺序仅用于展示） | count 的结果 | 下一步 |
| --- | --- | --- | --- |
| 1 | 空 | 0 | 插入 1 |
| 2 | 1 | 0 | 插入 2 |
| 3 | 1、2 | 0 | 插入 3 |
| 1 | 1、2、3 | 1 | 返回 true |

如果遍历结束也没有发现重复，返回 false。例如 `{1, 2, 3}`。

### 易错点

- 这份写法必须先查询，再插入。先插入再调用 `count(x)`，每个 x 都会被误判为重复。
- 集合自动去重；重复插入不会增加 `size()`。
- 不保证遍历顺序，不能靠它得到排序结果。
- `unordered_set` 没有 `operator[]`，不能写 `seen[x]`。
- 当前使用 C++14，不能用 C++20 才提供的 `contains(x)`；用 `count` 或 `find` 判断存在。

### 复杂度与哈希原理

`count`、`find`、`insert` 通常平均为 O(1)。哈希先定位到一个桶，再在桶内找元素，原理示例见 [hash_table.cpp](demo/hash_table.cpp)。

本题平均时间复杂度 O(n)，额外空间 O(n)。大量哈希冲突时，单次查找可能退化到 O(n)，本题最坏时间复杂度可到 O(n²)。

### 后续用到时再补：其他常用接口

| 写法 | 含义 |
| --- | --- |
| `seen.find(x) != seen.end()` | 找到 x 时返回指向它的迭代器；找不到时返回 `end()` |
| `seen.erase(x)` | 删除 x，返回删除数量：0 或 1 |
| `seen.size()` | 当前不同元素的数量 |
| `seen.empty()` | 集合是否为空 |
| `seen.clear()` | 清空集合 |
| `seen.insert(x).second` | 本次成功插入返回 true；x 已存在返回 false |

最后一项可把本题的查询和插入合在一起：

```cpp
if (!seen.insert(x).second) {
    return true;  // 插入失败，因为 x 已存在
}
```

先理解原来的 `count` + `insert` 写法，再理解这个返回值。

### 自查

- [ ] 能解释为什么本题用 set，不需要 map。
- [ ] 能解释 `count` 为什么只能返回 0 或 1。
- [ ] 能解释为什么先查再插。
- [ ] 能说明平均 O(1) 的查找为什么仍有最坏 O(n) 的情况。

## 2. unordered_map：记录“键 → 值”的对应关系

首次记录：2026-09-29。

来源：[LC1 两数之和](Day01_hash_array_matrix/01_hash/lc_1.cpp)。以下示例均使用 C++14。

### 为什么这道题用它

本题不仅要知道补数是否出现过，还要取出它的下标。因此用 `unordered_map<int, int>` 保存“数字 → 下标”。

```cpp
#include <unordered_map>
using namespace std;

unordered_map<int, int> hash_table;  // 第一个 int 是键，第二个 int 是值
hash_table[7] = 1;                  // 数字 7 对应下标 1，并非数组的第 7 个位置
```

键唯一，值可以重复；重复写同一个键会更新它对应的值，不会新增一条记录。容器基于哈希，不保证遍历顺序。如果只需要判断是否出现，选 `unordered_set`；需要附带下标、次数或一组数据时，选 `unordered_map`。

### 本题已经用到的 API：find、end、[]

```cpp
auto it = hash_table.find(temp);      // 按键查找补数 temp
if (it != hash_table.end()) {         // 找到了才可以访问 it 指向的记录
    return {it->second, i};           // 已有数字的下标、当前数字的下标
}
hash_table[cur_num] = i;              // 不存在就插入，存在就更新下标
```

- `find(key)` 返回迭代器，不直接返回值或 true/false；`auto` 让编译器推导迭代器类型。
- `end()` 是“末尾之后”的标记，也表示查找失败，不能解引用，不能访问它的 `first` 或 `second`。
- 每条记录是 `pair<const Key, Value>`。`it->first` 是键（本题的数字），`it->second` 是值（本题的下标）；`it->second` 等价于 `(*it).second`。
- 键不能通过迭代器修改；值可以，例如 `it->second = 5`。
- `[]` 按键访问并返回值的引用。键不存在时会先插入默认值：`int` 为 0、`string` 为空字符串、`vector` 为空容器。

### 常用 API 速查

下面的 `mp` 是 `unordered_map<int, int>`。先掌握查询、写入、删除和遍历，其余接口遇到时再复习。

| 写法 | 含义 / 返回值 | 键不存在时 |
| --- | --- | --- |
| `mp.find(k)` | 指向记录的迭代器 | 返回 `mp.end()`，不插入 |
| `mp.count(k)` | 键的数量，只会是 0 或 1 | 返回 0，不插入 |
| `mp[k]` | 值的引用，可读可写 | 插入 `{k, 0}` 并返回值的引用 |
| `mp.at(k)` | 值的引用，可读可写 | 抛出 `std::out_of_range`，不插入 |
| `mp[k] = v` | 插入或覆盖值 | 插入 `{k, v}` |
| `mp.insert({k, v})` | 返回 `pair<iterator, bool>`；已有键时不覆盖 | 插入，返回值的 `second` 为 true |
| `mp.emplace(k, v)` | 构造并尝试插入；返回值同 `insert`，已有键时不覆盖 | 插入 |
| `mp.erase(k)` | 按键删除，返回删除数量 0 或 1 | 返回 0 |
| `mp.erase(it)` | 删除迭代器指向的记录，返回下一个迭代器 | 必须传有效迭代器，不能传 `end()` |
| `mp.erase(first, last)` | 删除迭代器区间 `[first, last)`，返回区间之后的迭代器 | 区间必须有效 |
| `mp.size()` / `mp.empty()` | 键值对数量 / 是否为空 | — |
| `mp.clear()` | 删除全部记录，返回 void | — |
| `mp.begin()` / `mp.end()` | 遍历起点 / 终点；空表时两者相等 | — |
| `mp.cbegin()` / `mp.cend()` | 只读迭代器，不能用它修改值 | — |
| `mp.swap(other)` | 交换两个同类型容器的内容 | — |
| `mp.equal_range(k)` | 返回匹配记录的迭代器区间；本容器最多一条 | 返回一对相等的迭代器 |

创建时也可以初始化：`unordered_map<int, int> mp = {{2, 0}, {7, 1}};`。

#### find、count、[]、at 怎么选

只判断存在：`mp.count(k) != 0`。判断存在并取值：`find` 一次查找就能完成。

```cpp
auto it = mp.find(k);
if (it != mp.end()) {
    int value = it->second;
    // 在这里使用 value
}
```

需要插入、覆盖或计数时用 `[]`；确信键存在并希望缺失时抛异常，可以用 `at`。不要用 `if (mp[k])` 判断键存在：它会插入缺失的键，而且已有键的值为 0 时也会被判为 false。

你在 `lc_1.cpp` 中保留的 `count` 解法也成立：先用 `count(temp)` 判断存在，再用 `hash_table[temp]` 取下标。逻辑与运算有短路行为，左边为 false 就不计算右边。因为先查再插，表中下标一定小于 i，所以 `i != hash_table[temp]` 可以省略。`find` 写法则能直接复用查找结果。

#### [] 与 insert / emplace 的区别

```cpp
unordered_map<int, int> mp;
mp[7] = 1;
mp[7] = 4;                         // 覆盖：现在 7 对应 4
auto result = mp.insert({7, 9});   // 不覆盖：仍然对应 4
// result.first 指向键 7 的记录，result.second 为 false
auto added = mp.emplace(2, 0);     // 插入新键，added.second 为 true
```

注意有两种 `second`：`result.second` 是“是否成功插入”的 bool；`result.first->second` 才是容器里保存的值。

### 两数之和为什么先查再插

处理下标 i 时，表中只保存 `[0, i)` 的数字。先查 `target - nums[i]`，找到的下标必定来自前面，不会使用同一个元素两次。

用 `nums = {3, 3}`、`target = 6` 理解：

| i | 当前数字 | 要找的补数 | 查询前的表（数字 → 下标） | 下一步 |
| --- | --- | --- | --- | --- |
| 0 | 3 | 3 | 空 | 没找到，写入 `3 → 0` |
| 1 | 3 | 3 | `3 → 0` | 找到，返回 `{0, 1}` |

如果先插入当前数字，再查补数，第一个 3 就可能与自己匹配。重复数字不会自动保留多个下标；本题找到解就返回，否则覆盖为较新的下标仍可作为后续候选。

### 后续刷题常用的两种映射

```cpp
// 数字 → 出现次数：[] 在键缺失时从 0 开始，正好适合计数
unordered_map<int, int> freq;
for (int x : nums) {
    ++freq[x];
}
// freq.count(x) 仍只表示键存在与否；freq[x] 才是我们记录的次数

// 字符串 → 一组字符串：键缺失时会创建一个空 vector
unordered_map<string, vector<string>> groups;
groups["aet"].push_back("eat");
groups["aet"].push_back("tea");
```

计数降到 0 不会自动删除键，`freq.count(x)` 仍然是 1；需要移除时调用 `freq.erase(x)`。这些写法分别可用于频次统计、字母异位词分组等题。

### 遍历与删除

```cpp
for (const auto& entry : mp) {      // 引用避免复制；const 表示这里只读取
    cout << entry.first << " " << entry.second << '\n';
}

for (auto& entry : mp) {
    ++entry.second;                // 可以修改值，不能修改键
}

for (auto it = mp.begin(); it != mp.end(); ) {
    if (it->second == 0) {
        it = mp.erase(it);         // 用返回的迭代器继续，不能再递增已删除的 it
    } else {
        ++it;
    }
}
```

没有固定遍历顺序，不能用它取“最小键”或按键排序。需要按键有序遍历时考虑 `map`；`map` 的查询、插入和按键删除通常是 O(log n)。

### 容量、桶与迭代器失效（了解即可）

| 写法 | 用途 |
| --- | --- |
| `mp.reserve(n)` | 按预计容纳 n 个元素预留桶，减少后续扩容；不会新增键，`size()` 不变 |
| `mp.rehash(n)` | 调整桶数，使桶数至少满足 n 和当前装载需求；n 是桶数，不是元素数 |
| `mp.bucket_count()` | 当前桶数量 |
| `mp.bucket(k)` | 键 k 会落入哪个桶，不要求键已存在 |
| `mp.bucket_size(b)` | 第 b 个桶内的元素数量 |
| `mp.load_factor()` | 当前装载因子：元素数量 / 桶数量 |
| `mp.max_load_factor()` | 查询最大装载因子阈值；传入正数可设置，例如 `mp.max_load_factor(0.7f)` |
| `mp.begin(b)` / `mp.end(b)` | 只遍历第 b 个桶；b 必须是有效桶下标 |
| `mp.hash_function()` / `mp.key_eq()` | 获取哈希函数对象 / 键相等判断对象 |

设置最大装载因子时，通常先设置再 `reserve`。预留空间不能消除哈希冲突，也不保证最坏 O(1)。

插入导致 rehash 时，所有迭代器会失效；`rehash` 后不要使用旧迭代器，调用 `reserve` 后也应重新获取。rehash 不会使已有元素的引用和指针失效；删除元素则会使指向该元素的迭代器、引用和指针失效。因此不要一边范围遍历，一边用 `[]` 添加新键；遍历删除时用上面的 `erase(it)` 模板。

### 复杂度与版本提醒

设表中有 m 个键，哈希和键比较本身为 O(1) 时，`find`、`count`、`[]`、`at`、单条插入、按键删除通常平均 O(1)，最坏 O(m)。`size`、`empty` 为 O(1)，遍历和 `clear` 为 O(m)。字符串键还需要考虑哈希和比较字符串的成本。

两数之和平均时间 O(n)，最坏 O(n²)，额外空间 O(n)。本题选择哈希表的原因是减少反复查找补数的成本；哈希桶原理见 [hash_table.cpp](demo/hash_table.cpp)。

当前环境是 C++14：不能使用 C++17 的 `try_emplace`、`insert_or_assign`、`extract`、`merge`、结构化绑定 `auto [key, value]`，也不能使用 C++20 的 `contains`。本节使用的接口和遍历写法均适用于 C++14。

扩展接口可查 [C++ 标准草案：unordered_map](https://eel.is/c++draft/unord.map)和[无序关联容器要求](https://eel.is/c++draft/unord.req)。草案包含新标准接口，查阅时注意版本；本笔记优先保留刷题常用写法。

### 自查

- [ ] 能解释本题为什么保存“数字 → 下标”，而不是“下标 → 数字”。
- [ ] 能解释 `find` 的返回值、`end()` 和 `it->second`。
- [ ] 能说明 `[]` 为什么会改变容器，为什么不能用 `if (mp[k])` 判断存在。
- [ ] 能区分 `[] = v` 和 `insert` / `emplace` 对已有键的行为。
- [ ] 能用 `{3, 3}` 解释为什么先查补数再插入。
- [ ] 能区分 `freq.count(x)` 与 `freq[x]`，并说明平均与最坏复杂度。

## 后续笔记模板

遇到新知识点时复制下面的结构；遇到已有知识点时在原条目中补充。

```markdown
## 知识点名称

来源：[题名](相对路径.cpp)。

### 使用场景

这道题需要解决什么问题，为什么选它。

### 关键写法

保留能说明新用法的最小代码片段。

### 易错点

记录实际遇到的错误和原因。

### 复杂度

说明关键操作和整道题的时间、空间复杂度。
```
