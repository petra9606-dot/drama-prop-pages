// 관리자: 작업 기록 + 깃허브 자료 교체 현황
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore } from "../lib/flags.mjs";
import { readActivity } from "../lib/activity.mjs";
import { readOverrides } from "../lib/overrides.mjs";

export default async (req) => {
  if (!isAdmin(req)) return Response.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  const store = uploadsStore();
  const [items, overrides] = await Promise.all([readActivity(store), readOverrides(store)]);
  return Response.json({ ok: true, items, overrides }, { headers: { "Cache-Control": "no-store" } });
};
