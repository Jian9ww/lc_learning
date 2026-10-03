/* ---------- 数据：全程用同一个例子 ---------- */
const NUMS=[3,4,-1,1],N=NUMS.length;
const CLEAN=NUMS.map(v=>(v<=0||v>N)?N+1:v);          // 第一步之后
const MARK=[CLEAN.slice()],STEPS=[];                  // MARK[s] = 第二步处理完前 s 个数之后的数组
for(let i=0;i<N;i++){
  const a=MARK[i].slice(),cur=Math.abs(a[i]),ok=cur<=N;
  let tgt=null,before=null;
  if(ok){tgt=cur-1;before=a[tgt];a[tgt]=-Math.abs(a[tgt]);}
  STEPS.push({i,raw:MARK[i][i],cur,ok,tgt,before,after:ok?a[tgt]:null});
  MARK.push(a);
}
const FINAL=MARK[N];
const ANS=(()=>{for(let i=0;i<N;i++)if(FINAL[i]>0)return i+1;return N+1;})();
const fmt=v=>v<0?'−'+(-v):String(v);

const CODE=[
'int firstMissingPositive(vector<int>& nums) {',
'    int n = nums.size();',
'',
'    for(int i = 0; i < n; i++){',
'        if(nums[i] <= 0 || nums[i] > n) nums[i] = n + 1;',
'    }',
'',
'    for(int i = 0; i < n; i++){',
'        int cur_num = abs(nums[i]);',
'        if(cur_num <= n){',
'            nums[cur_num - 1] = -abs(nums[cur_num - 1]);',
'        }',
'    }',
'',
'    for(int i = 0; i < n; i++){',
'        if(nums[i] > 0) return i + 1;',
'    }',
'    return n + 1;',
'}'];

// 一行数组格子；mark=true 时负数按“标记”样式显示
function row(r,vals,x0,y,w,h,pitch,fs,ifs=22,mark=true){
  const cells=vals.map((v,i)=>H('div','cell',{left:x0+pitch*i,top:y,width:w,height:h,fontSize:fs},r,''));
  const idx=vals.map((v,i)=>H('div','a idx',{left:x0+pitch*i,top:y+h+6,width:w,fontSize:ifs},r,String(i)));
  const o={cells,idx,y,w,h,x:i=>x0+pitch*i,cx:i=>x0+pitch*i+w/2,
    set(i,v){const e=cells[i],s=fmt(v);if(e.textContent!==s)e.textContent=s;e.classList.toggle('neg',mark&&v<0);}};
  vals.forEach((v,i)=>o.set(i,v));
  return o;
}
// “下标 i 负责数字 i + 1”的小标签
function duty(r,rw,y,fs=24){
  return rw.cells.map((e,i)=>H('div','a',{left:rw.x(i),top:y,width:rw.w,textAlign:'center',fontSize:fs,color:'var(--blue)'},r,'负责 '+(i+1)));
}
// 弧形箭头：从 (x1,y1) 到 (x2,y2)，cy 是弧顶控制点的高度
function arrow(svg,x1,y1,x2,y2,cy,color){
  const cx=(x1+x2)/2,g=S('g',{},svg);
  const p=S('path',{d:`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`,fill:'none'},g);
  Object.assign(p.style,{stroke:color,strokeWidth:4,strokeLinecap:'round'});
  const d=drawable(p),ang=Math.atan2(y2-cy,x2-cx),L=20,W=10;
  const bx=x2-L*Math.cos(ang),by=y2-L*Math.sin(ang);
  const h=S('path',{d:`M${x2} ${y2} L${bx-W*Math.sin(ang)} ${by+W*Math.cos(ang)} L${bx+W*Math.sin(ang)} ${by-W*Math.cos(ang)} Z`},g);
  h.style.fill=color;h.style.opacity=0;
  return {g,set(pp,hp){d.set(pp);h.style.opacity=hp;}};
}

/* ================= 场景 ================= */
const SC=[];

