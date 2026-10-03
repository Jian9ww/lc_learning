// 华为机试 21 题：核心路由器管理域规划（Bi-K-means，二分 K-means）
//
// 题意：给 L 个二维点（路由器的坐标）和目标簇数 N。一开始所有点是一个簇，
//       每一轮挑一个簇拆成两个，直到簇数达到 N。
//       每一轮结束后输出一行：各簇的点数，从大到小。最开始那一个簇算“第 0 轮”，也要输出。
//
// 每一轮怎么挑、怎么拆（题目“提示”里的规定）：
//   1. 把每个点数 >= 2 的簇都“试拆”一次：用 K = 2 的 K-means 分成两半。
//      初始质心必须是这个簇里 x 最小和 x 最大的两个点；
//      所有点的归属不再变化，或者两个质心的最大移动量 < 1e-6 时停止。
//   2. 算每个簇试拆后的 SSE 下降量 = SSE(父簇) - SSE(子簇 0) - SSE(子簇 1)。
//      SSE 是簇内每个点到质心（坐标平均值）的距离平方之和。
//   3. 真正拆开下降量最大的那个簇；下降量相同选点数多的；点数也相同选更早生成的。
//
// 程序结构（从上到下）：
//   getSSENumerator    算一个簇的 n × SSE（一定是整数）
//   splitCluster       对一个簇做 K = 2 的 K-means，返回两个子簇和 SSE 下降量（写成分数）
//   compareGrad        比较两个分数的大小
//   printClusterSizes  输出一行：各簇点数的降序
//   main               读入；循环“试拆所有簇 → 选一个 → 真正拆开 → 输出”
//
// 输入：第 1 行 N，第 2 行 L，接下来 L 行每行一个点 x y（整数，0 到 1000，各点的 x 互不相同）。
// 例：输入 2 / 3 / 1 1 / 2 2 / 6 6，输出两行：“3”和“2 1”。
// 详细讲解和动画见 21_visual/README.md；14 组用例在 21_cases/，每个分支都有用例走到。

#include <iostream>
#include <vector>
#include <algorithm>   // sort、max
#include <cmath>       // sqrt
#include <climits>     // 这个头文件里的东西（INT_MAX 等）程序里没用到，删掉也能编译
using namespace std;

// 一个点（一台路由器）。坐标是整数。
// 用 long long 而不是 int：后面要算 x * x 再累加、再相乘，中间结果会超过 int 的范围（约 2.1e9）。
struct Point {
    long long x;
    long long y;
};

// 一个质心。质心是坐标的平均值，一般不是整数，所以用浮点数。
// long double 是比 double 精度更高的浮点类型。
struct Center {
    long double x;
    long double y;
};

// 一个簇
struct Cluster {
    vector<Point> points;   // 这个簇里的所有点

    // 生成顺序，越小表示越早生成
    // 最初的簇是 0；之后每拆出一个子簇就发一个新编号（1、2、3……）。只在平局时用来比较。
    int birth;
};

