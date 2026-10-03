/* ===== 第 3 集：K-means 把一个簇拆成两个 ===== */
const E2R=hwRunOf('k6'),E2P=E2R.pts,E2SP=E2R.rounds[0].split;      // 6 个点第一次拆分的全过程（3 轮）
const E2PL={x:150,y:214,u:66,xmax:12,ymax:7,lab:{3:{dx:20,dy:30}}};
const e2Km=(r,pts,sp,pl)=>{const km=hwKm(r,pts||E2P,sp||E2SP,pl||E2PL);km.C[1].label('c1',-28,-22,'end');return km;};
const e2Head=(r,s)=>hwTxt(r,1020,132,s,40,{fontFamily:'var(--display)',fontWeight:900});
// 一个点到两个质心的距离平方算式（两行）
function e2Formula(r,x,y,p,it){
  const g=H('div','a',{left:x,top:y,opacity:0},r);
  const one=(k,c,d,yy)=>H('div','a',{left:0,top:yy,fontSize:27},g,
    `<b>${HWN[p.id]}</b> 到 <b style="color:${HWC[k+1]}">c${k} ${hwP(c)}</b>：(${p.x} − ${hwF(c.x)})² + (${p.y} − ${hwF(c.y)})² = <b style="color:${HWC[k+1]}">${hwF(d)}</b>`);
  one(0,it.c0,it.d0s[p.id],0);one(1,it.c1,it.d1s[p.id],44);
  return g;
}

/* 1 这一集做什么 */
SC.push({title:'这一集做什么',dur:17,caps:[
  [.4,6.4,'上一集说到“试拆”：把一个簇分成两半。这件事由 K-means 来做。这里 K 等于 2，意思是分成 2 个簇。'],
  [6.6,16.6,'做法是：先选两个质心，然后两步轮流做。第一步，每个点归到离它更近的质心；第二步，每个质心移到自己那一组点的平均位置。一直做到不再变化。']],
build(r){
  const c={};c.pl=hwPlane(r,E2PL);c.P=E2P.map((p,i)=>hwPt(c.pl,p,HWN[i],{coord:true,fs:19,dy:-17,dx:i===5?-14:i===4?-14:14,anchor:i>=4?'end':null}));
  hwTxt(r,150,730,'这一集的例子：6 个点 A – F（用例 05）',26,{color:'var(--graphite)'});
  c.h=e2Head(r,'K-means（K = 2）');
  c.h2=hwTxt(r,1020,196,'把一个簇分成 <b style="color:var(--blue)">0 号</b>、<b style="color:var(--red)">1 号</b> 两个子簇',32);
  const st=[['准备','选两个初始质心 c0、c1'],['① 分配','每个点归到离它更近的质心'],['② 更新','每个质心移到自己那组点的平均位置'],['重复','①② 轮流做，直到不再变化']];
  c.st=st.map(([a,b],k)=>{const g=H('div','a',{left:1020,top:290+92*k,width:800,height:92,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:8,top:26,fontSize:32,fontWeight:700,color:'var(--blue)'},g,a);H('div','a',{left:170,top:28,fontSize:30},g,b);return g;});
  c.n=hwHand(r,1020,690,'对应代码里的函数 splitCluster',36);
  return c;
},
update(c,t){
  c.P.forEach((e,i)=>e.set(HWINK,ep(t,.4+.12*i,1+.12*i)));
  vis(c.h,ep(t,.6,1.2),10);vis(c.h2,ep(t,2.6,3.2),8);
  const a=[6.8,8.6,11.4,14];c.st.forEach((g,k)=>vis(g,ep(t,a[k],a[k]+.6),8));vis(c.n,ep(t,15,15.6),8);
}});

