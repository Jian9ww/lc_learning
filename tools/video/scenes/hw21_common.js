/* =====================================================================
   HW21 核心路由器管理域规划（Bi-K-means）：四集动画共用的部分
   第一部分是算法模拟：和 ACM_test/HW/21.cpp 的逻辑逐句对应，另外把中间过程都记下来，
   动画里的每个数字都来自这里，不是手填的。
   第二部分是画图用的小工具。
   ===================================================================== */

/* ---------- 算法模拟（对应 21.cpp） ---------- */
// 对应 getSSENumerator：返回 n × SSE（整数，用 BigInt 保证精确）
function hwSseNum(pts){
  const n=BigInt(pts.length);let sx=0n,sy=0n,sq=0n;
  for(const p of pts){sx+=BigInt(p.x);sy+=BigInt(p.y);sq+=BigInt(p.x*p.x+p.y*p.y);}
  return sq*n-sx*sx-sy*sy;
}
// 对应 splitCluster：对一个簇做 K = 2 的 K-means。iters 里记下每一轮循环的全部中间量
function hwSplit(pts,br){
  const res={valid:false,iters:[]},n=pts.length;
  if(n<2){br.split_lt2++;return res;}
  let mi=0,ma=0;
  for(let i=1;i<n;i++){
    if(pts[i].x<pts[mi].x)mi=i;
    if(pts[i].x>pts[ma].x)ma=i;
  }
  res.minIndex=mi;res.maxIndex=ma;
  let c0={x:pts[mi].x,y:pts[mi].y},c1={x:pts[ma].x,y:pts[ma].y};
  let belong=new Array(n).fill(-1);
  while(true){
    const nb=new Array(n),d0s=[],d1s=[];
    for(let i=0;i<n;i++){
      const dx0=pts[i].x-c0.x,dy0=pts[i].y-c0.y,dx1=pts[i].x-c1.x,dy1=pts[i].y-c1.y;
      const d0=dx0*dx0+dy0*dy0,d1=dx1*dx1+dy1*dy1;
      d0s.push(d0);d1s.push(d1);
      if(d0<=d1){nb[i]=0;br[d0===d1?'assign_tie':'assign_0']++;}else{nb[i]=1;br.assign_1++;}
    }
    let same=true;
    for(let i=0;i<n;i++)if(belong[i]!==nb[i]){same=false;break;}
    let sx0=0,sy0=0,sx1=0,sy1=0,cnt0=0,cnt1=0;
    for(let i=0;i<n;i++){
      if(nb[i]===0){sx0+=pts[i].x;sy0+=pts[i].y;cnt0++;}else{sx1+=pts[i].x;sy1+=pts[i].y;cnt1++;}
    }
    if(cnt0===0||cnt1===0){br.empty_cluster++;return res;}
    const nc0={x:sx0/cnt0,y:sy0/cnt0},nc1={x:sx1/cnt1,y:sy1/cnt1};
    const move0=Math.hypot(nc0.x-c0.x,nc0.y-c0.y),move1=Math.hypot(nc1.x-c1.x,nc1.y-c1.y),maxMove=Math.max(move0,move1);
    const stop=same||maxMove<1e-6;
    res.iters.push({c0,c1,d0s,d1s,nb,prev:belong,same,cnt0,cnt1,sx0,sy0,sx1,sy1,nc0,nc1,move0,move1,maxMove,stop});
    belong=nb;c0=nc0;c1=nc1;
    if(stop){br[same?'stop_same':'stop_move']++;break;}
    br.loop_again++;
  }
  res.belong=belong;res.c0=c0;res.c1=c1;
  res.child0=pts.filter((p,i)=>belong[i]===0);res.child1=pts.filter((p,i)=>belong[i]===1);
  const pn=BigInt(n),n0=BigInt(res.child0.length),n1=BigInt(res.child1.length);
  res.parentNum=hwSseNum(pts);res.child0Num=hwSseNum(res.child0);res.child1Num=hwSseNum(res.child1);
  res.gradNum=res.parentNum*n0*n1-res.child0Num*pn*n1-res.child1Num*pn*n0;
  res.gradDen=pn*n0*n1;
  res.sseP=Number(res.parentNum)/n;res.sse0=Number(res.child0Num)/res.child0.length;res.sse1=Number(res.child1Num)/res.child1.length;
  res.grad=Number(res.gradNum)/Number(res.gradDen);
  res.valid=true;
  return res;
}
// 对应 compareGrad：交叉相乘比较两个分数
function hwCmp(a,b){const l=a.gradNum*b.gradDen,r=b.gradNum*a.gradDen;return l>r?1:l<r?-1:0;}
const hwSizes=cl=>cl.map(c=>c.pts.length).sort((a,b)=>b-a);
// 对应 main：返回每一轮的簇列表、每个候选的试拆结果、比较动作和输出
function hwRun(N,points){
  const br={split_lt2:0,assign_0:0,assign_tie:0,assign_1:0,empty_cluster:0,stop_same:0,stop_move:0,loop_again:0,
    skip_single:0,invalid:0,first:0,bigger:0,smaller:0,tie_size:0,tie_birth:0,tie_keep:0,no_candidate:0,split_done:0,loop_not_entered:0};
  const pts=points.map((p,i)=>({x:p[0],y:p[1],id:i}));
  let clusters=[{pts,birth:0}],birthCounter=1;
  const out=[hwSizes(clusters)],rounds=[];
  if(!(clusters.length<N))br.loop_not_entered++;
  while(clusters.length<N){
    let best=-1,bestSplit=null;const cands=[];
    for(let i=0;i<clusters.length;i++){
      if(clusters[i].pts.length<2){br.skip_single++;cands.push({i,act:'skip_single'});continue;}
      const cs=hwSplit(clusters[i].pts,br);
      if(!cs.valid){br.invalid++;cands.push({i,act:'invalid'});continue;}
      if(best===-1){best=i;bestSplit=cs;br.first++;cands.push({i,split:cs,act:'first'});continue;}
      const cmp=hwCmp(cs,bestSplit),vs=best;let act;
      if(cmp>0){best=i;bestSplit=cs;act='bigger';}
      else if(cmp===0){
        const curSize=clusters[i].pts.length,bestSize=clusters[best].pts.length;
        if(curSize>bestSize){best=i;bestSplit=cs;act='tie_size';}
        else if(curSize===bestSize&&clusters[i].birth<clusters[best].birth){best=i;bestSplit=cs;act='tie_birth';}
        else act='tie_keep';
      }else act='smaller';
      br[act]++;cands.push({i,split:cs,act,cmp,vs});
    }
    const before=clusters.slice();
    if(best===-1){br.no_candidate++;rounds.push({before,cands,best:-1});break;}
    clusters=clusters.filter((c,i)=>i!==best);
    clusters.push({pts:bestSplit.child0,birth:birthCounter++});
    clusters.push({pts:bestSplit.child1,birth:birthCounter++});
    br.split_done++;
    out.push(hwSizes(clusters));
    rounds.push({before,cands,best,split:bestSplit,after:clusters.slice(),sizes:hwSizes(clusters)});
  }
  return {N,pts,rounds,out,br,final:clusters};
}

