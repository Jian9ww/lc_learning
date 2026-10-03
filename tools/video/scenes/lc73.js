/* ---------- 数据：全程用同一个例子（4 行 5 列） ---------- */
const A0=[[1,2,0,4,5],[6,7,8,9,1],[2,0,3,4,5],[6,7,8,0,9]],M=4,N=5;
const clone=a=>a.map(r=>r.slice());
const FC0=A0.some(r=>r[0]===0),FR0=A0[0].some(v=>v===0);          // 第一列 / 第一行原来有没有 0
const A1=clone(A0),MARKS=[];                                        // 第二步：打完标记
for(let i=1;i<M;i++)for(let j=1;j<N;j++)if(A0[i][j]===0){A1[0][j]=0;A1[i][0]=0;MARKS.push([i,j]);}
const A2=clone(A1);for(let i=1;i<M;i++)for(let j=1;j<N;j++)if(A1[0][j]===0||A1[i][0]===0)A2[i][j]=0;   // 第三步
const A3=clone(A2);if(FC0)for(let i=0;i<M;i++)A3[i][0]=0;if(FR0)for(let j=0;j<N;j++)A3[0][j]=0;       // 第四步
const INNER=[];for(let i=1;i<M;i++)for(let j=1;j<N;j++)INNER.push([i,j]);
// 格子样式：z 原来的 0；mark 标记；clr 被清成 0
const cls0=(i,j)=>A0[i][j]===0?'z':'';
const cls1=(i,j)=>cls0(i,j)||(A1[i][j]===0?'mark':'');
const cls2=(i,j)=>cls1(i,j)||(A2[i][j]===0?'clr':'');
const cls3=(i,j)=>cls2(i,j)||(A3[i][j]===0?'clr':'');
// “边扫边改”的错误做法，逐格模拟
const NAIVE=[];(()=>{const a=clone(A0),k=A0.map((r,i)=>r.map((v,j)=>cls0(i,j)));
  for(let i=0;i<M;i++)for(let j=0;j<N;j++){const hit=a[i][j]===0;
    if(hit){for(let q=0;q<N;q++)if(a[i][q]!==0){a[i][q]=0;k[i][q]='clr';}for(let p=0;p<M;p++)if(a[p][j]!==0){a[p][j]=0;k[p][j]='clr';}}
    NAIVE.push({i,j,hit,a:clone(a),k:clone(k)});}})();
// 细节二用：如果第一行先清零，再按标记清零，会得到的错误结果
const WRONG=clone(A1);for(let j=0;j<N;j++)WRONG[0][j]=0;
for(let i=1;i<M;i++)for(let j=1;j<N;j++)if(WRONG[0][j]===0||WRONG[i][0]===0)WRONG[i][j]=0;

const CODE=[
'void setZeroes(vector<vector<int>>& matrix) {',
'    int m = matrix.size();',
'    int n = matrix[0].size();',
'    bool firstRow0 = false;',
'    bool firstCol0 = false;',
'    for(int i = 0; i < m; i++)',
'        if(matrix[i][0] == 0) firstCol0 = true;',
'    for(int j = 0; j < n; j++)',
'        if(matrix[0][j] == 0) firstRow0 = true;',
'    for(int i = 1; i < m; i++)',
'        for(int j = 1; j < n; j++)',
'            if(matrix[i][j] == 0)',
'                matrix[0][j] = matrix[i][0] = 0;',
'    for(int i = 1; i < m; i++)',
'        for(int j = 1; j < n; j++)',
'            if(matrix[0][j] == 0 || matrix[i][0] == 0)',
'                matrix[i][j] = 0;',
'    if(firstCol0)',
'        for(int i = 0; i < m; i++)',
'            matrix[i][0] = 0;',
'    if(firstRow0)',
'        for(int j = 0; j < n; j++)',
'            matrix[0][j] = 0;',
'}'];

