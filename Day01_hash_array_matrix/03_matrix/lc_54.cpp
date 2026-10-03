#include <bits/stdc++.h>
using namespace std;

// LC54 螺旋矩阵：按顺时针螺旋的顺序，输出矩阵里的所有数。
// 例：[[1,2,3,4],[5,6,7,8],[9,10,11,12]] -> 1 2 3 4 8 12 11 10 9 5 6 7
// 两个解法的类都叫 Solution，不能同时定义：解法1 整段注释保存，当前启用解法2。
// 要运行解法1：取消它的注释，再把解法2（连同类外那一行 DIRS 定义）注释掉。
// 解法2 的思路讲解和动画见 lc_54_visual/README.md。

// 解法1
// 我的写法：用 top、bottom、left、right 四个边界围住“还没走过的部分”，沿着边界走一圈，
// 每走完一条边，就把对应的边界往里收一格。时间 O(m·n)，除了答案以外的额外空间 O(1)。
/*
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int m = matrix.size();
        int n = matrix[0].size();

        vector<int> result;

        int top = 0;            // 还没走过的最上面一行
        int bottom = m - 1;     // 还没走过的最下面一行
        int left = 0;           // 还没走过的最左边一列
        int right = n - 1;      // 还没走过的最右边一列

        int direction = 0; // 0右 1下 2左 3上

        // 每次循环只走一条边，走完就回到这里重新判断。
        // 所以只剩一行或一列时，走完它边界就交叉，循环马上结束，不会把同一行/列走两遍。
        while (top <= bottom && left <= right) {

            if (direction == 0) {
                // 从左往右
                for (int j = left; j <= right; j++) {
                    result.push_back(matrix[top][j]);
                }

                top++;          // 上面这一行已经走完
                direction = 1;
            }

            else if (direction == 1) {
                // 从上往下
                for (int i = top; i <= bottom; i++) {
                    result.push_back(matrix[i][right]);
                }

                right--;        // 右边这一列已经走完
                direction = 2;
            }

            else if (direction == 2) {
                // 从右往左
                for (int j = right; j >= left; j--) {
                    result.push_back(matrix[bottom][j]);
                }

                bottom--;       // 下面这一行已经走完
                direction = 3;
            }

            else {
                // 从下往上
                for (int i = bottom; i >= top; i--) {
                    result.push_back(matrix[i][left]);
                }

                left++;         // 左边这一列已经走完
                direction = 0;
            }
        }

        return result;
    }
};
*/

// 解法2
// 思路：螺旋是一段一段的直线，每一段只要知道“往哪走”和“走几步”。
//   往哪走：方向表 DIRS，按 右 -> 下 -> 左 -> 上 循环。
//   走几步：n 是“这一段要走的步数”，m 是“另一个方向的长度”。
//           走完一段，这一段占掉了一行（或一列），另一个方向就少 1：m--；
//           接着拐弯，下一段走的正是另一个方向，所以 swap(n, m) 把它换进 n。
// 3 行 4 列时，五段的步数依次是 4、2、3、1、2，加起来正好 12。
// 时间 O(m·n)，除了答案以外的额外空间 O(1)。
class Solution {
    // 每个方向是一对数 {行号变化, 列号变化}。右：行不变、列 +1；下：行 +1、列不变；……
    static constexpr int DIRS[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}}; // 右下左上
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();   // 一开始：m 是行数，n 是列数
        int size = m * n;       // 元素总数。必须先存下来：后面 m 和 n 会一直变
        vector<int> ans;
        int i = 0, j = -1; // 从 (0, -1) 开始
        // ↑ 起点在第一个格子左边、矩阵外面。这样每一步都是“先走一步，再记录”，
        //   第一步正好落在 (0, 0)，不用单独处理第一个格子。

        // 外层循环每转一圈走一段直线；di 是方向编号，(di + 1) % 4 让它按 0、1、2、3、0…… 循环。
        // ans 里的个数达到 size 就结束。（ans.size() 是无符号数，和 int 比较会有 -Wsign-compare 警告，这里无害。）
        for (int di = 0; ans.size() < size; di = (di + 1) % 4) {
            for (int k = 0; k < n; k++) { // 走 n 步（注意 n 会减少）
                i += DIRS[di][0];         // 行号加上这个方向的“行变化”
                j += DIRS[di][1]; // 先走一步
                ans.push_back(matrix[i][j]); // 再加入答案
            }
            m--; // 减少后面的循环次数（步数）
            // ↑ 刚走完的这一段占掉了一行（或一列），所以另一个方向的长度少 1。
            swap(n, m);
            // ↑ 拐弯：下一段走的是另一个方向，把它的长度换进 n 当步数；
            //   刚走过的这个方向的长度换到 m 里，等下次轮到它之前再减 1。
        }
        return ans;
    }
};
// C++14 需要这一行：类里的 static constexpr 数组只是声明，用到它时必须在类外再定义一次，
// 否则链接报错 undefined reference to `Solution::DIRS'。C++17 起不用写。
constexpr int Solution::DIRS[4][2];


int main() {
    // 读取矩阵行数和列数
    int m, n;
    cin >> m >> n;

    // 读取矩阵
    vector<vector<int>> matrix(m, vector<int>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            cin >> matrix[i][j];
        }
    }

    // 调用核心函数
    Solution solution;
    vector<int> result = solution.spiralOrder(matrix);

    // 输出结果数组
    for (int i = 0; i < (int)result.size(); i++) {
        if (i > 0) {
            cout << " ";
        }
        cout << result[i];
    }
    cout << endl;

    return 0;
}
