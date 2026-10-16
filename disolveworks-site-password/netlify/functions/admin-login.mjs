import { passwordOK, makeCookie } from "../lib/auth.mjs";
import { makeSiteCookie } from "../lib/site-gate.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!process.env.DISOLVE_ADMIN_PASSWORD) {
    return Response.json({ ok:false, error:"DISOLVE_ADMIN_PASSWORD 환경변수가 설정되지 않았습니다." }, { status:500 });
  }
  const body = await req.json().catch(() => ({}));
  if (!passwordOK(body.password)) {
    return Response.json({ ok:false, error:"비밀번호가 올바르지 않습니다." }, { status:401 });
  }
  const headers = new Headers({ "Cache-Control":"no-store" });
  headers.append("Set-Cookie", makeCookie());
  const site = makeSiteCookie(); // 관리자는 사이트 입장 비밀번호를 따로 넣지 않아도 되게
  if (site) headers.append("Set-Cookie", site);
  return Response.json({ ok:true }, { headers });
};
