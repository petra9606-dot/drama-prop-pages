
import { uploadsStore, pushUpdate, cleanNote } from "../lib/flags.mjs";
import { isAdmin } from "../lib/auth.mjs";
import { fileFromForm, MAX_FILE } from "../lib/chunks.mjs";
import { logActivity } from "../lib/activity.mjs";

const ALLOWED = new Set(["html","htm","png","jpg","jpeg","webp","gif","pdf","pptx","xlsx","docx","txt","zip"]);

function cleanName(name) {
  return String(name || "file")
    .replace(/[^\p{L}\p{N}._ -]+/gu, "_")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}
function cleanText(v, max=120) { return String(v || "").trim().slice(0,max); }

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });

  const form = await req.formData();
  const store = uploadsStore();
  let file;
  try { file = await fileFromForm(form, store); } catch (e) { return Response.json({ ok:false, error:e.message }, { status:400 }); }
  if (!file) return Response.json({ ok:false, error:"파일을 선택해 주세요." }, { status:400 });
  if (file.size > MAX_FILE) return Response.json({ ok:false, error:"파일당 20MB까지 올릴 수 있습니다." }, { status:413 });

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED.has(ext)) return Response.json({ ok:false, error:`지원하지 않는 확장자입니다: .${ext}` }, { status:400 });

  const project = cleanText(form.get("project"), 40) || "pyramid";
  const projectName = cleanText(form.get("projectName"), 60) || "피라밋";
  const partNum = Math.max(1, Math.min(12, parseInt(form.get("part"),10) || 1));
  const sceneRaw = cleanText(form.get("scene"), 20).replace(/[^0-9A-Za-z가-힣._-]/g,"");
  if (!sceneRaw) return Response.json({ ok:false, error:"씬 번호를 입력해 주세요." }, { status:400 });
  const scene = /씬$/.test(sceneRaw) ? sceneRaw : `${sceneRaw}씬`;
  const title = cleanText(form.get("title"), 100) || file.name.replace(/\.[^.]+$/,"");
  const visible = String(form.get("visible")) !== "false";
  const pinned = String(form.get("pinned")) === "true";
  const filename = cleanName(file.name);
  const note = cleanNote(form.get("note"));
  const announce = String(form.get("announce")) !== "false";

  const id = crypto.randomUUID();
  const key = `${project}/part${partNum}/scene-${sceneRaw}/${Date.now()}-${id}-${filename}`;
  const now = new Date().toISOString();

  await store.set(key, file.data, {
    metadata: {
      id, project, projectName, part:`${partNum}부`, partNum, scene, sceneRaw,
      title, filename:file.name, contentType:file.type,
      size:file.size, uploadedAt:now, updatedAt:now, visible, pinned,
      changedAt: announce ? now : null, changeType: announce ? "new" : null, changeNote: note,
      deleted:false, deletedAt:null
    }
  });

  if (announce && visible) {
    try { await pushUpdate(store, { type:"new", key, project, part:`${partNum}부`, scene, title, note, url:`/.netlify/functions/file?key=${encodeURIComponent(key)}` }); } catch {}
  }

  await logActivity(store, { action:"업로드", title, part:`${partNum}부`, scene, detail:file.name, url:`/.netlify/functions/file?key=${encodeURIComponent(key)}` });

  return Response.json({ ok:true, key, url:`/.netlify/functions/file?key=${encodeURIComponent(key)}` },
    { headers:{ "Cache-Control":"no-store" }});
};
