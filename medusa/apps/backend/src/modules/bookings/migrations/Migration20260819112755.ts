import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260819112755 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "activity" add column if not exists "translations" jsonb null;`);

    this.addSql(`alter table if exists "school_program" add column if not exists "translations" jsonb null;`);

    this.addSql(`alter table if exists "workshop" add column if not exists "booking_closed" boolean not null default false, add column if not exists "translations" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "activity" drop column if exists "translations";`);

    this.addSql(`alter table if exists "school_program" drop column if exists "translations";`);

    this.addSql(`alter table if exists "workshop" drop column if exists "booking_closed", drop column if exists "translations";`);
  }

}
