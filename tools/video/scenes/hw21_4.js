/* ===== 第 4 集：Bi-K-means 全流程 ===== */
const E3K=hwRunOf('k6');
const E3PL={x:130,y:196,u:58,xmax:12,ymax:7};
const E3LAB={3:{dx:20,dy:30}};
const e3Head=(r,s,x)=>hwTxt(r,x||900,128,s,40,{fontFamily:'var(--display)',fontWeight:900});
const e3Col=(clusters,id)=>HWC[clusters.find(q=>q.pts.some(p=>p.id===id)).birth%8];
const e3Set=pts=>'{'+pts.map(p=>HWN[p.id]).join(' ')+'}';
const E3ACT={first:'第一个候选',bigger:'更大 → 换成它',smaller:'更小 → 不换',tie_size:'一样大，点更多 → 换',tie_keep:'一样大 → 不换'};

/* 一轮的通用版面：左边平面 + 簇列表，右边候选表 + 结论 + 输出。
   o：{title, head, key 数据, ri 第几轮（从 0 数）, pl 平面, T0 第一个候选开始的时间, cd 每个候选讲几秒,
       dec 结论几秒, com 真拆几秒, tail 收尾几秒, caps, decText 结论文字, lab 点名位置} */
function e3Round(o){
  const R=hwRunOf(o.key),rd=R.rounds[o.ri],n=rd.cands.length,ok=rd.best>=0;
  const st=[o.T0];rd.cands.forEach((cd,j)=>st.push(st[j]+o.cd[j]));
  const tDec=st[n],tCom=tDec+o.dec,dur=tCom+(ok?o.com:0)+o.tail;
  const CW=[150,214,112,164,118,202],CX=[0];CW.forEach(w=>CX.push(CX[CX.length-1]+w));
  SC.push({title:o.title,dur,caps:o.caps,
  build(r){
    const c={};c.pl=hwPlane(r,o.pl);
    c.links=R.pts.map(()=>hwLine(c.pl.gLink,3.5));
    c.P=R.pts.map((p,i)=>hwPt(c.pl,p,HWN[i],(o.lab||{})[i]));
    c.cen=[hwCen(c.pl,HWINK,o.cs?'':'c0'),hwCen(c.pl,HWINK,o.cs?'':'c1')];if(!o.cs)c.cen[1].label('c1',-28,-22,'end');
    hwTxt(r,90,654,'簇列表 · 这一轮开始时',22,{color:'var(--graphite)'});
    c.ch0=hwChips(r,90,686,rd.before,{idx:true});
    if(ok){c.chL=hwTxt(r,90,774,'簇列表 · 拆完之后',22,{color:'var(--graphite)'});c.ch1=hwChips(r,90,806,rd.after,{idx:true});}
    e3Head(r,o.head);
    ['簇','试拆成','拆前 SSE','拆后 SSE','下降量','和目前最好的比'].forEach((s,k)=>hwTxt(r,900+CX[k],196,s,21,{color:'var(--graphite)',width:CW[k],textAlign:'center'}));
    H('div','a',{left:900,top:232,width:CX[6],height:2,background:'rgba(27,38,49,.25)'},r);
    c.rows=rd.cands.map((cd,j)=>{
      const cl=rd.before[cd.i],col=HWC[cl.birth%8],g=H('div','a',{left:900,top:238+70*j,width:CX[6],height:70,borderBottom:'1.5px solid rgba(27,38,49,.12)'},r);
      const mk=H('div','mk',{left:-6,top:6,width:CX[6]+12,height:58,opacity:0},g),cells=[];
      const cell=(k,html,css)=>cells.push(H('div','a',Object.assign({left:CX[k],top:14,width:CW[k],textAlign:'center',fontSize:26,lineHeight:'42px',opacity:0},css||{}),g,html));
      cell(0,`<b style="color:${col};letter-spacing:.08em">${cl.pts.map(p=>HWN[p.id]).join('')}</b>`);
      if(cd.split){const s=cd.split;
        cell(1,e3Set(s.child0)+' + '+e3Set(s.child1),{fontSize:24});
        cell(2,hwF(s.sseP),{fontFamily:'var(--num)',fontSize:30});
        cell(3,hwF(s.sse0)+' + '+hwF(s.sse1),{fontFamily:'var(--num)',fontSize:30});
        cell(4,hwF(s.grad),{fontFamily:'var(--num)',fontSize:34,fontWeight:700,color:'var(--red)'});
        cell(5,E3ACT[cd.act],{fontSize:22});
      }else cells.push(H('div','a',{left:CX[1],top:14,width:CX[6]-CX[1],textAlign:'center',fontSize:24,lineHeight:'42px',color:'var(--graphite)',opacity:0},g,'只有 1 个点，不能再拆 → 跳过'));
      return {g,mk,cells};});
    c.dec=hwHand(r,900,250+70*n,o.decText,36);
    hwTxt(r,1090,724,'输出',22,{color:'var(--graphite)'});
    c.out=R.out.slice(0,o.ri+(ok?2:1)).map((s,k)=>{const e=hwMono(r,1170+300*Math.floor(k/3),712+50*(k%3),s.join(' '),38,{fontWeight:700,padding:'0 10px',borderRadius:'6px'});return e;});
    return c;
  },
  update(c,t){
    let j=-1;for(let q=0;q<n;q++)if(t>=st[q]&&t<st[q+1])j=q;                 // 正在讲第几个候选
    const u=j<0?0:(t-st[j])/o.cd[j],cd=j<0?null:rd.cands[j],after=ok&&t>=tCom+.8;
    const focus=cd&&cd.split?rd.before[cd.i]:null,fa=focus?Math.min(ep(u,.02,.12),1-ep(u,.93,1)):0;
    // 点：颜色跟着所在的簇；正在试拆某个簇时，其他点变淡
    R.pts.forEach((p,i)=>{const inF=focus&&focus.pts.some(q=>q.id===i);
      c.P[i].set(e3Col(after?rd.after:rd.before,i),focus&&!inF?1-.78*fa:1);c.links[i].set(0,0,0,0,null,0);});
    c.cen.forEach(e=>e.set(0,0,0));
    if(focus){const s=cd.split,la=ep(u,.14,.3)*(1-ep(u,.93,1));
      c.cen[0].set(s.c0.x,s.c0.y,la,o.cs);c.cen[1].set(s.c1.x,s.c1.y,la,o.cs);
      focus.pts.forEach((p,q)=>{const cc=s.belong[q]?s.c1:s.c0,P=c.P[p.id];c.links[p.id].set(P.cx,P.cy,c.pl.X(cc.x),c.pl.Y(cc.y),e3Col(rd.before,p.id),la*.85);});}
    // 候选表：一行一行、一格一格出现
    c.rows.forEach((row,q)=>{const uu=q<j||t>=tDec?1:q===j?u:0,sk=!rd.cands[q].split;
      row.cells.forEach((e,k)=>{const a=sk?[.05,.3]:[.03,.14,.36,.5,.64,.8];e.style.opacity=ep(uu,a[k],a[k]+.1);});
      row.mk.style.opacity=ok&&rd.cands[q].i===rd.best?ep(t,tDec+.3,tDec+.9)*.9:0;});
    vis(c.dec,ep(t,tDec+.4,tDec+1),8);
    // 簇列表
    c.ch0.els.forEach((e,i)=>{const hot=cd&&cd.i===i,best=ok&&i===rd.best&&t>=tDec+.3;
      e.style.background=best?'rgba(255,225,77,.75)':hot?'rgba(255,225,77,.4)':'rgba(255,255,255,.85)';e.style.opacity=best&&t>=tCom+.6?.4:1;});
    if(ok){c.chL.style.opacity=ep(t,tCom+.6,tCom+1.2);c.ch1.box.style.opacity=ep(t,tCom+.6,tCom+1.2);}
    c.out.forEach((e,k)=>{const nw=ok&&k===o.ri+1;e.style.opacity=nw?ep(t,tCom+2,tCom+2.6):1;e.style.background=nw?'var(--marker)':'transparent';});
  }});
}

