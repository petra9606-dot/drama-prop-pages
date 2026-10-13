// DisolveWorks 업데이트 알림 — 새로 올린 자료 · 수정된 자료 · 공지를 모든 방문자에게 보여 준다.
// 사용: <script src="/static-items.js"></script><script src="/updates.js"></script>
(() => {
  const DAY = 864e5, FRESH_DAYS = 14;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const seen = ls.get("dw-seen", {});
  const MODE = ["normal", "less", "off"].includes(ls.get("dw-feed-mode", "normal")) ? ls.get("dw-feed-mode", "normal") : "normal";
  if (MODE !== "normal") document.documentElement.classList.add("dwu-" + MODE);
  const ago = (iso) => {
    const t = Date.parse(iso); if (!t) return "";
    const s = (Date.now() - t) / 1000;
    if (s < 60) return "방금 전";
    if (s < 3600) return `${Math.floor(s / 60)}분 전`;
    if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
    if (s < 86400 * 7) return `${Math.floor(s / 86400)}일 전`;
    const d = new Date(t); return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };
  const TYPE = { new: ["NEW", "새 자료"], updated: ["수정", "수정됨"], notice: ["공지", "공지"] };

  /* 스타일 */
  const css = `
.dwu-btn{position:relative;display:inline-flex;align-items:center;gap:7px;border:1px solid #2c3a57;background:#111a2b;color:#cfd9ff;border-radius:999px;padding:7px 13px;font:700 12px/1 inherit;cursor:pointer;letter-spacing:.02em}
.dwu-btn:hover{border-color:#5b7de7;background:#16223a}
.dwu-btn svg{width:14px;height:14px}
.dwu-btn b{min-width:18px;height:18px;border-radius:9px;background:#ff5a64;color:#fff;font-size:10px;display:inline-grid;place-items:center;padding:0 5px}
.dwu-btn b.zero{display:none}
.dwu-dim{position:fixed;inset:0;background:rgba(3,6,12,.55);backdrop-filter:blur(2px);z-index:90;opacity:0;pointer-events:none;transition:.2s}
.dwu-dim.show{opacity:1;pointer-events:auto}
.dwu-panel{position:fixed;top:0;right:0;bottom:0;width:min(420px,100vw);background:#0d121d;border-left:1px solid #253049;z-index:91;transform:translateX(100%);transition:transform .25s ease;display:flex;flex-direction:column;color:#eef2ff;font-family:inherit}
.dwu-panel.show{transform:none}
.dwu-head{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 14px;border-bottom:1px solid #1d2638}
.dwu-head h3{margin:0;font-size:18px;letter-spacing:-.02em}
.dwu-head small{display:block;color:#71809a;font-size:11px;margin-top:4px;font-weight:400}
.dwu-x{border:0;background:none;color:#8c98b0;font-size:24px;cursor:pointer;line-height:1}
.dwu-list{flex:1;overflow:auto;padding:6px 12px 20px}
.dwu-item{display:block;text-decoration:none;color:inherit;padding:13px 10px;border-bottom:1px solid #182134;border-radius:10px}
.dwu-item:hover{background:#121a2a}
.dwu-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.dwu-tag{font-size:10px;font-weight:900;border-radius:5px;padding:3px 6px;letter-spacing:.04em}
.dwu-tag.new{background:#163828;color:#7fe3b0}.dwu-tag.updated{background:#3a2f15;color:#f3c66a}.dwu-tag.notice{background:#1d2945;color:#b7c5ff}
.dwu-where{font-size:11px;color:#9fb0d8;font-weight:700}
.dwu-time{margin-left:auto;font-size:11px;color:#66748e}
.dwu-title{font-size:14px;font-weight:800;margin-top:7px;letter-spacing:-.01em}
.dwu-note{font-size:12px;color:#9aa6bd;margin-top:4px;line-height:1.55}
.dwu-unread .dwu-title::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#ff5a64;margin-right:7px;vertical-align:2px}
.dwu-empty{color:#66748e;font-size:13px;padding:30px 10px;text-align:center}
.dwu-foot{padding:12px 20px;border-top:1px solid #1d2638;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#66748e}
.dwu-foot button{border:1px solid #2c3a57;background:#111a2b;color:#cfd9ff;border-radius:8px;padding:7px 10px;font-size:11px;cursor:pointer}
.dwu-strip{border:1px solid #243049;background:linear-gradient(145deg,rgba(255,255,255,.02),rgba(255,255,255,0)),#0f1522;border-radius:16px;padding:6px 8px;margin:0 0 26px}
.dwu-strip-head{display:flex;justify-content:space-between;align-items:center;padding:12px 10px 6px}
.dwu-strip-head b{font-size:13px;letter-spacing:.12em}
.dwu-strip-head a{font-size:12px;color:#8fa8ff;cursor:pointer;text-decoration:none}
.dwu-strip .dwu-item{border-bottom:1px solid #182134}
.dwu-strip .dwu-item:last-child{border-bottom:0}
.dwu-badge{display:inline-block;font-size:9px;font-weight:900;letter-spacing:.06em;border-radius:5px;padding:3px 6px;margin-left:6px;vertical-align:2px}
.dwu-badge.new{background:#1d9a5f;color:#fff}.dwu-badge.updated{background:#c98a1b;color:#fff}
.dwu-dot{display:inline-block;font-size:10px;font-weight:900;color:#fff;background:#ff5a64;border-radius:999px;padding:3px 7px;margin-left:8px}
.dwu-less .dwu-dot,.dwu-less .dwu-badge{background:#2a3347;color:#8d99b3;font-size:8px;padding:2px 5px}
.dwu-less .dwu-btn b{min-width:7px;width:7px;height:7px;padding:0;font-size:0;background:#7b8aa8}
.dwu-btn.quiet{opacity:.55;padding:6px 10px}
.dwu-mode{display:flex;gap:4px;background:#0b111c;border:1px solid #243049;border-radius:9px;padding:3px}
.dwu-mode button{border:0;background:none;color:#8d99b3;font-size:11px;padding:6px 9px;border-radius:6px;cursor:pointer}
.dwu-mode button.on{background:#25324f;color:#e3e9ff;font-weight:700}
.dwu-set{padding:12px 20px;border-top:1px solid #1d2638;font-size:11px;color:#8d99b3;display:flex;align-items:center;justify-content:space-between;gap:10px}
.dwu-set small{display:block;color:#5e6b84;margin-top:3px}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* 데이터 */
  const fromServer = fetch("/.netlify/functions/updates?limit=60", { cache: "no-store" }).then((r) => r.json()).then((j) => j.items || []).catch(() => []);
  const fromStatic = (window.DW_STATIC || Promise.resolve({ scenes: [], apps: [] })).then(({ scenes = [], apps = [] }) =>
    [...scenes, ...apps].filter((x) => x.changedAt).map((x) => ({
      id: "static:" + x.id + ":" + x.changedAt, sid: x.id, at: x.changedAt, type: x.changeType || "updated",
      title: x.title, part: x.part || "", scene: x.scene || "", note: x.changeNote || "", url: x.url
    }))).catch(() => []);
  const feed = Promise.all([fromServer, fromStatic]).then(([a, b]) => {
    const all = [...a, ...b].filter((x) => x && x.at);
    all.sort((x, y) => Date.parse(y.at) - Date.parse(x.at));
    return all;
  });

  const itemId = (x) => x.key ? "u:" + x.key : x.id ? "s:" + x.id : "";
  // 카드 배지: 최근 14일 안에 새로 올라왔거나 수정됐고, 이 방문자가 아직 열어 보지 않은 자료
  function badge(x) {
    if (MODE === "off") return "";
    const at = Date.parse(x.changedAt || ""); if (!at || Date.now() - at > FRESH_DAYS * DAY) return "";
    const id = itemId(x); const s = Date.parse(seen[id] || ""); if (s && s >= at) return "";
    return x.changeType === "new" ? "new" : "updated";
  }
  function badgeHTML(x) { const b = badge(x); return b ? `<span class="dwu-badge ${b}">${b === "new" ? "NEW" : "수정됨"}</span>` : ""; }
  function markSeen(x) { const id = typeof x === "string" ? x : itemId(x); if (!id) return; seen[id] = new Date().toISOString(); ls.set("dw-seen", seen); }

  const readAt = () => Date.parse(ls.get("dw-feed-read", "")) || (Date.now() - 3 * DAY);
  const unread = (list) => list.filter((x) => Date.parse(x.at) > readAt()).length;

  function rowHTML(x, unreadMark) {
    const [tag] = TYPE[x.type] || TYPE.notice;
    const where = [x.part, x.scene].filter(Boolean).join(" · ");
    const open = x.url ? `href="${esc(x.url)}" target="_blank" rel="noopener"` : "";
    return `<a class="dwu-item ${unreadMark && Date.parse(x.at) > readAt() ? "dwu-unread" : ""}" ${open} data-sid="${esc(x.sid || "")}" data-key="${esc(x.key || "")}">
      <div class="dwu-row"><span class="dwu-tag ${esc(x.type)}">${tag}</span>${where ? `<span class="dwu-where">${esc(where)}</span>` : ""}</div>
      <div class="dwu-title">${esc(x.title || "업데이트")}</div>${x.note ? `<div class="dwu-note">${esc(x.note)}</div>` : ""}</a>`;
  }
  function wireClicks(root) {
    root.addEventListener("click", (e) => { const a = e.target.closest(".dwu-item"); if (!a) return; if (a.dataset.key) markSeen("u:" + a.dataset.key); if (a.dataset.sid) markSeen("s:" + a.dataset.sid); });
  }

  /* 오른쪽 알림 패널 */
  let panel, dim, btns = [];
  function ensurePanel() {
    if (panel) return;
    dim = document.createElement("div"); dim.className = "dwu-dim";
    panel = document.createElement("aside"); panel.className = "dwu-panel";
    panel.innerHTML = `<div class="dwu-head"><div><h3>업데이트 소식</h3><small>새로 올라오거나 수정된 자료를 알려 드립니다.</small></div><button class="dwu-x" aria-label="닫기">×</button></div><div class="dwu-list"><div class="dwu-empty">불러오는 중...</div></div><div class="dwu-set"><div>내 알림 표시<small>이 기기에서만 적용됩니다.</small></div><div class="dwu-mode">${[["normal","보통"],["less","줄이기"],["off","끄기"]].map(([k,l]) => `<button type="button" data-mode="${k}" class="${MODE === k ? "on" : ""}">${l}</button>`).join("")}</div></div><div class="dwu-foot"><span>최근 60건</span><button type="button" data-read>모두 읽음</button></div>`;
    document.body.append(dim, panel);
    const close = () => { panel.classList.remove("show"); dim.classList.remove("show"); };
    dim.onclick = close; panel.querySelector(".dwu-x").onclick = close;
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    panel.querySelectorAll("[data-mode]").forEach((b) => b.onclick = () => { ls.set("dw-feed-mode", b.dataset.mode); location.reload(); });
    panel.querySelector("[data-read]").onclick = () => { ls.set("dw-feed-read", new Date().toISOString()); feed.then(paintPanel); };
    wireClicks(panel);
  }
  function paintPanel(list) {
    const box = panel.querySelector(".dwu-list");
    box.innerHTML = list.length ? list.map((x) => rowHTML(x, true)).join("") : `<div class="dwu-empty">아직 업데이트 소식이 없습니다.</div>`;
    paintButtons(list);
  }
  function paintButtons(list) { const n = MODE === "off" ? 0 : unread(list); btns.forEach((b) => { const c = b.querySelector("b"); c.textContent = n > 99 ? "99+" : n; c.classList.toggle("zero", !n); b.classList.toggle("quiet", MODE === "off"); }); }
  function openPanel() {
    ensurePanel();
    feed.then((list) => { paintPanel(list); setTimeout(() => { ls.set("dw-feed-read", new Date().toISOString()); paintButtons(list); }, 1200); });
    panel.classList.add("show"); dim.classList.add("show");
  }
  // 버튼을 넣을 자리(요소)를 받아 '업데이트' 버튼을 붙인다
  function mountButton(host) {
    if (!host) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "dwu-btn";
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>업데이트<b class="zero">0</b>`;
    b.onclick = openPanel; host.appendChild(b); btns.push(b);
    feed.then(paintButtons);
  }
  // 최근 업데이트 몇 건을 페이지 안에 띠로 보여 준다
  function mountStrip(host, { limit = 5, filter } = {}) {
    if (!host || MODE !== "normal") return;
    feed.then((list) => {
      const items = (filter ? list.filter(filter) : list).slice(0, limit);
      if (!items.length) { host.innerHTML = ""; return; }
      host.innerHTML = `<div class="dwu-strip"><div class="dwu-strip-head"><b>최근 업데이트</b><a data-all>전체 보기 →</a></div>${items.map((x) => rowHTML(x, true)).join("")}</div>`;
      host.querySelector("[data-all]").onclick = openPanel;
      wireClicks(host);
    });
  }
  window.DW_UPDATES = { feed, badge, badgeHTML, markSeen, mountButton, mountStrip, open: openPanel, ago };
})();
