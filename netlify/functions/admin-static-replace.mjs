// 관리자: 깃허브로 올린 자료를 배포 없이 교체 / 원본(깃허브 버전)으로 되돌리기
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, pushUpdate, cleanNote } from "../lib/flags.mjs";
import { createBackup, cleanupExpiredBackups } from "../lib/backups.mjs";
import { fileFromForm, MAX_FILE } from "../lib/chunks.mjs";
import { injectBytes } from "../lib/inject.mjs";
import { readOverrides, writeOverrides, overrideKey } from "../lib/overrides.mjs";
import { logActivity } from "../lib/activity.mjs";

const ALLOWED = new Set(["html", "htm"]);

async function findStatic(req, id) {
  const r = await fetch(new URL("/static-items.json", req.url), { headers: { "cache-control": "no-cache" } });
  const d = await r.json();
  return [...(d.scenes || []), ...(d.apps || [])].find((x) => x.id === id) || null;
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!isAdmin(req)) return Response.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const form = await req.formData();
    const id = String(form.get("id") || "").slice(0, 120);
    const action = String(form.get("action") || "replace");
    const item = id ? await findStatic(req, id) : null;
    if (!item) return Response.json({ ok: false, error: "깃허브 자료를 찾을 수 없습니다." }, { status: 404 });
    const path = decodeURIComponent(new URL(item.url, req.url).pathname).replace(/\/$/, "/index.html");
    const store = uploadsStore();
    const key = overrideKey(id);
    const map = await readOverrides(store);

    if (action === "revert") {
      const cur = await store.getMetadata(key);
      if (cur) { await createBackup(store, key, cur.metadata || {}); await store.delete(key); }
      for (const p of Object.keys(map)) if (map[p].id === id) delete map[p];
      await writeOverrides(store, map);
      await logActivity(store, { action: "원본으로 되돌림", title: item.title, part: item.part, scene: item.scene, detail: "깃허브 원본 버전으로 복원", url: item.url });
      return Response.json({ ok: true, overrides: map }, { headers: { "Cache-Control": "no-store" } });
    }

    const f = await fileFromForm(form, store);
    if (!f) return Response.json({ ok: false, error: "파일을 선택해 주세요." }, { status: 400 });
    if (f.size > MAX_FILE) return Response.json({ ok: false, error: "파일당 20MB까지 올릴 수 있습니다." }, { status: 413 });
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED.has(ext)) return Response.json({ ok: false, error: "깃허브 자료는 HTML 파일로만 교체할 수 있습니다." }, { status: 400 });

    const note = cleanNote(form.get("note"));
    const announce = String(form.get("announce")) !== "false";
    const cur = await store.getMetadata(key);
    if (cur) await createBackup(store, key, cur.metadata || {});
    const now = new Date().toISOString();
    const data = injectBytes(f.data);
    const meta = { id, path, title: item.title, part: item.part, scene: item.scene, filename: f.name, contentType: "text/html; charset=utf-8", size: data.byteLength, updatedAt: now };
    await store.set(key, data, { metadata: meta });
    for (const p of Object.keys(map)) if (map[p].id === id) delete map[p];
    map[path] = { id, key, contentType: meta.contentType, updatedAt: now, filename: f.name, size: meta.size };
    await writeOverrides(store, map);
    cleanupExpiredBackups(store).catch(() => {});
    if (announce) {
      try { await pushUpdate(store, { type: "updated", sid: id, project: item.project || "pyramid", part: item.part, scene: item.scene, title: item.title, note, url: item.url }); } catch {}
    }
    await logActivity(store, { action: "파일 교체", title: item.title, part: item.part, scene: item.scene, detail: `깃허브 자료 · ${f.name}${note ? " · " + note : ""}`, url: item.url });
    return Response.json({ ok: true, overrides: map }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json({ ok: false, error: `서버 오류: ${err?.message || String(err)}` }, { status: 500 });
  }
};
