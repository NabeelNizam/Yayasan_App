import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_lembaga_kategori" AS ENUM('pendidikan', 'operasional');
  CREATE TYPE "public"."enum_lembaga_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lembaga_v_version_kategori" AS ENUM('pendidikan', 'operasional');
  CREATE TYPE "public"."enum__lembaga_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_prestasi_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__prestasi_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_fasilitas_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__fasilitas_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_publikasi_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__publikasi_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_kajian_type" AS ENUM('video', 'artikel', 'kitab');
  CREATE TYPE "public"."enum_kajian_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__kajian_v_version_type" AS ENUM('video', 'artikel', 'kitab');
  CREATE TYPE "public"."enum__kajian_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_campaigns_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__campaigns_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_webhook_inbox_status" AS ENUM('pending', 'done', 'dead');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
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
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
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
  	"focal_y" numeric
  );
  
  CREATE TABLE "lembaga" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar,
  	"slug" varchar,
  	"kategori" "enum_lembaga_kategori",
  	"deskripsi" varchar,
  	"profil_image_id" integer,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_lembaga_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_lembaga_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nama" varchar,
  	"version_slug" varchar,
  	"version_kategori" "enum__lembaga_v_version_kategori",
  	"version_deskripsi" varchar,
  	"version_profil_image_id" integer,
  	"version_is_active" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__lembaga_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "prestasi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lembaga_id" integer,
  	"title" varchar,
  	"event" varchar,
  	"date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_prestasi_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_prestasi_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_lembaga_id" integer,
  	"version_title" varchar,
  	"version_event" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__prestasi_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "fasilitas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lembaga_id" integer,
  	"title" varchar,
  	"desc" varchar,
  	"icon" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_fasilitas_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_fasilitas_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_lembaga_id" integer,
  	"version_title" varchar,
  	"version_desc" varchar,
  	"version_icon" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__fasilitas_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "publikasi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"slug" varchar,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_publikasi_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_publikasi_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__publikasi_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "kajian" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_kajian_type" DEFAULT 'artikel',
  	"title" varchar,
  	"slug" varchar,
  	"youtube_id" varchar,
  	"body" jsonb,
  	"pdf_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_kajian_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_kajian_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__kajian_v_version_type" DEFAULT 'artikel',
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_youtube_id" varchar,
  	"version_body" jsonb,
  	"version_pdf_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__kajian_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "phbi_recap" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"row_key" varchar NOT NULL,
  	"event" varchar NOT NULL,
  	"year" varchar,
  	"date" varchar,
  	"description" varchar,
  	"image_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sync_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"finished_at" timestamp(3) with time zone,
  	"status" varchar,
  	"row_count" numeric,
  	"error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "campaigns" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"short_description" varchar,
  	"description" varchar,
  	"cover_image_id" integer,
  	"target_amount" numeric DEFAULT 0,
  	"collected_amount" numeric DEFAULT 0,
  	"donor_count" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_campaigns_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_campaigns_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_short_description" varchar,
  	"version_description" varchar,
  	"version_cover_image_id" integer,
  	"version_target_amount" numeric DEFAULT 0,
  	"version_collected_amount" numeric DEFAULT 0,
  	"version_donor_count" numeric DEFAULT 0,
  	"version_is_active" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__campaigns_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "donors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"campaign_slug" varchar NOT NULL,
  	"client_token" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"is_anonymous" boolean DEFAULT false,
  	"order_id" varchar,
  	"is_public" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prayers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar NOT NULL,
  	"campaign_slug" varchar,
  	"donor_name" varchar,
  	"is_anonymous" boolean DEFAULT false,
  	"message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"email" varchar,
  	"whatsapp" varchar,
  	"rating" numeric,
  	"message" varchar,
  	"is_anonymous" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "webhook_inbox" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"provider" varchar NOT NULL,
  	"event_id" varchar NOT NULL,
  	"payload_hash" varchar,
  	"payload" jsonb,
  	"status" "enum_webhook_inbox_status" DEFAULT 'pending',
  	"attempts" numeric DEFAULT 0,
  	"next_attempt_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "job_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"last_success_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  	"users_id" integer,
  	"media_id" integer,
  	"lembaga_id" integer,
  	"prestasi_id" integer,
  	"fasilitas_id" integer,
  	"publikasi_id" integer,
  	"kajian_id" integer,
  	"phbi_recap_id" integer,
  	"sync_runs_id" integer,
  	"campaigns_id" integer,
  	"donors_id" integer,
  	"prayers_id" integer,
  	"contact_messages_id" integer,
  	"webhook_inbox_id" integer,
  	"job_runs_id" integer
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
  
  CREATE TABLE "site_settings_tentang_kami_misi" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"teks" varchar
  );
  
  CREATE TABLE "site_settings_sosial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tentang_kami_visi" varchar,
  	"tentang_kami_detail" varchar,
  	"kontak_email" varchar,
  	"kontak_phone" varchar,
  	"kontak_address" varchar,
  	"kontak_map_embed_url" varchar,
  	"kontak_hours" varchar,
  	"sheet_mapping_event_column" varchar,
  	"sheet_mapping_year_column" varchar,
  	"sheet_mapping_date_column" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lembaga" ADD CONSTRAINT "lembaga_profil_image_id_media_id_fk" FOREIGN KEY ("profil_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lembaga_v" ADD CONSTRAINT "_lembaga_v_parent_id_lembaga_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lembaga"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lembaga_v" ADD CONSTRAINT "_lembaga_v_version_profil_image_id_media_id_fk" FOREIGN KEY ("version_profil_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prestasi" ADD CONSTRAINT "prestasi_lembaga_id_lembaga_id_fk" FOREIGN KEY ("lembaga_id") REFERENCES "public"."lembaga"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_prestasi_v" ADD CONSTRAINT "_prestasi_v_parent_id_prestasi_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."prestasi"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_prestasi_v" ADD CONSTRAINT "_prestasi_v_version_lembaga_id_lembaga_id_fk" FOREIGN KEY ("version_lembaga_id") REFERENCES "public"."lembaga"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fasilitas" ADD CONSTRAINT "fasilitas_lembaga_id_lembaga_id_fk" FOREIGN KEY ("lembaga_id") REFERENCES "public"."lembaga"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fasilitas_v" ADD CONSTRAINT "_fasilitas_v_parent_id_fasilitas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."fasilitas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fasilitas_v" ADD CONSTRAINT "_fasilitas_v_version_lembaga_id_lembaga_id_fk" FOREIGN KEY ("version_lembaga_id") REFERENCES "public"."lembaga"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_publikasi_v" ADD CONSTRAINT "_publikasi_v_parent_id_publikasi_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publikasi"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_publikasi_v" ADD CONSTRAINT "_publikasi_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kajian" ADD CONSTRAINT "kajian_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kajian_v" ADD CONSTRAINT "_kajian_v_parent_id_kajian_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."kajian"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kajian_v" ADD CONSTRAINT "_kajian_v_version_pdf_id_media_id_fk" FOREIGN KEY ("version_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campaigns_v" ADD CONSTRAINT "_campaigns_v_parent_id_campaigns_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campaigns_v" ADD CONSTRAINT "_campaigns_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lembaga_fk" FOREIGN KEY ("lembaga_id") REFERENCES "public"."lembaga"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prestasi_fk" FOREIGN KEY ("prestasi_id") REFERENCES "public"."prestasi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fasilitas_fk" FOREIGN KEY ("fasilitas_id") REFERENCES "public"."fasilitas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publikasi_fk" FOREIGN KEY ("publikasi_id") REFERENCES "public"."publikasi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kajian_fk" FOREIGN KEY ("kajian_id") REFERENCES "public"."kajian"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_phbi_recap_fk" FOREIGN KEY ("phbi_recap_id") REFERENCES "public"."phbi_recap"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sync_runs_fk" FOREIGN KEY ("sync_runs_id") REFERENCES "public"."sync_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_campaigns_fk" FOREIGN KEY ("campaigns_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donors_fk" FOREIGN KEY ("donors_id") REFERENCES "public"."donors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prayers_fk" FOREIGN KEY ("prayers_id") REFERENCES "public"."prayers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_webhook_inbox_fk" FOREIGN KEY ("webhook_inbox_id") REFERENCES "public"."webhook_inbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_job_runs_fk" FOREIGN KEY ("job_runs_id") REFERENCES "public"."job_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_tentang_kami_misi" ADD CONSTRAINT "site_settings_tentang_kami_misi_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_sosial" ADD CONSTRAINT "site_settings_sosial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "lembaga_slug_idx" ON "lembaga" USING btree ("slug");
  CREATE INDEX "lembaga_profil_image_idx" ON "lembaga" USING btree ("profil_image_id");
  CREATE INDEX "lembaga_updated_at_idx" ON "lembaga" USING btree ("updated_at");
  CREATE INDEX "lembaga_created_at_idx" ON "lembaga" USING btree ("created_at");
  CREATE INDEX "lembaga__status_idx" ON "lembaga" USING btree ("_status");
  CREATE INDEX "_lembaga_v_parent_idx" ON "_lembaga_v" USING btree ("parent_id");
  CREATE INDEX "_lembaga_v_version_version_slug_idx" ON "_lembaga_v" USING btree ("version_slug");
  CREATE INDEX "_lembaga_v_version_version_profil_image_idx" ON "_lembaga_v" USING btree ("version_profil_image_id");
  CREATE INDEX "_lembaga_v_version_version_updated_at_idx" ON "_lembaga_v" USING btree ("version_updated_at");
  CREATE INDEX "_lembaga_v_version_version_created_at_idx" ON "_lembaga_v" USING btree ("version_created_at");
  CREATE INDEX "_lembaga_v_version_version__status_idx" ON "_lembaga_v" USING btree ("version__status");
  CREATE INDEX "_lembaga_v_created_at_idx" ON "_lembaga_v" USING btree ("created_at");
  CREATE INDEX "_lembaga_v_updated_at_idx" ON "_lembaga_v" USING btree ("updated_at");
  CREATE INDEX "_lembaga_v_latest_idx" ON "_lembaga_v" USING btree ("latest");
  CREATE INDEX "prestasi_lembaga_idx" ON "prestasi" USING btree ("lembaga_id");
  CREATE INDEX "prestasi_updated_at_idx" ON "prestasi" USING btree ("updated_at");
  CREATE INDEX "prestasi_created_at_idx" ON "prestasi" USING btree ("created_at");
  CREATE INDEX "prestasi__status_idx" ON "prestasi" USING btree ("_status");
  CREATE INDEX "_prestasi_v_parent_idx" ON "_prestasi_v" USING btree ("parent_id");
  CREATE INDEX "_prestasi_v_version_version_lembaga_idx" ON "_prestasi_v" USING btree ("version_lembaga_id");
  CREATE INDEX "_prestasi_v_version_version_updated_at_idx" ON "_prestasi_v" USING btree ("version_updated_at");
  CREATE INDEX "_prestasi_v_version_version_created_at_idx" ON "_prestasi_v" USING btree ("version_created_at");
  CREATE INDEX "_prestasi_v_version_version__status_idx" ON "_prestasi_v" USING btree ("version__status");
  CREATE INDEX "_prestasi_v_created_at_idx" ON "_prestasi_v" USING btree ("created_at");
  CREATE INDEX "_prestasi_v_updated_at_idx" ON "_prestasi_v" USING btree ("updated_at");
  CREATE INDEX "_prestasi_v_latest_idx" ON "_prestasi_v" USING btree ("latest");
  CREATE INDEX "fasilitas_lembaga_idx" ON "fasilitas" USING btree ("lembaga_id");
  CREATE INDEX "fasilitas_updated_at_idx" ON "fasilitas" USING btree ("updated_at");
  CREATE INDEX "fasilitas_created_at_idx" ON "fasilitas" USING btree ("created_at");
  CREATE INDEX "fasilitas__status_idx" ON "fasilitas" USING btree ("_status");
  CREATE INDEX "_fasilitas_v_parent_idx" ON "_fasilitas_v" USING btree ("parent_id");
  CREATE INDEX "_fasilitas_v_version_version_lembaga_idx" ON "_fasilitas_v" USING btree ("version_lembaga_id");
  CREATE INDEX "_fasilitas_v_version_version_updated_at_idx" ON "_fasilitas_v" USING btree ("version_updated_at");
  CREATE INDEX "_fasilitas_v_version_version_created_at_idx" ON "_fasilitas_v" USING btree ("version_created_at");
  CREATE INDEX "_fasilitas_v_version_version__status_idx" ON "_fasilitas_v" USING btree ("version__status");
  CREATE INDEX "_fasilitas_v_created_at_idx" ON "_fasilitas_v" USING btree ("created_at");
  CREATE INDEX "_fasilitas_v_updated_at_idx" ON "_fasilitas_v" USING btree ("updated_at");
  CREATE INDEX "_fasilitas_v_latest_idx" ON "_fasilitas_v" USING btree ("latest");
  CREATE UNIQUE INDEX "publikasi_slug_idx" ON "publikasi" USING btree ("slug");
  CREATE INDEX "publikasi_image_idx" ON "publikasi" USING btree ("image_id");
  CREATE INDEX "publikasi_updated_at_idx" ON "publikasi" USING btree ("updated_at");
  CREATE INDEX "publikasi_created_at_idx" ON "publikasi" USING btree ("created_at");
  CREATE INDEX "publikasi__status_idx" ON "publikasi" USING btree ("_status");
  CREATE INDEX "_publikasi_v_parent_idx" ON "_publikasi_v" USING btree ("parent_id");
  CREATE INDEX "_publikasi_v_version_version_slug_idx" ON "_publikasi_v" USING btree ("version_slug");
  CREATE INDEX "_publikasi_v_version_version_image_idx" ON "_publikasi_v" USING btree ("version_image_id");
  CREATE INDEX "_publikasi_v_version_version_updated_at_idx" ON "_publikasi_v" USING btree ("version_updated_at");
  CREATE INDEX "_publikasi_v_version_version_created_at_idx" ON "_publikasi_v" USING btree ("version_created_at");
  CREATE INDEX "_publikasi_v_version_version__status_idx" ON "_publikasi_v" USING btree ("version__status");
  CREATE INDEX "_publikasi_v_created_at_idx" ON "_publikasi_v" USING btree ("created_at");
  CREATE INDEX "_publikasi_v_updated_at_idx" ON "_publikasi_v" USING btree ("updated_at");
  CREATE INDEX "_publikasi_v_latest_idx" ON "_publikasi_v" USING btree ("latest");
  CREATE UNIQUE INDEX "kajian_slug_idx" ON "kajian" USING btree ("slug");
  CREATE INDEX "kajian_pdf_idx" ON "kajian" USING btree ("pdf_id");
  CREATE INDEX "kajian_updated_at_idx" ON "kajian" USING btree ("updated_at");
  CREATE INDEX "kajian_created_at_idx" ON "kajian" USING btree ("created_at");
  CREATE INDEX "kajian__status_idx" ON "kajian" USING btree ("_status");
  CREATE INDEX "_kajian_v_parent_idx" ON "_kajian_v" USING btree ("parent_id");
  CREATE INDEX "_kajian_v_version_version_slug_idx" ON "_kajian_v" USING btree ("version_slug");
  CREATE INDEX "_kajian_v_version_version_pdf_idx" ON "_kajian_v" USING btree ("version_pdf_id");
  CREATE INDEX "_kajian_v_version_version_updated_at_idx" ON "_kajian_v" USING btree ("version_updated_at");
  CREATE INDEX "_kajian_v_version_version_created_at_idx" ON "_kajian_v" USING btree ("version_created_at");
  CREATE INDEX "_kajian_v_version_version__status_idx" ON "_kajian_v" USING btree ("version__status");
  CREATE INDEX "_kajian_v_created_at_idx" ON "_kajian_v" USING btree ("created_at");
  CREATE INDEX "_kajian_v_updated_at_idx" ON "_kajian_v" USING btree ("updated_at");
  CREATE INDEX "_kajian_v_latest_idx" ON "_kajian_v" USING btree ("latest");
  CREATE UNIQUE INDEX "phbi_recap_row_key_idx" ON "phbi_recap" USING btree ("row_key");
  CREATE INDEX "phbi_recap_updated_at_idx" ON "phbi_recap" USING btree ("updated_at");
  CREATE INDEX "phbi_recap_created_at_idx" ON "phbi_recap" USING btree ("created_at");
  CREATE INDEX "sync_runs_updated_at_idx" ON "sync_runs" USING btree ("updated_at");
  CREATE INDEX "sync_runs_created_at_idx" ON "sync_runs" USING btree ("created_at");
  CREATE UNIQUE INDEX "campaigns_slug_idx" ON "campaigns" USING btree ("slug");
  CREATE INDEX "campaigns_cover_image_idx" ON "campaigns" USING btree ("cover_image_id");
  CREATE INDEX "campaigns_updated_at_idx" ON "campaigns" USING btree ("updated_at");
  CREATE INDEX "campaigns_created_at_idx" ON "campaigns" USING btree ("created_at");
  CREATE INDEX "campaigns__status_idx" ON "campaigns" USING btree ("_status");
  CREATE INDEX "_campaigns_v_parent_idx" ON "_campaigns_v" USING btree ("parent_id");
  CREATE INDEX "_campaigns_v_version_version_slug_idx" ON "_campaigns_v" USING btree ("version_slug");
  CREATE INDEX "_campaigns_v_version_version_cover_image_idx" ON "_campaigns_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_campaigns_v_version_version_updated_at_idx" ON "_campaigns_v" USING btree ("version_updated_at");
  CREATE INDEX "_campaigns_v_version_version_created_at_idx" ON "_campaigns_v" USING btree ("version_created_at");
  CREATE INDEX "_campaigns_v_version_version__status_idx" ON "_campaigns_v" USING btree ("version__status");
  CREATE INDEX "_campaigns_v_created_at_idx" ON "_campaigns_v" USING btree ("created_at");
  CREATE INDEX "_campaigns_v_updated_at_idx" ON "_campaigns_v" USING btree ("updated_at");
  CREATE INDEX "_campaigns_v_latest_idx" ON "_campaigns_v" USING btree ("latest");
  CREATE UNIQUE INDEX "donors_client_token_idx" ON "donors" USING btree ("client_token");
  CREATE INDEX "donors_updated_at_idx" ON "donors" USING btree ("updated_at");
  CREATE INDEX "donors_created_at_idx" ON "donors" USING btree ("created_at");
  CREATE UNIQUE INDEX "prayers_token_idx" ON "prayers" USING btree ("token");
  CREATE INDEX "prayers_updated_at_idx" ON "prayers" USING btree ("updated_at");
  CREATE INDEX "prayers_created_at_idx" ON "prayers" USING btree ("created_at");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE INDEX "webhook_inbox_event_id_idx" ON "webhook_inbox" USING btree ("event_id");
  CREATE INDEX "webhook_inbox_status_idx" ON "webhook_inbox" USING btree ("status");
  CREATE INDEX "webhook_inbox_updated_at_idx" ON "webhook_inbox" USING btree ("updated_at");
  CREATE INDEX "webhook_inbox_created_at_idx" ON "webhook_inbox" USING btree ("created_at");
  CREATE INDEX "job_runs_name_idx" ON "job_runs" USING btree ("name");
  CREATE INDEX "job_runs_updated_at_idx" ON "job_runs" USING btree ("updated_at");
  CREATE INDEX "job_runs_created_at_idx" ON "job_runs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_lembaga_id_idx" ON "payload_locked_documents_rels" USING btree ("lembaga_id");
  CREATE INDEX "payload_locked_documents_rels_prestasi_id_idx" ON "payload_locked_documents_rels" USING btree ("prestasi_id");
  CREATE INDEX "payload_locked_documents_rels_fasilitas_id_idx" ON "payload_locked_documents_rels" USING btree ("fasilitas_id");
  CREATE INDEX "payload_locked_documents_rels_publikasi_id_idx" ON "payload_locked_documents_rels" USING btree ("publikasi_id");
  CREATE INDEX "payload_locked_documents_rels_kajian_id_idx" ON "payload_locked_documents_rels" USING btree ("kajian_id");
  CREATE INDEX "payload_locked_documents_rels_phbi_recap_id_idx" ON "payload_locked_documents_rels" USING btree ("phbi_recap_id");
  CREATE INDEX "payload_locked_documents_rels_sync_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("sync_runs_id");
  CREATE INDEX "payload_locked_documents_rels_campaigns_id_idx" ON "payload_locked_documents_rels" USING btree ("campaigns_id");
  CREATE INDEX "payload_locked_documents_rels_donors_id_idx" ON "payload_locked_documents_rels" USING btree ("donors_id");
  CREATE INDEX "payload_locked_documents_rels_prayers_id_idx" ON "payload_locked_documents_rels" USING btree ("prayers_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_webhook_inbox_id_idx" ON "payload_locked_documents_rels" USING btree ("webhook_inbox_id");
  CREATE INDEX "payload_locked_documents_rels_job_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("job_runs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_tentang_kami_misi_order_idx" ON "site_settings_tentang_kami_misi" USING btree ("_order");
  CREATE INDEX "site_settings_tentang_kami_misi_parent_id_idx" ON "site_settings_tentang_kami_misi" USING btree ("_parent_id");
  CREATE INDEX "site_settings_sosial_order_idx" ON "site_settings_sosial" USING btree ("_order");
  CREATE INDEX "site_settings_sosial_parent_id_idx" ON "site_settings_sosial" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "lembaga" CASCADE;
  DROP TABLE "_lembaga_v" CASCADE;
  DROP TABLE "prestasi" CASCADE;
  DROP TABLE "_prestasi_v" CASCADE;
  DROP TABLE "fasilitas" CASCADE;
  DROP TABLE "_fasilitas_v" CASCADE;
  DROP TABLE "publikasi" CASCADE;
  DROP TABLE "_publikasi_v" CASCADE;
  DROP TABLE "kajian" CASCADE;
  DROP TABLE "_kajian_v" CASCADE;
  DROP TABLE "phbi_recap" CASCADE;
  DROP TABLE "sync_runs" CASCADE;
  DROP TABLE "campaigns" CASCADE;
  DROP TABLE "_campaigns_v" CASCADE;
  DROP TABLE "donors" CASCADE;
  DROP TABLE "prayers" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "webhook_inbox" CASCADE;
  DROP TABLE "job_runs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_tentang_kami_misi" CASCADE;
  DROP TABLE "site_settings_sosial" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_lembaga_kategori";
  DROP TYPE "public"."enum_lembaga_status";
  DROP TYPE "public"."enum__lembaga_v_version_kategori";
  DROP TYPE "public"."enum__lembaga_v_version_status";
  DROP TYPE "public"."enum_prestasi_status";
  DROP TYPE "public"."enum__prestasi_v_version_status";
  DROP TYPE "public"."enum_fasilitas_status";
  DROP TYPE "public"."enum__fasilitas_v_version_status";
  DROP TYPE "public"."enum_publikasi_status";
  DROP TYPE "public"."enum__publikasi_v_version_status";
  DROP TYPE "public"."enum_kajian_type";
  DROP TYPE "public"."enum_kajian_status";
  DROP TYPE "public"."enum__kajian_v_version_type";
  DROP TYPE "public"."enum__kajian_v_version_status";
  DROP TYPE "public"."enum_campaigns_status";
  DROP TYPE "public"."enum__campaigns_v_version_status";
  DROP TYPE "public"."enum_webhook_inbox_status";`)
}
