# C++14 刷题笔记

这份笔记分两篇：

- **基础篇（A–E）**：C++ 语法和 STL 容器，讲常用 API 的返回值、副作用和写法。按字母编号，用到新容器时往后加 F、G……，已有编号不变。
- **方法篇（1、2……）**：每一章用了什么方法、什么时候想到它、容易错在哪。章号就是学习路线的 Day，节号就是章节目录：1.1 = `Day01_hash_array_matrix/01_hash/`，和[学习路线](学习路线.md)的编号一致。题目只在方法表里占一行；难题的完整讲解放在题目代码旁边，从方法表链接过去。

阅读约定：正文是必须掌握的内容，折叠起来的“进阶”遇到再看。正文的代码摘自自己的源码，部分行尾注释是笔记补充的；进阶里的示例是通用写法。每章最后一节是自查，复习后自己勾选。

**目录**

- 基础篇：[A 刷题代码的结构](#ch-a) · [B 类型、引用与 auto](#ch-b) · [C 迭代器与 pair](#ch-c) · [D vector 与 string](#ch-d) · [E 哈希容器](#ch-e)
- 方法篇：[1 Day01：哈希、数组技巧、矩阵](#ch-1)
- [附录：新增内容的写法](#ch-appendix)

<a id="ch-a"></a>

## A 刷题代码的结构

### A.1 一个本地文件的结构

五道题的文件结构相同。以 lc_560.cpp 为例（省略了函数体）：

```cpp
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) { /* …… */ }
};
int main(){
    int n, k;
    cin >> n >> k;
    vector<int> nums(n);
    for(int i = 0; i < n; i++)
        cin >> nums[i];
    Solution solution;
    int result = solution.subarraySum(nums, k);
    cout<< result;
    return 0;
}
```

- `#include <bits/stdc++.h>`：GCC 的“万能头文件”，一次包含整个标准库。练习和大多数 OJ 可以用；MSVC 没有它，换编译器时要写具体头文件，如 `<vector>`、`<string>`、`<unordered_map>`、`<algorithm>`、`<iostream>`（[demo/hash_table.cpp](demo/hash_table.cpp) 就是这样写的）。
- `using namespace std;`：之后可以直接写 `vector`、`cout`，不用写 `std::vector`。
- `class Solution` 加 `public:`：沿用 LeetCode 的格式；不写 `public:`，`main` 就调用不了里面的函数。
- 调用方式有两种：先建对象 `Solution solution;` 再调用（lc_1、lc_49、lc_128、lc_560）；或者建一个临时对象直接调用 `Solution().containsDuplicate(nums)`（lc_217）。
- 输入格式由自己约定，例如 lc_560 先读 `n k`，再读 n 个数：输入 `6 3` 和 `1 2 -2 2 1 2`，输出 6。
- `cout` 输出 `bool` 时显示 1 或 0（lc_217 输出 0）；想显示 true/false，先写 `cout << boolalpha;`。
- `main` 结尾不写 `return 0;` 也等于返回 0（lc_1、lc_128 就没写）。这条规则只对 `main` 成立，其他有返回值的函数必须写 `return`。

### A.2 看懂编译警告

项目用 `-Wall -Wextra` 编译。警告不会阻止生成程序，但常常指向真实的 bug。按 `Ctrl+Shift+B` 编译后，在“问题”面板或终端输出里看。本仓库出现过这几种：

| 警告 | 出现在 | 含义 | 怎么处理 |
| --- | --- | --- | --- |
| `-Wsign-compare` | lc_1、lc_49、lc_128 的 `i < nums.size()` | `int` 和无符号数比较 | 这里无害；真正的坑见 D.2 |
| `-Wunused-variable` | lc_560 注释里的原始解法，取消注释后编译 | `int cur_num = nums[i];` 定义了但没用 | 删掉即可，不影响结果 |
| `structured bindings only available with -std=c++17` | lc_49 解法一原来的写法 | 用了 C++17 语法 | 改成 C++14 写法，见 A.3 |

### A.3 C++14 的边界

项目用 `-std=c++14` 编译，下面这些不能用：

| 写法 | 所属标准 | C++14 的替代 |
| --- | --- | --- |
| `for (const auto& [key, vec] : mp)`（结构化绑定） | C++17 | `entry.first`、`entry.second`，见 C.4 |
| `mp.try_emplace(k, v)` | C++17 | `mp.emplace(k, v)`，同样不覆盖已有键 |
| `mp.insert_or_assign(k, v)` | C++17 | `mp[k] = v` |
| `mp.contains(k)` | C++20 | `mp.count(k)` 或 `mp.find(k) != mp.end()` |

g++ 在 C++14 模式下遇到结构化绑定只给警告，仍然放行；但它不属于 C++14，换编译器或加严格选项（如 `-pedantic-errors`）会直接报错。

### A.4 自查

- [ ] 熟悉 vector、string、unordered_map、unordered_set、map、set 的常用操作。
- [ ] 熟悉 stack、queue、priority_queue、sort 和比较函数。
- [ ] 能编写 main() 处理输入输出，把算法逻辑放在独立函数中。
- [ ] 能使用断点检查变量；注意下标越界、整数溢出和空输入。
- [ ] 树和链表题能自己定义节点、构造样例并调用解法。

<a id="ch-b"></a>

## B 类型、引用与 auto

### B.1 int 与数据范围

`int` 的范围约是 ±2.1×10⁹（2³¹ − 1），`long long` 约是 ±9.2×10¹⁸。动手前看一眼题目的数据范围，估算中间结果最大有多大，可能超过 `int` 就用 `long long`。

- LC1：`int temp = target - cur_num;` 最大为 2×10⁹，刚好没有超过。
- LC560：前缀和的绝对值不超过 2×10⁴ × 1000 = 2×10⁷；答案最多 n(n+1)/2 ≈ 2×10⁸，都在 `int` 范围内。

### B.2 引用与 const：参数为什么写 `&`

```cpp
int subarraySum(vector<int>& nums, int k)             // lc_560.cpp
int longestConsecutive(const vector<int>& nums)       // lc_128.cpp
```

- 不写 `&`：函数拿到的是整个 vector 的**副本**，复制要 O(n) 的时间和空间。
- 写 `&`：参数是调用方那个 vector 的**别名**，不复制；在函数里修改，调用方的数据也跟着变。
- 写 `const &`：不复制，也不允许修改，改了会编译报错。LC128 只读数组，用 `const vector<int>&` 最准确。LeetCode 给的函数签名习惯写不带 `const` 的 `vector<int>&`，只读时两者都能用。

引用在局部变量上一样重要。[demo/hash_table.cpp](demo/hash_table.cpp) 的 `insert` 里：

```cpp
auto& bucket = buckets[index];
```

`bucket` 是那个桶本身，后面的 `bucket.push_back({key, value});` 才真正放进哈希表。如果写成 `auto bucket = buckets[index];`，拿到的是副本，插入的元素随副本一起丢掉，而且编译器不会报错。`find` 只读不改，所以写的是 `const auto& bucket`。

### B.3 auto 与范围 for

`auto` 让编译器按右边推导类型：

```cpp
auto it = hash_table.find(temp);   // lc_1.cpp：it 的完整类型是 unordered_map<int, int>::iterator
```

`auto` 推导时会去掉引用：`auto x = v[0];` 得到的是副本，要引用得写 `auto&`。

范围 for 的三种写法：

| 写法 | 含义 | 什么时候用 |
| --- | --- | --- |
| `for (int x : nums)` / `for (auto x : nums)` | 每次复制一个元素 | 元素是 `int` 这类小类型，只读 |
| `for (auto& x : v)` | 引用，可以修改原元素 | 要改元素时。demo 的 `insert` 用 `for (auto& entry : bucket)` 更新 `entry.value` |
| `for (const auto& x : v)` | 引用，只读，不复制 | 元素是 `string`、`vector`、`pair` 这类大对象时。lc_128 的 `for(const auto& num : hash_set)` |

lc_49 的 `main` 写的是 `for (auto& group : results)`，只读的话写 `const auto&` 更准确，两种都能运行。范围 for 背后其实是迭代器，见 C.4。

### B.4 自查

- [ ] 能根据数据范围判断 `int` 是否够用。
- [ ] 能说明参数写 `vector<int>&`、`const vector<int>&` 和不写 `&` 的区别。
- [ ] 能解释 demo 的 `insert` 为什么必须写 `auto& bucket`。

<a id="ch-c"></a>

## C 迭代器与 pair

`find` 返回的 `it`、`it->second`、范围 for 里的 `entry.second`，都建立在这一章上。

### C.1 迭代器是什么

迭代器表示容器里的**一个位置**，用法像指针：可以指向某个元素，也可以往后移动。每个容器都提供两个特殊位置：

- `begin()`：第一个元素的位置。
- `end()`：最后一个元素**之后**的位置。它不指向任何元素，只用来标记“到头了”。

```text
string cur_str = "tea";

   index:   0     1     2
          +-----+-----+-----+
          |  t  |  e  |  a  |
          +-----+-----+-----+
             ^                 ^
          begin()            end()
```

所以容器的全部元素是左闭右开区间 `[begin(), end())`；空容器的 `begin() == end()`。

最直观的例子是 LC49 的排序：

```cpp
sort(cur_str.begin(), cur_str.end());   // lc_49.cpp：把区间 [begin, end) 交给 sort，就是排序整个字符串
```

`find` 返回的也是迭代器：找到时指向那个元素，找不到时等于 `end()`，见 C.5。

### C.2 `*it` 与 `it->`：从位置取出元素

- `*it`：取出 it 指向的元素。得到的是元素的引用，可以读，也可以改（map 的键、set 的元素除外，见 C.3）。
- 元素带成员时（比如 C.3 的 pair），取成员要写 `(*it).second`。这个写法太常用，C++ 提供了简写 `it->second`，两者完全等价。
- 括号不能省：`*it.second` 会先算 `it.second`，因为 `.` 比 `*` 先结合。迭代器本身没有 `second` 这个成员，所以编译报错。
- 指针也是同样的规则：`p->key` 就是 `(*p).key`。

### C.3 pair：first 和 second

`pair<A, B>` 把两个值绑成一个小结构体，成员名固定叫 `first` 和 `second`。

[demo/hash_table.cpp](demo/hash_table.cpp) 里自己写过一个键值对：

```cpp
struct Entry {
    int key;
    int value;
};
```

`unordered_map<int, int>` 的每个元素都是 `pair<const int, int>`，和 `Entry` 是一回事，只是成员换了名字：

| demo 里的 Entry | unordered_map 的元素 | 含义 |
| --- | --- | --- |
| `entry.key` | `entry.first` | 键 |
| `entry.value` | `entry.second` | 值 |

用迭代器看一个元素：

```text
auto it = hash_table.find(7);      // 假设表里有 7 -> 1

   it --->  +---------+----------+
            |  first  |  second  |
            |    7    |    1     |
            +---------+----------+

it->first  是键 7，不能改
it->second 是值 1，可以改
```

- 键前面有 `const`，不能改：元素放在哪个桶由键决定（E.1），改了键就再也找不到它了。值可以改，例如 `it->second = 5`、`freq[temp_sum]++`。
- `unordered_set<int>` 的元素就是 `int` 本身，没有 `first`、`second`：`*it` 直接是数字。lc_128 的 `for(const auto& num : hash_set)` 中，`num` 就是 `int`。set 的元素本身就是键，同样不能通过迭代器修改。
- pair 也会出现在返回值里：`insert` 返回 `pair<迭代器, bool>`，见 E.3 的进阶部分。

### C.4 什么时候用 `.`，什么时候用 `->`

看手里拿的是什么：拿着**元素**（或元素的引用）用 `.`；拿着**迭代器**（或指针）用 `->`。

| 代码 | 变量是什么 | 取值 |
| --- | --- | --- |
| `auto it = hash_table.find(temp);`（lc_1） | 迭代器 | `it->second` |
| `auto it = strhashtable.find(cur_str);`（lc_49 解法二） | 迭代器 | `result[it->second]` |
| `for (const auto& entry : hash_table)`（lc_49 解法一） | 元素的引用 | `entry.second` |
| `for (auto& entry : bucket)`（demo 的 `insert`） | 元素的引用 | `entry.value` |

范围 for 其实是迭代器循环的简写，编译器替你做了 `*it` 这一步：

```cpp
for (const auto& entry : hash_table) {                        // lc_49 解法一的写法
    results.push_back(entry.second);
}

for (auto it = hash_table.begin(); it != hash_table.end(); ++it) {  // 大致等价的迭代器写法
    const auto& entry = *it;                                  // 先取出元素
    results.push_back(entry.second);                          // 这里也可以直接写 it->second
}
```

### C.5 end()：查找失败的信号

`end()` 不指向任何元素，对它用 `*` 或 `->` 是未定义行为：可能崩溃，也可能读到垃圾值而不报错。所以 `find` 之后的固定写法是先比较、再使用：

```cpp
auto it = hash_table.find(temp);   // lc_1.cpp
if (it != hash_table.end()) {      // 先确认找到了
    return {it->second, i};        // 再用 it->
}
```

LC128 反过来用：`== hash_set.end()` 表示“不存在”，以此判断一个数是不是序列起点。

```cpp
if(hash_set.find(num - 1) == hash_set.end()){ // 起点：左边没有
```

### C.6 迭代器失效（进阶）

<details>
<summary>容器结构变化后，旧的迭代器可能不能再用</summary>

- vector：`push_back` 引发扩容时，所有迭代器、引用、指针都失效。
- unordered_map / unordered_set：插入引发扩容（rehash，见 E.1）时，所有迭代器失效，但元素的引用和指针仍然有效；`erase` 只让被删元素的迭代器、引用、指针失效。
- 遍历时删除要用 `erase` 的返回值继续，写法见 E.3 的进阶部分。

实际写题时记住一条：拿到迭代器后，不要在中间插入元素再接着用它。

</details>

### C.7 自查

- [ ] 能说出 `begin()`、`end()` 各指向哪里，以及 `end()` 为什么不能解引用。
- [ ] 能解释 `it->second` 和 `(*it).second` 的关系，以及 `*it.second` 为什么是错的。
- [ ] 能说出 `unordered_map<int, int>` 的元素类型，以及 `first`、`second` 分别是什么。
- [ ] 能判断什么时候用 `.`、什么时候用 `->`。

<a id="ch-d"></a>

## D vector 与 string

### D.1 创建与读入

```cpp
vector<int> nums(n);          // lc_560.cpp：先开好 n 个位置，初始都是 0
for(int i = 0; i < n; i++)
    cin >> nums[i];           // 再按下标读入
```

- 不知道有多少个元素时，先建空的 `vector<int> nums;`，再用 `push_back` 追加。
- `nums[i]` 不检查越界，越界是未定义行为；`nums.at(i)` 会检查，越界时抛异常。

### D.2 size() 是无符号数

`nums.size()` 返回无符号整数 `size_t`，拿 `int` 和它比较会触发 `-Wsign-compare` 警告：

```cpp
for (int i = 0; i < nums.size(); i++) {   // lc_1.cpp：有警告，但这里结果正确
```

i 从 0 开始往上加，这里不会出错。真正出错的是减法：空数组的 `nums.size() - 1` 不是 −1，而是一个极大的无符号数，`i < nums.size() - 1` 会一直成立，接着越界访问。lc_217、lc_560 的写法避开了这个问题：

```cpp
int n = nums.size();   // 先存成 int，后面都和 n 比较
```

### D.3 返回与追加

```cpp
return {it->second, i};   // lc_1.cpp：用两个 int 直接构造返回的 vector<int>
return {};                // 返回空 vector
```

调用方要注意：返回空 vector 时不能读 `result[0]`。lc_1 的 `main` 直接输出 `result[0]`、`result[1]`，依赖题目保证一定有解。

二维 vector 用来存分组（lc_49 解法二）：

```cpp
vector<vector<string>> result;
result[it->second].push_back(strs[i]);     // 追加到已有的组
result.push_back({strs[i]});               // 新建一个只含 strs[i] 的组
strhashtable[cur_str] = result.size()-1;   // 新组的下标；刚 push_back 过，size() 至少是 1
```

### D.4 string：复制后排序

```cpp
string cur_str = strs[i];               // lc_49.cpp 解法二：先复制
sort(cur_str.begin(), cur_str.end());   // 只排序副本，strs[i] 保持原样，留作答案
```

`sort` 接收一对迭代器（C.1）。对长度为 L 的字符串，排序是 O(L log L)。

### D.5 自查

- [ ] 能解释 `-Wsign-compare` 从哪里来，以及空数组时 `size() - 1` 会出什么问题。
- [ ] 能说明 `result.push_back({strs[i]})` 和 `result[k].push_back(strs[i])` 的区别。

<a id="ch-e"></a>

## E 哈希容器

### E.1 哈希表原理

`unordered_set` 和 `unordered_map` 都是哈希表：

1. 哈希函数把键算成桶下标，直接定位到这个桶，不用从头找。
2. 不同的键可能落进同一个桶（哈希冲突），所以桶里还要逐个比较原始键。
3. 元素个数 ÷ 桶数叫装载因子。装载因子超过上限时，容器自动增加桶数，把元素重新分桶（rehash）。

分布均匀时，查找、插入、删除平均 O(1)；大量冲突时，元素挤在少数桶里，单次操作退化到 O(n)。所以用了哈希的题，复杂度要说“平均 O(n)”，最坏情况另说。

动手看：[demo/hash_table.cpp](demo/hash_table.cpp) 用 8 个桶、对 8 取余，1、9、17 都落进 1 号桶。在 `find` 里打断点，单步观察 `index` 和 `comparisons`。

`unordered_*` 的遍历顺序不固定。需要按键有序遍历时用 `map` / `set`：它们是平衡二叉搜索树，操作 O(log n)，遍历按键从小到大。

### E.2 unordered_set

**什么时候选**：只关心“这个值有没有出现过”。如果还要附带下标、次数或一组数据，换成 unordered_map（E.3）。

#### E.2.1 必会 API

下面的 `seen` 是 `unordered_set<int>`：

| 写法 | 返回什么 | 说明 |
| --- | --- | --- |
| `seen.insert(x)` | `pair<迭代器, bool>` | 已有 x 时不插入，集合不变 |
| `seen.count(x)` | 0 或 1 | 集合里等于 x 的元素个数，不是原数组里 x 出现了几次 |
| `seen.find(x)` | 迭代器 | 找不到时等于 `seen.end()`（C.5） |
| `seen.size()` | 元素个数 | 重复插入不会增加 |

#### E.2.2 源码摘录

```cpp
// lc_217.cpp：count 返回 1 会被当作 true
if (seen.count(nums[i])) {
    return true;
}
seen.insert(nums[i]);
```

判断存在，`count(x)` 和 `find(x) != end()` 都可以；判断不存在，用 `count(x) == 0` 或 `find(x) == end()`（lc_128 的写法见 C.5）。

#### E.2.3 易错点

- 没有 `[]`，写 `seen[x]` 编译不过。
- C++14 没有 `contains`，见 A.3。
- 遍历顺序不固定，不能靠它得到有序结果。

<details>
<summary>进阶：用 insert 的返回值合并“查”和“插”；删除与清空</summary>

`insert` 返回值的 `.second` 表示这次是否真的插进去了，可以把 LC217 的查询和插入合成一步：

```cpp
if (!seen.insert(x).second) {
    return true;   // 没插进去，说明 x 已经存在
}
```

`seen.erase(x)` 返回删除的个数（0 或 1）；`seen.clear()` 清空；`seen.empty()` 判断是否为空。

</details>

用过的题：LC217、LC128（1.1）。

### E.3 unordered_map

**什么时候选**：除了“有没有”，还要取回附带的信息：下标（LC1）、一组字符串（LC49）、次数（LC560）。键唯一，值可以重复；对同一个键再写一次是覆盖，不会多出一条。每个元素是 `pair<const 键, 值>`，用法见 C.3、C.4。

#### E.3.1 查询与写入：返回值和副作用

| 写法 | 返回什么 | 键不存在时 | 适合 |
| --- | --- | --- | --- |
| `mp.count(k)` | 0 或 1 | 返回 0，表不变 | 只判断有没有 |
| `mp.find(k)` | 迭代器 | 返回 `mp.end()`，表不变 | 判断并取值，只查一次 |
| `mp[k]` | 值的引用 | **先插入** `{k, 默认值}`，再返回它 | 写入、计数、分组 |
| `mp.at(k)` | 值的引用 | 抛出 `std::out_of_range`，表不变 | 确定存在时读取 |

默认值：`int` 是 0，`string` 是空串，`vector` 是空 vector。

`[]` 的副作用可以用 [demo/main.cpp](demo/main.cpp) 验证：

```cpp
// demo/main.cpp（节选）
mp[1] = 2;
mp[2] = 3;
// ……
cout << "键3的值: " << mp[3] << endl; // 会插入 (3,0)
// ……
mp.erase(2);
// ……
cout << "大小: " << mp.size() << endl;
```

运行输出 `键3的值: 0` 和 `大小: 2`。如果读 `mp[3]` 没有插入，删掉键 2 以后只剩键 1，大小应该是 1。

所以不要用 `if (mp[k])` 判断键在不在：键不存在时它会被插入；键存在但值是 0 时，又会被当成 false。

#### E.3.2 源码摘录：find、count、[]

```cpp
// lc_1.cpp（find 解法）：查一次，找到就直接用迭代器取值
auto it = hash_table.find(temp);
if (it != hash_table.end()) {
    return {it->second, i};
}

hash_table[cur_num] = i;   // 不存在就插入，存在就覆盖
```

```cpp
// lc_1.cpp（count 解法，注释保留）
if(hash_table.count(temp) and i != hash_table[temp]){
    return {hash_table[temp], i};
}
```

count 解法也正确。`and` 就是 `&&`，count 为 0 时右边不会执行，所以这里的 `[]` 只会读已经存在的键，不会插入。代价是同一个键要查两到三次，find 解法只查一次。`i != hash_table[temp]` 可以省略：先查后插，表里的下标都小于 i。

```cpp
freq[temp_sum]++;                            // lc_560.cpp：计数，键不存在时从 0 加到 1
hash_table[cur_string].push_back(strs[i]);   // lc_49.cpp 解法一：分组，键不存在时先建一个空 vector
```

计数减到 0 时键不会自动消失，`count` 仍然是 1；要删掉用 `mp.erase(k)`。

#### E.3.3 遍历

```cpp
// lc_49.cpp 解法一
for (const auto& entry : hash_table) {   // entry 的类型是 pair<const string, vector<string>>
    results.push_back(entry.second);     // entry.first 是键
}
```

这一段原来写成 `for (const auto& [key, vec] : hash_table)`，那是 C++17 的结构化绑定（A.3）。遍历时可以改值（去掉 `const`，改 `entry.second`），不能改键（C.3）。

#### E.3.4 易错点

- `[]` 会插入，见上面的 demo。
- `insert` / `emplace` 遇到已有键不覆盖，`[] = v` 会覆盖，见下面的进阶。
- 不要一边范围遍历，一边用 `[]` 添加新键（C.6）。

<details>
<summary>进阶：insert / emplace 不覆盖；遍历中删除；扩容</summary>

**`[]` 会覆盖，`insert` / `emplace` 不会**

```cpp
unordered_map<int, int> mp;
mp[7] = 1;
mp[7] = 4;                        // 覆盖：7 对应 4
auto result = mp.insert({7, 9});  // 已有键 7，不覆盖，仍然是 4
// result.second 是 false（没插入）；result.first->second 才是表里的值 4
auto added = mp.emplace(2, 0);    // 新键，插入成功，added.second 是 true
```

`result` 是 `pair<迭代器, bool>`，所以有两个 `second`：`result.second` 表示是否插入成功；`result.first` 是指向元素的迭代器，`result.first->second` 才是表里存的值（C.3、C.4）。

**遍历时删除**

```cpp
for (auto it = mp.begin(); it != mp.end(); ) {
    if (it->second == 0) {
        it = mp.erase(it);   // erase 返回下一个位置；已删除的 it 不能再 ++
    } else {
        ++it;
    }
}
```

**扩容**：`mp.reserve(n)` 按预计要放 n 个元素预留桶，减少扩容次数，不会增加元素。扩容对迭代器的影响见 C.6。

完整接口查 [cppreference：unordered_map](https://en.cppreference.com/w/cpp/container/unordered_map)；页面上标注 C++17、C++20 的接口，当前配置不能用。

</details>

用过的题：LC1、LC49、LC560（1.1）。

### E.4 自查

- [ ] 能说明平均 O(1) 的查找为什么仍有最坏 O(n) 的情况。
- [ ] 能解释为什么 LC217 用 set，不需要 map。
- [ ] 能解释 `count` 为什么只能返回 0 或 1。
- [ ] 能解释 `find` 的返回值、`end()` 和 `it->second`。
- [ ] 能说明 `[]` 为什么会改变容器，为什么不能用 `if (mp[k])` 判断存在。
- [ ] 能区分 `freq.count(x)` 与 `freq[x]`，并说明平均与最坏复杂度。
- [ ] 能说明 `[]` 如何创建空 vector，并写出 C++14 遍历方式。
- [ ] 能区分 `[] = v` 和 `insert` / `emplace` 对已有键的行为。

<a id="ch-1"></a>

## 1 Day01：哈希、数组技巧、矩阵

1.1 = `01_hash`，1.2 = `02_array`，1.3 = `03_matrix`。数组技巧和矩阵学到时再写。

### 1.1 哈希

代码在 [Day01_hash_array_matrix/01_hash/](Day01_hash_array_matrix/01_hash/)。原站：[哈希表使用基础](https://codefun2000.com/codenote/hot100/P0018) · [哈希专题](https://codefun2000.com/codenote/hot100/P0017)。容器用法见 E.2、E.3。

#### 1.1.1 什么时候想到哈希

暴力解法里有一层循环只是为了“找某个值在不在、在哪、有几个”，就把这层查找交给哈希表，平均 O(1) 查到，代价是 O(n) 的额外空间。本章 LC217、LC1、LC560 都这样把 O(n²) 的双重循环降到平均 O(n)；LC128 用它避开 O(n log n) 的排序；LC49 用它把异位词归到一起，不必两两比较。

#### 1.1.2 设计哈希表：键、值、写入时机

1. 每一步要查什么？这决定**键**。
2. 查到之后还要什么信息？这决定**值**；什么都不需要就用 set。
3. 什么时候写入？这决定**正确性**：边遍历边写，还是先把表建完整。

下面三种用法就是这三个问题的不同答案。

#### 1.1.3 用法一：查“之前出现过的”（LC217、LC1、LC560）

遍历到位置 i 时，表里只有 i 之前的元素，所以**先查，再写入当前元素**：查到的一定是别的元素，不会和自己配对。

| 题 | 在表里查什么 | 值存什么 |
| --- | --- | --- |
| LC217 | x 本身 | 不需要，用 set |
| LC1 | 补数 `target - x` | 下标，因为要返回位置 |
| LC560 | `temp_sum - k` | 次数，因为要数出所有起点 |

从 217 到 1 再到 560，要查的东西越来越间接，值从“没有”变成“下标”再变成“次数”。LC560 是在前缀和上找“差为 k”的两个位置，和 LC1 找补数是同一个动作。

反例：LC1 的 `{3, 3}`、`target = 6`。处理第一个 3 时表是空的，查不到，写入 `3 → 0`；处理第二个 3 时查到下标 0，返回 `{0, 1}`。如果先写入再查，第一个 3 会查到自己。LC560 的 `[1]`、`k = 0` 同理。

#### 1.1.4 用法二：归类（LC49）

让同一组的东西得到同一个键。异位词排序后相同，eat、tea、ate 都变成 aet，排序后的串就是分组键。只排序副本，原串留作答案（D.4）。值有两种设计，源码里都保留了：

| 设计 | 容器 | 结果里组的顺序 |
| --- | --- | --- |
| 解法一：键 → 这一组 | `unordered_map<string, vector<string>>` | 最后遍历哈希表收集，顺序由哈希决定 |
| 解法二：键 → 组在 result 里的下标 | `unordered_map<string, int>` | 直接往 result 追加，按首次出现的顺序 |

输入 `eat tea tan ate nat bat` 时，解法二输出 `eat tea ate / tan nat / bat`；解法一在当前环境输出 `bat / tan nat / eat tea ate`。两者都对，题目不要求组的顺序。

#### 1.1.5 用法三：先建集合，再查邻居（LC128）

先把所有数放进 set，然后遍历这个集合（不是原数组，重复的数只处理一次），只从“没有 x − 1”的数开始向右数。`{100, 4, 200, 1, 3, 2}` 中只有 1、100、200 是起点，从 1 数到 4，长度 4；2、3、4 不会再各自向右数一遍。

有 while 也是平均 O(n)：每条连续序列只从起点数一次，所有序列的长度加起来就是元素个数。这里的“连续”指数值连续，不要求在原数组里相邻。

#### 1.1.6 前缀和 + 哈希计数（LC560）

子数组和 = 当前前缀和 − 前面某个前缀和。要它等于 k，就查前面有多少个前缀和等于 `temp_sum - k`。

```cpp
// lc_560.cpp
unordered_map<int, int> freq;  // 前缀和 -> 之前出现的次数
freq[0] = 1;  // 数组开始前的空前缀，使从下标 0 开始的子数组也能被统计

for(int i = 0; i < n; i++){
    temp_sum += nums[i];
    auto it = freq.find(temp_sum - k);
    if(it != freq.end()){
        count += it->second;
    }
    freq[temp_sum]++;
}
```

记住三点：`freq[0] = 1`；加的是次数，不是 1；先查询、再记录。数组有负数也成立，而滑动窗口在有负数时不成立。

从原始双循环一步步推到这里的完整讲解、手推表和动画：[LC560 讲解](Day01_hash_array_matrix/01_hash/lc_560_visual/README.md)。

#### 1.1.7 本章题目与复杂度

| 题 | 容器 | 表里存什么 | 关键一步 | 代码 |
| --- | --- | --- | --- | --- |
| 217 存在重复元素 | set | 见过的数 | 先查 x，查到就是重复 | [lc_217.cpp](Day01_hash_array_matrix/01_hash/lc_217.cpp) |
| 1 两数之和 | map | 数 → 下标 | 先查 `target - x`，再记当前 | [lc_1.cpp](Day01_hash_array_matrix/01_hash/lc_1.cpp) |
| 49 字母异位词分组 | map | 排序后的串 → 组 / 组下标 | 同组的词得到同一个键 | [lc_49.cpp](Day01_hash_array_matrix/01_hash/lc_49.cpp) |
| 128 最长连续序列 | set | 去重后的数 | 没有 `x - 1` 才向右数 | [lc_128.cpp](Day01_hash_array_matrix/01_hash/lc_128.cpp) |
| 560 和为 K 的子数组 | map | 前缀和 → 次数 | 先查 `temp_sum - k`，再记当前 | [lc_560.cpp](Day01_hash_array_matrix/01_hash/lc_560.cpp) · [讲解](Day01_hash_array_matrix/01_hash/lc_560_visual/README.md) |

复杂度：LC217、LC1、LC128、LC560 平均时间 O(n)，额外空间 O(n)。LC49 有 N 个串、最长 L，排序为主，时间 O(N·L·log L)，空间 O(N·L)。哈希严重冲突时单次操作会退化，最坏时间更高。

#### 1.1.8 易错点

- 先查后插的顺序写反，会和自己配对（LC1、LC560）。
- LC49 直接排序 `strs[i]` 会丢掉原来的字母顺序；要排序副本。
- LC128 少了“前驱不存在”的判断，同一条序列会从每个位置各数一遍，退化成 O(n²)。
- LC560 用 set 只记“出现过”会漏算：`{0, 0}`、`k = 0` 的答案是 3，只加 1 会得到 2。

#### 1.1.9 自查

- [ ] 能解释为什么先查再插。
- [ ] 能解释 LC1 为什么保存“数字 → 下标”，而不是“下标 → 数字”。
- [ ] 能用 `{3, 3}` 解释为什么先查补数再插入。
- [ ] 能说出 LC560 和 LC1 为什么是同一个查找动作。
- [ ] 能解释为什么相同排序结果对应同一组。
- [ ] 能区分“键 → 分组”与“键 → 组下标”两种设计。
- [ ] 能解释连续序列和原数组中连续下标的区别。
- [ ] 能说明为什么遍历去重后的集合。
- [ ] 能用“每条序列只从起点展开一次”解释平均 O(n)。
- [ ] 能从两个前缀和之差推导出要查询 `temp_sum - k`。
- [ ] 能解释为什么用 map 存次数，而不是用 set 存存在性。
- [ ] 能解释初始化 0 和先查后记录的作用。

<a id="ch-appendix"></a>

## 附录：新增内容的写法

**编号规则**

- 基础篇：新容器或新语法按第一次用到的顺序往后排，下一个是 F。节号是 F.1、F.2……，最后一节是自查。
- 方法篇：章号 = Day，节号 = 章节目录的序号（2.4 = `Day02_stack_two_pointers/04_sliding_window/`），和学习路线一致。小节是 2.4.1、2.4.2……，最后一小节是自查。
- 文中互相引用时直接写编号，如“见 C.4”。

**基础篇的一章**（第一次用到某个容器或语法时添加）

- 什么时候选它
- 必会 API：写法、返回什么、失败或不存在时怎样、适合做什么
- 源码摘录：一两段真实用法
- 易错点
- 进阶：放进 `<details>` 折叠
- 用过的题：写方法篇的节号
- 自查

**方法篇的一节**（开始一章时建立，做完一章补完整）

- 什么时候想到它
- 核心套路：一两句话，加最短的关键代码
- 本章题目：每题一行（题、用了什么、关键一步、代码；难题加讲解链接）
- 易错点
- 自查

**难题讲解**（按需）：放在题目代码旁边。有图就建 `lc_<题号>_visual/` 目录，里面的 `README.md` 写文字讲解；只有文字就写 `lc_<题号>.md`。再从本章题目表链接过去。
