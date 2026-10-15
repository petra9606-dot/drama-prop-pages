// 관리자 작업 기록 — 언제, 무엇을 올리고 바꾸고 숨겼는지 남긴다 (최근 400건)
export const ACTIVITY_KEY = "__meta/activity.json";

export async function readActivity(store) {
  try { const v = await store.get(ACTIVITY_KEY, { type: "json" }); return Array.isArray(v) ? v : []; } catch { return []; }
}

export async function logActivity(store, entry) {
  try {
    const list = await readActivity(store);
    list.unshift({
      at: new Date().toISOString(),
      action: String(entry.action || "").slice(0, 40),
      title: String(entry.title || "").slice(0, 120),
      part: String(entry.part || "").slice(0, 10),
      scene: String(entry.scene || "").slice(0, 20),
      detail: String(entry.detail || "").slice(0, 200),
      url: String(entry.url || "").slice(0, 400)
    });
    await store.setJSON(ACTIVITY_KEY, list.slice(0, 400));
  } catch {}
}
