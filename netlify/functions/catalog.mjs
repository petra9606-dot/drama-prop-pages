
import { uploadsStore, readFlags, merge, isInternalKey } from "../lib/flags.mjs";
import { siteDenied } from "../lib/site-gate.mjs";

export default async (req) => {
  const denied = siteDenied(req); if (denied) return denied; // 사이트 입장 비밀번호
  const url = new URL(req.url);
  const project = url.searchParams.get("project") || "";
  const part = url.searchParams.get("part") || "";
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  const store = uploadsStore();
  const [{ blobs }, flags] = await Promise.all([
    store.list({ prefix: project ? `${project}/` : undefined }),
    readFlags(store)
  ]);
  const items = [];

  for (const b of blobs) {
    if (isInternalKey(b.key)) continue;
    const entry = await store.getMetadata(b.key);
    if (!entry) continue;
    const m = merge(entry.metadata, flags[b.key]);
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
      changedAt:m.changedAt || null, changeType:m.changeType || null, changeNote:m.changeNote || "",
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
