// 관리자에서 올린 앱·게임 카드를 피라밋 페이지 '촬영용 앱' · '게임' 섹션에 붙인다 (기존 카드와 같은 모양)
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
  const mb = (n) => n ? (n / 1048576 >= 10 ? Math.round(n / 1048576) : (n / 1048576).toFixed(1)) + "MB" : "";
  const abs = (u) => new URL(u, location.href).href;
  const where = (c) => [c.part, c.scene].filter(Boolean).join(" ");

  let qrLib;
  const loadQR = () => qrLib || (qrLib = new Promise((ok, no) => {
    if (window.qrcode) return ok(window.qrcode);
    const s = document.createElement("script"); s.src = "/qr.js"; s.onload = () => ok(window.qrcode); s.onerror = no; document.head.appendChild(s);
  }));
  async function qrData(url) { const q = await loadQR(); const qr = q(0, "M"); qr.addData(url); qr.make(); return qr.createDataURL(6, 2); }

  function showQR(title, url) {
    if (window.DW_TOOLS && window.DW_TOOLS.openQR) return window.DW_TOOLS.openQR({ title, url, id: url });
    window.open(url, "_blank");
  }

  function cardHTML(c) {
    const isGame = c.kind === "game";
    const btns = [];
    if (isGame) {
      if (c.webUrl) btns.push(`<a class="dl" href="${esc(c.webUrl)}" data-play>게임 실행</a>`);
      if (c.apkUrl) btns.push(`<a class="${c.webUrl ? "pv" : "dl"}" href="${esc(c.apkUrl)}" download>APK</a>`);
      btns.push(`<a class="pv" href="#" data-qr>QR 코드</a>`);
    } else {
      if (c.webUrl) btns.push(`<a class="pv" href="${esc(c.webUrl)}" data-play>웹 체험</a>`);
      if (c.apkUrl) btns.push(`<a class="dl" href="${esc(c.apkUrl)}" download>${c.webUrl ? "APK" : "APK 다운로드"}</a>`);
      btns.push(`<a class="pv" href="#" data-qr>QR 코드</a>`);
    }
    const badge = isGame ? (c.group || "게임") : (mb(c.apkSize) || where(c) || "웹");
    const line = c.desc || c.apkName || c.webName || "";
    const footL = c.footer || (where(c) ? `${where(c)} 촬영용` : (isGame ? "모바일 · PC" : "촬영용 앱"));
    return `<div class="card ${isGame ? "game-card" : ""}" data-appcard="${esc(c.id)}">
      <div class="part-title"><strong>${esc(c.title)}</strong><span class="num">${esc(c.tag || (isGame ? "GAME" : "APP"))}</span></div>
      ${c.cover ? `<img class="game-cover${c.portrait ? " portrait" : ""}" loading="lazy" src="${esc(c.cover)}" alt="${esc(c.title)} 화면">` : ""}
      <div class="preview"><div class="scene-row"><span class="scene-badge">${esc(badge)}</span><span class="scene-name">${esc(line)}</span></div></div>
      <div class="app-btns${btns.length >= 3 ? " three" : ""}">${btns.join("")}</div>
      ${!isGame && (c.apkUrl || c.webUrl) ? `<img class="qr" alt="${esc(c.title)} QR" data-qrimg>` : ""}
      <div class="footer"><span>${esc(footL)}</span><span class="arrow">→</span></div>
    </div>`;
  }

  function wire(el, c) {
    const target = c.apkUrl || c.webUrl;
    el.querySelector("[data-qr]")?.addEventListener("click", (e) => { e.preventDefault(); showQR(c.title, abs(target)); });
    const img = el.querySelector("[data-qrimg]");
    if (img) qrData(abs(target)).then((d) => { img.src = d; }).catch(() => img.remove());
    // 폰에서는 화면 맞춤 보기로, PC는 새 화면으로
    el.querySelector("[data-play]")?.addEventListener("click", (e) => {
      const small = matchMedia("(max-width: 1024px)").matches && matchMedia("(pointer: coarse)").matches;
      if (small && window.DW_TOOLS && window.DW_TOOLS.openViewer) { e.preventDefault(); window.DW_TOOLS.openViewer({ id: c.webUrl, url: abs(c.webUrl), title: c.title }, false); }
    });
  }

  function place(c) {
    const box = document.createElement("div"); box.innerHTML = cardHTML(c).trim();
    const el = box.firstChild;
    if (c.kind !== "game") { document.getElementById("appGrid")?.appendChild(el); wire(el, c); return; }
    const group = c.group || c.title;
    let grid = null;
    for (const h of document.querySelectorAll(".game-group")) {
      if (h.querySelector("strong")?.textContent.trim() === group) { const n = h.nextElementSibling; if (n && n.classList.contains("game-grid")) grid = n; }
    }
    if (!grid) {
      const extra = document.getElementById("gameExtra"); if (!extra) return;
      const head = document.createElement("div"); head.className = "game-group";
      head.innerHTML = `<strong>${esc(group)}</strong><span>${esc(where(c))}</span>`;
      grid = document.createElement("div"); grid.className = "grid game-grid";
      extra.append(head, grid);
    }
    grid.appendChild(el); wire(el, c);
  }

  fetch("/.netlify/functions/apps").then((r) => r.json()).then(({ items = [] }) => {
    items.forEach(place);
    if (location.hash === "#apps" || location.hash === "#games") document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }).catch(() => {});
})();
