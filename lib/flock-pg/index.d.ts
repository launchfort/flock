import * as Flock from 'flock';
export declare class TemplateProvider implements Flock.TemplateProvider {
    readonly migrationTypes: string[];
    provideFileName(migrationType: string): Promise<string>;
}
export declare class DataAccessProvider implements Flock.DataAccessProvider {
    readonly migrationTableName: string;
    readonly acquireLock: boolean;
    constructor({ migrationTableName, acquireLock }?: {
        migrationTableName?: string;
        acquireLock?: boolean;
    });
    provide(): Promise<PgDataAccess>;
}
export declare class PgDataAccess implements Flock.DataAccess {
    private client;
    private qi;
    readonly migrationTableName: string;
    readonly lock: number;
    constructor(client: any, migrationTableName: any, { lock }?: {
        lock?: number;
    });
    getMigratedMigrations(): Promise<{
        id: any;
        migratedAt: any;
    }[]>;
    migrate(migrationId: string, action: (qi: Flock.QueryInterface) => Promise<void>): Promise<void>;
    rollback(migrationId: string, action: (qi: Flock.QueryInterface) => Promise<void>): Promise<void>;
    close(): Promise<void>;
    hasMigrated(migrationId: string): Promise<boolean>;
}
export declare class PgQueryInterface implements Flock.QueryInterface {
    client: {
        query(queryObject: {
            text: string;
            values?: any[];
            name?: string;
        }): Promise<Flock.QueryResult>;
    };
    constructor(client: any);
    query(queryObject: {
        text: string;
        values?: any[];
        name?: string;
    }): Promise<Flock.QueryResult>;
    tableExists(tableName: string): Promise<boolean>;
    columnExists(tableName: string, columnName: string): Promise<boolean>;
    columnDataType(tableName: string, columnName: string): Promise<string | null>;
    inspectColumn(tableName: string, columnName: string): Promise<{
        [col: string]: any;
    }>;
}
