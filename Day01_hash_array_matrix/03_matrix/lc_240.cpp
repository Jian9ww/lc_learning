#include <iostream>
#include <vector>
using namespace std;

// LC240 搜索二维矩阵 II：矩阵每一行从左到右升序，每一列从上到下升序，判断 target 在不在里面。
// 例：[[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]]
//     target = 5 -> true；target = 20 -> false
//
// 做法（排除法）：站在“剩余区域”的右上角。这个数 x 是它所在行里最大的，也是它所在列里最小的。
//   x > target：这一列的数都 >= x，全部大于 target，整列排除，j--
//   x < target：这一行的数都 <= x，全部小于 target，整行排除，i++
//   x == target：找到
// 每比较一次，就排除一行或一列，所以最多走 m + n 步。时间 O(m + n)，额外空间 O(1)。
// 讲解和动画见 lc_240_visual/README.md。

class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();   // m 行，n 列
        int i = 0, j = n - 1; // 从右上角开始
        // 剩余区域是第 i 行到最后一行、第 0 列到第 j 列（左下那一块），(i, j) 是它的右上角。
        // i 到了 m 或者 j 到了 -1，说明区域空了。
        while (i < m && j >= 0) { // 还有剩余元素
            if (matrix[i][j] == target) {
                return true; // 找到 target
            }
            if (matrix[i][j] < target) {
                i++; // 这一行剩余元素全部小于 target，排除
                // 右上角是这一行剩余部分里最大的，它都比 target 小，左边的更小。
            } else {
                j--; // 这一列剩余元素全部大于 target，排除
                // 右上角是这一列剩余部分里最小的，它都比 target 大，下面的更大。
            }
        }
        return false;   // 所有行、列都排除完了，也没遇到 target
    }
};


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

    // 读取目标值
    int target;
    cin >> target;

    // 调用核心函数并输出结果
    Solution solution;
    cout << (solution.searchMatrix(matrix, target) ? "true" : "false") << endl;

    return 0;
}
