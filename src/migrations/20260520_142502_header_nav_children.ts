import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "header_nav_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL,
  	"link_new_tab" boolean DEFAULT false
  );
  
  ALTER TABLE "header_nav_children" ADD CONSTRAINT "header_nav_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_nav_children_order_idx" ON "header_nav_children" USING btree ("_order");
  CREATE INDEX "header_nav_children_parent_id_idx" ON "header_nav_children" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "header_nav_children" CASCADE;`)
}
