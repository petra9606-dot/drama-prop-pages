(() => {
  "use strict";
  const scene = document.body.dataset.scene;
  const configs = {
    crash: {
      id:"4부 19씬", name:"나루코인", symbol:"NARU", pair:"NARU/KRW", mark:"N", start:1284, end:124,
      duration:11500, clock:"14:31:42", prev:1282, market:"KRW 마켓", date:"5년 전"
    },
    listing: {
      id:"6부 62씬", name:"헤븐코인", symbol:"HAV", pair:"HAV/KRW", mark:"H", start:1000, end:2860,
      duration:12000, clock:"08:59:45", prev:1000, market:"KRW 마켓", date:"거래 개시 09:00"
    },
    otc: {
      id:"4부 34씬", name:"헤븐코인", symbol:"HAV", pair:"HAV/KRW", mark:"H", start:1000, end:3000,
      duration:10000, clock:"13:59:53", prev:1000, market:"장외거래", date:"런칭 당일"
    }
  };
  const cfg = configs[scene];
  let running = false;
  let startAt = 0;
  let elapsed = 0;
  let lastTick = 0;
  let raf = 0;
  let current = cfg.start;
  let progress = 0;
  let trades = [];
  const $ = (q, root=document) => root.querySelector(q);
  const nfmt = (n, digits=0) => Number(n).toLocaleString("ko-KR", {minimumFractionDigits:digits, maximumFractionDigits:digits});
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const ease = t => 1-Math.pow(1-t,3);

  function bitoneShell(){
    document.body.innerHTML = `<main class="screen">
      <header class="exchange-header">
        <div class="bitone-brand"><i class="brand-mark"></i><span>Bit<em>One</em></span></div>
        <nav class="exchange-nav"><span class="selected">거래소</span><span>입출금</span><span>투자내역</span><span>코인동향</span><span>고객지원</span></nav>
        <div class="header-fill"></div><div class="system-clock" id="clock"></div><div class="system-link">실시간 시세 연결</div>
      </header>
      <div class="ticker-strip"><b>BITONE MARKET</b><span>비트코인 <i class="up">+1.24%</i></span><span>이더리움 <i class="down">-0.38%</i></span><span>리플 <i class="up">+2.06%</i></span><span class="ticker-alert" id="headline"></span></div>
      <section class="workspace">
        <div class="main-stack">
          <section class="panel instrument">
            <div class="coin-symbol">${cfg.mark}</div>
            <div class="coin-name"><h1>${cfg.name}</h1><small>${cfg.pair} · ${cfg.market}</small></div>
            <div class="quote"><strong id="price">${nfmt(cfg.start)}<small>KRW</small></strong><div class="change" id="change">0.00% &nbsp; 0</div></div>
            <div class="quote-stats"><span>고가</span><b id="high">${nfmt(cfg.start)}</b><span>저가</span><b id="low">${nfmt(cfg.start)}</b><span>24H 거래량</span><b id="volume">0 ${cfg.symbol}</b><span>거래대금</span><b id="turnover">0 KRW</b></div>
            <span class="market-state" id="marketState"></span>
          </section>
          <section class="panel chart-panel">
            <div class="chart-toolbar"><span>1분</span><span class="selected">5분</span><span>15분</span><span>1시간</span><span>일</span><span>지표</span><span class="chart-title" id="chartTitle"></span></div>
            <div class="chart-wrap"><canvas id="chart"></canvas></div><div class="chart-legend"><b>${cfg.pair}</b><span id="ohlc"></span></div><div class="chart-watermark" id="watermark" hidden>09:00 거래 개시 예정</div>
          </section>
          <section class="lower-grid">
            <div class="panel orderbook"><div class="section-head">호가 <small>일반호가</small></div><div class="orderbook-head"><span>가격(KRW)</span><span>수량(${cfg.symbol})</span><span>누적</span></div><div id="asks"></div><div class="book-mid"><span id="bookPrice">${nfmt(cfg.start)}</span><small id="bookChange">0.00%</small></div><div id="bids"></div></div>
            <div class="panel trades-panel"><div class="section-head">실시간 체결 <small id="tradeStatus">체결 대기</small></div><div class="trade-head"><span>시간</span><span>체결가격</span><span>체결량</span></div><div id="trades"></div></div>
            <div class="panel order-panel"><div class="orderbox"><div class="side-tabs"><span>매수</span><span>매도</span></div><div class="balance-line"><span>주문가능</span><b>50,000,000 KRW</b></div><div class="field"><span>가격</span><strong id="orderPrice">${nfmt(cfg.start)}</strong><small>KRW</small></div><div class="field"><span>수량</span><strong>0</strong><small>${cfg.symbol}</small></div><div class="ratio"><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div><div class="balance-line"><span>주문총액</span><b>0 KRW</b></div><div class="order-button">${cfg.name} 매수</div><div class="order-note">최소 주문금액 5,000 KRW · 수수료 0.05%<br>시장 변동성이 큰 경우 주문 체결 가격이 달라질 수 있습니다.</div></div></div>
          </section>
        </div>
        <aside class="panel market-list"><div class="market-search"><div>코인명 / 심볼 검색</div></div><div class="market-list-head"><span>한글명</span><span>현재가</span><span>전일대비</span></div><div id="marketRows"></div><div class="market-foot">원화마켓 시세는 실시간으로 갱신됩니다.<br>투자 전 거래지원 공지와 유의사항을 확인하십시오.</div></aside>
      </section>
    </main>`;
  }

  function otcShell(){
    document.body.innerHTML = `<main class="screen">
      <header class="otc-header"><div class="otc-brand">코어마켓 <b>OTC</b><small>CORE MARKET KOREA</small></div><nav class="otc-nav"><span>대시보드</span><span class="selected">장외 시세</span><span>RFQ</span><span>체결내역</span><span>정산관리</span></nav><div class="otc-user">기관회원 04-2187 &nbsp; | &nbsp; KRW</div></header>
      <div class="otc-status"><b>OTC INDICATIVE BOARD</b><span>중개회원 간 장외 체결 참고정보</span><span>가격지연 0.2초</span><span style="margin-left:auto" id="clock"></span></div>
      <section class="otc-layout">
        <div class="otc-main">
          <section class="otc-panel otc-instrument"><div class="otc-token">H</div><div><h1>헤븐코인 <span class="otc-badge">상장 전 자산</span></h1><small>HAV / KRW · BLOCK TRADE REFERENCE</small></div><div class="otc-price"><strong id="price">1,000</strong><small>KRW</small><div class="otc-change" id="change">기준가 대비 0.00%</div></div><div class="otc-metrics"><span>기준가</span><b>1,000 KRW</b><span>금일 체결량</span><b id="volume">0 HAV</b><span>가중평균가</span><b id="vwap">1,000 KRW</b></div></section>
          <section class="otc-panel otc-chart"><div class="chart-toolbar"><span class="selected">실시간</span><span>1분</span><span>5분</span><span>누적</span><span class="chart-title" id="chartTitle">장외 체결 참고가</span></div><div class="chart-wrap"><canvas id="chart"></canvas></div><div class="chart-legend"><b>HAV / KRW</b><span id="ohlc">기준 1,000</span></div></section>
          <section class="otc-lower"><div class="otc-panel"><table class="otc-table"><thead><tr><th>체결시각</th><th>체결가</th><th>수량(HAV)</th><th>거래대금</th><th>구분</th></tr></thead><tbody id="otcTrades"></tbody></table></div><div class="otc-panel otc-tape"><div class="section-head" style="border-color:#2b3742;color:#aeb9c4">가격 단계 <small id="tradeStatus">대기</small></div><div id="tape"></div></div></section>
        </div>
        <aside class="otc-side"><section class="otc-panel"><h2>RFQ 견적 요청</h2><div class="otc-rfq"><label>자산</label><div class="read-field"><strong>헤븐코인 (HAV)</strong><span>KRW</span></div><label>요청 수량</label><div class="read-field"><strong>2,500,000</strong><span>HAV</span></div><label>정산 방식</label><div class="read-field"><strong>T+0 에스크로</strong><span>변경</span></div><label>유효 시간</label><div class="read-field"><strong>30초</strong><span>FOK</span></div><div class="quote-button">LP 4개사에 견적 요청</div></div><div class="otc-risk">장외거래 가격은 거래소 시세가 아닙니다. 표시 가격은 중개회원 간 체결 결과를 집계한 참고정보이며 실제 주문 가능 가격과 다를 수 있습니다.</div></section><section class="otc-panel"><h2>최근 블록 체결</h2><div class="otc-tape" id="sideTape"></div></section></aside>
      </section>
    </main>`;
  }

  function addOperator(){
    document.body.insertAdjacentHTML("beforeend", `<aside class="operator" id="operator" hidden><button class="operator-close" id="closeOperator">×</button><h2>${cfg.id} 촬영 제어</h2><p>화면에는 제어창이 나오지 않은 상태로 촬영하세요.<br>Space 시작·정지 / R 처음으로 / O 제어창</p><div class="operator-actions"><button class="primary" id="cueButton">연출 시작</button><button id="pauseButton">일시정지</button><button id="resetButton">처음으로</button><button id="fullscreenButton">전체화면</button></div></aside>`);
    $("#cueButton").onclick = cue;
    $("#pauseButton").onclick = pause;
    $("#resetButton").onclick = reset;
    $("#fullscreenButton").onclick = () => document.documentElement.requestFullscreen?.();
    $("#closeOperator").onclick = () => $("#operator").hidden = true;
  }

  function marketRows(){
    if(scene === "otc") return;
    const rows = scene === "crash" ? [
      [cfg.name,cfg.symbol,cfg.start,"0.00%"],["비트코인","BTC",93482000,"+1.24%"],["이더리움","ETH",3287000,"-0.38%"],["리플","XRP",824,"+2.06%"],["솔라나","SOL",187450,"+0.92%"],["에이다","ADA",542,"-1.27%"]
    ] : [
      [cfg.name,cfg.symbol,"-","거래 전"],["비트코인","BTC",93482000,"+1.24%"],["이더리움","ETH",3287000,"-0.38%"],["리플","XRP",824,"+2.06%"],["솔라나","SOL",187450,"+0.92%"],["에이다","ADA",542,"-1.27%"]
    ];
    $("#marketRows").innerHTML = rows.map((r,i)=>`<div class="market-item ${i===0?'selected':''}"><span><strong>${r[0]}</strong><small>${r[1]}/KRW</small></span><span class="m-price ${String(r[3]).startsWith('-')?'down':String(r[3]).startsWith('+')?'up':''}">${typeof r[2]==='number'?nfmt(r[2]):r[2]}</span><span class="${String(r[3]).startsWith('-')?'down':String(r[3]).startsWith('+')?'up':''}">${r[3]}</span></div>`).join("");
  }

  function init(){
    scene === "otc" ? otcShell() : bitoneShell();
    addOperator();
    marketRows();
    reset();
    window.addEventListener("resize", drawChart);
    document.addEventListener("keydown", e => {
      if(e.code === "Space"){e.preventDefault(); running ? pause() : cue();}
      if(e.key.toLowerCase()==="r") reset();
      if(e.key.toLowerCase()==="o") $("#operator").hidden = !$("#operator").hidden;
      if(e.key.toLowerCase()==="f") document.documentElement.requestFullscreen?.();
    });
  }

  function cue(){
    if(progress >= 1) reset();
    running = true;
    startAt = performance.now() - elapsed;
    $("#operator").hidden = true;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }
  function pause(){running=false;cancelAnimationFrame(raf);}
  function reset(){
    running=false;cancelAnimationFrame(raf);elapsed=0;progress=0;current=cfg.start;trades=[];lastTick=0;
    update(0,true);drawChart();
  }
  function frame(now){
    if(!running) return;
    elapsed = now-startAt;
    progress = clamp(elapsed/cfg.duration,0,1);
    update(progress,false);
    if(progress<1) raf=requestAnimationFrame(frame); else running=false;
  }

  function priceAt(p){
    if(scene === "crash"){
      if(p<.12) return cfg.start + Math.sin(p*60)*2;
      const q=(p-.12)/.88;
      const staged = q<.18 ? q*.35 : q<.52 ? .063+(q-.18)*1.8 : .675+(q-.52)*.68;
      return cfg.start-(cfg.start-cfg.end)*clamp(staged,0,1);
    }
    if(scene === "otc"){
      const stops=[0,0,.25,.5,.75,1,1];
      const idx=Math.min(5,Math.floor(p*6));
      const local=(p*6)-idx;
      const v=stops[idx]+(stops[idx+1]-stops[idx])*ease(local);
      return cfg.start+(cfg.end-cfg.start)*v;
    }
    if(p<.20) return cfg.start;
    const q=(p-.20)/.80;
    return cfg.start+(cfg.end-cfg.start)*(Math.pow(q,.72)+Math.sin(q*31)*.04*q*(1-q));
  }

  function update(p,force){
    current=Math.round(priceAt(p));
    if(scene==="otc") updateOtc(p,force); else updateExchange(p,force);
    if(force || performance.now()-lastTick>180){drawChart();lastTick=performance.now();}
  }

  function updateExchange(p,force){
    const isPre = scene==="listing" && p<.20;
    const change=(current-cfg.prev)/cfg.prev*100;
    const cls=change>=0?"up":"down";
    $("#price").innerHTML=`${nfmt(current)}<small>KRW</small>`;
    $("#price").className=cls;
    $("#change").className=`change ${cls}`;
    $("#change").textContent=`${change>=0?'+':''}${change.toFixed(2)}%   ${change>=0?'▲':'▼'} ${nfmt(Math.abs(current-cfg.prev))}`;
    $("#high").textContent=nfmt(scene==="crash"?1288:Math.max(cfg.start,current));
    $("#low").textContent=nfmt(scene==="crash"?Math.min(cfg.start,current):cfg.start);
    const vol = isPre?0:Math.round((scene==="crash"?8420000:1830000)*Math.max(.02,p));
    $("#volume").textContent=`${nfmt(vol)} ${cfg.symbol}`;
    $("#turnover").textContent=`${nfmt(vol*current)} KRW`;
    $("#bookPrice").textContent=nfmt(current);$("#bookPrice").className=cls;
    $("#bookChange").textContent=`${change>=0?'+':''}${change.toFixed(2)}%`;$("#bookChange").className=cls;
    $("#orderPrice").textContent=nfmt(current);
    $("#clock").textContent = scene==="listing" ? clockListing(p) : clockCrash(p);
    $("#headline").textContent = scene==="crash" ? "나루코인 가격 급변 · 투자 유의" : (isPre?"헤븐코인 거래 개시 예정 09:00":"헤븐코인 원화마켓 거래 개시");
    $("#marketState").textContent = scene==="crash" ? (p<.12?"정상 거래":"가격 급변") : (isPre?"거래 개시 전":"거래 중");
    $("#marketState").className=`market-state ${(scene==="crash"&&p>=.12)||!isPre?'live':''}`;
    $("#chartTitle").textContent=scene==="crash"?"나루코인 · 5분봉":"헤븐코인 · 1분봉";
    $("#watermark").hidden=!isPre;
    $("#tradeStatus").textContent=isPre?"체결 대기":"실시간";
    renderBook(isPre);
    if(!isPre && (force || trades.length===0 || Math.random()<.16)) pushTrade();
    renderTrades();
    const row=$("#marketRows .market-item:first-child");
    if(row){row.children[1].textContent=isPre?"-":nfmt(current);row.children[1].className=`m-price ${isPre?'':cls}`;row.children[2].textContent=isPre?"거래 전":`${change>=0?'+':''}${change.toFixed(2)}%`;row.children[2].className=isPre?'':cls;}
    $("#ohlc").textContent=`시 ${nfmt(cfg.start)}  고 ${nfmt(Math.max(cfg.start,current))}  저 ${nfmt(Math.min(cfg.start,current))}  종 ${nfmt(current)}`;
  }

  function renderBook(empty){
    const asks=[],bids=[];
    for(let i=5;i>=1;i--){
      const step=Math.max(1,Math.round(current*(scene==="crash"?.006:.008)));
      const q=Math.round((7200+(i*1937)+(progress*84211))*(1+(i%3)*.18));
      asks.push(bookRow(current+step*i,q,false,empty,i));
    }
    for(let i=1;i<=5;i++){
      const step=Math.max(1,Math.round(current*(scene==="crash"?.006:.008)));
      const q=Math.round((9300+(i*2351)+(progress*110421))*(1+(i%2)*.27));
      bids.push(bookRow(Math.max(1,current-step*i),q,true,empty,i));
    }
    $("#asks").innerHTML=asks.join("");$("#bids").innerHTML=bids.join("");
  }
  function bookRow(price,qty,bid,empty,i){
    if(empty)return `<div class="book-row empty"><span>-</span><span>-</span><span>-</span></div>`;
    return `<div class="book-row ${bid?'bid':''}" style="--depth:${25+(i*11)%68}%"><span class="${bid?'up':'down'}">${nfmt(price)}</span><span>${nfmt(qty)}</span><span>${nfmt(qty*(i+1))}</span></div>`;
  }
  function pushTrade(){
    const d=new Date();
    const sec=scene==="listing"?Math.floor(1+progress*11):Math.floor(42+progress*16)%60;
    const time=scene==="listing"?`09:00:${String(sec).padStart(2,'0')}`:`14:31:${String(sec).padStart(2,'0')}`;
    const wobble=1+((trades.length%4)-1.5)*.0015;
    trades.unshift({time,price:Math.max(1,Math.round(current*wobble)),qty:Math.round(1200+((trades.length*7919)%48000))});
    trades=trades.slice(0,9);
  }
  function renderTrades(){
    $("#trades").innerHTML=trades.length?trades.map((t,i)=>`<div class="trade-row"><span>${t.time}</span><span class="${i%3?'up':'down'}">${nfmt(t.price)}</span><span>${nfmt(t.qty)}</span></div>`).join(""):`<div style="padding:40px 12px;text-align:center;color:#a1acb8;font-size:10px">아직 체결 내역이 없습니다.</div>`;
  }

  function updateOtc(p,force){
    const ch=(current-cfg.prev)/cfg.prev*100;
    $("#price").textContent=nfmt(current);
    $("#change").textContent=`기준가 대비 +${ch.toFixed(2)}%`;
    const vol=Math.round(2500000*p);
    $("#volume").textContent=`${nfmt(vol)} HAV`;
    $("#vwap").textContent=`${nfmt(Math.round(cfg.start+(current-cfg.start)*.61))} KRW`;
    $("#clock").textContent=clockOtc(p);
    $("#tradeStatus").textContent=p===0?"대기":p<1?"체결 중":"완료";
    $("#ohlc").textContent=`기준 1,000  현재 ${nfmt(current)}  상승률 +${ch.toFixed(2)}%`;
    const steps=[.25,.5,.75,1];
    const labels=["+50.00%","+100.00%","+150.00%","+200.00%"];
    const prices=[1500,2000,2500,3000];
    const active=steps.filter(s=>p>=s).length;
    const rows=[];
    for(let i=0;i<Math.max(active,1);i++){
      const ii=Math.min(i,3), qty=[350000,525000,710000,915000][ii];
      rows.unshift(`<tr><td>14:00:${String(2+ii*2).padStart(2,'0')}</td><td class="hot">${nfmt(prices[ii])}</td><td>${nfmt(qty)}</td><td>${nfmt(prices[ii]*qty)}</td><td>중개체결</td></tr>`);
    }
    $("#otcTrades").innerHTML=rows.join("") + `<tr><td>13:58:41</td><td>1,000</td><td>120,000</td><td>120,000,000</td><td>기준체결</td></tr>`;
    $("#tape").innerHTML=prices.map((v,i)=>`<div class="tape-row"><span>${labels[i]}</span><b style="opacity:${p>=steps[i]?1:.25}">${nfmt(v)}</b><span>${p>=steps[i]?'도달':'-'}</span></div>`).join("");
    $("#sideTape").innerHTML=rows.length?rows.slice(0,5).map((_,i)=>`<div class="tape-row"><span>14:00:${String(8-i).padStart(2,'0')}</span><b>${nfmt(Math.max(1000,current-i*12))}</b><span>${nfmt(915000-i*83500)}</span></div>`).join(""):`<div style="padding:25px 0;color:#687887;font-size:10px;text-align:center">신규 체결 대기</div>`;
  }

  function clockCrash(p){const s=42+Math.floor(p*15);return `14:31:${String(s).padStart(2,'0')}`;}
  function clockListing(p){const total=Math.floor(p*27);if(total<15)return `08:59:${String(45+total).padStart(2,'0')}`;return `09:00:${String(total-15).padStart(2,'0')}`;}
  function clockOtc(p){const total=53+Math.floor(p*17);if(total<60)return `13:59:${String(total).padStart(2,'0')}`;return `14:00:${String(total-60).padStart(2,'0')}`;}

  function drawChart(){
    const canvas=$("#chart");if(!canvas)return;
    const box=canvas.getBoundingClientRect();if(box.width<10||box.height<10)return;
    const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);
    const ctx=canvas.getContext("2d");ctx.scale(dpr,dpr);const w=box.width,h=box.height;
    const dark=scene==="otc";ctx.clearRect(0,0,w,h);
    const pad={l:20,r:72,t:24,b:29},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
    ctx.strokeStyle=dark?"#27323c":"#edf0f4";ctx.lineWidth=1;
    for(let i=0;i<=5;i++){const y=pad.t+ch*i/5;ctx.beginPath();ctx.moveTo(pad.l,y+.5);ctx.lineTo(w-pad.r,y+.5);ctx.stroke();}
    for(let i=0;i<=8;i++){const x=pad.l+cw*i/8;ctx.beginPath();ctx.moveTo(x+.5,pad.t);ctx.lineTo(x+.5,h-pad.b);ctx.stroke();}
    const points=[];const count=64;
    for(let i=0;i<count;i++){
      const t=i/(count-1);let v;
      if(t<=progress){v=priceAt(t)+(Math.sin(i*1.91)+Math.sin(i*.43))*cfg.start*(scene==="crash"?.002:scene==="otc"?.006:.004)*Math.min(1,t*3);}else{v=priceAt(progress);}
      points.push(v);
    }
    let min,max;
    if(scene==="crash"){min=80;max=1340;}else if(scene==="otc"){min=850;max=3200;}else{min=850;max=3100;}
    const x=i=>pad.l+cw*i/(count-1), y=v=>pad.t+ch-(v-min)/(max-min)*ch;
    ctx.font="10px Arial";ctx.fillStyle=dark?"#687987":"#96a2b2";ctx.textAlign="left";
    for(let i=0;i<=5;i++){const val=max-(max-min)*i/5;ctx.fillText(nfmt(Math.round(val)),w-pad.r+9,pad.t+ch*i/5+4);}
    ctx.textAlign="center";const times=scene==="otc"?["13:58","13:59","14:00","14:01"]:scene==="listing"?["08:59:40","08:59:50","09:00:00","09:00:10"]:["13:55","14:05","14:15","14:25"];
    times.forEach((t,i)=>ctx.fillText(t,pad.l+cw*i/(times.length-1),h-9));
    if(scene==="listing"&&progress<.20){
      ctx.setLineDash([4,4]);ctx.strokeStyle="#aab5c2";ctx.beginPath();ctx.moveTo(pad.l,y(cfg.start));ctx.lineTo(w-pad.r,y(cfg.start));ctx.stroke();ctx.setLineDash([]);return;
    }
    if(scene==="otc"){
      ctx.beginPath();points.forEach((v,i)=>{const xx=x(i),yy=y(v);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);});ctx.strokeStyle="#ef6a58";ctx.lineWidth=2;ctx.stroke();
      ctx.lineTo(x(count-1),h-pad.b);ctx.lineTo(x(0),h-pad.b);ctx.closePath();ctx.fillStyle="#ef6a5814";ctx.fill();
    }else{
      const visible=Math.max(8,Math.floor(progress*(count-1)));
      const bar=Math.max(3,cw/count*.58);
      for(let i=0;i<count;i++){
        const base=points[Math.max(0,i-1)],close=points[i];
        const open=i?base:cfg.start;const hi=Math.max(open,close)*(1+.003+(i%4)*.0015),lo=Math.min(open,close)*(1-.003-(i%3)*.0013);
        const color=close>=open?"#d44747":"#3973c9";ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x(i),y(hi));ctx.lineTo(x(i),y(lo));ctx.stroke();
        ctx.fillRect(x(i)-bar/2,Math.min(y(open),y(close)),bar,Math.max(1.4,Math.abs(y(open)-y(close))));
        if(i>visible&&scene==="listing")break;
      }
      ctx.beginPath();points.forEach((v,i)=>{if(scene==="listing"&&i>visible)return;const avg=points.slice(Math.max(0,i-4),i+1).reduce((a,b)=>a+b,0)/Math.min(5,i+1);i?ctx.lineTo(x(i),y(avg)):ctx.moveTo(x(i),y(avg));});ctx.strokeStyle="#c79c48";ctx.lineWidth=1.2;ctx.stroke();
    }
    ctx.setLineDash([4,3]);ctx.strokeStyle=dark?"#bd675d":"#be6a66";ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(pad.l,y(current));ctx.lineTo(w-pad.r,y(current));ctx.stroke();ctx.setLineDash([]);
  }

  init();
})();
