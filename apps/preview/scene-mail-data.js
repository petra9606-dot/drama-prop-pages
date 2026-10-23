/* Generated from prop-apps/src/SceneMailData.ts by prepare-mail-v8-site.cjs. */
(()=>{const exports={};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORMAL_NOTICE_CSS = exports.NOTICE_PREVIEW_BODY = exports.IMAGE_MAIL_BODY = exports.HEAVEN_REVIEW_BODY = exports.REJECTION = exports.displayMailText = exports.MAIL_REVIEW_SENDER = exports.MAIL_REVIEW_SUBJECT = exports.MAIL_CONTENT_REVISION = exports.MAIL_DELAY_MS = exports.PEOPLE = void 0;
exports.defaultSceneConfig = defaultSceneConfig;
exports.restoreSceneConfig = restoreSceneConfig;
exports.scenePersonForMail = scenePersonForMail;
exports.upgradeSceneItems = upgradeSceneItems;
exports.upsertSceneMail = upsertSceneMail;
exports.scheduleSceneMail = scheduleSceneMail;
exports.backgroundMails = backgroundMails;
exports.receivedMail = receivedMail;
exports.wrapNoticeText = wrapNoticeText;
exports.noticeLayout = noticeLayout;
exports.noticeSvg = noticeSvg;
exports.formalNoticeMarkup = formalNoticeMarkup;
exports.formalNoticeHtml = formalNoticeHtml;
exports.PEOPLE = {
    song: { name: '송경필', email: 'kpsong@pharaoh-inv.co.kr', color: '#607789', initial: '경' },
    baek: { name: '백동재', email: 'baek.dongjae@sphinx-holdings.kr', color: '#77735e', initial: '동' },
};
exports.MAIL_DELAY_MS = 5000;
exports.MAIL_CONTENT_REVISION = 7;
exports.MAIL_REVIEW_SUBJECT = '[비트원] 헤븐코인 거래지원 심사 결과 안내';
exports.MAIL_REVIEW_SENDER = '비트원 거래지원심사위원회';
// Keep Korean words together only for display; the saved/editable manuscript stays unchanged.
const displayMailText = (value = '') => value.replace(/[가-힣]+/g, word => Array.from(word).join('\u2060'));
exports.displayMailText = displayMailText;
exports.REJECTION = '그 결과, 헤븐코인은 당사의 거래지원 심사기준을 충족하지 못한 것으로 판단되어 신규 거래지원이 불가함을 공식 통보드립니다.';
exports.HEAVEN_REVIEW_BODY = `안녕하십니까. 비트원 거래지원심사위원회입니다.
귀사가 신청하신 헤븐코인의 신규 거래지원(상장)과 관련하여 제출 자료 및 추가 소명 내용을 바탕으로 내부 심사를 진행하였습니다.
당사는 발행 주체의 신뢰성, 사업의 실재성, 기술적 안정성, 자산의 유통구조 및 이용자 보호 요건 등을 종합적으로 검토하였습니다.
그 결과, 헤븐코인은 당사의 거래지원 심사기준을 충족하지 못한 것으로 판단되어 신규 거래지원이 불가함을 공식 통보드립니다.

주요 심사 결과는 다음과 같습니다.

1. 사업의 실재성 및 경제적 효용성 검증 불가
귀사는 헤븐코인이 헤븐시티의 공식 디지털 화폐로 사용될 예정이라고 설명하고 있으나, 해당 도시의 사업 시행주체 및 관계기관과 체결한 유효한 계약이나 공식 승인 자료가 확인되지 않았습니다. 또한 헤븐코인이 실제 결제 및 금융거래에 사용될 수 있음을 입증하는 구체적인 사업 수행 실적과 상용화 계획이 부족하여, 제시된 사업모델의 실재성과 실행 가능성을 객관적으로 검증하기 어렵다고 판단하였습니다.

2. 발행 및 유통구조의 불투명성
헤븐코인의 총발행량, 초기 유통량, 발행 주체 보유 물량, 유통 일정 및 물량 통제에 관한 자료가 충분히 소명되지 않았습니다. 이에 따라 향후 대규모 물량 유통이나 가격 왜곡으로 인한 이용자 피해 가능성을 합리적으로 평가하기 어렵습니다.

3. 기술적 안정성 및 검증 자료 미비
제출된 백서와 기술자료만으로는 블록체인 네트워크의 실제 운영 여부, 스마트컨트랙트의 안전성 및 외부 보안 검증 결과를 충분히 확인할 수 없었습니다.
또한 실제 거래기록과 자산 발행 내역을 독립적으로 검증할 수 있는 자료가 부족합니다.

4. 주요 투자 및 제휴 관계의 사실관계 확인 불가
귀사가 제시한 해외 국부펀드 투자 및 글로벌 사업 제휴와 관련하여 투자금 납입 사실, 계약의 유효성, 제휴기관의 공식 확인자료 등이 충분히 제출되지 않았습니다.
이에 따라 해당 투자 및 제휴 관계를 헤븐코인의 사업적 신뢰성을 뒷받침하는 근거로 인정하기 어렵습니다.

5. 이용자 보호 및 시장 건전성 우려
헤븐코인의 가치 형성 근거와 실제 수요에 관한 객관적인 검증이 부족한 상황에서 거래지원을 개시할 경우, 투자자의 합리적인 가치 판단을 저해하고 중대한 재산상 손실을 초래할 우려가 있다고 판단하였습니다.

최종 심사 결과: 신규 거래지원 불가 (REJECTED)
상기 사유에 따라 비트원은 헤븐코인의 신규 거래지원을 승인하지 않기로 최종 결정하였습니다.
본 결정은 귀사가 제출한 자료와 현재까지 확인된 사실관계에 근거한 것으로, 당사의 이용자 보호 원칙 및 거래지원 심사기준에 따른 것입니다.
향후 관련 사항에 중대한 변경이 발생하더라도 신규 심사 신청은 별도의 절차와 기준에 따라 검토되며, 거래지원 승인을 보장하지 않습니다.
비트원은 디지털자산 시장의 투명성과 이용자 보호를 최우선 가치로 삼고 있습니다.
귀사의 양해를 부탁드립니다.
감사합니다.

비트원
거래지원심사위원회
Digital Asset Listing Review Committee
본 메일은 거래지원 심사 결과에 관한 공식 통지이며, 사전 승인 없는 외부 공개 및 제3자 제공을 제한합니다.`;
exports.IMAGE_MAIL_BODY = `파라오 님, 안녕하세요.
비트원 거래지원심사위원회입니다.

헤븐코인의 신규 거래지원 심사 결과 통지서를 첨부하여 보내드립니다.
첨부된 통지서를 확인해 주시기 바랍니다.`;
exports.NOTICE_PREVIEW_BODY = `코인의 신뢰성과 영속성을 확인할 수 없어, 상장 불가 의견을 통보합니다.

제출 자료를 검토한 결과, 프로젝트의 신뢰성과 지속적인 운영을 뒷받침할 수 있는 근거가 충분히 확인되지 않았습니다. 현 단계에서는 상장 요건을 충족하지 못한 것으로 판단합니다.

위 사유에 따라 헤븐코인의 신규 거래지원 신청에 대해 거래지원 불가 결정을 통지합니다.

본 통지서에 관한 문의는 비트원 거래지원심사위원회로 회신하여 주시기 바랍니다.`;
function template(person, image) {
    return { from: exports.MAIL_REVIEW_SENDER, fromEmail: 'listing@bitone.co.kr', to: '파라오', toEmail: exports.PEOPLE[person].email,
        subject: exports.MAIL_REVIEW_SUBJECT, date: '2026-08-22', time: '오전 10:24',
        body: image ? exports.IMAGE_MAIL_BODY : exports.HEAVEN_REVIEW_BODY, attachmentName: '헤븐코인_거래지원심사결과.svg', attachmentText: exports.HEAVEN_REVIEW_BODY, ...(image ? { attachmentPreviewText: exports.NOTICE_PREVIEW_BODY } : {}) };
}
function defaultSceneConfig() {
    return { person: 'song', format: 'text', contentRevision: exports.MAIL_CONTENT_REVISION, templates: { song: { text: template('song', false), image: template('song', true) }, baek: { text: template('baek', false), image: template('baek', true) } } };
}
function restoreSceneConfig(value) {
    const defaults = defaultSceneConfig();
    if (!value || typeof value !== 'object')
        return defaults;
    const upgradeManuscript = !value.contentRevision || value.contentRevision < 6;
    const upgradePreview = !value.contentRevision || value.contentRevision < exports.MAIL_CONTENT_REVISION;
    const restore = (person, format) => {
        const base = defaults.templates[person][format], saved = value.templates?.[person]?.[format];
        const merged = { ...base, ...saved };
        if (upgradeManuscript)
            return { ...merged, from: base.from, to: base.to, subject: base.subject, body: base.body, attachmentName: base.attachmentName, attachmentText: base.attachmentText, attachmentPreviewText: base.attachmentPreviewText };
        if (upgradePreview && format === 'image')
            return { ...merged, body: merged.body === exports.HEAVEN_REVIEW_BODY ? base.body : merged.body, attachmentPreviewText: saved?.attachmentPreviewText ?? base.attachmentPreviewText };
        return merged;
    };
    return { ...defaults, person: value.person === 'baek' ? 'baek' : 'song', format: value.format === 'image' ? 'image' : 'text', templates: {
            song: { text: restore('song', 'text'), image: restore('song', 'image') },
            baek: { text: restore('baek', 'text'), image: restore('baek', 'image') },
        } };
}
function scenePersonForMail(item) {
    const match = /^ep6-cue-(song|baek)-(?:text|image)$/.exec(item.id || '');
    if (match)
        return match[1];
    return Object.keys(exports.PEOPLE).find(person => item.toEmail === exports.PEOPLE[person].email || item.to === exports.PEOPLE[person].name);
}
function upgradeSceneItems(items, config) {
    return items.map(item => {
        const match = /^ep6-cue-(song|baek)-(text|image)$/.exec(item.id);
        if (match) {
            const current = config.templates[match[1]][match[2]];
            return { ...item, ...current, attachment: match[2] === 'image' };
        }
        if (item.id.startsWith('ep6-background-') && item.from === '비트원 상장심사팀' && ['네옴코인 추가 심사 자료 접수 안내', '네옴코인 상장 신청 보완 자료 접수'].includes(item.subject || '')) {
            return { ...item, from: exports.MAIL_REVIEW_SENDER, subject: (item.subject || '').replace('네옴코인', '헤븐코인').replace('상장 신청', '거래지원 신청') };
        }
        return item;
    });
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
        ['파라오 법무팀', '이사회 의사록 검토본 전달드립니다', '법무팀 검토 의견을 반영한 수정본입니다.', '8월 21일'],
        ['김민서', '외부 자문 회의 일정 확인', '월요일 오전 회의실 예약을 완료했습니다.', '8월 21일'],
        ['파라오 경영지원', '8월 비용 정산 제출 안내', '이번 달 정산 자료 제출 일정 안내입니다.', '8월 20일'],
        ['정현우 변호사', '비밀유지계약서 수정 의견', '보내주신 계약서에 대한 검토 의견입니다.', '8월 20일'],
        [exports.MAIL_REVIEW_SENDER, '헤븐코인 추가 심사 자료 접수 안내', '보내주신 보완 자료가 접수되었습니다.', '8월 19일'],
        ['파라오 인사팀', '임직원 보안 교육 일정 안내', '하반기 정보보호 교육 일정을 안내드립니다.', '8월 18일'],
        ['법무지원센터', '기업 법무 실무 세미나 안내', '다음 달 세미나 프로그램을 전달드립니다.', '8월 17일'],
        ['윤지훈', '검토 요청드린 자료 확인 부탁드립니다', '지난 회의 자료를 다시 전달드립니다.', '8월 16일'],
        ['파라오 총무팀', '회의실 이용 안내', '본관 회의실 이용 일정이 변경되었습니다.', '8월 14일'],
    ],
    baek: [
        ['스핑크스홀딩스 운영지원', '주간 업무 보고 자료 공유', '이번 주 진행 현황을 공유드립니다.', '8월 21일'],
        ['김도희', '검토 자료 전달', '지난번 말씀드린 내용을 정리했습니다.', '8월 21일'],
        [exports.MAIL_REVIEW_SENDER, '헤븐코인 거래지원 신청 보완 자료 접수', '보내주신 자료를 확인하였습니다.', '8월 20일'],
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
function wrapNoticeText(value, maxWidth, font) {
    // Prefer spaces between Korean words. Split a word only if it cannot fit on a line.
    const advance = (char) => /\s/u.test(char) ? .35 : /[\x21-\x7e]/u.test(char) ? .7 : 1;
    return value.split('\n').flatMap(paragraph => {
        let chars = Array.from(paragraph);
        if (!chars.length)
            return [''];
        const result = [];
        while (chars.length) {
            let width = 0, end = 0;
            while (end < chars.length && width + advance(chars[end]) * font <= maxWidth) {
                width += advance(chars[end]) * font;
                end++;
            }
            if (end === chars.length) {
                result.push(chars.join('').trimEnd());
                break;
            }
            end = Math.max(1, end);
            let boundary = end;
            for (let i = end; i > 0; i--) {
                if (/\s/u.test(chars[i] || '')) {
                    boundary = i;
                    break;
                }
            }
            result.push(chars.slice(0, boundary).join('').trimEnd());
            chars = chars.slice(boundary);
            while (chars.length && /\s/u.test(chars[0]))
                chars.shift();
        }
        // Avoid leaving a tiny final line (e.g. 제목의 "안내" alone), without breaking a word.
        if (result.length > 1) {
            const last = result.length - 1;
            const measure = (text) => Array.from(text).reduce((sum, char) => sum + advance(char) * font, 0);
            while (measure(result[last]) < maxWidth * .32) {
                const previous = result[last - 1].split(/\s+/);
                if (previous.length < 2)
                    break;
                const word = previous.pop(), combined = `${word} ${result[last]}`;
                if (measure(combined) > maxWidth)
                    break;
                result[last - 1] = previous.join(' ');
                result[last] = combined;
            }
        }
        return result;
    });
}
function noticeLayout(item, large = false) {
    // The mail thumbnail remains a normal document; only the opened attachment uses large type.
    const width = 800, font = large ? 36 : 20, lineHeight = font * 1.65;
    const margin = large ? 44 : 72, right = width - margin;
    const metaFont = large ? 26 : 18, metaStep = large ? 46 : 35;
    const metaY = large ? 286 : 278, metaValueX = large ? 238 : 234;
    const body = (!large && item.attachmentPreviewText !== undefined ? item.attachmentPreviewText : item.attachmentText || item.body || '').slice(0, 4000);
    const bodyRows = body.split('\n').flatMap(paragraph => wrapNoticeText(paragraph, right - margin, font).map(text => ({ text, weight: /^(?:[1-5]\. |주요 심사 결과|최종 심사 결과:)/.test(paragraph) ? '600' : '400' })));
    const bodyLines = bodyRows.map(row => row.text);
    const metadata = [
        { label: '수신', value: (item.to || '').slice(0, 25) },
        { label: '발신', value: (item.from || exports.MAIL_REVIEW_SENDER).slice(0, 60) },
        { label: '제목', value: (item.subject || exports.MAIL_REVIEW_SUBJECT).slice(0, 120) },
        { label: '심사 대상', value: '헤븐코인' },
        { label: '통지 일자', value: (item.date || '').slice(0, 25) },
    ].map(row => ({ ...row, lines: wrapNoticeText(row.value, right - metaValueX - 20, metaFont) }));
    const metadataHeight = metadata.reduce((height, row) => height + Math.max(1, row.lines.length) * metaStep, 0);
    const resultFont = large ? 28 : 18;
    const resultLines = wrapNoticeText('신규 거래지원 불가 (REJECTED)', right - metaValueX - 20, resultFont);
    const resultY = metaY + metadataHeight, boxBottom = resultY + (resultLines.length - 1) * metaStep + (large ? 32 : 29);
    const bodyY = boxBottom + 66;
    const footerY = Math.max(1024, bodyY + Math.max(0, bodyLines.length - 1) * lineHeight + 72);
    const emailLines = lines((item.fromEmail || '').slice(0, 70), large ? 40 : 70);
    const height = Math.max(1132, footerY + (large ? 104 + emailLines.length * 30 : 80 + emailLines.length * 28));
    return { width, height, font, lineHeight, margin, right, metaFont, metaStep, metaY, metaValueX, bodyLines, bodyRows, metadata, resultFont, resultLines, resultY, boxBottom, bodyY, footerY, emailLines };
}
function noticeSvg(item, large = false) {
    const layout = noticeLayout(item, large), { width, height, font, lineHeight, margin, right, metaFont, metaStep, metaY, metaValueX, bodyRows, metadata, resultFont, resultLines, resultY, boxBottom, bodyY, footerY, emailLines } = layout;
    const text = bodyRows.map((row, i) => `<text x="${margin}" y="${bodyY + i * lineHeight}" font-size="${font}" font-weight="${row.weight}">${escapeXml(row.text)}</text>`).join('');
    let rowY = metaY;
    const fields = metadata.map(row => {
        const markup = `<text x="${margin + 20}" y="${rowY}" fill="#77838d">${row.label}</text>` + row.lines.map((line, i) => `<text x="${metaValueX}" y="${rowY + i * metaStep}">${escapeXml(line)}</text>`).join('');
        rowY += Math.max(1, row.lines.length) * metaStep;
        return markup;
    }).join('');
    const result = resultLines.map((line, i) => `<text x="${metaValueX}" y="${resultY + i * metaStep}" font-size="${resultFont}" fill="#9b4944" font-weight="700">${escapeXml(line)}</text>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fff"/><g font-family="sans-serif" fill="#27333e"><text x="${margin}" y="88" font-size="${large ? 40 : 32}" font-weight="700" letter-spacing="4">BITONE</text><text x="${right}" y="83" text-anchor="end" font-size="${large ? 20 : 16}" fill="#7b8791">비트원 · 거래지원심사위원회</text><path d="M${margin} 115H${right}" stroke="#243e52" stroke-width="3"/><text x="${margin}" y="173" font-size="${large ? 42 : 30}" font-weight="700">거래지원 심사 결과 통지서</text><text x="${margin}" y="207" font-size="${large ? 18 : 15}" fill="#7b8791">LISTING REVIEW RESULT</text><rect x="${margin}" y="242" width="${right - margin}" height="${boxBottom - 242}" fill="#f2f5f7"/><g font-size="${metaFont}">${fields}<text x="${margin + 20}" y="${resultY}" fill="#77838d">최종 결과</text>${result}</g>${text}<path d="M${margin} ${footerY}H${right}" stroke="#d8dfe4"/><text x="${margin}" y="${footerY + (large ? 48 : 38)}" font-size="${large ? 26 : 17}" font-weight="700">${exports.MAIL_REVIEW_SENDER}</text>${emailLines.map((line, i) => `<text x="${margin}" y="${footerY + (large ? 86 + i * 30 : 66 + i * 28)}" font-size="${large ? 20 : 13}" fill="#7b8791">${escapeXml(line)}</text>`).join('')}</g></svg>`;
}
// The opened attachment uses the approved formal HTML layout, not estimated SVG line widths.
// Keep noticeSvg for the unchanged, compact attachment thumbnail.
exports.FORMAL_NOTICE_CSS = `
.formal-notice{box-sizing:border-box;min-width:0;background:#fff;color:#25323d;padding:28px 24px 26px;font:400 18px/1.5 "Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;text-align:left;word-break:keep-all;overflow-wrap:break-word;text-wrap:pretty;line-break:strict;letter-spacing:0;font-synthesis:none}
.formal-notice *{box-sizing:border-box}
.formal-notice .notice-brand{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-bottom:17px;border-bottom:2px solid #344652}
.formal-notice .brand-name{font-size:23px;font-weight:500;letter-spacing:2px;line-height:1.2}
.formal-notice .brand-team{font-size:11px;color:#6f7b85;text-align:right;line-height:1.4}
.formal-notice .notice-title{text-align:center;margin:25px 0 6px;font-size:21px;line-height:1.4;font-weight:500;text-wrap:balance;color:#202e39;letter-spacing:0}
.formal-notice .notice-subtitle{text-align:center;margin:0 0 24px;font-size:11px;line-height:1.4;color:#77838c;letter-spacing:.5px}
.formal-notice .notice-meta{margin:0;padding:13px 0;background:#fff;display:grid;grid-template-columns:66px minmax(0,1fr);gap:10px 12px;font-size:13px;line-height:1.55;border-top:1px solid #cbd3d9;border-bottom:1px solid #cbd3d9}
.formal-notice .notice-meta dt{margin:0;color:#717e88;font-weight:400}
.formal-notice .notice-meta dd{margin:0;min-width:0;color:#263640}
.formal-notice .notice-decision{background:#f6f3f2;padding:13px 15px;margin:18px 0 23px}
.formal-notice .decision-label{font-size:12px;color:#717e88;margin-bottom:6px;line-height:1.5}
.formal-notice .decision-value{font-size:19px;color:#92473f;font-weight:500;line-height:1.4;letter-spacing:-.2px}
.formal-notice .decision-en{font-size:11px;font-weight:400;margin-left:6px;white-space:nowrap}
.formal-notice .notice-content p{margin:0 0 14px;padding:0;line-height:inherit;font-size:inherit;white-space:normal}
.formal-notice .notice-content p.continuous-copy{word-break:normal;overflow-wrap:break-word;text-wrap:wrap;white-space:normal;text-align:left}
.formal-notice .review-section{margin:26px 0}
.formal-notice .review-heading{display:grid;grid-template-columns:25px minmax(0,1fr);gap:5px;margin:0 0 12px;padding-bottom:9px;border-bottom:1px solid #e2e6e9;font-size:inherit;line-height:1.5;font-weight:500;color:#202e39;letter-spacing:0}
.formal-notice .review-number{font-variant-numeric:tabular-nums}
.formal-notice .final-heading{margin:28px 0 13px;font-size:inherit;font-weight:500;line-height:1.55}
.formal-notice .notice-signature{margin-top:26px;font-size:inherit;font-weight:500;line-height:1.55}
.formal-notice .signature-en{font-size:12px;font-weight:400;color:#687782;margin-top:7px;line-height:1.55;overflow-wrap:normal}
.formal-notice .notice-confidential{font-size:12px;line-height:1.65;margin-top:23px;color:#76828c}
.formal-notice .notice-footer{border-top:1px solid #e2e6e9;padding-top:16px;margin-top:32px;color:#6c7a84;font-size:11px;line-height:1.65}
.formal-notice .notice-footer strong{display:block;font-weight:500;color:#40515f;font-size:12px;margin-bottom:4px}
@media(max-width:360px){.formal-notice{padding-left:16px;padding-right:16px;font-size:16px}.formal-notice .notice-meta{grid-template-columns:52px minmax(0,1fr);padding:12px;gap:7px 9px;font-size:12px}.formal-notice .decision-value{font-size:17px}.formal-notice .decision-en{display:block;margin:4px 0 0}}
`;
function formalNoticeMarkup(item) {
    const escape = escapeXml;
    const paragraph = (text, continuous = false) => `<p${continuous ? ' class="continuous-copy"' : ''}>${escape(text)}</p>`;
    const body = (item.attachmentText || item.body || '').slice(0, 4000).replace(/\r\n?/g, '\n');
    const content = body.split(/\n\s*\n/).map(block => {
        const rows = block.split('\n').map(row => row.trim()).filter(Boolean);
        if (!rows.length)
            return '';
        const review = /^([1-5])\.\s+(.+)$/.exec(rows[0]);
        if (review)
            return `<section class="review-section"><h2 class="review-heading"><span class="review-number">${review[1]}.</span><span>${escape(review[2])}</span></h2>${paragraph(rows.slice(1).join(' '))}</section>`;
        if (rows[0].startsWith('안녕하십니까.') && rows.some(row => row.startsWith('귀사가 신청하신'))) {
            const rejectionIndex = rows.findIndex(row => row.startsWith('그 결과,'));
            const middleEnd = rejectionIndex < 0 ? rows.length : rejectionIndex;
            return paragraph(rows[0]) + paragraph(rows.slice(1, middleEnd).join(' '), true) + (rejectionIndex < 0 ? '' : paragraph(rows.slice(rejectionIndex).join(' ')));
        }
        if (rows[0].startsWith('최종 심사 결과:')) {
            const following = rows.slice(1), future = following.findIndex(row => row.startsWith('향후 관련'));
            const split = future < 0 ? following.length : future;
            return `<h2 class="final-heading">${escape(rows[0])}</h2>` + paragraph(following.slice(0, split).join(' ')) + (future < 0 ? '' : paragraph(following[future]) + paragraph(following.slice(future + 1).join(' ')));
        }
        if (rows[0] === '비트원' && rows[1] === '거래지원심사위원회') {
            return `<div class="notice-signature">${escape(rows[0])}<br>${escape(rows[1])}<div class="signature-en">${escape(rows[2] || '')}</div></div>` + (rows.length > 3 ? `<div class="notice-confidential">${escape(rows.slice(3).join(' '))}</div>` : '');
        }
        return paragraph(rows.join(' '), rows.some(row => row.includes('추가 소명 내용을 바탕으로')));
    }).join('');
    return `<article class="formal-notice" lang="ko" aria-label="공문 정렬형 통지서"><header><div class="notice-brand"><span class="brand-name">BITONE</span><span class="brand-team">거래지원심사위원회</span></div><h1 class="notice-title">거래지원 심사 결과 통지서</h1><div class="notice-subtitle">LISTING REVIEW RESULT</div></header><dl class="notice-meta"><dt>수신</dt><dd>${escape(item.to || '')}</dd><dt>심사 대상</dt><dd>헤븐코인</dd><dt>통지 일자</dt><dd>${escape(item.date || '')}</dd><dt>발신</dt><dd>${escape(item.from || exports.MAIL_REVIEW_SENDER)}</dd></dl><div class="notice-decision"><div class="decision-label">최종 심사 결과</div><div class="decision-value">신규 거래지원 불가 <span class="decision-en">REJECTED</span></div></div><div class="notice-content">${content}</div><footer class="notice-footer"><strong>${escape(item.from || exports.MAIL_REVIEW_SENDER)}</strong>${escape(item.fromEmail || '')}</footer></article>`;
}
function formalNoticeHtml(item) {
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>html,body{margin:0;background:#26313c}body{padding:12px 10px 20px;-webkit-text-size-adjust:100%;overflow-wrap:break-word}${exports.FORMAL_NOTICE_CSS}</style></head><body>${formalNoticeMarkup(item)}</body></html>`;
}

window.SceneMailData=exports;})();