/* 1 这一集做什么 */
SC.push({title:'这一集做什么',dur:19,caps:[
  [.4,7.4,'这一集讲整个流程。程序里有一个“簇列表”，一开始只有一个簇，装着全部 6 个点。先输出它的点数：6。'],
  [7.6,18.6,'之后每一轮做三件事：试拆列表里的每个簇，选出一个，真正拆开并输出一行。这个例子的 N 是 6，要一直拆到 6 个簇。']],
build(r){
  const c={};c.pl=hwPlane(r,E3PL);c.P=E3K.pts.map((p,i)=>hwPt(c.pl,p,HWN[i],E3LAB[i]));
  hwTxt(r,90,654,'簇列表',22,{color:'var(--graphite)'});c.ch=hwChips(r,90,686,[{pts:E3K.pts,birth:0}],{idx:true});
  c.cn=hwHand(r,330,700,'← 初始簇 C0，birth = 0',32);
  e3Head(r,'用例 07：6 个点，N = 6');
  c.h2=hwTxt(r,900,200,'每一轮做三件事',26,{color:'var(--graphite)'});
  const st=[['① 试拆','点数 ≥ 2 的簇都用 K-means 分一次，算出下降量'],['② 选簇','下降量最大 → 点数多 → 更早生成'],['③ 真拆','列表里去掉它，加上两个子簇；输出一行']];
  c.st=st.map(([a,b],k)=>{const g=H('div','a',{left:900,top:244+108*k,width:920,height:108,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:8,top:34,fontSize:32,fontWeight:700,color:'var(--blue)'},g,a);H('div','a',{left:170,top:22,width:740,whiteSpace:'normal',fontSize:27,lineHeight:1.45},g,b);return g;});
  hwTxt(r,1090,724,'输出',22,{color:'var(--graphite)'});c.o=hwMono(r,1180,712,'6',38,{fontWeight:700});
  c.n=hwHand(r,900,600,'簇数到 6 才停：一共要拆 5 次',36);
  return c;
},
update(c,t){
  c.P.forEach((e,i)=>e.set(HWC[0],ep(t,.4+.1*i,1+.1*i)));c.ch.box.style.opacity=ep(t,2,2.6);vis(c.cn,ep(t,3,3.6),0,-10);vis(c.o,ep(t,5,5.6),6);
  vis(c.h2,ep(t,7.6,8.2),6);c.st.forEach((g,k)=>vis(g,ep(t,8.4+2.2*k,9+2.2*k),8));vis(c.n,ep(t,15.4,16),8);
}});

