/**
   * Generates a new file basename for the next migration module.
   *
   * @param migrationType The migration type
   * @param tableName The table being migrated
   * @param migrationDir The migration directory
   */
export declare function generateMigrationBasename(migrationType: string, tableName?: string, { migrationDir }?: {
    migrationDir?: string;
}): Promise<string>;
