/// <reference types="node" />
import { EventEmitter } from 'events';
export { NodeModuleMigrationProvider } from './node-migration-provider';
export { TemplateProvider } from './flock-cli';
/** Provides Migration instances to a Migrator. */
export interface MigrationProvider {
    /** Scans the file system or creates adhoc migrations. */
    provide(): Promise<Migration[]>;
}
/** The seed to initialize the database */
export interface Seed {
    run(queryInterface: QueryInterface): Promise<void>;
}
export interface Migration {
    id: string;
    up(queryInterface: QueryInterface): Promise<void>;
    down(queryInterface: QueryInterface): Promise<void>;
}
/** Provides DataAccess instances to a Migrator. */
export interface DataAccessProvider {
    /** Open a new database connection and provides a DataAccess instance. */
    provide(): Promise<DataAccess>;
}
/**
 * Represents an open database connection.
 */
export interface DataAccess {
    /** Retrieve all migrations that have been migrated. */
    getMigratedMigrations(): Promise<{
        id: string;
        migratedAt: Date;
    }[]>;
    /** Migrate the specified migration where action is the database queries to run. */
    migrate(migrationId: string, action: (queryInterface: QueryInterface) => Promise<void>): Promise<void>;
    /** Rollback the specified migration where action is the database queries to run. */
    rollback(migrationId: string, action: (queryInterface: QueryInterface) => Promise<void>): Promise<void>;
    /** Close the database connection. */
    close(): Promise<void>;
}
/** Represents the interface migrations use to perform database queries. */
export interface QueryInterface {
    /** Make a database query. The signature of this function will be unique for each flock plugin. */
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
export interface Migrator {
    /**
     * Retrieve the state for each migration.
     */
    getMigrationState(): Promise<MigrationState[]>;
    /**
     * Migrates all migrations before and including the specified migration ID
     * that have not been migrated yet. If no migration ID is specified then
     * migrates all migrations.
     *
     * @param migrationId The migration to migrate down to
     */
    migrate(migrationId?: string): Promise<{
        schemaHasChanged: boolean;
    }>;
    /**
     * Rolls back the last migrated migration. If a migration ID is specified then
     * rolls back only the migration. If migration ID is '@all' then rolls back
     * all migrated migrations.
     *
     * @param migrationId The migration to rollback or '@all' to rollback all migrated migrations
     */
    rollback(migrationId?: string): Promise<void>;
    /**
     * Runs a seed that will initialize the database with data.
     */
    seed(): Promise<void>;
    /** EventEmitter API */
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: string | symbol): Function[];
    rawListeners(event: string | symbol): Function[];
    emit(event: string | symbol, ...args: any[]): boolean;
    eventNames(): Array<string | symbol>;
    listenerCount(type: string | symbol): number;
}
export interface MigrationState {
    id: string;
    migrated: boolean;
    migratedAt?: Date;
}
export declare class DefaultMigrator extends EventEmitter implements Migrator {
    private seeder;
    getMigrations: () => Promise<Migration[]>;
    getDataAccess: () => Promise<DataAccess>;
    constructor(migrationProvider: MigrationProvider, dataAccessProvider: DataAccessProvider, seed?: Seed);
    getMigrationState(): Promise<MigrationState[]>;
    migrate(migrationId?: string): Promise<{
        schemaHasChanged: boolean;
    }>;
    rollback(migrationId?: string): Promise<void>;
    seed(): Promise<void>;
}