e3Round({title:'第 1 轮',head:'第 1 轮：只有一个簇',key:'k6',ri:0,pl:E3PL,lab:E3LAB,T0:3,cd:[11],dec:3.5,com:6,tail:1,decText:'只有一个候选 → 拆它',caps:[
  [.4,5.6,'第 1 轮。簇列表里只有一个簇，6 个点全在里面。先对它试拆。'],
  [5.8,13.8,'上一集已经算过：K-means 把它分成 A、B、C 和 D、E、F。拆之前 SSE 是 144，拆之后是 32 加 16，下降量 96。'],
  [14,17.3,'只有这一个候选，不用比，就拆它。'],
  [17.5,24.2,'真正拆开：列表里去掉原来的簇，加上两个子簇。现在有 2 个簇，各 3 个点，输出 3 3。']]});

e3Round({title:'第 2 轮',head:'第 2 轮：两个候选',key:'k6',ri:1,pl:E3PL,lab:E3LAB,T0:3,cd:[10,10],dec:4.5,com:6,tail:1,decText:'30 > 7.5 → 拆 ABC',caps:[
  [.4,2.8,'第 2 轮。现在有两个簇，每个都要试拆一次。'],
  [3,12.8,'先试拆 A、B、C：分成 A 一个点，和 B、C 两个点。SSE 从 32 降到 2，下降量 30。它是第一个候选，先记下来。'],
  [13,22.8,'再试拆 D、E、F：分成 D、E 和 F。SSE 从 16 降到 8.5，下降量 7.5。和目前最好的 30 比，更小，不换。'],
  [23,27.3,'比完了：下降量最大的是 A、B、C，这一轮拆它。'],
  [27.5,34.2,'列表里去掉 A、B、C，加上 A 和 B、C。现在三个簇的点数是 3、1、2，从大到小输出 3 2 1。']]});

