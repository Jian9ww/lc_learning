/* ---------- 数据：全程用 3 × 3 的例子 ---------- */
const N=3,B=[[1,2,3],[4,5,6],[7,8,9]];
const clone=a=>a.map(r=>r.slice());
const TR=a=>a.map((r,i)=>r.map((v,j)=>a[j][i]));            // 转置
const FH=a=>a.map(r=>r.slice().reverse());                  // 左右翻转（每行 reverse）
const FV=a=>a.slice().reverse().map(r=>r.slice());          // 上下翻转
const R90=a=>FH(TR(a)),R180=a=>FV(FH(a)),R270=a=>FV(TR(a));
const posOf=a=>{const p={};a.forEach((r,i)=>r.forEach((v,j)=>p[v]=[i,j]));return p;};
const swp=(a,i1,j1,i2,j2)=>{const b=clone(a);[b[i1][j1],b[i2][j2]]=[b[i2][j2],b[i1][j1]];return b;};
const revRow=(a,i)=>{const b=clone(a);b[i].reverse();return b;};
const TRS=a=>{const s1=swp(a,0,1,1,0),s2=swp(s1,0,2,2,0),s3=swp(s2,1,2,2,1);return [a,s1,s2,s3];};   // 转置的三步
const FHS=a=>{const s1=revRow(a,0),s2=revRow(s1,1),s3=revRow(s2,2);return [a,s1,s2,s3];};                // 逐行左右翻转
const rowCls=v=>'r'+Math.floor((v-1)/N);                    // 按“原来在第几行”上色

const CODE=[
'void rotate(vector<vector<int>>& matrix) {',
'    int n = matrix.size();',
'    for (int i = 0; i < n; i++) {',
'        for (int j = i + 1; j < n; j++) {',
'            swap(matrix[i][j], matrix[j][i]);',
'        }',
'        reverse(matrix[i].begin(), matrix[i].end());',
'    }',
'}'];

