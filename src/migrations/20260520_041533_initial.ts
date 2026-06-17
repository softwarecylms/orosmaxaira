import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_stats_cards_cards_variant" AS ENUM('growth', 'gauge', 'person');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_items_icon" AS ENUM('design', 'seo', 'shop', 'performance', 'branding', 'support');
  CREATE TYPE "public"."enum_pages_blocks_blog_teaser_mode" AS ENUM('latest', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_contact_cards_cards_icon" AS ENUM('mail', 'phone', 'office');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_cards_cards_variant" AS ENUM('growth', 'gauge', 'person');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_items_icon" AS ENUM('design', 'seo', 'shop', 'performance', 'branding', 'support');
  CREATE TYPE "public"."enum__pages_v_blocks_blog_teaser_mode" AS ENUM('latest', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_cards_cards_icon" AS ENUM('mail', 'phone', 'office');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('design', 'seo', 'marketing', 'development');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('design', 'seo', 'marketing', 'development');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_case_studies_device" AS ENUM('mobile', 'laptop', 'desktop');
  CREATE TYPE "public"."enum_case_studies_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__case_studies_v_version_device" AS ENUM('mobile', 'laptop', 'desktop');
  CREATE TYPE "public"."enum__case_studies_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_jobs_type" AS ENUM('full-time', 'part-time', 'internship', 'contract');
  CREATE TYPE "public"."enum_jobs_status" AS ENUM('open', 'closed');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
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
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
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
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
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
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"category" "enum_posts_category",
  	"cover_id" integer,
  	"content" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_category" "enum__posts_v_version_category",
  	"version_cover_id" integer,
  	"version_content" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"client" varchar,
  	"device" "enum_case_studies_device" DEFAULT 'desktop',
  	"cover_id" integer,
  	"summary" varchar,
  	"content" jsonb,
  	"live_url" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_case_studies_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_case_studies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_client" varchar,
  	"version_device" "enum__case_studies_v_version_device" DEFAULT 'desktop',
  	"version_cover_id" integer,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_live_url" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__case_studies_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"photo_id" integer,
  	"bio" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"location" varchar DEFAULT 'Nicosia, Cyprus',
  	"type" "enum_jobs_type" DEFAULT 'full-time',
  	"status" "enum_jobs_status" DEFAULT 'open',
  	"summary" varchar,
  	"description" jsonb,
  	"apply_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"author" varchar NOT NULL,
  	"role" varchar,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "client_logos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer NOT NULL,
  	"website" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_feature_url" varchar,
  	"sizes_feature_width" numeric,
  	"sizes_feature_height" numeric,
  	"sizes_feature_mime_type" varchar,
  	"sizes_feature_filesize" numeric,
  	"sizes_feature_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"case_studies_id" integer,
  	"team_members_id" integer,
  	"jobs_id" integer,
  	"faqs_id" integer,
  	"testimonials_id" integer,
  	"client_logos_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'SoftwareCy',
  	"tagline" varchar,
  	"logo_id" integer,
  	"logo_dark_id" integer,
  	"default_og_image_id" integer,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"contact_address" varchar,
  	"social_facebook" varchar,
  	"social_instagram" varchar,
  	"social_linkedin" varchar,
  	"social_youtube" varchar,
  	"social_tiktok" varchar,
  	"callback_cta_label" varchar,
  	"callback_cta_href" varchar,
  	"callback_cta_new_tab" boolean DEFAULT false,
  	"footer_cta_heading" varchar DEFAULT 'Ready to get started?',
  	"footer_cta_body" varchar,
  	"footer_cta_cta_label" varchar,
  	"footer_cta_cta_href" varchar,
  	"footer_cta_cta_new_tab" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "footer_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"sublabel" varchar
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bottom_note" varchar DEFAULT '© SoftwareCy. All rights reserved.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
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
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_client_logos_fk" FOREIGN KEY ("client_logos_id") REFERENCES "public"."client_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_parent_id_case_studies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "client_logos" ADD CONSTRAINT "client_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_client_logos_fk" FOREIGN KEY ("client_logos_id") REFERENCES "public"."client_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav" ADD CONSTRAINT "header_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_badges" ADD CONSTRAINT "footer_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
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
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
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
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
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
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_cover_idx" ON "posts" USING btree ("cover_id");
  CREATE INDEX "posts_seo_seo_image_idx" ON "posts" USING btree ("seo_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_seo_version_seo_image_idx" ON "_posts_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE UNIQUE INDEX "case_studies_slug_idx" ON "case_studies" USING btree ("slug");
  CREATE INDEX "case_studies_cover_idx" ON "case_studies" USING btree ("cover_id");
  CREATE INDEX "case_studies_seo_seo_image_idx" ON "case_studies" USING btree ("seo_image_id");
  CREATE INDEX "case_studies_updated_at_idx" ON "case_studies" USING btree ("updated_at");
  CREATE INDEX "case_studies_created_at_idx" ON "case_studies" USING btree ("created_at");
  CREATE INDEX "case_studies__status_idx" ON "case_studies" USING btree ("_status");
  CREATE INDEX "_case_studies_v_parent_idx" ON "_case_studies_v" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_version_version_slug_idx" ON "_case_studies_v" USING btree ("version_slug");
  CREATE INDEX "_case_studies_v_version_version_cover_idx" ON "_case_studies_v" USING btree ("version_cover_id");
  CREATE INDEX "_case_studies_v_version_seo_version_seo_image_idx" ON "_case_studies_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_case_studies_v_version_version_updated_at_idx" ON "_case_studies_v" USING btree ("version_updated_at");
  CREATE INDEX "_case_studies_v_version_version_created_at_idx" ON "_case_studies_v" USING btree ("version_created_at");
  CREATE INDEX "_case_studies_v_version_version__status_idx" ON "_case_studies_v" USING btree ("version__status");
  CREATE INDEX "_case_studies_v_created_at_idx" ON "_case_studies_v" USING btree ("created_at");
  CREATE INDEX "_case_studies_v_updated_at_idx" ON "_case_studies_v" USING btree ("updated_at");
  CREATE INDEX "_case_studies_v_latest_idx" ON "_case_studies_v" USING btree ("latest");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "testimonials_photo_idx" ON "testimonials" USING btree ("photo_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "client_logos_logo_idx" ON "client_logos" USING btree ("logo_id");
  CREATE INDEX "client_logos_updated_at_idx" ON "client_logos" USING btree ("updated_at");
  CREATE INDEX "client_logos_created_at_idx" ON "client_logos" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_feature_sizes_feature_filename_idx" ON "media" USING btree ("sizes_feature_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_case_studies_id_idx" ON "payload_locked_documents_rels" USING btree ("case_studies_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_client_logos_id_idx" ON "payload_locked_documents_rels" USING btree ("client_logos_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_dark_idx" ON "site_settings" USING btree ("logo_dark_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE INDEX "header_nav_order_idx" ON "header_nav" USING btree ("_order");
  CREATE INDEX "header_nav_parent_id_idx" ON "header_nav" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_badges_order_idx" ON "footer_badges" USING btree ("_order");
  CREATE INDEX "footer_badges_parent_id_idx" ON "footer_badges" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  DROP TABLE "pages" CASCADE;
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
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "case_studies" CASCADE;
  DROP TABLE "_case_studies_v" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "client_logos" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "header_nav" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_badges" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_stats_cards_cards_variant";
  DROP TYPE "public"."enum_pages_blocks_services_grid_items_icon";
  DROP TYPE "public"."enum_pages_blocks_blog_teaser_mode";
  DROP TYPE "public"."enum_pages_blocks_contact_cards_cards_icon";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_stats_cards_cards_variant";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_blog_teaser_mode";
  DROP TYPE "public"."enum__pages_v_blocks_contact_cards_cards_icon";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_case_studies_device";
  DROP TYPE "public"."enum_case_studies_status";
  DROP TYPE "public"."enum__case_studies_v_version_device";
  DROP TYPE "public"."enum__case_studies_v_version_status";
  DROP TYPE "public"."enum_jobs_type";
  DROP TYPE "public"."enum_jobs_status";
  DROP TYPE "public"."enum_users_role";`)
}