/* 1 题目 */
SC.push({title:'题目',dur:11,caps:[
  [.5,5.2,'题目：找出数组里没有出现的最小正整数。要求时间 O(n)，额外空间 O(1)。'],
  [5.4,10.7,'例子：nums = [3, 4, −1, 1]。1 出现了，2 没出现，所以答案是 2。']],
build(r){
  const c={};
  c.eb=H('div','a',{left:164,top:190,fontFamily:'var(--mono)',fontSize:30,color:'var(--graphite)',letterSpacing:'.04em'},r,'LeetCode 41 · 数组 / 原地标记');
  c.ti=H('div','a',{left:154,top:236,fontFamily:'var(--display)',fontSize:124,fontWeight:900,letterSpacing:'.02em',lineHeight:1.2},r,'缺失的第一个正数');
  c.sub=H('div','a',{left:164,top:416,fontSize:38},r,'不另开数组，怎么记住 <b style="color:var(--blue)">哪些数出现过</b>');
  c.arr=row(r,NUMS,164,556,120,120,136,56,24,false);
  c.pl=H('div','a',{left:880,top:476,fontSize:24,color:'var(--graphite)'},r,'正整数，从小到大');
  c.ps=[1,2,3,4,5].map((v,k)=>H('div','a',{left:880+160*k,top:556,width:120,textAlign:'center',fontFamily:'var(--num)',fontSize:88,lineHeight:1.1},r,String(v)));
  c.tk=[1,2,3,4,5].map((v,k)=>{const has=NUMS.includes(v);
    return H('div','a',{left:880+160*k,top:668,width:120,textAlign:'center',fontSize:26,color:has?'var(--blue)':'var(--red)'},r,has?'出现了':'没出现');});
  c.svg=S('svg',{class:'ov'},r);
  c.circ=penCircle(c.svg,880+160+60,604,74,62,'var(--red)',4);
  c.note=H('div','a hand',{left:880,top:764,fontSize:42},r,'最小的“没出现”是 2　→　答案 2');
  return c;
},
update(c,t){
  vis(c.eb,ep(t,.2,.9),16);vis(c.ti,ep(t,.35,1.2),24);vis(c.sub,ep(t,.9,1.7),16);
  c.arr.cells.forEach((e,i)=>pop(e,ep(t,1.7+.12*i,2.2+.12*i)));
  c.arr.idx.forEach((e,i)=>e.style.opacity=ep(t,1.9+.12*i,2.4+.12*i));
  c.pl.style.opacity=ep(t,5.5,6);
  c.ps.forEach((e,k)=>vis(e,ep(t,5.6+.15*k,6.1+.15*k)*(k===4?.45:1),12));
  c.tk.forEach((e,k)=>vis(e,ep(t,6.6+.3*k,7+.3*k)*(k===4?.45:1),-8));
  c.circ.set(ep(t,8.4,9.1));vis(c.note,ep(t,9.2,9.8),10);
}});

/* 2 答案的范围 */
SC.push({title:'答案的范围',dur:20,caps:[
  [.3,6,'先看答案可能有多大。数组有 n = 4 个数，最多把 1、2、3、4 全占满。'],
  [6.2,11.5,'全占满时，答案是 n + 1 = 5。只要缺一个，答案就是缺的里面最小的。'],
  [11.7,19.6,'所以答案只可能是 1 到 n + 1。小于等于 0 的数、大于 n 的数，都不用管。']],
build(r){
  const c={},SX=k=>470+150*(k-1),RY=[206,386,566];
  c.hd=[H('div','a',{left:470,top:146,fontSize:24,color:'var(--graphite)'},r,'1 到 n 的“座位”（n = 4）'),
        H('div','a',{left:1100,top:146,fontSize:24,color:'var(--graphite)'},r,'n + 1'),
        H('div','a',{left:1270,top:146,fontSize:24,color:'var(--graphite)'},r,'用不上的数'),
        H('div','a',{left:1560,top:146,fontSize:24,color:'var(--graphite)'},r,'答案')];
  const data=[
    {label:'[2, 1, 4, 3]',have:[2,1,4,3],junk:'',jn:'',res:'5',rn:'全占满，n + 1',miss:5},
    {label:'[3, 4, −1, 1]',have:[3,4,1],junk:'−1',jn:'小于等于 0',res:'2',rn:'缺 2',miss:2},
    {label:'[7, 8, 9, 11]',have:[],junk:'7  8  9  11',jn:'都大于 n',res:'1',rn:'缺 1',miss:1}];
  const seat=(x,y,txt)=>{const g=H('div','ghost',{left:x,top:y,width:120,height:100},r);
    H('div',null,{width:'100%',textAlign:'center',lineHeight:'97px',fontFamily:'var(--num)',fontSize:40,color:'var(--faint)'},g,txt);return g;};
  c.rows=data.map((d,q)=>{
    const y=RY[q],o={};
    o.label=H('div','a',{left:120,top:y+26,fontFamily:'var(--mono)',fontSize:34},r,d.label);
    o.seats=[1,2,3,4].map(k=>seat(SX(k),y,String(k)));
    o.s5=seat(1100,y,'5');
    o.fill=d.have.map(v=>H('div','cell',{left:SX(v),top:y,width:120,height:100,fontSize:46,opacity:0},r,String(v)));
    o.miss=H('div','a',{left:(d.miss===5?1100:SX(d.miss))-5,top:y-5,width:130,height:110,border:'4px solid var(--red)',borderRadius:'9px',opacity:0},r);
    o.junk=H('div','a',{left:1270,top:y+10,fontFamily:'var(--num)',fontSize:44,color:'var(--faint)'},r,d.junk);
    o.jn=H('div','a',{left:1270,top:y+68,fontSize:22,color:'var(--graphite)'},r,d.jn);
    o.res=H('div','a',{left:1560,top:y+2,fontFamily:'var(--num)',fontSize:84,color:'var(--red)',lineHeight:1.1},r,d.res);
    o.rn=H('div','a hand',{left:1630,top:y+34,fontSize:30},r,d.rn);
    return o;
  });
  c.k1=H('div','a',{left:120,top:740,fontFamily:'var(--display)',fontSize:58,fontWeight:900},r,'答案只可能是 1 到 n + 1');
  c.k2=H('div','a hand',{left:124,top:826,fontSize:40},r,'只需要记住：1 到 n，每个数出现过没有');
  return c;
},
update(c,t){
  c.hd.forEach((e,k)=>vis(e,ep(t,.3+.1*k,.9+.1*k),8));
  const T=[1,7.4,12],R=[5.6,10,13.8];
  c.rows.forEach((o,q)=>{
    const a=T[q];
    vis(o.label,ep(t,a,a+.5),10);
    o.seats.forEach((g,k)=>g.style.opacity=ep(t,a+.1+.05*k,a+.5+.05*k));
    o.s5.style.opacity=ep(t,a+.3,a+.7);
    o.fill.forEach((e,k)=>pop(e,ep(t,a+.8+.45*k,a+1.2+.45*k)));
    vis(o.junk,ep(t,a+.9,a+1.4),0,16);o.jn.style.opacity=ep(t,a+1.2,a+1.7);
    o.miss.style.opacity=ep(t,R[q],R[q]+.4);
    vis(o.res,ep(t,R[q]+.3,R[q]+.8),0,-16);vis(o.rn,ep(t,R[q]+.6,R[q]+1.1),8);
  });
  vis(c.k1,ep(t,15,15.7),12);vis(c.k2,ep(t,16.4,17.1),10);
}});