// 可移动的数字格子：每个数一个格子，位置由“当前矩阵”决定
function board(r,x0,y0,w,pitch,fs,idx){
  const g={els:{},lab:[],slots:[],w,pitch,x0,y0,x:j=>x0+pitch*j,y:i=>y0+pitch*i,cx:j=>x0+pitch*j+w/2,cy:i=>y0+pitch*i+w/2};
  for(let i=0;i<N;i++)for(let j=0;j<N;j++)g.slots.push(H('div','ghost',{left:g.x(j),top:g.y(i),width:w,height:w},r));
  if(idx){
    for(let j=0;j<N;j++)g.lab.push(H('div','a idx',{left:g.x(j),top:y0-32,width:w,fontSize:20},r,String(j)));
    for(let i=0;i<N;i++)g.lab.push(H('div','a idx',{left:x0-34,top:g.y(i)+w/2-13,width:24,fontSize:20},r,String(i)));
  }
  for(let v=1;v<=N*N;v++)g.els[v]=H('div','cell '+rowCls(v),{left:0,top:0,width:w,height:w,fontSize:fs},r,String(v));
  g.put=(v,i,j,dx=0,dy=0)=>{const e=g.els[v];e.style.left=(g.x(0)+pitch*j+dx)+'px';e.style.top=(g.y(0)+pitch*i+dy)+'px';};
  g.show=a=>{const p=posOf(a);for(const v in p){g.put(v,p[v][0],p[v][1]);g.els[v].style.zIndex=1;g.els[v].style.transform='';}};
  // 整块翻牌：axis='h' 左右翻转，'v' 上下翻转。中途压成一条线，再朝相反方向展开
  g.flip=(a,p,axis)=>{const P=posOf(a),c=(N-1)/2,k=Math.cos(Math.PI*p),sc=Math.max(.05,Math.abs(k));
    for(const v in P){const [i,j]=P[v],e=g.els[v];e.style.zIndex=1;
      if(axis==='h'){g.put(v,i,c+(j-c)*k);e.style.transform=`scaleX(${sc})`;}else{g.put(v,c+(i-c)*k,j);e.style.transform=`scaleY(${sc})`;}}};
  // 从矩阵 a 过渡到矩阵 b；移动的格子沿一条小弧线走，交换的两个格子会从两侧错开
  g.tween=(a,b,p,arc=.28,darc=.3)=>{const pa=posOf(a),pb=posOf(b);for(const v in pa){
    const [i0,j0]=pa[v],[i1,j1]=pb[v],di=i1-i0,dj=j1-j0,s=Math.sin(Math.PI*p)*((di&&dj)?darc:arc)*pitch;
    g.put(v,lerp(i0,i1,p),lerp(j0,j1,p),-di*s,dj*s);g.els[v].style.zIndex=(di||dj)?3:1;g.els[v].style.transform='';}};
  // 绕中心旋转 th 弧度（格子保持正立）
  g.rot=(a,th)=>{const p=posOf(a),c=(N-1)/2;for(const v in p){const y=p[v][0]-c,x=p[v][1]-c;
    g.put(v,c+x*Math.sin(th)+y*Math.cos(th),c+x*Math.cos(th)-y*Math.sin(th));}};
  g.opacity=f=>{for(const v in g.els)g.els[v].style.opacity=typeof f==='function'?f(+v):f;g.slots.forEach(e=>e.style.opacity=typeof f==='function'?f(1):f);g.lab.forEach(e=>e.style.opacity=typeof f==='function'?f(1):f);};
  g.hot=v=>{for(const q in g.els)g.els[q].classList.toggle('hot',+q===v);};
  return g;
}
// 按时间表依次播放矩阵状态：times[k] = [开始, 结束] 是 states[k] -> states[k+1] 的过渡
function play(g,states,times,t,arc,darc){
  let k=-1;for(let q=0;q<times.length;q++)if(t>=times[q][0])k=q;
  if(k<0){g.show(states[0]);return -1;}
  const p=pr(t,times[k][0],times[k][1]);
  if(p>=1)g.show(states[k+1]);else g.tween(states[k],states[k+1],ease(p),arc,darc);
  return k;
}
function run(g,steps,t,arc,darc){
  let k=-1;steps.forEach((x,q)=>{if(t>=x[0])k=q;});
  if(k<0){g.show(steps[0][2]);return;}
  const [t0,t1,a,b,kind]=steps[k],p=pr(t,t0,t1);
  if(p>=1){g.show(b);return;}
  if(kind)g.flip(a,ease(p),kind);else g.tween(a,b,ease(p),arc,darc);
}
function outline(r,color){return H('div','a',{border:'5px solid '+color,borderRadius:'10px',opacity:0,boxSizing:'border-box'},r);}
function putOutline(e,g,i0,j0,i1,j1,pad=8){Object.assign(e.style,{left:(g.x(j0)-pad)+'px',top:(g.y(i0)-pad)+'px',width:(g.pitch*(j1-j0)+g.w+2*pad)+'px',height:(g.pitch*(i1-i0)+g.w+2*pad)+'px'});}
function mini(r,a,x0,y0,w,pitch,fs){return a.map((row,i)=>row.map((v,j)=>H('div','cell '+rowCls(v),{left:x0+pitch*j,top:y0+pitch*i,width:w,height:w,fontSize:fs},r,String(v))));}

/* ================= 场景 ================= */
const SC=[];