/* 2 初始质心 */
SC.push({title:'初始质心',dur:21,caps:[
  [.4,7,'初始质心怎么选，题目有规定：必须是这个簇里 x 坐标最小的点，和 x 坐标最大的点。只看 x，不看 y。'],
  [7.2,13.6,'这 6 个点里，x 最小的是 A，x 最大的是 F。所以 0 号质心 c0 放在 A 上，1 号质心 c1 放在 F 上。'],
  [13.8,20.6,'题目保证各点的 x 互不相同，所以这两个点是唯一的。不许随机选，这样每次运行的结果都一样。']],
build(r){
  const c={};c.km=e2Km(r);
  e2Head(r,'初始质心（提示 3）');
  c.a=hwTxt(r,1020,204,'必须是簇里 <b style="color:var(--red)">x 最小</b> 和 <b style="color:var(--red)">x 最大</b> 的两个点',32);
  hwTxt(r,1020,290,'各点的 x 坐标',24,{color:'var(--graphite)'});
  c.xs=E2P.map((p,i)=>{const g=H('div','a',{left:1020+124*i,top:330,width:108,height:104,border:'2.5px solid var(--ink)',borderRadius:'8px',background:'rgba(255,255,255,.8)',textAlign:'center'},r);
    H('div','',{fontSize:24,fontWeight:700,marginTop:8},g,HWN[i]);H('div','',{fontSize:44,fontFamily:'var(--num)',lineHeight:1.15},g,String(p.x));return g;});
  c.t0=hwTxt(r,1020,446,'最小',26,{color:HWC[1],fontWeight:700,width:108,textAlign:'center'});
  c.t1=hwTxt(r,1020+124*5,446,'最大',26,{color:HWC[2],fontWeight:700,width:108,textAlign:'center'});
  c.l0=hwTxt(r,1020,520,`<b style="color:${HWC[1]}">c0</b> = A 的位置 (0, 6)　　0 号质心`,34);
  c.l1=hwTxt(r,1020,584,`<b style="color:${HWC[2]}">c1</b> = F 的位置 (11, 0)　　1 号质心`,34);
  c.n=hwHand(r,1020,680,'x 互不相同 → 这两个点唯一',38);
  c.n2=hwTxt(r,1020,750,'代码里：<span style="font-family:var(--mono)">minIndex</span>、<span style="font-family:var(--mono)">maxIndex</span> 记这两个点的下标',26,{color:'var(--graphite)'});
  return c;
},
update(c,t){
  const on=ep(t,7.4,8.2);
  c.km.view(0,0,0,{cen:on});
  vis(c.a,ep(t,.8,1.4),8);
  c.xs.forEach((g,i)=>{vis(g,ep(t,2.4+.2*i,3+.2*i),8);const hot=(i===0||i===5)&&t>=7.4;g.style.borderColor=hot?HWC[i?2:1]:'var(--ink)';g.style.background=hot?(i?'rgba(250,225,222,.95)':'rgba(221,227,243,.95)'):'rgba(255,255,255,.8)';});
  c.t0.style.opacity=on;c.t1.style.opacity=on;vis(c.l0,ep(t,8.6,9.2),8);vis(c.l1,ep(t,10.4,11),8);
  vis(c.n,ep(t,14,14.6),8);vis(c.n2,ep(t,17,17.6),8);
}});

