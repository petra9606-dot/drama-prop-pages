
import { getStore } from "@netlify/blobs";
import { isAdmin } from "./_auth.mjs";

const MAX = 4 * 1024 * 1024;
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
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ ok:false, error:"파일을 선택해 주세요." }, { status:400 });
  if (file.size > MAX) return Response.json({ ok:false, error:"현재 웹 업로드는 파일당 4MB까지 지원합니다." }, { status:413 });

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

  const id = crypto.randomUUID();
  const key = `${project}/part${partNum}/scene-${sceneRaw}/${Date.now()}-${id}-${filename}`;
  const now = new Date().toISOString();
  const store = getStore("disolveworks-uploads");

  await store.set(key, file, {
    metadata: {
      id, project, projectName, part:`${partNum}부`, partNum, scene, sceneRaw,
      title, filename:file.name, contentType:file.type || "application/octet-stream",
      size:file.size, uploadedAt:now, updatedAt:now, visible, pinned,
      deleted:false, deletedAt:null
    }
  });

  return Response.json({ ok:true, key, url:`/.netlify/functions/file?key=${encodeURIComponent(key)}` },
    { headers:{ "Cache-Control":"no-store" }});
};
