// DisolveWorks 목록 도구 — 소품 카드마다 QR 코드 · 메모, 부 페이지에 "오프라인 저장".
// 사용: <script src="/dw-tools.js" defer></script>  (소품 화면 자체에는 넣지 않는다)
(() => {
  if (window.__dwTools) return; window.__dwTools = true;
  const API = "/.netlify/functions/memo";
  const CACHE = "dw-offline-v1";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  let tok = ls.get("dw-memo-tok", "");
  if (!tok) { tok = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join(""); ls.set("dw-memo-tok", tok); }
  const ago = (iso) => {
    const t = Date.parse(iso); if (!t) return "";
    const s = (Date.now() - t) / 1000;
    if (s < 60) return "방금 전";
    if (s < 3600) return `${Math.floor(s / 60)}분 전`;
    if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
    const d = new Date(t);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const I = {
    qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>',
    memo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    zip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14"/></svg>'
  };

  const css = `
.dwt-row{display:flex;gap:6px;margin-top:12px;position:relative;z-index:1;flex-wrap:wrap}
.dwt-thumb{display:block;margin:0 0 14px;border-radius:10px;overflow:hidden;aspect-ratio:16/10;background:#0b0f17;border:1px solid #222c41}
.dwt-thumb img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.dwt-b.shoot{color:#ffd28a;border-color:#4a3c22}.dwt-b.shoot:hover{color:#fff;border-color:#c99a3a;background:#2a2213}
.dwt-b{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 9px;border-radius:8px;border:1px solid #2a3650;background:#0d1320;color:#9fb0d4;font:700 11px/1 'Segoe UI','Malgun Gothic',sans-serif;cursor:pointer;user-select:none}
.dwt-b:hover{border-color:#5b7de7;color:#fff;background:#141d31}
.dwt-b svg{width:13px;height:13px}
.dwt-b.has{color:#e7ecff;border-color:#3a4d78}
.dwt-b.new::after{content:"";width:7px;height:7px;border-radius:50%;background:#ff5a64;margin-left:1px}
.dwt-dim{position:fixed;inset:0;background:rgba(3,6,12,.6);backdrop-filter:blur(2px);z-index:95;opacity:0;pointer-events:none;transition:.18s}
.dwt-dim.show{opacity:1;pointer-events:auto}
.dwt-qr{position:fixed;left:50%;top:50%;transform:translate(-50%,-48%) scale(.97);opacity:0;pointer-events:none;transition:.18s;z-index:96;width:min(360px,calc(100vw - 32px));background:#0f1522;border:1px solid #2a3650;border-radius:18px;padding:22px;color:#eef2ff;font-family:'Segoe UI','Malgun Gothic',sans-serif;text-align:center}
.dwt-qr.show{opacity:1;pointer-events:auto;transform:translate(-50%,-50%)}
.dwt-qr h3{margin:0 28px 4px;font-size:17px;letter-spacing:-.02em;line-height:1.35}
.dwt-qr .sub{font-size:11px;color:#7d8aa5;margin-bottom:16px}
.dwt-qr .code{background:#fff;border-radius:12px;padding:12px;display:inline-block}
.dwt-qr .code img{display:block;width:240px;height:240px;image-rendering:pixelated;max-width:calc(100vw - 110px);max-height:calc(100vw - 110px)}
.dwt-qr .url{font-size:11px;color:#7d8aa5;margin:12px 0 14px;word-break:break-all}
.dwt-x{position:absolute;right:12px;top:12px;width:30px;height:30px;border-radius:8px;border:0;background:transparent;color:#8b97b3;cursor:pointer;display:grid;place-items:center}
.dwt-x:hover{background:#1a2338;color:#fff}.dwt-x svg{width:18px;height:18px}
.dwt-btn{border:1px solid #3a4d78;background:#1b2540;color:#fff;border-radius:10px;padding:10px 16px;font:700 13px/1 inherit;cursor:pointer}
.dwt-btn:hover{background:#24315a}.dwt-btn:disabled{opacity:.5;cursor:default}
.dwt-panel{position:fixed;top:0;right:0;bottom:0;width:min(420px,100vw);background:#0d121d;border-left:1px solid #253049;z-index:96;transform:translateX(100%);transition:transform .25s ease;display:flex;flex-direction:column;color:#eef2ff;font-family:'Segoe UI','Malgun Gothic',sans-serif}
.dwt-panel.show{transform:none}
.dwt-ph{padding:20px 52px 16px 20px;border-bottom:1px solid #1e2840;position:relative}
.dwt-ph .k{font-size:11px;color:#7d8aa5;letter-spacing:.08em;font-weight:700}
.dwt-ph h3{margin:5px 0 0;font-size:18px;letter-spacing:-.02em;line-height:1.35}
.dwt-list{flex:1;overflow:auto;padding:14px 16px}
.dwt-empty{color:#64748b;font-size:13px;text-align:center;padding:40px 10px;line-height:1.6}
.dwt-m{background:#111827;border:1px solid #222d42;border-radius:12px;padding:12px 13px;margin-bottom:10px}
.dwt-m.done{opacity:.55}.dwt-m.done .t{text-decoration:line-through}
.dwt-m .h{display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:6px}
.dwt-m .h b{color:#c9d6ff}.dwt-m .h span{color:#64748b;font-size:11px}
.dwt-m .t{font-size:14px;line-height:1.55;white-space:pre-wrap;word-break:break-word;color:#e5e9f5}
.dwt-m .a{display:flex;gap:6px;margin-top:9px}
.dwt-m .a button{border:1px solid #2a3650;background:transparent;color:#8fa0c4;border-radius:7px;padding:5px 9px;font:700 11px/1 inherit;cursor:pointer}
.dwt-m .a button:hover{color:#fff;border-color:#5b7de7}
.dwt-m .a button.ok{color:#59d39a;border-color:#2c5a46}
.dwt-form{border-top:1px solid #1e2840;padding:14px 16px 18px;display:grid;gap:8px;background:#0b1019}
.dwt-form input,.dwt-form textarea{width:100%;box-sizing:border-box;background:#0d1320;border:1px solid #28344b;border-radius:10px;color:#fff;padding:10px 12px;font:14px/1.5 'Segoe UI','Malgun Gothic',sans-serif;outline:none}
.dwt-form input:focus,.dwt-form textarea:focus{border-color:#5b7de7}
.dwt-form textarea{min-height:76px;resize:vertical}
.dwt-form .r{display:flex;gap:8px;align-items:center}.dwt-form .r input{flex:1}
.dwt-err{color:#ff8a8a;font-size:12px;min-height:0}
.dwt-off{display:inline-flex;align-items:center;gap:6px;border:1px solid #2c3a57;background:#111a2b;color:#cfd9ff;border-radius:999px;padding:7px 13px;font:700 12px/1 'Segoe UI','Malgun Gothic',sans-serif;cursor:pointer;white-space:nowrap}
.dwt-off:hover{border-color:#5b7de7;background:#16223a}.dwt-off svg{width:14px;height:14px}
.dwt-off.ok{color:#59d39a;border-color:#2c5a46}
.dwt-off,.dwu-btn{flex-shrink:0;white-space:nowrap}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* 공통 레이어 */
  const dim = document.createElement("div"); dim.className = "dwt-dim";
  const qrBox = document.createElement("div"); qrBox.className = "dwt-qr";
  const panel = document.createElement("aside"); panel.className = "dwt-panel";
  document.body.append(dim, qrBox, panel);
  const closeAll = () => { dim.classList.remove("show"); qrBox.classList.remove("show"); panel.classList.remove("show"); cur = null; };
  dim.addEventListener("click", closeAll);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

  const cardInfo = (card) => {
    const u = new URL(card.getAttribute("href"), location.href);
    const tEl = card.querySelector(".title");
    const title = tEl ? (tEl.childNodes[0]?.textContent || tEl.textContent).trim() : card.textContent.trim().slice(0, 60);
    return { url: u.href, id: u.pathname + u.search, title };
  };

  /* QR */
  let qrLib;
  const loadQR = () => qrLib || (qrLib = new Promise((ok, no) => {
    if (window.qrcode) return ok(window.qrcode);
    const s = document.createElement("script"); s.src = "/qr.js";
    s.onload = () => ok(window.qrcode); s.onerror = () => { qrLib = null; no(); };
    document.head.appendChild(s);
  }));
  async function openQR(info) {
    qrBox.innerHTML = `<button class="dwt-x" aria-label="닫기">${I.x}</button><h3>${esc(info.title)}</h3><div class="sub">휴대폰 카메라로 찍으면 바로 열립니다</div><div class="code"><div style="width:240px;height:240px;display:grid;place-items:center;color:#334">불러오는 중…</div></div><div class="url">${esc(decodeURI(info.url))}</div><button class="dwt-btn" data-copy>링크 복사</button>`;
    qrBox.querySelector(".dwt-x").onclick = closeAll;
    const cp = qrBox.querySelector("[data-copy]");
    cp.onclick = async () => {
      try { await navigator.clipboard.writeText(info.url); cp.textContent = "복사됨"; }
      catch { prompt("아래 주소를 복사하세요", info.url); }
    };
    dim.classList.add("show"); qrBox.classList.add("show");
    try {
      const q = await loadQR();
      const qr = q(0, "M"); qr.addData(info.url); qr.make();
      qrBox.querySelector(".code").innerHTML = `<img alt="QR" src="${qr.createDataURL(8, 2)}">`;
    } catch {
      qrBox.querySelector(".code").innerHTML = `<div style="width:240px;padding:40px 10px;color:#a33;font-size:13px">QR을 만들지 못했습니다. 인터넷 연결을 확인하세요.</div>`;
    }
  }

  /* 메모 */
  let counts = {}, cur = null;
  const seenMemo = ls.get("dw-memo-seen", {});
  let myName = ls.get("dw-memo-name", "");
  const api = async (opt) => {
    const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...opt, tok }) });
    const j = await r.json(); if (!j.ok) throw new Error(j.error || "오류"); return j;
  };
  function renderMemos(memos) {
    const list = panel.querySelector(".dwt-list");
    if (!memos.length) { list.innerHTML = `<div class="dwt-empty">아직 메모가 없습니다.<br>수정 요청이나 전달 사항을 남겨 주세요.</div>`; return; }
    list.innerHTML = memos.map((m) => `<div class="dwt-m ${m.done ? "done" : ""}" data-mid="${esc(m.mid)}">
      <div class="h"><b>${esc(m.name)}</b><span>${esc(ago(m.at))}</span></div>
      <div class="t">${esc(m.text)}</div>
      <div class="a"><button data-act="done" class="${m.done ? "ok" : ""}">${m.done ? "✓ 완료됨" : "완료"}</button>${m.mine ? '<button data-act="del">삭제</button>' : ""}</div></div>`).join("");
    list.scrollTop = list.scrollHeight;
  }
  function syncCount(id, memos) {
    if (memos.length) counts[id] = { n: memos.length, open: memos.filter((m) => !m.done).length, last: memos.reduce((a, m) => (m.at > a ? m.at : a), "") };
    else delete counts[id];
    if (counts[id]) { seenMemo[id] = counts[id].last; ls.set("dw-memo-seen", seenMemo); }
    paintCounts();
  }
  async function openMemo(info) {
    cur = info;
    panel.innerHTML = `<div class="dwt-ph"><div class="k">메모</div><h3>${esc(info.title)}</h3><button class="dwt-x" aria-label="닫기">${I.x}</button></div>
      <div class="dwt-list"><div class="dwt-empty">불러오는 중…</div></div>
      <form class="dwt-form"><div class="dwt-err"></div>
        <textarea placeholder="메모 내용 (Ctrl+Enter 로 등록)" maxlength="1000" required></textarea>
        <div class="r"><input placeholder="이름" maxlength="20" value="${esc(myName)}"><button class="dwt-btn" type="submit">등록</button></div></form>`;
    panel.querySelector(".dwt-x").onclick = closeAll;
    dim.classList.add("show"); panel.classList.add("show");
    const form = panel.querySelector("form"), ta = form.querySelector("textarea"), nm = form.querySelector("input"), err = form.querySelector(".dwt-err"), btn = form.querySelector("button");
    const fail = (e) => { err.textContent = navigator.onLine ? (e.message || "저장하지 못했습니다.") : "인터넷 연결이 필요합니다."; };
    try {
      const r = await fetch(`${API}?id=${encodeURIComponent(info.id)}&tok=${tok}`, { cache: "no-store" });
      const j = await r.json(); if (cur !== info) return;
      renderMemos(j.memos || []); syncCount(info.id, j.memos || []);
    } catch (e) { if (cur === info) panel.querySelector(".dwt-list").innerHTML = `<div class="dwt-empty">메모를 불러오지 못했습니다.<br>인터넷 연결을 확인하세요.</div>`; }
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); form.requestSubmit(); } });
    form.onsubmit = async (e) => {
      e.preventDefault(); err.textContent = "";
      const text = ta.value.trim(); if (!text) return;
      myName = nm.value.trim(); ls.set("dw-memo-name", myName);
      btn.disabled = true;
      try {
        const j = await api({ action: "add", id: info.id, title: info.title, name: myName, text });
        ta.value = ""; renderMemos(j.memos); syncCount(info.id, j.memos);
      } catch (e2) { fail(e2); }
      btn.disabled = false;
    };
    panel.querySelector(".dwt-list").onclick = async (e) => {
      const b = e.target.closest("button[data-act]"); if (!b) return;
      const mid = b.closest(".dwt-m").dataset.mid;
      if (b.dataset.act === "del" && !confirm("이 메모를 삭제할까요?")) return;
      b.disabled = true;
      try {
        const j = await api(b.dataset.act === "del" ? { action: "del", id: info.id, mid } : { action: "done", id: info.id, mid, done: !b.classList.contains("ok") });
        renderMemos(j.memos); syncCount(info.id, j.memos);
      } catch (e2) { fail(e2); b.disabled = false; }
    };
    if (matchMedia("(min-width:700px)").matches) setTimeout(() => ta.focus(), 260);
  }

  /* 카드 꾸미기 */
  const CARD_SEL = "#grid a.card, #results a.card";
  function decorate() {
    document.querySelectorAll(CARD_SEL).forEach((card) => {
      if (card.querySelector(".dwt-row")) return;
      const row = document.createElement("div"); row.className = "dwt-row";
      row.innerHTML = `<span class="dwt-b" role="button" data-k="qr" title="QR 코드">${I.qr}QR</span><span class="dwt-b" role="button" data-k="memo" title="메모">${I.memo}<em style="font-style:normal">메모</em></span><span class="dwt-b shoot" role="button" data-k="shoot" title="전체 화면 · 화면 꺼짐 방지로 열기">${I.play}촬영</span>`;
      row.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        const b = e.target.closest(".dwt-b"); if (!b) return;
        const info = cardInfo(card);
        if (b.dataset.k === "qr") openQR(info);
        else if (b.dataset.k === "shoot") location.href = "/shoot.html?u=" + encodeURIComponent(info.id);
        else openMemo(info);
      });
      const open = card.querySelector(".open");
      card.insertBefore(row, open || null);
    });
    paintCounts(); paintThumbs();
  }
  function paintCounts() {
    document.querySelectorAll(CARD_SEL).forEach((card) => {
      const b = card.querySelector('.dwt-b[data-k="memo"]'); if (!b) return;
      const { id } = cardInfo(card), c = counts[id];
      b.classList.toggle("has", !!c);
      b.classList.toggle("new", !!c && c.last > (seenMemo[id] || ""));
      const em = b.querySelector("em"), txt = c ? (c.open ? `메모 ${c.open}` : `메모 ${c.n} ✓`) : "메모";
      if (em.textContent !== txt) em.textContent = txt;
      const tt = c ? `메모 ${c.n}개 (미완료 ${c.open}개)` : "메모";
      if (b.title !== tt) b.title = tt;
    });
  }
  let lastCounts = 0;
  async function loadCounts() {
    if (Date.now() - lastCounts < 30000) return; lastCounts = Date.now();
    try { const j = await (await fetch(`${API}?counts=1`, { cache: "no-store" })).json(); if (j.ok) { counts = j.counts || {}; paintCounts(); } } catch {}
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") loadCounts(); });

  /* 오프라인 저장 (부 페이지) */
  async function saveOffline(btn) {
    if (!("caches" in window)) { alert("이 브라우저는 오프라인 저장을 지원하지 않습니다."); return; }
    const cards = [...document.querySelectorAll("#grid a.card")].filter((c) => c.style.display !== "none");
    const urls = new Set([location.href, "/static-items.js", "/updates.js", "/dw-tools.js", "/qr.js"]);
    cards.forEach((c) => urls.add(new URL(c.getAttribute("href"), location.href).href));
    const cache = await caches.open(CACHE);
    const pages = [...urls]; let done = 0, fail = 0;
    const label = btn.querySelector("span");
    btn.disabled = true;
    const put = async (u, opts) => {
      const r = await fetch(u, { cache: "reload", ...opts });
      if (!r.ok && r.type !== "opaque") throw 0;
      await cache.put(u, r.clone()); return r;
    };
    const sub = new Set();
    for (const u of pages) {
      label.textContent = `저장 중 ${done + 1}/${pages.length}`;
      try {
        const r = await put(u);
        if ((r.headers.get("content-type") || "").includes("text/html")) {
          const html = await r.clone().text();
          for (const m of html.matchAll(/<(?:script|link|img)\b[^>]*?(?:src|href)\s*=\s*["']([^"'#]+)["']/gi)) {
            try {
              const a = new URL(m[1], u);
              if (/^https?:$/.test(a.protocol) && !/googletagmanager|google-analytics/.test(a.host) && !a.pathname.startsWith("/admin")) sub.add(a.href);
            } catch {}
          }
        }
      } catch { fail++; }
      done++;
    }
    for (const s of sub) { try { await put(s, new URL(s).origin === location.origin ? {} : { mode: "no-cors" }); } catch {} }
    btn.disabled = false; btn.classList.toggle("ok", !fail);
    label.textContent = fail ? `저장 완료 (${fail}개 실패)` : `오프라인 저장 완료 · ${cards.length}개`;
  }
  function mountOffline() {
    const count = document.getElementById("count");
    if (!count || !document.getElementById("grid") || document.querySelector(".dwt-offline")) return;
    const b = document.createElement("button"); b.className = "dwt-off dwt-offline"; b.type = "button";
    b.title = "이 부의 자료를 기기에 저장해서 인터넷 없이도 열 수 있게 합니다";
    b.innerHTML = `${I.dl}<span>오프라인 저장</span>`;
    b.onclick = () => saveOffline(b);
    count.parentNode.insertBefore(b, count);
  }


  /* ZIP 다운로드 (피라밋 전체 / 부별) — 부 · 씬별 폴더로 정리 */
  const JSZIP_URL = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
  let zipLib;
  const loadZip = () => zipLib || (zipLib = new Promise((ok, no) => {
    if (window.JSZip) return ok(window.JSZip);
    const s = document.createElement("script"); s.src = JSZIP_URL;
    s.onload = () => (window.JSZip ? ok(window.JSZip) : no()); s.onerror = () => { zipLib = null; no(); };
    document.head.appendChild(s);
  }));
  const safeName = (s) => String(s || "").replace(/[\\/:*?"<>|\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "자료";
  const partNo = (x) => Number(x.partNum) || parseInt(x.part) || 0;
  async function gatherItems(onlyPart) {
    const [st, up] = await Promise.all([
      (window.DW_STATIC || Promise.resolve({ scenes: [] })).catch(() => ({ scenes: [] })),
      fetch("/.netlify/functions/catalog?project=pyramid", { cache: "no-store" }).then((r) => r.json()).then((j) => j.items || []).catch(() => [])
    ]);
    let all = [...(st.scenes || []), ...up.map((x) => ({ ...x, uploaded: true }))];
    if (onlyPart) all = all.filter((x) => partNo(x) === onlyPart);
    // 같은 파일을 여러 화면으로 쓰는 자료(예: ?screen=)는 한 번만 담는다
    const byFile = new Map();
    for (const x of all) {
      const u = new URL(x.url, location.href);
      const k = x.uploaded ? u.href : u.pathname;
      if (byFile.has(k)) { byFile.get(k).titles.push(x.title); continue; }
      byFile.set(k, { ...x, abs: x.uploaded ? u.href : u.origin + u.pathname, titles: [x.title] });
    }
    return [...byFile.values()].sort((a, b) => partNo(a) - partNo(b) || (parseInt(a.scene) || 0) - (parseInt(b.scene) || 0));
  }
  // 사이트 전용 코드(검색 차단 · 오프라인 · 방문 통계 · 목록 도구)는 빼고, 같은 서버의 CSS/JS 는 파일 안에 넣어 혼자 열리게 한다
  async function standaloneHTML(html, base) {
    html = html.replace(/<!-- DW-(?:SITE|GA|GA-OWNER) -->(?:<meta[^>]*>)?(?:<script[^>]*>[\s\S]*?<\/script>)*/g, "");
    const origin = location.origin;
    const grab = async (href) => { try { const u = new URL(href, base); if (u.origin !== origin) return null; const r = await fetch(u.href); return r.ok ? await r.text() : null; } catch { return null; } };
    for (const m of [...html.matchAll(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi)]) {
      const href = (m[0].match(/href=["']([^"']+)["']/i) || [])[1]; if (!href) continue;
      const css = await grab(href); if (css == null) continue;
      html = html.replace(m[0], () => `<style>\n${css}\n</style>`);
    }
    for (const m of [...html.matchAll(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi)]) {
      const js = await grab(m[2]); if (js == null) continue;
      const attrs = (m[1] + m[3]).replace(/\s(defer|async)\b/gi, "");
      html = html.replace(m[0], () => `<script${attrs}>\n${js.replace(/<\/script/gi, "<\\/script")}\n</script>`);
    }
    return html;
  }
  async function downloadZip(btn, onlyPart) {
    const label = btn.querySelector("span"), orig = label.textContent;
    btn.disabled = true; label.textContent = "준비 중…";
    try {
      const [JSZip, items] = await Promise.all([loadZip(), gatherItems(onlyPart)]);
      if (!items.length) { label.textContent = "받을 자료가 없습니다"; return; }
      const zip = new JSZip(), used = new Set(); let fail = 0;
      for (let i = 0; i < items.length; i++) {
        const x = items[i];
        label.textContent = `모으는 중 ${i + 1}/${items.length}`;
        try {
          const r = await fetch(x.abs); if (!r.ok) throw 0;
          const type = r.headers.get("content-type") || "";
          let ext = ((x.uploaded ? x.filename : new URL(x.abs).pathname).match(/\.([A-Za-z0-9]{1,5})$/) || [])[1] || (type.includes("html") ? "html" : "bin");
          const title = x.titles.length > 1 ? `${x.titles[0]} 외 ${x.titles.length - 1}개 화면` : x.title;
          let name = `${safeName(x.part || "기타")}/${safeName(x.scene)}_${safeName(title)}`, n = 2;
          while (used.has(name + "." + ext)) name = name.replace(/ \(\d+\)$/, "") + ` (${n++})`;
          used.add(name + "." + ext);
          if (type.includes("text/html") || /^html?$/i.test(ext)) zip.file(`${name}.${ext}`, await standaloneHTML(await r.text(), x.abs));
          else zip.file(`${name}.${ext}`, await r.arrayBuffer());
        } catch { fail++; }
      }
      label.textContent = "압축 중…";
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const d = new Date(), ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `피라밋_${onlyPart ? onlyPart + "부" : "전체"}_${ymd}.zip`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
      label.textContent = fail ? `다운로드 완료 (${fail}개 실패)` : `다운로드 완료 · ${items.length}개`;
      btn.classList.toggle("ok", !fail);
      setTimeout(() => { label.textContent = orig; btn.classList.remove("ok"); }, 6000);
    } catch {
      label.textContent = "다운로드 실패 · 인터넷 확인";
      setTimeout(() => { label.textContent = orig; }, 5000);
    } finally { btn.disabled = false; }
  }
  function mountZip() {
    const m = location.pathname.match(/^\/pyramid\/part(\d+)\//);
    const onPyramid = /^\/pyramid\/(index\.html)?$/.test(location.pathname);
    if (!m && !onPyramid) return;
    const anchor = document.getElementById(m ? "count" : "totalCount");
    if (!anchor || document.querySelector(".dwt-zip")) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "dwt-off dwt-zip";
    b.title = m ? "이 부의 자료를 씬별로 정리해 ZIP 파일로 받습니다" : "피라밋 전체 자료를 부 · 씬별로 정리해 ZIP 파일로 받습니다";
    b.innerHTML = `${I.zip}<span>${m ? "이 부 다운로드" : "전체 다운로드"}</span>`;
    b.onclick = () => downloadZip(b, m ? +m[1] : 0);
    anchor.parentNode.insertBefore(b, anchor);
    anchor.parentNode.style.flexWrap = "wrap"; anchor.parentNode.style.rowGap = "10px";
  }

  /* 카드 미리보기 사진 */
  let thumbIdx = null, staticByPath = null;
  const thumbIndexP = fetch("/.netlify/functions/thumb?index=1").then((r) => r.json()).then((j) => j.thumbs || {}).catch(() => ({}));
  Promise.all([thumbIndexP, (window.DW_STATIC || Promise.resolve({ scenes: [] })).catch(() => ({ scenes: [] }))]).then(([t, st]) => {
    thumbIdx = t; staticByPath = new Map();
    for (const x of [...(st.scenes || []), ...(st.apps || [])]) { try { const u = new URL(x.url, location.href); staticByPath.set(u.pathname + u.search, x.id); } catch {} }
    paintThumbs();
  });
  function thumbFor(card) {
    const u = new URL(card.getAttribute("href"), location.href);
    let tid = "";
    if (u.pathname === "/.netlify/functions/file") tid = "u:" + (u.searchParams.get("key") || "");
    else if (staticByPath && staticByPath.has(u.pathname + u.search)) tid = "s:" + staticByPath.get(u.pathname + u.search);
    if (!tid) return null;
    if (thumbIdx[tid]) return `/.netlify/functions/thumb?id=${encodeURIComponent(tid)}&v=${thumbIdx[tid]}`;
    if (tid.startsWith("s:")) return `/thumbs/${tid.slice(2)}.jpg`;
    return null;
  }
  function paintThumbs() {
    if (!thumbIdx) return;
    document.querySelectorAll(CARD_SEL).forEach((card) => {
      if (card.dataset.dwThumb) return;
      card.dataset.dwThumb = "1";
      const src = thumbFor(card); if (!src) return;
      const box = document.createElement("span"); box.className = "dwt-thumb";
      const img = new Image(); img.loading = "lazy"; img.alt = ""; img.src = src;
      img.onerror = () => box.remove();
      box.appendChild(img); card.insertBefore(box, card.firstChild);
    });
  }

  function boot() {
    mountZip();
    const root = document.getElementById("grid") || document.getElementById("results");
    if (!root) return;
    let raf = 0;
    new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(decorate); }).observe(root, { childList: true, subtree: true });
    decorate(); mountOffline(); loadCounts();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
