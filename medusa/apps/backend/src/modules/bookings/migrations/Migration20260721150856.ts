import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260721150856 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "availability_slot" add column if not exists "combo_key" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "availability_slot" drop column if exists "combo_key";`);
  }

}
