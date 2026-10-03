/* ===== 第 5 集：代码逐段讲解 =====
   代码来自 ACM_test/HW/21.cpp：去掉了空行和注释，个别被拆成两行的语句并回了一行，其余一字不改。 */
const E4STRUCT=[
'struct Point {','    long long x;','    long long y;','};',
'struct Center {','    long double x;','    long double y;','};',
'struct Cluster {','    vector<Point> points;','    int birth;','};',
'struct SplitResult {','    vector<Point> child0;','    vector<Point> child1;','    long long gradNum;','    long long gradDen;','    bool valid;','};'];
const E4SSE=[
'long long getSSENumerator(const vector<Point>& pts) {',
'    long long n = pts.size();',
'    long long sumX = 0;',
'    long long sumY = 0;',
'    long long sumSquare = 0;',
'    for (const Point& p : pts) {',
'        sumX += p.x;',
'        sumY += p.y;',
'        sumSquare += p.x * p.x + p.y * p.y;',
'    }',
'    return sumSquare * n',
'           - sumX * sumX',
'           - sumY * sumY;',
'}'];
const E4SPL=[
'SplitResult splitCluster(const vector<Point>& pts) {',
'    SplitResult result;',
'    result.valid = false;',
'    int n = pts.size();',
'    if (n < 2) {',
'        return result;',
'    }',
'    int minIndex = 0;',
'    int maxIndex = 0;',
'    for (int i = 1; i < n; i++) {',
'        if (pts[i].x < pts[minIndex].x) {',
'            minIndex = i;',
'        }',
'        if (pts[i].x > pts[maxIndex].x) {',
'            maxIndex = i;',
'        }',
'    }',
'    Center c0 = {',
'        (long double)pts[minIndex].x,',
'        (long double)pts[minIndex].y',
'    };',
'    Center c1 = {',
'        (long double)pts[maxIndex].x,',
'        (long double)pts[maxIndex].y',
'    };',
'    vector<int> belong(n, -1);',
'    vector<int> newBelong(n);',
'    while (true) {',
'        for (int i = 0; i < n; i++) {',
'            long double dx0 = pts[i].x - c0.x;',
'            long double dy0 = pts[i].y - c0.y;',
'            long double dx1 = pts[i].x - c1.x;',
'            long double dy1 = pts[i].y - c1.y;',
'            long double d0 = dx0 * dx0 + dy0 * dy0;',
'            long double d1 = dx1 * dx1 + dy1 * dy1;',
'            if (d0 <= d1) {',
'                newBelong[i] = 0;',
'            } else {',
'                newBelong[i] = 1;',
'            }',
'        }',
'        bool same = true;',
'        for (int i = 0; i < n; i++) {',
'            if (belong[i] != newBelong[i]) {',
'                same = false;',
'                break;',
'            }',
'        }',
'        long double sumX0 = 0;',
'        long double sumY0 = 0;',
'        long double sumX1 = 0;',
'        long double sumY1 = 0;',
'        int cnt0 = 0;',
'        int cnt1 = 0;',
'        for (int i = 0; i < n; i++) {',
'            if (newBelong[i] == 0) {',
'                sumX0 += pts[i].x;',
'                sumY0 += pts[i].y;',
'                cnt0++;',
'            } else {',
'                sumX1 += pts[i].x;',
'                sumY1 += pts[i].y;',
'                cnt1++;',
'            }',
'        }',
'        if (cnt0 == 0 || cnt1 == 0) {',
'            return result;',
'        }',
'        Center newC0 = {',
'            sumX0 / cnt0,',
'            sumY0 / cnt0',
'        };',
'        Center newC1 = {',
'            sumX1 / cnt1,',
'            sumY1 / cnt1',
'        };',
'        long double move0 =',
'            sqrt((newC0.x - c0.x) * (newC0.x - c0.x)',
'               + (newC0.y - c0.y) * (newC0.y - c0.y));',
'        long double move1 =',
'            sqrt((newC1.x - c1.x) * (newC1.x - c1.x)',
'               + (newC1.y - c1.y) * (newC1.y - c1.y));',
'        long double maxMove = max(move0, move1);',
'        belong = newBelong;',
'        c0 = newC0;',
'        c1 = newC1;',
'        if (same || maxMove < 1e-6L) {',
'            break;',
'        }',
'    }',
'    for (int i = 0; i < n; i++) {',
'        if (belong[i] == 0) {',
'            result.child0.push_back(pts[i]);',
'        } else {',
'            result.child1.push_back(pts[i]);',
'        }',
'    }',
'    long long parentNum = getSSENumerator(pts);',
'    long long child0Num = getSSENumerator(result.child0);',
'    long long child1Num = getSSENumerator(result.child1);',
'    long long parentN = pts.size();',
'    long long n0 = result.child0.size();',
'    long long n1 = result.child1.size();',
'    result.gradNum =',
'          parentNum * n0 * n1',
'        - child0Num * parentN * n1',
'        - child1Num * parentN * n0;',
'    result.gradDen =',
'        parentN * n0 * n1;',
'    result.valid = true;',
'    return result;',
'}'];
const E4CMP=[
'int compareGrad(long long numA, long long denA,',
'                long long numB, long long denB) {',
'    __int128 left = (__int128)numA * denB;',
'    __int128 right = (__int128)numB * denA;',
'    if (left > right) {',
'        return 1;',
'    }',
'    if (left < right) {',
'        return -1;',
'    }',
'    return 0;',
'}'];
const E4PRINT=[
'void printClusterSizes(const vector<Cluster>& clusters) {',
'    vector<int> sizes;',
'    for (const Cluster& c : clusters) {',
'        sizes.push_back(c.points.size());',
'    }',
'    sort(sizes.begin(), sizes.end(), greater<int>());',
'    for (int i = 0; i < (int)sizes.size(); i++) {',
'        if (i > 0) {',
"            cout << ' ';",
'        }',
'        cout << sizes[i];',
'    }',
"    cout << '\\n';",
'}'];
const E4MAIN=[
'int main() {',
'    ios::sync_with_stdio(false);',
'    cin.tie(nullptr);',
'    int N;',
'    int L;',
'    cin >> N;',
'    cin >> L;',
'    vector<Point> allPoints(L);',
'    for (int i = 0; i < L; i++) {',
'        cin >> allPoints[i].x',
'            >> allPoints[i].y;',
'    }',
'    vector<Cluster> clusters;',
'    clusters.push_back({',
'        allPoints,',
'        0',
'    });',
'    int birthCounter = 1;',
'    printClusterSizes(clusters);',
'    while ((int)clusters.size() < N) {',
'        int bestIndex = -1;',
'        SplitResult bestSplit;',
'        for (int i = 0; i < (int)clusters.size(); i++) {',
'            if (clusters[i].points.size() < 2) {',
'                continue;',
'            }',
'            SplitResult cur =',
'                splitCluster(clusters[i].points);',
'            if (!cur.valid) {',
'                continue;',
'            }',
'            if (bestIndex == -1) {',
'                bestIndex = i;',
'                bestSplit = cur;',
'                continue;',
'            }',
'            int cmp = compareGrad(',
'                cur.gradNum, cur.gradDen,',
'                bestSplit.gradNum, bestSplit.gradDen);',
'            if (cmp > 0) {',
'                bestIndex = i;',
'                bestSplit = cur;',
'            }',
'            else if (cmp == 0) {',
'                int curSize =',
'                    clusters[i].points.size();',
'                int bestSize =',
'                    clusters[bestIndex].points.size();',
'                if (curSize > bestSize) {',
'                    bestIndex = i;',
'                    bestSplit = cur;',
'                }',
'                else if (curSize == bestSize &&',
'                         clusters[i].birth <',
'                         clusters[bestIndex].birth) {',
'                    bestIndex = i;',
'                    bestSplit = cur;',
'                }',
'            }',
'        }',
'        if (bestIndex == -1) {',
'            break;',
'        }',
'        clusters.erase(',
'            clusters.begin() + bestIndex',
'        );',
'        clusters.push_back({',
'            bestSplit.child0,',
'            birthCounter++',
'        });',
'        clusters.push_back({',
'            bestSplit.child1,',
'            birthCounter++',
'        });',
'        printClusterSizes(clusters);',
'    }',
'    return 0;',
'}'];
// 找到第一行包含 s 的行号（从第 from 行开始找）；找不到就报错，免得高亮错行
function e4L(L,s,from){const k=L.findIndex((x,i)=>i>=(from||0)&&x.includes(s));if(k<0)throw new Error('找不到代码行：'+s);return k;}
const e4M=s=>`<span style="font-family:var(--mono);font-size:.92em;background:rgba(27,38,49,.06);padding:0 6px;border-radius:4px">${s}</span>`;
const E4NO='<b style="color:var(--red)">实际走不到</b>';