/* 3 用正负号当标记 */
SC.push({title:'用正负号当标记',dur:28,caps:[
  [.3,6.3,'要记住 1 到 n 出现过没有，需要 n 个标记。nums 自己正好有 n 个位置。'],
  [6.5,12.8,'约定：下标 0 负责 1，下标 1 负责 2……数字 x 归下标 x − 1 管。'],
  [13,20.5,'标记就用正负号：x 出现过，就把下标 x − 1 上的数变成负数。取绝对值，原来的值还能读回来。'],
  [20.7,27.6,'不过 nums 里原来就有 −1 这样的负数，会和标记混在一起。所以动手之前，要先清理一遍。']],
build(r){
  const c={};
  c.ti=H('div','a',{left:120,top:136,fontFamily:'var(--display)',fontSize:60,fontWeight:900},r,'把 nums 自己当成“标记本”');
  c.cnt=H('div','a',{left:124,top:232,fontSize:28,color:'var(--graphite)'},r,'n = 4 个位置　↔　要记 1、2、3、4 这 4 个数');
  c.row=row(r,NUMS,160,372,150,120,190,60,24,false);
  c.duty=duty(r,c.row,548,30);
  c.rule=H('div','a',{left:124,top:668,fontFamily:'var(--mono)',fontSize:40},r,'数字 x 出现过　⇔　nums[x − 1] 是负数');
  c.mk=H('div','mk',{left:108,top:658,width:0,height:70,opacity:.9},r);
  c.card=H('div','card',{left:1040,top:140,width:784,height:470},r);
  c.d1=H('div','a hand',{left:1084,top:170,fontSize:34},r,'例：数字 4 出现过');
  c.d2=H('div','a',{left:1084,top:228,fontSize:28,color:'var(--graphite)'},r,'4 归下标 4 − 1 = 3 管');
  c.dc=H('div','cell',{left:1084,top:312,width:170,height:136,fontSize:68},r,'1');
  c.di=H('div','a idx',{left:1084,top:456,width:170,fontSize:24},r,'nums[3]');
  c.d3=H('div','a hand',{left:1300,top:320,fontSize:38},r,'负号：“4 出现过”');
  c.d4=H('div','a',{left:1300,top:390,fontFamily:'var(--mono)',fontSize:32},r,'abs(−1) = 1');
  c.d5=H('div','a',{left:1300,top:442,fontSize:26,color:'var(--graphite)'},r,'原来的值还读得回来');
  c.svg=S('svg',{class:'ov'},r);
  c.circ=penCircle(c.svg,c.row.cx(2),432,96,74,'var(--red)',4);
  c.w1=H('div','a hand',{left:c.row.x(2)-40,top:296,fontSize:36},r,'原来就是负数');
  c.w2=H('div','a hand',{left:124,top:772,fontSize:40},r,'分不清是“原来的负数”还是“标记”　→　先清理');
  return c;
},
update(c,t){
  vis(c.ti,ep(t,.2,.9),14);vis(c.cnt,ep(t,2.4,3.1),8);
  c.row.cells.forEach((e,i)=>pop(e,ep(t,.8+.12*i,1.3+.12*i)));
  c.row.idx.forEach((e,i)=>e.style.opacity=ep(t,1+.12*i,1.5+.12*i));
  c.duty.forEach((e,i)=>vis(e,ep(t,7+.9*i,7.5+.9*i),-10));
  vis(c.rule,ep(t,13.2,13.9),10);c.mk.style.width=(860*ep(t,13.6,14.6))+'px';
  c.card.style.opacity=ep(t,14.2,14.8);
  vis(c.d1,ep(t,14.4,15),8);vis(c.d2,ep(t,14.9,15.5),8);
  pop(c.dc,ep(t,15.2,15.7));c.di.style.opacity=ep(t,15.2,15.7);
  const fl=t>=16.6;c.dc.textContent=fl?'−1':'1';c.dc.classList.toggle('neg',fl);
  const b=ep(t,16.4,16.6)*(1-ep(t,16.6,17.1));if(t>15.7)c.dc.style.transform=`scale(${1+.16*b})`;
  vis(c.d3,ep(t,17,17.6),0,-14);vis(c.d4,ep(t,18.4,19),0,-14);vis(c.d5,ep(t,18.8,19.4),0,-14);
  c.circ.set(ep(t,21,21.9));vis(c.w1,ep(t,21.6,22.2),8);vis(c.w2,ep(t,23.6,24.3),10);
}});

