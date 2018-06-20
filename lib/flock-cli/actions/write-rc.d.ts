/**
 * Used to generate an rc file. By default assumes app will use the flock-pg
 * plugin to talk with Postgres.
 */
export declare function writeRc({ migrationDir, migrationTable, fileName }: {
    migrationDir: string;
    migrationTable: string;
    fileName: string;
}): Promise<void>;
