import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN IF EXISTS "legacy_cover";
  ALTER TABLE "posts_locales" DROP COLUMN IF EXISTS "legacy_content";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_legacy_cover";
  ALTER TABLE "_posts_v_locales" DROP COLUMN IF EXISTS "version_legacy_content";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "legacy_cover" varchar;
  ALTER TABLE "posts_locales" ADD COLUMN IF NOT EXISTS "legacy_content" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_legacy_cover" varchar;
  ALTER TABLE "_posts_v_locales" ADD COLUMN IF NOT EXISTS "version_legacy_content" varchar;`)
}