/* 1 题目 */
SC.push({title:'题目',dur:11,caps:[
  [.5,5.2,'题目：把 n × n 的矩阵顺时针旋转 90°。必须原地修改，不能另开一个矩阵。'],
  [5.4,10.6,'例子：第一行 1 2 3，转完以后成了最右边一列。']],
build(r){
  const c={};
  c.eb=H('div','a',{left:140,top:190,fontFamily:'var(--mono)',fontSize:30,color:'var(--graphite)',letterSpacing:'.04em'},r,'LeetCode 48 · 矩阵 / 原地旋转');
  c.ti=H('div','a',{left:130,top:236,fontFamily:'var(--display)',fontSize:124,fontWeight:900,letterSpacing:'.02em',lineHeight:1.2},r,'旋转图像');
  c.sub=H('div','a',{left:140,top:416,fontSize:38},r,'一次旋转 = <b style="color:var(--blue)">两次翻转</b>');
  c.g=board(r,1130,290,130,146,56,false);
  c.svg=S('svg',{class:'ov'},r);
  const cx=c.g.cx(1),cy=c.g.cy(1),R=318,a0=-70*Math.PI/180,a1=-20*Math.PI/180;
  const ar=S('path',{d:`M${cx+R*Math.cos(a0)} ${cy+R*Math.sin(a0)} A${R} ${R} 0 0 1 ${cx+R*Math.cos(a1)} ${cy+R*Math.sin(a1)}`,fill:'none'},c.svg);
  Object.assign(ar.style,{stroke:'var(--red)',strokeWidth:5,strokeLinecap:'round'});c.arc=drawable(ar);
  const ex=cx+R*Math.cos(a1),ey=cy+R*Math.sin(a1),ta=a1+Math.PI/2;
  c.ah=S('path',{d:`M${ex+14*Math.cos(ta)} ${ey+14*Math.sin(ta)} L${ex-12*Math.cos(ta)-13*Math.sin(ta)} ${ey-12*Math.sin(ta)+13*Math.cos(ta)} L${ex-12*Math.cos(ta)+13*Math.sin(ta)} ${ey-12*Math.sin(ta)-13*Math.cos(ta)} Z`},c.svg);c.ah.style.fill='var(--red)';
  c.al=H('div','a hand',{left:1560,top:170,fontSize:38},r,'顺时针 90°');
  c.n1=H('div','a hand',{left:140,top:560,fontSize:42},r,'第一行 1 2 3　→　最右一列');
  c.n2=H('div','a',{left:140,top:640,fontSize:30,color:'var(--graphite)'},r,'原地修改：只能在这一个矩阵里换位置');
  return c;
},
update(c,t){
  vis(c.eb,ep(t,.2,.9),16);vis(c.ti,ep(t,.35,1.2),24);vis(c.sub,ep(t,.9,1.7),16);
  c.g.opacity(v=>ep(t,1.6+.05*v,2.1+.05*v));
  c.g.rot(B,ep(t,5.6,8.2)*Math.PI/2);
  c.arc.set(ep(t,4.6,5.6));c.ah.style.opacity=ep(t,5.4,5.7);c.al.style.opacity=ep(t,4.8,5.4);
  vis(c.n1,ep(t,8.4,9),10);vis(c.n2,ep(t,3,3.6),8);
}});

/* 2 每个数去了哪 */
SC.push({title:'每个数去了哪',dur:18,caps:[
  [.3,6,'先看每个数去了哪。第 0 行整行变成了最后一列，第 1 行变成中间一列，第 2 行变成第 0 列。'],
  [6.2,11.5,'也就是第 i 行去了第 n − 1 − i 列。行里从左到右的顺序，变成了列里从上到下。'],
  [11.7,17.6,'所以位置 (i, j) 上的数，转完以后在 (j, n − 1 − i)。比如 2 从 (0, 1) 到了 (1, 2)。']],
build(r){
  const c={};
  c.ha=H('div','a',{left:150,top:210,fontSize:26,color:'var(--graphite)'},r,'旋转前');
  c.hb=H('div','a',{left:680,top:210,fontSize:26,color:'var(--graphite)'},r,'旋转后');
  c.a=board(r,150,290,116,130,50,true);c.a.show(B);
  c.b=board(r,680,290,116,130,50,true);c.b.show(R90(B));
  c.arrow=H('div','a',{left:566,top:440,fontFamily:'var(--num)',fontSize:72,color:'var(--graphite)'},r,'→');
  const col=['var(--blue)','#B8860B','var(--red)'];
  c.oa=[0,1,2].map(i=>{const e=outline(r,col[i]);putOutline(e,c.a,i,0,i,2);return e;});
  c.ob=[0,1,2].map(i=>{const e=outline(r,col[i]);putOutline(e,c.b,0,2-i,2,2-i);return e;});
  c.ln=[0,1,2].map(i=>H('div','a',{left:1200,top:290+72*i,fontSize:36,color:col[i]},r,`第 ${i} 行　→　第 ${2-i} 列`));
  c.g1=H('div','a',{left:1200,top:536,fontFamily:'var(--mono)',fontSize:36},r,'第 i 行 → 第 n − 1 − i 列');
  c.g2=H('div','a',{left:1200,top:596,fontSize:28,color:'var(--graphite)'},r,'行里第 j 个　→　落在第 j 行');
  c.f=H('div','a',{left:150,top:740,fontFamily:'var(--display)',fontSize:66,fontWeight:900},r,'(i, j)　→　(j, n − 1 − i)');
  c.ex=H('div','a hand',{left:1200,top:756,fontSize:40},r,'2：(0, 1) → (1, 2)');
  return c;
},
update(c,t){
  vis(c.ha,ep(t,.2,.7),8);vis(c.hb,ep(t,.2,.7),8);c.a.opacity(ep(t,.2,.7));c.b.opacity(ep(t,.4,.9));c.arrow.style.opacity=ep(t,.4,.9);
  [0,1,2].forEach(i=>{const a=ep(t,1+1.6*i,1.5+1.6*i)*(1-ep(t,11.4,11.9));c.oa[i].style.opacity=a;c.ob[i].style.opacity=a;vis(c.ln[i],ep(t,1.2+1.6*i,1.8+1.6*i),0,-12);});
  vis(c.g1,ep(t,6.4,7),10);vis(c.g2,ep(t,8.6,9.2),8);
  vis(c.f,ep(t,11.9,12.6),12);vis(c.ex,ep(t,14,14.6),8);
  const h=t>=13.8?2:0;c.a.hot(h);c.b.hot(h);
}});

