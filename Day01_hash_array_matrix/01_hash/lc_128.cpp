#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int longestConsecutive(const vector<int>& nums) {
        if(nums.size() == 0)
            return 0;
        unordered_set<int> hash_set;
        for(int i = 0; i < nums.size(); i++){
            hash_set.insert(nums[i]);
        }
        int count = 1;
        for(const auto& num : hash_set){
            if(hash_set.find(num - 1) == hash_set.end()){ // 起点：左边没有
                int temp = 1; // 当前num
                int num_right = num + 1;
                while(hash_set.find(num_right) != hash_set.end()){
                    temp++;
                    num_right++;
                }
                if(temp > count)
                    count = temp;
            }
        }
        return count;
    }
};

int main(){
    int n;
    cin >> n;
    vector<int> nums(n);
    for(int i = 0; i < n; i++)
        cin >> nums[i];
    Solution solution;
    int result = solution.longestConsecutive(nums);
    cout << result;
}