/* ---------- 画图工具 ---------- */
// 簇的颜色：下标 = birth % 8。K-means 里 0 号子簇用蓝色（1），1 号子簇用红色（2）
const HWC=['#59636E','#2451C4','#CF3528','#1E8E5A','#B07A00','#7A3FB8','#0E7C86','#C2408C'];
const HWINK='#1B2631',HWDIM='#AFB7BD';
const HWN='ABCDEFGHIJKLMNOP';
const hwF=v=>String(Math.round(v*100)/100);          // 数字显示：最多两位小数
const hwP=p=>`(${hwF(p.x)}, ${hwF(p.y)})`;
function hwTxt(r,x,y,html,fs,css){return H('div','a',Object.assign({left:x,top:y,fontSize:fs||30},css||{}),r,html);}
function hwHand(r,x,y,html,fs,css){return H('div','a hand',Object.assign({left:x,top:y,fontSize:fs||36},css||{}),r,html);}
function hwMono(r,x,y,html,fs,css){return H('div','a',Object.assign({left:x,top:y,fontSize:fs||30,fontFamily:'var(--mono)'},css||{}),r,html);}
// 依次出现：第 k 个元素在 t0 + gap·k 开始淡入
function hwSeq(list,t,t0,gap,dy){list.forEach((e,k)=>vis(e,ep(t,t0+gap*k,t0+gap*k+.6),dy==null?8:dy));}
// 在 [a, b] 之间为 1，两端各用 .4 秒淡入淡出
const hwWin=(t,a,b)=>Math.min(ep(t,a,a+.4),1-ep(t,b-.4,b));

