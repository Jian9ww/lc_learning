/* ---------- 数据：LeetCode 的 5 × 5 例子 ---------- */
const A=[[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]],M=5,N=5;
// 按代码模拟一次查找，返回每一步的位置和动作
function sim(target){
  const st=[];let i=0,j=N-1;
  while(i<M&&j>=0){const x=A[i][j];
    if(x===target){st.push({i,j,x,act:'hit'});return {st,found:true,i,j};}
    if(x<target){st.push({i,j,x,act:'row'});i++;}else{st.push({i,j,x,act:'col'});j--;}}
  return {st,found:false,i,j};
}

const CODE=[
'bool searchMatrix(vector<vector<int>>& matrix, int target) {',
'    int m = matrix.size(), n = matrix[0].size();',
'    int i = 0, j = n - 1;',
'    while (i < m && j >= 0) {',
'        if (matrix[i][j] == target) {',
'            return true;',
'        }',
'        if (matrix[i][j] < target) {',
'            i++;',
'        } else {',
'            j--;',
'        }',
'    }',
'    return false;',
'}'];

function grid(r,x0,y0,w,pitch,fs,idx){
  const cells=A.map((row,i)=>row.map((v,j)=>H('div','cell',{left:x0+pitch*j,top:y0+pitch*i,width:w,height:w,fontSize:fs},r,String(v))));
  const g={cells,w,pitch,x0,y0,lab:[],x:j=>x0+pitch*j,y:i=>y0+pitch*i,cx:j=>x0+pitch*j+w/2,cy:i=>y0+pitch*i+w/2,
    cls(fn){cells.forEach((row,i)=>row.forEach((e,j)=>{const k=fn(i,j),cn='cell'+(k?' '+k:'');if(e.className!==cn)e.className=cn;}));},
    show(a){cells.forEach((row,i)=>row.forEach((e,j)=>e.style.opacity=typeof a==='function'?a(i,j):a));g.lab.forEach(e=>e.style.opacity=typeof a==='function'?a(0,0):a);}};
  if(idx){
    for(let j=0;j<N;j++)g.lab.push(H('div','a idx',{left:x0+pitch*j,top:y0-30,width:w,fontSize:20},r,String(j)));
    for(let i=0;i<M;i++)g.lab.push(H('div','a idx',{left:x0-34,top:y0+pitch*i+w/2-13,width:24,fontSize:20},r,String(i)));
  }
  return g;
}
function ring(r,size=62){return H('div','a',{width:size,height:size,border:'6px solid var(--red)',borderRadius:'50%',opacity:0,boxSizing:'border-box'},r);}
function putRing(e,x,y,size=62){e.style.left=(x-size/2)+'px';e.style.top=(y-size/2)+'px';}
function arrow(svg,x1,y1,x2,y2,color){
  const g=S('g',{},svg),ln=S('line',{x1,y1,x2,y2},g);Object.assign(ln.style,{stroke:color,strokeWidth:6,strokeLinecap:'round'});
  const a=Math.atan2(y2-y1,x2-x1),L=24,W=12,bx=x2-L*Math.cos(a),by=y2-L*Math.sin(a);
  const h=S('path',{d:`M${x2+8*Math.cos(a)} ${y2+8*Math.sin(a)} L${bx-W*Math.sin(a)} ${by+W*Math.cos(a)} L${bx+W*Math.sin(a)} ${by-W*Math.cos(a)} Z`},g);h.style.fill=color;
  g.style.opacity=0;return g;
}
// 剩余区域的蓝框：第 i 行到最后一行、第 0 列到第 j 列
function region(r){return H('div','a',{border:'5px solid var(--blue)',borderRadius:'12px',opacity:0,boxSizing:'border-box'},r);}
function putRegion(e,g,i,j,pad=9){
  const ii=Math.min(i,M),jj=Math.max(j,-1);
  Object.assign(e.style,{left:(g.x(0)-pad)+'px',top:(g.y(0)+g.pitch*ii-pad)+'px',width:Math.max(0,g.pitch*jj+g.w+2*pad)+'px',height:Math.max(0,g.pitch*(M-1-ii)+g.w+2*pad)+'px'});
}

/* ================= 场景 ================= */
const SC=[];