/* 4 第一步：清理 */
SC.push({title:'第一步：清理',dur:16,caps:[
  [.3,5.5,'第一步，清理。小于等于 0 的数和大于 n 的数，本来就和答案无关。'],
  [5.7,10.5,'把它们统一改成 n + 1 = 5：一个超出范围的正数。这里只有 −1 要改。'],
  [10.7,15.6,'现在数组里全是正数。之后出现的负号，一定是我们打的标记。']],
build(r){
  const c={};
  c.code=codePanel(r,96,132,CODE,22,36,'第一步：清理');
  c.hd=H('div','a',{left:1010,top:200,fontSize:28,color:'var(--graphite)'},r,'n = 4，n + 1 = 5');
  c.row=row(r,NUMS,1010,300,140,116,170,52,24,false);
  c.mk=H('div','mk',{left:0,top:288,width:164,height:140,opacity:0},r);
  c.s1=H('div','a',{left:1010,top:520,fontFamily:'var(--mono)',fontSize:30},r,'');
  c.s2=H('div','a',{left:1010,top:576,fontFamily:'var(--mono)',fontSize:30},r,'');
  c.n1=H('div','a hand',{left:1010,top:690,fontSize:44},r,'现在全是正数');
  c.n2=H('div','a',{left:1010,top:760,fontSize:28,color:'var(--graphite)'},r,'之后出现的负号，一定是我们打的标记');
  return c;
},
update(c,t){
  const T0=1.5,SD=2.2;let s=Math.floor((t-T0)/SD),u=t-T0-s*SD;
  if(t<T0){s=-1;u=0;}if(s>=N){s=N;u=0;}
  vis(c.hd,ep(t,.3,.9),8);
  c.row.cells.forEach((e,i)=>{
    const done=s>i||(s===i&&u>=1.3),ch=NUMS[i]!==CLEAN[i];
    c.row.set(i,done?CLEAN[i]:NUMS[i]);
    e.style.color=(done&&ch)?'var(--blue)':'';
    const b=(s===i&&ch)?ep(u,1.1,1.3)*(1-ep(u,1.3,1.8)):0;
    e.style.opacity=ep(t,.3+.06*i,.7+.06*i);e.style.transform=`scale(${1+.18*b})`;
  });
  c.row.idx.forEach((e,i)=>e.style.opacity=ep(t,.4+.06*i,.8+.06*i));
  if(s>=0&&s<N){
    const v=NUMS[s],keep=v===CLEAN[s];
    c.mk.style.left=(c.row.x(s)-12)+'px';c.mk.style.opacity=.9*ep(u,0,.25);
    c.s1.innerHTML=`i = ${s}　nums[${s}] = <b>${fmt(v)}</b>`;c.s1.style.opacity=ep(u,.1,.4);
    c.s2.innerHTML=keep?'在 1 到 4 之间　→　保留':`${fmt(v)} <= 0　→　改成 n + 1 = <b style="color:var(--blue)">5</b>`;
    c.s2.style.opacity=ep(u,.6,.9);
    c.code.set(4);
  }else if(s>=N){
    c.mk.style.opacity=.9*(1-ep(t,T0+N*SD,T0+N*SD+.4));
    c.s1.innerHTML='清理完成：nums = [3, 4, 5, 1]';c.s1.style.opacity=1;c.s2.style.opacity=0;
    c.code.set(5);
  }else{c.mk.style.opacity=0;c.s1.style.opacity=0;c.s2.style.opacity=0;c.code.set(t>.9?3:null);}
  vis(c.n1,ep(t,11,11.6),10);vis(c.n2,ep(t,11.9,12.5),8);
}});

