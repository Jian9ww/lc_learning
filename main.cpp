#include <bits/stdc++.h>
using namespace std;

int main() {10
    unordered_map<int, int> mp;
    map<int, int> omp;
    // 插入
    mp[1] = 2;
    mp[2] = 3;

    int n = 2;
    cin >> n;
    cout << "键1" << n << "的值: " << mp[n] << endl; // 如果键不存在，会插入 (n,0)
    // 查询（存在）
    if (mp.find(1) != mp.end()) {
        cout << "键1的值: " << mp[1] << endl;
    }

    // 查询（不存在）
    cout << "键3的值: " << mp[3] << endl; // 会插入 (3,0)

    // 计数示例
    int nums[] = {1, 2, 2, 3};
    unordered_map<int, int> cnt;
    for (int x : nums) {
        cnt[x]++;
    }

    // 删除
    mp.erase(2);

    // 大小
    cout << "大小: " << mp.size() << endl;

    return 0;
}
