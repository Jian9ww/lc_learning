#include <bits/stdc++.h>
using namespace std;
class Solution{
public: 
    int firstMissingPositive(vector<int>& nums) {
        unordered_map<int, int> mp;
        int cur_num;
        int result = 0;
        for(int i = 0; i < nums.size(); i++){
            cur_num = nums[i];
            if(cur_num <= 0) continue;
            mp[cur_num] = cur_num + 1;
            if(cur_num > result) result = cur_num;
        }

        for(const auto& [k, v] : mp){
            if(mp.find(v) == mp.end()){ //当前num + 1不在
                if(k <= result) result = k + 1;
            }
        }
        if(result >= 0 && mp.find(1) == mp.end()) result = 1;
        
        return result;

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