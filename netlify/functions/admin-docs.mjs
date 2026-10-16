// 관리자: 소품 서류 — 폴더 만들기/이름/숨김/삭제, 파일 올리기/미리보기 PDF 붙이기/이동/삭제
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore } from "../lib/flags.mjs";
import { readDocs, writeDocs, docKey, newId, parsePartScene, publicTree } from "../lib/docs.mjs";
import { fileFromForm, MAX_FILE } from "../lib/chunks.mjs";
import { logActivity } from "../lib/activity.mjs";

const T = (v, n = 120) => String(v ?? "").trim().slice(0, n);
const json = (o, status = 200) => Response.json(o, { status, headers: { "Cache-Control": "no-store" } });
const TYPES = { pdf: "application/pdf", hwp: "application/x-hwp", hwpx: "application/hwp+zip", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", doc: "application/msword", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xls: "application/vnd.ms-excel", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", txt: "text/plain; charset=utf-8", zip: "application/zip" };
const typeOf = (name, given) => TYPES[(name.split(".").pop() || "").toLowerCase()] || given || "application/octet-stream";

// 같은 이름의 폴더가 이미 있으면 그걸 쓰고, 없으면 만든다
function ensureFolder(d, name, parent) {
  name = T(name, 100); parent = parent || "";
  let f = d.folders.find((x) => x.name === name && (x.parent || "") === parent);
  if (!f) {
    const ps = parsePartScene(name);
    f = { id: newId("f"), name, parent, order: Date.now() + d.folders.length, part: ps.part, scene: ps.scene, visible: true, at: new Date().toISOString() };
    d.folders.push(f);
  }
  return f;
}
function descendants(d, id) {
  const out = new Set([id]); let grew = true;
  while (grew) { grew = false; for (const f of d.folders) if (out.has(f.parent) && !out.has(f.id)) { out.add(f.id); grew = true; } }
  return out;
}