/* 4 簇列表怎么变 */
SC.push({title:'簇列表怎么变',dur:28,caps:[
  [.4,6.6,'“真正拆开”这一步，簇列表是这样变的。拆之前有两个簇，要拆的是第 0 个。'],
  [6.8,12.6,'先把它从列表里删掉，后面的簇往前挪一位。'],
  [12.8,19.6,'再把两个子簇依次加到列表末尾：0 号子簇先加，birth 是 3；1 号子簇后加，birth 是 4。'],
  [19.8,27.6,'birth 就是“第几个生成的”。新簇总是加在末尾，所以列表里的簇一直按 birth 从小到大排。这一点在平局时会用到。']],
build(r){
  const c={},rd=E3K.rounds[1],B=rd.before,A=rd.after;
  e3Head(r,'第 2 轮的“真拆”：簇列表怎么变',110);
  const rows=[['拆之前　bestIndex = 0',B],['erase：删掉第 0 个',[B[1]]],['push_back：0 号子簇，birth = 3',[B[1],A[1]]],['push_back：1 号子簇，birth = 4',A]];
  c.rows=rows.map(([s,cl],k)=>{const g=H('div','a',{left:110,top:214+150*k,width:760,height:150},r);
    H('div','a',{left:0,top:0,fontSize:24,color:'var(--graphite)'},g,s);const ch=hwChips(g,0,40,cl,{idx:true});return {g,ch};});
  c.code=hwCode(r,930,214,['// 删除父簇','clusters.erase(','    clusters.begin() + bestIndex',');','// 0 号子簇先生成','clusters.push_back({','    bestSplit.child0,','    birthCounter++','});','// 1 号子簇后生成','clusters.push_back({','    bestSplit.child1,','    birthCounter++','});'],24,36,'21.cpp · main');
  c.bc=hwMono(r,1480,300,'',30,{whiteSpace:'pre',lineHeight:1.6});
  c.n=hwHand(r,930,800,'新簇总是加在末尾 → 列表一直按 birth 从小到大排',34);
  return c;
},
update(c,t){
  const a=[.8,7,13,16.4];c.rows.forEach((row,k)=>vis(row.g,ep(t,a[k],a[k]+.6),8));
  c.rows[0].ch.els[0].style.background=t>=3.4?'rgba(255,225,77,.75)':'rgba(255,255,255,.85)';
  const s=t<7?null:t<13?[0,3]:t<16.4?[4,8]:t<19.8?[9,13]:null;if(s)c.code.set(s[0],s[1]);else c.code.set(null);
  const bc=t<13?3:t<16.4?4:5;c.bc.textContent='birthCounter\n= '+bc;c.bc.style.opacity=ep(t,13,13.6);
  vis(c.n,ep(t,20,20.6),8);
}});