/* 3 拆成两步 */
SC.push({title:'拆成两步',dur:22,caps:[
  [.3,7.5,'直接按公式搬，每搬一个数都要找地方暂存。换个办法：拆成两个简单的动作。第一个是转置：行号和列号互换，沿主对角线翻折。'],
  [7.7,14,'第二个是行翻转：每一行左右倒过来，列号 j 变成 n − 1 − j。'],
  [14.2,21.6,'两步连起来：(i, j) 先到 (j, i)，再到 (j, n − 1 − i)。正好就是顺时针转 90° 的位置。']],
build(r){
  const c={};
  c.g=board(r,190,270,130,146,56,true);
  c.svg=S('svg',{class:'ov'},r);
  const dl=S('line',{x1:c.g.x(0)-14,y1:c.g.y(0)-14,x2:c.g.x(2)+144,y2:c.g.y(2)+144},c.svg);
  Object.assign(dl.style,{stroke:'var(--red)',strokeWidth:4,strokeDasharray:'12 9',strokeLinecap:'round',opacity:0});c.dl=dl;
  c.dn=H('div','a hand',{left:c.g.x(2)+100,top:c.g.y(2)+150,fontSize:30},r,'主对角线');
  c.st=H('div','a',{left:190,top:800,fontFamily:'var(--mono)',fontSize:32},r,'');
  const blk=(y,head,form,note)=>[H('div','a',{left:860,top:y,fontFamily:'var(--display)',fontSize:46,fontWeight:900},r,head),
    H('div','a',{left:1120,top:y+8,fontFamily:'var(--mono)',fontSize:36},r,form),H('div','a hand',{left:864,top:y+68,fontSize:32},r,note)];
  c.b1=blk(260,'① 转置','(i, j) → (j, i)','行号、列号互换：沿主对角线翻折');
  c.b2=blk(430,'② 行翻转','(i, j) → (i, n − 1 − j)','每一行左右倒过来');
  c.b3=blk(620,'合起来','(i, j) → (j, i) → (j, n − 1 − i)','正好是顺时针 90°');
  return c;
},
update(c,t){
  const A=TRS(B);
  c.g.opacity(ep(t,.2,.7));
  run(c.g,[[3.2,4.1,A[0],A[1]],[4.3,5.2,A[1],A[2]],[5.4,6.3,A[2],A[3]],[9.4,11.6,A[3],FH(A[3]),'h']],t);
  c.dl.style.opacity=ep(t,2,2.6)*(1-ep(t,7.4,8));c.dn.style.opacity=ep(t,2.4,3)*(1-ep(t,7.4,8));
  c.g.hot(t>=1.2?2:0);
  const pos=t<4.1?'(0, 1)':t<11.6?'(0, 1) → (1, 0)':'(0, 1) → (1, 0) → (1, 2)';
  c.st.innerHTML='2 的位置：'+pos;c.st.style.opacity=ep(t,1.2,1.8);
  c.b1.forEach((e,q)=>vis(e,ep(t,1.6+.3*q,2.2+.3*q),8));
  c.b2.forEach((e,q)=>vis(e,ep(t,7.9+.3*q,8.5+.3*q),8));
  c.b3.forEach((e,q)=>vis(e,ep(t,14.4+.5*q,15+.5*q),8));
}});

