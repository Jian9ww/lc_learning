#include <iostream>
#include <utility>
#include <vector>

using namespace std;

// 教学用哈希表：只保存 int -> int，使用 8 个桶处理哈希冲突。
// 这里故意不扩容，方便观察；不是 std::unordered_map 的完整实现。
class IntHashMap {
private:
    struct Entry {
        int key;
        int value;
    };

    static constexpr int BUCKET_COUNT = 8;

    // 外层 vector：按下标直接定位桶。
    // 内层 vector：保存落入同一个桶的键值对。
    vector<vector<Entry>> buckets;

    int bucketIndex(int key) const {
        // 简化哈希规则：key 对桶数取余。
        // 1、9、17 都落入 1 号桶，这叫“哈希冲突”。
        // 再加一次取余，使负数键也得到 0~7 的下标。
        return (key % BUCKET_COUNT + BUCKET_COUNT) % BUCKET_COUNT;
    }

public:
    IntHashMap() : buckets(BUCKET_COUNT) {}

    void insert(int key, int value) {
        int index = bucketIndex(key);
        auto& bucket = buckets[index];

        // 同一个 key 已经存在时更新 value，不重复插入。
        for (auto& entry : bucket) {
            if (entry.key == key) {
                entry.value = value;
                return;
            }
        }
        bucket.push_back({key, value});
    }

    // 返回是否找到；value 保存结果，comparisons 统计键比较次数。
    // 没找到时 value 不变，所以必须先判断返回值再使用结果。
    bool find(int key, int& value, int& comparisons) const {
        comparisons = 0;

        // 第一步：计算桶下标，直接访问该桶，不遍历所有桶。
        int index = bucketIndex(key);
        const auto& bucket = buckets[index];  // 建议在这里打断点
        cout << "查找键 " << key << "：定位到 " << index << " 号桶\n";

        // 第二步：只在这个桶里比较 key。
        // 必须比较原始 key，因为不同 key 可以有相同的桶下标。
        for (const auto& entry : bucket) {
            ++comparisons;  // 单步观察 comparisons 和 entry.key
            if (entry.key == key) {
                value = entry.value;
                return true;
            }
        }
        return false;
    }

    void printBuckets() const {
        for (int i = 0; i < BUCKET_COUNT; ++i) {
            cout << "桶 " << i << ": ";
            for (const auto& entry : buckets[i]) {
                cout << "(" << entry.key << ", " << entry.value << ") ";
            }
            cout << '\n';
        }
    }
};

int main() {
    IntHashMap mp;
    vector<pair<int, int>> data = {
        {1, 10}, {2, 20}, {3, 30}, {4, 40}, {5, 50},
        {6, 60}, {7, 70}, {9, 90}, {17, 170}
    };

    for (const auto& item : data) {
        mp.insert(item.first, item.second);
    }

    cout << "=== 桶内分布 ===\n";
    mp.printBuckets();

    // 改成 4、17、25、8，观察不同桶和查找失败的情况。
    int target = 17;

    cout << "\n=== 普通数组顺序查找 ===\n";
    int linearComparisons = 0;
    for (const auto& item : data) {
        ++linearComparisons;
        if (item.first == target) {
            cout << "找到值：" << item.second << '\n';
            break;
        }
    }
    cout << "键比较次数：" << linearComparisons << '\n';

    cout << "\n=== 哈希表查找 ===\n";
    int value = 0;
    int hashComparisons = 0;
    if (mp.find(target, value, hashComparisons)) {
        cout << "找到值：" << value << '\n';
    } else {
        cout << "键不存在\n";
    }
    cout << "键比较次数：" << hashComparisons << '\n';

    // 本例统计的是键比较次数，不是耗时；算哈希也有成本。
    // 平均桶长度约为 元素数 / 桶数，称为“装载因子”。
    // 分布均匀且装载因子受控时，平均查找 O(1)。
    // 如果元素一直增加却不扩容，或者大量键发生冲突，查找会变慢。
    // 最坏情况下全部落到同一桶，查找为 O(n)。
    return 0;
}