/* 通用版面：左边代码（可滚动、可高亮），右边一张说明卡，随步骤切换。
   o：{title, dur, caps, lines, ct 代码标题, rows 显示几行, fs, lh, w 代码宽度,
       steps:[{t 开始时间, hl:[起, 止] 高亮的行, top 最上面显示第几行, head, body:[…]}]} */
function e4Scene(o){
  const x=80,w=o.w||800,nx=x+w+60;
  SC.push({title:o.title,dur:o.dur,caps:o.caps,
  build(r){
    const c={};c.code=hwScroll(r,x,116,o.lines,o.fs||21,o.lh||31,o.rows||Math.min(o.lines.length,22),'21.cpp · '+o.ct,w);
    c.notes=o.steps.map(s=>{const g=H('div','a',{left:nx,top:132,width:1920-nx-80,opacity:0,whiteSpace:'normal'},r);
      H('div','',{fontFamily:'var(--display)',fontWeight:900,fontSize:42,lineHeight:1.3,marginBottom:'22px'},g,s.head);
      (s.body||[]).forEach(b=>H('div','',{fontSize:29,lineHeight:1.62,marginBottom:'14px'},g,b));return g;});
    return c;
  },
  update(c,t){
    let k=0;o.steps.forEach((s,i)=>{if(t>=s.t)k=i;});
    const s=o.steps[k],p=k?o.steps[k-1]:s;
    c.code.scroll(lerp(p.top||0,s.top||0,ep(t,s.t,s.t+.8)));
    if(s.hl)c.code.set(s.hl[0],s.hl[1]);else c.code.set(null);
    c.notes.forEach((g,i)=>vis(g,i===k?ep(t,s.t+.15,s.t+.7):0,8));
  }});
}