/* 4 跟着代码走一遍 */
const W4={T0:2.6,SD:3.2};
W4.steps=[{k:'swap',i:0,j:1},{k:'swap',i:0,j:2},{k:'rev',i:0},{k:'swap',i:1,j:2},{k:'rev',i:1},{k:'rev',i:2}];
W4.states=[B];W4.steps.forEach(s=>{const a=W4.states[W4.states.length-1];W4.states.push(s.k==='swap'?swp(a,s.i,s.j,s.j,s.i):revRow(a,s.i));});
W4.times=W4.steps.map((s,k)=>[W4.T0+W4.SD*k+.9,W4.T0+W4.SD*k+2.1]);W4.END=W4.T0+W4.SD*W4.steps.length;
SC.push({title:'跟着代码走一遍',dur:W4.END+4.2,caps:[
  [.3,2.4,'跟着代码走一遍。外层的 i 是行号。'],
  [W4.T0+.1,W4.T0+W4.SD*3-.1,'i = 0：把第 0 行右边的数，和第 0 列下面对应的数交换。第 0 行就转置好了，接着把它翻转。'],
  [W4.T0+W4.SD*3+.1,W4.T0+W4.SD*5-.1,'i = 1：只剩 6 和 8 要交换，然后翻转第 1 行。'],
  [W4.T0+W4.SD*5+.1,W4.END-.1,'i = 2：右边没有数了，不用交换，直接翻转第 2 行。'],
  [W4.END+.2,W4.END+4,'结果是 7 4 1、8 5 2、9 6 3，正是顺时针转 90° 的样子。']],
build(r){
  const c={};
  c.code=codePanel(r,96,170,CODE,22,42,'转置 + 行翻转（写在同一个循环里）');
  c.g=board(r,1040,270,124,140,54,true);
  c.o1=outline(r,'var(--red)');c.o2=outline(r,'var(--red)');
  c.s1=H('div','a',{left:1040,top:730,fontFamily:'var(--mono)',fontSize:28},r,'');
  c.s2=H('div','a',{left:1040,top:782,fontFamily:'var(--mono)',fontSize:28},r,'');
  return c;
},
update(c,t){
  const g=c.g;g.opacity(ep(t,.2,.7));
  play(g,W4.states,W4.times,t);
  const k=clamp(Math.floor((t-W4.T0)/W4.SD),-1,W4.steps.length),u=t-W4.T0-W4.SD*k;
  if(k>=0&&k<W4.steps.length){
    const s=W4.steps[k],a=W4.states[k],b=W4.states[k+1],on=ep(u,0,.3)*(1-ep(u,2.3,2.9));
    if(s.k==='swap'){putOutline(c.o1,g,s.i,s.j,s.i,s.j);putOutline(c.o2,g,s.j,s.i,s.j,s.i);c.o1.style.opacity=on;c.o2.style.opacity=on;
      c.s1.innerHTML=`i = ${s.i}，j = ${s.j}`;c.s2.innerHTML=`swap(matrix[${s.i}][${s.j}], matrix[${s.j}][${s.i}])　<b>${a[s.i][s.j]} ↔ ${a[s.j][s.i]}</b>`;c.code.set(4);}
    else{putOutline(c.o1,g,s.i,0,s.i,2);c.o1.style.opacity=on;c.o2.style.opacity=0;
      c.s1.innerHTML=`i = ${s.i}`+(s.i===2?'　j 从 3 开始，内层循环不执行':'');c.s2.innerHTML=`翻转第 ${s.i} 行：${a[s.i].join(' ')}　→　<b>${b[s.i].join(' ')}</b>`;c.code.set(6);}
    c.s1.style.opacity=1;c.s2.style.opacity=ep(u,.2,.6);
  }else{
    c.o1.style.opacity=0;c.o2.style.opacity=0;
    if(k<0){c.s1.innerHTML='n = 3';c.s1.style.opacity=ep(t,.8,1.4);c.s2.style.opacity=0;c.code.set(t<.8?null:t<1.6?1:2);}
    else{c.s1.innerHTML='循环结束';c.s1.style.opacity=1;c.s2.innerHTML='7 4 1 / 8 5 2 / 9 6 3';c.s2.style.opacity=1;c.code.set(null);}
  }
}});