function grid(r,vals,x0,y0,w,pitch,fs,idx){
  const cells=vals.map((row,i)=>row.map((v,j)=>H('div','cell',{left:x0+pitch*j,top:y0+pitch*i,width:w,height:w,fontSize:fs},r,'')));
  const g={cells,w,pitch,x0,y0,x:j=>x0+pitch*j,y:i=>y0+pitch*i,cx:j=>x0+pitch*j+w/2,cy:i=>y0+pitch*i+w/2,lab:[],
    set(i,j,v,k){const e=cells[i][j],s=String(v);if(e.textContent!==s)e.textContent=s;const cn='cell'+(k?' '+k:'');if(e.className!==cn)e.className=cn;},
    fill(a,fn){a.forEach((row,i)=>row.forEach((v,j)=>g.set(i,j,v,fn(i,j))));},
    show(a){cells.forEach((row,i)=>row.forEach((e,j)=>e.style.opacity=typeof a==='function'?a(i,j):a));g.lab.forEach(e=>e.style.opacity=typeof a==='function'?a(0,0):a);}};
  vals.forEach((row,i)=>row.forEach((v,j)=>g.set(i,j,v,v===0?'z':'')));   // 默认按原始矩阵显示
  if(idx){
    for(let j=0;j<vals[0].length;j++)g.lab.push(H('div','a idx',{left:x0+pitch*j,top:y0-30,width:w,fontSize:20},r,String(j)));
    for(let i=0;i<vals.length;i++)g.lab.push(H('div','a idx',{left:x0-34,top:y0+pitch*i+w/2-13,width:24,fontSize:20},r,String(i)));
  }
  return g;
}
// 第一行、第一列的黄色底：标记本
function strips(r,x0,y0,w,pitch){
  const a=H('div','mk',{left:x0-9,top:y0-9,width:pitch*(N-1)+w+18,height:w+18,opacity:0},r);
  const b=H('div','mk',{left:x0-9,top:y0-9,width:w+18,height:pitch*(M-1)+w+18,opacity:0},r);
  return {set(p){a.style.opacity=.9*p;b.style.opacity=.9*p;}};
}
function badges(r,x,y){
  const mk=(name,yy)=>{H('div','a',{left:x,top:yy,fontFamily:'var(--mono)',fontSize:24,color:'var(--graphite)'},r,name);
    return H('div','a',{left:x,top:yy+34,fontFamily:'var(--mono)',fontSize:38,fontWeight:700},r,'');};
  const row=mk('firstRow0',y),col=mk('firstCol0',y+124);
  const put=(e,v)=>{e.textContent=v==null?'?':String(v);e.style.color=v==null?'var(--faint)':v?'var(--red)':'var(--graphite)';};
  return {row,col,set(rv,cv){put(row,rv);put(col,cv);}};
}
function ring(r,size=58){return H('div','a',{width:size,height:size,border:'6px solid var(--red)',borderRadius:'50%',opacity:0,boxSizing:'border-box'},r);}
function putRing(e,x,y,size=58){e.style.left=(x-size/2)+'px';e.style.top=(y-size/2)+'px';}
function box(r,color){return H('div','a',{border:'5px solid '+color,borderRadius:'9px',opacity:0,boxSizing:'border-box'},r);}
function putBox(e,g,i,j,pad=7){Object.assign(e.style,{left:(g.x(j)-pad)+'px',top:(g.y(i)-pad)+'px',width:(g.w+2*pad)+'px',height:(g.w+2*pad)+'px'});}
function arrow(svg,x1,y1,x2,y2,color){
  const g=S('g',{},svg),ln=S('line',{x1,y1,x2,y2},g);Object.assign(ln.style,{stroke:color,strokeWidth:5,strokeLinecap:'round'});
  const d=drawable(ln),a=Math.atan2(y2-y1,x2-x1),L=22,W=11,bx=x2-L*Math.cos(a),by=y2-L*Math.sin(a);
  const h=S('path',{d:`M${x2+8*Math.cos(a)} ${y2+8*Math.sin(a)} L${bx-W*Math.sin(a)} ${by+W*Math.cos(a)} L${bx+W*Math.sin(a)} ${by-W*Math.cos(a)} Z`},g);
  h.style.fill=color;h.style.opacity=0;
  return {g,set(p,hp){d.set(p);h.style.opacity=hp;}};
}
// 四个“步骤”场景共用的版面：左边代码，右边矩阵
function work(r,vals,fn,title){
  const c={};
  c.code=codePanel(r,96,118,CODE,19,31,title);
  c.st=strips(r,1010,246,96,106);
  c.g=grid(r,vals,1010,246,96,106,38,true);c.g.fill(vals,fn);
  c.bd=badges(r,1600,246);
  c.s1=H('div','a',{left:1010,top:700,fontFamily:'var(--mono)',fontSize:27},r,'');
  c.s2=H('div','a',{left:1010,top:750,fontFamily:'var(--mono)',fontSize:27},r,'');
  c.svg=S('svg',{class:'ov'},r);
  c.ring=ring(r);
  return c;
}

/* ================= 场景 ================= */
const SC=[];

