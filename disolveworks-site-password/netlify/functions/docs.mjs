// 공개: 소품 서류 폴더·파일 목록
import { uploadsStore } from "../lib/flags.mjs";
import { readDocs, publicTree } from "../lib/docs.mjs";
import { siteDenied } from "../lib/site-gate.mjs";
export default async (req) => {
  const denied = siteDenied(req); if (denied) return denied; // 사이트 입장 비밀번호
  return Response.json({ ok: true, ...publicTree(await readDocs(uploadsStore())) },
    { headers: { "Cache-Control": "private, max-age=20", "X-Robots-Tag": "noindex" } });
};