/* 5 为什么 j 从 i + 1 开始 */
SC.push({title:'为什么 j 从 i + 1 开始',dur:12,caps:[
  [.3,6,'为什么内层 j 从 i + 1 开始？如果从 0 开始，每一对都会被交换两次，等于没换。'],
  [6.2,11.6,'只走对角线上方的格子，每一对正好交换一次。对角线上的数是自己和自己换，不用管。']],
build(r){
  const c={};
  c.h1=H('div','a',{left:200,top:200,fontSize:34,fontWeight:700,color:'var(--red)'},r,'✗ j 从 0 开始');
  c.h2=H('div','a',{left:1080,top:200,fontSize:34,fontWeight:700,color:'var(--blue)'},r,'✓ j 从 i + 1 开始');
  c.a=board(r,200,290,116,130,50,true);
  c.b=board(r,1080,290,116,130,50,true);c.b.show(B);
  c.s=H('div','a',{left:200,top:706,fontFamily:'var(--mono)',fontSize:28},r,'');
  c.n1=H('div','a hand',{left:200,top:760,fontSize:40},r,'换了两次，等于没换');
  c.up=[[0,1],[0,2],[1,2]].map(([i,j])=>{const e=outline(r,'var(--blue)');putOutline(e,c.b,i,j,i,j,6);return e;});
  c.svg=S('svg',{class:'ov'},r);
  const dl=S('line',{x1:c.b.x(0)-12,y1:c.b.y(0)-12,x2:c.b.x(2)+128,y2:c.b.y(2)+128},c.svg);
  Object.assign(dl.style,{stroke:'var(--red)',strokeWidth:4,strokeDasharray:'12 9',strokeLinecap:'round',opacity:0});c.dl=dl;
  c.n2=H('div','a hand',{left:1080,top:706,fontSize:38},r,'只走对角线上方：每一对只换一次');
  c.n3=H('div','a',{left:1080,top:770,fontSize:26,color:'var(--graphite)'},r,'对角线上 i = j，自己和自己换，不用管');
  return c;
},
update(c,t){
  const S1=swp(B,0,1,1,0);
  c.a.opacity(ep(t,.2,.7));c.b.opacity(ep(t,.2,.7));vis(c.h1,ep(t,.2,.8),8);vis(c.h2,ep(t,.2,.8),8);
  play(c.a,[B,S1,B],[[1.4,2.4],[3.3,4.3]],t);
  c.s.innerHTML=t<1.2?'':t<3.1?'i = 0，j = 1：交换 2 和 4':'i = 1，j = 0：又把 4 和 2 换回来';c.s.style.opacity=t>=1.2?1:0;
  vis(c.n1,ep(t,4.6,5.2),10);
  c.dl.style.opacity=ep(t,6.3,6.9);c.up.forEach((e,k)=>e.style.opacity=ep(t,6.8+.4*k,7.2+.4*k));
  vis(c.n2,ep(t,8,8.6),10);vis(c.n3,ep(t,9.4,10),8);
}});

/* 6 旋转 180° */
SC.push({title:'旋转 180°',dur:18,caps:[
  [.3,6,'思考题一：顺时针转 180°。位置 (i, j) 要去 (n − 1 − i, n − 1 − j)：行号、列号都倒过来。'],
  [6.2,12,'所以做两次翻转：先把每一行左右翻转，再把所有行上下翻转。不需要转置。'],
  [12.2,17.6,'reverse(matrix.begin(), matrix.end()) 就是上下翻转：它把“行”当成元素，整行整行地换位置。']],
build(r){
  const c={};
  c.g=board(r,190,270,130,146,56,true);
  c.ti=H('div','a',{left:860,top:210,fontFamily:'var(--display)',fontSize:56,fontWeight:900},r,'顺时针 180°');
  c.f=H('div','a',{left:864,top:296,fontFamily:'var(--mono)',fontSize:36},r,'(i, j) → (n − 1 − i, n − 1 − j)');
  c.b1=H('div','a hand',{left:864,top:392,fontSize:38},r,'① 左右翻转：列号倒过来');
  c.b2=H('div','a hand',{left:864,top:456,fontSize:38},r,'② 上下翻转：行号倒过来');
  c.c1=H('div','a',{left:864,top:560,fontFamily:'var(--mono)',fontSize:25},r,'<span class="kw">for</span> (<span class="kw">auto</span>&amp; row : matrix) reverse(row.begin(), row.end());');
  c.c2=H('div','a',{left:864,top:608,fontFamily:'var(--mono)',fontSize:25},r,'reverse(matrix.begin(), matrix.end());');
  c.mk=H('div','mk',{left:852,top:0,width:900,height:42,opacity:0},r);
  c.n=H('div','a',{left:864,top:690,fontSize:26,color:'var(--graphite)'},r,'连转两次 90° 也可以，但交换的次数多一倍');
  c.st=H('div','a',{left:190,top:800,fontFamily:'var(--mono)',fontSize:30},r,'');
  return c;
},
update(c,t){
  const S1=FH(B);
  c.g.opacity(ep(t,.2,.7));run(c.g,[[7,9.2,B,S1,'h'],[10.2,12.4,S1,FV(S1),'v']],t);
  vis(c.ti,ep(t,.3,.9),10);vis(c.f,ep(t,1.4,2),10);
  vis(c.b1,ep(t,6.4,7),8);vis(c.b2,ep(t,9.4,10),8);
  vis(c.c1,ep(t,12.3,12.9),8);vis(c.c2,ep(t,12.6,13.2),8);
  c.mk.style.top='604px';c.mk.style.width='640px';c.mk.style.opacity=.8*ep(t,13.4,13.9);
  vis(c.n,ep(t,15,15.6),8);
  c.st.innerHTML=t<9.2?'原矩阵':t<12.4?'左右翻转之后':'上下翻转之后：转了 180°';c.st.style.opacity=t>=7?1:ep(t,1,1.5);
}});

