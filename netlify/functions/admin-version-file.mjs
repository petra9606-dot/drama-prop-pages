import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore } from "../lib/flags.mjs";
import { getBackup } from "../lib/backups.mjs";

export default async (req) => {
  if (!isAdmin(req)) return new Response("로그인이 필요합니다.", { status:401 });
  const url = new URL(req.url);
  const backup = await getBackup(uploadsStore(), url.searchParams.get("id") || "", url.searchParams.get("key") || "");
  if (!backup) return new Response("백업이 없거나 보관 기간이 지났습니다.", { status:404 });
  const m = backup.metadata;
  const type = m.contentType || "application/octet-stream";
  const inline = type.startsWith("text/html") || type.startsWith("image/") || type === "application/pdf";
  const body = backup.data.byteLength > 5 * 1024 * 1024 ? new Response(backup.data).body : backup.data;
  return new Response(body, { headers:{
    "Content-Type":type,
    "Content-Disposition":`${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(m.filename || "backup")}`,
    "Cache-Control":"no-store",
    "X-Robots-Tag":"noindex, nofollow, noarchive"
  }});
};