/* 1 代码地图 */
SC.push({title:'代码地图',dur:25,caps:[
  [.4,7,'最后一集，把前面讲的内容对到代码上。代码里有 4 个结构体，用来装数据。'],
  [7.2,15.8,'还有 5 个函数。main 是主流程，它调用 splitCluster 去试拆一个簇；splitCluster 里又调用 getSSENumerator 算 SSE。'],
  [16,24.6,'main 还调用 compareGrad 比较两个下降量，调用 printClusterSizes 输出一行。下面按这个顺序一段一段看。']],
build(r){
  const c={};
  hwTxt(r,110,136,'数据：4 个结构体',26,{color:'var(--graphite)'});hwTxt(r,790,136,'函数：5 个（缩进表示“被上一层调用”）',26,{color:'var(--graphite)'});
  const card=(x,y,w,name,desc,col)=>{const g=H('div','card',{left:x,top:y,width:w,height:104,opacity:0},r);
    H('div','a',{left:24,top:12,fontSize:30,fontFamily:'var(--mono)',fontWeight:700,color:col||'var(--ink)'},g,name);
    H('div','a',{left:24,top:58,fontSize:24,color:'var(--graphite)'},g,desc);return g;};
  c.s=[card(110,180,600,'Point','一个点：整数坐标 x、y'),card(110,300,600,'Center','一个质心：小数坐标 x、y'),
       card(110,420,600,'Cluster','一个簇：points（点的列表）+ birth（生成顺序）'),card(110,540,600,'SplitResult','一次试拆的结果：两个子簇 + 下降量')];
  c.f=[card(790,180,1020,'main','读入 → 循环：试拆所有簇 → 选一个 → 真拆 → 输出','var(--blue)'),
       card(870,300,940,'splitCluster','对一个簇做 K = 2 的 K-means，返回 SplitResult','var(--blue)'),
       card(950,420,860,'getSSENumerator','算一个簇的 n × SSE（整数）','var(--blue)'),
       card(870,540,940,'compareGrad','比较两个下降量（两个分数）','var(--blue)'),
       card(870,660,940,'printClusterSizes','输出一行：各簇点数，从大到小','var(--blue)')];
  c.n=hwHand(r,110,700,'这一集：结构体 → 5 个函数',38);
  return c;
},
update(c,t){
  c.s.forEach((g,k)=>vis(g,ep(t,1+.9*k,1.6+.9*k),10));
  const a=[7.4,9.4,12.4,16.2,19];c.f.forEach((g,k)=>vis(g,ep(t,a[k],a[k]+.6),10));vis(c.n,ep(t,21,21.6),8);
}});

e4Scene({title:'四个结构体',dur:31,lines:E4STRUCT,ct:'结构体',rows:19,fs:23,lh:34,w:560,caps:[
  [.4,8.2,'先看数据。Point 是一个点，两个整数坐标。用 long long 是因为后面要算平方、求和、再相乘，int 装不下。'],
  [8.4,15.2,'Center 是一个质心。质心是平均值，一般是小数，所以用浮点类型 long double。'],
  [15.4,22.2,'Cluster 是一个簇：一个点的列表，加上 birth，表示它是第几个生成的。'],
  [22.4,30.6,'SplitResult 是试拆一个簇得到的结果：两个子簇，SSE 下降量的分子和分母，还有一个表示是否成功的标记。']],
steps:[
  {t:1,hl:[0,3],head:'Point：一个点',body:['x、y 是输入的整数坐标。',e4M('long long')+' 的范围约 9.2×10¹⁸，'+e4M('int')+' 只有约 2.1×10⁹。','后面要算平方、累加、再相乘，中间结果会超过 int。']},
  {t:8.4,hl:[4,7],head:'Center：一个质心',body:['质心是坐标的平均值，通常是小数。',e4M('long double')+'：比 double 精度更高的浮点数。']},
  {t:15.4,hl:[8,11],head:'Cluster：一个簇',body:[e4M('points')+'：这个簇里的所有点。',e4M('birth')+'：生成顺序。初始簇是 0，之后每个新簇依次是 1、2、3……','只在平局时用来比“谁更早生成”。']},
  {t:22.4,hl:[12,18],head:'SplitResult：试拆的结果',body:[e4M('child0')+'、'+e4M('child1')+'：两个子簇。',e4M('gradNum')+' / '+e4M('gradDen')+'：SSE 下降量，写成“分子 / 分母”。',e4M('valid')+'：这次试拆是否成功。']}]});

