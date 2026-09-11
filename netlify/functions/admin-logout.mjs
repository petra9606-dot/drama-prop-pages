
import { clearCookie } from "../lib/auth.mjs";
export default async () => Response.json({ ok:true }, {
  headers: { "Set-Cookie": clearCookie(), "Cache-Control":"no-store" }
});