// SSE = numerator / n
// 这个函数返回的是“分子”numerator，也就是 n × SSE。
//
// 为什么不直接返回 SSE：SSE 里有除法，结果可能是小数；小数有误差，
// 而后面要判断两个下降量“是否正好相等”。分子是整数，整数运算没有误差。
//
// 公式怎么来的（μx、μy 是质心坐标，sumX、sumY 是坐标之和，μx = sumX / n）：
//   SSE = Σ[(x - μx)² + (y - μy)²]
//       = Σ(x² + y²) - n·μx² - n·μy²            把平方展开，再用 Σx = n·μx 化简
//       = sumSquare - (sumX² + sumY²) / n
//   两边乘 n：n × SSE = sumSquare·n - sumX² - sumY²
long long getSSENumerator(const vector<Point>& pts) {   // const &：不复制、只读
    long long n = pts.size();   // 点数。存成 long long，下面要和别的 long long 相乘

    long long sumX = 0;         // 所有 x 的和
    long long sumY = 0;         // 所有 y 的和
    long long sumSquare = 0;    // 所有 x² + y² 的和

    for (const Point& p : pts) {   // 范围 for：p 依次是每个点的只读引用
        sumX += p.x;
        sumY += p.y;

        sumSquare += p.x * p.x + p.y * p.y;
    }

    // SSE =
    // sumSquare - (sumX^2 + sumY^2) / n
    //
    // =
    // [sumSquare*n - sumX^2 - sumY^2] / n

    // 范围：最多 100 个点，坐标最大 1000。sumSquare <= 100 × 2×10⁶ = 2×10⁸，
    // 再乘 n 最多 2×10¹⁰，long long（约 9.2×10¹⁸）装得下，int 装不下。
    // 只有 1 个点时结果是 0：x²·1 - x² + y²·1 - y² = 0。
    return sumSquare * n
           - sumX * sumX
           - sumY * sumY;
}

// 试拆一个簇得到的结果
struct SplitResult {
    vector<Point> child0;   // 0 号子簇：最后离“左边那个质心”更近的点
    vector<Point> child1;   // 1 号子簇：最后离“右边那个质心”更近的点

    // SSE下降量 = gradNum / gradDen
    // 下降量写成一个分数：分子 gradNum、分母 gradDen 都是整数，同样是为了没有误差。
    long long gradNum;
    long long gradDen;

    bool valid;             // 这次试拆是否成功。false 时上面几个成员都没有意义
};

