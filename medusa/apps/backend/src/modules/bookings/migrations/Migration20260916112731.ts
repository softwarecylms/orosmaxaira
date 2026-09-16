import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260916112731 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "activity" add column if not exists "confirmation_note" text null, add column if not exists "combo_program_key" text null;`);

    this.addSql(`alter table if exists "booking" add column if not exists "locale" text not null default 'el';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "activity" drop column if exists "confirmation_note", drop column if exists "combo_program_key";`);

    this.addSql(`alter table if exists "booking" drop column if exists "locale";`);
  }

}
