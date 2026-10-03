/* ===== 第 1 集：读题 =====
   左边放题目原文（照截图逐字转写），讲到哪一句就把哪一句标黄；右边写这句话的意思。 */
const R1K=hwRunOf('k6');
const R1PARTS=['题目描述','公式说明','输入','输出','样例','提示'];
// 顶上的一排小标签：现在读到题目的哪一块
function r1Crumb(r,on){
  const box=H('div','a',{left:80,top:112,display:'flex',gap:'10px',alignItems:'center'},r);
  H('div','',{fontSize:20,color:'var(--graphite)',marginRight:'8px'},box,'正在读');
  R1PARTS.forEach((s,k)=>{const hot=on.indexOf(k)>=0;
    H('div','',{fontSize:21,padding:'4px 16px',borderRadius:'18px',border:'2px solid '+(hot?'var(--blue)':'rgba(27,38,49,.18)'),background:hot?'var(--blue)':'transparent',color:hot?'#fff':'var(--graphite)',fontWeight:hot?700:400},box,s);});
}
const r1Sub=s=>`<div style="font-size:21px;color:#66707A;letter-spacing:.08em;margin:0 0 4px">${s}</div>`;
/* 通用版面。o：{title, dur, caps, part:[标签下标], src 原文 HTML（要标黄的句子写成 <span data-k="名字">）, fs 原文字号,
   marks:[[名字, 开始, 结束]], rh 右边的小标题, notes:[[出现时间, 文字, 类型]], extra(r, c), upd(c, t)}
   类型：p 普通　b 加粗　h 红色手写　g 灰色小字　q 蓝色问题 */
function r1Scene(o){
  const KIND={p:{fontSize:29,lineHeight:1.6,marginBottom:'16px'},b:{fontSize:32,fontWeight:700,lineHeight:1.5,marginBottom:'14px'},
    h:{fontSize:36,lineHeight:1.45,marginBottom:'16px',fontFamily:'var(--hand)',color:'var(--red)'},g:{fontSize:24,lineHeight:1.6,marginBottom:'14px',color:'var(--graphite)'},
    q:{fontSize:30,lineHeight:1.55,marginBottom:'12px',color:'var(--blue)',fontWeight:700}};
  SC.push({title:o.title,dur:o.dur,caps:o.caps,
  build(r){
    const c={};r1Crumb(r,o.part);
    H('div','card',{left:80,top:166,width:900,height:712},r);
    hwTxt(r,110,182,'题目原文',20,{color:'var(--graphite)',letterSpacing:'.12em'});
    c.src=H('div','a',{left:110,top:222,width:840,whiteSpace:'normal',fontSize:o.fs||29,lineHeight:1.8},r,o.src);
    c.mk={};c.src.querySelectorAll('[data-k]').forEach(e=>{c.mk[e.dataset.k]=e;e.style.borderRadius='5px';e.style.padding='2px 1px';});
    hwTxt(r,1040,182,o.rh||'这句话的意思',20,{color:'var(--graphite)',letterSpacing:'.12em'});
    const col=H('div','a',{left:1040,top:222,width:800,whiteSpace:'normal'},r);
    c.notes=o.notes.map(([tt,html,kind])=>H('div','',Object.assign({opacity:0},KIND[kind||'p']),col,html));
    if(o.extra)o.extra(r,c);
    return c;
  },
  update(c,t){
    (o.marks||[]).forEach(([k,a,b])=>{const e=c.mk[k],on=hwWin(t,a,b);
      e.style.background=on>0?`rgba(255,225,77,${.9*on})`:'transparent';e.style.boxShadow=t>=b?'inset 0 -3px 0 rgba(255,184,0,.75)':'none';});
    c.notes.forEach((e,k)=>vis(e,ep(t,o.notes[k][0],o.notes[k][0]+.6),8));
    if(o.upd)o.upd(c,t);
  }});
}
// 原文卡片底部的小示意图：6 个点
function r1Mini(r,c){
  hwTxt(r,110,560,'示意图：6 台路由器 = 6 个点',20,{color:'var(--graphite)'});
  c.pl=hwPlane(r,{x:170,y:626,u:30,xmax:12,ymax:7,tick:2});
  c.P=R1K.pts.map((p,i)=>hwPt(c.pl,p,HWN[i],{r:9,fs:17,dx:12,dy:-10}));
}
function r1Color(c,stage){   // stage：0 不分组；1、2…… 拆了几次之后
  const cl=stage?R1K.rounds[stage-1].after:null;
  c.P.forEach((e,i)=>e.set(cl?HWC[cl.find(q=>q.pts.some(p=>p.id===i)).birth%8]:HWINK));
}
const R1DESC=['某省骨干网中部署了多台核心路由器设备。','为了提升网络运维效率，需要将这些物理分散的路由器逻辑上划分为 N 个管理域，','要求同一域内的设备在地理位置上尽量靠近以便于统一调度。',
  '现采用 ','Bi-K-means（二分K-means）算法进行聚类','：','初始时将所有设备视为一个整体（初始簇 C0）','，','通过不断分裂当前最“适合”的域（簇）','，','直到域（簇）的数量达到 N',' 。'];