/* 1 题目 */
SC.push({title:'题目',dur:12,caps:[
  [.5,5.5,'题目：矩阵里某个元素是 0，就把它所在的整行、整列都变成 0。'],
  [5.7,11.6,'这个例子有 3 个 0，所以 3 行、3 列要清零。要求原地修改，额外空间 O(1)。']],
build(r){
  const c={};
  c.eb=H('div','a',{left:140,top:190,fontFamily:'var(--mono)',fontSize:30,color:'var(--graphite)',letterSpacing:'.04em'},r,'LeetCode 73 · 矩阵 / 原地标记');
  c.ti=H('div','a',{left:130,top:236,fontFamily:'var(--display)',fontSize:124,fontWeight:900,letterSpacing:'.02em',lineHeight:1.2},r,'矩阵置零');
  c.sub=H('div','a',{left:140,top:416,fontSize:38},r,'把 <b style="color:var(--blue)">第一行和第一列</b> 当成标记本');
  c.bands=[];
  c.g=grid(r,A0,1040,236,104,116,42,true);
  const g=c.g;
  [0,2,3].forEach(i=>c.bands.push(H('div','a',{left:g.x(0)-8,top:g.y(i)-8,width:g.pitch*(N-1)+g.w+16,height:g.w+16,background:'rgba(207,53,40,.13)',borderRadius:'8px',opacity:0},r)));
  [2,1,3].forEach(j=>c.bands.push(H('div','a',{left:g.x(j)-8,top:g.y(0)-8,width:g.w+16,height:g.pitch*(M-1)+g.w+16,background:'rgba(207,53,40,.13)',borderRadius:'8px',opacity:0},r)));
  c.n1=H('div','a hand',{left:140,top:560,fontSize:42},r,'3 个 0　→　3 行、3 列清零');
  c.n2=H('div','a',{left:140,top:640,fontSize:30,color:'var(--graphite)'},r,'原地修改，额外空间 O(1)');
  return c;
},
update(c,t){
  vis(c.eb,ep(t,.2,.9),16);vis(c.ti,ep(t,.35,1.2),24);vis(c.sub,ep(t,.9,1.7),16);
  const done=t>=9;
  c.g.fill(done?A3:A0,done?(i,j)=>cls0(i,j)||(A3[i][j]===0?'clr':''):cls0);
  c.g.show((i,j)=>ep(t,1.6+.04*(i*N+j),2.1+.04*(i*N+j)));
  c.bands.forEach((e,k)=>e.style.opacity=ep(t,5.9+.4*k,6.4+.4*k)*(1-.55*ep(t,9,9.6)));
  vis(c.n1,ep(t,6.4,7.1),10);vis(c.n2,ep(t,9.6,10.2),8);
}});

/* 2 不能边扫边改 */
SC.push({title:'不能边扫边改',dur:14,caps:[
  [.3,6,'最直接的想法：从头扫一遍，扫到 0，就立刻把这一行、这一列改成 0。'],
  [6.2,13.6,'问题是新写上去的 0 和原来的 0 分不清。后面扫到它们，又会多清一行一列，最后整个矩阵都成了 0。']],
build(r){
  const c={};
  c.g=grid(r,A0,210,246,108,120,44,true);
  c.ring=ring(r,64);
  c.h1=H('div','a hand',{left:960,top:250,fontSize:40},r,'扫到 0　→　立刻清这一行、这一列');
  c.lg=H('div','a',{left:960,top:330,fontSize:26,color:'var(--graphite)'},r,'<span style="color:var(--red)">红色</span>：原来的 0　　<span style="color:var(--graphite)">灰色</span>：新写上去的 0');
  c.bad=H('div','a',{left:960,top:440,fontFamily:'var(--display)',fontSize:60,fontWeight:900,color:'var(--red)'},r,'✗ 整个矩阵都成了 0');
  c.ok=H('div','a',{left:960,top:540,fontSize:28,color:'var(--graphite)'},r,'正确答案里，第 1 行的 6 和 1 应该保留');
  c.fix=H('div','a hand',{left:960,top:640,fontSize:46},r,'先记下来，再统一改');
  return c;
},
update(c,t){
  const T0=1.4,SD=.4,k=clamp(Math.floor((t-T0)/SD),-1,NAIVE.length-1),u=(t-T0)/SD-k;
  c.g.show((i,j)=>ep(t,.2+.03*(i*N+j),.6+.03*(i*N+j)));
  let st=null;
  if(k>=0){const cur=NAIVE[k];st=(cur.hit&&u<.45&&k<NAIVE.length)?(k?NAIVE[k-1]:null):cur;
    putRing(c.ring,c.g.cx(cur.j),c.g.cy(cur.i),64);c.ring.style.opacity=t<T0+SD*NAIVE.length+.3?1:1-ep(t,T0+SD*NAIVE.length+.3,T0+SD*NAIVE.length+.8);}
  else c.ring.style.opacity=0;
  if(st)c.g.fill(st.a,(i,j)=>st.k[i][j]);else c.g.fill(A0,cls0);
  vis(c.h1,ep(t,.6,1.2),10);c.lg.style.opacity=ep(t,2.4,3);
  vis(c.bad,ep(t,9.8,10.4),10);vis(c.ok,ep(t,10.8,11.4),8);vis(c.fix,ep(t,12,12.6),10);
}});

