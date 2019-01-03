/// <reference types="node" />
import { EventEmitter } from 'events';
import { MigrationState, Migrator } from '../index';
export declare class MockMigrator extends EventEmitter implements Migrator {
    migrationState: MigrationState[];
    constructor(migrationState?: MigrationState[]);
    getMigrationState(): Promise<MigrationState[]>;
    migrate(migrationId?: string): Promise<{
        schemaHasChanged: boolean;
    }>;
    seed(): Promise<void>;
    rollback(migrationId?: string): Promise<void>;
}
