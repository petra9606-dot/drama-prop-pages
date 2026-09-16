
import { getStore } from "@netlify/blobs";
import { isAdmin } from "../lib/auth.mjs";

const MAX = 4 * 1024 * 1024;
const ALLOWED = new Set(["html","htm","png","jpg","jpeg","webp","gif","pdf","pptx","xlsx","docx","txt","zip"]);

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });

  const form = await req.formData();
  const key = String(form.get("key") || "");
  const file = form.get("file");
  if (!key || !(file instanceof File)) return Response.json({ ok:false, error:"파일 정보가 없습니다." }, { status:400 });
  if (file.size > MAX) return Response.json({ ok:false, error:"파일당 4MB까지 지원합니다." }, { status:413 });

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED.has(ext)) return Response.json({ ok:false, error:`지원하지 않는 확장자입니다: .${ext}` }, { status:400 });

  const store = getStore("disolveworks-uploads");
  const entry = await store.getMetadata(key);
  if (!entry) return Response.json({ ok:false, error:"교체할 파일을 찾을 수 없습니다." }, { status:404 });

  const meta = {
    ...(entry.metadata || {}),
    filename:file.name,
    contentType:file.type || "application/octet-stream",
    size:file.size,
    updatedAt:new Date().toISOString()
  };
  await store.set(key, file, { metadata:meta });
  return Response.json({ ok:true }, { headers:{ "Cache-Control":"no-store" }});
};