e3Round({title:'第 3 轮',head:'第 3 轮：有一个单点簇',key:'k6',ri:2,pl:E3PL,lab:E3LAB,T0:3,cd:[8,4,8],dec:4,com:6,tail:1,decText:'7.5 > 2 → 拆 DEF',caps:[
  [.4,2.8,'第 3 轮。列表里有三个簇，按顺序一个一个看。'],
  [3,10.8,'D、E、F 上一轮已经试拆过，这一轮还要重新算一次，结果一样：下降量 7.5。它是第一个候选。'],
  [11,14.8,'A 只有一个点，没法再分，直接跳过。'],
  [15,22.8,'B、C 两个点，拆成 B 和 C。SSE 从 2 降到 0，下降量 2，比 7.5 小，不换。'],
  [23,26.8,'这一轮拆 D、E、F。'],
  [27,33.8,'它被换成 D、E 和 F 两个子簇。现在四个簇，输出 2 2 1 1。']]});

e3Round({title:'第 4 轮',head:'第 4 轮：后面的候选更大',key:'k6',ri:3,pl:E3PL,lab:E3LAB,T0:3,cd:[3,7,9,3],dec:4,com:6,tail:1,decText:'8.5 > 2 → 拆 DE',caps:[
  [.4,5.8,'第 4 轮。A 只有一个点，跳过。'],
  [6,12.8,'B、C：下降量 2。前面还没有候选，所以它先当“目前最好的”。'],
  [13,21.8,'D、E 两个点离得远，拆开后 SSE 从 8.5 降到 0，下降量 8.5，比 2 大。目前最好的换成 D、E。'],
  [22,24.8,'F 只有一个点，跳过。'],
  [25,28.8,'这一轮拆 D、E。'],
  [29,35.8,'现在五个簇，输出 2 1 1 1 1。']]});

e3Round({title:'第 5 轮',head:'第 5 轮：最后一次',key:'k6',ri:4,pl:E3PL,lab:E3LAB,T0:2.5,cd:[1.6,6,1.6,1.6,1.6],dec:3,com:6,tail:5,decText:'只剩 BC 能拆 → 拆它',caps:[
  [.4,10,'第 5 轮。五个簇里只有 B、C 还能拆，其余四个都只有一个点，全部跳过。'],
  [10.2,17.7,'唯一的候选就是 B、C，下降量 2，拆它。'],
  [17.9,28.6,'现在是 6 个簇，输出 1 1 1 1 1 1。簇数已经等于 N，循环结束。整个输出一共 6 行：第 0 轮一行，后面每拆一次一行。']]});

e3Round({title:'不是点多的先拆',head:'用例 08 · 第 2 轮：点少的先拆',key:'small',ri:1,cs:.6,pl:{x:130,y:330,u:41,xmax:17,ymax:3},T0:4,cd:[9,9],dec:4,com:6,tail:2,decText:'选簇只看下降量，不看点数',caps:[
  [.4,3.8,'换一组数据，用例 08。第 1 轮已经拆成了左边 4 个点和右边 2 个点。第 2 轮先拆哪个？'],
  [4,12.8,'左边 4 个点挨得很近，拆开后 SSE 从 5 降到 1，下降量只有 4。'],
  [13,21.8,'右边只有 2 个点，但是离得远，SSE 是 18，拆开后变成 0，下降量 18，比 4 大。'],
  [22,25.8,'所以先拆的是点少的那个簇。选簇只看下降量，不看点数。'],
  [26,33.8,'输出是 4 1 1。如果误以为“先拆点多的”，输出会是 2 2 2，就错了。']]});

e3Round({title:'平局一：选点多的',head:'用例 09 · 下降量相同',key:'tieBig',ri:1,cs:.6,pl:{x:130,y:330,u:50,xmax:14,ymax:3},T0:4,cd:[9,10],dec:4,com:6,tail:2,decText:'下降量相同 → 选点数多的',caps:[
  [.4,3.8,'如果两个簇的下降量正好相等呢？看用例 09。第 1 轮拆成了左边 2 个点和右边 4 个点。'],
  [4,12.8,'左边 A、B：SSE 从 4 降到 0，下降量 4。它是第一个候选。'],
  [13,22.8,'右边四个点：SSE 从 5 降到 1，下降量也是 4。一样大，这时比点数：右边 4 个点，比 2 个点多，所以换成它。'],
  [23,26.8,'规则的第二条：下降量相同，选点数多的。'],
  [27,34.8,'输出 2 2 2。如果平局时没有按点数选，拆了左边那个，输出会是 4 1 1。']]});