/* 7 逆时针 90° */
SC.push({title:'逆时针 90°',dur:18,caps:[
  [.3,6,'思考题二：顺时针转 270°，也就是逆时针转 90°。位置 (i, j) 要去 (n − 1 − j, i)。'],
  [6.2,12,'还是先转置，到 (j, i)。然后把行号倒过来：上下翻转，就到了 (n − 1 − j, i)。'],
  [12.2,17.6,'和顺时针 90° 只差最后一步：顺时针是左右翻转，逆时针是上下翻转。两步的顺序不能换。']],
build(r){
  const c={};
  c.g=board(r,190,270,130,146,56,true);
  c.ti=H('div','a',{left:860,top:210,fontFamily:'var(--display)',fontSize:56,fontWeight:900},r,'逆时针 90°（顺时针 270°）');
  c.f=H('div','a',{left:864,top:296,fontFamily:'var(--mono)',fontSize:36},r,'(i, j) → (n − 1 − j, i)');
  c.b1=H('div','a hand',{left:864,top:392,fontSize:38},r,'① 转置：(i, j) → (j, i)');
  c.b2=H('div','a hand',{left:864,top:456,fontSize:38},r,'② 上下翻转：(j, i) → (n − 1 − j, i)');
  c.cmp=[H('div','a',{left:864,top:568,fontSize:32},r,'顺时针 90°　=　转置　+　<b style="color:var(--blue)">左右翻转</b>'),
         H('div','a',{left:864,top:624,fontSize:32},r,'逆时针 90°　=　转置　+　<b style="color:var(--red)">上下翻转</b>')];
  c.n=H('div','a',{left:864,top:706,fontSize:26,color:'var(--graphite)'},r,'顺序换成“先左右翻转、再转置”，得到的也是逆时针 90°');
  c.st=H('div','a',{left:190,top:800,fontFamily:'var(--mono)',fontSize:30},r,'');
  return c;
},
update(c,t){
  const A=TRS(B);
  c.g.opacity(ep(t,.2,.7));run(c.g,[[7,7.7,A[0],A[1]],[7.8,8.5,A[1],A[2]],[8.6,9.3,A[2],A[3]],[10.2,12.4,A[3],FV(A[3]),'v']],t);
  vis(c.ti,ep(t,.3,.9),10);vis(c.f,ep(t,1.4,2),10);
  vis(c.b1,ep(t,6.4,7),8);vis(c.b2,ep(t,9.4,10),8);
  c.cmp.forEach((e,k)=>vis(e,ep(t,12.4+.5*k,13+.5*k),8));vis(c.n,ep(t,14.8,15.4),8);
  c.st.innerHTML=t<9.3?'原矩阵':t<12.4?'转置之后':'上下翻转之后：逆时针转了 90°';c.st.style.opacity=t>=7?1:ep(t,1,1.5);
}});