/* 3 先用两个数组记 */
SC.push({title:'先用两个数组记',dur:12,caps:[
  [.3,6,'所以先记，再改。最容易想到的是开两个数组：一个记哪些行要清零，一个记哪些列要清零。'],
  [6.2,11.6,'这样要多用 O(m + n) 的空间。题目要 O(1)，得把这两个数组省掉。']],
build(r){
  const c={};
  c.g=grid(r,A0,540,330,100,112,40,false);const g=c.g;
  c.cl=H('div','a',{left:540,top:150,fontFamily:'var(--mono)',fontSize:28},r,'col[]');
  c.rl=H('div','a',{left:360,top:286,fontFamily:'var(--mono)',fontSize:28},r,'row[]');
  c.col=A0[0].map((v,j)=>H('div','cell',{left:g.x(j),top:196,width:100,height:76,fontSize:40,color:'var(--red)'},r,''));
  c.row=A0.map((v,i)=>H('div','cell',{left:360,top:g.y(i),width:100,height:100,fontSize:44,color:'var(--red)'},r,''));
  c.bands=[[0,2],[2,1],[3,3]].map(([i,j])=>[
    H('div','a',{left:g.x(0)-8,top:g.y(i)-8,width:g.pitch*(N-1)+g.w+16,height:g.w+16,background:'rgba(207,53,40,.13)',borderRadius:'8px',opacity:0},r),
    H('div','a',{left:g.x(j)-8,top:g.y(0)-8,width:g.w+16,height:g.pitch*(M-1)+g.w+16,background:'rgba(207,53,40,.13)',borderRadius:'8px',opacity:0},r),i,j]);
  c.t1=H('div','a',{left:1200,top:340,fontSize:28,color:'var(--graphite)'},r,'row[i]：第 i 行要不要清零');
  c.t2=H('div','a',{left:1200,top:392,fontSize:28,color:'var(--graphite)'},r,'col[j]：第 j 列要不要清零');
  c.sp=H('div','a',{left:1200,top:520,fontFamily:'var(--mono)',fontSize:44},r,'额外空间 O(m + n)');
  c.strike=H('div','a',{left:1196,top:548,width:0,height:5,background:'var(--red)',borderRadius:'3px'},r);
  c.o1=H('div','a hand',{left:1200,top:604,fontSize:44},r,'题目要 O(1)');
  return c;
},
update(c,t){
  c.g.show((i,j)=>ep(t,.2+.03*(i*N+j),.6+.03*(i*N+j)));
  c.cl.style.opacity=ep(t,.8,1.3);c.rl.style.opacity=ep(t,.8,1.3);
  c.col.forEach((e,j)=>pop(e,ep(t,.9+.05*j,1.3+.05*j)));c.row.forEach((e,i)=>pop(e,ep(t,.9+.05*i,1.3+.05*i)));
  const rows=new Set(),cols=new Set();
  c.bands.forEach(([a,b,i,j],k)=>{const s=1.8+1.2*k,p=ep(t,s,s+.4)*(1-.6*ep(t,s+.9,s+1.3));a.style.opacity=p;b.style.opacity=p;if(t>=s+.4){rows.add(i);cols.add(j);}});
  c.row.forEach((e,i)=>e.textContent=rows.has(i)?'✓':'');c.col.forEach((e,j)=>e.textContent=cols.has(j)?'✓':'');
  vis(c.t1,ep(t,1.2,1.8),8);vis(c.t2,ep(t,1.5,2.1),8);
  vis(c.sp,ep(t,6.4,7),10);c.strike.style.width=(430*ep(t,8,8.6))+'px';vis(c.o1,ep(t,8.8,9.4),10);
}});

/* 4 把标记搬进矩阵 */
SC.push({title:'把标记搬进矩阵',dur:18,caps:[
  [.3,6,'办法：矩阵自己就有一行一列可以借用。把 row[] 搬到第一列，col[] 搬到第一行。'],
  [6.2,11.5,'约定：matrix[i][0] 是 0，表示第 i 行要清零；matrix[0][j] 是 0，表示第 j 列要清零。'],
  [11.7,17.6,'代价：第一行、第一列自己原来有没有 0，会被标记盖掉。所以动手之前，先用两个 bool 记下来。']],
build(r){
  const c={};
  c.st=strips(r,540,330,100,112);
  c.g=grid(r,A0,540,330,100,112,40,false);const g=c.g;
  c.cl=H('div','a',{left:540,top:150,fontFamily:'var(--mono)',fontSize:28},r,'col[]');
  c.rl=H('div','a',{left:360,top:286,fontFamily:'var(--mono)',fontSize:28},r,'row[]');
  c.col=A0[0].map((v,j)=>H('div','cell',{left:g.x(j),top:196,width:100,height:76,fontSize:40,color:'var(--red)'},r,[1,2,3].includes(j)?'✓':''));
  c.row=A0.map((v,i)=>H('div','cell',{left:360,top:g.y(i),width:100,height:100,fontSize:44,color:'var(--red)'},r,[0,2,3].includes(i)?'✓':''));
  c.r1=H('div','a',{left:1200,top:330,fontFamily:'var(--mono)',fontSize:32},r,'matrix[i][0] == 0');
  c.r1b=H('div','a hand',{left:1200,top:376,fontSize:36},r,'→ 第 i 行要清零');
  c.r2=H('div','a',{left:1200,top:460,fontFamily:'var(--mono)',fontSize:32},r,'matrix[0][j] == 0');
  c.r2b=H('div','a hand',{left:1200,top:506,fontSize:36},r,'→ 第 j 列要清零');
  c.q=H('div','a',{left:1200,top:610,fontSize:28,color:'var(--graphite)'},r,'第一行、第一列自己原来有没有 0？');
  c.b1=H('div','a',{left:1200,top:662,fontFamily:'var(--mono)',fontSize:34,fontWeight:700},r,'bool firstRow0, firstCol0;');
  c.b2=H('div','a',{left:1200,top:722,fontSize:26,color:'var(--graphite)'},r,'matrix[0][0] 两边共用，所以要两个 bool');
  c.ring=ring(r,70);
  return c;
},
update(c,t){
  const g=c.g,mv=ep(t,1.6,3.4),fade=1-ep(t,3.4,4.2);
  g.show(1);
  c.row.forEach(e=>{e.style.transform=`translateX(${(g.x(0)-360)*mv}px)`;e.style.opacity=fade;});
  c.col.forEach(e=>{e.style.transform=`translateY(${(g.y(0)-196+12)*mv}px)`;e.style.opacity=fade;});
  c.cl.style.opacity=1-ep(t,1.4,2);c.rl.style.opacity=1-ep(t,1.4,2);
  c.st.set(ep(t,3.2,4.2));
  vis(c.r1,ep(t,6.4,7),10);vis(c.r1b,ep(t,7,7.6),0,-12);vis(c.r2,ep(t,8.4,9),10);vis(c.r2b,ep(t,9,9.6),0,-12);
  vis(c.q,ep(t,11.9,12.5),8);vis(c.b1,ep(t,13,13.6),10);vis(c.b2,ep(t,14.8,15.4),8);
  putRing(c.ring,g.cx(0),g.cy(0),70);c.ring.style.opacity=ep(t,14.6,15.1);
}});

