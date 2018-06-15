"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
var node_migration_provider_1 = require("./node-migration-provider");
exports.NodeModuleMigrationProvider = node_migration_provider_1.NodeModuleMigrationProvider;
class DefaultMigrator extends events_1.EventEmitter {
    constructor(migrationProvider, dataAccessProvider) {
        super();
        this.getMigrations = () => migrationProvider.provide();
        this.getDataAccess = () => dataAccessProvider.provide();
    }
    getMigrationState() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get migrations on disk
            const migrations = yield this.getMigrations();
            // Get all migrations that have a record in the DB (i.e. have been migrated)
            const dataAccess = yield this.getDataAccess();
            const migratedMigrations = yield dataAccess.getMigratedMigrations();
            yield dataAccess.close();
            // Map over all migrations and return a state object for each
            return migrations.map(x => {
                const m = migratedMigrations.find(y => y.id === x.id);
                return {
                    id: x.id,
                    migrated: !!m,
                    migratedAt: m ? m.migratedAt : null
                };
            });
        });
    }
    migrate(migrationId = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataAccess = yield this.getDataAccess();
            const migrated = yield dataAccess.getMigratedMigrations();
            let migrations = yield this.getMigrations();
            if (migrationId !== null) {
                const k = migrations.findIndex(x => x.id === migrationId);
                if (k >= 0) {
                    migrations = migrations.slice(0, k + 1);
                }
                else {
                    throw new Error(`Migration ${migrationId} not found`);
                }
            }
            migrations = migrations.filter(x => !migrated.some(y => y.id === x.id));
            return migrations.reduce((p, m) => {
                return p.then(() => __awaiter(this, void 0, void 0, function* () {
                    this.emit('migrating', { migrationId: m.id });
                    yield dataAccess.migrate(m.id, q => m.up(q));
                    this.emit('migrate', { migrationId: m.id });
                }));
            }, Promise.resolve()).then(() => {
                return dataAccess.close();
            }, error => {
                return dataAccess.close().then(() => Promise.reject(error));
            });
        });
    }
    rollback(migrationId = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataAccess = yield this.getDataAccess();
            let migrated = yield dataAccess.getMigratedMigrations();
            let migrations = yield this.getMigrations();
            // Ensure the migrated results are sorted by migratedAt in ascending order.
            migrated = migrated.sort((a, b) => {
                return a.migratedAt.getTime() - b.migratedAt.getTime();
            });
            if (migrationId === null) {
                if (migrated.length === 0) {
                    migrations = [];
                }
                else {
                    const lastMigrated = migrated.slice(-1).pop();
                    const m = migrations.find(x => x.id === lastMigrated.id);
                    if (m) {
                        migrations = [m];
                    }
                    else {
                        throw new Error(`The last migrated migration [${lastMigrated.id}] cannot be found`);
                    }
                }
            }
            else if (migrationId !== '@all') {
                const m = migrations.find(x => x.id === migrationId);
                if (m) {
                    migrations = [m];
                }
                else {
                    throw new Error(`Migration [${migrationId}] not found`);
                }
            }
            migrations = migrations.filter(x => migrated.some(y => y.id === x.id));
            return migrations.reduce((p, m) => {
                return p.then(() => __awaiter(this, void 0, void 0, function* () {
                    this.emit('rollbacking', { migrationId: m.id });
                    yield dataAccess.rollback(m.id, q => m.down(q));
                    this.emit('rollback', { migrationId: m.id });
                }));
            }, Promise.resolve()).then(() => {
                return dataAccess.close();
            }, error => {
                return dataAccess.close().then(() => Promise.reject(error));
            });
        });
    }
}
exports.DefaultMigrator = DefaultMigrator;