/* 1 题目 */
SC.push({title:'题目',dur:12,caps:[
  [.5,6,'题目：矩阵的每一行从左到右升序，每一列从上到下升序。判断 target 在不在里面。'],
  [6.2,11.6,'一格一格找要看 m × n 个数。利用“行列都有序”，可以每比较一次就扔掉一整行或一整列。']],
build(r){
  const c={};
  c.eb=H('div','a',{left:140,top:190,fontFamily:'var(--mono)',fontSize:30,color:'var(--graphite)',letterSpacing:'.04em'},r,'LeetCode 240 · 矩阵 / 排除法');
  c.ti=H('div','a',{left:130,top:236,fontFamily:'var(--display)',fontSize:112,fontWeight:900,letterSpacing:'.02em',lineHeight:1.2},r,'搜索二维矩阵 II');
  c.sub=H('div','a',{left:140,top:400,fontSize:38},r,'从 <b style="color:var(--blue)">右上角</b> 出发，一次排除一行或一列');
  c.g=grid(r,1130,230,100,112,40,false);
  c.svg=S('svg',{class:'ov'},r);
  c.ar=arrow(c.svg,1130,196,1130+112*4+100,196,'var(--blue)');
  c.ad=arrow(c.svg,1096,230,1096,230+112*4+100,'var(--blue)');
  c.l1=H('div','a',{left:1130,top:140,fontSize:26,color:'var(--blue)'},r,'每一行：从左到右变大');
  c.l2=H('div','a',{left:1000,top:806,fontSize:26,color:'var(--blue)'},r,'每一列：从上到下变大');
  c.n1=H('div','a hand',{left:140,top:560,fontSize:42},r,'target = 5 在不在里面？');
  c.n2=H('div','a',{left:140,top:640,fontSize:30,color:'var(--graphite)'},r,'暴力：m × n = 25 个数全看一遍');
  return c;
},
update(c,t){
  vis(c.eb,ep(t,.2,.9),16);vis(c.ti,ep(t,.35,1.2),24);vis(c.sub,ep(t,.9,1.7),16);
  c.g.show((i,j)=>ep(t,1.5+.03*(i*N+j),2+.03*(i*N+j)));
  c.ar.style.opacity=ep(t,2.8,3.4);c.l1.style.opacity=ep(t,2.8,3.4);c.ad.style.opacity=ep(t,3.8,4.4);c.l2.style.opacity=ep(t,3.8,4.4);
  vis(c.n1,ep(t,5,5.6),10);vis(c.n2,ep(t,6.6,7.2),8);
}});