/* 5 第一步：记下第一行、第一列 */
SC.push({title:'第一步：记下首行首列',dur:12,caps:[
  [.3,5.5,'第一步：先看第一列。从上到下没有 0，firstCol0 是 false。'],
  [5.7,11.6,'再看第一行。matrix[0][2] 是 0，firstRow0 是 true。这两个结果留到最后用。']],
build(r){return work(r,A0,cls0,'第一步：记下第一行、第一列原来有没有 0');},
update(c,t){
  const g=c.g;g.show(ep(t,.2,.7));c.st.set(ep(t,.4,1));
  const A=1.2,B=6,SD=.7,ka=clamp(Math.floor((t-A)/SD),-1,M-1),kb=clamp(Math.floor((t-B)/SD),-1,N-1);
  const colDone=t>=A+SD*M,rowHit=t>=B+SD*2+.35,rowDone=t>=B+SD*N;
  c.bd.set(rowHit?true:null,colDone?false:null);
  if(t>=B&&kb>=0&&!rowDone){putRing(c.ring,g.cx(kb),g.cy(0));c.ring.style.opacity=1;}
  else if(t>=A&&ka>=0&&!colDone){putRing(c.ring,g.cx(0),g.cy(ka));c.ring.style.opacity=1;}
  else c.ring.style.opacity=0;
  if(t<A){c.s1.style.opacity=0;c.s2.style.opacity=0;c.code.set(t>.6?4:null);}
  else if(t<B){c.s1.innerHTML=colDone?'第一列：1、6、2、6，没有 0':`i = ${ka}　matrix[${ka}][0] = ${A0[ka][0]}　不是 0`;c.s1.style.opacity=1;
    c.s2.innerHTML='firstCol0 = false';c.s2.style.opacity=colDone?1:0;c.code.set(6);}
  else{c.s1.innerHTML=rowDone?'第一行：1、2、0、4、5，有 0':`j = ${kb}　matrix[0][${kb}] = ${A0[0][kb]}`+(A0[0][kb]===0?'　<b style="color:var(--red)">是 0</b>':'　不是 0');c.s1.style.opacity=1;
    c.s2.innerHTML='firstRow0 = <b style="color:var(--red)">true</b>';c.s2.style.opacity=rowHit?1:0;c.code.set(8);}
}});

