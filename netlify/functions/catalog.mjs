
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const project = url.searchParams.get("project") || "";
  const part = url.searchParams.get("part") || "";
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  const store = getStore("disolveworks-uploads");
  const { blobs } = await store.list({ prefix: project ? `${project}/` : undefined });
  const items = [];

  for (const b of blobs) {
    const entry = await store.getMetadata(b.key);
    if (!entry) continue;
    const m = entry.metadata || {};
    if (m.deleted) continue;
    if (m.visible === false) continue;
    if (project && m.project !== project) continue;
    if (part && m.part !== part) continue;

    const hay = [m.projectName,m.part,m.scene,m.title,m.filename].join(" ").toLowerCase();
    if (q && !hay.includes(q)) continue;

    items.push({
      key:b.key, project:m.project, projectName:m.projectName, part:m.part,
      partNum:m.partNum, scene:m.scene, sceneRaw:m.sceneRaw,
      title:m.title, filename:m.filename, contentType:m.contentType,
      size:m.size, uploadedAt:m.uploadedAt, updatedAt:m.updatedAt,
      pinned:!!m.pinned,
      url:`/.netlify/functions/file?key=${encodeURIComponent(b.key)}`
    });
  }

  items.sort((a,b) =>
    (Number(!!b.pinned)-Number(!!a.pinned)) ||
    (Number(a.partNum)-Number(b.partNum)) ||
    String(a.scene).localeCompare(String(b.scene),"ko") ||
    String(a.title).localeCompare(String(b.title),"ko")
  );

  return Response.json({ ok:true, items }, { headers:{ "Cache-Control":"no-store" }});
};
