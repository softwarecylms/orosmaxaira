import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260915123547 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "invoice_settings" drop constraint if exists "invoice_settings_key_unique";`);
    this.addSql(`alter table if exists "invoice" drop constraint if exists "invoice_number_unique";`);
    this.addSql(`alter table if exists "invoice" drop constraint if exists "invoice_order_id_unique";`);
    this.addSql(`create table if not exists "invoice" ("id" text not null, "order_id" text not null, "order_display_id" integer null, "number" integer not null, "code" text not null, "issued_at" timestamptz not null, "data" jsonb not null, "sent_at" timestamptz null, "sent_to" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "invoice_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_invoice_order_id_unique" ON "invoice" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_invoice_number_unique" ON "invoice" ("number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_invoice_deleted_at" ON "invoice" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "invoice_settings" ("id" text not null, "key" text not null, "next_number" integer not null, "config" jsonb not null, "logo" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "invoice_settings_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_invoice_settings_key_unique" ON "invoice_settings" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_invoice_settings_deleted_at" ON "invoice_settings" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "invoice" cascade;`);

    this.addSql(`drop table if exists "invoice_settings" cascade;`);
  }

}
