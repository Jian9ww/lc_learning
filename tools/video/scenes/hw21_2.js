/* ===== 第 2 集：质心、SSE 和下降量 ===== */
const E1S=hwRunOf('s1'),E1K=hwRunOf('k6');
const E1PL={x:190,y:210,u:76,xmax:7,ymax:7};           // 样例 1 的坐标平面（左侧）
const E1LAB={0:{dx:18,dy:8},1:{dx:18,dy:8},2:{dx:-18,dy:-18,anchor:'end'}};
// 样例 1 的三个点 + 一个可移动的质心
function e1Plane(r,o){
  const pl=hwPlane(r,o||E1PL);
  const P=E1S.pts.map((p,i)=>hwPt(pl,p,HWN[i],Object.assign({coord:true},E1LAB[i])));
  return {pl,P};
}

/* 1 这一集做什么 */
SC.push({title:'这一集做什么',dur:17,caps:[
  [.4,7.4,'上一集读完了题目，知道了要做什么。但题目里有几个词还没弄懂：质心、SSE、SSE 下降量。'],
  [7.6,16.6,'这一集就用样例 1 的三个点，把这三样东西亲手算一遍，然后把整个流程串起来。']],
build(r){
  const c=e1Plane(r);
  c.h=hwTxt(r,860,190,'上一集留下的三个词',46,{fontFamily:'var(--display)',fontWeight:900});
  const w=[['质心','一个簇的“中心位置”'],['SSE','一个簇有多分散'],['SSE 下降量','拆开以后，SSE 少了多少']];
  c.w=w.map(([a,b],k)=>{const g=H('div','a',{left:860,top:300+108*k,width:900,height:108,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:8,top:30,fontSize:38,fontWeight:700,color:'var(--blue)'},g,a);H('div','a',{left:330,top:36,fontSize:32},g,b);return g;});
  c.n=hwHand(r,860,660,'用样例 1 的三个点 A、B、C 来算',40);
  c.n2=hwTxt(r,860,730,'样例 1：N = 2，三个点 (1, 1)、(2, 2)、(6, 6)，输出 3 和 2 1',26,{color:'var(--graphite)'});
  return c;
},
update(c,t){vis(c.h,ep(t,.5,1.2),12);c.w.forEach((g,k)=>vis(g,ep(t,2+1.5*k,2.6+1.5*k),8));vis(c.n,ep(t,8,8.6),8);vis(c.n2,ep(t,10,10.6),8);
  c.P.forEach((e,i)=>e.set(HWINK,ep(t,.4+.3*i,1+.3*i)));}});

/* 4 质心 */
SC.push({title:'质心',dur:20,caps:[
  [.4,6.4,'第一个概念：质心。把一个簇里所有点的 x 坐标求平均，y 坐标也求平均，得到的位置就是质心。'],
  [6.6,13,'三个点的 x 是 1、2、6，平均是 3；y 也是 1、2、6，平均也是 3。所以质心在 (3, 3)。'],
  [13.2,19.6,'质心是这组点的中心位置。它一般不是其中某一个点，坐标也常常是小数。']],
build(r){
  const c=e1Plane(r);
  c.cen=hwCen(c.pl,HWC[3],'质心 (3, 3)');
  c.h=hwTxt(r,860,200,'质心 = 簇里所有点的<b style="color:#1E8E5A">坐标平均值</b>',46,{fontFamily:'var(--display)',fontWeight:900});
  c.f=[hwMono(r,870,330,'μx = (1 + 2 + 6) / 3 = <b>3</b>',40),hwMono(r,870,400,'μy = (1 + 2 + 6) / 3 = <b>3</b>',40),
       hwTxt(r,870,500,'质心 μ = (3, 3)',44,{color:'#1E8E5A',fontWeight:700})];
  c.n=hwHand(r,870,620,'质心是“中心位置”，不一定是某一个点',38);
  c.n2=hwTxt(r,870,690,'代码里：质心用 <span style="font-family:var(--mono)">Center</span>（浮点数），点用 <span style="font-family:var(--mono)">Point</span>（整数）',26,{color:'var(--graphite)'});
  return c;
},
update(c,t){
  vis(c.h,ep(t,.5,1.2),12);
  const at=[6.8,8.6,10.6];c.f.forEach((e,k)=>vis(e,ep(t,at[k],at[k]+.6),8));
  c.cen.set(3,3,ep(t,10.8,11.5));
  vis(c.n,ep(t,13.4,14),8);vis(c.n2,ep(t,15.6,16.2),8);
}});