/* 5 第二步：打标记 */
const S5=[[.3,3.3,'第二步，打标记。从左到右看每个数 cur_num，把下标 cur_num − 1 上的数变成负数。']];
[
 'i = 0：cur_num = 3。3 归下标 2 管，把 nums[2] 的 5 变成 −5。',
 'i = 1：cur_num = 4。4 归下标 3 管，把 nums[3] 的 1 变成 −1。',
 'i = 2：这里是 −5，已经被打过标记。取绝对值得到 5，大于 n，跳过。',
 'i = 3：这里是 −1，取绝对值得到 1。1 归下标 0 管，把 nums[0] 的 3 变成 −3。'
].forEach((s,j)=>S5.push([3.5+7.5*j+.2,3.5+7.5*j+7.3,s]));
S5.push([33.7,35.7,'打完了：下标 0、2、3 是负数，说明 1、3、4 出现过。']);
SC.push({title:'第二步：打标记',dur:36,caps:S5,
build(r){
  const c={};
  c.code=codePanel(r,96,132,CODE,22,36,'第二步：打标记');
  c.row=row(r,MARK[0],1010,350,140,116,170,52,24);
  c.duty=duty(r,c.row,514,24);
  c.mk=H('div','mk',{left:0,top:338,width:164,height:140,opacity:0},r);
  c.svg=S('svg',{class:'ov'},r);
  c.ar=STEPS.map(st=>st.ok?arrow(c.svg,c.row.cx(st.i),336,c.row.cx(st.tgt),336,206,'var(--red)'):null);
  c.al=STEPS.map(st=>st.ok?H('div','a hand',{left:(c.row.cx(st.i)+c.row.cx(st.tgt))/2-150,top:196,width:300,textAlign:'center',fontSize:30,opacity:0},r,`去下标 ${st.cur} − 1 = ${st.tgt}`)
                         :H('div','a hand',{left:c.row.x(st.i)-40,top:282,width:c.row.w+80,textAlign:'center',fontSize:32,opacity:0},r,`${st.cur} > 4，跳过`));
  c.s1=H('div','a',{left:1010,top:596,fontFamily:'var(--mono)',fontSize:28},r,'');
  c.s2=H('div','a',{left:1010,top:648,fontFamily:'var(--mono)',fontSize:28},r,'');
  c.tl=H('div','a',{left:1010,top:760,fontSize:26,color:'var(--graphite)'},r,'已经标记“出现过”的数：');
  c.chips=[1,2,3,4].map((v,k)=>{
    const x=1326+84*k;
    H('div','cell',{left:x,top:746,width:66,height:58,fontSize:30,color:'var(--faint)',borderColor:'var(--faint)'},r,String(v));
    return H('div','cell',{left:x,top:746,width:66,height:58,fontSize:30,color:'#fff',borderColor:'var(--blue)',background:'var(--blue)',opacity:0},r,String(v));
  });
  return c;
},
update(c,t){
  const T0=3.5,SD=7.5;let s=Math.floor((t-T0)/SD),u=t-T0-s*SD;
  if(t<T0){s=-1;u=0;}if(s>=N){s=N;u=0;}
  c.row.cells.forEach((e,i)=>{
    let v=s<0?MARK[0][i]:s>=N?FINAL[i]:MARK[s][i],b=0;
    if(s>=0&&s<N){const st=STEPS[s];if(st.ok&&st.tgt===i){if(u>=3.9)v=MARK[s+1][i];b=ep(u,3.7,3.9)*(1-ep(u,3.9,4.5));}}
    c.row.set(i,v);e.style.opacity=ep(t,.3+.06*i,.7+.06*i);e.style.transform=`scale(${1+.2*b})`;
  });
  c.row.idx.forEach((e,i)=>e.style.opacity=ep(t,.4+.06*i,.8+.06*i));
  c.duty.forEach((e,i)=>e.style.opacity=ep(t,.9+.1*i,1.4+.1*i));
  vis(c.tl,ep(t,1.6,2.2),8);
  c.chips.forEach((e,k)=>{let a=0;STEPS.forEach(st=>{if(st.ok&&st.tgt===k)a=Math.max(a,s>st.i?1:s===st.i?ep(u,4.2,4.7):0);});pop(e,a);});
  STEPS.forEach((st,q)=>{
    const on=q===s,fade=on?1-ep(u,6.6,7.2):0;
    if(st.ok){c.ar[q].set(on?ep(u,2.6,3.5):0,on?ep(u,3.3,3.6)*fade:0);c.ar[q].g.style.opacity=on?fade:0;c.al[q].style.opacity=on?ep(u,2.8,3.3)*fade:0;}
    else c.al[q].style.opacity=on?ep(u,2.6,3.1)*fade:0;
  });
  let line=null;
  if(s>=0&&s<N){
    const st=STEPS[s];
    c.mk.style.left=(c.row.x(st.i)-12)+'px';c.mk.style.opacity=.9*ep(u,0,.3)*(1-ep(u,6.8,7.3));
    c.s1.innerHTML=`i = ${st.i}　cur_num = abs(${fmt(st.raw)}) = <b>${st.cur}</b>`;c.s1.style.opacity=ep(u,.5,.9);
    c.s2.innerHTML=st.ok?`${st.cur} <= 4　→　nums[${st.tgt}] = −abs(${fmt(st.before)}) = <b style="color:var(--red)">${fmt(st.after)}</b>`
                        :`${st.cur} > 4　→　不在 1 到 n 之间，跳过`;
    c.s2.style.opacity=ep(u,1.7,2.1);
    line=u<1.6?8:u<2.6?9:u<6.7?(st.ok?10:9):7;
  }else{
    c.mk.style.opacity=0;
    if(s<0){c.s1.innerHTML='nums = [3, 4, 5, 1]';c.s1.style.opacity=ep(t,1.2,1.8);c.s2.style.opacity=0;line=t>1?7:null;}
    else{c.s1.innerHTML='循环结束：nums = [−3, 4, −5, −1]';c.s1.style.opacity=1;c.s2.innerHTML='负数在下标 0、2、3　→　1、3、4 出现过';c.s2.style.opacity=1;line=12;}
  }
  c.code.set(line);
}});