// 对一个簇执行 K=2 的 K-means
// 参数 pts：这个簇的所有点。返回：两个子簇 + SSE 下降量。
// 步骤：选两个初始质心 → 循环（每个点归到更近的质心 → 重新算两个质心）→ 稳定后停 → 算下降量。
SplitResult splitCluster(const vector<Point>& pts) {
    SplitResult result;
    result.valid = false;       // 先标成“失败”，只有走到函数最后才改成 true

    int n = pts.size();

    // 少于 2 个点没法分成两个簇。
    // 【本程序里走不到】main 调用之前已经跳过了点数 < 2 的簇，这里是保险。
    if (n < 2) {
        return result;
    }

    // 找x坐标最小、最大的点
    // 题目规定：初始质心必须是 x 最小和 x 最大的两个点。记下标，不记坐标。
    // 题目保证各点的 x 互不相同，所以这两个点是唯一的，而且 n >= 2 时一定是两个不同的点。
    int minIndex = 0;
    int maxIndex = 0;

    for (int i = 1; i < n; i++) {             // 从 1 开始：下标 0 已经是初始的“最小”和“最大”
        if (pts[i].x < pts[minIndex].x) {
            minIndex = i;
        }

        if (pts[i].x > pts[maxIndex].x) {
            maxIndex = i;
        }
    }

    // c0：0 号质心，一开始放在 x 最小的点上。
    // (long double)：把整数坐标转换成浮点数。花括号按成员顺序赋值：第一个给 x，第二个给 y。
    Center c0 = {
        (long double)pts[minIndex].x,
        (long double)pts[minIndex].y
    };

    // c1：1 号质心，一开始放在 x 最大的点上。
    Center c1 = {
        (long double)pts[maxIndex].x,
        (long double)pts[maxIndex].y
    };

    vector<int> belong(n, -1);    // belong[i]：上一轮第 i 个点属于几号簇。n 个 -1 表示“还没分过”
    vector<int> newBelong(n);     // newBelong[i]：这一轮第 i 个点属于几号簇（0 或 1）

    // K-means 的主循环。while (true) 本身不会结束，靠循环体最后的 break 跳出。
    while (true) {

        // 1. 根据距离重新分簇
        for (int i = 0; i < n; i++) {

            long double dx0 = pts[i].x - c0.x;   // 第 i 个点到 0 号质心的横向差
            long double dy0 = pts[i].y - c0.y;   //                      纵向差

            long double dx1 = pts[i].x - c1.x;   // 到 1 号质心的横向差
            long double dy1 = pts[i].y - c1.y;

            // 距离的平方。比较远近不需要开根号：平方大的，距离也大。
            long double d0 = dx0 * dx0 + dy0 * dy0;
            long double d1 = dx1 * dx1 + dy1 * dy1;

            // 距离相同时归入0号簇
            // 这一条靠 <= 里的等号实现。题目没有明说，是这份代码的约定（判题机已通过）。
            if (d0 <= d1) {
                newBelong[i] = 0;
            } else {
                newBelong[i] = 1;
            }
        }

        // 判断归属是否不再变化
        // 拿这一轮的 newBelong 和上一轮的 belong 逐个比较。
        // 第一轮 belong 全是 -1，一定不相同，所以第一轮 same 一定是 false。
        bool same = true;

        for (int i = 0; i < n; i++) {
            if (belong[i] != newBelong[i]) {
                same = false;
                break;              // 发现一个不同就够了，不用再比
            }
        }

        // 2. 根据当前分簇重新计算质心
        // 质心 = 簇内所有点的坐标之和 ÷ 点数。先分别累加两个簇的坐标和、点数。
        long double sumX0 = 0;
        long double sumY0 = 0;
        long double sumX1 = 0;
        long double sumY1 = 0;

        int cnt0 = 0;               // 0 号簇的点数
        int cnt1 = 0;               // 1 号簇的点数

        for (int i = 0; i < n; i++) {

            if (newBelong[i] == 0) {
                sumX0 += pts[i].x;
                sumY0 += pts[i].y;
                cnt0++;
            } else {
                sumX1 += pts[i].x;
                sumY1 += pts[i].y;
                cnt1++;
            }
        }

        // 正常情况下不会产生空簇
        // 空簇不能算质心（会除以 0），所以直接返回“失败”。
        // 【本题数据下走不到】第一轮里 x 最小的点一定归 0 号、x 最大的点一定归 1 号；
        // 之后每个质心都是自己那一簇的平均位置，不可能所有点都离对面的质心更近。
        if (cnt0 == 0 || cnt1 == 0) {
            return result;
        }

        Center newC0 = {
            sumX0 / cnt0,           // 浮点数 ÷ 整数，结果是浮点数（不是整数除法）
            sumY0 / cnt0
        };

        Center newC1 = {
            sumX1 / cnt1,
            sumY1 / cnt1
        };

        // 质心移动了多远：新旧质心之间的直线距离。这里要和 1e-6 比较，所以开了根号。
        long double move0 =
            sqrt((newC0.x - c0.x) * (newC0.x - c0.x)
               + (newC0.y - c0.y) * (newC0.y - c0.y));

        long double move1 =
            sqrt((newC1.x - c1.x) * (newC1.x - c1.x)
               + (newC1.y - c1.y) * (newC1.y - c1.y));

        long double maxMove = max(move0, move1);    // 两个质心里移动得更远的那个

        // 把“这一轮”变成“上一轮”，给下一轮循环用。
        belong = newBelong;     // vector 之间的 = 是整体复制
        c0 = newC0;
        c1 = newC1;

        // 题目的两个停止条件，满足任意一个就停：归属不再变化；或最大移动量 < 1e-6。
        // 1e-6L 末尾的 L 表示这是 long double 类型的常数。
        // 实际上：只有 2 个点的簇在第一轮就停（两个质心就是这两个点自己，没动，靠第二个条件）；
        //         其他情况都是归属不再变化时停（靠第一个条件，此时质心也没动）。
        if (same || maxMove < 1e-6L) {
            break;
        }
    }

    // 得到最终两个子簇
    // 按最后一轮的归属，把点分别复制进 child0 和 child1。点在子簇里的先后顺序和在父簇里一样。
    for (int i = 0; i < n; i++) {
        if (belong[i] == 0) {
            result.child0.push_back(pts[i]);
        } else {
            result.child1.push_back(pts[i]);
        }
    }

    // 三个簇各自的 n × SSE（都是整数）
    long long parentNum =
        getSSENumerator(pts);

    long long child0Num =
        getSSENumerator(result.child0);

    long long child1Num =
        getSSENumerator(result.child1);

    long long parentN = pts.size();         // 父簇的点数
    long long n0 = result.child0.size();    // 0 号子簇的点数
    long long n1 = result.child1.size();    // 1 号子簇的点数，n0 + n1 = parentN

    // grad =
    //
    // parentNum / parentN
    // - child0Num / n0
    // - child1Num / n1
    //
    // 通分

    // 三个分数的分母不同，通分到公共分母 parentN × n0 × n1：
    //   parentNum / parentN = parentNum × n0 × n1        / (parentN × n0 × n1)
    //   child0Num / n0      = child0Num × parentN × n1   / (parentN × n0 × n1)
    //   child1Num / n1      = child1Num × parentN × n0   / (parentN × n0 × n1)
    // 分子相减就是 gradNum。例：样例 1 的三个点，父簇 84/3 = 28，子簇 2/2 = 1 和 0/1 = 0，
    //   gradNum = 84×2×1 - 2×3×1 - 0×3×2 = 162，gradDen = 3×2×1 = 6，下降量 = 162/6 = 27。
    result.gradNum =
          parentNum * n0 * n1
        - child0Num * parentN * n1
        - child1Num * parentN * n0;

    result.gradDen =
        parentN * n0 * n1;                  // 一定是正数：n0、n1 都至少是 1

    result.valid = true;

    return result;
}