e4Scene({title:'getSSENumerator',dur:41,lines:E4SSE,ct:'getSSENumerator',fs:23,lh:36,w:790,caps:[
  [.4,7.8,'第一个函数 getSSENumerator。它算的不是 SSE 本身，而是 n 乘以 SSE，结果一定是整数。'],
  [8,14.8,'先用一个循环求出三个和：所有 x 的和，所有 y 的和，所有 x 平方加 y 平方的和。'],
  [15,24.8,'然后套公式。把 SSE 的定义展开，再把质心换成“坐标和除以 n”，就得到这个式子。两边乘 n，就是 return 这一行。'],
  [25,32.8,'用样例 1 验证：三个和是 9、9、82。82 乘 3，减 81，再减 81，等于 84。84 除以 3 是 28，和第 2 集手算的 SSE 一样。'],
  [33,40.6,'为什么不直接除以 n？因为除出来可能是小数，有误差。后面要判断两个下降量是不是正好相等，所以全程用整数。']],
steps:[
  {t:1,hl:[0,0],head:'算一个簇的 n × SSE',body:['参数 '+e4M('pts')+'：这个簇的所有点。'+e4M('const &amp;')+' 表示不复制、只读。','返回一个整数。Numerator 是“分子”的意思：','<b>SSE = 返回值 ÷ n</b>']},
  {t:8,hl:[1,9],head:'先求三个和',body:[e4M('n')+'：点数',e4M('sumX')+'、'+e4M('sumY')+'：所有 x 的和、所有 y 的和',e4M('sumSquare')+'：所有 x² + y² 的和']},
  {t:15,hl:[10,12],head:'公式是怎么来的',body:['SSE = Σ[ (x − μx)² + (y − μy)² ]','把平方展开，再用 μx = sumX ÷ n 化简：','SSE = sumSquare − (sumX² + sumY²) ÷ n','两边乘 n：','<b style="color:var(--blue)">n × SSE = sumSquare·n − sumX² − sumY²</b>']},
  {t:25,hl:[10,12],head:'用样例 1 验证',body:['三个点 (1,1)、(2,2)、(6,6)，n = 3','sumX = 9　sumY = 9','sumSquare = 2 + 8 + 72 = 82','82 × 3 − 81 − 81 = <b style="color:var(--red)">84</b>','SSE = 84 ÷ 3 = 28　和第 2 集手算的一样']},
  {t:33,hl:[10,12],head:'为什么只返回分子',body:['除以 n 可能得到小数，小数有误差。','后面要判断两个下降量是否<b>正好相等</b>。','整数运算没有误差，所以全程不做除法。']}]});

e4Scene({title:'splitCluster · 准备',dur:37.5,lines:E4SPL,ct:'splitCluster（准备）',caps:[
  [.4,7.8,'splitCluster 对一个簇做 K-means。开头先准备一个结果，valid 标成 false，只有顺利走到最后才改成 true。'],
  [8,14.8,'点数小于 2 就直接返回。其实 main 调用之前已经跳过了单点簇，这几行只是保险，实际走不到。'],
  [15,22.8,'接着找 x 最小和 x 最大的点，记的是下标：minIndex 和 maxIndex。这就是题目规定的两个初始质心的位置。'],
  [23,29.8,'用这两个点的坐标建两个质心 c0 和 c1。括号里的 long double 是把整数坐标转换成浮点数。'],
  [30,37.1,'最后准备两个数组。belong 记上一轮每个点归几号，初始全是 −1，表示还没分过；newBelong 记这一轮的归属。']],
steps:[
  {t:1,hl:[0,2],top:0,head:'试拆一个簇',body:['参数 '+e4M('pts')+'：要拆的簇的所有点。','返回一个 '+e4M('SplitResult')+'。','先把 '+e4M('valid')+' 设成 false，走到函数最后才改成 true。']},
  {t:8,hl:[3,6],top:0,head:'少于 2 个点：直接返回',body:['返回时 valid 还是 false，表示拆不了。',E4NO+'：main 调用前已经跳过了单点簇，这里是保险。']},
  {t:15,hl:[7,16],top:0,head:'找 x 最小、x 最大的点',body:[e4M('minIndex')+'、'+e4M('maxIndex')+' 记的是<b>下标</b>。','循环从下标 1 开始：下标 0 是初始值。','各点的 x 互不相同，所以结果唯一。']},
  {t:23,hl:[17,24],top:5,head:'两个初始质心',body:['c0 放在 x 最小的点上，c1 放在 x 最大的点上。',e4M('(long double)')+'：把整数坐标转成浮点数。','花括号按成员顺序赋值：先 x，后 y。']},
  {t:30,hl:[25,26],top:5,head:'两个归属数组',body:[e4M('belong')+'：上一轮每个点归几号。<br>'+e4M('(n, -1)')+' 表示 n 个 −1，意思是“还没分过”。',e4M('newBelong')+'：这一轮每个点归几号（0 或 1）。']}]});

e4Scene({title:'splitCluster · 循环上半',dur:31,lines:E4SPL,ct:'splitCluster（循环：分配、比较归属）',caps:[
  [.4,7.3,'主循环是 while true，条件永远成立，靠循环体最后的 break 跳出。每循环一次，就是第 3 集里的“一轮”。'],
  [7.5,14.8,'第一段：对每个点，算它到 c0 和 c1 的距离平方。横向差的平方加纵向差的平方，不开根号。'],
  [15,22.3,'然后比大小：d0 小于等于 d1 归 0 号，否则归 1 号。一样远时归 0 号，靠的就是这个等号。'],
  [22.5,30.6,'第二段：把这一轮的归属和上一轮逐个比较。全都一样，same 才是 true。第一轮的“上一轮”全是 −1，所以 same 一定是 false。']],
steps:[
  {t:1,hl:[27,27],top:27,head:'while (true)：一轮一轮做',body:['条件永远为真，靠循环体最后的 '+e4M('break')+' 跳出。','循环体分四段：','① 分配　② 比较归属　③ 新质心　④ 停不停']},
  {t:7.5,hl:[28,34],top:27,head:'① 算距离的平方',body:[e4M('dx0')+'、'+e4M('dy0')+'：这个点到 c0 的横向差、纵向差。',e4M('d0')+' = dx0² + dy0²，'+e4M('d1')+' 同理。','只比较远近，不需要开根号。']},
  {t:15,hl:[35,39],top:27,head:'① 归到更近的质心',body:['d0 ≤ d1 → 归 0 号；否则归 1 号。','<b style="color:var(--red)">等号在这里</b>：一样远时归 0 号（用例 04）。']},
  {t:22.5,hl:[41,47],top:27,head:'② 和上一轮比',body:['逐个比较 '+e4M('belong[i]')+' 和 '+e4M('newBelong[i]')+'。','有一个不同，same 就是 false，'+e4M('break')+' 跳出这个小循环。','第一轮 belong 全是 −1，same 一定是 false。']}]});