/* 2 从哪个角出发 */
SC.push({title:'从哪个角出发',dur:18,caps:[
  [.3,7,'先想从哪里开始。站在左上角：它是最小的数。target 比它大时，往右、往下都会变大，两条路都有可能，一个也排除不了。'],
  [7.2,13,'换到右上角：往左变小，往下变大。一边小、一边大，比较一次就知道该往哪边走。'],
  [13.2,17.6,'target 比它小，只可能在左边；target 比它大，只可能在下面。']],
build(r){
  const c={};
  c.g=grid(r,230,250,108,120,42,false);
  c.svg=S('svg',{class:'ov'},r);
  const g=c.g;
  c.a1=[arrow(c.svg,g.cx(0),g.y(0)-30,g.cx(2),g.y(0)-30,'var(--red)'),arrow(c.svg,g.x(0)-30,g.cy(0),g.x(0)-30,g.cy(2),'var(--red)')];
  c.a2=[arrow(c.svg,g.cx(4),g.y(0)-30,g.cx(2),g.y(0)-30,'var(--blue)'),arrow(c.svg,g.x(4)+g.w+30,g.cy(0),g.x(4)+g.w+30,g.cy(2),'var(--red)')];
  const tag=(x,y,s,col)=>H('div','a',{left:x,top:y,fontSize:28,fontWeight:700,color:col,opacity:0},r,s);
  c.g1=[tag(g.cx(1)-28,g.y(0)-84,'变大','var(--red)'),tag(g.x(0)-112,g.cy(1)-20,'变大','var(--red)')];
  c.g2=[tag(g.cx(3)-28,g.y(0)-84,'变小','var(--blue)'),tag(g.x(4)+g.w+52,g.cy(1)-20,'变大','var(--red)')];
  c.ring=ring(r,76);
  c.t1=[H('div','a',{left:1010,top:230,fontFamily:'var(--display)',fontSize:52,fontWeight:900,color:'var(--red)'},r,'✗ 左上角'),
        H('div','a',{left:1010,top:310,fontSize:32},r,'往右：变大　　往下：也变大'),
        H('div','a hand',{left:1010,top:366,fontSize:36},r,'两条路都可能，排除不了')];
  c.t2=[H('div','a',{left:1010,top:480,fontFamily:'var(--display)',fontSize:52,fontWeight:900,color:'var(--blue)'},r,'✓ 右上角'),
        H('div','a',{left:1010,top:560,fontSize:32},r,'往左：<b style="color:var(--blue)">变小</b>　　往下：<b style="color:var(--red)">变大</b>'),
        H('div','a hand',{left:1010,top:616,fontSize:36},r,'比较一次，只剩一条路')];
  c.t3=[H('div','a',{left:1010,top:720,fontFamily:'var(--mono)',fontSize:32},r,'target &lt; x　→　往左'),H('div','a',{left:1010,top:770,fontFamily:'var(--mono)',fontSize:32},r,'target &gt; x　→　往下')];
  return c;
},
update(c,t){
  const g=c.g;g.show(ep(t,.2,.7));
  const mv=ep(t,7.2,8.2);putRing(c.ring,lerp(g.cx(0),g.cx(4),mv),g.cy(0),76);c.ring.style.opacity=ep(t,1,1.5);
  c.a1.forEach((e,k)=>{const a=ep(t,2+.6*k,2.5+.6*k)*(1-ep(t,6.8,7.2));e.style.opacity=a;c.g1[k].style.opacity=a;});
  c.a2.forEach((e,k)=>{const a=ep(t,8.6+.6*k,9.1+.6*k);e.style.opacity=a;c.g2[k].style.opacity=a;});
  c.t1.forEach((e,k)=>vis(e,ep(t,1.2+1.2*k,1.8+1.2*k),8));
  c.t2.forEach((e,k)=>vis(e,ep(t,8+1.1*k,8.6+1.1*k),8));
  c.t3.forEach((e,k)=>vis(e,ep(t,13.4+.8*k,14+.8*k),8));
}});

/* 3 一次比较，排除一行或一列 */
SC.push({title:'排除一行或一列',dur:22,caps:[
  [.3,6,'站在右上角，设这个数是 x。它是这一行里最大的，也是这一列里最小的。'],
  [6.2,13.5,'如果 x 比 target 大：这一列在它下面的数都更大，整列都不可能是 target。排除这一列，j 减 1。'],
  [13.7,21.6,'如果 x 比 target 小：这一行在它左边的数都更小，整行都不可能是 target。排除这一行，i 加 1。']],
build(r){
  const c={};
  c.g=grid(r,200,230,108,120,42,true);const g=c.g;
  c.bc=H('div','a',{left:g.x(4)-8,top:g.y(0)-8,width:g.w+16,height:g.pitch*4+g.w+16,border:'5px solid var(--red)',borderRadius:'12px',opacity:0,boxSizing:'border-box'},r);
  c.br=H('div','a',{left:g.x(0)-8,top:g.y(0)-8,width:g.pitch*4+g.w+16,height:g.w+16,border:'5px solid var(--red)',borderRadius:'12px',opacity:0,boxSizing:'border-box'},r);
  c.ring=ring(r,76);putRing(c.ring,g.cx(4),g.cy(0),76);
  c.x=H('div','a hand',{left:g.x(4)+g.w+18,top:g.y(0)+26,fontSize:38},r,'x = 15');
  c.k=H('div','a',{left:920,top:214,fontSize:30,color:'var(--graphite)'},r,'x 是这一行的最大值，也是这一列的最小值');
  const blk=(y,head,l1,l2,color)=>[H('div','a',{left:920,top:y,fontFamily:'var(--mono)',fontSize:40,fontWeight:700,color},r,head),
    H('div','a',{left:920,top:y+60,fontSize:30},r,l1),H('div','a hand',{left:920,top:y+108,fontSize:38},r,l2)];
  c.b1=blk(310,'x &gt; target','例：target = 5。这一列是 15、19、22、24、30，都比 5 大','排除这一列：j--','var(--ink)');
  c.b2=blk(520,'x &lt; target','例：target = 20。这一行是 1、4、7、11、15，都比 20 小','排除这一行：i++','var(--ink)');
  c.b3=H('div','a',{left:920,top:740,fontFamily:'var(--mono)',fontSize:40,fontWeight:700,color:'var(--blue)'},r,'x == target　→　找到了');
  return c;
},
update(c,t){
  const g=c.g;g.show(ep(t,.2,.7));c.ring.style.opacity=ep(t,.8,1.3);c.x.style.opacity=ep(t,1,1.5);vis(c.k,ep(t,2.4,3),8);
  const colOn=ep(t,7.4,8)*(1-ep(t,13.2,13.7)),colOut=t>=9.6&&t<13.4,rowOn=ep(t,14.8,15.4),rowOut=t>=17;
  c.bc.style.opacity=colOn;c.br.style.opacity=rowOn;
  g.cls((i,j)=>(colOut&&j===4)||(rowOut&&i===0)?'out':'');
  c.b1.forEach((e,k)=>vis(e,ep(t,6.4+1.3*k,7+1.3*k),8));
  c.b2.forEach((e,k)=>vis(e,ep(t,13.9+1.3*k,14.5+1.3*k),8));
  vis(c.b3,ep(t,19.2,19.8),8);
}});