// 比较两个SSE下降量
// 返回：
// >0 表示 A 更大
// =0 表示相等
// <0 表示 B 更大
//
// 两个下降量是分数 numA/denA 和 numB/denB。分数比大小不做除法（除法有误差），而是交叉相乘：
//   numA/denA > numB/denB  等价于  numA × denB > numB × denA      （两个分母都是正数才成立）
// __int128 是 GCC 提供的 128 位整数，范围约 ±1.7×10³⁸，比 long long 大得多。
// (__int128)numA * denB：先把 numA 转成 128 位，再乘，乘法就在 128 位里进行，不会溢出。
// 它不是标准 C++，但 g++ 和判题机都支持。按本题的范围仔细估算，乘积其实不会超过 long long；
// 用 __int128 是省去估算的保险写法。
int compareGrad(long long numA, long long denA,
                long long numB, long long denB) {

    __int128 left =
        (__int128)numA * denB;

    __int128 right =
        (__int128)numB * denA;

    if (left > right) {
        return 1;
    }

    if (left < right) {
        return -1;
    }

    return 0;
}

// 输出一行：当前所有簇的点数，从大到小，用空格隔开。
void printClusterSizes(const vector<Cluster>& clusters) {
    vector<int> sizes;

    for (const Cluster& c : clusters) {
        sizes.push_back(c.points.size());   // 只取每个簇的点数
    }

    // sort 默认从小到大；第三个参数 greater<int>() 表示“大的排前面”，也就是降序。
    sort(sizes.begin(), sizes.end(), greater<int>());

    for (int i = 0; i < (int)sizes.size(); i++) {   // (int)：把无符号的 size() 转成 int 再比较
        if (i > 0) {
            cout << ' ';                    // 第一个数前面不输出空格，所以行尾也没有多余空格
        }

        cout << sizes[i];
    }

    cout << '\n';                           // 换行。'\n' 比 endl 快：endl 每次都会刷新输出
}

