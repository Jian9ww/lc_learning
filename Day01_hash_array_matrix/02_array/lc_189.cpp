#include <bits/stdc++.h>
using namespace std;

// LC189 轮转数组：把数组向右轮转 k 步。
// 例：[1,2,3,4,5,6,7]，k = 3 → [5,6,7,1,2,3,4]（最后 3 个数跑到最前面，其余整体后移 3 位）。
// 两种解法同名同参数，不能同时定义：解法一整段注释保存，当前启用解法二。
// 切换时取消解法一的注释，并注释掉解法二。

class Solution{
public:
    // 解法一：复制一份原数组，再按“新位置 <- 旧位置”逐个填回。时间 O(n)，额外空间 O(n)。
    //
    // 向右轮转 k 步后：
    //   新数组的前 k 个（i < k），来自原数组的最后 k 个：nums[i] = 旧[n - k + i]
    //   其余位置（i >= k），来自原数组往左 k 位的数：  nums[i] = 旧[i - k]
    // 例：n = 7，k = 3。i = 0 取旧[4] = 5；i = 3 取旧[0] = 1。
    // 如果直接在 nums 上边读边写，前面写入的值会覆盖后面还没读到的旧值，
    // 所以先复制一份 nums_cp，只从它读、只往 nums 写。
    /*
        void rotate(vector<int>& nums, int k) {
        int n = (int)nums.size();   // 先转成 int，后面 i < n 就不会有 -Wsign-compare 警告
        k = k % n;                  // 轮转 n 步等于没动，只需要轮转 k % n 步；k 可能大于 n
        if(k == 0) return ;         // 不需要移动，直接返回
        vector<int> nums_cp(nums.begin(), nums.end());   // 用迭代器区间 [begin, end) 复制整个数组
        for(int i = 0; i < n; i++){
            if(i < k) nums[i] = nums_cp[n - k + i];      // 前 k 个位置：放原来的最后 k 个
            else nums[i] = nums_cp[i - k];               // 其余位置：放原来往左 k 位的数
        }
        }   // 整理时补上：原代码少了这个右括号，导致下面的解法二被写进了这个函数体里
    */

    // 解法二：三次反转，原地完成。时间 O(n)，额外空间 O(1)。
    //
    // 把数组看成两段：A = 前 n - k 个，B = 后 k 个。轮转就是把 A B 变成 B A。
    //   1. 整体反转：A B -> B' A'（' 表示这一段被反过来了）。B 已经到了前面，只是顺序反了
    //   2. 反转前 k 个：B' -> B
    //   3. 反转后 n - k 个：A' -> A
    // 例：[1,2,3,4,5,6,7]，k = 3
    //   整体反转     -> [7,6,5,4,3,2,1]
    //   反转前 3 个  -> [5,6,7,4,3,2,1]
    //   反转后 4 个  -> [5,6,7,1,2,3,4]
    void rotate(vector<int>& nums, int k) {
        k %= nums.size(); // 轮转 k 次等同于轮转 k % n 次
        // ↑ 必须先取模：k > n 时 nums.begin() + k 会越过 end()，是未定义行为。
        //   k = 0 时不用特判：反转两次整体、中间反转空区间，数组回到原样。
        // ranges::reverse(nums);   // 原写法：C++20 的 ranges 版本，C++14 编译不过
        reverse(nums.begin(), nums.end());         // C++14 写法：反转整个区间 [0, n)
        reverse(nums.begin(), nums.begin() + k);   // 反转前 k 个：区间 [0, k)
        reverse(nums.begin() + k, nums.end());     // 反转剩下的 n - k 个：区间 [k, n)
        // reverse 接收左闭右开区间 [first, last)；nums.begin() + k 是下标 k 的位置。
    }

};

int main(){
    int n, k;
    cin >> n;
    vector<int> nums(n);
    for(int i = 0; i < n; i++)
        cin >> nums[i];
    cin >> k;
    Solution solution;
    solution.rotate(nums, k);
    cout <<"移动"<<k<<": ";
    for(int i = 0; i < n; i++)
        cout << nums[i] <<" ";
    return 0;
}