/* 1 先看题目有哪几块 */
SC.push({title:'题目有哪几块',dur:23,caps:[
  [.4,7,'这一集只做一件事：把题目读懂。先看整道题有哪几块：一段题目描述，公式说明，输入，输出，两个样例，最后是四条提示。'],
  [7.2,15,'读的顺序是：先读题目描述，弄清楚要我干什么；再读输入、输出和样例，弄清楚给我什么、要我交什么。'],
  [15.2,22.6,'最后读公式说明和提示，它们规定了具体怎么做。这道题的难点不在算法多巧，而在规则多，一条都不能漏。']],
build(r){
  const c={};
  c.eb=hwTxt(r,110,128,'华为机试 · 第 21 题 · 第 1 集',26,{color:'var(--graphite)',letterSpacing:'.04em'});
  c.ti=hwTxt(r,104,166,'核心路由器管理域规划：读题',68,{fontFamily:'var(--display)',fontWeight:900});
  const blk=[['题目描述','一段话：背景，要做什么',1],['公式说明','SSE、SSE 下降量 两个公式',3],['解答要求','时间 1 秒，内存 512 MB',0],['输入','N、L，L 个点的坐标',2],['输出','每一轮分裂后的结果',2],['样例 1、样例 2','两组输入输出和解释',2],['提示 1 – 4','四条规定，决定了具体怎么做',3]];
  c.blk=blk.map(([a,b,o],k)=>{const g=H('div','card',{left:110,top:290+82*k,width:800,height:70,opacity:0},r);
    H('div','a',{left:24,top:17,fontSize:28,fontWeight:700},g,a);H('div','a',{left:290,top:20,fontSize:24,color:'var(--graphite)'},g,b);
    const n=H('div','a',{left:728,top:11,width:48,height:48,borderRadius:'50%',background:o===1?'var(--blue)':o===2?'#1E8E5A':o===3?'var(--red)':'transparent',color:'#fff',fontSize:28,fontWeight:700,textAlign:'center',lineHeight:'48px',opacity:0},g,o?'①②③'[o-1]:'');
    return {g,n,o};});
  hwTxt(r,1000,300,'读的顺序',24,{color:'var(--graphite)'});
  const st=[['①','题目描述','要我干什么','var(--blue)'],['②','输入、输出、样例','给我什么，要我交什么','#1E8E5A'],['③','公式说明、提示','具体怎么做（规则）','var(--red)']];
  c.st=st.map(([n,a,b,col],k)=>{const g=H('div','a',{left:1000,top:346+124*k,width:820,height:124,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:8,top:30,fontSize:50,color:col,fontWeight:700},g,n);H('div','a',{left:96,top:22,fontSize:34,fontWeight:700},g,a);H('div','a',{left:96,top:72,fontSize:28,color:'var(--graphite)'},g,b);return g;});
  c.n=hwHand(r,1000,740,'规则多，一条都不能漏',40);
  return c;
},
update(c,t){
  vis(c.eb,ep(t,.2,.8),10);vis(c.ti,ep(t,.3,1.1),18);
  c.blk.forEach((b,k)=>{vis(b.g,ep(t,1.2+.5*k,1.8+.5*k),10);const a=[0,7.6,10.6,15.6][b.o];b.n.style.opacity=b.o?ep(t,a,a+.6):0;});
  const a=[7.4,10.4,15.4];c.st.forEach((g,k)=>vis(g,ep(t,a[k],a[k]+.6),8));vis(c.n,ep(t,19,19.6),8);
}});