/* 6 第三步：找第一个正数 */
SC.push({title:'第三步：找第一个正数',dur:14,caps:[
  [.3,5,'第三步，从左到右找第一个还是正数的位置。'],
  [5.2,9.5,'下标 0 是负数，说明 1 出现过。下标 1 是正数：没人给它打过标记，说明 2 没出现。'],
  [9.7,13.6,'返回 i + 1 = 2。如果全是负数，说明 1 到 n 都出现了，返回 n + 1。']],
build(r){
  const c={};
  c.code=codePanel(r,96,132,CODE,22,36,'第三步：找第一个正数');
  c.row=row(r,FINAL,1010,350,140,116,170,52,24);
  c.duty=duty(r,c.row,514,24);
  c.mk=H('div','mk',{left:0,top:338,width:164,height:140,opacity:0},r);
  c.svg=S('svg',{class:'ov'},r);
  c.circ=penCircle(c.svg,c.row.cx(ANS-1),408,92,72,'var(--red)',4);
  c.s1=H('div','a',{left:1010,top:596,fontFamily:'var(--mono)',fontSize:28},r,'');
  c.rl=H('div','a',{left:1010,top:690,fontFamily:'var(--mono)',fontSize:40},r,'return i + 1 =');
  c.rv=H('div','a',{left:1360,top:660,fontFamily:'var(--num)',fontSize:100,color:'var(--red)',lineHeight:1.1},r,String(ANS));
  c.n=H('div','a',{left:1010,top:806,fontSize:26,color:'var(--graphite)'},r,'一个正数都没有：1 到 n 都出现了，return n + 1');
  return c;
},
update(c,t){
  c.row.cells.forEach((e,i)=>pop(e,ep(t,.3+.06*i,.7+.06*i)));
  c.row.idx.forEach((e,i)=>e.style.opacity=ep(t,.4+.06*i,.8+.06*i));
  c.duty.forEach((e,i)=>e.style.opacity=ep(t,.6+.06*i,1+.06*i));
  const i=t<1.6?-1:t<5.2?0:1;
  if(i>=0){
    const m=i===1?ep(t,5.2,5.6):0;
    c.mk.style.left=(lerp(c.row.x(0),c.row.x(1),m)-12)+'px';c.mk.style.opacity=.9*ep(t,1.6,1.9);
    const v=FINAL[i];
    c.s1.innerHTML=v<0?`i = ${i}　nums[${i}] = ${fmt(v)} < 0　→　${i+1} 出现过，继续`
                      :`i = ${i}　nums[${i}] = ${fmt(v)} > 0　→　<b style="color:var(--red)">${i+1} 没出现</b>`;
    c.s1.style.opacity=i===0?ep(t,1.9,2.3):ep(t,5.7,6.1);
  }else{c.mk.style.opacity=0;c.s1.style.opacity=0;}
  c.circ.set(ep(t,6.4,7.2));
  vis(c.rl,ep(t,9.8,10.3),10);vis(c.rv,ep(t,10.1,10.6),0,-16);vis(c.n,ep(t,11.5,12.1),8);
  c.code.set(t<1.2?null:t<1.6?14:t<11.5?15:17);
}});

