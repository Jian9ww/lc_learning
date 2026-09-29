#include <bits/stdc++.h>
using namespace std;

class Solution{
public:
    // 解法一
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> hash_table;
    string cur_string;
    for(int i = 0; i < strs.size(); i++){
        cur_string = strs[i];
        sort(cur_string.begin(), cur_string.end());
        hash_table[cur_string].push_back(strs[i]);
    }
    vector<vector<string>> results;
    for (const auto& [key, vec] : hash_table) {
    // key 是 string
        results.push_back(vec);
    }
    return results;
    }
    // 解法二
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