e4Scene({title:'splitCluster · 循环下半',dur:43,lines:E4SPL,ct:'splitCluster（循环：新质心、停止条件）',caps:[
  [.4,8.8,'第三段：重新算质心。先分别累加两个簇的 x 之和、y 之和，还有点数。'],
  [9,16.8,'如果有一个簇是空的，就返回失败。这也是保险：按题目的选法，两个簇都不会空，实际走不到。'],
  [17,23.3,'新质心就是坐标和除以点数。'],
  [23.5,29.8,'第四段：算两个质心各移动了多远，取大的那个，叫 maxMove。这里开了根号，因为要和 1e-6 这个距离比较。'],
  [30,35.3,'然后把这一轮的归属和质心存起来，变成下一轮眼里的“上一轮”。'],
  [35.5,42.6,'最后判断：归属没变，或者最大移动量小于 1e-6，就 break。否则回到循环开头，再来一轮。']],
steps:[
  {t:1,hl:[48,64],top:47,head:'③ 累加坐标和、点数',body:[e4M('sumX0')+'、'+e4M('sumY0')+'、'+e4M('cnt0')+'：0 号簇的 x 之和、y 之和、点数。','带 1 的三个变量是 1 号簇的。','按 '+e4M('newBelong[i]')+' 是 0 还是 1 分别累加。']},
  {t:9,hl:[65,67],top:47,head:'空簇保护',body:['某个簇一个点都没有，就没法求平均（会除以 0），返回失败。',E4NO+'：第一轮里 x 最小的点一定归 0 号、x 最大的点一定归 1 号；之后每个质心都在自己那组点中间，不会一个点都分不到。']},
  {t:17,hl:[68,75],top:55,head:'③ 新质心 = 坐标和 ÷ 点数',body:['sumX0 是浮点数，除以整数 cnt0，结果是浮点数，不是整数除法。']},
  {t:23.5,hl:[76,82],top:62,head:'④ 质心移动了多远',body:[e4M('move0')+'：新旧 c0 之间的直线距离。','这里要开根号（'+e4M('sqrt')+'），因为要和 1e-6 这个距离比。',e4M('maxMove')+'：两个里更大的那个。']},
  {t:30,hl:[83,85],top:67,head:'这一轮变成“上一轮”',body:[e4M('belong = newBelong')+'：整个数组复制过去。','c0、c1 换成新质心，给下一轮用。']},
  {t:35.5,hl:[86,88],top:67,head:'④ 停不停',body:[e4M('same')+'：归属没变。',e4M('maxMove &lt; 1e-6L')+'：质心几乎没动。末尾的 L 表示 long double 常数。','满足一个就 break。','只有 2 个点的簇靠第二个条件停，其余都靠第一个。']}]});

e4Scene({title:'splitCluster · 子簇和下降量',dur:39,lines:E4SPL,ct:'splitCluster（结尾）',caps:[
  [.4,7.8,'循环结束后，按最后一轮的归属，把点分别放进 child0 和 child1，这就是两个子簇。'],
  [8,14.8,'接着算下降量。先调用三次 getSSENumerator，得到父簇和两个子簇的 n 乘 SSE，再取出它们各自的点数。'],
  [15,24.8,'下降量等于父簇的 SSE 减去两个子簇的 SSE，是三个分数相减。分母不同，就通分：公共分母是三个点数的乘积。分子叫 gradNum，分母叫 gradDen。'],
  [25,32.8,'用样例 1 验证：分子是 84 乘 2 乘 1，减 2 乘 3 乘 1，再减 0，等于 162；分母是 6。162 除以 6 是 27，对上了。'],
  [33,38.6,'最后把 valid 改成 true，返回。下降量始终是“分子、分母”两个整数，没有做过除法。']],
steps:[
  {t:1,hl:[90,96],top:89,head:'分成两个子簇',body:[e4M('belong[i]')+' 是 0 的点放进 child0，是 1 的放进 child1。',e4M('push_back')+'：在 vector 末尾追加一个元素。']},
  {t:8,hl:[97,102],top:89,head:'三个簇的 n × SSE 和点数',body:[e4M('parentNum')+'、'+e4M('child0Num')+'、'+e4M('child1Num')+'：父簇和两个子簇的 n × SSE。',e4M('parentN')+'、'+e4M('n0')+'、'+e4M('n1')+'：它们各自的点数。']},
  {t:15,hl:[103,108],top:89,head:'下降量通分成一个分数',body:['下降量 = parentNum/parentN − child0Num/n0 − child1Num/n1','三个分母不同，通分到 parentN × n0 × n1：','分子 = '+e4M('gradNum')+'　分母 = '+e4M('gradDen')]},
  {t:25,hl:[103,108],top:89,head:'用样例 1 验证',body:['父簇 84 / 3，子簇 2 / 2 和 0 / 1','gradNum = 84×2×1 − 2×3×1 − 0×3×2 = <b style="color:var(--red)">162</b>','gradDen = 3×2×1 = <b style="color:var(--red)">6</b>','162 ÷ 6 = 27　和第 2 集的下降量一样']},
  {t:33,hl:[109,110],top:89,head:'成功，返回',body:['valid 改成 true。','main 拿到的是：两个子簇 + 下降量的分子和分母。']}]});

