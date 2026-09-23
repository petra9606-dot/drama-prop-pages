
import { uploadsStore, readFlags, merge } from "../lib/flags.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  if (!key) return new Response("Missing key", { status:400 });

  const store = uploadsStore();
  const metaEntry = await store.getMetadata(key);
  if (!metaEntry) return new Response("Not found", { status:404 });
  const flags = await readFlags(store);
  const m = merge(metaEntry.metadata, flags[key]);
  if (m.deleted) return new Response("This file is in trash.", { status:410 });

  const data = await store.get(key, { type:"arrayBuffer" });
  if (data === null) return new Response("Not found", { status:404 });

  const type = m.contentType || "application/octet-stream";
  const inline = type.startsWith("text/html") || type.startsWith("image/") || type === "application/pdf";
  const filename = String(m.filename || "file").replace(/[\r\n"]/g,"_");

  return new Response(data, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control":"no-store",
      "X-Content-Type-Options":"nosniff"
    }
  });
};