r1Scene({title:'题目描述 ①：要分组',dur:28,part:[0],
  src:`<span data-k="a">${R1DESC[0]}</span><span data-k="b">为了提升网络运维效率，需要将这些物理分散的路由器逻辑上<b>划分为 N 个管理域</b>，</span><span data-k="c">要求<b>同一域内的设备在地理位置上尽量靠近</b>以便于统一调度。</span><span style="color:#AFB7BD">${R1DESC.slice(3).join('')}</span>`,
  marks:[['a',.6,7.6],['b',7.8,13.6],['c',13.8,19.6]],
  notes:[[2,'“部署了多台核心路由器”：有一批设备，每台有自己的位置。把它们想成地图上的点。'],[8.4,'“划分为 N 个管理域”：把这些设备分成 N 组。N 是多少，输入会给。'],[14.4,'“同一域内的设备在地理位置上尽量靠近”：离得近的，分在同一组。'],[20.4,'一句话：给一批点，按远近分成 N 组','h'],[23.4,'具体怎么分？下一句会说。','g']],
  extra:r1Mini,upd(c,t){r1Color(c,t>=15?1:0);},caps:[
  [.4,7.6,'先读题目描述的前两句。第一句是背景：某个省有很多台核心路由器。读题时把它们想成地图上的很多个点。'],
  [7.8,13.6,'第二句说，要把它们划分成 N 个管理域。管理域就是“组”，N 是组数，由输入给出。'],
  [13.8,19.6,'分组的要求是：同一个域里的设备，地理位置尽量靠近。也就是离得近的点放在一组。'],
  [19.8,27.6,'所以这两句话合起来就是：给你一批点，把它们按远近分成 N 组。到这里还不知道具体怎么分，接着往下读。']]});

r1Scene({title:'题目描述 ②：怎么分',dur:34,part:[0],
  src:`<span style="color:#AFB7BD">${R1DESC.slice(0,3).join('')}</span>现采用 <span data-k="e">Bi-K-means（二分K-means）算法进行<b>聚类</b></span>：<span data-k="f">初始时将所有设备视为一个整体（<b>初始簇 C0</b>）</span>，<span data-k="g">通过<b>不断分裂</b>当前最“适合”的域（簇）</span>，<span data-k="h">直到域（簇）的<b>数量达到 N</b></span> 。`,
  marks:[['e',.6,7.6],['f',7.8,13.6],['g',13.8,19.6],['h',19.8,24.6]],
  notes:[[1.6,'“聚类”：把点分组。一组点叫一个“簇”。题目里“域”和“簇”是一回事。'],[8.4,'“初始簇 C0”：一开始，所有点都在同一个簇里。'],[14.4,'“不断分裂”：每次挑一个簇，把它分成两个。Bi、“二分”说的就是一分为二。'],[20.4,'“数量达到 N”：簇数到了 N 就停。'],[25,'这句话没说清的两件事：','b'],[26.4,'① 最“适合”的簇是哪一个？→ 提示 2','q'],[28.6,'② 一个簇怎么分成两个？→ 提示 3、4','q']],
  extra:r1Mini,upd(c,t){r1Color(c,t<14.6?0:t<17?1:t<19.4?2:3);},caps:[
  [.4,7.6,'第三句给出了分法。先认两个词：“聚类”就是把点分组，一组点叫一个“簇”。题目里的“域”和“簇”是同一个意思。'],
  [7.8,13.6,'“初始时将所有设备视为一个整体”：一开始只有一个簇，所有点都在里面。这个簇叫 C0。'],
  [13.8,19.6,'“不断分裂”：每次挑出一个簇，把它分成两个。名字里的 Bi 和“二分”，说的就是一分为二。'],
  [19.8,24.6,'“直到数量达到 N”：簇的个数到了 N，就停。'],
  [24.8,33.6,'这句话留下两个问题。第一，每次挑哪个簇？题目只说挑最“适合”的。第二，一个簇具体怎么分成两个？这两个问题的答案都在后面的“提示”里。']]});