e4Scene({title:'compareGrad',dur:38,lines:E4CMP,ct:'compareGrad',fs:23,lh:36,w:760,caps:[
  [.4,7.8,'compareGrad 比较两个下降量。每个下降量是一个分数，所以传进来四个数：A 的分子、分母，B 的分子、分母。'],
  [8,15.8,'分数比大小不做除法，而是交叉相乘：A 的分子乘 B 的分母，和 B 的分子乘 A 的分母比。分母都是正数，所以大小关系不变。'],
  [16,23.8,'拿第 2 轮举例。当前簇 D、E、F 是 6 分之 45，目前最好的 A、B、C 是 6 分之 180。交叉相乘是 270 和 1080，左边小，返回 −1。'],
  [24,31.8,'两个 long long 相乘可能很大，所以先转成 128 位整数再乘。按这道题的范围仔细估算，其实不会超出 long long，这是保险写法。'],
  [32,37.6,'最后是三种结果：大于返回 1，小于返回 −1，相等返回 0。因为全是整数运算，“相等”的判断是可靠的。']],
steps:[
  {t:1,hl:[0,1],head:'比较两个下降量',body:['A 的下降量 = numA / denA','B 的下降量 = numB / denB','返回 1：A 大　　0：相等　　−1：B 大']},
  {t:8,hl:[2,3],head:'交叉相乘，不做除法',body:['numA/denA &gt; numB/denB','　⇔　numA × denB &gt; numB × denA','两个分母都是正数，这样变形才成立。']},
  {t:16,hl:[2,3],head:'例：第 2 轮的两个候选',body:['当前簇 DEF：45 / 6（= 7.5）','目前最好 ABC：180 / 6（= 30）','left = 45 × 6 = 270','right = 180 × 6 = 1080','left &lt; right → 返回 −1：DEF 更小，不换']},
  {t:24,hl:[2,3],head:'__int128 是什么',body:['GCC 提供的 128 位整数，范围比 long long 大得多。',e4M('(__int128)numA * denB')+'：先转成 128 位再乘，不会溢出。','按本题范围细算，乘积不超过约 3×10¹⁸，long long（9.2×10¹⁸）其实够用。用 __int128 是省去估算的保险写法。']},
  {t:32,hl:[4,10],head:'比较，返回结果',body:['整数比较没有误差，','所以“相等”（返回 0）是可靠的。','平局规则就建立在这个 0 上。']}]});

e4Scene({title:'main · 读入和第 0 轮',dur:26,lines:E4MAIN,ct:'main（开头）',rows:19,caps:[
  [.4,5.8,'最后看 main。开头两行是让输入输出更快的固定写法，和算法没有关系。'],
  [6,12.8,'然后读入 N 和 L，再读 L 个点，放进 allPoints。'],
  [13,20.8,'建簇列表 clusters，放进第一个簇：包含全部点，birth 是 0。birthCounter 是下一个新簇的编号，从 1 开始。'],
  [21,25.6,'还没开始拆，先调用 printClusterSizes 输出一行，这就是第 0 轮的输出。']],
steps:[
  {t:1,hl:[1,2],top:0,head:'加速输入输出',body:['竞赛代码的固定开头，和算法无关。']},
  {t:6,hl:[3,11],top:0,head:'读入',body:[e4M('N')+'：目标簇数　'+e4M('L')+'：点数',e4M('vector&lt;Point&gt; allPoints(L)')+'：先开好 L 个位置，再按下标读入。']},
  {t:13,hl:[12,17],top:0,head:'初始簇',body:[e4M('clusters')+'：簇列表。','放进第一个簇：全部点，birth = 0。','花括号按 Cluster 的成员顺序赋值：points、birth。',e4M('birthCounter = 1')+'：下一个新簇的编号。']},
  {t:21,hl:[18,18],top:0,head:'第 0 轮的输出',body:['还没拆，先输出一行。']}]});

e4Scene({title:'printClusterSizes',dur:22,lines:E4PRINT,ct:'printClusterSizes',fs:22,lh:34,w:860,caps:[
  [.4,6.8,'printClusterSizes 负责输出一行。先把每个簇的点数取出来，放进 sizes。'],
  [7,13.8,'然后排序。sort 默认从小到大，加上 greater 这个参数，就变成从大到小。'],
  [14,21.6,'最后依次输出，数字之间用空格隔开。第一个数前面不加空格，所以行尾不会多出空格。']],
steps:[
  {t:1,hl:[1,4],head:'取出每个簇的点数',body:[e4M('sizes')+' 里只放点数，不放点。']},
  {t:7,hl:[5,5],head:'从大到小排序',body:[e4M('sort(开始, 结束)')+' 默认从小到大。','第三个参数 '+e4M('greater&lt;int&gt;()')+'：大的排前面。']},
  {t:14,hl:[6,12],head:'输出一行',body:['i &gt; 0 时先输出一个空格，再输出数字。','这样数字之间有空格，行尾没有多余空格。',e4M("'\\n'")+'：换行。']}]});

