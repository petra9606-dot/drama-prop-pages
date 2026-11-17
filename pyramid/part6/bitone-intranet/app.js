/* 피라밋 6부 9씬 · 비트원 사내 포털. 모든 결재는 이 탭 안에서만 처리한다. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (name, cls = '') => `<svg class="${esc(cls)}" aria-hidden="true"><use href="#i-${esc(name)}"/></svg>`;
  const STORE = 'bitone-intranet-settings-v1';
  const SESSION = 'bitone-intranet-decision-v1';
  const defaults = {confirmMode:'confirm',delay:600,date:'',time:'08:40',openTime:'09:00',fontScale:1,documentNo:'BT-LST-000127'};
  const states = {pending:'결재 대기',approved:'승인 완료',rejected:'반려',held:'결재 보류'};
  let config = {...defaults};
  let decision = {status:'pending',comment:'',time:'',events:[]};
  let view = 'home';
  let activeDocumentTab = 'attachments';
  let action = 'approve';
  let busy = false;
  let actionTimer;
  let toastTimer;
  let freshApproval = false;
  const params = new URLSearchParams(location.search);

  function validSettings(value) {
    const result = {...defaults};
    if (!value || typeof value !== 'object') return result;
    if (['confirm','direct'].includes(value.confirmMode)) result.confirmMode = value.confirmMode;
    if ([0,600,1200].includes(Number(value.delay))) result.delay = Number(value.delay);
    if (value.date === '' || /^\d{4}-\d{2}-\d{2}$/.test(value.date || '')) result.date = value.date;
    for (const key of ['time','openTime']) if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value[key] || '')) result[key] = value[key];
    if ([1,1.08,1.16].includes(Number(value.fontScale))) result.fontScale = Number(value.fontScale);
    if (typeof value.documentNo === 'string' && value.documentNo.trim()) result.documentNo = value.documentNo.trim().slice(0,32);
    return result;
  }
  try { config = validSettings(JSON.parse(localStorage.getItem(STORE))); } catch (_) {}
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION));
    if (saved && Object.hasOwn(states, saved.status)) decision = {status:saved.status,comment:String(saved.comment || '').slice(0,240),time:String(saved.time || '').slice(0,40),events:Array.isArray(saved.events) ? saved.events.filter(e=>e && Object.hasOwn(states,e.status)).slice(-20).map(e=>({status:e.status,comment:String(e.comment || '').slice(0,240),time:String(e.time || '').slice(0,40)})) : []};
  } catch (_) {}
  if (Object.hasOwn(states, params.get('state'))) decision = {status:params.get('state'),comment:'',time:params.get('state') === 'pending' ? '' : config.time,events:[]};
  document.documentElement.style.setProperty('--scale', String(config.fontScale));
  if (params.get('focus') === '1') document.body.classList.add('focus-document');

  const otherDocuments = [
    {id:'ops',no:'BT-OPS-000086',title:'원화마켓 유동성 점검 결과보고',department:'거래운영팀',author:'거래운영팀장',status:'pending',category:'업무보고',time:'08:20'},
    {id:'duty',no:'BT-HR-000042',title:'주말 시장 모니터링 근무 승인 요청',department:'시장감시팀',author:'시장감시팀장',status:'pending',category:'근무신청',time:'08:05'},
    {id:'security',no:'BT-SEC-000031',title:'임직원 정보보호 교육 시행 계획',department:'정보보호팀',author:'정보보호책임자',status:'approved',category:'업무품의',time:'전일'},
    {id:'wallet',no:'BT-OPS-000083',title:'거래지원 자산 지갑 정기점검 결과',department:'지갑운영팀',author:'지갑운영팀장',status:'approved',category:'업무보고',time:'전일'}
  ];
  const notices = [
    {id:'notice-security',title:'외부 자료 반출 및 문서 보안 관리 안내',team:'정보보호팀',tag:'필독',body:'대외비 문서는 업무상 필요한 임직원에 한하여 열람하시기 바랍니다. 거래지원 심사 자료와 고객 관련 정보는 승인된 내부 업무 경로를 통해서만 공유해 주시기 바랍니다. 외부 반출이 필요한 경우 소속 부서의 사전 승인을 요청해 주십시오.'},
    {id:'notice-maintenance',title:'업무 시스템 정기 점검 안내',team:'IT운영팀',tag:'안내',body:'안정적인 업무 환경 제공을 위해 업무 시간 외 정기 점검을 진행합니다. 진행 중인 문서는 미리 저장해 주시고, 점검 시간 중 시스템 문의는 IT운영팀으로 전달해 주시기 바랍니다.'},
    {id:'notice-listing',title:'신규 거래지원 공지 등록 절차 안내',team:'거래지원팀',tag:'업무',body:'신규 거래지원 건은 최종 결재 완료 후 공지 등록 및 거래 개시 일정을 별도로 확정합니다. 결재 완료만으로 고객 공지나 주문 접수가 즉시 시작되지 않으며, 거래운영팀의 개시 절차에 따라 진행됩니다.'}
  ];
  const attachments = [
    {id:'review',name:'헤븐코인_거래지원_심의결과서.pdf',size:'자료 01',type:'PDF'},
    {id:'risk',name:'헤븐코인_위험검토_의견서.pdf',size:'자료 02',type:'PDF'},
    {id:'operations',name:'헤븐코인_거래개시_운영계획.pdf',size:'자료 03',type:'PDF'}
  ];
  const pending = () => decision.status === 'pending' || decision.status === 'held';
  const pendingCount = () => otherDocuments.filter(x => x.status === 'pending').length + Number(pending());
  const completedCount = () => otherDocuments.filter(x => x.status === 'approved').length + Number(decision.status === 'approved');
  const clock = (time = config.time) => config.date ? `${config.date.replaceAll('-','.')} ${time}` : time;
  const dateCaption = () => config.date ? config.date.replaceAll('-','. ') : '대표이사 업무 현황';
  const mainDoc = () => ({id:'heaven',no:config.documentNo,title:'헤븐코인 신규 상장 승인 요청',department:'거래지원팀',author:'거래지원팀장',status:decision.status,category:'거래지원 품의',time:clock()});
  const pill = (status, label) => `<span class="status-pill ${esc(status)}"><i class="tiny-dot"></i>${esc(label || states[status] || status)}</span>`;
  const button = (label, attributes = '', cls = '') => `<button type="button" class="button ${cls}" ${attributes}>${label}</button>`;
  const heading = (eyebrow, title, description = '') => `<div class="page-heading"><div><span class="eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1>${description ? `<p class="heading-sub">${esc(description)}</p>` : ''}</div><span class="date-label">${esc(dateCaption())}</span></div>`;

  function persist() { try { sessionStorage.setItem(SESSION, JSON.stringify(decision)); } catch (_) {} }
  function toast(message) {
    clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('show');
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2700);
  }
  function updateNavigation() {
    const approval = ['inbox','document','completed','returned','reference'].includes(view);
    const mainNav = approval ? 'approval' : view;
    $$('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === mainNav));
    $('#approvalSubnav').classList.toggle('visible', approval);
    $$('[data-sub]').forEach(el => el.classList.toggle('active', el.dataset.sub === view || view === 'document' && el.dataset.sub === (decision.status === 'approved' ? 'completed' : decision.status === 'rejected' ? 'returned' : 'inbox')));
    $$('[data-pending-count]').forEach(el => { el.textContent = String(pendingCount()); });
    $('#topTitle').textContent = ({home:'업무 홈',inbox:'전자결재',document:'전자결재',completed:'전자결재',returned:'전자결재',reference:'전자결재',listing:'거래지원 관리',notices:'공지사항',organization:'조직도',resources:'업무 자료실'})[view];
    document.title = view === 'document' ? `헤븐코인 상장 승인 · BitOne WORKPLACE` : `${$('#topTitle').textContent} · BitOne WORKPLACE`;
  }
  function navigate(next) {
    if (busy) return;
    if (location.hash === `#${next}`) { view = next; render(); }
    else location.hash = next;
  }

  function home() {
    return `<div class="page-heading welcome-heading"><div><span class="eyebrow">MY WORKPLACE</span><h1><strong>조지환</strong> 대표님, 안녕하세요.</h1><p class="heading-sub">확인이 필요한 업무와 결재 현황을 안내합니다.</p></div><span class="date-label">${esc(dateCaption())}</span></div>
      <section class="summary-grid" aria-label="내 업무 현황">
        <a class="stat-card featured" href="#inbox"><span class="stat-name">결재 대기</span>${icon('doc')}<strong>${pendingCount()}<small>건</small></strong><span class="stat-desc">대표이사 최종 확인 필요</span></a>
        <a class="stat-card" href="#completed"><span class="stat-name">결재 완료</span>${icon('check')}<strong>${completedCount()}<small>건</small></strong><span class="stat-desc">최근 처리한 결재 문서</span></a>
        <a class="stat-card" href="#reference"><span class="stat-name">참조 문서</span>${icon('folder')}<strong>2<small>건</small></strong><span class="stat-desc">공유된 업무 보고</span></a>
        <a class="stat-card" href="#listing"><span class="stat-name">거래지원 검토</span>${icon('chart')}<strong>${decision.status === 'approved' ? '0' : '1'}<small>건</small></strong><span class="stat-desc">신규 거래지원 진행 현황</span></a>
      </section>
      <div class="home-columns"><section class="panel"><div class="panel-heading"><h2>내 결재 문서 <span class="count-blue">${pendingCount()}</span></h2><a class="text-link" href="#inbox">전체 보기 ${icon('arrow')}</a></div>
        <a class="approval-feature" href="#document"><div class="approval-feature-top">${pill(decision.status)}<span class="doc-code">${esc(config.documentNo)}</span></div><h3>헤븐코인 신규 상장 승인 요청</h3><p>거래지원팀 · 신규 거래지원 품의 · HEAVEN / KRW</p><div class="feature-bottom"><span>${pending() ? '기안 · 검토 · 합의 완료' : '대표이사 최종 결재 처리'} </span><span class="feature-cta">${pending() ? '결재문서 확인' : '처리 문서 확인'} ${icon('arrow')}</span></div></a>
        ${otherDocuments.slice(0,3).map(doc => `<button class="mini-row notification-item" data-other="${doc.id}"><span><strong>${esc(doc.title)}</strong><small>${esc(doc.department)} · ${esc(doc.category)}</small></span>${pill(doc.status)}</button>`).join('')}
      </section><div class="home-right"><section class="panel"><div class="panel-heading"><h2>사내 공지</h2><a class="text-link" href="#notices">전체 보기 ${icon('arrow')}</a></div><div class="notice-list">${notices.map(n => `<button class="notice-row notification-item" data-notice="${n.id}"><strong><em>${n.tag}</em>${esc(n.title)}</strong><small>${esc(n.team)} · 사내 공지</small></button>`).join('')}</div></section>
        <section class="panel schedule-panel"><div class="panel-heading"><h2>주요 업무 일정</h2>${icon('calendar')}</div><div class="schedule-body"><div class="schedule-item"><span class="schedule-time">09:00</span><div class="schedule-detail"><strong>시장 운영 현황 점검</strong><small>거래운영팀 · 상황 보고</small></div></div><div class="schedule-item"><span class="schedule-time">14:00</span><div class="schedule-detail"><strong>거래지원 업무 검토</strong><small>거래지원팀 · 내부 회의</small></div></div></div></section>
      </div></div><div class="home-bottom">${icon('lock')}<span><strong>업무 문서 보안 안내</strong> 거래지원 검토 자료와 결재 문서는 사내 업무 목적에 한하여 열람할 수 있습니다.</span></div>`;
  }
  function tableRow(doc, number) {
    return `<tr data-document="${esc(doc.id)}" class="${doc.id === 'heaven' ? 'main-document' : ''}"><td>${String(number + 1).padStart(2,'0')}</td><td class="main-cell"><button class="text-link" data-open-document="${esc(doc.id)}"><strong>${doc.id === 'heaven' ? '<span class="table-label">거래지원</span>' : ''}${esc(doc.title)}</strong></button><small>${esc(doc.no)}</small></td><td>${esc(doc.department)}</td><td>${esc(doc.category)}</td><td>${pill(doc.status)}</td><td>${esc(doc.time)}</td></tr>`;
  }
  function inbox() {
    const title = ({inbox:'결재대기함',completed:'결재완료함',returned:'반려문서함',reference:'참조문서함'})[view];
    const rows = [mainDoc(),...otherDocuments].filter(d => view === 'inbox' ? ['pending','held'].includes(d.status) : view === 'completed' ? d.status === 'approved' : view === 'returned' ? d.status === 'rejected' : ['security','wallet'].includes(d.id));
    return heading('ELECTRONIC APPROVAL',title,'결재선에 배정된 문서를 확인하고 처리합니다.') +
      `<div class="tab-bar"><a href="#inbox" class="${view === 'inbox' ? 'active' : ''}">결재 대기 <b>${pendingCount()}</b></a><a href="#completed" class="${view === 'completed' ? 'active' : ''}">결재 완료 <b>${completedCount()}</b></a><a href="#returned" class="${view === 'returned' ? 'active' : ''}">반려 문서</a><a href="#reference" class="${view === 'reference' ? 'active' : ''}">참조 문서</a></div>
      <div class="list-controls"><span>전체 <strong id="filteredCount">${rows.length}</strong>건</span><label class="search-box">${icon('search')}<input id="documentSearch" aria-label="문서 제목, 문서번호, 기안부서 검색" placeholder="문서 제목, 문서번호, 기안부서 검색" autocomplete="off"></label></div>
      <div class="table-wrap"><table class="data-table" id="approvalTable"><thead><tr><th>No.</th><th>문서 제목 / 문서번호</th><th>기안부서</th><th>문서 구분</th><th>결재 상태</th><th>상신 시각</th></tr></thead><tbody>${rows.map(tableRow).join('')}</tbody></table><div class="empty-state" id="listEmpty" ${rows.length ? 'hidden' : ''}>${icon('doc')}<strong>표시할 문서가 없습니다.</strong>해당 문서함의 문서가 여기에 표시됩니다.</div></div>
      <div class="list-foot"><span>본인에게 부여된 문서 열람 권한에 따라 표시됩니다.</span><span class="page-number">1</span></div>`;
  }
  const workflows = [
    {type:'기안',name:'거래지원팀장',role:'거래지원팀',status:'상신'},
    {type:'검토',name:'거래지원실장',role:'거래지원실',status:'검토 완료'},
    {type:'합의',name:'준법감시인',role:'준법감시실',status:'합의 완료'},
    {type:'최종 결재',name:'조지환',role:'대표이사',status:'결재 대기'}
  ];
  function approvalLine() {
    return `<div class="approval-line" aria-label="기안, 검토, 합의, 대표이사 최종결재">${workflows.map((step,i) => `<div class="approver ${i === 3 ? decision.status === 'approved' ? 'done' : 'current' : ''}"><div class="approver-label">${step.type}</div><span class="approver-name">${step.name}</span><span class="approver-role">${step.role}</span>${i === 3 && decision.status === 'approved' ? '<div class="approval-stamp">승인</div>' : `<span class="approver-state">${i === 3 ? states[decision.status] : step.status}</span>`}</div>`).join('')}</div>`;
  }
  function sidePanels() {
    return `<aside class="document-side"><section class="side-panel"><div class="side-panel-heading">결재 진행 현황 ${icon('doc')}</div><div class="process-list">${workflows.map((s,i) => `<div class="process-step ${i === 3 ? decision.status === 'approved' ? 'approved' : 'current' : ''}"><span class="step-icon">${i < 3 || decision.status === 'approved' ? icon('check') : '4'}</span><span class="step-body"><strong>${s.type} · ${s.name}</strong><small>${s.role}</small><em>${i === 3 ? states[decision.status] : s.status}</em></span></div>`).join('')}</div><div class="side-panel-note">최종 결재가 완료되면 기안부서 및 수신부서에 처리 결과가 전달됩니다.</div></section>
      <section class="side-panel"><div class="side-panel-heading">문서 정보 ${icon('lock')}</div><div class="side-data"><div><span>보안등급</span><strong>대외비</strong></div><div><span>보존기간</span><strong>5년</strong></div><div><span>첨부자료</span><strong>3건</strong></div><div><span>문서공개</span><strong>결재선 / 수신부서</strong></div></div></section>
      <section class="side-panel"><div class="side-panel-heading">후속 업무 ${icon('arrow')}</div><div class="side-data"><div><span>고객 공지</span><strong>${decision.status === 'approved' ? '등록 대기' : '승인 후 진행'}</strong></div><div><span>거래 개시</span><strong>별도 개시 절차</strong></div></div><div class="side-panel-note">상장 승인과 공지 게시, 거래 개시는 각각 별도로 진행합니다.</div></section></aside>`;
  }
  function attachmentPanel() {
    return `<div class="attachment-list">${attachments.map(a => `<button type="button" class="attachment" data-attachment="${a.id}"><span class="file-icon">${a.type}</span><span class="attachment-name">${esc(a.name)}</span><span class="attachment-size">${a.size}</span>${icon('arrow')}</button>`).join('')}</div>`;
  }
  function historyPanel() {
    const steps = [
      ['거래지원팀장','기안 문서 상신','08:05'],
      ['거래지원실장','검토 의견 등록 · 검토 완료','08:12'],
      ['준법감시인','위험검토 의견서 첨부 · 합의 완료','08:25']
    ];
    const events = decision.events.length ? decision.events : [{status:decision.status,comment:decision.comment,time:decision.time || config.time}];
    events.forEach(e=>steps.push(['조지환 대표이사',`${states[e.status]}${e.comment ? ' · ' + e.comment : ''}`,e.time]));
    return `<div class="history-list">${steps.map((s,i) => `<div class="history-entry">${icon(i >= 3 ? 'time' : 'check')}<span><strong>${esc(s[0])}</strong><small>${esc(s[1])}</small></span><time>${esc(s[2])}</time></div>`).join('')}</div>`;
  }
  function resultBanner() {
    if (decision.status === 'pending') return '';
    const content = ({approved:['헤븐코인 상장 승인 완료','최종 결재자 조지환 · 원화마켓 신규 거래지원 승인'],rejected:['헤븐코인 상장 승인 요청 반려','기안부서에 반려 결과가 전달되었습니다.'],held:['헤븐코인 상장 결재 보류','추가 검토 후 결재를 진행할 수 있습니다.']})[decision.status];
    return `<div class="decision-banner ${esc(decision.status)}" role="status"><span class="decision-check">${icon(decision.status === 'approved' ? 'check' : 'time')}</span><div><strong>${content[0]}</strong><p>${esc(decision.comment || content[1])}</p></div><span>${esc(decision.time || config.time)}</span></div>`;
  }
  function actionButtons(locationName) {
    if (!pending()) return '';
    return `${button('보류',`data-action="hold" data-location="${locationName}"`)}${button('반려',`data-action="reject" data-location="${locationName}"`,'reject')}${button(`${icon('check')}상장 승인`,`data-action="approve" data-location="${locationName}"`,'primary approval-main-button')}`;
  }
  function documentView() {
    return `<div class="document-toolbar"><a class="back-link" href="#${decision.status === 'approved' ? 'completed' : decision.status === 'rejected' ? 'returned' : 'inbox'}">${icon('arrow')}목록으로</a><div class="toolbar-actions">${button(`${icon('print')}인쇄`,'data-print','print-button')}${actionButtons('top')}</div></div>
      <div class="document-layout ${freshApproval ? 'fresh-approval' : ''}"><article class="paper" aria-labelledby="docTitle"><div class="paper-inner"><div class="paper-top"><span class="paper-kicker">거래지원 품의 / ${esc(config.documentNo)}</span><span class="paper-security">${icon('lock')}대외비</span></div><h1 id="docTitle" class="document-title">헤븐코인 신규 상장 승인 요청</h1><p class="document-caption">원화마켓 신규 거래지원에 대한 최종 승인을 요청합니다.</p>
      ${resultBanner()}
      ${approvalLine()}
      <dl class="doc-metadata"><dt>문서번호</dt><dd>${esc(config.documentNo)}</dd><dt>기안부서</dt><dd>거래지원팀</dd><dt>문서 구분</dt><dd>거래지원 품의</dd><dt>보안등급</dt><dd>대외비 · 보존기간 5년</dd><dt>수신부서</dt><dd>거래운영팀 · 시장감시팀</dd><dt>결재 상태</dt><dd>${pill(decision.status)}</dd></dl>
      <h2 class="section-heading"><span>01</span>거래지원 대상</h2><div class="asset-overview"><span class="coin-symbol">H</span><div><div class="asset-name">헤븐코인 <span>HEAVEN</span></div><div class="asset-description">신규 거래지원 · 원화마켓</div></div><span class="market-tag">HEAVEN / KRW</span></div>
      <p class="body-copy">첨부된 거래지원 심의 결과와 위험검토 의견을 근거로, 헤븐코인(HEAVEN)의 원화마켓 신규 거래지원 및 거래 개시 준비 업무에 대한 최종 승인을 요청드립니다.</p>
      <div class="terms-grid"><div class="term"><span>신청 구분</span><strong>신규 상장 / 거래지원</strong></div><div class="term"><span>거래 마켓</span><strong>원화마켓 (KRW)</strong></div><div class="term"><span>거래 개시</span><strong>${esc(config.openTime)} KST · 일정 별도 확정</strong></div><div class="term"><span>입출금 지원</span><strong>운영 확인 후 별도 개시</strong></div></div>
      <h2 class="section-heading"><span>02</span>승인 요청 사항</h2><p class="body-copy">헤븐코인의 비트원 신규 상장을 승인하고, 거래운영팀에서 거래 개시 일정을 확정하여 공지 등록 및 마켓 개설 절차를 진행하고자 합니다.</p>
      <div class="approval-request">최종 승인 후에도 고객 공지, 입출금 지원 및 실제 주문 접수는 각 담당 부서의 개시 절차에 따라 별도로 진행합니다.</div>
      <div class="document-tabs" role="tablist" aria-label="첨부자료 및 처리이력"><button type="button" id="tab-attachments" role="tab" aria-controls="documentTabPanel" aria-selected="${activeDocumentTab === 'attachments'}" data-document-tab="attachments" class="${activeDocumentTab === 'attachments' ? 'active' : ''}">첨부자료 <span class="count-blue">3</span></button><button type="button" id="tab-history" role="tab" aria-controls="documentTabPanel" aria-selected="${activeDocumentTab === 'history'}" data-document-tab="history" class="${activeDocumentTab === 'history' ? 'active' : ''}">처리이력</button></div><div id="documentTabPanel" role="tabpanel" aria-labelledby="tab-${activeDocumentTab}">${activeDocumentTab === 'attachments' ? attachmentPanel() : historyPanel()}</div>
      ${pending() ? `<div class="decision-actions"><span>현재 결재 차례 · 조지환 대표이사</span><div>${actionButtons('bottom')}</div></div>` : ''}
      </div></article>${sidePanels()}</div>`;
  }
  function listing() {
    return heading('LISTING MANAGEMENT','거래지원 관리','신규 거래지원 심의 및 최종 결재 진행 현황입니다.') +
      `<div class="table-wrap"><table class="data-table"><thead><tr><th>No.</th><th>가상자산 / 거래 마켓</th><th>검토 자료</th><th>최종 결재</th><th>고객 공지</th><th>거래 상태</th></tr></thead><tbody><tr data-document="heaven" class="main-document"><td>01</td><td class="main-cell"><button class="text-link" data-open-document="heaven"><strong>헤븐코인 <span style="font-size:11px;color:#8399b6">HEAVEN / KRW</span></strong></button><small>신규 거래지원 · ${esc(config.documentNo)}</small></td><td>심의결과서 첨부</td><td>${pill(decision.status)}</td><td>${decision.status === 'approved' ? '등록 대기' : '승인 후 진행'}</td><td>${pill('neutral','거래 개시 전')}</td></tr></tbody></table></div><p class="listing-status-note">거래지원 승인 완료 후 고객 공지와 거래 개시 절차가 진행됩니다.<br>현재 화면은 내부 결재 및 준비 상태를 표시하며, 고객용 거래화면과 구분됩니다.</p>`;
  }
  function noticesView() {
    return heading('COMPANY NOTICE','공지사항','임직원에게 공유되는 사내 업무 공지입니다.') + `<section class="panel"><div class="notice-list">${notices.map(n => `<button class="notice-row notification-item" data-notice="${n.id}"><strong><em>${n.tag}</em>${esc(n.title)}</strong><small>${esc(n.team)} · 전 임직원</small></button>`).join('')}</div></section>`;
  }
  function organization() {
    const departments = [['거래지원실','거래지원팀','자산분석팀'],['준법감시실','준법감시팀','자금세탁방지팀'],['거래운영실','거래운영팀','지갑운영팀'],['시장감시실','시장감시팀','이상거래대응팀'],['정보보호실','정보보호팀','IT운영팀'],['경영지원실','인사팀','총무팀']];
    return heading('ORGANIZATION','조직도','비트원 부서 및 업무 조직을 확인합니다.') + `<div class="org-top"><span class="eyebrow">CHIEF EXECUTIVE OFFICER</span><strong>조지환</strong><small>대표이사</small></div><div class="org-grid">${departments.map(d=>`<section class="org-card"><h3>${d[0]}</h3><p>${d[1]}</p><p>${d[2]}</p></section>`).join('')}</div>`;
  }
  function resources() {
    return heading('WORK RESOURCES','업무 자료실','거래지원 관련 내부 업무 자료를 확인합니다.') + `<div class="resource-grid">${attachments.map(a=>`<button class="resource-card" data-attachment="${a.id}"><span class="file-icon">PDF</span><span><strong>${esc(a.name)}</strong><small>거래지원팀 · 결재문서 첨부자료</small></span>${icon('arrow')}</button>`).join('')}<button class="resource-card" data-notice="notice-listing"><span class="file-icon">DOC</span><span><strong>신규 거래지원 공지 등록 절차</strong><small>거래지원팀 · 업무 안내</small></span>${icon('arrow')}</button></div>`;
  }
  function render() {
    updateNavigation();
    $('#main').innerHTML = ({home,inbox,completed:inbox,returned:inbox,reference:inbox,document:documentView,listing,notices:noticesView,organization,resources})[view]();
    freshApproval = false;
    if (busy) markBusy();
  }
  function markBusy() {
    $$('[data-action]').forEach(el => { el.disabled = true; });
    $$('[data-action="approve"]').forEach(el => { el.innerHTML = '<span class="processing-indicator"></span>결재 처리 중'; });
    $('#confirmAction').disabled = true;
  }
  function showAction(kind) {
    if (!pending() || busy) return;
    action = kind;
    if (kind === 'approve' && config.confirmMode === 'direct') { commitDecision(''); return; }
    const details = {
      approve:['헤븐코인 상장 승인','헤븐코인의 원화마켓 신규 거래지원 요청을 최종 승인하시겠습니까?','상장 승인','FINAL APPROVAL'],
      reject:['결재문서 반려','반려 사유를 입력해 주세요. 처리 결과와 의견이 기안부서에 전달됩니다.','반려','RETURN DOCUMENT'],
      hold:['결재 보류','보류 사유를 입력해 주세요. 문서는 결재대기함에 유지됩니다.','보류','HOLD APPROVAL']
    }[kind];
    $('#actionTitle').textContent = details[0]; $('#actionDescription').textContent = details[1]; $('#confirmAction').textContent = details[2]; $('#actionEyebrow').textContent = details[3];
    $('#confirmAction').className = `button ${kind === 'reject' ? 'danger' : 'primary'}`;
    $('#approvalComment').value = ''; $('#approvalComment').required = kind !== 'approve';
    $('#commentOptional').textContent = kind === 'approve' ? '선택' : '필수'; $('#dialogError').textContent = ''; $('#confirmAction').disabled = false;
    $('#actionDialog').showModal();
    (kind === 'approve' ? $('#confirmAction') : $('#approvalComment')).focus();
  }
  function commitDecision(comment) {
    if (busy || !pending()) return;
    busy = true;
    markBusy();
    $('#actionDialog').close();
    actionTimer = setTimeout(() => {
      const status = ({approve:'approved',reject:'rejected',hold:'held'})[action];
      const entry = {status,comment:comment.trim(),time:config.time};
      decision = {...entry,events:[...decision.events,entry].slice(-20)};
      busy = false; persist(); freshApproval = action === 'approve'; activeDocumentTab = 'attachments';
      render();
      if (status === 'approved') window.scrollTo({top:0,behavior:'instant'});
      toast(({approved:'헤븐코인 상장 승인이 완료되었습니다.',rejected:'결재문서가 반려되었습니다.',held:'결재가 보류되었습니다.'})[status]);
    }, config.delay);
  }
  function preview(title, html, kind = 'DOCUMENT PREVIEW') {
    $('#previewTitle').textContent = title;
    $('#previewType').textContent = kind;
    $('#previewBody').innerHTML = `<div class="preview-content">${html}</div>`;
    $('#previewDialog').showModal();
  }
  function previewAttachment(id) {
    const item = attachments.find(a => a.id === id); if (!item) return;
    const body = ({
      review:`<h3>헤븐코인 거래지원 심의 결과서</h3><table><tr><th>검토 대상</th><td>헤븐코인 (HEAVEN)</td></tr><tr><th>검토 구분</th><td>원화마켓 신규 거래지원</td></tr><tr><th>관련 품의</th><td>${esc(config.documentNo)}</td></tr></table><h4>1. 검토 범위</h4><p>발행 및 운영 주체, 정보 공개, 기술 구조, 유통 계획, 이용자 보호 관련 자료를 대상으로 거래지원 검토를 진행합니다.</p><h4>2. 심의 자료</h4><p>자산 설명자료, 위험검토 의견 및 운영 준비 자료를 최종 결재문서에 첨부합니다. 세부 의견은 각 첨부 문서와 함께 확인합니다.</p><h4>3. 후속 절차</h4><p>대표이사 최종 결재 후 거래운영팀이 공지 및 거래 개시 일정을 별도로 확정합니다.</p>`,
      risk:`<h3>헤븐코인 위험검토 의견서</h3><table><tr><th>대상 자산</th><td>헤븐코인 (HEAVEN)</td></tr><tr><th>검토 부서</th><td>준법감시실</td></tr><tr><th>문서등급</th><td>대외비</td></tr></table><h4>주요 검토 항목</h4><p>정보 공개의 충실성, 발행 및 유통 계획, 기술적 안정성, 권리 관계와 이용자 보호 사항을 종합 검토합니다.</p><h4>운영 시 유의사항</h4><p>거래 개시 전 공지 내용과 지원 네트워크를 확인하고, 개시 이후 유통량 및 이상거래 모니터링을 실시합니다. 추가 확인 사항은 담당 부서에서 관리합니다.</p><p>본 의견서는 수익성 또는 자산가치를 보증하는 문서가 아닙니다.</p>`,
      operations:`<h3>헤븐코인 거래 개시 운영계획</h3><table><tr><th>거래 마켓</th><td>HEAVEN / KRW</td></tr><tr><th>거래 개시 시각</th><td>${esc(config.openTime)} KST · 일정 별도 확정</td></tr><tr><th>운영 부서</th><td>거래운영팀 / 시장감시팀</td></tr></table><h4>1. 최종 결재 확인</h4><p>최종 결재 문서의 승인 상태를 확인하고 마켓 등록 및 고객 공지 준비 업무를 진행합니다.</p><h4>2. 개시 준비</h4><p>지원 네트워크와 지갑 동작, 입출금 지원, 주문 처리 및 모니터링 체계를 확인합니다. 공지와 입출금 일정은 운영 상황에 따라 별도 확정합니다.</p><h4>3. 거래 개시</h4><p>정해진 개시 시각에 운영 담당자가 개시 절차를 진행하고 시장 상태를 확인합니다. 본 결재 화면에서 실제 거래 개시를 실행하지 않습니다.</p>`
    })[id];
    preview(item.name, `${body}<div class="preview-watermark">BitOne Corporation · 내부 결재 참고자료 · 대외비</div>`);
  }
  function showNotice(id) {
    const n = notices.find(x=>x.id === id); if (!n) return;
    preview(n.title, `<h3>${esc(n.title)}</h3><p class="notice-meta">${esc(n.team)} · 전 임직원 공지</p><p>${esc(n.body)}</p><p>문의: ${esc(n.team)}</p>`, 'COMPANY NOTICE');
  }
  function showOther(id) {
    const d = otherDocuments.find(x=>x.id === id); if (!d) return;
    const descriptions = {ops:'원화마켓의 거래 및 주문 처리 상태, 유동성 점검 결과와 운영 모니터링 현황을 보고드립니다.',duty:'주말 시장 모니터링 업무의 연속성을 확보하기 위한 근무 편성과 인수인계 계획을 검토 요청드립니다.',security:'임직원 문서 보안 및 고객 정보 보호를 위한 정기 교육의 시행 계획을 보고드립니다.',wallet:'거래지원 자산의 지갑 상태와 입출금 운영 현황에 대한 정기 점검 결과를 보고드립니다.'};
    preview(d.title, `<table><tr><th>문서번호</th><td>${esc(d.no)}</td></tr><tr><th>기안부서</th><td>${esc(d.department)}</td></tr><tr><th>기안자</th><td>${esc(d.author)}</td></tr><tr><th>문서 상태</th><td>${pill(d.status)}</td></tr></table><h4>업무 보고</h4><p>${esc(descriptions[id])}</p><p>상세 현황은 소관 부서의 업무 보고 기준에 따라 관리합니다.</p><div class="preview-watermark">BitOne Corporation · 내부 업무 문서</div>`, 'ELECTRONIC APPROVAL');
  }
  function setup() {
    if (busy) return;
    const dialog = $('#setupDialog');
    if (dialog.open) { dialog.close(); return; }
    for (const [key,value] of Object.entries(config)) $('#setupForm').elements.namedItem(key).value = String(value);
    dialog.showModal();
  }
  function reset(status = 'pending') {
    clearTimeout(actionTimer); busy = false;
    decision = {status,comment:'',time:status === 'pending' ? '' : config.time,events:[]};
    persist(); activeDocumentTab = 'attachments';
    $('#actionDialog').close(); $('#notifications').hidden = true; $('#notificationButton').setAttribute('aria-expanded','false');
    $('#approvalComment').value = ''; $('#dialogError').textContent = '';
    $('#confirmAction').disabled = false;
    view = 'document';
    const url = new URL(location.href); url.searchParams.delete('state'); url.hash = 'document';
    history.replaceState(null,'',url);
    render(); window.scrollTo({top:0,behavior:'instant'});
    toast(status === 'pending' ? '승인 전 상태로 초기화했습니다.' : '승인 완료 화면을 불러왔습니다.');
  }
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch (_) { toast('브라우저의 F11 키로 전체화면을 사용할 수 있습니다.'); }
  }
  function renderNotifications() {
    $('#notifications').innerHTML = `<h3>업무 알림</h3><button class="notification-item" data-notification-document>${pill(decision.status)}<strong>헤븐코인 신규 상장 승인 요청</strong><small>${pending() ? '대표이사 최종 결재를 기다리고 있습니다.' : '최종 결재 처리 결과를 확인하세요.'}</small></button><button class="notification-item" data-notice="notice-security"><strong>문서 보안 관리 안내</strong><small>정보보호팀에서 공지를 등록했습니다.</small></button>`;
  }

  document.addEventListener('click', event => {
    const target = event.target;
    const approval = target.closest('[data-action]'); if (approval) { showAction(approval.dataset.action); return; }
    const tab = target.closest('[data-document-tab]'); if (tab) { activeDocumentTab = tab.dataset.documentTab; render(); $(`#tab-${activeDocumentTab}`).focus(); return; }
    const attachment = target.closest('[data-attachment]'); if (attachment) { previewAttachment(attachment.dataset.attachment); return; }
    const notice = target.closest('[data-notice]'); if (notice) { $('#notifications').hidden = true; $('#notificationButton').setAttribute('aria-expanded','false'); showNotice(notice.dataset.notice); return; }
    const other = target.closest('[data-other]'); if (other) { showOther(other.dataset.other); return; }
    const row = target.closest('[data-document]'); if (row) { if (row.dataset.document === 'heaven') navigate('document'); else showOther(row.dataset.document); return; }
    if (target.closest('[data-print]')) { window.print(); return; }
    if (target.closest('[data-close-dialog]')) { $('#actionDialog').close(); return; }
    const preset = target.closest('[data-setup-state]'); if (preset) { $('#setupDialog').close(); reset(preset.dataset.setupState); return; }
    if (target.closest('[data-notification-document]')) { $('#notifications').hidden = true; $('#notificationButton').setAttribute('aria-expanded','false'); navigate('document'); return; }
    if (!target.closest('#notifications') && !target.closest('#notificationButton')) { $('#notifications').hidden = true; $('#notificationButton').setAttribute('aria-expanded','false'); }
  });
  document.addEventListener('input', event => {
    if (event.target.id !== 'documentSearch') return;
    const query = event.target.value.trim().toLocaleLowerCase(); let shown = 0;
    $$('#approvalTable tbody tr').forEach(row=>{row.hidden = !row.textContent.toLocaleLowerCase().includes(query); if (!row.hidden) shown++;});
    $('#filteredCount').textContent = String(shown); $('#listEmpty').hidden = shown !== 0;
  });
  $('#actionForm').addEventListener('submit', event => {
    event.preventDefault(); const comment = $('#approvalComment').value.trim();
    if (action !== 'approve' && !comment) { $('#dialogError').textContent = '사유를 입력해 주세요.'; $('#approvalComment').focus(); return; }
    commitDecision(comment);
  });
  $('#setupForm').addEventListener('submit', event => {
    event.preventDefault(); config = validSettings(Object.fromEntries(new FormData(event.target)));
    try { localStorage.setItem(STORE,JSON.stringify(config)); } catch (_) {}
    document.documentElement.style.setProperty('--scale',String(config.fontScale)); $('#setupDialog').close(); render(); toast('촬영 설정을 적용했습니다.');
  });
  $('#setupDefaults').addEventListener('click',()=>{for (const [key,value] of Object.entries(defaults)) $('#setupForm').elements.namedItem(key).value = String(value);});
  $('#closeSetup').addEventListener('click',()=>$('#setupDialog').close());
  $('#closePreview').addEventListener('click',()=>$('#previewDialog').close());
  $('#fullscreenButton').addEventListener('click',()=>{ $('#setupDialog').close(); fullscreen(); });
  $('#notificationButton').addEventListener('click',()=>{ renderNotifications(); $('#notifications').hidden = !$('#notifications').hidden; $('#notificationButton').setAttribute('aria-expanded', String(!$('#notifications').hidden)); $('#notificationDot').hidden = true; });
  window.addEventListener('hashchange',()=>{const next = location.hash.slice(1); if (['home','inbox','document','completed','returned','reference','listing','notices','organization','resources'].includes(next)) {view = next; render(); window.scrollTo({top:0,behavior:'instant'});}});
  document.addEventListener('keydown', event => {
    if (event.key === 'F2') { event.preventDefault(); if (!$('#previewDialog').open && !$('#actionDialog').open) setup(); return; }
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if ($$('dialog[open]').length) return;
    const key = event.key.toLowerCase();
    if (key === 'a' && view === 'document') {event.preventDefault();showAction('approve');}
    if (key === 'r') {event.preventDefault();reset();}
    if (key === 'f') {event.preventDefault();fullscreen();}
    if (key === 'escape') {$('#notifications').hidden = true;$('#notificationButton').setAttribute('aria-expanded','false');}
  });
  let holdTimer;
  $('.brand').addEventListener('pointerdown',()=>{holdTimer = setTimeout(()=>{holdTimer = null;setup();},950);});
  for (const type of ['pointerup','pointerleave','pointercancel']) $('.brand').addEventListener(type,()=>clearTimeout(holdTimer));
  const allowedViews = ['home','inbox','document','completed','returned','reference','listing','notices','organization','resources'];
  const initial = location.hash.slice(1) || params.get('view'); view = allowedViews.includes(initial) ? initial : 'home';
  persist(); render();
  if (params.get('setup') === '1') setup();
})();