r1Scene({title:'输入',dur:30,part:[2],rh:'对照样例 1 的输入',fs:28,
  src:`${r1Sub('输入')}输入数据包含：<br>1. <span data-k="a">第1行：期望划分的管理域数量 <b>N</b>，1&lt;=N&lt;=20。</span><br>2. <span data-k="b">第2行：核心路由器总数 <b>L</b>，表明接下来的 L 行是相关路由器的二维位置坐标，1&lt;=L&lt;=100。</span><br>3. <span data-k="c">第3到最后一行：每一行是一个路由器的二维位置坐标 (x, y)，其中 x 为经度，y 为纬度。</span><span data-k="d">输入坐标数据均为<b>整数</b>，0&lt;=x&lt;=1000，</span><span data-k="e">且<b>不同路由器的x坐标值不同</b>; </span>0&lt;=y&lt;=1000。`,
  marks:[['a',.6,6.6],['b',6.8,13.6],['c',13.8,20.6],['d',20.8,24.4],['e',24.6,29.6]],
  notes:[[21.2,'坐标是整数 → 很多量可以用整数精确地算'],[23,'最多 20 个簇、100 个点 → 数据很小，不用担心超时','g'],[25,'x 互不相同 → “x 最小的点”“x 最大的点”只有一个','h']],
  extra(r,c){
    const col=c.notes[0].parentNode;col.style.top='560px';
    H('div','card',{left:1040,top:222,width:800,height:316},r);
    const rows=[['2','N = 2：要分成 2 个簇','var(--red)'],['3','L = 3：后面有 3 行','var(--red)'],['1 1','点 A (1, 1)','var(--blue)'],['2 2','点 B (2, 2)','var(--blue)'],['6 6','点 C (6, 6)','var(--blue)']];
    c.in=rows.map(([a,b,cc],k)=>[hwMono(r,1076,234+58*k,a,38,{fontWeight:700}),hwTxt(r,1230,240+58*k,'← '+b,28,{color:cc})]);
  },
  upd(c,t){const a=[1,7.2,14.6,15.6,16.6];c.in.forEach(([x,y],k)=>{vis(x,ep(t,a[k],a[k]+.5),6);vis(y,ep(t,a[k]+.3,a[k]+.8),0,-10);});},caps:[
  [.4,6.6,'再读输入。第一行是 N，要分成几个簇，最多 20。'],
  [6.8,13.6,'第二行是 L，路由器的个数，也就是点的个数，最多 100。后面跟着 L 行。'],
  [13.8,20.6,'每一行是一个点的坐标，x 是经度，y 是纬度。对照样例 1：N 是 2，L 是 3，三个点是 (1,1)、(2,2)、(6,6)。'],
  [20.8,29.6,'还有两个细节要记住。坐标都是整数；不同路由器的 x 坐标互不相同。第二条看起来不起眼，后面选初始质心的时候要靠它。']]});

r1Scene({title:'输出和样例 1',dur:34,part:[3,4],rh:'这句话的意思',fs:27,
  src:`${r1Sub('输出')}<span data-k="a">输出Bi-K-means算法的<b>每一轮分裂后</b>，</span><span data-k="b">簇列表中<b>各个簇路由器数量的降序列表</b>。</span><span data-k="c">初始簇 C0 的路由器数量作为<b>第0次分裂后的结果</b>。</span><div style="height:22px"></div>${r1Sub('样例 1 · 输入 2 / 3 / 1 1 / 2 2 / 6 6　输出 3 / 2 1')}解释：该样例期望将3个坐标分别为 (1,1), (2,2), (6,6) 的路由器划分为 2 个管理域（簇）。<br><span data-k="d">输出的第一行：第0次分裂后的结果，即：初始簇 C0 的路由器数量 3。</span><br><span data-k="e">输出的第二行：第1次分裂后的结果，按结果中簇的路由器个数降序排序列表为 2, 1。</span>`,
  marks:[['a',.6,7.6],['b',7.8,13.6],['c',13.8,19.6],['d',19.8,23.4],['e',23.6,27.6]],
  notes:[[1.6,'“每一轮分裂后”：每拆一次，输出一行。'],[8.4,'“各个簇路由器数量的降序列表”：每个簇有几个点，从大到小，写在一行里。'],[14.4,'“第 0 次分裂”：还没拆的时候，也要先输出一行，就是总点数。'],[28,'输出的只是点数：不用输出坐标，也不用说哪个点在哪个簇','h']],
  extra(r,c){
    H('div','card',{left:1040,top:560,width:800,height:150},r);
    c.o=[[hwMono(r,1076,574,'3',40,{fontWeight:700}),hwTxt(r,1230,582,'← 第 0 次：一个簇，3 个点',28,{color:'var(--red)'})],
         [hwMono(r,1076,636,'2 1',40,{fontWeight:700}),hwTxt(r,1230,644,'← 第 1 次：两个簇，2 个点和 1 个点',28,{color:'var(--red)'})]];
    c.notes[3].style.marginTop='240px';
  },
  upd(c,t){const a=[20,23.8];c.o.forEach(([x,y],k)=>{vis(x,ep(t,a[k],a[k]+.5),6);vis(y,ep(t,a[k]+.3,a[k]+.8),0,-10);});},caps:[
  [.4,7.6,'然后读输出。“每一轮分裂后”：每拆一次，就输出一行。'],
  [7.8,13.6,'输出的内容是“各个簇路由器数量的降序列表”：每个簇里有几个点，从大到小排，写在一行里。'],
  [13.8,19.6,'还有一句：初始簇的数量作为“第 0 次分裂”的结果。意思是还没开始拆的时候，也要先输出一行。'],
  [19.8,27.6,'对照样例 1 的解释：第一行输出 3，是初始簇的点数；第二行输出 2 1，是拆了一次之后，两个簇分别有 2 个点和 1 个点。'],
  [27.8,33.6,'注意，输出的只是每个簇的点数。不用输出坐标，也不用说哪个点分在哪个簇。']]});

