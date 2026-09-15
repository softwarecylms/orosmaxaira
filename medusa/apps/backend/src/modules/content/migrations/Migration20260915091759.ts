import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260915091759 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "content_entry" drop constraint if exists "content_entry_key_unique";`);
    this.addSql(`alter table if exists "blog_post" drop constraint if exists "blog_post_slug_unique";`);
    this.addSql(`alter table if exists "blog_category" drop constraint if exists "blog_category_slug_unique";`);
    this.addSql(`create table if not exists "blog_category" ("id" text not null, "slug" text not null, "name" text not null, "rank" integer not null default 0, "translations" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blog_category_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blog_category_slug_unique" ON "blog_category" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_category_deleted_at" ON "blog_category" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "blog_post" ("id" text not null, "slug" text not null, "status" text check ("status" in ('draft', 'published')) not null default 'draft', "published_at" text null, "title" text not null, "excerpt" text null, "cover_image" text null, "cover_alt" text null, "body" text null, "body_format" text check ("body_format" in ('html', 'markdown')) not null default 'markdown', "read_minutes" integer null, "categories" jsonb null, "seo_title" text null, "meta_description" text null, "canonical_slug" text null, "translations" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blog_post_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blog_post_slug_unique" ON "blog_post" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_deleted_at" ON "blog_post" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "content_entry" ("id" text not null, "key" text not null, "data" jsonb null, "translations" jsonb null, "draft_data" jsonb null, "draft_translations" jsonb null, "updated_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "content_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_content_entry_key_unique" ON "content_entry" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_entry_deleted_at" ON "content_entry" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "content_revision" ("id" text not null, "entry_key" text not null, "data" jsonb null, "translations" jsonb null, "created_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "content_revision_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_revision_entry_key" ON "content_revision" ("entry_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_revision_deleted_at" ON "content_revision" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "media_asset" ("id" text not null, "url" text not null, "file_key" text null, "name" text not null, "mime_type" text null, "width" integer null, "height" integer null, "size" integer null, "alt" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "media_asset_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_media_asset_deleted_at" ON "media_asset" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blog_category" cascade;`);

    this.addSql(`drop table if exists "blog_post" cascade;`);

    this.addSql(`drop table if exists "content_entry" cascade;`);

    this.addSql(`drop table if exists "content_revision" cascade;`);

    this.addSql(`drop table if exists "media_asset" cascade;`);
  }

}
