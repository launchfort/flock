export interface Answers {
    migrationType?: string;
    tableName?: string;
    migrationName?: string;
}
export interface Options {
    migrationTypes: string[];
    migrationDir: string;
    answers?: Answers;
}
export declare function prompt({ migrationDir, migrationTypes, answers }: Options): Promise<Answers>;