/* 3、5、6：一轮分配（共用版面）。o：{title, head, k 第几轮（从 0 数）, dur, caps, T0 开始时间, per 每个点几秒, upd:[开始, 结束] 更新质心的时间, bis 中垂线出现时间, notes:[[时间, 文字, 是否手写]]} */
function e2Round(o){
  const it=E2SP.iters[o.k],n=E2P.length;
  SC.push({title:o.title,dur:o.dur,caps:o.caps,
  build(r){
    const c={};c.km=e2Km(r);e2Head(r,o.head);
    c.cl=hwTxt(r,150,730,`这一轮分配用的质心：<b style="color:${HWC[1]}">c0 ${hwP(it.c0)}</b>　<b style="color:${HWC[2]}">c1 ${hwP(it.c1)}</b>`,26);
    c.f=E2P.map(p=>e2Formula(r,1020,200,p,it));
    c.tab=hwKmTab(r,1020,306,E2P,it);
    c.nt=o.notes.map(([tt,s,hand],q)=>(hand?hwHand:hwTxt)(r,1020,668+56*q,s,hand?34:27,hand?null:{color:'var(--ink)'}));
    return c;
  },
  update(c,t){
    const q=clamp(Math.floor((t-o.T0)/o.per),-1,n),u=(t-o.T0-o.per*q)/o.per;          // q：正在处理第几个点；u：它的进度 0~1
    const a=q<0?0:q>=n?n:q+ep(u,.42,.82),up=o.upd?ep(t,o.upd[0],o.upd[1]):0;
    c.km.view(o.k,a,up,{bis:o.bis==null?0:ep(t,o.bis,o.bis+.8)*.85});
    c.km.focus(q>=0&&q<n?q:null,q>=0&&q<n?Math.min(ep(u,0,.12),1-ep(u,.86,1)):0);
    c.f.forEach((g,i)=>vis(g,i===q?Math.min(ep(u,.04,.18),1-ep(u,.9,1)):0,0));
    c.tab.show(q<0?0:q>=n?n:q+ep(u,.5,.7));
    c.nt.forEach((e,k)=>vis(e,ep(t,o.notes[k][0],o.notes[k][0]+.6),8));
  }});
}
e2Round({title:'第 1 轮：分配',head:'第 1 轮 · ① 分配',k:0,dur:41,T0:3,per:4.2,bis:28.6,caps:[
  [.4,6.9,'第 1 轮，先做分配。对每个点，算它到 c0 和 c1 的距离平方，哪个小就归哪个。A 就是 c0 自己，距离是 0，归 0 号。'],
  [7.1,11.2,'B 到 c0 是 40，到 c1 是 81，离 c0 近，也归 0 号。'],
  [11.4,19.6,'C 要注意：到 c0 是 52，到 c1 是 49。c1 稍微近一点，所以这一轮 C 归 1 号。'],
  [19.8,28.2,'D、E、F 都离 c1 更近，归 1 号。这一轮分完：0 号簇是 A、B，1 号簇是 C、D、E、F。'],
  [28.4,40.6,'画出两个质心连线的中垂线：线的左边离 c0 近，右边离 c1 近。C 在线的右边一点点，所以被分到了 1 号。']],
  notes:[[28.2,'0 号簇：A B　　　1 号簇：C D E F',false],[30,'虚线是 c0、c1 连线的中垂线：在哪一边，就归哪个质心',false],[33,'C 离这条线很近，下一轮它会换边',true]]});

/* 4 第 1 轮：更新质心 */
SC.push({title:'第 1 轮：更新质心',dur:27,caps:[
  [.4,8.6,'分完之后做第二步：更新质心。每个质心移到自己那一组点的平均位置。0 号簇是 A、B，平均位置是 (1, 3)。'],
  [8.8,16,'1 号簇是 C、D、E、F，四个点的 x 平均是 8.5，y 平均是 1.5。两个质心都移动了。'],
  [16.2,26.6,'要不要停？看两个条件。质心移动了 3 左右，远远大于 1e-6；归属和上一轮也不一样，因为这是第一次分。两个条件都不满足，再来一轮。']],
build(r){
  const c={};c.km=e2Km(r);e2Head(r,'第 1 轮 · ② 更新质心');const it=E2SP.iters[0];
  c.a=[hwTxt(r,1020,206,`<b style="color:${HWC[1]}">0 号簇 {A, B}</b>`,32),
       hwMono(r,1020,256,'c0 = ( (0+2)/2 , (6+0)/2 ) = <b>(1, 3)</b>',30)];
  c.b=[hwTxt(r,1020,340,`<b style="color:${HWC[2]}">1 号簇 {C, D, E, F}</b>`,32),
       hwMono(r,1020,390,'c1 = ( (4+9+10+11)/4 , (0+1+5+0)/4 )',30),hwMono(r,1020,436,'   = <b>(8.5, 1.5)</b>',30)];
  H('div','a',{left:1020,top:510,width:800,height:2,background:'rgba(27,38,49,.25)'},r);
  c.q=hwTxt(r,1020,528,'要不要停？',26,{color:'var(--graphite)'});
  c.m=[hwTxt(r,1020,574,`质心移动：c0 移了 ${hwF(it.move0)}，c1 移了 ${hwF(it.move1)}　→　最大 <b>${hwF(it.maxMove)}</b>`,27),
       hwTxt(r,1020,626,'归属：上一轮还没分过（记作全是 −1）　→　<b>变了</b>',27),
       hwHand(r,1020,694,'两个条件都不满足 → 再来一轮',38)];
  return c;
},
update(c,t){
  const u0=ep(t,5.4,7.4),u1=ep(t,12,14);
  // 两个质心先后移动：分别插值
  const it=E2SP.iters[0];c.km.view(0,6,0);
  c.km.C[0].set(lerp(it.c0.x,it.nc0.x,u0),lerp(it.c0.y,it.nc0.y,u0));c.km.C[1].set(lerp(it.c1.x,it.nc1.x,u1),lerp(it.c1.y,it.nc1.y,u1));
  E2P.forEach((p,i)=>{const b=it.nb[i],cx=b?lerp(it.c1.x,it.nc1.x,u1):lerp(it.c0.x,it.nc0.x,u0),cy=b?lerp(it.c1.y,it.nc1.y,u1):lerp(it.c0.y,it.nc0.y,u0),P=c.km.P[i];
    c.km.links[i].set(P.cx,P.cy,c.km.pl.X(cx),c.km.pl.Y(cy),HWC[b+1],.9);});
  hwSeq(c.a,t,1.6,1.6);vis(c.b[0],ep(t,9,9.6),8);vis(c.b[1],ep(t,10.2,10.8),8);vis(c.b[2],ep(t,11.6,12.2),8);
  vis(c.q,ep(t,16.4,17),6);vis(c.m[0],ep(t,17.4,18),8);vis(c.m[1],ep(t,20.4,21),8);vis(c.m[2],ep(t,23.4,24),8);
}});