r1Scene({title:'样例 2 和提示 1',dur:26,part:[4,5],
  src:`${r1Sub('样例 2')}输入：1 / 2 / 2 3 / 5 5　　输出：2<br><span data-k="a">解释：<b>不需要分割簇</b>，直接返回初始簇的路由器数 2</span><div style="height:30px"></div>${r1Sub('提示')}1. <span data-k="b">Bi-Kmeans算法的最大迭代次数为 N</span><span data-k="c">（即：<b>分裂后得到的域（簇）的总数量</b>）。</span>`,
  marks:[['a',.6,12.6],['b',12.8,15.6],['c',15.8,18.6]],
  notes:[[1.6,'样例 2 的 N = 1：一开始就是 1 个簇，已经够了，一次也不拆。'],[8.2,'只输出第 0 次的那一行：2。'],[13.4,'提示 1：最后一共要有 N 个簇。'],[19.2,'从 1 个簇到 N 个簇，每拆一次多 1 个<br>→ 拆 N − 1 次，一共输出 N 行','h'],[23,'样例 1：N = 2，输出 2 行。样例 2：N = 1，输出 1 行。','g']],caps:[
  [.4,7.6,'样例 2 是一个特殊情况：N 等于 1。一开始所有点就是一个簇，已经满足要求，一次也不用拆。'],
  [7.8,12.6,'所以只输出第 0 次的那一行，也就是总点数 2。'],
  [12.8,18.6,'提示 1 说“最大迭代次数为 N”，括号里解释了：指的是分裂后簇的总数量。也就是最后一共 N 个簇。'],
  [18.8,25.6,'每拆一次多一个簇，从 1 个到 N 个要拆 N 减 1 次。加上第 0 次，正常情况下一共输出 N 行。']]});

r1Scene({title:'公式说明',dur:32,part:[1],rh:'先认符号，下一集再算',fs:30,
  src:`${r1Sub('公式说明')}<span data-k="a"><b>SSE</b>（误差平方和）</span>：<br><span data-k="b" style="font-size:36px">SSE(C) = Σ<sub style="font-size:22px">p∈C</sub> ‖p − μ‖²</span>，<br><span data-k="c">其中 μ 为簇 C 的质心（坐标均值）。</span><div style="height:36px"></div><span data-k="d"><b>SSE下降量</b></span>：<br><span data-k="e" style="font-size:31px">SSE_Grad = SSE(C<sub style="font-size:20px">parent</sub>) − ( SSE(C<sub style="font-size:20px">child1</sub>) + SSE(C<sub style="font-size:20px">child2</sub>) )</span>`,
  marks:[['c',5.8,10.6],['b',10.8,18.6],['a',18.8,22.6],['e',22.8,31.6]],
  notes:[[1.6,'<b>C</b>：一个簇　　<b>p</b>：簇里的一个点'],[6.2,'<b>μ</b>：质心 = 簇里所有点的坐标平均值'],[11.2,'<b>‖p − μ‖²</b>：点 p 到质心的距离的平方'],[14.6,'<b>Σ</b>：把簇里每个点的这个值加起来'],[19.2,'SSE 越大，这个簇的点越分散','h'],[23.2,'<b>parent</b>：拆之前的簇<br><b>child1、child2</b>：拆出来的两个簇'],[27.4,'下降量 = 拆之前的 SSE − 拆之后两个簇的 SSE 之和']],caps:[
  [.4,5.6,'接着读公式说明。这里定义了两个量。先把符号认清楚，下一集再动手算。'],
  [5.8,10.6,'C 是一个簇，p 是簇里的一个点。μ 是质心，题目自己解释了：坐标均值，也就是簇里所有点的坐标平均值。'],
  [10.8,18.6,'两条竖线加平方，表示点 p 到质心的距离的平方。前面的求和号，表示把簇里每个点的这个值加起来。这就是 SSE，误差平方和。'],
  [18.8,22.6,'它衡量的是一个簇有多分散：点离质心越远，SSE 越大。'],
  [22.8,31.6,'第二个量是 SSE 下降量。parent 是拆之前的簇，两个 child 是拆出来的两个簇。下降量就是拆之前的 SSE，减去拆之后两个簇的 SSE 之和。']]});

