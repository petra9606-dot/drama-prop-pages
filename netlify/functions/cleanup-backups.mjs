import { uploadsStore } from "../lib/flags.mjs";
import { cleanupExpiredBackups } from "../lib/backups.mjs";
import { cleanupChunks } from "../lib/chunks.mjs";

export default async () => {
  const deleted = await cleanupExpiredBackups(uploadsStore());
  await cleanupChunks(uploadsStore()).catch(() => {});
  return Response.json({ ok:true, deleted });
};

export const config = { schedule:"@daily" };