/* 5 SSE */
SC.push({title:'SSE：误差平方和',dur:30,caps:[
  [.4,5.6,'第二个概念：SSE，误差平方和。它衡量一个簇“散不散”。'],
  [5.8,15,'算法是：每个点到质心，横向差的平方加纵向差的平方，就是距离的平方。A 是 8，B 是 2，C 是 18。'],
  [15.2,22,'全部加起来，这个簇的 SSE 是 28。点离质心越远，SSE 越大；点越集中，SSE 越小。'],
  [22.2,29.6,'注意用的是距离的平方，不开根号。只有一个点的簇，质心就是它自己，SSE 是 0。']],
build(r){
  const c=e1Plane(r);
  c.cen=hwCen(c.pl,HWC[3],'质心 (3, 3)');c.cen.set(3,3,1);
  c.ln=E1S.pts.map(()=>hwLine(c.pl.gLink,4));
  c.h=hwTxt(r,860,170,'SSE = 每个点到质心的<b style="color:var(--red)">距离平方</b>，全部加起来',40,{fontFamily:'var(--display)',fontWeight:900});
  c.fm=hwMono(r,870,244,'SSE(C) = Σ ‖p − μ‖²',30,{color:'var(--graphite)'});
  const d=[['A','(1−3)² + (1−3)² = 4 + 4','8'],['B','(2−3)² + (2−3)² = 1 + 1','2'],['C','(6−3)² + (6−3)² = 9 + 9','18']];
  c.rows=d.map(([n,f,v],k)=>{const g=H('div','a',{left:860,top:320+84*k,width:900,height:84},r);
    H('div','a',{left:10,top:14,fontSize:38,fontWeight:700},g,n);H('div','a',{left:80,top:18,fontSize:32,fontFamily:'var(--mono)'},g,f);
    H('div','a',{left:720,top:6,fontSize:52,fontFamily:'var(--num)',color:'var(--red)'},g,'= '+v);return g;});
  H('div','a',{left:860,top:580,width:900,height:2,background:'rgba(27,38,49,.3)'},r);
  c.sum=hwMono(r,870,600,'SSE = 8 + 2 + 18 = <b style="color:var(--red)">28</b>',46,{fontWeight:700});
  c.n=hwHand(r,870,700,'SSE 越小，点越集中',40);
  c.n2=hwTxt(r,870,770,'一个点的簇：质心就是它自己，SSE = 0',28,{color:'var(--graphite)'});
  return c;
},
update(c,t){
  vis(c.h,ep(t,.5,1.2),12);vis(c.fm,ep(t,2.4,3),8);
  const at=[6.4,9.2,12];
  c.rows.forEach((g,k)=>vis(g,ep(t,at[k],at[k]+.6),8));
  c.ln.forEach((l,k)=>{const f=ep(t,at[k]-.2,at[k]+.7),P=c.P[k];l.set(P.cx,P.cy,lerp(P.cx,c.pl.X(3),f),lerp(P.cy,c.pl.Y(3),f),HWC[3],f>0?.9:0);});
  vis(c.sum,ep(t,15.4,16),8);vis(c.n,ep(t,18.4,19),8);vis(c.n2,ep(t,25.4,26),8);
}});

