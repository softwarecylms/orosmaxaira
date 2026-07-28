import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260728120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "workshop" add column if not exists "booking_closed" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "workshop" drop column if exists "booking_closed";`);
  }

}
