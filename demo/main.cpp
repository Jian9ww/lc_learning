#include <iostream>
#include <unordered_map>
using namespace std;

int main() {
    unordered_map<int, int> mp;

    // 插入
    mp[1] = 2;
    mp[2] = 3;

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

