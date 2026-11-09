const REDUCED_MOTION=matchMedia('(prefers-reduced-motion: reduce)').matches;
const N=20,CW=68,CENTER_Y=-10;let BIG=2.8,STEP=14;
const CARDS=[{image:'../tarot-assets/death-card-v5.png',name:'DEATH',sym:'☠',num:'XIII',text:'무엇을 바라든 이루어지지 않을 것이다'},{image:'../tarot-assets/king-card-v5.png',name:'KING',sym:'♛',num:'IV',text:'화려한 조명을 받는 오늘, 당신이 세상의 주인공'}];
const OPTIONS={delay:[[3000,'3.0초'],[3500,'3.5초'],[4000,'4.0초']],shuffle:[['light','LIGHT'],['normal','NORMAL'],['wild','WILD']],pace:[[.75,'빠르게'],[1,'보통'],[1.35,'느리게'],[1.75,'아주 느리게']],reveal:[['flip','FLIP'],['fade','FADE'],['flipGlow','FLIP + GLOW']],sound:[[true,'ON'],[false,'OFF']]};
const settings={delay:3500,shuffle:'normal',pace:1,reveal:'flipGlow',sound:true};
try{const saved=JSON.parse(localStorage.getItem('today-tarot-web-settings-v1'));for(const key in OPTIONS)if(OPTIONS[key].some(([v])=>v===saved?.[key]))settings[key]=saved[key]}catch(e){}
if(REDUCED_MOTION)settings.reveal='fade';
const MOVE=1150,PAUSE=560,FLIP=1100;
const SHUFFLE_STEPS=8,SHUFFLE_KEYS=[0,.09,.2,.31,.42,.53,.64,.75,.87,1],SETTLE=.87;
const SPREAD={light:{x:.16,y:.10,r:28,s:.04},normal:{x:.30,y:.20,r:95,s:.07},wild:{x:.40,y:.28,r:175,s:.10}};
let ROW_W=STEP*(N-1)+CW,DECK_H=300;
const clampv=(v,mn,mx)=>mx<=mn?0:Math.min(mx,Math.max(mn,v));
const stillKeys=(v)=>SHUFFLE_KEYS.map(k=>[k,v,'lin']);
const $=id=>document.getElementById(id),deck=$('deck'),result=$('result'),sub=$('sub'),hint=$('hint');
const sounds={};['tap','shuffle','reveal'].forEach(k=>{try{sounds[k]=new Audio(`../tarot-sounds/card_${k}.wav`);sounds[k].preload='auto'}catch(e){}});
const VOL={tap:.55,shuffle:.4,reveal:.7};
function play(k){if(!settings.sound||!sounds[k])return;try{const a=sounds[k];a.volume=VOL[k];a.currentTime=0;a.play().catch(()=>{})}catch(e){}}

// build deck
const halo=document.createElement('div');halo.className='halo';deck.appendChild(halo);
const cards=[];
for(let i=0;i<N;i++){
  const el=document.createElement('button');el.type='button';el.className='card';el.disabled=true;el.setAttribute('aria-label',(i+1)+'번 카드 선택');el.addEventListener('click',e=>{if(e.detail===0)choose(i)});
  el.innerHTML='<div class="aura"></div><div class="flipper"><div class="face cback"><img class="art" src="../tarot-assets/card-back-v5.png" alt=""><div class="shine"></div></div><div class="face front"><img class="art" alt=""><span class="num"></span><span class="sym"></span><span class="nm"></span><div class="veil"></div></div></div>';
  deck.appendChild(el);
  const d=Math.abs(i-9.5)/9.5;
  cards.push({el,flipper:el.querySelector('.flipper'),back:el.querySelector(".cback"),front:el.querySelector('.front'),veil:el.querySelector('.veil'),shine:el.querySelector('.shine'),aura:el.querySelector('.aura'),
    x:(i-9.5)*STEP,y:d*d*34,r:(i-9.5)*1.1,press:0,enter:0,ord:i,kx:stillKeys(0),ky:stillKeys(0),kr:stillKeys(0),ks:stillKeys(1)});
}
let phase='opening',hovered=null,selected=null,draw=0,start=0,plan=null,cues=[];
const V={lift:0,focus:0,shake:0,shuffle:0,hover:0,aura:0,halo:0,emph:0,move:0,exit:0,flip:0,fade:0,veil:1};
const ease={lin:t=>t,sin:t=>-(Math.cos(Math.PI*t)-1)/2,out3:t=>1-Math.pow(1-t,3),io3:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,outq:t=>1-(1-t)*(1-t)};
// track: [[time,value,easing?],...] value held before first / after last
function track(t,k){if(t<=k[0][0])return k[0][1];for(let n=1;n<k.length;n++){const[a,va]=k[n-1],[b,vb,e]=k[n];if(t<=b){const p=b>a?(t-a)/(b-a):1;return va+(vb-va)*ease[e||'sin'](p)}}return k[k.length-1][1]}

