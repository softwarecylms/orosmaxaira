import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_hero_home" CASCADE;
  DROP TABLE "pages_blocks_hero_inner_bullets" CASCADE;
  DROP TABLE "pages_blocks_hero_inner" CASCADE;
  DROP TABLE "pages_blocks_stats_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_stats_cards" CASCADE;
  DROP TABLE "pages_blocks_services_grid_items" CASCADE;
  DROP TABLE "pages_blocks_services_grid" CASCADE;
  DROP TABLE "pages_blocks_dark_feature_band_stats" CASCADE;
  DROP TABLE "pages_blocks_dark_feature_band" CASCADE;
  DROP TABLE "pages_blocks_testimonials_row" CASCADE;
  DROP TABLE "pages_blocks_feature_list_chart_bullets" CASCADE;
  DROP TABLE "pages_blocks_feature_list_chart" CASCADE;
  DROP TABLE "pages_blocks_portfolio_strip" CASCADE;
  DROP TABLE "pages_blocks_blog_teaser" CASCADE;
  DROP TABLE "pages_blocks_team_grid" CASCADE;
  DROP TABLE "pages_blocks_founder_spotlight_stats" CASCADE;
  DROP TABLE "pages_blocks_founder_spotlight" CASCADE;
  DROP TABLE "pages_blocks_careers" CASCADE;
  DROP TABLE "pages_blocks_contact_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_contact_cards" CASCADE;
  DROP TABLE "pages_blocks_contact_form_map" CASCADE;
  DROP TABLE "pages_blocks_faq_section" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_home" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_inner_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_inner" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_services_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_services_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_dark_feature_band_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_dark_feature_band" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_row" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_list_chart_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_list_chart" CASCADE;
  DROP TABLE "_pages_v_blocks_portfolio_strip" CASCADE;
  DROP TABLE "_pages_v_blocks_blog_teaser" CASCADE;
  DROP TABLE "_pages_v_blocks_team_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_founder_spotlight_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_founder_spotlight" CASCADE;
  DROP TABLE "_pages_v_blocks_careers" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_form_map" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_section" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  ALTER TABLE "pages" ADD COLUMN "content" jsonb DEFAULT '{"root":{"props":{}},"content":[],"zones":{}}'::jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_content" jsonb DEFAULT '{"root":{"props":{}},"content":[],"zones":{}}'::jsonb;
  DROP TYPE "public"."enum_pages_blocks_stats_cards_cards_variant";
  DROP TYPE "public"."enum_pages_blocks_services_grid_items_icon";
  DROP TYPE "public"."enum_pages_blocks_blog_teaser_mode";
  DROP TYPE "public"."enum_pages_blocks_contact_cards_cards_icon";
  DROP TYPE "public"."enum__pages_v_blocks_stats_cards_cards_variant";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_blog_teaser_mode";
  DROP TYPE "public"."enum__pages_v_blocks_contact_cards_cards_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_stats_cards_cards_variant" AS ENUM('growth', 'gauge', 'person');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_items_icon" AS ENUM('design', 'seo', 'shop', 'performance', 'branding', 'support');
  CREATE TYPE "public"."enum_pages_blocks_blog_teaser_mode" AS ENUM('latest', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_contact_cards_cards_icon" AS ENUM('mail', 'phone', 'office');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_cards_cards_variant" AS ENUM('growth', 'gauge', 'person');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_items_icon" AS ENUM('design', 'seo', 'shop', 'performance', 'branding', 'support');
  CREATE TYPE "public"."enum__pages_v_blocks_blog_teaser_mode" AS ENUM('latest', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_cards_cards_icon" AS ENUM('mail', 'phone', 'office');
  CREATE TABLE "pages_blocks_hero_home" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"primary_cta_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_inner_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_inner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_stats_cards_cards_variant",
  	"value" varchar,
  	"label" varchar,
  	"caption" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_stats_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_services_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_services_grid_items_icon",
  	"title" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_services_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_dark_feature_band_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_dark_feature_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_list_chart_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_list_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_portfolio_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_blog_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"mode" "enum_pages_blocks_blog_teaser_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_founder_spotlight_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_founder_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"quote" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_careers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Careers',
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_contact_cards_cards_icon",
  	"title" varchar,
  	"value" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_form_map" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_heading" varchar,
  	"form_body" varchar,
  	"map_heading" varchar DEFAULT 'Visit Our Office',
  	"map_body" varchar,
  	"map_image_id" integer,
  	"map_link" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Frequently Asked Questions',
  	"subheading" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"client_logos_id" integer,
  	"testimonials_id" integer,
  	"case_studies_id" integer,
  	"posts_id" integer,
  	"team_members_id" integer,
  	"jobs_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_home" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"primary_cta_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_inner_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_inner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_stats_cards_cards_variant",
  	"value" varchar,
  	"label" varchar,
  	"caption" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_services_grid_items_icon",
  	"title" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_dark_feature_band_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_dark_feature_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_list_chart_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_list_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_portfolio_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_blog_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"mode" "enum__pages_v_blocks_blog_teaser_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_founder_spotlight_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_founder_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"quote" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_careers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Careers',
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_contact_cards_cards_icon",
  	"title" varchar,
  	"value" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_form_map" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_heading" varchar,
  	"form_body" varchar,
  	"map_heading" varchar DEFAULT 'Visit Our Office',
  	"map_body" varchar,
  	"map_image_id" integer,
  	"map_link" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Frequently Asked Questions',
  	"subheading" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"client_logos_id" integer,
  	"testimonials_id" integer,
  	"case_studies_id" integer,
  	"posts_id" integer,
  	"team_members_id" integer,
  	"jobs_id" integer,
  	"faqs_id" integer
  );
  
  ALTER TABLE "pages_blocks_hero_home" ADD CONSTRAINT "pages_blocks_hero_home_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_inner_bullets" ADD CONSTRAINT "pages_blocks_hero_inner_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_inner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_inner" ADD CONSTRAINT "pages_blocks_hero_inner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_inner" ADD CONSTRAINT "pages_blocks_hero_inner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_cards_cards" ADD CONSTRAINT "pages_blocks_stats_cards_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_cards_cards" ADD CONSTRAINT "pages_blocks_stats_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_cards" ADD CONSTRAINT "pages_blocks_stats_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_grid_items" ADD CONSTRAINT "pages_blocks_services_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_grid" ADD CONSTRAINT "pages_blocks_services_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_dark_feature_band_stats" ADD CONSTRAINT "pages_blocks_dark_feature_band_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_dark_feature_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_dark_feature_band" ADD CONSTRAINT "pages_blocks_dark_feature_band_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_dark_feature_band" ADD CONSTRAINT "pages_blocks_dark_feature_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_row" ADD CONSTRAINT "pages_blocks_testimonials_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_list_chart_bullets" ADD CONSTRAINT "pages_blocks_feature_list_chart_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_list_chart"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_list_chart" ADD CONSTRAINT "pages_blocks_feature_list_chart_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_list_chart" ADD CONSTRAINT "pages_blocks_feature_list_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portfolio_strip" ADD CONSTRAINT "pages_blocks_portfolio_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_blog_teaser" ADD CONSTRAINT "pages_blocks_blog_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_grid" ADD CONSTRAINT "pages_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_founder_spotlight_stats" ADD CONSTRAINT "pages_blocks_founder_spotlight_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_founder_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_founder_spotlight" ADD CONSTRAINT "pages_blocks_founder_spotlight_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_founder_spotlight" ADD CONSTRAINT "pages_blocks_founder_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_careers" ADD CONSTRAINT "pages_blocks_careers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_cards_cards" ADD CONSTRAINT "pages_blocks_contact_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_cards" ADD CONSTRAINT "pages_blocks_contact_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form_map" ADD CONSTRAINT "pages_blocks_contact_form_map_map_image_id_media_id_fk" FOREIGN KEY ("map_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form_map" ADD CONSTRAINT "pages_blocks_contact_form_map_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_section" ADD CONSTRAINT "pages_blocks_faq_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_section" ADD CONSTRAINT "pages_blocks_faq_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_client_logos_fk" FOREIGN KEY ("client_logos_id") REFERENCES "public"."client_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_home" ADD CONSTRAINT "_pages_v_blocks_hero_home_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_inner_bullets" ADD CONSTRAINT "_pages_v_blocks_hero_inner_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_inner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_inner" ADD CONSTRAINT "_pages_v_blocks_hero_inner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_inner" ADD CONSTRAINT "_pages_v_blocks_hero_inner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_cards_cards" ADD CONSTRAINT "_pages_v_blocks_stats_cards_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_cards_cards" ADD CONSTRAINT "_pages_v_blocks_stats_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_cards" ADD CONSTRAINT "_pages_v_blocks_stats_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_grid_items" ADD CONSTRAINT "_pages_v_blocks_services_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_grid" ADD CONSTRAINT "_pages_v_blocks_services_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_dark_feature_band_stats" ADD CONSTRAINT "_pages_v_blocks_dark_feature_band_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_dark_feature_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_dark_feature_band" ADD CONSTRAINT "_pages_v_blocks_dark_feature_band_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_dark_feature_band" ADD CONSTRAINT "_pages_v_blocks_dark_feature_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_row" ADD CONSTRAINT "_pages_v_blocks_testimonials_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_list_chart_bullets" ADD CONSTRAINT "_pages_v_blocks_feature_list_chart_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_list_chart"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_list_chart" ADD CONSTRAINT "_pages_v_blocks_feature_list_chart_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_list_chart" ADD CONSTRAINT "_pages_v_blocks_feature_list_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portfolio_strip" ADD CONSTRAINT "_pages_v_blocks_portfolio_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_blog_teaser" ADD CONSTRAINT "_pages_v_blocks_blog_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_grid" ADD CONSTRAINT "_pages_v_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_founder_spotlight_stats" ADD CONSTRAINT "_pages_v_blocks_founder_spotlight_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_founder_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_founder_spotlight" ADD CONSTRAINT "_pages_v_blocks_founder_spotlight_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_founder_spotlight" ADD CONSTRAINT "_pages_v_blocks_founder_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_careers" ADD CONSTRAINT "_pages_v_blocks_careers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_cards_cards" ADD CONSTRAINT "_pages_v_blocks_contact_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_cards" ADD CONSTRAINT "_pages_v_blocks_contact_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_form_map" ADD CONSTRAINT "_pages_v_blocks_contact_form_map_map_image_id_media_id_fk" FOREIGN KEY ("map_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_form_map" ADD CONSTRAINT "_pages_v_blocks_contact_form_map_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_section" ADD CONSTRAINT "_pages_v_blocks_faq_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_section" ADD CONSTRAINT "_pages_v_blocks_faq_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_client_logos_fk" FOREIGN KEY ("client_logos_id") REFERENCES "public"."client_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_home_order_idx" ON "pages_blocks_hero_home" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_home_parent_id_idx" ON "pages_blocks_hero_home" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_home_path_idx" ON "pages_blocks_hero_home" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_inner_bullets_order_idx" ON "pages_blocks_hero_inner_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_inner_bullets_parent_id_idx" ON "pages_blocks_hero_inner_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_inner_order_idx" ON "pages_blocks_hero_inner" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_inner_parent_id_idx" ON "pages_blocks_hero_inner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_inner_path_idx" ON "pages_blocks_hero_inner" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_inner_image_idx" ON "pages_blocks_hero_inner" USING btree ("image_id");
  CREATE INDEX "pages_blocks_stats_cards_cards_order_idx" ON "pages_blocks_stats_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_cards_cards_parent_id_idx" ON "pages_blocks_stats_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_cards_cards_image_idx" ON "pages_blocks_stats_cards_cards" USING btree ("image_id");
  CREATE INDEX "pages_blocks_stats_cards_order_idx" ON "pages_blocks_stats_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_cards_parent_id_idx" ON "pages_blocks_stats_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_cards_path_idx" ON "pages_blocks_stats_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_services_grid_items_order_idx" ON "pages_blocks_services_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_grid_items_parent_id_idx" ON "pages_blocks_services_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_grid_order_idx" ON "pages_blocks_services_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_grid_parent_id_idx" ON "pages_blocks_services_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_grid_path_idx" ON "pages_blocks_services_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_dark_feature_band_stats_order_idx" ON "pages_blocks_dark_feature_band_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_dark_feature_band_stats_parent_id_idx" ON "pages_blocks_dark_feature_band_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_dark_feature_band_order_idx" ON "pages_blocks_dark_feature_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_dark_feature_band_parent_id_idx" ON "pages_blocks_dark_feature_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_dark_feature_band_path_idx" ON "pages_blocks_dark_feature_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_dark_feature_band_image_idx" ON "pages_blocks_dark_feature_band" USING btree ("image_id");
  CREATE INDEX "pages_blocks_testimonials_row_order_idx" ON "pages_blocks_testimonials_row" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_row_parent_id_idx" ON "pages_blocks_testimonials_row" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_row_path_idx" ON "pages_blocks_testimonials_row" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_list_chart_bullets_order_idx" ON "pages_blocks_feature_list_chart_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_list_chart_bullets_parent_id_idx" ON "pages_blocks_feature_list_chart_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_list_chart_order_idx" ON "pages_blocks_feature_list_chart" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_list_chart_parent_id_idx" ON "pages_blocks_feature_list_chart" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_list_chart_path_idx" ON "pages_blocks_feature_list_chart" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_list_chart_image_idx" ON "pages_blocks_feature_list_chart" USING btree ("image_id");
  CREATE INDEX "pages_blocks_portfolio_strip_order_idx" ON "pages_blocks_portfolio_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_portfolio_strip_parent_id_idx" ON "pages_blocks_portfolio_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portfolio_strip_path_idx" ON "pages_blocks_portfolio_strip" USING btree ("_path");
  CREATE INDEX "pages_blocks_blog_teaser_order_idx" ON "pages_blocks_blog_teaser" USING btree ("_order");
  CREATE INDEX "pages_blocks_blog_teaser_parent_id_idx" ON "pages_blocks_blog_teaser" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_blog_teaser_path_idx" ON "pages_blocks_blog_teaser" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_grid_order_idx" ON "pages_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_grid_parent_id_idx" ON "pages_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_grid_path_idx" ON "pages_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_founder_spotlight_stats_order_idx" ON "pages_blocks_founder_spotlight_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_founder_spotlight_stats_parent_id_idx" ON "pages_blocks_founder_spotlight_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_founder_spotlight_order_idx" ON "pages_blocks_founder_spotlight" USING btree ("_order");
  CREATE INDEX "pages_blocks_founder_spotlight_parent_id_idx" ON "pages_blocks_founder_spotlight" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_founder_spotlight_path_idx" ON "pages_blocks_founder_spotlight" USING btree ("_path");
  CREATE INDEX "pages_blocks_founder_spotlight_image_idx" ON "pages_blocks_founder_spotlight" USING btree ("image_id");
  CREATE INDEX "pages_blocks_careers_order_idx" ON "pages_blocks_careers" USING btree ("_order");
  CREATE INDEX "pages_blocks_careers_parent_id_idx" ON "pages_blocks_careers" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_careers_path_idx" ON "pages_blocks_careers" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_cards_cards_order_idx" ON "pages_blocks_contact_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_cards_cards_parent_id_idx" ON "pages_blocks_contact_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_cards_order_idx" ON "pages_blocks_contact_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_cards_parent_id_idx" ON "pages_blocks_contact_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_cards_path_idx" ON "pages_blocks_contact_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_form_map_order_idx" ON "pages_blocks_contact_form_map" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_form_map_parent_id_idx" ON "pages_blocks_contact_form_map" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_form_map_path_idx" ON "pages_blocks_contact_form_map" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_form_map_map_image_idx" ON "pages_blocks_contact_form_map" USING btree ("map_image_id");
  CREATE INDEX "pages_blocks_faq_section_order_idx" ON "pages_blocks_faq_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_section_parent_id_idx" ON "pages_blocks_faq_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_section_path_idx" ON "pages_blocks_faq_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_section_image_idx" ON "pages_blocks_faq_section" USING btree ("image_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_client_logos_id_idx" ON "pages_rels" USING btree ("client_logos_id");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "pages_rels_case_studies_id_idx" ON "pages_rels" USING btree ("case_studies_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_team_members_id_idx" ON "pages_rels" USING btree ("team_members_id");
  CREATE INDEX "pages_rels_jobs_id_idx" ON "pages_rels" USING btree ("jobs_id");
  CREATE INDEX "pages_rels_faqs_id_idx" ON "pages_rels" USING btree ("faqs_id");
  CREATE INDEX "_pages_v_blocks_hero_home_order_idx" ON "_pages_v_blocks_hero_home" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_home_parent_id_idx" ON "_pages_v_blocks_hero_home" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_home_path_idx" ON "_pages_v_blocks_hero_home" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_inner_bullets_order_idx" ON "_pages_v_blocks_hero_inner_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_inner_bullets_parent_id_idx" ON "_pages_v_blocks_hero_inner_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_inner_order_idx" ON "_pages_v_blocks_hero_inner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_inner_parent_id_idx" ON "_pages_v_blocks_hero_inner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_inner_path_idx" ON "_pages_v_blocks_hero_inner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_inner_image_idx" ON "_pages_v_blocks_hero_inner" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_stats_cards_cards_order_idx" ON "_pages_v_blocks_stats_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_cards_cards_parent_id_idx" ON "_pages_v_blocks_stats_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_cards_cards_image_idx" ON "_pages_v_blocks_stats_cards_cards" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_stats_cards_order_idx" ON "_pages_v_blocks_stats_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_cards_parent_id_idx" ON "_pages_v_blocks_stats_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_cards_path_idx" ON "_pages_v_blocks_stats_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_services_grid_items_order_idx" ON "_pages_v_blocks_services_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_grid_items_parent_id_idx" ON "_pages_v_blocks_services_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_grid_order_idx" ON "_pages_v_blocks_services_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_grid_parent_id_idx" ON "_pages_v_blocks_services_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_grid_path_idx" ON "_pages_v_blocks_services_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_dark_feature_band_stats_order_idx" ON "_pages_v_blocks_dark_feature_band_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_dark_feature_band_stats_parent_id_idx" ON "_pages_v_blocks_dark_feature_band_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_dark_feature_band_order_idx" ON "_pages_v_blocks_dark_feature_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_dark_feature_band_parent_id_idx" ON "_pages_v_blocks_dark_feature_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_dark_feature_band_path_idx" ON "_pages_v_blocks_dark_feature_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_dark_feature_band_image_idx" ON "_pages_v_blocks_dark_feature_band" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_testimonials_row_order_idx" ON "_pages_v_blocks_testimonials_row" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_row_parent_id_idx" ON "_pages_v_blocks_testimonials_row" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_row_path_idx" ON "_pages_v_blocks_testimonials_row" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_list_chart_bullets_order_idx" ON "_pages_v_blocks_feature_list_chart_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_list_chart_bullets_parent_id_idx" ON "_pages_v_blocks_feature_list_chart_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_list_chart_order_idx" ON "_pages_v_blocks_feature_list_chart" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_list_chart_parent_id_idx" ON "_pages_v_blocks_feature_list_chart" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_list_chart_path_idx" ON "_pages_v_blocks_feature_list_chart" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_list_chart_image_idx" ON "_pages_v_blocks_feature_list_chart" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_portfolio_strip_order_idx" ON "_pages_v_blocks_portfolio_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_portfolio_strip_parent_id_idx" ON "_pages_v_blocks_portfolio_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_portfolio_strip_path_idx" ON "_pages_v_blocks_portfolio_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_blog_teaser_order_idx" ON "_pages_v_blocks_blog_teaser" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_blog_teaser_parent_id_idx" ON "_pages_v_blocks_blog_teaser" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_blog_teaser_path_idx" ON "_pages_v_blocks_blog_teaser" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_grid_order_idx" ON "_pages_v_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_grid_parent_id_idx" ON "_pages_v_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_grid_path_idx" ON "_pages_v_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_founder_spotlight_stats_order_idx" ON "_pages_v_blocks_founder_spotlight_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_founder_spotlight_stats_parent_id_idx" ON "_pages_v_blocks_founder_spotlight_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_founder_spotlight_order_idx" ON "_pages_v_blocks_founder_spotlight" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_founder_spotlight_parent_id_idx" ON "_pages_v_blocks_founder_spotlight" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_founder_spotlight_path_idx" ON "_pages_v_blocks_founder_spotlight" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_founder_spotlight_image_idx" ON "_pages_v_blocks_founder_spotlight" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_careers_order_idx" ON "_pages_v_blocks_careers" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_careers_parent_id_idx" ON "_pages_v_blocks_careers" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_careers_path_idx" ON "_pages_v_blocks_careers" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_cards_cards_order_idx" ON "_pages_v_blocks_contact_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_cards_cards_parent_id_idx" ON "_pages_v_blocks_contact_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_cards_order_idx" ON "_pages_v_blocks_contact_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_cards_parent_id_idx" ON "_pages_v_blocks_contact_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_cards_path_idx" ON "_pages_v_blocks_contact_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_form_map_order_idx" ON "_pages_v_blocks_contact_form_map" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_form_map_parent_id_idx" ON "_pages_v_blocks_contact_form_map" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_form_map_path_idx" ON "_pages_v_blocks_contact_form_map" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_form_map_map_image_idx" ON "_pages_v_blocks_contact_form_map" USING btree ("map_image_id");
  CREATE INDEX "_pages_v_blocks_faq_section_order_idx" ON "_pages_v_blocks_faq_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_section_parent_id_idx" ON "_pages_v_blocks_faq_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_section_path_idx" ON "_pages_v_blocks_faq_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_section_image_idx" ON "_pages_v_blocks_faq_section" USING btree ("image_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_client_logos_id_idx" ON "_pages_v_rels" USING btree ("client_logos_id");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_rels_case_studies_id_idx" ON "_pages_v_rels" USING btree ("case_studies_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_team_members_id_idx" ON "_pages_v_rels" USING btree ("team_members_id");
  CREATE INDEX "_pages_v_rels_jobs_id_idx" ON "_pages_v_rels" USING btree ("jobs_id");
  CREATE INDEX "_pages_v_rels_faqs_id_idx" ON "_pages_v_rels" USING btree ("faqs_id");
  ALTER TABLE "pages" DROP COLUMN "content";
  ALTER TABLE "_pages_v" DROP COLUMN "version_content";`)
}
