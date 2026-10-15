// 소품 서류 — 폴더/파일 목록과 파일 저장 위치
export const DOCS_KEY = "__meta/docs.json";
export const docKey = (id, kind = "orig") => `__meta/docs/${id}/${kind === "preview" ? "preview" : "orig"}`;
export const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export async function readDocs(store) {
  try { const v = await store.get(DOCS_KEY, { type: "json" }); if (v && Array.isArray(v.folders) && Array.isArray(v.files)) return v; } catch {}
  return { folders: [], files: [] };
}
export async function writeDocs(store, d) { await store.setJSON(DOCS_KEY, d); }
// "1부 5씬 장훈, 은주 아파트 청약 서류" → { part:"1부", scene:"5씬" }
export function parsePartScene(name) {
  const p = String(name).match(/(\d{1,2})\s*부/), s = String(name).match(/(\d{1,3})\s*씬/);
  return { part: p ? `${+p[1]}부` : "", scene: s ? `${+s[1]}씬` : "" };
}
export function publicTree(d, all = false) {
  const hidden = new Set();
  // 숨긴 폴더 아래는 모두 숨김
  const byId = new Map(d.folders.map((f) => [f.id, f]));
  const isHidden = (f) => { for (let x = f; x; x = byId.get(x.parent)) { if (x.visible === false) return true; } return false; };
  for (const f of d.folders) if (isHidden(f)) hidden.add(f.id);
  const folders = d.folders.filter((f) => all || !hidden.has(f.id)).map(({ id, name, parent, order, part, scene, visible, at }) => ({ id, name, parent: parent || "", order: order || 0, part: part || "", scene: scene || "", visible: visible !== false, at }));
  const files = d.files.filter((f) => all || (f.visible !== false && !hidden.has(f.folder))).map((f) => ({
    id: f.id, folder: f.folder || "", name: f.name, size: f.size, type: f.type || "", order: f.order || 0, at: f.at, visible: f.visible !== false,
    preview: f.preview ? { type: f.preview.type, size: f.preview.size, name: f.preview.name } : null
  }));
  return { folders, files };
}
