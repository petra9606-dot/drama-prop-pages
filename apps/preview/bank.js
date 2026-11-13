/* 하늘은행 웹 체험 · DisolveWorks
   실제 APK(Compose) 화면과 같은 구성. 숨은 버튼·인물 전환·알림 동작도 같다. */
(function () {
  const PROFILES = [{"id": "eunju", "label": "최은주", "user": "최은주", "acctName": "하늘 자유입출금통장", "acctNo": "112-0482-••••07", "start": 2286910, "txs": [{"d": "2026-11-01", "t": "08:41", "n": "해맑은편의점", "a": -4300, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-01", "t": "11:20", "n": "행복마트 휘경점", "a": -38750, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-01", "t": "16:05", "n": "도레미피아노학원", "a": -150000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-01", "t": "21:13", "n": "빠른배송몰", "a": -27900, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-02", "t": "09:12", "n": "하늘정기적금 해지", "a": 10215400, "c": "적금해지", "m": "적금해지"}, {"d": "2026-11-02", "t": "10:34", "n": "에덴인베스트", "a": -10000000, "c": "인터넷뱅킹 이체", "m": "인터넷뱅킹 이체"}, {"d": "2026-11-02", "t": "14:22", "n": "푸른약국", "a": -8600, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-02", "t": "18:47", "n": "한우마을정육점", "a": -23000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-03", "t": "09:03", "n": "에덴인베스트", "a": 30000, "c": "타행입금", "m": "타행입금"}, {"d": "2026-11-03", "t": "12:15", "n": "행복마트 휘경점", "a": -15480, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-03", "t": "17:40", "n": "크린세탁", "a": -9000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-04", "t": "07:55", "n": "한빛도시가스", "a": -46210, "c": "자동이체", "m": "자동이체"}, {"d": "2026-11-04", "t": "09:31", "n": "에덴인베스트", "a": 30000, "c": "타행입금", "m": "타행입금"}, {"d": "2026-11-04", "t": "13:02", "n": "엄마손반찬", "a": -22000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-04", "t": "20:10", "n": "최은희", "a": -50000, "c": "모바일이체", "m": "모바일이체"}, {"d": "2026-11-05", "t": "09:17", "n": "에덴인베스트", "a": 30000, "c": "타행입금", "m": "타행입금"}, {"d": "2026-11-05", "t": "10:48", "n": "하늘텔레콤", "a": -56300, "c": "자동이체", "m": "자동이체"}, {"d": "2026-11-05", "t": "15:36", "n": "미소헤어", "a": -25000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-05", "t": "19:22", "n": "해맑은편의점", "a": -6700, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-06", "t": "08:30", "n": "이장훈", "a": 500000, "c": "타행입금", "m": "타행입금"}, {"d": "2026-11-06", "t": "09:48", "n": "에덴인베스트", "a": 30000, "c": "타행입금", "m": "타행입금"}, {"d": "2026-11-06", "t": "11:05", "n": "행복마트 휘경점", "a": -61240, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-06", "t": "16:30", "n": "휘경동엄마모임", "a": -30000, "c": "모바일이체", "m": "모바일이체"}, {"d": "2026-11-07", "t": "09:06", "n": "에덴인베스트", "a": 30000, "c": "타행입금", "m": "타행입금"}, {"d": "2026-11-07", "t": "10:12", "n": "한결생명", "a": -87000, "c": "자동이체", "m": "자동이체"}, {"d": "2026-11-07", "t": "14:44", "n": "빠른배송몰", "a": -19800, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-07", "t": "18:20", "n": "싱싱야채", "a": -7500, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-08", "t": "10:02", "n": "에덴인베스트", "a": 30000, "c": "타행입금", "m": "타행입금"}, {"d": "2026-11-08", "t": "12:37", "n": "꼬마김밥", "a": -12000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-08", "t": "17:55", "n": "하늘카드", "a": -284350, "c": "카드대금", "m": "카드대금"}, {"d": "2026-11-09", "t": "09:21", "n": "에덴인베스트", "a": 30000, "c": "타행입금", "m": "타행입금"}, {"d": "2026-11-09", "t": "11:47", "n": "행복마트 휘경점", "a": -24900, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-09", "t": "13:30", "n": "용맹태권도", "a": -130000, "c": "체크카드", "m": "체크카드 승인"}], "live": {"d": "2026-11-10", "t": "09:15", "n": "에덴인베스트", "a": 30000, "c": "타행입금", "m": "이자 입금"}}, {"id": "dongjae", "label": "백동재", "user": "백동재", "acctName": "하늘 직장인 급여통장", "acctNo": "112-0731-••••46", "start": 5303300, "txs": [{"d": "2026-11-03", "t": "08:12", "n": "하늘교통", "a": -1550, "c": "후불교통", "m": "후불교통"}, {"d": "2026-11-03", "t": "12:20", "n": "든든한끼 백반", "a": -9000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-04", "t": "09:00", "n": "다솜빌 월세", "a": -550000, "c": "자동이체", "m": "자동이체"}, {"d": "2026-11-04", "t": "19:42", "n": "하늘마트 상도점", "a": -32400, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-05", "t": "10:48", "n": "하늘텔레콤", "a": -61200, "c": "자동이체", "m": "자동이체"}, {"d": "2026-11-06", "t": "12:31", "n": "든든한끼 백반", "a": -9000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-06", "t": "22:15", "n": "해맑은편의점", "a": -8900, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-07", "t": "18:03", "n": "김선배", "a": 50000, "c": "모바일입금", "m": "모바일입금"}, {"d": "2026-11-08", "t": "13:10", "n": "빠른배송몰", "a": -24800, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-09", "t": "20:30", "n": "골목포차", "a": -46000, "c": "체크카드", "m": "체크카드 승인"}], "live": {"d": "2026-11-10", "t": "09:00", "n": "(주)한빛물산", "a": 2850000, "c": "급여이체", "m": "급여"}}, {"id": "dohee", "label": "김도희", "user": "김도희", "acctName": "하늘 자유입출금통장", "acctNo": "112-0915-••••02", "start": 427800, "txs": [{"d": "2026-11-03", "t": "10:05", "n": "달빛카페", "a": -5800, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-03", "t": "15:40", "n": "하늘서점", "a": -16200, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-04", "t": "11:30", "n": "엄마", "a": 100000, "c": "모바일입금", "m": "용돈"}, {"d": "2026-11-04", "t": "19:10", "n": "봄날분식", "a": -11000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-05", "t": "10:48", "n": "하늘텔레콤", "a": -38500, "c": "자동이체", "m": "자동이체"}, {"d": "2026-11-06", "t": "14:22", "n": "소소옷가게", "a": -39000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-07", "t": "09:15", "n": "하늘교통", "a": -1450, "c": "후불교통", "m": "후불교통"}, {"d": "2026-11-08", "t": "17:55", "n": "달빛카페", "a": -6300, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-11-09", "t": "21:40", "n": "빠른배송몰", "a": -22900, "c": "체크카드", "m": "체크카드 승인"}], "live": {"d": "2026-11-10", "t": "10:20", "n": "엄마", "a": 50000, "c": "모바일입금", "m": "용돈"}}, {"id": "janghoon", "label": "이장훈 (기존)", "user": "이장훈", "acctName": "생활비 입출금통장", "acctNo": "312-08-••••-472", "start": 2363400, "txs": [{"d": "2026-09-08", "t": "19:40", "n": "더온 한정식 식당", "a": -470000, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-09-10", "t": "09:16", "n": "이장훈", "a": 1000000, "c": "하늘은행 이체", "m": "생활비"}, {"d": "2026-09-11", "t": "23:08", "n": "UI 편의점", "a": -7800, "c": "체크카드", "m": "체크카드 승인"}, {"d": "2026-09-12", "t": "18:42", "n": "한국KY주유소", "a": -100000, "c": "체크카드", "m": "체크카드 승인"}], "live": {"d": "2026-09-12", "t": "21:47", "n": "SPHINX HOLDINGS", "a": 3500000000, "c": "타행이체", "m": "투자금 입금"}}];
  const esc = PV.esc, won = n => Math.abs(n).toLocaleString('ko-KR');
  const st = { pid: 'eunju', fired: false, screen: 'home', sel: null, picker: false, lock: false, push: false, toast: '', flash: false, hot: false };
  const P = () => PROFILES.find(p => p.id === st.pid);
  const LOGO = '<svg width="26" height="26" viewBox="0 0 56 56"><g transform="translate(-26 -26)" fill="#fff"><path d="M30,29h48v10h-48z"/><path d="M30,49h39v10h-39z"/><path d="M39,69h39v10h-39z"/><path d="M30,29h10v30h-10z"/><path d="M68,49h10v30h-10z"/></g></svg>';

  function computed() {
    const p = P();
    const rows = p.txs.map(t => ({ t, live: false })).concat(st.fired ? [{ t: p.live, live: true }] : []);
    rows.sort((a, b) => (a.t.d + a.t.t < b.t.d + b.t.t ? -1 : 1));
    let bal = p.start;
    return rows.map((r, i) => { bal += r.t.a; const [y, m, d] = r.t.d.split('-');
      return { ...r.t, live: r.live, bal, y, md: m + '.' + d, id: 'TX-' + r.t.d.replace(/-/g, '') + '-' + r.t.t.replace(':', '') + String(i).padStart(2, '0') }; });
  }
  const balance = () => { const c = computed(); return c.length ? c[c.length - 1].bal : P().start; };

  function home() {
    const p = P();
    return `<div class="app bk pale"><div class="scroll">
      <div class="bk-home-top"><h1 class="tap" id="homeTitle">홈</h1><span class="bk-pill tap" id="pill">● ${esc(p.user)}님</span><span class="bk-bell">♧<i></i></span></div>
      <div class="bk-promo"><div class="bk-sym big">S</div><div style="flex:1;margin-left:16px"><b>일상에 여유를 더하는 금융</b><span>하늘 라이프 혜택 확인하기</span></div><span style="color:#687384;font-size:24px">×</span></div>
      <div class="bk-card bk-acct tap" data-go="list"><div class="t"><b>${esc(p.acctName)}</b><span>${esc(p.acctNo)}</span><em>⋮</em></div>
        <div class="bk-bal">${won(balance())}원</div>
        <div class="bk-btns"><div class="bk-btn">거래내역</div><div class="bk-btn dark">이체하기</div></div></div>
      <div class="bk-card bk-shortcuts"><div><span class="bk-sym">₩</span>내 자산</div><div><span class="bk-sym">⇄</span>자동이체</div><div><span class="bk-sym">ϟ</span>자동충전</div><div><span class="bk-sym">▦</span>편집하기</div></div>
      <div class="bk-card bk-asset"><div class="h"><b>내 자산</b><span>관리</span></div><div class="k">예금 · 입출금</div>
        <div class="r"><span class="bk-logo">${LOGO}</span><div><b>하늘은행</b><span>${esc(p.acctName)}</span></div><b>${won(balance())}원</b></div></div>
      <div style="height:24px"></div></div>
      <div class="bk-nav"><div class="on"><i>⌂</i>홈</div><div><i>▰</i>상품</div><div><i>↗</i>이체</div><div><i>◇</i>자산</div><div><i>≡</i>전체</div></div></div>`;
  }
  function list() {
    const p = P(), rows = computed().slice().reverse();
    return `<div class="app bk white"><div class="bk-head"><span class="back tap" data-go="home">‹</span><h2></h2><span>관리</span></div><div class="scroll" style="padding:0">
      <div class="bk-list-top"><h1>${esc(p.acctName)}</h1><div class="no">${esc(p.acctNo)}  ▣</div><div class="bk-bal">${won(balance())}원</div>
      <div class="bk-btns" style="margin-top:28px"><div class="bk-btn">내역 받기</div><div class="bk-btn dark">이체하기</div></div></div>
      <div class="bk-band"></div><div class="bk-chips"><span class="on">1개월</span><span>3개월</span><span>직접설정</span><em>입출금 · 최신순⌄</em></div>
      ${rows.map(r => `<div class="bk-row tap${r.live && st.flash ? ' flash' : ''}" data-tx="${r.id}"><div class="in"><div class="d">${r.md}  |  ${r.t}</div>
        <div class="m"><div class="n"><b>${esc(r.n)}</b><span>${r.a > 0 ? '입금' : '출금'}</span></div><div class="a"><b class="${r.a > 0 ? 'dep' : ''}${Math.abs(r.a) >= 1e9 ? ' huge' : ''}">${r.a > 0 ? '+' : '-'}${won(r.a)}원</b><span>잔액 ${won(r.bal)}원</span></div></div></div></div>`).join('')}
      <div style="height:30px"></div></div></div>`;
  }
  function detail() {
    const all = computed(), r = all.find(x => x.id === st.sel) || all[all.length - 1], dep = r.a > 0;
    return `<div class="app bk white"><div class="bk-head"><span class="back tap" data-go="list">‹</span><h2>거래 상세</h2><span></span></div>
      <div class="bk-detail"><div class="bk-ico" style="color:${dep ? '#315FE7' : '#132B47'}">${dep ? '↓' : '↑'}</div><div class="who">${esc(r.n)}</div>
      <div class="amt${Math.abs(r.a) >= 1e9 ? ' huge' : ''}" style="color:${dep ? '#315FE7' : '#132B47'}">${dep ? '+' : '-'}${won(r.a)}원</div><hr>
      ${[['거래일시', r.y + '.' + r.md + '  ' + r.t], ['거래구분', dep ? '입금' : '출금'], ['거래처명', r.n], ['거래 후 잔액', won(r.bal) + '원'], ['적요', r.m], ['거래유형', r.c]]
        .map(([k, v]) => `<div class="bk-line"><span>${k}</span><b>${esc(v)}</b></div>`).join('')}
      <div class="txid">거래번호 ${r.id}</div><div class="ok tap" data-go="list">확인</div></div></div>`;
  }
  function settings() {
    const p = P();
    return `<div class="app bk white"><div class="bk-head"><span class="back tap" data-go="home">‹</span><h2>소품 설정</h2><span></span></div><div class="scroll bk-set">
      <h4>계좌 선택 (선택하면 바로 바뀌어요)</h4><div class="chips">${PROFILES.map(x => `<span class="tap${x.id === st.pid ? ' on' : ''}" data-pid="${x.id}">${esc(x.label)}</span>`).join('')}</div>
      <p class="hint">촬영 중 바꾸기: 홈 화면 오른쪽 위 '○○님' 표시를 빠르게 5번 누르기</p>
      <h4>계좌 정보</h4>${[['홈 화면 이름 (○○님)', p.user], ['통장 이름', p.acctName], ['계좌번호', p.acctNo], ['시작 잔액', won(p.start)]].map(([k, v]) => `<div class="f"><small>${k}</small><div>${esc(v)}</div></div>`).join('')}
      <h4>거래내역 (${p.txs.length}건)</h4>${p.txs.slice(-4).map(t => `<div class="tx"><span>${t.d.slice(5)} ${t.t} · ${esc(t.n)}</span><b class="${t.a > 0 ? 'dep' : ''}">${t.a > 0 ? '+' : '-'}${won(t.a)}</b></div>`).join('')}
      <p class="hint">APK에서는 거래를 추가·삭제·수정하고 날짜를 한 번에 옮길 수 있어요.</p>
      <h4>숨은 버튼 거래 (탭하면 들어옴)</h4><div class="tx"><span>${esc(p.live.n)} · ${esc(p.live.c)}</span><b class="${p.live.a > 0 ? 'dep' : ''}">${p.live.a > 0 ? '+' : '-'}${won(p.live.a)}</b></div>
      <p class="hint">화면 끈 상태로 받기: 초(예: 10)를 적고 저장 → 숨은 버튼 탭 → 전원 버튼으로 화면 끄기. 정한 시간 뒤 잠금화면에 하늘은행 알림이 떠요.</p>
      <h4>숨은 버튼</h4><div class="chips"><span class="on">오른쪽 아래</span><span>왼쪽 아래</span><span>오른쪽 위</span></div><p class="hint">탭 = 거래 들어옴 · 길게 누르기 = 되돌리기</p><div style="height:20px"></div></div>
      <div class="bk-foot"><div>기본값 복원</div><div class="dark tap" data-go="home">저장하고 닫기</div></div></div>`;
  }
  function pushText() {
    const p = P(), t = p.live, dg = p.acctNo.replace(/\D/g, '');
    const masked = dg.length >= 5 ? dg.slice(0, 3) + '-****-**' + dg.slice(-2) : p.acctNo;
    return `[${t.a > 0 ? '입금' : '출금'}] ${won(t.a)}원 ${t.n} ${t.a > 0 ? '→' : '←'} ${masked} 잔액 ${won(balance())}원`;
  }
  function overlays() {
    let h = `<div class="bk-push${st.push ? ' on' : ''}"><div class="lg">${LOGO}</div><div style="flex:1;min-width:0"><div class="h"><b>하늘은행</b><span>지금</span></div><p>${esc(st.fired ? pushText() : '')}</p></div></div>`;
    if (st.lock) {
      const lt = P().live.t;
      h += `<div class="bk-lock tap" id="lock"><div class="clk">${lt}</div><div class="dt">11월 10일 월요일</div>
        ${st.fired ? `<div class="nt"><div class="lg">${LOGO.replace('26', '20').replace('26', '20')}</div><div style="flex:1"><div class="h"><b>하늘은행</b><span>지금</span></div><p>${esc(pushText())}</p></div></div>` : ''}
        <div class="hint">${st.fired ? '알림을 누르면 앱으로 돌아가요' : '화면 꺼짐 · 잠시 뒤 알림이 와요'}</div></div>`;
    }
    if (st.picker) h += `<div class="bk-dim" id="dim"><div class="bk-dialog"><h3>계좌 선택</h3>${PROFILES.map(x => `<div class="p tap${x.id === st.pid ? ' on' : ''}" data-pick="${x.id}">${esc(x.label)}${x.id === st.pid ? '<i>✓</i>' : ''}</div>`).join('')}<div class="x tap" id="pickClose">닫기</div></div></div>`;
    if (st.toast) h += `<div class="bk-toast">${esc(st.toast)}</div>`;
    if (!st.lock && st.screen !== 'settings') h += `<div class="bk-hot${st.hot ? ' show' : ''}" id="hot"></div>`;
    return h;
  }
  const VIEWS = { home, list, detail, settings };
  function draw() {
    const root = document.getElementById('app');
    root.innerHTML = VIEWS[st.screen]() + overlays();
    root.querySelectorAll('[data-go]').forEach(n => n.onclick = () => { st.screen = n.dataset.go; st.flash = false; draw(); });
    root.querySelectorAll('[data-tx]').forEach(n => n.onclick = () => { st.sel = n.dataset.tx; st.screen = 'detail'; draw(); });
    root.querySelectorAll('[data-pid],[data-pick]').forEach(n => n.onclick = () => pick(n.dataset.pid || n.dataset.pick));
    const pill = root.querySelector('#pill');
    if (pill) { let c = 0, last = 0; pill.onclick = () => { const now = Date.now(); c = now - last < 700 ? c + 1 : 1; last = now; if (c >= 5) { c = 0; st.picker = true; draw(); } }; }
    const ht = root.querySelector('#homeTitle'); if (ht) longPress(ht, 700, () => { st.screen = 'settings'; draw(); });
    const hot = root.querySelector('#hot'); if (hot) longPress(hot, 600, undo, fire);
    const dim = root.querySelector('#dim'); if (dim) root.querySelector('#pickClose').onclick = () => { st.picker = false; draw(); };
    const lock = root.querySelector('#lock'); if (lock && st.fired) lock.onclick = () => { st.lock = false; st.screen = 'list'; st.flash = true; draw(); };
    renderSide();
  }
  function longPress(node, ms, onLong, onTap) {
    let tm = null, long = false;
    node.addEventListener('pointerdown', e => { long = false; tm = setTimeout(() => { long = true; onLong(); }, ms); });
    node.addEventListener('pointerup', () => { clearTimeout(tm); if (!long && onTap) onTap(); });
    node.addEventListener('pointerleave', () => clearTimeout(tm));
  }
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function fire() {
    if (st.fired) return;
    st.push = false; st.fired = true; st.flash = true; draw();
    requestAnimationFrame(() => { st.push = true; draw(); });
    later(() => { st.push = false; draw(); }, 4200);
  }
  function undo() { clearTimers(); st.fired = false; st.push = false; st.lock = false; st.flash = false; if (st.screen === 'detail') st.screen = 'list'; toast('되돌림 (다음 테이크 준비)'); }
  function toast(m) { st.toast = m; draw(); later(() => { st.toast = ''; draw(); }, 1400); }
  function pick(id) { clearTimers(); st.pid = id; st.fired = false; st.push = false; st.picker = false; st.lock = false; st.screen = st.screen === 'settings' ? 'settings' : 'home'; toast(P().label + ' 계좌'); }
  function lockDemo() { clearTimers(); st.fired = false; st.lock = true; st.screen = 'home'; draw(); later(() => { st.fired = true; draw(); }, 3000); }

  function renderSide() {
    const box = document.getElementById('prof'); if (!box) return;
    box.innerHTML = PROFILES.map(x => `<button data-id="${x.id}" class="${x.id === st.pid ? 'on' : ''}">${esc(x.label)}</button>`).join('');
    box.querySelectorAll('button').forEach(b => b.onclick = () => pick(b.dataset.id));
    const hb = document.getElementById('hotShow'); if (hb) hb.textContent = st.hot ? '숨은 버튼 위치 숨기기' : '숨은 버튼 위치 보기';
  }
  document.getElementById('hotShow').onclick = () => { st.hot = !st.hot; draw(); };
  document.getElementById('lockDemo').onclick = lockDemo;

  const S = (id, label, cap, set) => ({ id, label, cap, set });
  const scenes = [
    S('home', '최은주 · 홈', '홈 화면. 오른쪽 위 이름표를 빠르게 5번 누르면 계좌 선택창이 떠요.', { pid: 'eunju', screen: 'home' }),
    S('list', '최은주 · 거래내역', '계좌 카드를 누르면 거래내역. 잔액은 거래마다 자동 계산돼요.', { pid: 'eunju', screen: 'list' }),
    S('deposit', '숨은 버튼 · 입금 들어옴', '오른쪽 아래 구석을 탭하면 푸시 알림과 함께 에덴인베스트 3만원이 들어와요. 길게 누르면 되돌리기.', { pid: 'eunju', screen: 'list', fired: true, push: true, flash: true }),
    S('detail', '거래 상세', '거래를 누르면 상세 화면이 열려요.', { pid: 'eunju', screen: 'detail', fired: true }),
    S('lock', '화면 꺼짐 · 잠금화면 알림', '숨은 버튼을 누르고 화면을 끄면, 정한 시간 뒤 잠금화면에 입금 알림이 떠요.', { pid: 'eunju', screen: 'home', fired: true, lock: true }),
    S('picker', '계좌 선택창', '최은주 · 백동재 · 김도희 · 이장훈 중 하나를 고르면 이름·계좌·잔액·거래내역이 모두 바뀌어요.', { pid: 'eunju', screen: 'home', picker: true }),
    S('dongjae', '백동재 · 홈', '백동재 급여통장. 숨은 버튼을 누르면 급여가 들어와요.', { pid: 'dongjae', screen: 'home' }),
    S('dohee', '김도희 · 거래내역', '김도희 자유입출금통장.', { pid: 'dohee', screen: 'list' }),
    S('janghoon', '이장훈 · 35억 입금', '기존 촬영분. 숨은 버튼을 누르면 SPHINX HOLDINGS 35억이 들어와요.', { pid: 'janghoon', screen: 'list', fired: true }),
    S('settings', '소품 설정', "'홈' 글자를 길게 누르면 열리는 설정. 인물별 이름·계좌·거래내역·숨은 거래를 현장에서 고쳐요.", { pid: 'eunju', screen: 'settings' })
  ];
  PV.boot({ scenes, render: s => {
    clearTimers();
    Object.assign(st, { fired: false, push: false, picker: false, lock: false, flash: false, toast: '', sel: null }, s.set);
    if (s.id === 'detail') st.sel = computed().slice(-1)[0].id;
    draw();
  } });
})();