/* 6 第二步：打标记 */
const MK={T0:3.8,SD:.45,ZD:3.6};
(()=>{let tt=MK.T0;MK.ev=INNER.map(([i,j])=>{const z=A0[i][j]===0,e={i,j,z,t0:tt,t1:tt+(z?MK.ZD:MK.SD)};tt=e.t1;return e;});MK.END=tt;})();
const S6=[[.3,3.6,'第二步：扫描第一行、第一列以外的部分，遇到 0 就在列首和行首打标记。']];
MK.ev.filter(e=>e.z).forEach(e=>S6.push([e.t0+.1,e.t1-.1,`(${e.i}, ${e.j}) 是 0：把这一列的列首 matrix[0][${e.j}] 和这一行的行首 matrix[${e.i}][0] 都改成 0。`]));
S6.push([MK.END+.3,MK.END+4.3,'打完标记。第一行的 0 表示第 1、2、3 列要清零；第一列的 0 表示第 2、3 行要清零。']);
SC.push({title:'第二步：打标记',dur:MK.END+4.5,caps:S6,
build(r){
  const c=work(r,A0,cls0,'第二步：在列首、行首打标记');const g=c.g;
  c.ar=MK.ev.map(e=>e.z?[arrow(c.svg,g.cx(e.j),g.y(e.i)-6,g.cx(e.j),g.y(0)+g.w+12,'var(--red)'),arrow(c.svg,g.x(e.j)-6,g.cy(e.i),g.x(0)+g.w+12,g.cy(e.i),'var(--red)')]:null);
  return c;
},
update(c,t){
  const g=c.g;g.show(1);c.st.set(1);c.bd.set(FR0,FC0);
  const k=MK.ev.findIndex(e=>t>=e.t0&&t<e.t1),cur=k>=0?MK.ev[k]:null,after=t>=MK.END;
  // 当前矩阵：已经完成的标记
  const a=clone(A0);MK.ev.forEach(e=>{if(e.z&&t>=e.t0+2){a[0][e.j]=0;a[e.i][0]=0;}});
  g.fill(a,(i,j)=>cls0(i,j)||(a[i][j]===0?'mark':''));
  MK.ev.forEach((e,q)=>{if(!e.z)return;const u=t-e.t0,on=q===k,f=on?1-ep(u,3,3.5):0;
    c.ar[q].forEach(x=>{x.set(on?ep(u,.7,1.7):0,on?ep(u,1.5,1.8)*f:0);x.g.style.opacity=on?f:0;});
    const b=on?ep(u,1.8,2)*(1-ep(u,2,2.6)):0;g.cells[0][e.j].style.transform=`scale(${1+.2*b})`;g.cells[e.i][0].style.transform=`scale(${1+.2*b})`;});
  if(cur){putRing(c.ring,g.cx(cur.j),g.cy(cur.i));c.ring.style.opacity=1;
    c.s1.innerHTML=`i = ${cur.i}，j = ${cur.j}　matrix[${cur.i}][${cur.j}] = ${A0[cur.i][cur.j]}`+(cur.z?'　<b style="color:var(--red)">是 0</b>':'　不是 0');c.s1.style.opacity=1;
    c.s2.innerHTML=cur.z?`matrix[0][${cur.j}] = matrix[${cur.i}][0] = <b style="color:var(--blue)">0</b>`:'';c.s2.style.opacity=cur.z?ep(t-cur.t0,1.2,1.6):0;
    c.code.set(cur.z&&t-cur.t0>1?12:11);}
  else if(after){c.ring.style.opacity=0;c.s1.innerHTML='第一行：1 <b style="color:var(--blue)">0</b> <b style="color:var(--red)">0</b> <b style="color:var(--blue)">0</b> 5　→　第 1、2、3 列要清零';c.s1.style.opacity=1;
    c.s2.innerHTML='第一列：1 6 <b style="color:var(--blue)">0 0</b>　→　第 2、3 行要清零';c.s2.style.opacity=ep(t,MK.END+.8,MK.END+1.3);c.code.set(null);}
  else{c.ring.style.opacity=0;c.s1.innerHTML='只看内部：i 从 1 开始，j 从 1 开始';c.s1.style.opacity=ep(t,1.2,1.8);c.s2.style.opacity=0;c.code.set(t<1?null:t<2.4?9:10);}
}});

/* 7 第三步：按标记清零 */
const CL={T0:1.6,SD:.72};CL.END=CL.T0+CL.SD*INNER.length;
SC.push({title:'第三步：按标记清零',dur:CL.END+5.6,caps:[
  [.3,5,'第三步：还是只看内部。每个格子查一下自己的列首和行首，有一个是 0，就把自己改成 0。'],
  [5.2,CL.END+.2,'列首或行首是 0 的格子都变成了 0。(1, 4) 的列首是 5、行首是 6，都不是 0，所以保留。'],
  [CL.END+.4,CL.END+5.4,'这一步不能碰第一行和第一列：它们是标记，现在改掉，后面的格子就查不准了。']],
build(r){
  const c=work(r,A1,cls1,'第三步：按标记清零');
  c.bc=box(r,'var(--blue)');c.br=box(r,'var(--blue)');
  return c;
},
update(c,t){
  const g=c.g;g.show(1);c.st.set(1);c.bd.set(FR0,FC0);
  const k=clamp(Math.floor((t-CL.T0)/CL.SD),-1,INNER.length),u=(t-CL.T0)/CL.SD-k;
  const a=clone(A1);INNER.forEach(([i,j],q)=>{if(q<k||(q===k&&u>=.55))a[i][j]=A2[i][j];});
  g.fill(a,(i,j)=>cls1(i,j)||(a[i][j]===0?'clr':''));
  if(k>=0&&k<INNER.length){
    const [i,j]=INNER[k],ch=A1[0][j]===0,rh=A1[i][0]===0;
    putRing(c.ring,g.cx(j),g.cy(i));c.ring.style.opacity=1;
    putBox(c.bc,g,0,j);putBox(c.br,g,i,0);c.bc.style.opacity=1;c.br.style.opacity=1;
    c.bc.style.borderColor=ch?'var(--red)':'var(--blue)';c.br.style.borderColor=rh?'var(--red)':'var(--blue)';
    c.s1.innerHTML=`(${i}, ${j})　列首 matrix[0][${j}] = ${A1[0][j]}　行首 matrix[${i}][0] = ${A1[i][0]}`;c.s1.style.opacity=1;
    c.s2.innerHTML=(ch||rh)?'有一个是 0　→　<b style="color:var(--red)">改成 0</b>':'都不是 0　→　保留';c.s2.style.opacity=ep(u,.3,.5);
    c.code.set(u<.5?15:(ch||rh)?16:15);
  }else{
    c.ring.style.opacity=0;c.bc.style.opacity=0;c.br.style.opacity=0;
    if(k<0){c.s1.innerHTML='内部的每个格子，查列首和行首';c.s1.style.opacity=ep(t,.6,1.2);c.s2.style.opacity=0;c.code.set(t>.8?13:null);}
    else{c.s1.innerHTML='内部处理完了。第一行、第一列还没动';c.s1.style.opacity=1;c.s2.style.opacity=0;c.code.set(null);}
  }
}});

