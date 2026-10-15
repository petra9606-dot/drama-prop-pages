import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, patchFlags, readFlags, merge } from "../lib/flags.mjs";
import { createBackup, getBackup, listBackups } from "../lib/backups.mjs";
import { readOverrides, writeOverrides } from "../lib/overrides.mjs";
import { logActivity } from "../lib/activity.mjs";

export default async (req) => {
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });
  const store = uploadsStore();

  try {
    if (req.method === "GET") {
      const key = new URL(req.url).searchParams.get("key") || "";
      if (!key) return Response.json({ ok:false, error:"key가 없습니다." }, { status:400 });
      return Response.json({ ok:true, versions:await listBackups(store, key) }, { headers:{ "Cache-Control":"no-store" }});
    }
    if (req.method !== "POST") return new Response("Method not allowed", { status:405 });

    const body = await req.json().catch(()=>({}));
    const key = String(body.key || "");
    const id = String(body.id || "");
    if (!key || !id) return Response.json({ ok:false, error:"복원할 버전 정보가 없습니다." }, { status:400 });

    const [current, flags, backup] = await Promise.all([
      store.getMetadata(key), readFlags(store), getBackup(store, id, key)
    ]);
    if (!backup) return Response.json({ ok:false, error:"백업이 없거나 보관 기간이 지났습니다." }, { status:404 });
    // 깃허브 자료를 교체했던 버전 복원 (현재 교체본이 없어도 가능)
    if (key.startsWith("__meta/static-files/")) {
      if (current) await createBackup(store, key, current.metadata || {});
      const sm = { ...(backup.metadata.sourceMetadata || {}), updatedAt:new Date().toISOString() };
      await store.set(key, backup.data, { metadata:sm });
      const map = await readOverrides(store);
      for (const p of Object.keys(map)) if (map[p].id === sm.id) delete map[p];
      if (sm.path) map[sm.path] = { id:sm.id, key, contentType:sm.contentType || "text/html; charset=utf-8", updatedAt:sm.updatedAt, filename:sm.filename, size:sm.size };
      await writeOverrides(store, map);
      await logActivity(store, { action:"이전 버전 복원", title:sm.title, part:sm.part, scene:sm.scene, detail:"깃허브 자료 · " + (sm.filename || "") });
      return Response.json({ ok:true }, { headers:{ "Cache-Control":"no-store" }});
    }
    if (!current) return Response.json({ ok:false, error:"현재 파일을 찾을 수 없습니다." }, { status:404 });

    const currentMeta = merge(current.metadata, flags[key]);
    await createBackup(store, key, currentMeta);
    const restored = backup.metadata.sourceMetadata || {};
    const now = new Date().toISOString();
    const meta = { ...currentMeta, ...restored, updatedAt:now, changedAt:now, changeType:"updated", changeNote:"이전 버전 복원" };
    await store.set(key, backup.data, { metadata:meta });
    await patchFlags(store, key, {
      filename:meta.filename, contentType:meta.contentType, size:meta.size, updatedAt:now,
      changedAt:now, changeType:"updated", changeNote:"이전 버전 복원"
    });
    await logActivity(store, { action:"이전 버전 복원", title:meta.title || meta.filename, part:meta.part, scene:meta.scene, detail:backup.metadata.filename || "" });
    return Response.json({ ok:true }, { headers:{ "Cache-Control":"no-store" }});
  } catch (err) {
    return Response.json({ ok:false, error:`서버 오류: ${err?.message || String(err)}` }, { status:500 });
  }
};