e2Round({title:'第 2 轮',head:'第 2 轮 · 分配，再更新',k:1,dur:37,T0:2.6,per:2.7,upd:[21,23.4],caps:[
  [.4,7.9,'第 2 轮，用新的质心重新分配。A、B 还是离 c0 近，不变。'],
  [8.1,18.6,'轮到 C：到 c0 是 18，到 c1 是 22.5。质心移动之后，C 变成离 c0 更近了，改归 0 号。D、E、F 不变。'],
  [18.8,27,'再更新质心：0 号簇现在是 A、B、C，质心移到 (2, 2)；1 号簇是 D、E、F，质心移到 (10, 2)。'],
  [27.2,36.6,'这一轮 C 的归属变了，质心也分别移动了 1.41 和 1.58。两个停止条件还是都不满足，继续。']],
  notes:[[19,'更新：c0 → (2, 2)　　c1 → (10, 2)',false],[27.4,'归属：C 变了　　最大移动量 1.58，不小于 1e-6',false],[30,'两个条件都不满足 → 再来一轮',true]]});

e2Round({title:'第 3 轮：停',head:'第 3 轮 · 归属没变，停',k:2,dur:27,T0:2,per:1.5,upd:[12,13],caps:[
  [.4,11,'第 3 轮，再分配一次。这次每个点的归属都和上一轮一样，没有一个变化。'],
  [11.2,18,'归属没变，重新算出来的质心也就和原来一样，移动量是 0。两个停止条件都满足了，K-means 结束。'],
  [18.2,26.6,'结果：0 号子簇是 A、B、C，1 号子簇是 D、E、F。代码里它们叫 child0 和 child1。']],
  notes:[[11.4,'归属：和上一轮完全一样　　最大移动量 0',false],[14,'归属没变 → 停',true],[18.4,`结果　<b style="color:${HWC[1]}">child0 = {A, B, C}</b>　　<b style="color:${HWC[2]}">child1 = {D, E, F}</b>`,false]]});