r1Scene({title:'提示 2：挑哪个簇',dur:30,part:[5],
  src:`${r1Sub('提示')}2. Bi-Kmeans算法的分裂选择策略（平局判断）：<br>· <span data-k="a">优先选择 <b>SSE 下降量（SSE_Gradient）最大</b> 的簇进行划分。</span><br>· 平局处理规则：<span data-k="b">如果多个簇的 SSE 下降量相同，则优先选择 <b>路由器设备总数量较多</b> 的簇进行划分；</span><span data-k="c">如果元素数量也相同，则选择<b>时间上最早生成</b>的一个簇进行划分。</span>`,
  marks:[['a',5.8,16.6],['b',16.8,21.6],['c',21.8,29.6]],
  notes:[[1.4,'这一条回答：每次挑哪个簇来拆','b'],[6.2,'第一级：拆了以后 SSE 下降量最大的簇。'],[11.2,'要比下降量，就得把每个簇都先“试着拆一次”','h'],[17.2,'第二级：下降量相同 → 选点数多的簇。'],[22.2,'第三级：点数也相同 → 选最早生成的簇。'],[25.6,'“生成”：这个簇是哪一次分裂时被拆出来的。越早拆出来的越优先。','g']],caps:[
  [.4,5.6,'提示 2 回答了前面留下的第一个问题：每次挑哪个簇来拆。'],
  [5.8,10.6,'首先，选 SSE 下降量最大的簇。也就是拆了它，整体变集中得最多。'],
  [10.8,16.6,'这句话还藏着一层意思：要比下降量，就得先知道每个簇拆开后是什么样。所以每一轮，要把每个簇都试着拆一次。'],
  [16.8,21.6,'下降量相同怎么办？选路由器数量多的，也就是点数多的簇。'],
  [21.8,29.6,'点数也相同，就选最早生成的簇。“生成”指的是这个簇是什么时候被拆出来的，越早拆出来的越优先。']]});

r1Scene({title:'提示 3、4：怎么分裂',dur:34,part:[5],fs:27,
  src:`${r1Sub('提示')}3. K-means初始质心设置约束：<span data-k="a">在执行每一次 <b>K-means（K = 2）</b>分裂操作时，</span><span data-k="b">必须选取当前待分裂簇内 <b>x 坐标最小</b> 和 <b>x 坐标最大</b> 的两个设备点作为初始质心。</span><span data-k="c">严禁随机初始化，以确保结果的可复现性。</span><div style="height:24px"></div>4. K-means收敛条件：<span data-k="d">当满足以下任一条件时，停止 K-means 迭代：</span><br>· <span data-k="e">两个新质心的最大偏移量小于 1e-6。</span><br>· <span data-k="f">所有路由器设备的簇归属不再发生变化。</span>`,
  marks:[['a',5,9.8],['b',10,16],['c',16.2,19.8],['d',20,23.4],['e',23.6,26.6],['f',26.8,29.8]],
  notes:[[1.4,'这两条回答：一个簇怎么分成两个','b'],[5.4,'用 K-means 来分。K = 2 表示分成 2 个簇。'],[10.4,'K-means 需要两个起点，叫“初始质心”。规定：用簇里 x 最小的点和 x 最大的点。'],[16.6,'不许随机 → 每次运行结果相同，才能和标准答案对上。','g'],[20.4,'K-means 要反复做很多遍（“迭代”）。什么时候停：'],[24,'· 两个质心几乎不动了（移动不到 0.000001）<br>· 或者每个点属于哪个簇不再变'],[30.2,'K-means 具体怎么做 → 第 3 集','h']],caps:[
  [.4,4.8,'提示 3 和提示 4 回答第二个问题：一个簇具体怎么分成两个。'],
  [5,9.8,'方法是 K-means，K 等于 2 表示分成 2 个簇。现在不用知道它的细节，只要知道它需要两个起点，叫“初始质心”。'],
  [10,19.8,'题目规定：起点必须是这个簇里 x 坐标最小的点，和 x 坐标最大的点，不许随机选。前面输入里说 x 互不相同，就是为了让这两个点唯一。'],
  [20,29.8,'K-means 是一个反复做的过程，题目叫“迭代”。提示 4 规定了什么时候停：两个质心几乎不再移动，或者每个点属于哪个簇不再变化，满足一条就停。'],
  [30,33.6,'K-means 具体怎么一步一步做，放在第 3 集讲。']]});

