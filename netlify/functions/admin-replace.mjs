
import { getStore } from "@netlify/blobs";
import { isAdmin } from "../lib/auth.mjs";

const MAX = 4 * 1024 * 1024;
const ALLOWED = new Set(["html","htm","png","jpg","jpeg","webp","gif","pdf","pptx","xlsx","docx","txt","zip"]);

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"ë¡œê·¸?¸ì´ ?„ìš”?©ë‹ˆ??" }, { status:401 });

  const form = await req.formData();
  const key = String(form.get("key") || "");
  const file = form.get("file");
  if (!key || !(file instanceof File)) return Response.json({ ok:false, error:"?Œì¼ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤." }, { status:400 });
  if (file.size > MAX) return Response.json({ ok:false, error:"?Œì¼??4MBê¹Œì? ì§€?í•©?ˆë‹¤." }, { status:413 });

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED.has(ext)) return Response.json({ ok:false, error:`ì§€?í•˜ì§€ ?ŠëŠ” ?•ì¥?ì…?ˆë‹¤: .${ext}` }, { status:400 });

  const store = getStore("disolveworks-uploads");
  const entry = await store.getMetadata(key);
  if (!entry) return Response.json({ ok:false, error:"êµì²´???Œì¼??ì°¾ì„ ???†ìŠµ?ˆë‹¤." }, { status:404 });

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