(function(){
  const L=E4MAIN,w0=e4L(L,'while ('),f0=e4L(L,'for (int i = 0; i < (int)clusters'),sk=e4L(L,'points.size() < 2'),cu=e4L(L,'SplitResult cur ='),va=e4L(L,'if (!cur.valid)'),
    fi=e4L(L,'if (bestIndex == -1)'),cm=e4L(L,'int cmp = compareGrad('),gt=e4L(L,'if (cmp > 0)'),eq=e4L(L,'else if (cmp == 0)'),sz=e4L(L,'if (curSize > bestSize)'),bi=e4L(L,'else if (curSize == bestSize'),
    nb=e4L(L,'if (bestIndex == -1)',fi+1),er=e4L(L,'clusters.erase('),p0=e4L(L,'clusters.push_back({',er),p1=e4L(L,'clusters.push_back({',p0+1),pr2=e4L(L,'printClusterSizes(clusters);',p1);
  e4Scene({title:'main · 选簇',dur:53,lines:L,ct:'main（选哪个簇）',caps:[
    [.4,8.8,'主循环：只要簇数还不到 N 就继续。每一轮先准备两个变量：bestIndex 记目前最好的候选是第几个簇，−1 表示还没有；bestSplit 记它的试拆结果。'],
    [9,14.8,'然后用 for 循环逐个看每个簇。只有一个点的簇直接 continue 跳过。'],
    [15,21.8,'对能拆的簇调用 splitCluster 试拆。下面判断 valid 的三行是保险，实际走不到。'],
    [22,27.8,'如果 bestIndex 还是 −1，说明这是第一个候选，没有比较对象，直接记下来。'],
    [28,35.8,'否则调用 compareGrad，和目前最好的比。当前簇的下降量更大，就把“最好的”换成它；更小，什么都不做。'],
    [36,42.8,'下降量相同时比点数：当前簇的点更多，就换成它。这是平局的第二级规则。'],
    [43,52.6,'点数也相同时，代码写的是“当前簇的 birth 更小才换”。但列表按 birth 从小到大排，后看到的簇 birth 一定更大，所以这个分支永远不成立。完全平局时保留先遇到的，正好就是更早生成的。']],
  steps:[
    {t:1,hl:[w0,w0+2],top:w0-1,head:'主循环',body:['簇数 &lt; N 就再拆一轮。N = 1 时一次也不进来（样例 2）。',e4M('bestIndex')+'：目前最好的候选是列表里的第几个；−1 表示还没有。',e4M('bestSplit')+'：它的试拆结果。']},
    {t:9,hl:[f0,sk+2],top:w0-1,head:'逐个看每个簇',body:['点数 &lt; 2 的簇没法拆。',e4M('continue')+'：跳过后面的代码，直接看下一个簇。']},
    {t:15,hl:[cu,va+2],top:w0-1,head:'试拆',body:[e4M('cur')+'：当前这个簇的试拆结果。','判断 '+e4M('!cur.valid')+' 的三行 '+E4NO+'：splitCluster 不会失败。']},
    {t:22,hl:[fi,fi+4],top:w0+3,head:'第一个候选',body:['bestIndex 还是 −1，没有比较对象。','直接记成“目前最好的”，然后看下一个簇。']},
    {t:28,hl:[cm,gt+3],top:cm-6,head:'比下降量',body:[e4M('cmp &gt; 0')+'：当前簇的下降量更大 → 换成它。',e4M('cmp &lt; 0')+'：更小 → 什么都不做。',e4M('cmp == 0')+'：一样大 → 看下面。']},
    {t:36,hl:[eq,sz+3],top:cm-3,head:'一样大：比点数',body:['当前簇的点更多 → 换成它（用例 09）。','当前簇的点更少 → 不换（用例 10）。']},
    {t:43,hl:[bi,bi+5],top:cm,head:'点数也一样：比 birth',body:['条件是“当前簇的 birth 更小”。','<b style="color:var(--red)">这个分支走不到</b>：列表按 birth 从小到大排，后看到的簇 birth 一定更大。','完全平局时不替换，留下的就是更早生成的（用例 11）。']}]});

  e4Scene({title:'main · 真拆和输出',dur:31,lines:L,ct:'main（真拆、输出）',caps:[
    [.4,6.8,'一轮比完，如果 bestIndex 还是 −1，说明没有任何簇能拆，直接 break 结束。N 比点数多的时候会走到这里。'],
    [7,13.8,'否则真正拆开。先用 erase 把父簇从列表里删掉，后面的簇往前挪。'],
    [14,24.8,'再用 push_back 把两个子簇加到末尾，0 号在前，1 号在后。birthCounter 加加的意思是：先用现在的值当编号，然后自己加 1。'],
    [25,30.6,'最后输出这一轮的结果，回到 while 的开头。']],
  steps:[
    {t:1,hl:[nb,nb+2],top:nb-8,head:'没有候选：提前结束',body:['所有簇都只剩 1 个点时会走到这里（用例 12、13）。']},
    {t:7,hl:[er,er+2],top:nb-8,head:'删除父簇',body:[e4M('clusters.begin() + bestIndex')+'：第 bestIndex 个元素的位置。',e4M('erase')+' 删掉它，后面的元素依次前移一位。']},
    {t:14,hl:[p0,p0+3],top:nb-8,head:'加入 0 号子簇',body:[e4M('birthCounter++')+'：先用现在的值当 birth，再把 birthCounter 加 1。']},
    {t:20,hl:[p1,p1+3],top:nb-8,head:'加入 1 号子簇',body:['两个子簇都加在列表末尾，0 号在前。','所以列表一直按 birth 从小到大排。']},
    {t:25,hl:[pr2,pr2],top:nb-8,head:'输出这一轮',body:['然后回到 '+e4M('while')+'，看簇数到没到 N。']}]});
})();