e3Round({title:'平局二：选更早生成的',head:'用例 11 · 下降量、点数都相同',key:'tieSame',ri:1,cs:.6,pl:{x:130,y:330,u:58,xmax:12,ymax:3},T0:4,cd:[8,10],dec:5,com:6,tail:2,decText:'完全平局 → 保留更早生成的（先遇到的）',caps:[
  [.4,3.8,'点数也一样怎么办？看用例 11：两对点，每一对的间距都是 1。'],
  [4,11.8,'A、B：SSE 从 0.5 降到 0，下降量 0.5。第一个候选。'],
  [12,21.8,'C、D：下降量也是 0.5，点数也是 2。规则的第三条：选更早生成的。A、B 的 birth 是 1，C、D 是 2，所以保留 A、B，不换。'],
  [22,26.8,'代码里不用专门去比 birth：列表本来就按 birth 从小到大排，完全平局时不替换，留下的就是更早的那个。'],
  [27,34.8,'拆 A、B，输出 2 1 1。这个平局从输出上看不出来，但规则要求这样选。']]});

e3Round({title:'提前结束',head:'用例 12 · N = 5，只有 3 个点',key:'nGtL',ri:2,pl:{x:130,y:196,u:58,xmax:7,ymax:7},T0:5,cd:[2,2,2],dec:6,com:0,tail:3,decText:'没有能拆的簇 → 提前结束',caps:[
  [.4,4.8,'最后一种情况：N 比点数还多。用例 12 只有 3 个点，却要求分成 5 个簇。前两轮拆完，已经是三个单点簇。'],
  [5,10.8,'第 3 轮：三个簇都只有一个点，全部跳过，一个候选都没有。'],
  [11,19.6,'没有能拆的簇，循环提前结束。输出只有 3 行，簇数停在 3，到不了 5。代码里是 bestIndex 等于 −1 时 break。']]});

/* 12 小结 */
SC.push({title:'小结',dur:19,caps:[
  [.4,9.4,'小结。每一轮：试拆每个点数不少于 2 的簇，选下降量最大的；下降量相同选点多的，点数也相同选更早生成的；然后真正拆开，输出一行。'],
  [9.6,18.6,'结束有两种：簇数到了 N，或者没有能拆的簇了。下一集把这些一句一句对到代码上。']],
build(r){
  const c={};
  c.h=hwTxt(r,150,146,'Bi-K-means 的一轮',64,{fontFamily:'var(--display)',fontWeight:900});
  const st=[['① 试拆','每个点数 ≥ 2 的簇都分一次，算 SSE 下降量；单点簇跳过'],['② 选簇','下降量最大 → 相同选点数多的 → 还相同选更早生成的'],['③ 真拆','列表里删掉它，末尾加上 0 号、1 号子簇；输出各簇点数（降序）']];
  c.st=st.map(([a,b],k)=>{const g=H('div','a',{left:150,top:270+104*k,width:1560,height:104,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:10,top:30,fontSize:38,fontWeight:700,color:'var(--blue)'},g,a);H('div','a',{left:230,top:34,fontSize:31},g,b);return g;});
  c.e=[hwTxt(r,150,604,'结束：<b>簇数到 N</b>　或　<b>没有能拆的簇</b>（所有簇都只剩 1 个点）',32),
       hwTxt(r,150,668,'输出：第 0 轮一行 + 每拆一次一行',32)];
  c.n=hwHand(r,150,770,'下一集：对到代码上',40);
  return c;
},
update(c,t){vis(c.h,ep(t,.3,1),16);c.st.forEach((g,k)=>vis(g,ep(t,1.4+2*k,2+2*k),8));hwSeq(c.e,t,9.8,1.6);vis(c.n,ep(t,13.6,14.2),8);}});