int main() {
    // 这两行让 cin / cout 更快，是竞赛代码的固定开头，和算法无关。
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int N;      // 目标簇数
    int L;      // 点的个数

    cin >> N;
    cin >> L;

    vector<Point> allPoints(L);     // 先开好 L 个位置，再按下标读入

    for (int i = 0; i < L; i++) {
        cin >> allPoints[i].x
            >> allPoints[i].y;
    }

    vector<Cluster> clusters;       // 当前的簇列表。新簇总是加在末尾，所以列表一直按 birth 从小到大排列

    // 初始簇 C0：包含所有点，birth = 0。
    // 花括号按 Cluster 的成员顺序赋值：points = allPoints（复制一份），birth = 0。
    clusters.push_back({
        allPoints,
        0
    });

    int birthCounter = 1;           // 下一个新簇的编号

    // 第0轮
    printClusterSizes(clusters);

    // 每循环一次，拆开一个簇，簇数加 1。簇数到 N 就停。N = 1 时一次也不进循环（样例 2）。
    while ((int)clusters.size() < N) {

        int bestIndex = -1;         // 目前最好的候选是 clusters 里的第几个；-1 表示还没有候选
        SplitResult bestSplit;      // 它的试拆结果

        // 把每个簇都试拆一次，边拆边记下“目前最好的”。
        for (int i = 0; i < (int)clusters.size(); i++) {

            // 单元素簇不能继续拆
            if (clusters[i].points.size() < 2) {
                continue;           // 跳过这个簇，看下一个
            }

            SplitResult cur =
                splitCluster(clusters[i].points);

            // 【本题数据下走不到】splitCluster 只在点数 < 2 或出现空簇时返回 valid = false，两种都不会发生。
            if (!cur.valid) {
                continue;
            }

            // 第一个能拆的簇：没有比较对象，直接当作目前最好的。
            if (bestIndex == -1) {
                bestIndex = i;
                bestSplit = cur;
                continue;
            }

            // 和目前最好的比下降量。cmp > 0：当前簇更大；= 0：一样大；< 0：当前簇更小。
            int cmp = compareGrad(
                cur.gradNum,
                cur.gradDen,
                bestSplit.gradNum,
                bestSplit.gradDen
            );

            // 第一优先级：下降量更大的赢。
            if (cmp > 0) {
                bestIndex = i;
                bestSplit = cur;
            }
            else if (cmp == 0) {

                int curSize =
                    clusters[i].points.size();

                int bestSize =
                    clusters[bestIndex].points.size();

                // 第二优先级：簇更大
                if (curSize > bestSize) {
                    bestIndex = i;
                    bestSplit = cur;
                }

                // 第三优先级：生成更早
                // 【走不到】clusters 一直按 birth 从小到大排列，而 i 比 bestIndex 靠后，
                // 所以 clusters[i].birth 一定更大，这个条件永远不成立。
                // “选更早生成的”实际上是靠“完全平局时不替换、保留先遇到的那个”做到的。
                else if (curSize == bestSize &&
                         clusters[i].birth <
                         clusters[bestIndex].birth) {

                    bestIndex = i;
                    bestSplit = cur;
                }
            }
            // cmp < 0：当前簇的下降量更小，什么都不做。
        }

        // 一个能拆的簇都没有（所有簇都只剩 1 个点），提前结束。N 大于点数 L 时会走到这里。
        if (bestIndex == -1) {
            break;
        }

        // 删除父簇
        // erase 删掉第 bestIndex 个元素，后面的元素依次前移一位，相对顺序不变。
        clusters.erase(
            clusters.begin() + bestIndex
        );

        // 0号子簇先生成
        // birthCounter++：先用现在的值当编号，再把 birthCounter 加 1。
        clusters.push_back({
            bestSplit.child0,
            birthCounter++
        });

        // 1号子簇后生成
        clusters.push_back({
            bestSplit.child1,
            birthCounter++
        });

        printClusterSizes(clusters);    // 这一轮拆完，输出一行
    }

    return 0;
}
