import { uploadsStore } from "../lib/flags.mjs";
import { cleanupExpiredBackups } from "../lib/backups.mjs";

export default async () => {
  const deleted = await cleanupExpiredBackups(uploadsStore());
  return Response.json({ ok:true, deleted });
};

export const config = { schedule:"@daily" };
