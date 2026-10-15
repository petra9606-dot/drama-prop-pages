// 앱·게임 카드 (관리자에서 올리면 피라밋 페이지 '촬영용 앱' · '게임' 섹션에 자동으로 붙는다)
export const APPCARDS_KEY = "__meta/appcards.json";
export const webKey = (id) => `__meta/apps/${id}/web`;
export const chunkKey = (chunkId, i) => `__meta/chunks/${chunkId}/${String(i).padStart(3, "0")}`;
export async function readCards(store) {
  try { const v = await store.get(APPCARDS_KEY, { type: "json" }); return Array.isArray(v) ? v : []; } catch { return []; }
}
export async function writeCards(store, list) { await store.setJSON(APPCARDS_KEY, list); }
export const apkUrl = (c) => c.apk ? `/dl/${c.id}/${encodeURIComponent(c.apk.name || "app.apk")}` : "";
export const webUrl = (c) => c.web ? `/.netlify/functions/app-file?id=${encodeURIComponent(c.id)}&v=${Date.parse(c.web.at) || 1}` : "";
export function publicCard(c, thumbs = {}) {
  return {
    id: c.id, kind: c.kind, title: c.title, tag: c.tag || "", desc: c.desc || "", footer: c.footer || "",
    group: c.group || "", part: c.part || "", scene: c.scene || "", order: c.order || 0, portrait: !!c.portrait,
    webUrl: webUrl(c), webName: c.web?.name || "", apkUrl: apkUrl(c), apkSize: c.apk?.size || 0, apkName: c.apk?.name || "",
    cover: thumbs["a:" + c.id] ? `/.netlify/functions/thumb?id=${encodeURIComponent("a:" + c.id)}&v=${thumbs["a:" + c.id]}` : "",
    visible: c.visible !== false, updatedAt: c.updatedAt || c.createdAt
  };
}
export async function dropChunks(store, apk) {
  if (!apk?.chunkId) return;
  for (let i = 0; i < (apk.count || 0); i++) await store.delete(chunkKey(apk.chunkId, i)).catch(() => {});
}