/* 6 拆开以后 SSE 变小 */
SC.push({title:'SSE 下降量',dur:30,caps:[
  [.4,6,'现在把这个簇拆成两个：A、B 一组，C 自己一组。每个子簇有自己的质心。'],
  [6.2,14,'A、B 的质心在 (1.5, 1.5)，两个点到它的距离平方都是 0.5，SSE 是 1。C 自己一组，SSE 是 0。'],
  [14.2,22,'拆之前是 28，拆之后两个子簇加起来是 1，降了 27。这个差就是 SSE 下降量，题目里写作 SSE_Grad。'],
  [22.2,29.6,'下降量越大，说明拆这个簇越“值”。后面选哪个簇来拆，比的就是它。']],
build(r){
  const c=e1Plane(r);
  c.c3=hwCen(c.pl,HWC[3],'');c.c0=hwCen(c.pl,HWC[1],'');c.c0.label('质心 (1.5, 1.5)',34,74,'start');c.c1=hwCen(c.pl,HWC[2],'质心 (6, 6)');c.c1.label('质心 (6, 6)',-150,48);
  c.ln=E1S.pts.map(()=>hwLine(c.pl.gLink,4));
  c.a=hwTxt(r,860,180,'拆之前',26,{color:'var(--graphite)'});
  c.a1=hwTxt(r,860,220,'{A, B, C}　　SSE = <b>28</b>',40);
  c.b=hwTxt(r,860,320,'拆之后',26,{color:'var(--graphite)'});
  c.b1=hwTxt(r,860,360,'<b style="color:var(--blue)">{A, B}</b>　SSE = 0.5 + 0.5 = <b>1</b>',40);
  c.b2=hwTxt(r,860,430,'<b style="color:var(--red)">{C}</b>　　　SSE = <b>0</b>',40);
  H('div','a',{left:860,top:516,width:900,height:2,background:'rgba(27,38,49,.3)'},r);
  c.g=hwTxt(r,860,536,'下降量 = 28 − (1 + 0) = <b style="color:var(--red)">27</b>',52,{fontWeight:700});
  c.f=H('div','card',{left:850,top:640,width:930,height:92},r);
  c.f1=hwTxt(r,880,660,'SSE_Grad = SSE(父簇) − ( SSE(子簇 1) + SSE(子簇 2) )',32);
  c.n=hwHand(r,860,770,'选哪个簇来拆：比的就是这个下降量',40);
  return c;
},
update(c,t){
  const sp2=ep(t,1.6,2.6);
  c.c3.set(3,3,1-sp2);c.c0.set(1.5,1.5,sp2);c.c1.set(6,6,sp2);
  c.P.forEach((e,i)=>e.set(sp2>.5?HWC[i<2?1:2]:HWINK));
  c.ln.forEach((l,k)=>{const P=c.P[k],tx=k<2?1.5:6,f=k<2?ep(t,6.6,7.6):0;l.set(P.cx,P.cy,lerp(P.cx,c.pl.X(tx),f),lerp(P.cy,c.pl.Y(tx),f),HWC[k<2?1:2],f>0?.9:0);});
  vis(c.a,ep(t,.4,1),6);vis(c.a1,ep(t,.6,1.2),6);vis(c.b,ep(t,2.4,3),6);
  vis(c.b1,ep(t,7.6,8.2),8);vis(c.b2,ep(t,11,11.6),8);vis(c.g,ep(t,15,15.6),8);
  const a=ep(t,18.6,19.2);c.f.style.opacity=a;c.f1.style.opacity=a;vis(c.n,ep(t,22.6,23.2),8);
}});

