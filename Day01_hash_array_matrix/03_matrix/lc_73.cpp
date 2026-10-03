#include <iostream>
#include <vector>
using namespace std;

// LC73 矩阵置零：某个元素是 0，就把它所在的整行、整列都变成 0。要求原地修改，额外空间 O(1)。
// 例：[[1,1,1],[1,0,1],[1,1,1]] -> [[1,0,1],[0,0,0],[1,0,1]]
//
// 思路：需要记住“哪些行、哪些列里有 0”。不另开数组，直接借用矩阵的第一行和第一列来记：
//   matrix[i][0] == 0 表示第 i 行要清零；matrix[0][j] == 0 表示第 j 列要清零。
// 这和 LC41 用正负号当标记是同一个想法：把题目给的数组自己当成标记本。
// 时间 O(m·n)，额外空间 O(1)（只多了两个 bool）。
// 讲解和动画见 lc_73_visual/README.md（网页版动画：lc_73_visual/lc73_set_zeroes.html）。

class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size();        // 行数
        int n = matrix[0].size();     // 列数
        bool firstRow0 = false;       // 第一行原来有没有 0
        bool firstCol0 = false;       // 第一列原来有没有 0

        // 第一步：先记下第一列、第一行自己原来有没有 0。
        // 它们马上要被拿去当标记，被改写之后就分不清“原来就是 0”还是“后来打的标记”了。
        // matrix[0][0] 同时属于第一行和第一列，一个格子分不出两种情况，所以要用两个 bool 分开记。
        for(int i = 0; i < m; i++)
            if(matrix[i][0] == 0) firstCol0 = true;

        for(int j = 0; j < n; j++)
            if(matrix[0][j] == 0) firstRow0 = true;

        // 第二步：扫描第一行、第一列以外的部分，打标记。
        for(int i = 1; i < m; i++)
            for(int j = 1; j < n; j++)
                if(matrix[i][j] == 0) // 如果第二行/列开始遇到0，对应的位置
                    // 就把这一列的列首 matrix[0][j] 和这一行的行首 matrix[i][0] 记成 0。
                    // 连续赋值从右往左算：先 matrix[i][0] = 0，再把结果 0 赋给 matrix[0][j]。
                    matrix[0][j] = matrix[i][0] = 0;

        // 第三步：按标记清零。只处理内部（i、j 都从 1 开始），此时不能动第一行和第一列，
        // 否则标记被破坏，后面的格子就会被误清。
        for(int i = 1; i < m; i++)
            for(int j = 1; j < n; j++)
                if(matrix[0][j] == 0 || matrix[i][0] == 0)   // 所在的列或所在的行被标记了
                    matrix[i][j] = 0;

        // 第四步：最后才处理第一列和第一行本身，用第一步记下的两个 bool。
        if(firstCol0)
            for(int i = 0; i < m; i++)
                matrix[i][0] = 0;
        if(firstRow0)
            for(int j = 0; j < n; j++)
                matrix[0][j] = 0;

    }
};

int main() {
    // 读取矩阵行数和列数
    int m, n;
    cin >> m >> n;

    // 读取矩阵
    vector<vector<int>> matrix(m, vector<int>(n));   // m 行，每行是一个有 n 个 0 的 vector<int>
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            cin >> matrix[i][j];
        }
    }

    // 调用核心函数
    Solution solution;
    solution.setZeroes(matrix);

    // 输出修改后的矩阵
    for (int i = 0; i < m; i++) {
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
