export { NodeModuleMigrationProvider } from './node-migration-provider';
export { TemplateProvider } from './flock-cli';
export interface MigrationProvider {
    provide(): Promise<Migration[]>;
}
export interface Migration {
    id: string;
    up(queryInterface: QueryInterface): Promise<void>;
    down(queryInterface: QueryInterface): Promise<void>;
}
export interface DataAccessProvider {
    provide(): Promise<DataAccess>;
}
export interface DataAccess {
    getMigratedMigrations(): Promise<{
        id: string;
        migratedAt: Date;
    }[]>;
    migrate(migrationId: string, action: (queryInterface: QueryInterface) => Promise<void>): Promise<void>;
    rollback(migrationId: string, action: (queryInterface: QueryInterface) => Promise<void>): Promise<void>;
    close(): Promise<void>;
}
export interface QueryInterface {
    query(queryObject: any): Promise<QueryResult>;
    tableExists(tableName: string): Promise<boolean>;
    columnExists(tableName: string, columnName: string): Promise<boolean>;
    columnDataType(tableName: string, columnName: string): Promise<string | null>;
}
export interface QueryResult {
    rowCount: number;
    rows: {
        [col: string]: any;
    }[];
}
export declare class Migrator {
    getMigrations: () => Promise<Migration[]>;
    getDataAccess: () => Promise<DataAccess>;
    constructor(migrationProvider: MigrationProvider, dataAccessProvider: DataAccessProvider);
    getMigrationState(): Promise<{
        id: string;
        migrated: boolean;
        migratedAt: Date;
    }[]>;
    migrate(migrationId?: string): Promise<void>;
    rollback(migrationId?: string): Promise<void>;
}
