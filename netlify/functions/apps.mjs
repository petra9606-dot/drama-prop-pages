// 공개: 관리자에서 올린 앱·게임 카드 목록 (숨긴 것 제외)
import { uploadsStore } from "../lib/flags.mjs";
import { readCards, publicCard } from "../lib/appcards.mjs";
import { readThumbs } from "../lib/thumbs.mjs";
import { siteDenied } from "../lib/site-gate.mjs";

export default async (req) => {
  const denied = siteDenied(req); if (denied) return denied; // 사이트 입장 비밀번호
  const store = uploadsStore();
  const [cards, thumbs] = await Promise.all([readCards(store), readThumbs(store)]);
  const items = cards.filter((c) => c.visible !== false).map((c) => publicCard(c, thumbs)).sort((a, b) => (a.order || 0) - (b.order || 0));
  return Response.json({ ok: true, items }, { headers: { "Cache-Control": "private, max-age=30", "X-Robots-Tag": "noindex" } });
};
