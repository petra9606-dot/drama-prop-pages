/* Generated from prop-apps/src/SceneMailData.ts by prepare-mail-site.cjs. */
(()=>{const exports={};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REJECTION = exports.MAIL_DELAY_MS = exports.PEOPLE = void 0;
exports.defaultSceneConfig = defaultSceneConfig;
exports.restoreSceneConfig = restoreSceneConfig;
exports.upsertSceneMail = upsertSceneMail;
exports.scheduleSceneMail = scheduleSceneMail;
exports.backgroundMails = backgroundMails;
exports.receivedMail = receivedMail;
exports.noticeSvg = noticeSvg;
exports.PEOPLE = {
    song: { name: '송경필', email: 'song.law@edengroup.kr', color: '#607789', initial: '경' },
    baek: { name: '백동재', email: 'baek.dongjae@sphinx-holdings.kr', color: '#77735e', initial: '동' },
};
exports.MAIL_DELAY_MS = 5000;
exports.REJECTION = '코인의 신뢰성과 영속성을 확인할 수 없어, 상장 불가 의견을 통보합니다.';
function template(person, image) {
    const name = exports.PEOPLE[person].name;
    const body = `${name} 님, 안녕하세요.\n비트원 상장심사팀입니다.\n\n신청하신 네옴코인의 상장 심사 결과를 안내드립니다.\n\n심사 결과: 상장 불가\n\n${exports.REJECTION}\n\n제출하신 자료를 검토하였으나, 현 단계에서는 프로젝트의 지속 가능성과 운영 계획을 확인하기 어렵다고 판단하였습니다. 이에 네옴코인의 상장 신청을 승인하지 않기로 결정하였습니다.\n\n심사 결과와 관련한 문의는 본 메일에 회신하여 주시기 바랍니다.\n\n감사합니다.\n비트원 상장심사팀 드림`;
    return { from: '비트원 상장심사팀', fromEmail: 'listing@bitone.co.kr', to: name, toEmail: exports.PEOPLE[person].email,
        subject: '네옴코인 상장 심사 결과', date: '2026-08-22', time: '오전 10:24',
        body: image ? `${name} 님, 안녕하세요.\n비트원 상장심사팀입니다.\n\n네옴코인 상장 심사 결과 통지서를 첨부하여 보내드립니다.\n\n심사 결과: 상장 불가\n${exports.REJECTION}\n\n자세한 내용은 첨부된 통지서를 확인해 주시기 바랍니다.\n\n감사합니다.\n비트원 상장심사팀 드림` : body,
        attachmentName: '네옴코인_상장심사결과.svg',
        attachmentText: `${exports.REJECTION}\n\n제출 자료를 검토한 결과, 프로젝트의 신뢰성과 지속적인 운영을 뒷받침할 수 있는 근거가 충분히 확인되지 않았습니다. 현 단계에서는 상장 요건을 충족하지 못한 것으로 판단합니다.\n\n위 사유에 따라 네옴코인의 상장 신청에 대해 상장 불가 결정을 통지합니다.\n\n본 통지서에 관한 문의는 비트원 상장심사팀으로 회신하여 주시기 바랍니다.` };
}
function defaultSceneConfig() {
    return { person: 'song', format: 'text', templates: { song: { text: template('song', false), image: template('song', true) }, baek: { text: template('baek', false), image: template('baek', true) } } };
}
function restoreSceneConfig(value) {
    const defaults = defaultSceneConfig();
    if (!value || typeof value !== 'object')
        return defaults;
    return { ...defaults, person: value.person === 'baek' ? 'baek' : 'song', format: value.format === 'image' ? 'image' : 'text', templates: {
            song: { text: { ...defaults.templates.song.text, ...value.templates?.song?.text }, image: { ...defaults.templates.song.image, ...value.templates?.song?.image } },
            baek: { text: { ...defaults.templates.baek.text, ...value.templates?.baek?.text }, image: { ...defaults.templates.baek.image, ...value.templates?.baek?.image } },
        } };
}
function upsertSceneMail(old, mail) { return [...old.filter(item => item.id !== mail.id), mail]; }
function scheduleSceneMail(deliver, ready, failed, timers = { set: setTimeout, clear: clearTimeout }) {
    let active = true;
    const timer = timers.set(() => { void deliver().then(() => { if (active)
        ready(); }).catch(() => { if (active)
        failed(); }); }, exports.MAIL_DELAY_MS);
    return () => { active = false; timers.clear(timer); };
}
const BACKGROUND = {
    song: [
        ['에덴그룹 법무팀', '이사회 의사록 검토본 전달드립니다', '법무팀 검토 의견을 반영한 수정본입니다.', '8월 21일'],
        ['김민서', '외부 자문 회의 일정 확인', '월요일 오전 회의실 예약을 완료했습니다.', '8월 21일'],
        ['에덴그룹 경영지원', '8월 비용 정산 제출 안내', '이번 달 정산 자료 제출 일정 안내입니다.', '8월 20일'],
        ['정현우 변호사', '비밀유지계약서 수정 의견', '보내주신 계약서에 대한 검토 의견입니다.', '8월 20일'],
        ['비트원 상장심사팀', '네옴코인 추가 심사 자료 접수 안내', '보내주신 보완 자료가 접수되었습니다.', '8월 19일'],
        ['에덴그룹 인사팀', '임직원 보안 교육 일정 안내', '하반기 정보보호 교육 일정을 안내드립니다.', '8월 18일'],
        ['법무지원센터', '기업 법무 실무 세미나 안내', '다음 달 세미나 프로그램을 전달드립니다.', '8월 17일'],
        ['윤지훈', '검토 요청드린 자료 확인 부탁드립니다', '지난 회의 자료를 다시 전달드립니다.', '8월 16일'],
        ['에덴그룹 총무팀', '회의실 이용 안내', '본관 회의실 이용 일정이 변경되었습니다.', '8월 14일'],
    ],
    baek: [
        ['스핑크스홀딩스 운영지원', '주간 업무 보고 자료 공유', '이번 주 진행 현황을 공유드립니다.', '8월 21일'],
        ['김도희', '검토 자료 전달', '지난번 말씀드린 내용을 정리했습니다.', '8월 21일'],
        ['비트원 상장심사팀', '네옴코인 상장 신청 보완 자료 접수', '보내주신 자료를 확인하였습니다.', '8월 20일'],
        ['이서연', '회의 일정 재확인드립니다', '오후 미팅 장소와 참석 인원을 확인 부탁드립니다.', '8월 20일'],
        ['스핑크스홀딩스 재무팀', '월간 지출 내역 확인 요청', '첨부 내역 중 확인이 필요한 항목이 있습니다.', '8월 19일'],
        ['더페이지 서점', '주문하신 도서가 발송되었습니다', '상품 배송이 시작되었습니다.', '8월 18일'],
        ['스핑크스홀딩스 전략기획', '프로젝트 진행 현황 공유', '금주 진행 상황을 정리하여 전달드립니다.', '8월 17일'],
        ['클라우드 알림', '새 기기 로그인 안내', '계정의 최근 로그인 정보를 확인하세요.', '8월 16일'],
        ['정우진', '지난 회의 메모 전달드립니다', '확인하신 뒤 의견 부탁드립니다.', '8월 14일'],
    ],
};
function backgroundMails(person) {
    return BACKGROUND[person].slice().reverse().map(([from, subject, body, time], index) => ({
        id: `ep6-background-${person}-${index}`, from, to: exports.PEOPLE[person].name, toEmail: exports.PEOPLE[person].email,
        subject, body, time, date: '2026-08-21', read: index < 6, starred: index === 7,
        notify: false, created: 1787270400000 + index,
    }));
}
function receivedMail(config, created = Date.now()) {
    const data = config.templates[config.person][config.format];
    return { ...data, id: `ep6-cue-${config.person}-${config.format}`, created, read: false, deleted: false,
        attachment: config.format === 'image', attachmentText: data.attachmentText, notify: false };
}
const escapeXml = (text) => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
function lines(value, count) {
    return value.split('\n').flatMap(p => { const chars = Array.from(p); return chars.length ? Array.from({ length: Math.ceil(chars.length / count) }, (_, i) => chars.slice(i * count, (i + 1) * count).join('')) : ['']; });
}
function noticeSvg(item) {
    let font = 20;
    let bodyLines = lines((item.attachmentText || item.body || '').slice(0, 4000), Math.floor(654 / font));
    while (bodyLines.length * font * 1.65 > 530 && font > 6) {
        font--;
        bodyLines = lines((item.attachmentText || item.body || '').slice(0, 4000), Math.floor(654 / font));
    }
    const text = bodyLines.map((line, i) => `<text x="72" y="${478 + i * font * 1.65}" font-size="${font}">${escapeXml(line)}</text>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1132"><rect width="800" height="1132" fill="#fff"/><g font-family="sans-serif" fill="#27333e"><text x="72" y="88" font-size="32" font-weight="700" letter-spacing="4">BITONE</text><text x="728" y="83" text-anchor="end" font-size="16" fill="#7b8791">비트원 · 상장심사팀</text><path d="M72 115H728" stroke="#243e52" stroke-width="3"/><text x="72" y="173" font-size="30" font-weight="700">상장 심사 결과 통지서</text><text x="72" y="207" font-size="15" fill="#7b8791">LISTING REVIEW RESULT</text><rect x="72" y="242" width="656" height="170" fill="#f2f5f7"/><g font-size="18"><text x="92" y="278" fill="#77838d">수신</text><text x="234" y="278">${escapeXml((item.to || '').slice(0, 25))}</text><text x="92" y="313" fill="#77838d">심사 대상</text><text x="234" y="313">네옴코인</text><text x="92" y="348" fill="#77838d">통지 일자</text><text x="234" y="348">${escapeXml((item.date || '').slice(0, 25))}</text><text x="92" y="383" fill="#77838d">심사 결과</text><text x="234" y="383" fill="#9b4944" font-weight="700">상장 불가</text></g>${text}<path d="M72 1024H728" stroke="#d8dfe4"/><text x="72" y="1062" font-size="17" font-weight="700">비트원 상장심사팀</text><text x="72" y="1090" font-size="13" fill="#7b8791">${escapeXml((item.fromEmail || '').slice(0, 70))}</text><text x="728" y="1090" text-anchor="end" font-size="13" fill="#7b8791">1 / 1</text></g></svg>`;
}

window.SceneMailData=exports;})();