/* 10 用自己的话说一遍 */
SC.push({title:'用自己的话说一遍',dur:28,caps:[
  [.4,7.6,'题目读完了，用自己的话说一遍。给我的是：N，和 L 个点的整数坐标。要我交的是：每拆一次一行，写各个簇的点数，从大到小。'],
  [7.8,17.6,'做法是：一开始所有点一个簇。每一轮，把每个簇都用 K-means 试着拆成两半，选 SSE 下降量最大的那个真的拆开，然后输出一行。簇数到 N 就停。'],
  [17.8,27.6,'现在还有几个词没真正弄懂：质心、SSE、下降量怎么算，K-means 怎么做。下一集先用样例 1，把质心、SSE 和下降量亲手算一遍。']],
build(r){
  const c={};hwTxt(r,110,124,'读完题：用自己的话说一遍',52,{fontFamily:'var(--display)',fontWeight:900});
  const card=(x,w,head,col,lines)=>{const g=H('div','card',{left:x,top:216,width:w,height:470,opacity:0},r);
    H('div','a',{left:28,top:20,fontSize:34,fontWeight:900,fontFamily:'var(--display)',color:col},g,head);
    H('div','a',{left:28,top:84,width:w-56,whiteSpace:'normal',fontSize:27,lineHeight:1.62},g,lines.map(s=>`<div style="padding-left:46px;text-indent:-46px">${s}</div>`).join(''));return g;};
  c.a=card(110,400,'给我什么','var(--blue)',['·　<b>N</b>：最后要几个簇','·　<b>L</b> 个点的坐标','·　坐标是整数','·　各点的 x 互不相同']);
  c.b=card(540,440,'要我交什么','#1E8E5A',['·　还没拆时：输出一行（总点数）','·　之后每拆一次：输出一行','·　一行的内容：每个簇的点数，从大到小']);
  c.c=card(1010,800,'怎么做','var(--red)',['1　一开始，所有点是一个簇','2　每一轮：把每个簇都用 K-means（K = 2）试拆一次','3　选 SSE 下降量最大的簇；相同选点数多的；再相同选最早生成的','4　把它真的拆成两个，输出一行','5　簇数到 N 就停']);
  hwTxt(r,110,716,'还没真正弄懂的词',24,{color:'var(--graphite)'});
  c.w=[['质心、SSE、下降量','第 2 集'],['K-means 怎么做','第 3 集'],['整个流程、平局','第 4 集'],['代码','第 5 集']].map(([a,b],k)=>{
    const g=H('div','a',{left:110+430*k,top:756,width:410,height:92,border:'2px solid rgba(27,38,49,.2)',borderRadius:'10px',background:'rgba(255,255,255,.7)'},r);
    H('div','a',{left:20,top:10,fontSize:28,fontWeight:700},g,a);H('div','a',{left:20,top:50,fontSize:24,color:'var(--blue)'},g,'→ '+b);return g;});
  return c;
},
update(c,t){vis(c.a,ep(t,.8,1.5),10);vis(c.b,ep(t,4,4.7),10);vis(c.c,ep(t,8,8.7),10);c.w.forEach((g,k)=>vis(g,ep(t,18+.8*k,18.6+.8*k),8));}});
