import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, readUpdates, writeUpdates, pushUpdate, cleanNote } from "../lib/flags.mjs";

// 관리자: 업데이트 공지를 직접 쓰거나(깃허브로 올린 자료 등) 지운다
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!isAdmin(req)) return Response.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const store = uploadsStore();
  try {
    if (body.action === "delete") {
      const list = (await readUpdates(store)).filter((x) => x.id !== body.id);
      await writeUpdates(store, list);
      return Response.json({ ok: true, items: list }, { headers: { "Cache-Control": "no-store" } });
    }
    if (body.action === "list") {
      return Response.json({ ok: true, items: await readUpdates(store) }, { headers: { "Cache-Control": "no-store" } });
    }
    const title = cleanNote(body.title, 100);
    const note = cleanNote(body.note);
    if (!title && !note) return Response.json({ ok: false, error: "제목이나 내용을 입력해 주세요." }, { status: 400 });
    const type = ["new", "updated", "notice"].includes(body.type) ? body.type : "notice";
    const partNum = parseInt(body.partNum, 10);
    const sceneRaw = cleanNote(body.scene, 20).replace(/씬$/, "");
    const item = await pushUpdate(store, {
      type, title, note,
      sid: body.sid ? String(body.sid).slice(0, 80) : undefined,
      part: partNum >= 1 && partNum <= 12 ? `${partNum}부` : "",
      scene: sceneRaw ? `${sceneRaw}씬` : "",
      url: body.url ? String(body.url).slice(0, 400) : ""
    });
    return Response.json({ ok: true, item }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json({ ok: false, error: `서버 오류: ${err && err.message ? err.message : String(err)}` }, { status: 500 });
  }
};