// 坐标平面。o：{x, y 左上角；u 一格多少像素；xmax、ymax 坐标范围；tick 每隔几格标一个数}
function hwPlane(r,o){
  const W=o.u*o.xmax,HH=o.u*o.ymax,pad=30;
  H('div','a',{left:o.x-pad-18,top:o.y-pad,width:W+2*pad+18,height:HH+2*pad+14,background:'rgba(255,255,255,.8)',border:'1.5px solid rgba(27,38,49,.16)',borderRadius:'10px'},r);
  const svg=S('svg',{class:'ov'},r),X=v=>o.x+v*o.u,Y=v=>o.y+HH-v*o.u,g0=S('g',{},svg),tk=o.tick||1;
  for(let i=0;i<=o.xmax;i++){const l=S('line',{x1:X(i),y1:Y(0),x2:X(i),y2:Y(o.ymax)},g0);l.style.stroke=i?'#DDE3E6':'#66707A';l.style.strokeWidth=i?1.5:2.5;
    if(i%tk===0){const tx=S('text',{x:X(i),y:Y(0)+25,'text-anchor':'middle'},g0,String(i));tx.style.fill='#66707A';tx.style.fontSize='18px';}}
  for(let j=0;j<=o.ymax;j++){const l=S('line',{x1:X(0),y1:Y(j),x2:X(o.xmax),y2:Y(j)},g0);l.style.stroke=j?'#DDE3E6':'#66707A';l.style.strokeWidth=j?1.5:2.5;
    if(j&&j%tk===0){const tx=S('text',{x:X(0)-12,y:Y(j)+6,'text-anchor':'end'},g0,String(j));tx.style.fill='#66707A';tx.style.fontSize='18px';}}
  const ax=S('text',{x:X(o.xmax)+14,y:Y(0)+7},g0,'x');ax.style.fill='#66707A';ax.style.fontSize='20px';
  const ay=S('text',{x:X(0),y:Y(o.ymax)-10,'text-anchor':'middle'},g0,'y');ay.style.fill='#66707A';ay.style.fontSize='20px';
  return {o,svg,X,Y,W,HH,gUnder:S('g',{},svg),gLink:S('g',{},svg),gPt:S('g',{},svg),gCen:S('g',{},svg),gTop:S('g',{},svg)};
}
// 一个点：圆点 + 名字。opt：{dx, dy 名字相对圆心的位置；coord 是否带坐标；r 半径；fs 字号}
function hwPt(pl,p,name,opt){
  opt=opt||{};const g=S('g',{},pl.gPt),cx=pl.X(p.x),cy=pl.Y(p.y);
  const c=S('circle',{cx,cy,r:opt.r||13},g);c.style.stroke='#F4F5F0';c.style.strokeWidth=3;
  const tx=S('text',{x:cx+(opt.dx==null?20:opt.dx),y:cy+(opt.dy==null?-19:opt.dy),class:'halo'},g,name+(opt.coord?` (${p.x}, ${p.y})`:''));
  tx.style.fontSize=(opt.fs||22)+'px';tx.style.fontFamily='var(--body)';tx.style.fontWeight=700;
  if(opt.anchor)tx.setAttribute('text-anchor',opt.anchor);
  const e={g,c,tx,p,cx,cy,set(col,al,k){c.style.fill=col;tx.style.fill=col;g.style.opacity=al==null?1:al;c.style.transform=(k==null||k===1)?'':`scale(${k})`;}};
  e.set(HWINK);return e;
}
// 质心标记：一个圈加十字，可以移动
function hwCen(pl,col,name){
  const g=S('g',{},pl.gCen);
  const bg=S('circle',{cx:0,cy:0,r:21,fill:'none'},g);bg.style.stroke='#F4F5F0';bg.style.strokeWidth=10;
  const ring=S('circle',{cx:0,cy:0,r:21,fill:'none'},g);ring.style.stroke=col;ring.style.strokeWidth=5;
  const cr=S('path',{d:'M-9 0H9M0 -9V9',fill:'none'},g);cr.style.stroke=col;cr.style.strokeWidth=4;cr.style.strokeLinecap='round';
  const tx=S('text',{x:24,y:34,class:'halo'},g,name);tx.style.fill=col;tx.style.fontSize='22px';tx.style.fontWeight=700;tx.style.fontFamily='var(--body)';
  g.style.opacity=0;
  return {g,tx,ring,cr,set(x,y,al,sc){g.setAttribute('transform',`translate(${pl.X(x)} ${pl.Y(y)})`+(sc?` scale(${sc})`:''));g.style.opacity=al==null?1:al;},
    label(s,dx,dy,anchor){tx.textContent=s;if(dx!=null){tx.setAttribute('x',dx);tx.setAttribute('y',dy);}if(anchor)tx.setAttribute('text-anchor',anchor);},color(c2){ring.style.stroke=c2;cr.style.stroke=c2;tx.style.fill=c2;}};
}
function hwLine(parent,w,dash){const l=S('line',{x1:0,y1:0,x2:0,y2:0},parent);l.style.strokeWidth=w||3;l.style.strokeLinecap='round';if(dash)l.style.strokeDasharray=dash;l.style.opacity=0;
  return {l,set(x1,y1,x2,y2,col,al){l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);if(col)l.style.stroke=col;l.style.opacity=al==null?1:al;}};}
