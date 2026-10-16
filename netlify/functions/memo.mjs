// 소품별 메모 — 촬영팀이 소품 카드마다 메모를 남기고 완료 체크를 할 수 있다.
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
import { isAdmin } from "../lib/auth.mjs";
import { siteDenied } from "../lib/site-gate.mjs";

const INDEX_KEY = "__index.json";
const store = () => getStore({ name: "disolveworks-memos", consistency: "strong" });
const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const keyOf = (id) => "m/" + sha(id).slice(0, 40);
const json = (o, status = 200) => Response.json(o, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });

const validId = (id) => typeof id === "string" && id.startsWith("/") && id.length <= 600;
const clean = (s, n) => String(s ?? "").replace(/\r\n?/g, "\n").trim().slice(0, n);

async function readDoc(s, id) {
  try { const d = await s.get(keyOf(id), { type: "json" }); if (d && Array.isArray(d.memos)) return d; } catch {}
  return { id, title: "", memos: [] };
}
async function readIndex(s) {
  try { const v = await s.get(INDEX_KEY, { type: "json" }); return v && typeof v === "object" ? v : {}; } catch { return {}; }
}
const publicMemos = (doc, tok) => doc.memos.map(({ tokHash, ...m }) => ({ ...m, mine: !!tok && tokHash === sha(tok) }));

async function save(s, doc) {
  await s.setJSON(keyOf(doc.id), doc);
  const idx = await readIndex(s);
  if (doc.memos.length) {
    idx[doc.id] = {
      n: doc.memos.length,
      open: doc.memos.filter((m) => !m.done).length,
      last: doc.memos.reduce((a, m) => (m.at > a ? m.at : a), "")
    };
  } else delete idx[doc.id];
  await s.setJSON(INDEX_KEY, idx);
}

export default async (req) => {
  const denied = siteDenied(req); if (denied) return denied; // 사이트 입장 비밀번호
  const s = store();
  const url = new URL(req.url);

  if (req.method === "GET") {
    if (url.searchParams.get("counts")) return json({ ok: true, counts: await readIndex(s) });
    if (url.searchParams.get("all")) {
      // 관리자: 모든 소품의 메모를 한 번에
      if (!isAdmin(req)) return json({ ok: false, error: "로그인이 필요합니다." }, 401);
      const { blobs } = await s.list({ prefix: "m/" });
      const docs = (await Promise.all(blobs.map((b) => s.get(b.key, { type: "json" }).catch(() => null))))
        .filter((d) => d && Array.isArray(d.memos) && d.memos.length)
        .map((d) => ({ id: d.id, title: d.title, memos: publicMemos(d, url.searchParams.get("tok")) }));
      return json({ ok: true, docs });
    }
    const id = url.searchParams.get("id");
    if (!validId(id)) return json({ ok: false, error: "bad id" }, 400);
    const doc = await readDoc(s, id);
    return json({ ok: true, memos: publicMemos(doc, url.searchParams.get("tok")) });
  }

  if (req.method !== "POST") return json({ ok: false }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, error: "bad body" }, 400); }
  if (!validId(b.id)) return json({ ok: false, error: "bad id" }, 400);
  const doc = await readDoc(s, b.id);
  const tok = typeof b.tok === "string" ? b.tok.slice(0, 80) : "";

  if (b.action === "add") {
    const text = clean(b.text, 1000);
    if (!text) return json({ ok: false, error: "empty" }, 400);
    if (doc.memos.length >= 300) return json({ ok: false, error: "full" }, 400);
    doc.title = clean(b.title, 120) || doc.title;
    doc.memos.push({
      mid: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: clean(b.name, 20) || "익명",
      text, at: new Date().toISOString(), done: false,
      tokHash: tok ? sha(tok) : ""
    });
  } else if (b.action === "done") {
    const m = doc.memos.find((x) => x.mid === b.mid);
    if (!m) return json({ ok: false, error: "not found" }, 404);
    m.done = !!b.done;
  } else if (b.action === "del") {
    const i = doc.memos.findIndex((x) => x.mid === b.mid);
    if (i < 0) return json({ ok: false, error: "not found" }, 404);
    if (!isAdmin(req) && (!tok || doc.memos[i].tokHash !== sha(tok))) return json({ ok: false, error: "본인이 쓴 메모만 지울 수 있습니다." }, 403);
    doc.memos.splice(i, 1);
  } else return json({ ok: false, error: "bad action" }, 400);

  await save(s, doc);
  return json({ ok: true, memos: publicMemos(doc, tok) });
};
