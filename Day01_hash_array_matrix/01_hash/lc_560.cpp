#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int n = nums.size();
        int count = 0;
        for(int i = 0; i < n; i++){
            int cur_num = nums[i];
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
