import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260714121753 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "workshop" drop constraint if exists "workshop_slug_unique";`);
    this.addSql(`alter table if exists "school_program" drop constraint if exists "school_program_slug_unique";`);
    this.addSql(`create table if not exists "school_program" ("id" text not null, "slug" text not null, "title" text not null, "hero_image" text null, "hero_image_alt" text null, "intro" text null, "closing" text null, "program_note" text null, "tour_title" text null, "tour_intro" text null, "tour_stops" jsonb null, "workshop_intro" text null, "workshop_options" jsonb null, "workshop_note" text null, "play_title" text null, "play_text" text null, "duration_text" text null, "max_students" integer not null default 50, "pricing" jsonb null, "notes" jsonb null, "allergy_title" text null, "allergy_body" jsonb null, "status" text check ("status" in ('draft', 'published')) not null default 'published', "meta_title" text null, "meta_description" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_program_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_school_program_slug_unique" ON "school_program" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_program_deleted_at" ON "school_program" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "workshop" ("id" text not null, "slug" text not null, "title" text not null, "excerpt" text null, "description" text null, "season_label" text null, "months" jsonb null, "image" text null, "gallery" jsonb null, "duration_label" text null, "age_label" text null, "currency" text not null default 'eur', "price_tiers" jsonb null, "features" jsonb null, "rank" integer not null default 0, "status" text check ("status" in ('draft', 'published')) not null default 'draft', "meta_title" text null, "meta_description" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "workshop_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_workshop_slug_unique" ON "workshop" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_workshop_deleted_at" ON "workshop" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "activity" add column if not exists "booking_type" text check ("booking_type" in ('seats', 'enquiry')) not null default 'seats', add column if not exists "benefits" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "school_program" cascade;`);

    this.addSql(`drop table if exists "workshop" cascade;`);

    this.addSql(`alter table if exists "activity" drop column if exists "booking_type", drop column if exists "benefits";`);
  }

}