function buildShufflePlan(s){
  const T=REDUCED_MOTION?250:s.delay,L=s.shuffle,p={T,level:L,reveal:s.reveal,tracks:{},amount:L==='normal'?{g:0,x:10,y:7,r:5}:{g:0,x:6.5,y:4.5,r:3.2}},tr=p.tracks;
  ['lift','focus','shake','hover','aura','halo','emph','move','exit','flip','fade'].forEach(k=>tr[k]=[[0,0]]);tr.veil=[[0,1]];tr.shuffle=[[0,0],[T*.82,SETTLE,'lin'],[T,1,'out3']];
  return p;
}
function buildRevealPlan(s){
  const k=REDUCED_MOTION?.18:(s.pace||1), mv=Math.round(MOVE*k), hold=Math.round(PAUSE*k), fl=Math.round(FLIP*k);
  const T=mv+hold, F=T, p={T,fl,level:s.shuffle,reveal:s.reveal,tracks:{},amount:{g:0,x:0,y:0,r:0}},tr=p.tracks,LS=.35;
  tr.lift=[[0,LS],[300*k,1,'out3'],[920*k,0]];
  tr.focus=[[0,0],[560*k,1,'outq']];
  tr.shuffle=[[0,0]];
  // 중앙에서 숨 고르기 + 공개 직전 작은 떨림
  tr.hover=[[mv,0],[mv+hold*.55,1],[T,0]];
  tr.shake=[[mv+hold*.4,0],[mv+hold*.56,.55],[mv+hold*.74,-.45],[mv+hold*.88,.2],[T,0],[T+fl*.3,0]];
  tr.aura=[[0,0],[820*k,.8],[F,.8],[F+fl,s.reveal==='flipGlow'?.6:0]];
  tr.halo=s.reveal==='flipGlow'?[[0,0],[mv,.35],[F+fl*.35,.35],[F+fl*.35+fl*.42,1,'outq'],[F+fl*.35+fl*1.52,.45]]:[[0,0]];
  tr.move=[[0,0],[mv,1,'io3']];tr.exit=tr.move;
  tr.emph=[[0,0],[mv*.6,0],[mv*.6+380*k,1,'out3'],[F+fl,1],[F+fl+fl*.5,0,'out3']];
  if(s.reveal==='fade'){tr.fade=[[F,0],[F+fl,1]];tr.flip=[[0,0]]}else{tr.flip=[[F,0],[F+fl,1,'io3']];tr.fade=[[0,0]]}
  tr.veil=[[F+fl*.45,1],[F+fl*.45+fl*.72,0,'outq']];return p;
}
function cardAt(ev){const r=deck.getBoundingClientRect(),x=ev.clientX-r.left-r.width/2,y=ev.clientY-r.top;if(phase!=='choose'||y<r.height/2-90||y>r.height/2+110)return null;return Math.max(0,Math.min(N-1,Math.round(x/STEP+9.5)))}
deck.addEventListener('pointerdown',e=>{if(phase!=='choose')return;deck.setPointerCapture(e.pointerId);hovered=cardAt(e)});
deck.addEventListener('pointermove',e=>{if(phase==='choose'&&e.buttons)hovered=cardAt(e)});
deck.addEventListener('pointerup',e=>{const i=cardAt(e);hovered=null;if(i!==null)choose(i)});
deck.addEventListener('pointercancel',()=>{hovered=null});
function choose(i){
  if(phase!=='choose')return;
  phase='selecting';cards.forEach(c=>c.el.disabled=true);selected=i;const c=CARDS[draw%2];draw++;
  const f=cards[i].front;f.querySelector('img').src=c.image;f.querySelector('img').alt=c.name+' 타로 카드';f.querySelector('.num').textContent=c.num;f.querySelector('.sym').textContent=c.sym;f.querySelector('.nm').textContent=c.name;
  $('rname').textContent=c.name;$('rtext').textContent=c.text;
  $('reset').textContent='↻ 다시 선택하기';
  cards.forEach(k=>k.j={x:Math.random()*2-1,y:Math.random()*2-1,r:Math.random()*2-1});
  plan=buildRevealPlan(settings);start=performance.now();
  sub.textContent='선택한 카드를 확인하고 있습니다';hint.textContent='선택한 카드를 공개합니다';
  play('tap');
  const FL=plan.fl;cues.push(setTimeout(()=>{phase='flipping';play('reveal')},plan.T));
  cues.push(setTimeout(()=>{phase='result';sub.textContent='오늘 당신을 위한 한 장';hint.textContent='';result.classList.add('show')},plan.T+FL));
}
// 앱과 동일한 무작위 셔플 경로: 카드마다 매번 다른 길로 흩어졌다 제자리로
function buildScatter(){
  const sp=REDUCED_MOTION?{x:0,y:0,r:0,s:0}:(SPREAD[settings.shuffle]||SPREAD.normal);
  const reachX=ROW_W*sp.x, reachY=Math.max(40,DECK_H*sp.y);
  const deckW=document.getElementById('deck').clientWidth||ROW_W;
  cards.forEach(c=>{
    const homeX=deckW/2+c.x, homeY=DECK_H/2-14+c.y;
    const frames=Array.from({length:SHUFFLE_STEPS},(_,st)=>{
      const dec=st===SHUFFLE_STEPS-1?.3:1, spin=st===0?.4:dec, u=()=>Math.random()*2-1;
      const sc=1+u()*sp.s;
      // 어떤 각도로 기울어져도 덱 안에 들어오도록 외접원 반지름으로 제한
      const R=Math.hypot(CW,102)*sc/2+4;
      return {x:clampv(u()*reachX*dec,R-homeX,deckW-R-homeX),
              y:clampv(u()*reachY*dec,R-homeY,DECK_H-R-homeY),r:u()*sp.r*spin,s:sc};
    });
    c.kx=SHUFFLE_KEYS.map((k,n)=>[k,(n===0||n===9)?0:frames[n-1].x,'lin']);
    c.ky=SHUFFLE_KEYS.map((k,n)=>[k,(n===0||n===9)?0:frames[n-1].y,'lin']);
    c.kr=SHUFFLE_KEYS.map((k,n)=>[k,(n===0||n===9)?0:frames[n-1].r,'lin']);
    c.ks=SHUFFLE_KEYS.map((k,n)=>[k,(n===0||n===9)?1:frames[n-1].s,'lin']);
  });
  const ord=cards.map((_,i)=>i);
  for(let i=ord.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ord[i],ord[j]]=[ord[j],ord[i]];}
  cards.forEach((c,i)=>c.ord=ord[i]);
}
function startShuffle(resetDraw=false){document.body.classList.remove('opening');$('opening').hidden=true;cues.forEach(clearTimeout);cues=[];if(resetDraw)draw=0;phase='shuffling';cards.forEach(c=>c.el.disabled=true);selected=null;result.classList.remove('show');Object.assign(V,{lift:0,focus:0,shake:0,shuffle:0,hover:0,aura:0,halo:0,emph:0,move:0,exit:0,flip:0,fade:0,veil:1});cards.forEach(c=>{c.press=0});buildScatter();plan=buildShufflePlan(settings);start=performance.now();sub.textContent='운명의 카드를 섞고 있습니다';hint.textContent='카드를 섞고 있습니다';play('shuffle');
  cues.push(setTimeout(()=>play('shuffle'),Math.round(plan.T*.45)));
  cues.push(setTimeout(()=>cards.forEach((c,i)=>c.ord=i),Math.round(plan.T*.8)));
  cues.push(setTimeout(()=>{phase='choose';cards.forEach(c=>c.el.disabled=false);plan=null;V.shuffle=0;sub.textContent='마음이 끌리는 카드를 터치하세요';hint.textContent='스무 장의 카드 중 한 장을 선택하세요'},plan.T))}