// 两个质心的中垂线落在坐标框里的那一段（数据坐标）；框外返回 null
function hwBisSeg(o,c0,c1){
  const mx=(c0.x+c1.x)/2,my=(c0.y+c1.y)/2,dx=-(c1.y-c0.y),dy=c1.x-c0.x;let a0=-1e9,a1=1e9,ok=true;
  const clip=(p,d,lo,hi)=>{if(Math.abs(d)<1e-12){if(p<lo||p>hi)ok=false;return;}let a=(lo-p)/d,b=(hi-p)/d;if(a>b){const s=a;a=b;b=s;}a0=Math.max(a0,a);a1=Math.min(a1,b);};
  clip(mx,dx,-.25,o.xmax+.25);clip(my,dy,-.25,o.ymax+.25);
  if(!ok||a0>=a1)return null;
  return [mx+dx*a0,my+dy*a0,mx+dx*a1,my+dy*a1];
}

/* K-means 演示器：一个平面 + 点 + 两个质心 + 归属连线 + 中垂线。
   view(k, a, u)：第 k 轮循环（从 0 数），已经给前 a 个点分好了簇（a 可以带小数，表示正在连线），
   质心更新进度 u（0 = 还在这一轮分配时的位置，1 = 已经移到新的平均位置）。 */
