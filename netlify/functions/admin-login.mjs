
import { passwordOK, makeCookie } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!process.env.DISOLVE_ADMIN_PASSWORD) {
    return Response.json({ ok:false, error:"DISOLVE_ADMIN_PASSWORD 환경변수가 설정되지 않았습니다." }, { status:500 });
  }
  const body = await req.json().catch(() => ({}));
  if (!passwordOK(body.password)) {
    return Response.json({ ok:false, error:"비밀번호가 올바르지 않습니다." }, { status:401 });
  }
  return Response.json({ ok:true }, {
    headers: { "Set-Cookie": makeCookie(), "Cache-Control":"no-store" }
  });
};