function reset(){document.body.classList.add('opening');$('opening').hidden=false;cues.forEach(clearTimeout);cues=[];phase='opening';draw=0;selected=null;plan=null;cards.forEach(c=>c.el.disabled=true);result.classList.remove('show');return;}
$('start-reading').onclick=()=>startShuffle(true);
$('reset').onclick=()=>startShuffle(false);
let taps=0,tapTimer=null,lp=null;const title=$('title');
function openSettings(){clearTimeout(lp);lp=null;taps=0;$('settings-dialog').showModal()}
title.addEventListener('pointerdown',e=>{if(e.button!==0)return;title.setPointerCapture(e.pointerId);lp=setTimeout(openSettings,1200)});
title.addEventListener('pointerup',()=>{if(!lp)return;clearTimeout(lp);lp=null;taps++;clearTimeout(tapTimer);if(taps>=5){taps=0;reset()}else tapTimer=setTimeout(()=>taps=0,1600)});
title.addEventListener('pointercancel',()=>{clearTimeout(lp);lp=null});
title.addEventListener('contextmenu',e=>e.preventDefault());
title.addEventListener('click',e=>{if(e.detail===0)openSettings()});
$('settings-close').onclick=()=>$('settings-dialog').close();
$('scene-reset').onclick=()=>{$('settings-dialog').close();reset()};
$('fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.().catch(()=>{})};
function layoutDeck(){const W=deck.clientWidth;DECK_H=deck.clientHeight;BIG=Math.min(4.2,Math.max(1.6,(DECK_H-34)/102),Math.max(1.6,(W-34)/68));STEP=Math.max(8,Math.min(18,(W-CW-12)/(N-1)));ROW_W=STEP*(N-1)+CW;cards.forEach((c,i)=>{c.x=(i-9.5)*STEP});if(phase==='shuffling')buildScatter()}
window.addEventListener('resize',layoutDeck);layoutDeck();

let enterStart=performance.now(),last=performance.now();
function frame(now){
  const dt=Math.min(50,now-last);last=now;
  if(plan){const t=now-start;for(const k in plan.tracks)V[k]=track(t,plan.tracks[k])}
  const a=plan?plan.amount:{g:0,x:0,y:0,r:0};
  halo.style.opacity=V.halo;
  cards.forEach((c,i)=>{
    c.enter=REDUCED_MOTION?1:Math.min(1,(now-enterStart-i*28)/520);const en=c.enter<0?0:ease.out3(c.enter);
    const target=hovered===i?1:0;c.press+=(target-c.press)*(1-Math.exp(-dt/(target?55:65)));
    const sel=selected===i;
    if(sel){
      const m=V.move,x=c.x*(1-m),y=c.y*(1-m)+CENTER_Y*m+V.lift*-12+V.hover*-5,r=c.r*(1-m)+V.shake*2.4;
      const s=(1+(BIG-1)*m)*(1+.1*V.lift)*(1+.08*V.emph);
      c.el.style.transform=`translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;c.el.style.zIndex=100;c.el.style.opacity=1;
      halo.style.transform=`translate(${x}px,${y}px) scale(${.82+.22*V.halo})`;
      c.flipper.style.transform=plan&&plan.reveal==='fade'?'none':`rotateY(${V.flip*180}deg)`;
      if(plan&&plan.reveal==='fade'){c.back.style.opacity=1-V.fade;c.front.style.opacity=V.fade;c.front.style.transform='none'}else{c.back.style.opacity=1;c.front.style.opacity=1;c.front.style.transform='rotateY(180deg)'}
      c.veil.style.opacity=V.veil*.62;c.aura.style.opacity=V.aura;c.shine.style.opacity=V.aura*.85;
    }else{
      const d=selected===null?0:i-selected,rip=d&&Math.abs(d)<=3?Math.sign(d)*(4-Math.abs(d))*2.5:0;
      const q=V.shuffle;
      const sx=track(q,c.kx),sy=track(q,c.ky),sr=track(q,c.kr),ss=track(q,c.ks);
      const x=c.x+(1-en)*-c.x+V.exit*(i<10?-34:34)+V.focus*rip+sx;
      const y=c.y+(1-en)*60+V.exit*30+c.press*-4+sy;
      const s=(.72+.28*en)*(1+.035*c.press)*(1-.04*V.focus)*ss;
      c.el.style.transform=`translate(${x}px,${y}px) rotate(${c.r+sr}deg) scale(${s})`;
      c.el.style.zIndex=hovered===i?100:(c.press>.02?99:c.ord);
      c.el.style.opacity=en*(1-.4*V.focus)*(1-.55*V.exit);
      c.flipper.style.transform='none';c.back.style.opacity=1;c.aura.style.opacity=c.press;c.shine.style.opacity=c.press;
    }
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
Promise.all(['card-back-v5.png','death-card-v5.png','king-card-v5.png'].map(name=>new Promise(resolve=>{const img=new Image();img.onload=resolve;img.onerror=resolve;img.src='../tarot-assets/'+name}))).then(()=>{document.body.classList.remove('loading');sub.textContent='';hint.textContent='';reset()});

// controls
document.querySelectorAll('.seg').forEach(seg=>{const key=seg.dataset.key;OPTIONS[key].forEach(([v,l])=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>{settings[key]=v;render();try{localStorage.setItem('today-tarot-web-settings-v1',JSON.stringify(settings))}catch(e){}};b.dataset.v=String(v);seg.appendChild(b)})});
function render(){document.querySelectorAll('.seg').forEach(seg=>seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===String(settings[seg.dataset.key]))))}
render();