/* 4、5 走一遍：共用一套版面 */
function walkScene(title,target,SD,caps,outro){
  const R=sim(target),T0=2.6,END=T0+SD*R.st.length;
  const all=[[.3,2.4,`${title.replace('：',' ')}。从右上角 (0, 4) 出发，蓝框是还没排除的区域。`]].concat(caps.map(([a,b,s])=>[T0+SD*a+.1,T0+SD*b-.1,s]),[[END+.2,END+outro-.2,R.found?`在 (${R.i}, ${R.j}) 找到了 ${target}，返回 true。一共比较了 ${R.st.length} 次。`:`i 走到了 ${R.i}，超出最后一行：所有行列都排除完了，返回 false。一共比较了 ${R.st.length} 次。`]]);
  SC.push({title,dur:END+outro,caps:all,
  build(r){
    const c={};
    c.code=codePanel(r,96,160,CODE,22,40,'排除法');
    c.g=grid(r,1040,250,88,98,34,true);
    c.reg=region(r);
    c.ring=ring(r);
    H('div','a',{left:1580,top:236,fontSize:24,color:'var(--graphite)'},r,'target');
    H('div','a',{left:1580,top:264,fontFamily:'var(--num)',fontSize:96,color:'var(--red)',lineHeight:1.1},r,String(target));
    c.ij=H('div','a',{left:1580,top:420,fontFamily:'var(--mono)',fontSize:32,lineHeight:1.6,whiteSpace:'pre'},r,'');
    c.cnt=H('div','a',{left:1580,top:560,fontSize:24,color:'var(--graphite)'},r,'');
    c.s1=H('div','a',{left:1040,top:770,fontFamily:'var(--mono)',fontSize:28},r,'');
    c.s2=H('div','a',{left:1040,top:820,fontFamily:'var(--mono)',fontSize:28},r,'');
    return c;
  },
  update(c,t){
    const g=c.g;g.show(ep(t,.2,.7));
    const k=clamp(Math.floor((t-T0)/SD),-1,R.st.length),u=(t-T0-SD*k)/SD;        // u：这一步内的进度 0~1
    // 已经排除的行、列
    const outRow=new Set(),outCol=new Set();
    R.st.forEach((s,q)=>{if(q<k||(q===k&&u>=.62)){if(s.act==='row')outRow.add(s.i);if(s.act==='col')outCol.add(s.j);}});
    const hit=R.found&&(k>=R.st.length||(k===R.st.length-1&&u>=.5));
    g.cls((i,j)=>hit&&i===R.i&&j===R.j?'on':(outRow.has(i)||outCol.has(j))?'out':'');
    // 圆圈和蓝框
    let ri=0,rj=N-1;
    if(k>=0){const s=R.st[Math.min(k,R.st.length-1)];ri=s.i;rj=s.j;
      if(k>=R.st.length&&!R.found){ri=R.i;rj=R.j;}
      else if(k<R.st.length&&u>=.62&&s.act!=='hit'){const m=ep(u,.62,.9);ri=lerp(s.i,s.i+(s.act==='row'?1:0),m);rj=lerp(s.j,s.j-(s.act==='col'?1:0),m);}}
    putRing(c.ring,g.cx(Math.max(rj,-.6)),g.cy(Math.min(ri,M-.4)));
    c.ring.style.opacity=ep(t,1.2,1.7)*((!R.found&&k>=R.st.length)?1-ep(t,END,END+.5):1);
    putRegion(c.reg,g,Math.round(ri),Math.round(rj));c.reg.style.opacity=ep(t,1.4,1.9)*((Math.round(ri)>=M||Math.round(rj)<0)?0:1);
    const ci=k<0?0:k>=R.st.length?R.i:(u>=.9&&R.st[k].act==='row'?R.st[k].i+1:R.st[k].i),cj=k<0?N-1:k>=R.st.length?R.j:(u>=.9&&R.st[k].act==='col'?R.st[k].j-1:R.st[k].j);
    c.ij.textContent=`i = ${ci}\nj = ${cj}`;c.ij.style.opacity=ep(t,1,1.5);
    c.cnt.textContent=`已比较 ${k<0?0:Math.min(k+(u>=.25?1:0),R.st.length)} 次`;c.cnt.style.opacity=ep(t,1,1.5);
    let line=null;
    if(k>=0&&k<R.st.length){
      const s=R.st[k],op=s.act==='hit'?'==':s.act==='row'?'<':'>';
      c.s1.innerHTML=`matrix[${s.i}][${s.j}] = <b>${s.x}</b>　${op}　${target}`;c.s1.style.opacity=ep(u,.1,.25);
      c.s2.innerHTML=s.act==='hit'?'<b style="color:var(--blue)">找到了，return true</b>':s.act==='row'?`第 ${s.i} 行剩下的数都比 ${target} 小　→　<b>i++</b>`:`第 ${s.j} 列剩下的数都比 ${target} 大　→　<b>j--</b>`;
      c.s2.style.opacity=ep(u,.4,.55);
      line=u<.25?3:s.act==='hit'?(u<.5?4:5):u<.5?(s.act==='row'?7:9):(s.act==='row'?8:10);
    }else if(k>=R.st.length){
      c.s1.innerHTML=R.found?`matrix[${R.i}][${R.j}] == ${target}`:`i = ${R.i}，不满足 i &lt; m，循环结束`;c.s1.style.opacity=1;
      c.s2.innerHTML=R.found?'<b style="color:var(--blue)">return true</b>':'<b style="color:var(--red)">return false</b>';c.s2.style.opacity=1;line=R.found?5:13;
    }else{c.s1.innerHTML='m = 5，n = 5，i = 0，j = 4';c.s1.style.opacity=ep(t,.9,1.4);c.s2.style.opacity=0;line=t<.8?null:t<1.6?1:2;}
    c.code.set(line);
  }});
}
walkScene('找 5：能找到',5,3.4,[
  [0,3,'15、11、7 都比 5 大，所以连续三次排除最右边的一列，j 从 4 减到 1。'],
  [3,4,'4 比 5 小：第 0 行剩下的数都更小，排除这一行，i 加 1。'],
  [4,5,'现在的右上角是 5，正好等于 target。']],3.6);
