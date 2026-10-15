// 공개: 소품 서류 폴더·파일 목록
import { uploadsStore } from "../lib/flags.mjs";
import { readDocs, publicTree } from "../lib/docs.mjs";
export default async () => Response.json({ ok: true, ...publicTree(await readDocs(uploadsStore())) },
  { headers: { "Cache-Control": "public, max-age=20", "X-Robots-Tag": "noindex" } });
