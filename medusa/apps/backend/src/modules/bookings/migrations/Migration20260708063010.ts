import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260708063010 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "booking" drop constraint if exists "booking_idempotency_key_unique";`);
    this.addSql(`alter table if exists "booking" drop constraint if exists "booking_reference_unique";`);
    this.addSql(`alter table if exists "activity" drop constraint if exists "activity_slug_unique";`);
    this.addSql(`create table if not exists "activity" ("id" text not null, "slug" text not null, "title" text not null, "subtitle" text null, "hero_image" text null, "hero_image_alt" text null, "video_url" text null, "description" text null, "details" text null, "note" text null, "rating" real null, "review_count" integer not null default 0, "duration_label" text null, "age_label" text null, "season_start_month" integer null, "season_end_month" integer null, "currency" text not null default 'eur', "status" text check ("status" in ('draft', 'published')) not null default 'draft', "meta_title" text null, "meta_description" text null, "price_tiers" jsonb null, "gallery" jsonb null, "features" jsonb null, "policies" jsonb null, "reviews" jsonb null, "related_slugs" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "activity_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_activity_slug_unique" ON "activity" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_activity_deleted_at" ON "activity" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "availability_slot" ("id" text not null, "date" text not null, "start_time" text not null, "end_time" text null, "capacity" integer not null default 0, "booked_count" integer not null default 0, "status" text check ("status" in ('open', 'closed')) not null default 'open', "activity_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "availability_slot_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_slot_activity_id" ON "availability_slot" ("activity_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_slot_deleted_at" ON "availability_slot" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_slot_activity_date_time" ON "availability_slot" ("activity_id", "date", "start_time") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "booking" ("id" text not null, "reference" text not null, "idempotency_key" text null, "customer_name" text not null, "email" text not null, "phone" text null, "adults" integer not null default 0, "children" integer not null default 0, "infants" integer not null default 0, "total_amount" real not null default 0, "currency" text not null default 'eur', "payment_collection_id" text null, "payment_id" text null, "status" text check ("status" in ('pending', 'confirmed', 'cancelled')) not null default 'pending', "notes" text null, "activity_id" text not null, "slot_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_booking_reference_unique" ON "booking" ("reference") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_booking_idempotency_key_unique" ON "booking" ("idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_activity_id" ON "booking" ("activity_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_slot_id" ON "booking" ("slot_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_deleted_at" ON "booking" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "availability_slot" add constraint "availability_slot_activity_id_foreign" foreign key ("activity_id") references "activity" ("id") on update cascade;`);

    this.addSql(`alter table if exists "booking" add constraint "booking_activity_id_foreign" foreign key ("activity_id") references "activity" ("id") on update cascade;`);
    this.addSql(`alter table if exists "booking" add constraint "booking_slot_id_foreign" foreign key ("slot_id") references "availability_slot" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "availability_slot" drop constraint if exists "availability_slot_activity_id_foreign";`);

    this.addSql(`alter table if exists "booking" drop constraint if exists "booking_activity_id_foreign";`);

    this.addSql(`alter table if exists "booking" drop constraint if exists "booking_slot_id_foreign";`);

    this.addSql(`drop table if exists "activity" cascade;`);

    this.addSql(`drop table if exists "availability_slot" cascade;`);

    this.addSql(`drop table if exists "booking" cascade;`);
  }

}