/* 7 两个停止条件 */
SC.push({title:'两个停止条件',dur:31,caps:[
  [.4,9,'把三轮放在一起看。每一轮记两样东西：归属和上一轮比，变没变；两个质心里移动得更远的那个，移动了多少。'],
  [9.2,18.4,'代码里的停止条件是：归属没变，或者最大移动量小于 1e-6，满足一个就停。这里第 3 轮归属没变，停。'],
  [18.6,30.6,'归属没变的时候，质心是用同一批点算出来的，一定也没动。所以平时都是靠“归属没变”停下来。那第二个条件什么时候起作用？看下一章。']],
build(r){
  const c={};e2Head(r,'三轮放在一起看').style.left='130px';
  const cw=[120,330,470,260,200],xs=[130];cw.forEach(w=>xs.push(xs[xs.length-1]+w));
  ['轮','归属（A B C D E F）','和上一轮比','最大移动量','停不停'].forEach((s,k)=>hwTxt(r,xs[k]+16,214,s,24,{color:'var(--graphite)'}));
  const cmp=['第一次分（上一轮记作全是 −1）','C 变了','<b>完全一样</b>'];
  c.rows=E2SP.iters.map((it,k)=>{const g=H('div','a',{left:130,top:256+96*k,width:xs[5]-130,height:96,borderTop:'1.5px solid rgba(27,38,49,.16)',opacity:0},r);
    if(k===2)H('div','mk',{left:0,top:14,width:xs[5]-130,height:68},g);
    H('div','a',{left:16,top:26,fontSize:34,fontWeight:700,lineHeight:'44px'},g,String(k+1));
    H('div','a',{left:cw[0]+16,top:26,fontSize:36,fontFamily:'var(--num)',letterSpacing:'.3em',lineHeight:'44px'},g,it.nb.map((b,i)=>`<span style="color:${HWC[b+1]}${k&&it.prev[i]!==b?';text-decoration:underline':''}">${b}</span>`).join(''));
    H('div','a',{left:cw[0]+cw[1]+16,top:26,fontSize:28,lineHeight:'44px'},g,cmp[k]);
    H('div','a',{left:cw[0]+cw[1]+cw[2]+16,top:26,fontSize:36,fontFamily:'var(--num)',lineHeight:'44px'},g,hwF(it.maxMove));
    H('div','a',{left:cw[0]+cw[1]+cw[2]+cw[3]+16,top:26,fontSize:30,fontWeight:700,lineHeight:'44px',color:it.stop?'var(--red)':'var(--graphite)'},g,it.stop?'停':'继续');return g;});
  c.code=hwMono(r,146,580,'<span class="kw">if</span> (same || maxMove &lt; 1e-6L) { <span class="kw">break</span>; }',40,{fontWeight:700});
  c.ex=[hwTxt(r,146,656,'<span style="font-family:var(--mono)">same</span>：这一轮的归属和上一轮完全一样　　<span style="font-family:var(--mono)">maxMove</span>：两个质心里移动得更远的那个距离　　<span style="font-family:var(--mono)">||</span>：满足一个就行',26,{color:'var(--graphite)'}),
        hwHand(r,146,730,'归属没变 → 质心一定没动。平时都是靠 same 停下来',40)];
  return c;
},
update(c,t){
  c.rows.forEach((g,k)=>vis(g,ep(t,1+1.6*k,1.6+1.6*k),8));
  vis(c.code,ep(t,9.4,10),8);vis(c.ex[0],ep(t,11.4,12),8);vis(c.ex[1],ep(t,19,19.6),8);
}});

/* 8 只有两个点的簇 */
(function(){
  const R=hwRunOf('two'),sp=R.rounds[0].split,it=sp.iters[0],PL={x:230,y:214,u:66,xmax:8,ymax:7,coord:true};
  SC.push({title:'只有两个点的簇',dur:25,caps:[
    [.4,8,'看一个只有两个点的簇。初始质心就是这两个点自己。分配：A 归 0 号，B 归 1 号。'],
    [8.2,16.4,'这是第一轮，上一轮的归属记作全是 −1，所以“归属没变”不成立。但是每个簇只有一个点，新质心还是它自己，移动量是 0。'],
    [16.6,24.6,'于是靠第二个条件“最大移动量小于 1e-6”停下来，只跑了一轮。只有两个点的簇，都是这样停的。']],
  build(r){
    const c={};c.km=e2Km(r,R.pts,sp,PL);e2Head(r,'只有两个点的簇（用例 03）');
    hwTxt(r,230,730,'A (2, 3)　B (5, 5)',26,{color:'var(--graphite)'});
    c.a=[hwTxt(r,1020,214,`初始质心：<b style="color:${HWC[1]}">c0 = A</b>，<b style="color:${HWC[2]}">c1 = B</b>`,32),
         hwTxt(r,1020,276,`第 1 轮分配：<b style="color:${HWC[1]}">A 归 0 号</b>，<b style="color:${HWC[2]}">B 归 1 号</b>`,32)];
    c.tb=[['<span style="font-family:var(--mono)">same</span>（归属没变）','上一轮全是 −1 → <b style="color:var(--red)">false</b>'],['<span style="font-family:var(--mono)">maxMove</span>（最大移动量）','新质心还是点自己 → <b style="color:var(--blue)">0</b>']].map(([x,y],k)=>{
      const g=H('div','a',{left:1020,top:372+92*k,width:800,height:92,borderTop:'1.5px solid rgba(27,38,49,.16)'},r);
      H('div','a',{left:8,top:26,fontSize:28},g,x);H('div','a',{left:372,top:26,fontSize:30},g,y);return g;});
    c.code=hwMono(r,1020,586,'same || <span style="background:var(--marker)">maxMove &lt; 1e-6L</span>　→　停',34,{fontWeight:700});
    c.n=hwHand(r,1020,680,'靠第二个条件停，只跑 1 轮',40);
    return c;
  },
  update(c,t){
    const a=2*ep(t,4.4,6);c.km.view(0,a,0);
    hwSeq(c.a,t,1.2,3.2);c.tb.forEach((g,k)=>vis(g,ep(t,8.6+3.4*k,9.2+3.4*k),8));vis(c.code,ep(t,16.8,17.4),8);vis(c.n,ep(t,19.4,20),8);
  }});
})();

