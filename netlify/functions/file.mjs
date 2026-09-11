
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  if (!key) return new Response("Missing key", { status:400 });

  const store = getStore("disolveworks-uploads");
  const metaEntry = await store.getMetadata(key);
  if (!metaEntry) return new Response("Not found", { status:404 });
  const data = await store.get(key, { type:"arrayBuffer" });
  if (data === null) return new Response("Not found", { status:404 });

  const m = metaEntry.metadata || {};
  const type = m.contentType || "application/octet-stream";
  const inline = type.startsWith("text/html") || type.startsWith("image/") || type === "application/pdf";
  const filename = String(m.filename || "file").replace(/[\r\n"]/g,"_");

  return new Response(data, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "public, max-age=60",
      "X-Content-Type-Options": "nosniff"
    }
  });
};
