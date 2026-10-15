
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, patchFlags, readFlags, merge, pushUpdate, cleanNote } from "../lib/flags.mjs";
import { createBackup, cleanupExpiredBackups } from "../lib/backups.mjs";
import { fileFromForm, MAX_FILE } from "../lib/chunks.mjs";
import { logActivity } from "../lib/activity.mjs";

const ALLOWED = new Set(["html","htm","png","jpg","jpeg","webp","gif","pdf","pptx","xlsx","docx","txt","zip"]);

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });

  const form = await req.formData();
  const key = String(form.get("key") || "");
  const note = cleanNote(form.get("note"));
  const announce = String(form.get("announce")) !== "false";
  let file;
  try { file = await fileFromForm(form, uploadsStore()); } catch (e) { return Response.json({ ok:false, error:e.message }, { status:400 }); }
  if (!key || !file) return Response.json({ ok:false, error:"파일 정보가 없습니다." }, { status:400 });
  if (file.size > MAX_FILE) return Response.json({ ok:false, error:"파일당 20MB까지 올릴 수 있습니다." }, { status:413 });

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED.has(ext)) return Response.json({ ok:false, error:`지원하지 않는 확장자입니다: .${ext}` }, { status:400 });

  try {
    const store = uploadsStore();
    const entry = await store.getMetadata(key);
    if (!entry) return Response.json({ ok:false, error:"교체할 파일을 찾을 수 없습니다." }, { status:404 });

    const flags = await readFlags(store);
    const currentMeta = merge(entry.metadata, flags[key]);
    await createBackup(store, key, currentMeta);
    const meta = {
      ...currentMeta,
      filename:file.name,
      contentType:file.type,
      size:file.size,
      updatedAt:new Date().toISOString()
    };
    if (announce) { meta.changedAt = meta.updatedAt; meta.changeType = "updated"; meta.changeNote = note; }
    await store.set(key, file.data, { metadata:meta });
    cleanupExpiredBackups(store).catch(()=>{});
    await patchFlags(store, key, {
      filename:meta.filename, contentType:meta.contentType, size:meta.size, updatedAt:meta.updatedAt,
      ...(announce ? { changedAt:meta.changedAt, changeType:"updated", changeNote:note } : {})
    });
    if (announce && meta.visible !== false && !meta.deleted) {
      try { await pushUpdate(store, { type:"updated", key, project:meta.project, part:meta.part, scene:meta.scene, title:meta.title || meta.filename, note, url:`/.netlify/functions/file?key=${encodeURIComponent(key)}` }); } catch {}
    }
    await logActivity(store, { action:"파일 교체", title:meta.title || meta.filename, part:meta.part, scene:meta.scene, detail:`${file.name}${note ? " · " + note : ""}`, url:`/.netlify/functions/file?key=${encodeURIComponent(key)}` });
    return Response.json({ ok:true }, { headers:{ "Cache-Control":"no-store" }});
  } catch (err) {
    return Response.json({ ok:false, error:`서버 오류: ${err && err.message ? err.message : String(err)}` }, { status:500 });
  }
};