/* 8 第四步：处理第一行、第一列 */
SC.push({title:'第四步：首行首列',dur:12,caps:[
  [.3,5.5,'第四步：最后处理第一行和第一列，用第一步记下的两个 bool。firstCol0 是 false，第一列不动。'],
  [5.7,11.6,'firstRow0 是 true，第一行全部改成 0。完成，和正确答案一致。']],
build(r){
  const c=work(r,A2,cls2,'第四步：最后处理第一行、第一列');const g=c.g;
  c.bc=H('div','a',{left:g.x(0)-9,top:g.y(0)-9,width:g.w+18,height:g.pitch*(M-1)+g.w+18,border:'5px solid var(--graphite)',borderRadius:'10px',opacity:0,boxSizing:'border-box'},r);
  c.nc=H('div','a hand',{left:g.x(0)-150,top:g.y(1)+20,width:130,textAlign:'right',fontSize:34,color:'var(--graphite)'},r,'不动');
  c.br=H('div','a',{left:g.x(0)-9,top:g.y(0)-9,width:g.pitch*(N-1)+g.w+18,height:g.w+18,border:'5px solid var(--red)',borderRadius:'10px',opacity:0,boxSizing:'border-box'},r);
  c.okn=H('div','a hand',{left:1010,top:806,fontSize:44},r,'✓ 完成');
  return c;
},
update(c,t){
  const g=c.g;g.show(1);c.st.set(1-ep(t,9.6,10.4));c.bd.set(FR0,FC0);c.ring.style.opacity=0;
  const a=clone(A2);for(let j=0;j<N;j++)if(t>=7+.35*j)a[0][j]=A3[0][j];
  g.fill(a,(i,j)=>cls2(i,j)||(a[i][j]===0?'clr':''));
  c.bc.style.opacity=ep(t,1.6,2.1)*(1-ep(t,5.4,5.9));vis(c.nc,ep(t,3.2,3.8)*(1-ep(t,5.4,5.9)),0,10);
  c.br.style.opacity=ep(t,6,6.5)*(1-ep(t,9.4,9.9));
  c.bd.col.style.transform=`scale(${1+.18*ep(t,1.4,1.8)*(1-ep(t,4.8,5.4))})`;c.bd.col.style.transformOrigin='0 50%';
  c.bd.row.style.transform=`scale(${1+.18*ep(t,5.8,6.2)*(1-ep(t,9.2,9.8))})`;c.bd.row.style.transformOrigin='0 50%';
  if(t<5.7){c.s1.innerHTML='if(firstCol0)：false，跳过';c.s1.style.opacity=ep(t,1.8,2.3);c.s2.innerHTML='第一列保持 1、6、0、0';c.s2.style.opacity=ep(t,3.2,3.8);c.code.set(t>1?17:null);}
  else{c.s1.innerHTML='if(firstRow0)：<b style="color:var(--red)">true</b>';c.s1.style.opacity=1;c.s2.innerHTML='第一行全部改成 0';c.s2.style.opacity=ep(t,6.8,7.2);c.code.set(t<6.8?20:22);}
  vis(c.okn,ep(t,9.8,10.4),10);
}});

