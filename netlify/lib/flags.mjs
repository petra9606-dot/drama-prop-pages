
import { getStore } from "@netlify/blobs";

export const STORE_NAME = "disolveworks-uploads";
export const FLAGS_KEY  = "__meta/flags.json";

// 업로드 본문을 다시 쓰지 않고, 상태(휴지통/공개/고정/제목 등)만 따로 저장한다.
// 본문 재업로드(read-modify-write)는 실패 여지가 많아 휴지통이 동작하지 않던 원인이었다.
export function uploadsStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

export function isInternalKey(key) {
  return String(key || "").startsWith("__meta/");
}

export async function readFlags(store) {
  try {
    const v = await store.get(FLAGS_KEY, { type: "json" });
    return (v && typeof v === "object") ? v : {};
  } catch { return {}; }
}

export async function writeFlags(store, flags) {
  await store.setJSON(FLAGS_KEY, flags);
}

export async function patchFlags(store, key, patch) {
  const flags = await readFlags(store);
  const next = { ...(flags[key] || {}), ...patch };
  for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k];
  flags[key] = next;
  await writeFlags(store, flags);
  return next;
}

export async function dropFlags(store, key) {
  const flags = await readFlags(store);
  if (key in flags) { delete flags[key]; await writeFlags(store, flags); }
}

// 블롭 메타데이터 + 오버라이드를 합친 최종 상태
export function merge(metadata, override) {
  return { ...(metadata || {}), ...(override || {}) };
}
