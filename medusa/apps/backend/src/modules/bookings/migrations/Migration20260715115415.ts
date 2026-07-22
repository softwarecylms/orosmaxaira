import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260715115415 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "availability_slot" drop constraint if exists "availability_slot_activity_id_foreign";`);

    this.addSql(`alter table if exists "booking" drop constraint if exists "booking_activity_id_foreign";`);

    this.addSql(`alter table if exists "availability_slot" add column if not exists "workshop_id" text null;`);
    this.addSql(`alter table if exists "availability_slot" alter column "activity_id" type text using ("activity_id"::text);`);
    this.addSql(`alter table if exists "availability_slot" alter column "activity_id" drop not null;`);
    this.addSql(`alter table if exists "availability_slot" add constraint "availability_slot_workshop_id_foreign" foreign key ("workshop_id") references "workshop" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table if exists "availability_slot" add constraint "availability_slot_activity_id_foreign" foreign key ("activity_id") references "activity" ("id") on update cascade on delete set null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_slot_workshop_id" ON "availability_slot" ("workshop_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_slot_workshop_date_time" ON "availability_slot" ("workshop_id", "date", "start_time") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "booking" add column if not exists "combo_label" text null, add column if not exists "workshop_id" text null;`);
    this.addSql(`alter table if exists "booking" alter column "activity_id" type text using ("activity_id"::text);`);
    this.addSql(`alter table if exists "booking" alter column "activity_id" drop not null;`);
    this.addSql(`alter table if exists "booking" add constraint "booking_workshop_id_foreign" foreign key ("workshop_id") references "workshop" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table if exists "booking" add constraint "booking_activity_id_foreign" foreign key ("activity_id") references "activity" ("id") on update cascade on delete set null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_workshop_id" ON "booking" ("workshop_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "availability_slot" drop constraint if exists "availability_slot_workshop_id_foreign";`);
    this.addSql(`alter table if exists "availability_slot" drop constraint if exists "availability_slot_activity_id_foreign";`);

    this.addSql(`alter table if exists "booking" drop constraint if exists "booking_workshop_id_foreign";`);
    this.addSql(`alter table if exists "booking" drop constraint if exists "booking_activity_id_foreign";`);

    this.addSql(`drop index if exists "IDX_availability_slot_workshop_id";`);
    this.addSql(`drop index if exists "IDX_slot_workshop_date_time";`);
    this.addSql(`alter table if exists "availability_slot" drop column if exists "workshop_id";`);

    this.addSql(`alter table if exists "availability_slot" alter column "activity_id" type text using ("activity_id"::text);`);
    this.addSql(`alter table if exists "availability_slot" alter column "activity_id" set not null;`);
    this.addSql(`alter table if exists "availability_slot" add constraint "availability_slot_activity_id_foreign" foreign key ("activity_id") references "activity" ("id") on update cascade;`);

    this.addSql(`drop index if exists "IDX_booking_workshop_id";`);
    this.addSql(`alter table if exists "booking" drop column if exists "combo_label", drop column if exists "workshop_id";`);

    this.addSql(`alter table if exists "booking" alter column "activity_id" type text using ("activity_id"::text);`);
    this.addSql(`alter table if exists "booking" alter column "activity_id" set not null;`);
    this.addSql(`alter table if exists "booking" add constraint "booking_activity_id_foreign" foreign key ("activity_id") references "activity" ("id") on update cascade;`);
  }

}
