#include <bits/stdc++.h>
using namespace std;

// LC56 合并区间：把所有重叠（包括首尾相接）的区间合并，返回互不重叠的区间。
// 例：[[1,3],[2,6],[8,10],[15,18]] -> [[1,6],[8,10],[15,18]]；[[1,4],[4,5]] -> [[1,5]]
//
// 思路（扫描线）：把每个区间拆成两个事件，“在左端点开始”和“在右端点结束”。
// 按坐标从小到大扫一遍，维护“当前还有多少个区间没结束”：
//   从 0 变成非 0 的位置，是一个合并后区间的左端点；回到 0 的位置，是它的右端点。
// 用 map 是因为它会按键从小到大排好序。时间 O(n log n)，额外空间 O(n)。

class Solution {
public:
    // 我的原始解法：左端点记 -1，右端点记 +1，同一个坐标上的值累加。
    // 思路是对的，没有“左右端点相同”的区间时结果都正确。
    // 问题：孤立的点区间会丢。例如 [[1,1]]：坐标 1 上 -1 和 +1 抵消成 0，
    //       扫描时两个 if 都不成立，结果是空的，正确答案是 [[1,1]]。
    // 原代码完整保留；要运行它，取消这段注释，并注释掉下面的修正版。
    /*
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        int n = (int)intervals.size();
        map<int, int> map;                      // 坐标 -> 累加的事件值（变量名和类型同名，容易看混）
        vector<vector<int>> results;

        for (int i = 0; i < n; i++) {
            vector<int> cur_interval = intervals[i];   // 这里复制了一份区间
            // 左 -1 右 1，同一点累加，不要覆盖
            map[cur_interval[0]] += -1;
            map[cur_interval[1]] += 1;
        }

        int left = 0;
        int right = 0;
        int sum = 0;                            // 负数表示正被覆盖：-2 就是有两个区间还没结束
        // for (const auto& [k, v] : map) {     // 原写法：C++17 结构化绑定，g++ 在 C++14 下只给警告
        for (const auto& entry : map) {         // C++14 写法
            int k = entry.first, v = entry.second;   // k 是坐标，v 是这个坐标上的累加值
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
    */

    // 修正版：思路不变，只是把“在这里开始的个数”和“在这里结束的个数”分开记，不再加成一个数。
    // 这样点区间 [1,1] 在坐标 1 上是“开始 1 个、结束 1 个”，不会互相抵消。
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        int n = (int)intervals.size();
        map<int, pair<int, int>> events;        // 坐标 -> {在这里开始的区间数, 在这里结束的区间数}
        vector<vector<int>> results;

        for (int i = 0; i < n; i++) {
            const vector<int>& cur_interval = intervals[i];   // 用引用，不复制
            events[cur_interval[0]].first++;    // [] 第一次访问时会建一个 {0, 0}
            events[cur_interval[1]].second++;
        }

        int left = 0;
        int sum = 0;                            // 当前还有多少个区间没结束
        for (const auto& entry : events) {      // map 按坐标从小到大遍历
            int k = entry.first;                // 坐标
            int starts = entry.second.first;    // entry.second 也是一个 pair
            int ends = entry.second.second;
            if (sum == 0 && starts > 0) {       // 从无人覆盖进入覆盖：左端点
                left = k;
            }
            sum += starts;                      // 这个坐标上的开始和结束都算完，再判断是否回到 0：
            sum -= ends;                        // 这样 [1,4]、[4,5] 在坐标 4 上不会断开
            if (sum == 0) {                     // 覆盖结束：右端点
                results.push_back({left, k});
            }
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