/* 9 细节与小结 */
function mini(r,vals,x0,y0,w,pitch,fs,fn){
  return vals.map((row,i)=>row.map((v,j)=>{const e=H('div','cell',{left:x0+pitch*j,top:y0+pitch*i,width:w,height:w,fontSize:fs},r,String(v));const k=fn(i,j);if(k)e.classList.add(k);return e;}));
}
SC.push({title:'细节与小结',dur:22,caps:[
  [.3,7,'两个细节。第一：为什么要两个 bool？matrix[0][0] 同时是第一行和第一列的开头，一个格子记不下两件事。'],
  [7.2,14,'第二：为什么第一行、第一列最后才改？先改的话，第一行的标记全成了 0，每一列都会被清掉。'],
  [14.2,21.6,'一句话：把第一行和第一列当标记本。先记下它们自己，再打标记、按标记清零，最后处理它们。']],
build(r){
  const c={};
  c.L=H('div','card',{left:96,top:130,width:840,height:520},r);
  c.R=H('div','card',{left:984,top:130,width:840,height:520},r);
  c.l1=H('div','a hand',{left:136,top:152,fontSize:32},r,'细节一：为什么要两个 bool');
  c.lst=[H('div','mk',{left:128,top:222,width:66*4+60+16,height:76,opacity:.7},r),H('div','mk',{left:128,top:222,width:76,height:66*3+60+16,opacity:.7},r)];
  c.lg=mini(r,A0,136,230,60,66,26,cls0);
  c.ring=ring(r,74);putRing(c.ring,166,260,74);
  c.l2=H('div','a',{left:520,top:240,fontFamily:'var(--mono)',fontSize:28},r,'firstRow0 = <b style="color:var(--red)">true</b>');
  c.l3=H('div','a',{left:520,top:290,fontFamily:'var(--mono)',fontSize:28},r,'firstCol0 = false');
  c.l4=H('div','a',{left:520,top:360,width:380,whiteSpace:'normal',fontSize:25,lineHeight:1.5,color:'var(--graphite)'},r,'两个答案不一样，而 matrix[0][0] 只有一个格子');
  c.l5=H('div','a hand',{left:136,top:540,fontSize:32},r,'所以用两个 bool 分开记');
  c.r1=H('div','a hand',{left:1024,top:152,fontSize:32},r,'细节二：第一行、第一列最后才改');
  c.rh=[H('div','a',{left:1024,top:216,fontSize:26,fontWeight:700,color:'var(--red)'},r,'✗ 先清第一行'),H('div','a',{left:1430,top:216,fontSize:26,fontWeight:700,color:'var(--blue)'},r,'✓ 最后再清')];
  c.wg=mini(r,WRONG,1024,266,58,64,26,(i,j)=>cls0(i,j)||(WRONG[i][j]===0?'clr':''));
  c.og=mini(r,A3,1430,266,58,64,26,cls3);
  c.svg=S('svg',{class:'ov'},r);
  c.circ=penCircle(c.svg,1024+64*4+29,266+64+29,44,40,'var(--red)',3.6);
  c.r2=H('div','a hand',{left:1024,top:548,fontSize:30},r,'1 被误清了');
  c.r3=H('div','a',{left:1430,top:552,fontSize:24,color:'var(--graphite)'},r,'6 和 1 都保留');
  c.k1=H('div','a',{left:120,top:700,fontFamily:'var(--display)',fontSize:62,fontWeight:900},r,'第一行、第一列 = 标记本');
  c.k2=H('div','a hand',{left:124,top:796,fontSize:34},r,'记下它们自己 → 打标记 → 按标记清零 → 最后处理它们　　时间 O(m·n)，额外空间 O(1)');
  c.k3=H('div','a',{left:124,top:862,fontSize:24,color:'var(--graphite)'},r,'和 LC41 用正负号当标记是同一个想法：把题目给的数组自己当标记本');
  return c;
},
update(c,t){
  c.L.style.opacity=ep(t,.1,.6);vis(c.l1,ep(t,.2,.8),8);
  c.lst.forEach(e=>e.style.opacity=.7*ep(t,.9,1.5));c.lg.forEach((row,i)=>row.forEach((e,j)=>pop(e,ep(t,.6+.02*(i*N+j),1+.02*(i*N+j)))));
  c.ring.style.opacity=ep(t,2,2.5);
  vis(c.l2,ep(t,3,3.6),8);vis(c.l3,ep(t,3.6,4.2),8);vis(c.l4,ep(t,4.6,5.2),8);vis(c.l5,ep(t,5.6,6.2),8);
  c.R.style.opacity=ep(t,7,7.5);vis(c.r1,ep(t,7.2,7.8),8);
  vis(c.rh[0],ep(t,8,8.5),8);c.wg.forEach((row,i)=>row.forEach((e,j)=>pop(e,ep(t,8.2+.02*(i*N+j),8.6+.02*(i*N+j)))));
  c.circ.set(ep(t,9.6,10.3));vis(c.r2,ep(t,10.2,10.8),8);
  vis(c.rh[1],ep(t,11.2,11.7),8);c.og.forEach((row,i)=>row.forEach((e,j)=>pop(e,ep(t,11.4+.02*(i*N+j),11.8+.02*(i*N+j)))));vis(c.r3,ep(t,12.4,13),8);
  vis(c.k1,ep(t,14.4,15.1),12);vis(c.k2,ep(t,15.6,16.3),10);vis(c.k3,ep(t,17.4,18),8);
}});
