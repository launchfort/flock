/**
   * Generates a new file basename for the next migration module.
   *
   * @param migrationType The migration type
   * @param tableName The table being migrated
   * @param migrationDir The migration directory
   * @param date The optional date to use in the basename (optional)
   */
export declare function generateMigrationBasename(migrationType: string, tableName?: string, { migrationDir, date }?: {
    migrationDir?: string;
    date?: Date;
}): Promise<string>;
