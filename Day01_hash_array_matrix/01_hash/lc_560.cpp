#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    // 我的原始思路：枚举起点，再向后累加，时间 O(n²)，额外空间 O(1)。
    // 原代码完整保留，取消注释并注释下方优化版即可运行对比。
    /*
    int subarraySum(vector<int>& nums, int k) {
        int n = nums.size();
        int count = 0;
        for(int i = 0; i < n; i++){
            int temp_sum = 0;
            int j = i;
            while(j < n){
                temp_sum += nums[j];
                j++;
                if(temp_sum == k)
                    count++;
            }
        }
        return count;
    }
    */

    // 优化思路：前缀和 + 哈希计数，平均时间 O(n)，额外空间 O(n)。
    // 对比原版：temp_sum 改为从数组开头累计；哈希查询替代内层枚举。
    int subarraySum(vector<int>& nums, int k) {
        int n = nums.size();
        int count = 0;
        int temp_sum = 0;  // 当前前缀和：nums[0] + ... + nums[i]
        unordered_map<int, int> freq;  // 前缀和 -> 之前出现的次数
        freq[0] = 1;  // 数组开始前的空前缀，使从下标 0 开始的子数组也能被统计

        for(int i = 0; i < n; i++){
            temp_sum += nums[i];

            // 当前前缀和 - 之前的前缀和 = k
            // 因此查找之前有多少个前缀和等于 temp_sum - k。
            auto it = freq.find(temp_sum - k);
            if(it != freq.end()){
                count += it->second;
            }

            // 先查询、再记录当前前缀，避免 k == 0 时把空子数组算进去。
            freq[temp_sum]++;
        }
        return count;
    }
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