function hwKm(r,pts,sp,o){
  const pl=hwPlane(r,o),lab=o.lab||{};
  const bis=hwLine(pl.gUnder,3,'10 9'),links=pts.map(()=>hwLine(pl.gLink,3.5));
  const P=pts.map((p,i)=>hwPt(pl,p,HWN[p.id],Object.assign({coord:o.coord},lab[i]||{})));
  const C=[hwCen(pl,HWC[1],'c0'),hwCen(pl,HWC[2],'c1')];
  const hot=S('circle',{cx:0,cy:0,r:26,fill:'none'},pl.gTop);hot.style.stroke='#FFB800';hot.style.strokeWidth=6;hot.style.opacity=0;
  const km={pl,P,C,links,bis,pts,sp,
    focus(i,al){if(i==null||i<0||i>=pts.length){hot.style.opacity=0;return;}hot.setAttribute('cx',P[i].cx);hot.setAttribute('cy',P[i].cy);hot.style.opacity=al==null?1:al;},
    view(k,a,u,v){
      v=v||{};const it=sp.iters[k],cc=[{x:lerp(it.c0.x,it.nc0.x,u),y:lerp(it.c0.y,it.nc0.y,u)},{x:lerp(it.c1.x,it.nc1.x,u),y:lerp(it.c1.y,it.nc1.y,u)}];
      const cenA=v.cen==null?1:v.cen;
      C[0].set(cc[0].x,cc[0].y,cenA);C[1].set(cc[1].x,cc[1].y,cenA);
      pts.forEach((p,i)=>{
        const f=clamp(a-i),old=it.prev[i];                    // f：这个点在这一轮的连线进度
        if(f>0){const c=cc[it.nb[i]];P[i].set(HWC[it.nb[i]+1]);links[i].set(P[i].cx,P[i].cy,lerp(P[i].cx,pl.X(c.x),f),lerp(P[i].cy,pl.Y(c.y),f),HWC[it.nb[i]+1],.9);}
        else if(old>=0){const c=cc[old];P[i].set(HWC[old+1]);links[i].set(P[i].cx,P[i].cy,pl.X(c.x),pl.Y(c.y),HWC[old+1],v.oldLink==null?.28:v.oldLink);}
        else{P[i].set(HWINK);links[i].set(0,0,0,0,null,0);}
      });
      const sg=hwBisSeg(o,cc[0],cc[1]),ba=v.bis==null?0:v.bis;
      if(sg&&ba>0)bis.set(pl.X(sg[0]),pl.Y(sg[1]),pl.X(sg[2]),pl.Y(sg[3]),'#66707A',ba);else bis.set(0,0,0,0,null,0);
    }};
  return km;
}
// 分配表：每个点到两个质心的距离平方和归属。show(a)：显示前 a 行
function hwKmTab(r,x,y,pts,it,o){
  o=o||{};const rh=o.rh||50,fs=o.fs||26,cw=o.cw||[110,170,170,190],xs=[0];cw.forEach(w=>xs.push(xs[xs.length-1]+w));
  const hd=['点','到 c0 距离²','到 c1 距离²','归属'].map((s,k)=>H('div','a',{left:x+xs[k],top:y,width:cw[k],textAlign:'center',fontSize:22,color:'var(--graphite)'},r,s));
  H('div','a',{left:x,top:y+36,width:xs[4],height:2,background:'rgba(27,38,49,.25)'},r);
  const rows=pts.map((p,i)=>{
    const g=H('div','a',{left:x,top:y+44+rh*i,width:xs[4],height:rh,opacity:0},r),b=it.nb[i],tie=it.d0s[i]===it.d1s[i],chg=it.prev[i]>=0&&it.prev[i]!==b;
    if(chg||tie)H('div','mk',{left:-8,top:5,width:xs[4]+16,height:rh-10},g);
    H('div','a',{left:xs[0],top:6,width:cw[0],textAlign:'center',fontSize:fs,fontWeight:700,lineHeight:'38px'},g,HWN[p.id]);
    H('div','a',{left:xs[1],top:6,width:cw[1],textAlign:'center',fontSize:fs,fontFamily:'var(--num)',lineHeight:'38px',fontWeight:b===0?700:400,color:b===0?HWC[1]:'var(--graphite)'},g,hwF(it.d0s[i]));
    H('div','a',{left:xs[2],top:6,width:cw[2],textAlign:'center',fontSize:fs,fontFamily:'var(--num)',lineHeight:'38px',fontWeight:b===1?700:400,color:b===1?HWC[2]:'var(--graphite)'},g,hwF(it.d1s[i]));
    H('div','a',{left:xs[3],top:6,width:cw[3],textAlign:'center',fontSize:fs,fontWeight:700,lineHeight:'38px',color:HWC[b+1]},g,b+' 号'+(tie?'（平局）':chg?'（变了）':''));
    return g;});
  return {rows,hd,w:xs[4],h:44+rh*pts.length,show(a){rows.forEach((g,i)=>vis(g,clamp(a-i),6));}};
}
// 簇列表：一排小卡片，每张是一个簇（成员 + birth）。clusters：[{pts, birth}]
function hwChips(r,x,y,clusters,o){
  o=o||{};const box=H('div','a',{left:x,top:y,display:'flex',gap:(o.gap||14)+'px',alignItems:'flex-start'},r);
  const els=clusters.map((c,i)=>{
    const col=HWC[c.birth%8],e=H('div','',{border:'3px solid '+col,borderRadius:'10px',padding:'6px 14px 4px',background:'rgba(255,255,255,.85)',textAlign:'center',position:'relative'},box);
    H('div','',{fontSize:o.fs||28,fontWeight:700,color:col,letterSpacing:'.08em',lineHeight:1.3},e,c.pts.map(p=>HWN[p.id]).join(''));
    H('div','',{fontSize:o.fs2||17,color:'var(--graphite)',fontFamily:'var(--mono)',lineHeight:1.4},e,(o.idx?`[${i}] `:'')+'birth '+c.birth);
    return e;});
  return {box,els};
}
// 代码面板：可以高亮连续的几行。set(a, b)：高亮第 a 到 b 行（从 0 数）；set(null) 取消
const HWKW=/\b(int|long|double|bool|void|const|struct|for|while|if|else|return|break|continue|true|false|vector|__int128|auto)\b/g;
function hwCode(r,x,y,lines,fs,lh,title,w){
  const box=H('div','code',{left:x,top:y,fontSize:fs,lineHeight:lh+'px'},r);if(w)box.style.width=w+'px';
  if(title)H('div','code-title',null,box,title);
  const hl=H('div','code-hl',{height:lh},box);
  const els=lines.map(l=>{
    if(!l)return H('div','cl',null,box,' ');
    const k=l.indexOf('//'),code=k<0?l:l.slice(0,k),cm=k<0?'':l.slice(k);
    return H('div','cl',null,box,esc(code).replace(HWKW,'<span class="kw">$1</span>')+(cm?`<span style="color:#7C8791">${esc(cm)}</span>`:''));});
  let key;
  return {box,els,set(a,b){
    const kk=a==null?'x':a+'-'+b;if(kk===key)return;key=kk;
    if(a==null){hl.style.opacity=0;return;}
    if(b==null)b=a;hl.style.opacity=.95;hl.style.top=els[a].offsetTop+'px';hl.style.height=(els[b].offsetTop-els[a].offsetTop+lh)+'px';
  }};
}
// 可以滚动的代码面板：只显示 rows 行，scroll(top) 让第 top 行（可以带小数）在最上面；set(a, b) 高亮第 a 到 b 行
function hwScroll(r,x,y,lines,fs,lh,rows,title,w){
  const box=H('div','code',{left:x,top:y,fontSize:fs,lineHeight:lh+'px',width:w},r);
  if(title)H('div','code-title',null,box,title);
  const vp=H('div','',{position:'relative',height:rows*lh,overflow:'hidden'},box),inner=H('div','',{position:'absolute',left:0,top:0,right:0},vp);
  const hl=H('div','code-hl',{height:lh,left:-10,right:-10},inner);
  const els=lines.map(l=>{
    if(!l)return H('div','cl',null,inner,' ');
    const k=l.indexOf('//'),code=k<0?l:l.slice(0,k),cm=k<0?'':l.slice(k);
    return H('div','cl',null,inner,esc(code).replace(HWKW,'<span class="kw">$1</span>')+(cm?`<span style="color:#7C8791">${esc(cm)}</span>`:''));});
  const maxTop=Math.max(0,lines.length-rows);let key;
  return {box,els,rows,
    set(a,b){const kk=a==null?'x':a+'-'+b;if(kk===key)return;key=kk;
      if(a==null){hl.style.opacity=0;return;}
      if(b==null)b=a;hl.style.opacity=.95;hl.style.top=a*lh+'px';hl.style.height=(b-a+1)*lh+'px';},
    scroll(top){inner.style.transform=`translateY(${-clamp(top,0,maxTop)*lh}px)`;}};
}
// 箭头（SVG）
function hwArrow(svg,x1,y1,x2,y2,color,w){
  const g=S('g',{},svg),ln=S('line',{x1,y1,x2,y2},g);Object.assign(ln.style,{stroke:color,strokeWidth:w||5,strokeLinecap:'round'});
  const a=Math.atan2(y2-y1,x2-x1),L=20,W=10,bx=x2-L*Math.cos(a),by=y2-L*Math.sin(a);
  const h=S('path',{d:`M${x2+6*Math.cos(a)} ${y2+6*Math.sin(a)} L${bx-W*Math.sin(a)} ${by+W*Math.cos(a)} L${bx+W*Math.sin(a)} ${by-W*Math.cos(a)} Z`},g);h.style.fill=color;
  g.style.opacity=0;return g;
}
// 用例数据（和 ACM_test/HW/21_cases/ 里的文件相同）
const HWD={
  s1:{N:2,pts:[[1,1],[2,2],[6,6]]},
  two:{N:2,pts:[[2,3],[5,5]]},
  tie:{N:2,pts:[[0,2],[4,0],[8,2]]},
  k6:{N:6,pts:[[0,6],[2,0],[4,0],[9,1],[10,5],[11,0]]},
  seed:{N:2,pts:[[6,0],[7,0],[8,6],[9,6],[10,6],[11,0]]},
  small:{N:3,pts:[[0,0],[1,0],[2,0],[3,0],[10,0],[16,0]]},
  tieBig:{N:3,pts:[[0,0],[2,2],[10,0],[11,0],[12,0],[13,0]]},
  tieSame:{N:3,pts:[[0,0],[1,0],[10,0],[11,0]]},
  nGtL:{N:5,pts:[[1,1],[2,2],[6,6]]}};
const hwRunOf=k=>hwRun(HWD[k].N,HWD[k].pts);

/* ================= 场景 ================= */
const SC=[];
