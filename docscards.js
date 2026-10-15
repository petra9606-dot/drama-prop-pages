// 피라밋 페이지 '소품 서류' — 부별 카드 (누르면 서류 페이지로)
(() => {
  const grid = document.getElementById("docGrid"); if (!grid) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
  const num = (s) => { const m = String(s || "").match(/\d+/); return m ? +m[0] : 999; };
  fetch("/.netlify/functions/docs").then((r) => r.json()).then(({ folders = [], files = [] }) => {
    const byId = new Map(folders.map((f) => [f.id, f]));
    const top = (id) => { let f = byId.get(id); while (f && f.parent && byId.get(f.parent)) f = byId.get(f.parent); return f; };
    const parts = new Map();
    for (const f of folders.filter((x) => !x.parent)) { const p = f.part || "기타"; if (!parts.has(p)) parts.set(p, { folders: [], n: 0 }); parts.get(p).folders.push(f); }
    for (const x of files) { const t = top(x.folder); const p = t ? (t.part || "기타") : null; if (p && parts.has(p)) parts.get(p).n++; }
    if (!parts.size) { const h = document.getElementById("docs"); h?.nextElementSibling?.remove(); h?.remove(); grid.remove(); return; }
    grid.innerHTML = [...parts.entries()].sort((a, b) => num(a[0]) - num(b[0])).map(([p, v]) => {
      const fs = v.folders.sort((a, b) => num(a.scene) - num(b.scene));
      const rows = fs.slice(0, 3).map((f) => `<div class="scene-row"><span class="scene-badge">${esc(f.scene || "서류")}</span><span class="scene-name">${esc(f.name.replace(/^\s*\d{1,2}\s*부\s*/, "").replace(/^\s*\d{1,3}\s*씬\s*/, ""))}</span></div>`).join("");
      return `<a class="card" href="docs/#p=${encodeURIComponent(p)}">
        <div class="part-title"><strong>${esc(p)}</strong><span class="num">DOCS</span></div>
        <div class="preview">${rows}${fs.length > 3 ? `<div class="empty">외 ${fs.length - 3}개 씬</div>` : ""}</div>
        <div class="footer"><span>씬 ${fs.length}개 · 서류 ${v.n}개</span><span class="arrow">→</span></div></a>`;
    }).join("");
  }).catch(() => {});
})();
