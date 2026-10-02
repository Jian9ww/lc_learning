#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        int n = (int)intervals.size();
        map<int, int> map;
        vector<vector<int>> results;

        for (int i = 0; i < n; i++) {
            vector<int> cur_interval = intervals[i];
            // 左 -1 右 1，同一点累加，不要覆盖
            map[cur_interval[0]] += -1;
            map[cur_interval[1]] += 1;
        }

        int left = 0;
        int right = 0;
        int sum = 0;
        for (const auto& [k, v] : map) {
            int cur_sum = sum + v;
            if (sum == 0 && v < 0) {          // 从无人覆盖进入覆盖：左端点
                left = k;
            }
            if (cur_sum == 0 && v > 0) {      // 覆盖结束：右端点
                right = k;
                results.push_back({left, right});
            }
            sum = cur_sum;                    // 等价于 sum += v
        }
        return results;
    }
};

int main() {
    int n;
    cin >> n;

    vector<vector<int>> intervals(n, vector<int>(2));
    for (int i = 0; i < n; i++) {
        cin >> intervals[i][0] >> intervals[i][1];
    }

    Solution solution;
    vector<vector<int>> result = solution.merge(intervals);
     cout << "result : -------------------------------"<<endl;
    for (auto& interval : result) {
        cout << interval[0] << " " << interval[1] << endl;
    }

    return 0;
}