/* 9 距离相等归 0 号 */
(function(){
  const R=hwRunOf('tie'),sp=R.rounds[0].split,it=sp.iters[0],PL={x:170,y:250,u:84,xmax:9,ymax:5,coord:true};
  SC.push({title:'距离相等归 0 号',dur:23,caps:[
    [.4,8,'还有一种情况：一个点到两个质心一样远。这里 B 到 c0 是 20，到 c1 也是 20，正好在中垂线上。'],
    [8.2,15.2,'代码的判断是：d0 小于等于 d1，就归 0 号。相等时这个条件成立，所以 B 归 0 号。'],
    [15.4,22.6,'这是这份代码的约定：平局归 0 号。如果写成小于号，B 就会归 1 号，结果就不一样了。']],
  build(r){
    const c={};c.km=e2Km(r,R.pts,sp,PL);e2Head(r,'一样远怎么办（用例 04）');
    c.f=e2Formula(r,1020,220,R.pts[1],it);
    c.eq=hwTxt(r,1020,330,'20 = 20　一样远',44,{fontWeight:700,color:'var(--red)'});
    c.code=hwCode(r,1020,430,['if (d0 <= d1) {','    newBelong[i] = 0;','} else {','    newBelong[i] = 1;','}'],28,42,'21.cpp · 分配');
    c.n=hwHand(r,1020,720,'等号在 <= 里：平局归 0 号',40);
    return c;
  },
  update(c,t){
    const a=ep(t,1,1.8)+ep(t,9.4,10.4)+ep(t,10.6,11.4);
    c.km.view(0,a,0,{bis:ep(t,4.6,5.4)*.85});c.km.focus(1,hwWin(t,2,9.4));
    vis(c.f,ep(t,2.2,2.8),0);vis(c.eq,ep(t,5.6,6.2),8);
    c.code.box.style.opacity=ep(t,8.4,9);c.code.set(t<8.6?null:t<10.6?0:1);vis(c.n,ep(t,15.6,16.2),8);
  }});
})();

