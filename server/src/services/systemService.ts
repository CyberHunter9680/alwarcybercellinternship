import { prisma } from '../config/db.js';

export class SystemService {
  private static readonly REGISTRATION_STATUS_KEY = 'is_registration_open';
  private static readonly CLOSED_MESSAGE_KEY = 'registration_closed_message';
  
  public static readonly DEFAULT_CLOSED_MESSAGE =
    `Registration for the Alwar Police Internship Programme 2026 is currently closed.

Thank you for your interest in the programme. The registration window has now been closed, and new applications are no longer being accepted.

For further information or official updates, please refer to the official programme communication channels.`;

  private static tableInitialized = false;

  /**
   * Initializes the system_settings table if it doesn't exist yet (safe, non-destructive DDL)
   */
  static async initTable(): Promise<void> {
    if (this.tableInitialized) return;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."system_settings" (
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
        );
      `);
      this.tableInitialized = true;
    } catch (err) {
      console.warn('⚠️ Warning: Failed to ensure system_settings table:', err);
    }
  }

  /**
   * Checks whether student registration is currently open
   */
  static async isRegistrationOpen(): Promise<{ isOpen: boolean; message: string }> {
    await this.initTable();
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT "key", "value" FROM "public"."system_settings" 
        WHERE "key" IN ($1, $2);
      `, this.REGISTRATION_STATUS_KEY, this.CLOSED_MESSAGE_KEY);

      const statusRow = rows?.find((r) => r.key === this.REGISTRATION_STATUS_KEY);
      const messageRow = rows?.find((r) => r.key === this.CLOSED_MESSAGE_KEY);

      const isOpen = statusRow ? statusRow.value !== 'false' : true;
      const message = !isOpen
        ? (messageRow?.value || this.DEFAULT_CLOSED_MESSAGE)
        : 'Registration is currently open.';

      return { isOpen, message };
    } catch (err) {
      console.warn('⚠️ Could not query registration status from DB, defaulting to OPEN:', err);
      return {
        isOpen: true,
        message: 'Registration is currently open.',
      };
    }
  }

  /**
   * Updates registration status in the persistent database
   */
  static async setRegistrationStatus(isOpen: boolean, customMessage?: string): Promise<{ isOpen: boolean; message: string }> {
    await this.initTable();
    const strValue = isOpen ? 'true' : 'false';
    const msgValue = customMessage?.trim() || this.DEFAULT_CLOSED_MESSAGE;

    await prisma.$executeRawUnsafe(`
      INSERT INTO "public"."system_settings" ("key", "value", "updated_at")
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT ("key") DO UPDATE SET "value" = $2, "updated_at" = CURRENT_TIMESTAMP;
    `, this.REGISTRATION_STATUS_KEY, strValue);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "public"."system_settings" ("key", "value", "updated_at")
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT ("key") DO UPDATE SET "value" = $2, "updated_at" = CURRENT_TIMESTAMP;
    `, this.CLOSED_MESSAGE_KEY, msgValue);

    return {
      isOpen,
      message: isOpen ? 'Registration is currently open.' : msgValue,
    };
  }
}