/* 走不到的四处 */
SC.push({title:'四处走不到的代码',dur:30,caps:[
  [.4,10,'代码里有四处实际走不到：splitCluster 里点数小于 2 的返回、空簇的返回，main 里 valid 为 false 的跳过，还有平局时比较 birth 的那个分支。它们都是保险。'],
  [10.2,20,'除了这四处，其余每一行都能被用例走到。讲解旁边准备了 14 个用例，每个用例标了它走到哪些分支。'],
  [20.2,29.6,'建议的练习：挑一个用例，先自己在纸上算出每一轮的输出，再运行程序对答案。']],
build(r){
  const c={};hwTxt(r,110,128,'四处走不到的代码（都是保险）',40,{fontFamily:'var(--display)',fontWeight:900});
  const rows=[['splitCluster','if (n &lt; 2) { return result; }','main 调用前已经跳过了单点簇'],['splitCluster','if (cnt0 == 0 || cnt1 == 0) { return result; }','两个簇都不会是空的'],
    ['main','if (!cur.valid) { continue; }','上面两处都不发生，valid 一定是 true'],['main','else if (curSize == bestSize &amp;&amp; …birth &lt; …birth)','列表按 birth 从小到大排，后看到的 birth 更大']];
  c.rows=rows.map(([f,code,why],k)=>{const g=H('div','a',{left:110,top:206+96*k,width:1700,height:96,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:8,top:30,fontSize:24,color:'var(--graphite)',fontFamily:'var(--mono)'},g,f);
    H('div','a',{left:220,top:26,fontSize:28,fontFamily:'var(--mono)',fontWeight:700},g,code);
    H('div','a',{left:1010,top:28,fontSize:27},g,why);return g;});
  c.a=hwTxt(r,110,620,'其余每一行，14 个用例都能走到（用覆盖率工具核对过）',34,{fontWeight:700});
  c.b=hwTxt(r,110,680,'再加 3000 组随机数据：这四处仍然一次都没有执行',28,{color:'var(--graphite)'});
  c.n=hwHand(r,110,770,'练习：挑一个用例，先手算每一轮的输出，再运行程序对答案',38);
  return c;
},
update(c,t){c.rows.forEach((g,k)=>vis(g,ep(t,1+1.8*k,1.6+1.8*k),8));vis(c.a,ep(t,10.4,11),8);vis(c.b,ep(t,13.4,14),8);vis(c.n,ep(t,20.4,21),8);}});

/* 小结 */
SC.push({title:'小结',dur:21,caps:[
  [.4,9.4,'把整个程序再串一遍。main 读入后先输出第 0 轮，然后循环：对每个簇调用 splitCluster 试拆，用 compareGrad 选出最好的，再 erase、push_back，输出一行。'],
  [9.6,20.6,'记住三个设计：K-means 的过程用浮点数；SSE 和下降量用整数和分数，所以平局判断可靠；簇列表的顺序就是生成的顺序。五集到这里结束。']],
build(r){
  const c={};
  c.h=hwTxt(r,130,136,'整个程序',64,{fontFamily:'var(--display)',fontWeight:900});
  c.code=hwCode(r,130,260,['main:','    读入 N、L 和 L 个点','    printClusterSizes            // 第 0 轮','    while (簇数 < N):','        for 每个点数 >= 2 的簇:','            splitCluster         // 试拆，得到下降量','            compareGrad          // 和目前最好的比','        没有候选 -> break','        erase 父簇，push_back 两个子簇','        printClusterSizes        // 这一轮'],25,40,'流程（示意，不是 C++）',820);
  const k=[['K-means 的过程','用浮点数 long double'],['SSE 和下降量','用整数、分数 → 平局判断可靠'],['簇列表的顺序','就是生成的顺序（birth 从小到大）']];
  c.k=k.map(([a,b],q)=>{const g=H('div','a',{left:1040,top:280+130*q,width:780,height:130,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:8,top:20,fontSize:34,fontWeight:700,color:'var(--blue)'},g,a);H('div','a',{left:8,top:72,fontSize:30},g,b);return g;});
  c.n=hwHand(r,1040,700,'五集到这里结束',42);
  return c;
},
update(c,t){vis(c.h,ep(t,.3,1),16);c.code.box.style.opacity=ep(t,1,1.7);c.k.forEach((g,q)=>vis(g,ep(t,9.8+2.6*q,10.4+2.6*q),8));vis(c.n,ep(t,18,18.6),8);}});