/* 10 初始质心只是起点 */
(function(){
  const R=hwRunOf('seed'),sp=R.rounds[0].split,n=R.pts.length,T0=3,PER=4;
  SC.push({title:'初始质心只是起点',dur:32,caps:[
    [.4,7.4,'再看一个 6 个点的例子。x 最小的是 A，x 最大的是 F，所以 c1 一开始放在 F 上。'],
    [7.6,19,'第 2 轮 C 改归 1 号；第 3 轮 F 改归 0 号；第 4 轮不再变化，停。一共跑了 4 轮。'],
    [19.2,31.6,'注意 F：c1 一开始就放在它身上，最后它却归了 0 号簇。初始质心只决定从哪里出发，最后的两个簇是一轮一轮算出来的。']],
  build(r){
    const c={};c.km=e2Km(r,R.pts,sp,{x:150,y:214,u:66,xmax:12,ymax:7,lab:{5:{dx:-20,dy:-19,anchor:'end'}}});c.km.C[0].label('c0',-30,8,'end');e2Head(r,'跑了 4 轮的例子（用例 06）');
    hwTxt(r,1020+110,214,'归属（A B C D E F）',24,{color:'var(--graphite)'});hwTxt(r,1020+470,214,'变化',24,{color:'var(--graphite)'});
    const chg=['第一次分','C：0 → 1','F：1 → 0','没变，停'];
    c.rows=sp.iters.map((it,k)=>{const g=H('div','a',{left:1020,top:254+84*k,width:800,height:84,borderTop:'1.5px solid rgba(27,38,49,.16)',opacity:0},r);
      H('div','a',{left:8,top:22,fontSize:28},g,`第 ${k+1} 轮`);
      H('div','a',{left:110,top:16,fontSize:38,fontFamily:'var(--num)',letterSpacing:'.3em'},g,it.nb.map((b,i)=>`<span style="color:${HWC[b+1]}${k&&it.prev[i]!==b?';text-decoration:underline':''}">${b}</span>`).join(''));
      H('div','a',{left:470,top:22,fontSize:28,fontWeight:k===3?700:400,color:k===3?'var(--red)':'var(--ink)'},g,chg[k]);return g;});
    c.res=hwTxt(r,1020,612,`结果　<b style="color:${HWC[1]}">child0 = {A, B, F}</b>　　<b style="color:${HWC[2]}">child1 = {C, D, E}</b>`,30);
    c.n=hwHand(r,1020,690,'F 是 c1 的起点，最后却归了 0 号',40);
    c.n2=hwTxt(r,1020,760,'初始质心只决定从哪里出发',28,{color:'var(--graphite)'});
    return c;
  },
  update(c,t){
    const k=clamp(Math.floor((t-T0)/PER),0,3),lt=t-T0-PER*k;
    const uu=k===3?ep(lt,2,3):ep(lt,2.2,3.4),it=sp.iters[k];
    if(lerp(it.c1.y,it.nc1.y,uu)<1)c.km.C[1].label('c1',-28,-22,'end');else c.km.C[1].label('c1',24,34,'start');
    c.km.view(k,t<T0?0:n*pr(lt,0,1.5),uu,{bis:ep(t,T0,T0+.8)*.7});
    c.rows.forEach((g,q)=>vis(g,ep(t,T0+PER*q+1.4,T0+PER*q+2),8));
    c.km.focus(5,hwWin(t,19.4,31));vis(c.res,ep(t,19.4,20),8);vis(c.n,ep(t,21.4,22),8);vis(c.n2,ep(t,26,26.6),8);
  }});
})();

/* 11 小结 */
SC.push({title:'小结',dur:17,caps:[
  [.4,8.4,'小结一下 K-means 拆一个簇的四步：选初始质心，分配，更新，判断要不要停。'],
  [8.6,16.6,'下一集把它放回整个流程里：每一轮试拆所有的簇，选一个真正拆开，直到簇数达到 N。']],
build(r){
  const c={};
  c.h=hwTxt(r,150,150,'K-means（K = 2）拆一个簇',64,{fontFamily:'var(--display)',fontWeight:900});
  const st=[['1','选初始质心','x 最小的点 → c0，x 最大的点 → c1'],['2','分配','d0 &lt;= d1 归 0 号，否则归 1 号（一样远归 0 号）'],['3','更新','每个质心 = 自己那组点的坐标平均值'],['4','要不要停','归属没变，或最大移动量 &lt; 1e-6 → 停；否则回到第 2 步']];
  c.st=st.map(([a,b,d],k)=>{const g=H('div','a',{left:150,top:270+100*k,width:1500,height:100,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:10,top:18,fontSize:52,fontFamily:'var(--num)',color:'var(--blue)'},g,a);H('div','a',{left:90,top:28,fontSize:36,fontWeight:700},g,b);H('div','a',{left:360,top:32,fontSize:30},g,d);return g;});
  c.res=hwTxt(r,150,690,'结果：两个子簇 <span style="font-family:var(--mono)">child0</span>、<span style="font-family:var(--mono)">child1</span>',32);
  c.n=hwHand(r,150,770,'下一集：一轮一轮拆到 N 个簇',40);
  return c;
},
update(c,t){vis(c.h,ep(t,.3,1),16);c.st.forEach((g,k)=>vis(g,ep(t,1.4+1.3*k,2+1.3*k),8));vis(c.res,ep(t,6.8,7.4),8);vis(c.n,ep(t,8.8,9.4),8);}});
