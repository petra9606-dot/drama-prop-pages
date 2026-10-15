// 깃허브 자료(정적 파일)를 관리자 페이지에서 교체한 내용 — 경로별로 저장소의 파일을 대신 보여 준다
export const OVERRIDES_KEY = "__meta/static-overrides.json";
export const overrideKey = (id) => `__meta/static-files/${String(id).replace(/[^A-Za-z0-9_.-]/g, "_")}`;
export async function readOverrides(store) {
  try { const v = await store.get(OVERRIDES_KEY, { type: "json" }); return v && typeof v === "object" ? v : {}; } catch { return {}; }
}
export async function writeOverrides(store, map) { await store.setJSON(OVERRIDES_KEY, map); }
