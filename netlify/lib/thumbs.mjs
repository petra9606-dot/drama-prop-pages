// 카드 미리보기 사진 (관리자 페이지가 자동으로 찍어서 올린다)
export const THUMBS_KEY = "__meta/thumbs.json";
export const thumbKey = (id) => "__meta/thumbs/" + Buffer.from(String(id), "utf8").toString("base64url").slice(0, 400);
export async function readThumbs(store) {
  try { const v = await store.get(THUMBS_KEY, { type: "json" }); return v && typeof v === "object" ? v : {}; } catch { return {}; }
}