export default async (req) => {
  if (!isAdmin(req)) return json({ ok: false, error: "로그인이 필요합니다." }, 401);
  const store = uploadsStore();
  const url = new URL(req.url);
  try {
    if (req.method === "GET") return json({ ok: true, ...publicTree(await readDocs(store), true) });
    if (req.method !== "POST") return json({ ok: false }, 405);

    const op = url.searchParams.get("op");
    if (op === "upload" || op === "preview" || op === "thumb") {
      const form = await req.formData();
      const f = await fileFromForm(form, store);
      if (!f) return json({ ok: false, error: "파일이 없습니다." }, 400);
      if (f.size > MAX_FILE) return json({ ok: false, error: "파일당 20MB까지 올릴 수 있습니다." }, 413);
      const d = await readDocs(store);
      const now = new Date().toISOString();
      if (op === "thumb") {
        const file = d.files.find((x) => x.id === url.searchParams.get("id"));
        if (!file) return json({ ok: false, error: "파일을 찾을 수 없습니다." }, 404);
        if (f.size > 600 * 1024) return json({ ok: false, error: "미리보기 사진이 너무 큽니다." }, 413);
        await store.set(docKey(file.id, "thumb"), f.data);
        file.thumb = { at: now };
        await writeDocs(store, d);
        return json({ ok: true, id: file.id });
      }
      if (op === "preview") {
        const file = d.files.find((x) => x.id === url.searchParams.get("id"));
        if (!file) return json({ ok: false, error: "파일을 찾을 수 없습니다." }, 404);
        await store.set(docKey(file.id, "preview"), f.data);
        file.preview = { type: typeOf(f.name, f.type), size: f.size, name: f.name, at: now };
        delete file.thumb;
        await writeDocs(store, d);
        return json({ ok: true, id: file.id });
      }
      // 폴더 경로("1부 5씬 …/1. 피해자 김정현")를 받아 없으면 만든다
      let parent = T(url.searchParams.get("folder"), 40);
      const path = T(form.get("path"), 400).split("/").map((s) => s.trim()).filter(Boolean);
      for (const seg of path) parent = ensureFolder(d, seg, parent).id;
      const name = T(form.get("name") || f.name, 160);
      // 같은 폴더에 같은 이름이 있으면 교체
      let file = d.files.find((x) => x.folder === parent && x.name === name);
      const isNew = !file;
      if (!file) { file = { id: newId("d"), folder: parent, name, order: Date.now() + d.files.length, visible: true }; d.files.push(file); }
      await store.set(docKey(file.id), f.data);
      Object.assign(file, { size: f.size, type: typeOf(name, f.type), at: now });
      if (!file.preview) delete file.thumb;
      await writeDocs(store, d);
      await logActivity(store, { action: isNew ? "서류 올림" : "서류 교체", title: name, detail: path.join(" / ") || (d.folders.find((x) => x.id === parent)?.name || "") });
      return json({ ok: true, id: file.id, folder: parent, replaced: !isNew });
    }

    const b = await req.json().catch(() => ({}));
    const d = await readDocs(store);
    const now = new Date().toISOString();
    if (b.action === "folder-create") {
      const f = ensureFolder(d, b.name || "새 폴더", T(b.parent, 40));
      await writeDocs(store, d);
      await logActivity(store, { action: "서류 폴더 만듦", title: f.name });
      return json({ ok: true, id: f.id });
    }
    if (b.action === "folder-update") {
      const f = d.folders.find((x) => x.id === b.id); if (!f) return json({ ok: false, error: "폴더를 찾을 수 없습니다." }, 404);
      if (b.name !== undefined) { f.name = T(b.name, 100) || f.name; const ps = parsePartScene(f.name); f.part = ps.part; f.scene = ps.scene; }
      if (b.visible !== undefined) f.visible = !!b.visible;
      if (b.parent !== undefined && b.parent !== f.id && !descendants(d, f.id).has(b.parent)) f.parent = T(b.parent, 40);
      await writeDocs(store, d);
      return json({ ok: true });
    }
    if (b.action === "folder-delete") {
      const ids = descendants(d, b.id);
      const gone = d.files.filter((x) => ids.has(x.folder));
      for (const x of gone) for (const k of ["orig", "preview", "thumb"]) await store.delete(docKey(x.id, k)).catch(() => {});
      const name = d.folders.find((x) => x.id === b.id)?.name || "";
      d.files = d.files.filter((x) => !ids.has(x.folder)); d.folders = d.folders.filter((x) => !ids.has(x.id));
      await writeDocs(store, d);
      await logActivity(store, { action: "서류 폴더 삭제", title: name, detail: `파일 ${gone.length}개` });
      return json({ ok: true });
    }
    if (b.action === "file-update") {
      const f = d.files.find((x) => x.id === b.id); if (!f) return json({ ok: false, error: "파일을 찾을 수 없습니다." }, 404);
      if (b.name !== undefined) f.name = T(b.name, 160) || f.name;
      if (b.visible !== undefined) f.visible = !!b.visible;
      if (b.folder !== undefined) f.folder = T(b.folder, 40);
      await writeDocs(store, d);
      return json({ ok: true });
    }
    if (b.action === "file-delete" || b.action === "preview-delete") {
      const f = d.files.find((x) => x.id === b.id); if (!f) return json({ ok: false, error: "파일을 찾을 수 없습니다." }, 404);
      await store.delete(docKey(f.id, "preview")).catch(() => {});
      await store.delete(docKey(f.id, "thumb")).catch(() => {});
      if (b.action === "preview-delete") { delete f.preview; delete f.thumb; await writeDocs(store, d); return json({ ok: true }); }
      await store.delete(docKey(f.id)).catch(() => {});
      d.files = d.files.filter((x) => x !== f);
      await writeDocs(store, d);
      await logActivity(store, { action: "서류 삭제", title: f.name });
      return json({ ok: true });
    }
    if (b.action === "move") {
      const list = b.kind === "folder" ? d.folders : d.files;
      const it = list.find((x) => x.id === b.id); if (!it) return json({ ok: false }, 404);
      const sib = list.filter((x) => (b.kind === "folder" ? (x.parent || "") === (it.parent || "") : x.folder === it.folder)).sort((x, y) => (x.order || 0) - (y.order || 0));
      const i = sib.indexOf(it), j = i + (b.dir < 0 ? -1 : 1);
      if (j >= 0 && j < sib.length) { const t = sib[i].order; sib[i].order = sib[j].order; sib[j].order = t; if (sib[i].order === sib[j].order) sib[j].order += b.dir < 0 ? 1 : -1; }
      await writeDocs(store, d);
      return json({ ok: true });
    }
    return json({ ok: false, error: "알 수 없는 요청입니다." }, 400);
  } catch (err) {
    return json({ ok: false, error: `서버 오류: ${err?.message || String(err)}` }, 500);
  }
};
