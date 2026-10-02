#include <bits/stdc++.h>
using namespace std;

class Solution{
public:
    // 解法一
    // 排序后的字符串 -> 这一组的原字符串。与解法二同名同参数，不能同时定义，
    // 所以整段注释保存；切换时取消这段注释，并注释掉下面的解法二。
    /*
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> hash_table;
    string cur_string;
    for(int i = 0; i < strs.size(); i++){
        cur_string = strs[i];
        sort(cur_string.begin(), cur_string.end());
        hash_table[cur_string].push_back(strs[i]);
    }
    vector<vector<string>> results;
    // 原写法用了 C++17 结构化绑定，C++14 不支持：
    // for (const auto& [key, vec] : hash_table) {
    // // key 是 string
    //     results.push_back(vec);
    // }
    // C++14 写法：entry.first 是键（排序后的字符串），entry.second 是这一组
    for (const auto& entry : hash_table) {
        results.push_back(entry.second);
    }
    return results;
    }
    */
    // 解法二
    // 排序后的字符串 -> 这一组在 result 中的下标。当前启用，输出按各组首次出现的顺序。
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map <string, int> strhashtable;
    vector<vector<string>> result;
    for(int i = 0; i < strs.size(); i++){

        string cur_str = strs[i];
        sort(cur_str.begin(), cur_str.end());
        auto it = strhashtable.find(cur_str);
        if(it != strhashtable.end()){
            result[it->second].push_back(strs[i]);
        }else{
            result.push_back({strs[i]});
            strhashtable[cur_str] = result.size()-1;
        }
        
    }
    return result;
    }
};
int main(){
    int n;
    cin >> n;
    vector<string> strs(n);
    for(int i = 0; i < n; i++){
        cin >> strs[i];
    }
    Solution solution;
    vector<vector<string>> results;
    results = solution.groupAnagrams(strs);
    // 每一行输出一组，组内字符串用空格分隔

    for (auto& group : results) {
        for (int i = 0; i < group.size(); i++) {
            if (i > 0) {
                cout << " ";
            }
            cout << group[i];
        }
        cout << endl;
    }
    return 0;
}