walkScene('找 20：找不到',20,2.5,[
  [0,2,'15 和 19 都比 20 小，排除第 0 行和第 1 行。'],
  [2,5,'22 比 20 大，排除一列；16、17 比 20 小，又排除两行。'],
  [5,8,'26、23、21 都比 20 大，连续排除三列，只剩左下角的 18。'],
  [8,9,'18 比 20 小，排除最后一行。']],4.2);

/* 6 为什么快 */
SC.push({title:'最多 m + n 步',dur:14,caps:[
  [.3,7,'为什么快：每比较一次，就少一行或者少一列。一共只有 m 行、n 列，所以最多比较 m + n 次。'],
  [7.2,13.6,'这个 5 × 5 的例子最多 10 次，刚才找 20 用了 9 次。没有用任何额外的数组，空间是 O(1)。']],
build(r){
  const c={};
  const rows=[['一格一格找','O(m · n)','25 次'],['每一行做二分','O(m · log n)','约 15 次'],['从右上角排除','O(m + n)','最多 10 次']];
  c.hd=[['做法',120],['时间',560],['5 × 5 时',900]].map(([s,x])=>H('div','a',{left:x,top:190,fontSize:26,color:'var(--graphite)'},r,s));
  c.rows=rows.map(([a,b,d],k)=>{
    const g=H('div','a',{left:96,top:240+110*k,width:1100,height:110,borderTop:'1.5px solid rgba(27,38,49,.14)'},r),hot=k===2;
    H('div','a',{left:24,top:32,fontSize:36,fontWeight:hot?700:400},g,a);
    H('div','a',{left:464,top:26,fontFamily:'var(--mono)',fontSize:40,color:hot?'var(--blue)':'var(--ink)'},g,b);
    H('div','a',{left:804,top:22,fontFamily:'var(--num)',fontSize:50,color:hot?'var(--red)':'var(--graphite)'},g,d);
    return g;
  });
  c.n1=H('div','a hand',{left:120,top:620,fontSize:44},r,'每一步排除一行或一列　→　最多 m + n 步');
  c.n2=H('div','a',{left:120,top:700,fontSize:30,color:'var(--graphite)'},r,'额外空间 O(1)：只用了 i、j 两个变量');
  c.g=grid(r,1340,250,76,84,28,false);
  c.gl=H('div','a',{left:1340,top:700,fontSize:24,color:'var(--graphite)'},r,'找 20：9 次比较就排除了全部 25 个数');
  return c;
},
update(c,t){
  c.hd.forEach((e,k)=>vis(e,ep(t,.2+.08*k,.8+.08*k),8));
  c.rows.forEach((g,k)=>vis(g,ep(t,1+1.2*k,1.6+1.2*k),10));
  vis(c.n1,ep(t,5,5.6),10);vis(c.n2,ep(t,10,10.6),8);
  c.g.show(ep(t,7.2,7.8));c.g.cls(()=>t>=8.4?'out':'');c.gl.style.opacity=ep(t,8.4,9);
}});

