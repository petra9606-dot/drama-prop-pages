import { uploadsStore, readStaticHidden } from "../lib/flags.mjs";

// 공개용: 숨김 처리된 깃허브 자료 id 목록
export default async () => {
  try {
    const hidden = await readStaticHidden(uploadsStore());
    return Response.json({ ok:true, hidden }, { headers:{ "Cache-Control":"no-store" }});
  } catch {
    return Response.json({ ok:true, hidden:[] }, { headers:{ "Cache-Control":"no-store" }});
  }
};
