/// <reference types="node" />
import { EventEmitter } from 'events';
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
export interface Migrator {
    getMigrationState(): Promise<MigrationState[]>;
    migrate(migrationId?: string): Promise<void>;
    rollback(migrationId?: string): Promise<void>;
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
    getMigrations: () => Promise<Migration[]>;
    getDataAccess: () => Promise<DataAccess>;
    constructor(migrationProvider: MigrationProvider, dataAccessProvider: DataAccessProvider);
    getMigrationState(): Promise<MigrationState[]>;
    migrate(migrationId?: string): Promise<void>;
    rollback(migrationId?: string): Promise<void>;
}