/* 7 两个细节 */
SC.push({title:'两个细节',dur:16,caps:[
  [.3,7.5,'两个细节。第一：循环条件 i < m 并且 j >= 0，意思是“剩余区域还没空”。i 越过最后一行，或者 j 越过第 0 列，就说明找不到。'],
  [7.7,15.6,'第二：起点也可以选左下角，道理一样，只是方向反过来。左上角和右下角不行，因为往两边走是同增或同减。']],
build(r){
  const c={};
  c.L=H('div','card',{left:96,top:140,width:840,height:720},r);
  c.R=H('div','card',{left:984,top:140,width:840,height:720},r);
  c.l1=H('div','a hand',{left:136,top:164,fontSize:32},r,'细节一：循环条件');
  c.l2=H('div','a',{left:136,top:214,fontFamily:'var(--mono)',fontSize:36,fontWeight:700},r,'while (i &lt; m &amp;&amp; j &gt;= 0)');
  c.l3=H('div','a',{left:136,top:278,fontSize:26,color:'var(--graphite)'},r,'剩余区域：第 i 行到最后一行，第 0 列到第 j 列');
  c.g=grid(r,176,360,72,80,26,false);
  c.reg=region(r);
  c.l4=H('div','a',{left:600,top:400,width:300,whiteSpace:'normal',fontSize:26,lineHeight:1.6},r,'i 变大：区域从上面缩小<br>j 变小：区域从右边缩小');
  c.l5=H('div','a hand',{left:600,top:540,width:300,whiteSpace:'normal',fontSize:32,lineHeight:1.4},r,'缩到空了还没找到 → false');
  c.r1=H('div','a hand',{left:1024,top:164,fontSize:32},r,'细节二：从哪个角出发');
  const X=1104,Y=268,W=440,HH=300;
  c.box=H('div','a',{left:X,top:Y,width:W,height:HH,border:'2px solid var(--ink)',borderRadius:'8px',background:'rgba(255,255,255,.6)'},r);
  H('div','a',{left:X+150,top:Y+128,fontSize:28,color:'var(--graphite)'},r,'行、列都升序');
  const corner=(x,y,ok,label)=>{const e=H('div','a',{left:x-44,top:y-44,width:88,height:88,borderRadius:'50%',background:ok?'var(--blue)':'var(--red)',color:'#fff',textAlign:'center',lineHeight:'88px',fontSize:44,fontWeight:700,opacity:0},r,ok?'✓':'✗');
    const l=H('div','a',{left:x+(x<X+W/2?-150:60),top:y+(y<Y+HH/2?-74:36),width:150,textAlign:x<X+W/2?'right':'left',fontSize:26,color:ok?'var(--blue)':'var(--red)',opacity:0},r,label);return [e,l];};
  c.cs=[corner(X+W,Y,true,'右上角'),corner(X,Y+HH,true,'左下角'),corner(X,Y,false,'左上角'),corner(X+W,Y+HH,false,'右下角')];
  c.r2=H('div','a',{left:1024,top:690,fontSize:26},r,'<b style="color:var(--blue)">左下角</b>：x &lt; target 往右（j++），x &gt; target 往上（i--）');
  c.r3=H('div','a',{left:1024,top:746,fontSize:26,color:'var(--graphite)'},r,'左上角、右下角：两个方向同增或同减，比较完仍然有两条路');
  return c;
},
update(c,t){
  vis(c.l1,ep(t,.2,.8),8);vis(c.l2,ep(t,.4,1),8);vis(c.l3,ep(t,1,1.6),8);
  c.g.show(ep(t,1.2,1.8));
  // 区域按“找 20”的过程逐步缩小
  const R=sim(20),k=clamp(Math.floor((t-2.2)/.5),0,R.st.length),outRow=new Set(),outCol=new Set();
  R.st.slice(0,k).forEach(s=>{if(s.act==='row')outRow.add(s.i);else outCol.add(s.j);});
  c.g.cls((i,j)=>(outRow.has(i)||outCol.has(j))?'out':'');
  const s=k<R.st.length?R.st[k]:{i:R.i,j:R.j};putRegion(c.reg,c.g,s.i,s.j,7);c.reg.style.opacity=ep(t,1.6,2.1)*(s.i>=M?0:1);
  vis(c.l4,ep(t,2.4,3),8);vis(c.l5,ep(t,6.8,7.4),8);
  c.R.style.opacity=ep(t,7.5,8);vis(c.r1,ep(t,7.7,8.3),8);c.box.style.opacity=ep(t,8,8.6);
  c.cs.forEach(([e,l],q)=>{const a=ep(t,8.8+.7*q,9.3+.7*q);pop(e,a);l.style.opacity=a;});
  vis(c.r2,ep(t,11.8,12.4),8);vis(c.r3,ep(t,13.2,13.8),8);
}});

