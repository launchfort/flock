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
const Path = require("path");
const pg_1 = require("pg");
class TemplateProvider {
    constructor() {
        this.migrationTypes = ['create-table', 'alter-table', 'other'];
    }
    provideFileName(migrationType) {
        if (this.migrationTypes.indexOf(migrationType) >= 0) {
            return Promise.resolve(Path.join(__dirname, 'templates', migrationType + '.ejs'));
        }
        else {
            return Promise.reject(new Error(`Unsupported migration type [${migrationType}]`));
        }
    }
}
exports.TemplateProvider = TemplateProvider;
class DataAccessProvider {
    constructor({ migrationTableName = 'migration', acquireLock = true, connectionString = process.env.DATABASE_URL } = {}) {
        this.migrationTableName = migrationTableName;
        this.acquireLock = acquireLock;
        this.connectionString = connectionString;
    }
    provide() {
        return __awaiter(this, void 0, void 0, function* () {
            const lock = 5432;
            let locked = false;
            const client = new pg_1.Client({ connectionString: this.connectionString });
            if (this.acquireLock) {
                const advisoryLockResult = yield client.query(`SELECT pg_try_advisory_lock(${lock})`);
                locked = advisoryLockResult.rows[0].pg_try_advisory_lock === true;
                if (!locked) {
                    yield client.end();
                    throw new Error(`Advisory lock "${lock}" could not be acquired.`);
                }
            }
            return new PgDataAccess(client, this.migrationTableName, { lock: locked ? lock : NaN });
        });
    }
}
exports.DataAccessProvider = DataAccessProvider;
class PgDataAccess {
    constructor(client, migrationTableName, { lock = NaN } = {}) {
        this.client = client;
        this.qi = new PgQueryInterface(client);
        this.migrationTableName = migrationTableName;
        this.lock = lock;
    }
    getMigratedMigrations() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.qi.query({
                text: `SELECT id, created_at FROM "${this.migrationTableName}"`
            });
            return (result.rows || []).map(x => {
                return { id: x.id, migratedAt: x.created_at };
            });
        });
    }
    migrate(migrationId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasMigrated = yield this.hasMigrated(migrationId);
            if (hasMigrated) {
                return;
            }
            yield this.qi.query({ text: 'BEGIN' });
            try {
                yield this.qi.query({
                    text: `CREATE TABLE IF NOT EXISTS "${this.migrationTableName}" (
            id varchar(512),
            created_at timestamp DEFAULT current_timestamp,
            PRIMARY KEY(id)
          )`
                });
                yield action(this.qi);
                yield this.qi.query({
                    text: `INSERT INTO "${this.migrationTableName}" (id) VALUES($1)`,
                    values: [migrationId]
                });
                yield this.qi.query({ text: 'COMMIT' });
            }
            catch (error) {
                yield this.qi.query({ text: 'ROLLBACK' });
                throw error;
            }
        });
    }
    rollback(migrationId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const migrationTableExists = yield this.qi.tableExists(this.migrationTableName);
            if (!migrationTableExists) {
                return;
            }
            const hasMigrated = yield this.hasMigrated(migrationId);
            if (!hasMigrated) {
                return;
            }
            yield this.qi.query({ text: 'BEGIN' });
            try {
                yield action(this.qi);
                yield this.qi.query({
                    text: `DELETE FROM "${this.migrationTableName}" WHERE id = $1`,
                    values: [migrationId]
                });
                yield this.qi.query({ text: 'COMMIT' });
            }
            catch (error) {
                yield this.qi.query({ text: 'ROLLBACK' });
                throw error;
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!isNaN(this.lock) && this.lock !== null) {
                yield this.qi.query({ text: `SELECT pg_advisory_unlock(${this.lock})` });
            }
            return this.client.end();
        });
    }
    hasMigrated(migrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.qi.query({
                text: `SELECT id FROM "${this.migrationTableName}" WHERE id = $1`,
                values: [migrationId]
            });
            return result.rowCount === 1;
        });
    }
}
exports.PgDataAccess = PgDataAccess;
class PgQueryInterface {
    constructor(client) {
        this.client = client;
    }
    query(queryObject) {
        return this.client.query(queryObject);
    }
    tableExists(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            // ANSI SQL compliant query. This should work for all RDMS.
            // NOTE: use schema_name() for MSSQL
            const result = yield this.query({
                text: `SELECT table_name
        FROM   information_schema.tables
        WHERE  table_name = $1
        AND table_schema = current_schema()
        `,
                values: [tableName]
            });
            return result.rowCount === 1;
        });
    }
    columnExists(tableName, columnName) {
        return __awaiter(this, void 0, void 0, function* () {
            // ANSI SQL compliant query. This should work for all RDMS.
            // NOTE: use schema_name() for MSSQL
            const result = yield this.query({
                text: `SELECT column_name
        FROM information_schema.columns
        WHERE table_name=$1
        and column_name=$2
        and table_schema = current_schema()`,
                values: [tableName, columnName]
            });
            return result.rowCount === 1;
        });
    }
    columnDataType(tableName, columnName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.inspectColumn(tableName, columnName).then(col => {
                return col ? col.data_type : null;
            });
        });
    }
    inspectColumn(tableName, columnName) {
        return __awaiter(this, void 0, void 0, function* () {
            // ANSI SQL compliant query. This should work for all RDMS.
            // NOTE: use schema_name() for MSSQL
            const result = yield this.query({
                text: `SELECT *
        FROM   information_schema.columns
        WHERE  table_name = $1
        AND table_schema = current_schema()
        AND column_name = $2`,
                values: [tableName, columnName]
            });
            return result.rowCount === 1 ? result.rows[0] : null;
        });
    }
}
exports.PgQueryInterface = PgQueryInterface;
