#include <bits/stdc++.h>
using namespace std;

// LC41 缺失的第一个正数：找出数组里没有出现的最小正整数，要求时间 O(n)、额外空间 O(1)。
// 例：[3,4,-1,1] -> 2；[1,2,0] -> 3；[7,8,9,11,12] -> 1。
// 讲解和动画见 lc_41_visual/README.md（网页版动画：lc_41_visual/lc41_sign_mark.html）。

class Solution{
public:
    // 我的原始解法：用哈希表记下出现过的正数，再找“k 出现了、k + 1 没出现”的最小的 k + 1。
    // 平均时间 O(n)，额外空间 O(n)。时间符合要求，超出要求的是空间：多用了一张哈希表。
    // 原代码完整保留；要运行它，取消这段注释，并注释掉下面的原地标记版。
    /*
    int firstMissingPositive(vector<int>& nums) {
        unordered_map<int, int> mp;                 // 出现过的正数 x -> x + 1
        int cur_num;
        int result = 0;                             // 先用来记最大的正数
        for(int i = 0; i < nums.size(); i++){
            cur_num = nums[i];
            if(cur_num <= 0) continue;              // 0 和负数与答案无关
            mp[cur_num] = cur_num + 1;              // 注意：cur_num 是 2^31 - 1 时，+ 1 会溢出
            if(cur_num > result) result = cur_num;
        }

        // for(const auto& [k, v] : mp){            // 原写法：C++17 结构化绑定，g++ 在 C++14 下只给警告
        for(const auto& entry : mp){                // C++14 写法
            int k = entry.first, v = entry.second;  // k 是出现过的正数，v 是 k + 1
            if(mp.find(v) == mp.end()){ //当前num + 1不在
                if(k <= result) result = k + 1;     // 在所有“缺口”里留下最小的 k + 1
            }
        }
        if(result >= 0 && mp.find(1) == mp.end()) result = 1;   // 1 没出现，答案就是 1

        return result;

    }
    */

    // 原地标记版：时间 O(n)，额外空间 O(1)。
    //
    // 两个关键点：
    //   1. 数组有 n 个数，答案只可能是 1 到 n + 1，所以 <= 0 和 > n 的数都可以不管。
    //   2. 只需要记住 1 到 n 每个数“出现过没有”。不另开哈希表，直接借用 nums 自己的 n 个位置：
    //      数字 x 出现过，就把下标 x - 1 上的数变成负数。负号就是标记。
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();

        // 第一步：把没用的数（<= 0 或 > n）统一改成 n + 1。
        // 这样数组里全是正数，后面出现的负号一定是我们打的标记。
        for(int i = 0; i < n; i++){
            if(nums[i] <= 0 || nums[i] > n) nums[i] = n + 1;
        }

        // 第二步：打标记。数字 cur_num 出现过，就把下标 cur_num - 1 上的数变成负数。
        for(int i = 0; i < n; i++){
            int cur_num = abs(nums[i]);     // 这个位置可能已经被标成负数，取绝对值才是原来的数
            if(cur_num <= n){               // n + 1 是第一步填的“无用数”，跳过
                nums[cur_num - 1] = -abs(nums[cur_num - 1]);   // 用 -abs：同一个数出现两次时，不会又翻回正数
            }
        }

        // 第三步：找第一个还是正数的位置。下标 i 没被标记，说明 i + 1 没出现过。
        for(int i = 0; i < n; i++){
            if(nums[i] > 0) return i + 1;
        }
        return n + 1;                       // 1 到 n 全都出现了
    }
};
int main(){
    int n;
    cin >> n;
    vector<int> nums(n);
    for(int i = 0; i < n; i++){
        cin >> nums[i];
    }
    Solution s;
    int result = s.firstMissingPositive(nums);
    cout<<"result = "<<result<<endl;
}
