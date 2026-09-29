#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    // find解法
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> hash_table;
        for (int i = 0; i < nums.size(); i++) {
            int cur_num = nums[i];
            int temp = target - cur_num;

            auto it = hash_table.find(temp);
            if (it != hash_table.end()) {
                return {it->second, i};
            }

            hash_table[cur_num] = i;
        }
        return {};
    }
    // // count解法
    // vector<int> twoSum(vector<int>& nums, int target) {
    //     unordered_map<int, int> hash_table;
    //     for(int i = 0; i < nums.size(); i++){
    //         int cur_num = nums[i];
    //         int temp = target - cur_num;
    //         if(hash_table.count(temp) and i != hash_table[temp]){
    //             return {hash_table[temp], i};
    //         }
    //         hash_table[cur_num] = i;
            
    //     }
    //     return {};
    // }

};

int main(){
    int n, target;
    cin >> n >> target;
    
    vector<int> nums(n);
    for (int i = 0; i < n; i++)
        cin >> nums[i];
    Solution S;
    vector<int> result = S.twoSum(nums, target);
    cout << result[0] <<" " <<result[1] << endl;
}