/* 8 收尾 */
SC.push({title:'一句话',dur:8,caps:[],
build(r){
  const c={};
  c.a=H('div','a',{left:156,top:250,fontFamily:'var(--display)',fontSize:84,fontWeight:900,lineHeight:1.3},r,'站在右上角：');
  c.b=H('div','a',{left:156,top:364,fontFamily:'var(--display)',fontSize:72,fontWeight:900,lineHeight:1.3},r,'比 target 大就往左，比 target 小就往下。');
  c.c=H('div','a',{left:164,top:530,fontFamily:'var(--mono)',fontSize:44},r,'x &gt; target: <span style="color:var(--blue)">j--</span>　　x &lt; target: <span style="color:var(--blue)">i++</span>');
  c.d=H('div','a hand',{left:164,top:624,fontSize:36},r,'每一步排除一行或一列　　时间 O(m + n)，额外空间 O(1)');
  c.e=H('div','a',{left:164,top:750,fontSize:22,color:'var(--graphite)'},r,'LC 240 · 例子：5 × 5 矩阵，找 5 比较 5 次，找 20 比较 9 次');
  return c;
},
update(c,t){vis(c.a,ep(t,.2,1),20);vis(c.b,ep(t,.6,1.4),20);vis(c.c,ep(t,1.6,2.3),12);vis(c.d,ep(t,2.4,3.1),12);vis(c.e,ep(t,3,3.6),0);}
});