/* 7 两个细节 */
SC.push({title:'两个细节',dur:24,caps:[
  [.3,5.5,'两个细节。第一个：读的时候要取绝对值。这个位置可能已经被别的数打过标记。'],
  [5.7,11,'刚才 i = 3 读到的是 −1。不取绝对值，就会去找下标 −2，直接越界。'],
  [11.2,17,'第二个：写的时候用 −abs，不要直接取反。看 nums = [1, 1]，正确答案是 2。'],
  [17.2,23.6,'直接取反：第二个 1 把负号又翻回了正号，标记丢了，答案错成 1。用 −abs 就不会。']],
build(r){
  const c={};
  c.L=H('div','card',{left:96,top:140,width:840,height:740},r);
  c.R=H('div','card',{left:984,top:140,width:840,height:740},r);
  c.l1=H('div','a hand',{left:136,top:164,fontSize:30},r,'细节一：读的时候取绝对值');
  c.l2=H('div','a',{left:136,top:208,fontFamily:'var(--mono)',fontSize:38,fontWeight:700},r,'int cur_num = abs(nums[i]);');
  c.l3=H('div','a',{left:136,top:272,fontSize:24,color:'var(--graphite)'},r,'这个位置可能已经被别的数打过标记，变成了负数');
  c.row=row(r,MARK[3],176,380,130,104,160,48,22);
  c.mk=H('div','mk',{left:c.row.x(3)-12,top:368,width:154,height:128,opacity:0},r);
  c.il=H('div','a hand',{left:c.row.x(3),top:528,width:130,textAlign:'center',fontSize:28},r,'i = 3');
  c.ok=H('div','a',{left:136,top:620,fontFamily:'var(--mono)',fontSize:28,color:'var(--blue)'},r,'✓ abs(−1) = 1　→　去下标 0 打标记');
  c.bad=H('div','a',{left:136,top:700,fontFamily:'var(--mono)',fontSize:28,color:'var(--red)'},r,'✗ 不取 abs：cur_num = −1　→　下标 −2');
  c.badn=H('div','a hand',{left:176,top:756,fontSize:32},r,'数组越界');
  // 右卡
  c.r1=H('div','a hand',{left:1024,top:164,fontSize:30},r,'细节二：写的时候用 −abs');
  c.r2=H('div','a',{left:1024,top:210,fontFamily:'var(--mono)',fontSize:26,fontWeight:700},r,'nums[cur_num - 1] = -abs(nums[cur_num - 1]);');
  c.r3=H('div','a',{left:1024,top:272,fontFamily:'var(--mono)',fontSize:26,color:'var(--graphite)'},r,'nums = [1, 1]，正确答案：2');
  const col=(x,head,color,rows,res,resColor,resNote)=>{
    const o={};
    o.h=H('div','a',{left:x,top:340,fontSize:28,fontWeight:700,color},r,head);
    o.rows=rows.map(([code,note],k)=>{
      const g=H('div','a',{left:x,top:410+120*k,width:370},r);
      H('div',null,{fontFamily:'var(--mono)',fontSize:22},g,code);
      if(note)H('div','hand',{fontSize:26,marginTop:'6px',color:'var(--graphite)'},g,note);
      return g;
    });
    o.res=H('div','a',{left:x,top:680,fontFamily:'var(--mono)',fontSize:30,color:resColor},r,res);
    o.note=resNote?H('div','a hand',{left:x,top:736,fontSize:28},r,resNote):null;
    return o;
  };
  c.A=col(1024,'✓ 用 −abs','var(--blue)',[['第 1 个 1：[1, 1] → [−1, 1]','下标 0 被标记'],['第 2 个 1：−abs(−1) = −1','还是负数，标记还在']],'[−1, 1]　→　答案 2','var(--blue)',null);
  c.B=col(1424,'✗ 直接取反','var(--red)',[['第 1 个 1：[1, 1] → [−1, 1]','下标 0 被标记'],['第 2 个 1：−(−1) = 1','负号被翻回去了']],'[1, 1]　→　答案 1','var(--red)','把出现过的 1 当成没出现');
  return c;
},
update(c,t){
  vis(c.l1,ep(t,.2,.8),8);vis(c.l2,ep(t,.3,.9),8);vis(c.l3,ep(t,.6,1.2),8);
  c.row.cells.forEach((e,i)=>pop(e,ep(t,1.4+.08*i,1.9+.08*i)));
  c.row.idx.forEach((e,i)=>e.style.opacity=ep(t,1.5+.08*i,2+.08*i));
  c.mk.style.opacity=.9*ep(t,5.8,6.2);vis(c.il,ep(t,5.9,6.4),-8);
  vis(c.ok,ep(t,6.8,7.4),8);vis(c.bad,ep(t,8.4,9),8);vis(c.badn,ep(t,9.4,10),8);
  vis(c.r1,ep(t,11.2,11.8),8);vis(c.r2,ep(t,11.3,11.9),8);vis(c.r3,ep(t,11.7,12.3),8);
  const run=(o,t0)=>{
    vis(o.h,ep(t,t0-.4,t0),8);
    o.rows.forEach((g,k)=>{const a=t0+1.3*k;vis(g,ep(t,a,a+.45),8);});
    const done=t0+2.8;vis(o.res,ep(t,done,done+.5),8);if(o.note)vis(o.note,ep(t,done+.6,done+1.1),8);
  };
  run(c.A,13);run(c.B,17.6);
}});