/* 8 另一种写法：四个一组轮换 */
SC.push({title:'另一种写法：四个一组',dur:18,caps:[
  [.3,6,'另一种写法：直接按位置公式搬。一个数搬走后，目标位置上的数也得搬，这样连下去，四个位置正好转一圈。'],
  [6.2,12,'所以四个一组轮换：先把一个存进临时变量，其余三个依次挪过去，最后把临时变量放回去。'],
  [12.2,17.6,'这种写法只遍历左上角的四分之一。两种写法都是时间 O(n²)、额外空间 O(1)；转置加翻转更不容易写错。']],
build(r){
  const c={};
  c.g=board(r,190,270,130,146,56,true);
  c.f=H('div','a',{left:800,top:214,fontFamily:'var(--mono)',fontSize:27},r,'(i, j) → (j, n−1−i) → (n−1−i, n−1−j) → (n−1−j, i) → (i, j)');
  c.fn=H('div','a hand',{left:800,top:262,fontSize:34},r,'四个位置转一圈，回到自己');
  const L=['int tmp = matrix[i][j];','matrix[i][j] = matrix[n-1-j][i];','matrix[n-1-j][i] = matrix[n-1-i][n-1-j];','matrix[n-1-i][n-1-j] = matrix[j][n-1-i];','matrix[j][n-1-i] = tmp;'];
  c.code=L.map((s,k)=>H('div','a',{left:800,top:370+52*k,fontFamily:'var(--mono)',fontSize:28},r,esc(s).replace(/\bint\b/,'<span class="kw">int</span>')));
  c.n1=H('div','a',{left:800,top:660,fontSize:26,color:'var(--graphite)'},r,'i 只走前 n / 2 行，j 只走前 (n + 1) / 2 列：遍历四分之一');
  c.n2=H('div','a hand',{left:800,top:716,fontSize:34},r,'两种写法都是时间 O(n²)，额外空间 O(1)');
  c.st=H('div','a',{left:190,top:800,fontFamily:'var(--mono)',fontSize:30},r,'');
  return c;
},
update(c,t){
  const S1=[[7,2,1],[4,5,6],[9,8,3]],S2=R90(B);
  c.g.opacity(ep(t,.2,.7));play(c.g,[B,S1,S2],[[3,5.4],[8,10.4]],t,-.1,-.16);
  vis(c.f,ep(t,1,1.6),8);vis(c.fn,ep(t,1.8,2.4),8);
  c.code.forEach((e,k)=>vis(e,ep(t,6.4+.35*k,7+.35*k),8));
  vis(c.n1,ep(t,12.4,13),8);vis(c.n2,ep(t,14.2,14.8),8);
  c.st.innerHTML=t<5.4?'四个角：1 → 3 → 9 → 7 的位置':t<10.4?'四条边的中点：2 → 6 → 8 → 4 的位置':'中心的 5 不动';c.st.style.opacity=ep(t,2.4,3);
}});

/* 9 小结 */
SC.push({title:'小结：一张表',dur:16,caps:[
  [.3,8,'小结：三种旋转都是两次翻转。顺时针 90° 是转置加左右翻转，180° 是左右加上下，逆时针 90° 是转置加上下翻转。'],
  [8.2,15.6,'记不住时，拿 3 × 3 手推一遍：先看行是不是变成了列，决定要不要转置；再看是左右翻转还是上下翻转。']],
build(r){
  const c={};
  c.hd=[['旋转',120],['位置变化',420],['做法',1010],['结果',1560]].map(([s,x])=>H('div','a',{left:x,top:150,fontSize:26,color:'var(--graphite)'},r,s));
  const rows=[['顺时针 90°','(i, j) → (j, n−1−i)','转置 + 左右翻转',R90(B)],['180°','(i, j) → (n−1−i, n−1−j)','左右翻转 + 上下翻转',R180(B)],['逆时针 90°','(i, j) → (n−1−j, i)','转置 + 上下翻转',R270(B)]];
  c.rows=rows.map(([a,b,d,m],k)=>{
    const y=200+174*k,g=H('div','a',{left:96,top:y,width:1730,height:174,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:24,top:56,fontFamily:'var(--display)',fontSize:44,fontWeight:900},g,a);
    H('div','a',{left:324,top:62,fontFamily:'var(--mono)',fontSize:30},g,b);
    H('div','a',{left:914,top:58,fontSize:36,color:'var(--blue)'},g,d);
    mini(g,m,1464,14,46,50,22);
    return g;
  });
  c.k=H('div','a',{left:120,top:748,fontFamily:'var(--display)',fontSize:64,fontWeight:900},r,'旋转 = 两次翻转');
  c.k2=H('div','a hand',{left:760,top:770,fontSize:36},r,'转置 · 左右翻转 · 上下翻转，三选二');
  c.k3=H('div','a',{left:124,top:846,fontSize:24,color:'var(--graphite)'},r,'只对 n × n 的方阵成立；全部是时间 O(n²)、额外空间 O(1)');
  return c;
},
update(c,t){
  c.hd.forEach((e,k)=>vis(e,ep(t,.2+.08*k,.8+.08*k),8));
  c.rows.forEach((g,k)=>vis(g,ep(t,1+1.8*k,1.6+1.8*k),10));
  vis(c.k,ep(t,8.4,9.1),12);vis(c.k2,ep(t,9.6,10.2),10);vis(c.k3,ep(t,11.4,12),8);
}});
