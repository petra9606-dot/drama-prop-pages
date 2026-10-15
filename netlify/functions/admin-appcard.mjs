// 관리자: 앱·게임 카드 만들기 / 수정 / 웹 화면 파일 / APK 연결 / 숨김 / 삭제 / 순서
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, pushUpdate } from "../lib/flags.mjs";
import { readCards, writeCards, webKey, chunkKey, dropChunks, publicCard } from "../lib/appcards.mjs";
import { readThumbs, thumbKey, THUMBS_KEY } from "../lib/thumbs.mjs";
import { fileFromForm, MAX_FILE } from "../lib/chunks.mjs";
import { injectBytes } from "../lib/inject.mjs";
import { logActivity } from "../lib/activity.mjs";

const T = (v, n = 120) => String(v ?? "").trim().slice(0, n);
const json = (o, status = 200) => Response.json(o, { status, headers: { "Cache-Control": "no-store" } });
const where = (c) => [c.part, c.scene].filter(Boolean).join(" ");

export default async (req) => {
  if (!isAdmin(req)) return json({ ok: false, error: "로그인이 필요합니다." }, 401);
  const store = uploadsStore();
  const url = new URL(req.url);
  try {
    if (req.method === "GET") {
      const [cards, thumbs] = await Promise.all([readCards(store), readThumbs(store)]);
      return json({ ok: true, items: cards.map((c) => publicCard(c, thumbs)) });
    }
    if (req.method !== "POST") return json({ ok: false }, 405);

    // 웹 화면(HTML) 파일 올리기: multipart (작으면 file, 크면 조각)
    if (url.searchParams.get("op") === "web") {
      const id = T(url.searchParams.get("id"), 40);
      const cards = await readCards(store); const c = cards.find((x) => x.id === id);
      if (!c) return json({ ok: false, error: "카드를 찾을 수 없습니다." }, 404);
      const f = await fileFromForm(await req.formData(), store);
      if (!f) return json({ ok: false, error: "파일이 없습니다." }, 400);
      if (f.size > MAX_FILE) return json({ ok: false, error: "웹 화면 파일은 20MB까지 올릴 수 있습니다." }, 413);
      if (!/\.html?$/i.test(f.name)) return json({ ok: false, error: "웹 화면은 HTML 파일만 올릴 수 있습니다." }, 400);
      await store.set(webKey(id), injectBytes(f.data), { metadata: { name: f.name } });
      c.web = { name: f.name, size: f.size, at: new Date().toISOString() }; c.updatedAt = c.web.at;
      await writeCards(store, cards);
      await logActivity(store, { action: "앱·게임 웹 화면", title: c.title, detail: f.name });
      return json({ ok: true, item: publicCard(c, await readThumbs(store)) });
    }

    const b = await req.json().catch(() => ({}));
    const cards = await readCards(store);
    const now = new Date().toISOString();

    if (b.action === "save") {
      let c = b.id ? cards.find((x) => x.id === b.id) : null;
      const isNew = !c;
      if (!c) { c = { id: "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), createdAt: now, visible: true, order: Date.now() }; cards.push(c); }
      c.kind = b.kind === "game" ? "game" : "app";
      c.title = T(b.title, 60) || "새 앱";
      c.tag = T(b.tag, 40); c.desc = T(b.desc, 120); c.footer = T(b.footer, 80);
      c.group = T(b.group, 40);
      const pn = parseInt(b.partNum, 10); c.part = pn >= 1 && pn <= 12 ? `${pn}부` : "";
      const sc = T(b.scene, 20).replace(/씬$/, ""); c.scene = sc ? `${sc}씬` : "";
      c.portrait = !!b.portrait;
      c.updatedAt = now;
      await writeCards(store, cards);
      await logActivity(store, { action: isNew ? "앱·게임 추가" : "앱·게임 수정", title: c.title, part: c.part, scene: c.scene, detail: c.kind === "game" ? "게임" : "촬영용 앱" });
      if (isNew && b.announce !== false) {
        try { await pushUpdate(store, { type: "new", sid: "appcard:" + c.id, project: "pyramid", part: c.part, scene: c.scene, title: `${c.kind === "game" ? "게임" : "촬영용 앱"} · ${c.title}`, note: c.desc, url: "/pyramid/index.html#apps" }); } catch {}
      }
      return json({ ok: true, item: publicCard(c, await readThumbs(store)) });
    }

    const c = cards.find((x) => x.id === b.id);
    if (!c) return json({ ok: false, error: "카드를 찾을 수 없습니다." }, 404);

    if (b.action === "apk") {
      const count = parseInt(b.count, 10) || 0;
      const chunkId = String(b.chunkId || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
      if (!chunkId || count < 1 || count > 100) return json({ ok: false, error: "APK 정보가 올바르지 않습니다." }, 400);
      for (let i = 0; i < count; i++) if (!(await store.getMetadata(chunkKey(chunkId, i)))) return json({ ok: false, error: "APK 조각이 빠졌습니다. 다시 올려 주세요." }, 400);
      const old = c.apk;
      c.apk = { chunkId, count, size: Number(b.size) || 0, name: T(b.name, 120).replace(/[\\/:*?"<>|]/g, "_") || "app.apk", at: now };
      c.updatedAt = now;
      await writeCards(store, cards);
      if (old && old.chunkId !== chunkId) await dropChunks(store, old);
      await logActivity(store, { action: "앱·게임 APK", title: c.title, detail: `${c.apk.name} · ${(c.apk.size / 1048576).toFixed(1)}MB` });
      return json({ ok: true, item: publicCard(c, await readThumbs(store)) });
    }
    if (b.action === "remove-file") {
      if (b.file === "apk" && c.apk) { await dropChunks(store, c.apk); delete c.apk; }
      if (b.file === "web" && c.web) { await store.delete(webKey(c.id)).catch(() => {}); delete c.web; }
      c.updatedAt = now; await writeCards(store, cards);
      return json({ ok: true, item: publicCard(c, await readThumbs(store)) });
    }
    if (b.action === "visible") {
      c.visible = !!b.visible; await writeCards(store, cards);
      await logActivity(store, { action: c.visible ? "사이트에 표시" : "숨김", title: c.title, detail: "앱·게임" });
      return json({ ok: true });
    }
    if (b.action === "move") {
      const same = cards.filter((x) => x.kind === c.kind && (x.group || "") === (c.group || "")).sort((x, y) => (x.order || 0) - (y.order || 0));
      const i = same.indexOf(c), j = i + (b.dir < 0 ? -1 : 1);
      if (j >= 0 && j < same.length) { const t = same[i].order; same[i].order = same[j].order; same[j].order = t; if (same[i].order === same[j].order) same[j].order += b.dir < 0 ? 1 : -1; }
      await writeCards(store, cards);
      return json({ ok: true });
    }
    if (b.action === "delete") {
      await dropChunks(store, c.apk);
      await store.delete(webKey(c.id)).catch(() => {});
      await store.delete(thumbKey("a:" + c.id)).catch(() => {});
      const tm = await readThumbs(store); delete tm["a:" + c.id]; await store.setJSON(THUMBS_KEY, tm);
      await writeCards(store, cards.filter((x) => x !== c));
      await logActivity(store, { action: "앱·게임 삭제", title: c.title, part: c.part, scene: c.scene });
      return json({ ok: true });
    }
    return json({ ok: false, error: "알 수 없는 요청입니다." }, 400);
  } catch (err) {
    return json({ ok: false, error: `서버 오류: ${err?.message || String(err)}` }, 500);
  }
};