/* 8 复杂度 */
SC.push({title:'复杂度',dur:12,caps:[
  [.3,5.5,'时间：三次遍历，每次看 n 个数，一共 O(n)。'],
  [5.7,11.6,'空间：没有另开数组，标记就写在 nums 自己身上，额外空间 O(1)。代价是 nums 被改掉了。']],
build(r){
  const c={};
  const rows=[['时间','O(n)','三次遍历，每次 n 个数',true],['额外空间','O(1)','标记写在 nums 自己身上',true],['代价','nums 被修改','调用方的数组不再是原样',false]];
  c.rows=rows.map(([a,b,d,mono],k)=>{
    const y=220+104*k,g=H('div','a',{left:96,top:y,width:860,height:104,borderTop:'1.5px solid rgba(27,38,49,.14)'},r);
    H('div','a',{left:0,top:32,fontSize:30},g,a);
    H('div','a',{left:210,top:mono?22:30,fontFamily:mono?'var(--mono)':'var(--body)',fontSize:mono?44:30,color:'var(--blue)'},g,b);
    H('div','a',{left:470,top:34,fontSize:26,color:'var(--graphite)'},g,d);
    return g;
  });
  const passes=[['① 清理',CLEAN],['② 打标记',FINAL],['③ 找第一个正数',FINAL]];
  c.pass=passes.map(([name,vals],k)=>{
    const y=226+130*k,o={};
    o.name=H('div','a hand',{left:1060,top:y+10,fontSize:34},r,name);
    o.cells=vals.map((v,j)=>{const e=H('div','cell',{left:1360+86*j,top:y,width:72,height:64,fontSize:28},r,fmt(v));if(v<0)e.classList.add('neg');return e;});
    o.n=H('div','a',{left:1724,top:y+10,fontFamily:'var(--mono)',fontSize:30,color:'var(--graphite)'},r,'n 次');
    return o;
  });
  c.sum=H('div','a hand',{left:1060,top:640,fontSize:44},r,'一共 3n 次　→　O(n)');
  c.sp=H('div','a',{left:1060,top:720,fontSize:28,color:'var(--graphite)'},r,'没有哈希表，也没有额外的数组');
  return c;
},
update(c,t){
  vis(c.rows[0],ep(t,.3,.9),10);vis(c.rows[1],ep(t,5.8,6.4),10);vis(c.rows[2],ep(t,8.6,9.2),10);
  c.pass.forEach((o,k)=>{const a=1+1.1*k;vis(o.name,ep(t,a,a+.5),8);o.cells.forEach((e,j)=>pop(e,ep(t,a+.2+.08*j,a+.6+.08*j)));o.n.style.opacity=ep(t,a+.7,a+1.1);});
  vis(c.sum,ep(t,4.3,4.9),10);vis(c.sp,ep(t,6.6,7.2),8);
}});

/* 9 收尾 */
SC.push({title:'一句话',dur:8,caps:[],
build(r){
  const c={};
  c.a=H('div','a',{left:156,top:250,fontFamily:'var(--display)',fontSize:84,fontWeight:900,lineHeight:1.3},r,'把 nums 自己当标记本：');
  c.b=H('div','a',{left:156,top:364,fontFamily:'var(--display)',fontSize:66,fontWeight:900,lineHeight:1.3},r,'下标 x − 1 的正负号，记着 x 出现过没有。');
  c.c=H('div','a',{left:164,top:520,fontFamily:'var(--mono)',fontSize:40},r,'nums[cur_num - 1] = <span style="color:var(--blue)">-abs(</span>nums[cur_num - 1]<span style="color:var(--blue)">)</span>;');
  c.d=H('div','a hand',{left:164,top:614,fontSize:36},r,'清理 → 打标记 → 找第一个正数　　时间 O(n)，额外空间 O(1)');
  c.e=H('div','a',{left:164,top:740,fontSize:22,color:'var(--graphite)'},r,'LC 41 · 例子：nums = [3, 4, −1, 1]，答案 2');
  return c;
},
update(c,t){vis(c.a,ep(t,.2,1),20);vis(c.b,ep(t,.6,1.4),20);vis(c.c,ep(t,1.6,2.3),12);vis(c.d,ep(t,2.4,3.1),12);vis(c.e,ep(t,3,3.6),0);}
});

