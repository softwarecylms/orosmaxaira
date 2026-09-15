import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260915113432 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "activity" add column if not exists "hidden" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "activity" drop column if exists "hidden";`);
  }

}