/* 7 Bi-K-means 的流程 */
SC.push({title:'Bi-K-means 的流程',dur:30,caps:[
  [.4,5.6,'整个算法是一个循环。开始时所有点是一个簇，先输出它的点数。'],
  [5.8,15.4,'只要簇数还不到 N，就做三件事。第一，试拆：把现在的每一个簇都拿去分成两半，算出各自的 SSE 下降量。试拆只是算一算，不改动现在的簇。'],
  [15.6,23.4,'第二，选簇：挑下降量最大的那一个。第三，真拆：把它换成它的两个子簇，然后输出一行。'],
  [23.6,29.6,'每做一轮，簇的个数加 1，到了 N 个就结束。“二分”说的就是每次把一个簇分成两个。']],
build(r){
  const c={};c.svg=S('svg',{class:'ov'},r);
  const box=(x,y,w,h,html,col)=>H('div','a',{left:x,top:y,width:w,height:h,border:'3px solid '+(col||'var(--ink)'),borderRadius:'12px',background:'rgba(255,255,255,.82)',fontSize:30,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',whiteSpace:'normal',lineHeight:1.35,opacity:0},r,'<div>'+html+'</div>');
  const X=200,W=800;
  c.b0=box(X,140,W,84,'开始：所有点是一个簇，输出它的点数（第 0 轮）');
  c.b1=box(X+200,274,W-400,84,'簇数 &lt; N ？','var(--red)');
  c.b2=box(X,424,W,96,'<b style="color:var(--blue)">① 试拆</b>：每个簇都用 K-means 分成两半，<br>算出各自的 SSE 下降量','var(--blue)');
  c.b3=box(X,570,W,84,'<b style="color:var(--blue)">② 选簇</b>：挑下降量最大的那一个','var(--blue)');
  c.b4=box(X,704,W,96,'<b style="color:var(--blue)">③ 真拆</b>：把它换成两个子簇，输出一行<br>（每个簇的点数，从大到小）','var(--blue)');
  c.be=box(X+W+150,274,220,84,'结束');
  const mx=X+W/2;
  c.ar=[hwArrow(c.svg,mx,228,mx,266,HWINK),hwArrow(c.svg,mx,362,mx,416,HWINK),hwArrow(c.svg,mx,524,mx,562,HWINK),hwArrow(c.svg,mx,658,mx,696,HWINK),
        hwArrow(c.svg,X+W-196,316,X+W+142,316,HWINK)];
  // ③ 回到判断的折线
  c.lp=S('path',{d:`M${X-4} 752 H${X-70} V316 H${X+186}`,fill:'none'},c.svg);Object.assign(c.lp.style,{stroke:HWINK,strokeWidth:5,strokeLinecap:'round',strokeLinejoin:'round',opacity:0});
  c.lph=hwArrow(c.svg,X+170,316,X+192,316,HWINK);
  c.yes=hwTxt(r,mx+16,372,'是',26,{color:'var(--red)',fontWeight:700});c.no=hwTxt(r,X+W-110,272,'否',26,{color:'var(--red)',fontWeight:700});
  c.nt=[hwHand(r,1190,440,'“试拆”只是算一算，<br>不改动现在的簇',34,{whiteSpace:'normal',width:600,lineHeight:1.35}),
        hwTxt(r,1190,580,'怎么分成两半 → 第 3 集',28,{color:'var(--graphite)'}),
        hwTxt(r,1190,628,'平局时选哪个 → 第 4 集',28,{color:'var(--graphite)'}),
        hwHand(r,1190,720,'每一轮：簇数 + 1',38)];
  return c;
},
update(c,t){
  const a=[.6,4,6.2,15.8,18.8];[c.b0,c.b1,c.b2,c.b3,c.b4].forEach((e,k)=>pop(e,ep(t,a[k],a[k]+.6)));
  c.ar[0].style.opacity=ep(t,3.6,4.2);c.ar[1].style.opacity=ep(t,5.8,6.4);c.yes.style.opacity=ep(t,5.8,6.4);
  c.ar[2].style.opacity=ep(t,15.4,16);c.ar[3].style.opacity=ep(t,18.4,19);
  const lp=ep(t,21.6,22.4);c.lp.style.opacity=lp;c.lph.style.opacity=lp;
  const en=ep(t,24.4,25);pop(c.be,en);c.ar[4].style.opacity=en;c.no.style.opacity=en;
  vis(c.nt[0],ep(t,11,11.6),8);vis(c.nt[1],ep(t,13,13.6),8);vis(c.nt[2],ep(t,17,17.6),8);vis(c.nt[3],ep(t,23.8,24.4),8);
}});

/* 8 题目的四条规定 */
SC.push({title:'四条规定',dur:32,caps:[
  [.4,5,'把上一集读过的四条提示再放在一起看一眼。结果要和判题机一致，就必须照着做。'],
  [5.2,15,'提示 1：簇数到 N 就停。提示 2：选 SSE 下降量最大的簇；下降量相同，选点数多的；点数也相同，选最早生成的。'],
  [15.2,23.4,'提示 3：K-means 的两个初始质心，必须是簇里 x 最小和 x 最大的两个点，不许随机。这样每次算出来的结果才一样。'],
  [23.6,31.6,'提示 4：两个质心几乎不动了，或者所有点的归属不再变化，K-means 就停。这四条在后面三集里都会一条一条对上。']],
build(r){
  const c={};
  const card=(x,y,tag,head,body,where)=>{const g=H('div','card',{left:x,top:y,width:800,height:330,opacity:0},r);
    H('div','a',{left:32,top:22,fontSize:24,color:'var(--graphite)',fontFamily:'var(--mono)'},g,tag);
    H('div','a',{left:590,top:22,fontSize:22,color:'var(--blue)',width:180,textAlign:'right'},g,where);
    H('div','a',{left:32,top:62,fontSize:40,fontWeight:900,fontFamily:'var(--display)'},g,head);
    H('div','a',{left:32,top:138,width:736,whiteSpace:'normal',fontSize:28,lineHeight:1.6},g,body);return g;};
  c.cs=[card(130,140,'提示 1','什么时候结束','簇的总数达到 <b>N</b> 就停。','第 4 集'),
        card(990,140,'提示 2','选哪个簇来拆','① SSE 下降量<b style="color:var(--red)">最大</b>的<br>② 下降量相同：选<b style="color:var(--red)">点数多</b>的<br>③ 点数也相同：选<b style="color:var(--red)">最早生成</b>的','第 4 集'),
        card(130,500,'提示 3','K-means 的初始质心','必须是簇里 <b style="color:var(--red)">x 最小</b> 和 <b style="color:var(--red)">x 最大</b> 的两个点。<br>不许随机，保证结果可以复现。','第 3 集'),
        card(990,500,'提示 4','K-means 什么时候停','满足任意一条就停：<br>· 两个新质心的最大移动量 &lt; <span style="font-family:var(--mono)">1e-6</span><br>· 所有点的归属不再变化','第 3 集')];
  return c;
},
update(c,t){const a=[5.4,8,15.4,23.8];c.cs.forEach((e,k)=>vis(e,ep(t,a[k],a[k]+.7),12));}});

/* 9 两个样例 */
SC.push({title:'两个样例',dur:28,caps:[
  [.4,10.4,'用样例 1 走一遍。第 0 轮输出 3。然后试拆唯一的簇，分成 A、B 和 C，下降量 27。只有这一个候选，就拆它，输出 2 1。簇数到了 2，结束。'],
  [10.6,18.4,'样例 2 的 N 是 1：一开始就已经是 1 个簇，一次也不用拆，只输出第 0 轮的 2。'],
  [18.6,27.6,'样例 1 里“分成 A、B 和 C”这一步，是 K-means 算出来的。下一集就讲它是怎么分的。']],
build(r){
  const c={};
  H('div','card',{left:110,top:136,width:1000,height:700},r);
  hwTxt(r,146,156,'样例 1　N = 2，3 个点',30,{fontWeight:700});
  c.pp=e1Plane(r,{x:190,y:250,u:50,xmax:7,ymax:7});
  const st=['第 0 轮：一个簇 {A, B, C}','试拆 → {A, B} 和 {C}','下降量 28 − 1 = 27','只有一个候选，拆它','簇数 2 = N，结束'];
  c.st=st.map((s,k)=>hwTxt(r,640,256+62*k,s,28));
  hwTxt(r,640,600,'输出',22,{color:'var(--graphite)'});
  c.o1=[hwMono(r,640,636,'3',44,{fontWeight:700}),hwMono(r,640,696,'2 1',44,{fontWeight:700})];
  c.R=H('div','card',{left:1150,top:136,width:660,height:700,opacity:0},r);
  hwTxt(c.R,36,20,'样例 2　N = 1，2 个点',30,{fontWeight:700});
  hwTxt(c.R,36,96,'输入：1 / 2 / 2 3 / 5 5',28,{color:'var(--graphite)'});
  c.r2=[hwTxt(c.R,36,180,'第 0 轮：一个簇，2 个点',28),hwTxt(c.R,36,242,'簇数 1 已经等于 N',28),hwHand(c.R,36,310,'一次也不拆',40)];
  hwTxt(c.R,36,464,'输出',22,{color:'var(--graphite)'});c.o2=hwMono(c.R,36,500,'2',44,{fontWeight:700});
  c.nx=hwHand(r,130,846,'下一集：K-means 怎么把一个簇分成两半',38);
  return c;
},
update(c,t){
  const a=[.8,3,5,6.8,8.6];c.st.forEach((e,k)=>vis(e,ep(t,a[k],a[k]+.6),8));
  c.pp.P.forEach((e,i)=>e.set(t>=3.4?HWC[i<2?1:2]:HWINK));
  vis(c.o1[0],ep(t,1.2,1.8),6);vis(c.o1[1],ep(t,7.2,7.8),6);
  c.R.style.opacity=ep(t,10.6,11.3);c.r2.forEach((e,k)=>vis(e,ep(t,11.4+1.6*k,12+1.6*k),8));vis(c.o2,ep(t,12,12.6),6);
  vis(c.nx,ep(t,19,19.6),8);
}});
