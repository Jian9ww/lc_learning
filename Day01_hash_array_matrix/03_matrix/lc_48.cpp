#include <bits/stdc++.h>
using namespace std;

// LC48 旋转图像：把 n × n 的矩阵顺时针旋转 90°，必须原地修改，不能另开一个矩阵。
// 例：[[1,2,3],[4,5,6],[7,8,9]] -> [[7,4,1],[8,5,2],[9,6,3]]
//
// 位置变化：(i, j) 上的数，转完以后在 (j, n - 1 - i)。
// 做法：拆成两次翻转。
//   转置：    (i, j) -> (j, i)            行号、列号互换，沿主对角线翻折
//   行翻转：  (j, i) -> (j, n - 1 - i)    每一行左右倒过来
// 两步的顺序不能换：先行翻转、再转置，得到的是逆时针 90°。
// 时间 O(n²)，额外空间 O(1)。180°、逆时针 90° 和另一种写法见 lc_48_visual/README.md。

class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        // 外层 i 是行号。每一轮先把第 i 行转置好，再把这一行翻转。
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) { // 遍历对角线上方元素，做转置
                // j 从 i + 1 开始：(i, j) 和 (j, i) 这一对只交换一次。
                // 如果 j 从 0 开始，每一对会被交换两次，等于没换。
                swap(matrix[i][j], matrix[j][i]);
            }
            // 到这里第 i 行已经是转置后的样子：它左边 j < i 的部分，在前面几轮里就换好了。
            // ranges::reverse(matrix[i]); // 行翻转
            // ↑ 原写法：ranges::reverse 是 C++20 的，C++14 编译不过。下面是 C++14 写法。
            reverse(matrix[i].begin(), matrix[i].end()); // 行翻转
            // 后面的轮次只会动第 i 行下面的行，所以现在就翻转第 i 行，不会影响它们。
        }
    }

    // ---------- 以下是思考题的写法（补充；main 里没有调用） ----------

    // 思考题一：顺时针旋转 180°。(i, j) -> (n - 1 - i, n - 1 - j)。
    // 行号、列号都倒过来：左右翻转 + 上下翻转，不需要转置。
    void rotate180(vector<vector<int>>& matrix) {
        for (auto& row : matrix)
            reverse(row.begin(), row.end());        // 左右翻转：每一行倒过来
        reverse(matrix.begin(), matrix.end());      // 上下翻转：把“行”当成元素，整行整行换位置
    }

    // 思考题二：顺时针旋转 270°，也就是逆时针旋转 90°。(i, j) -> (n - 1 - j, i)。
    // 转置到 (j, i)，再把行号倒过来：转置 + 上下翻转。和顺时针 90° 只差最后一步。
    void rotate270(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                swap(matrix[i][j], matrix[j][i]);   // 转置
        reverse(matrix.begin(), matrix.end());      // 上下翻转
    }
};

int main() {
    // 读取矩阵大小
    int n;
    cin >> n;

    // 读取矩阵
    vector<vector<int>> matrix(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cin >> matrix[i][j];
        }
    }

    // 调用核心函数
    Solution solution;
    solution.rotate(matrix);

    // 输出旋转后的矩阵
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (j > 0) {
                cout << " ";
            }
            cout << matrix[i][j];
        }
        cout << endl;
    }

    return 0;
}
