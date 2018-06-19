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
const Assert = require("assert");
const TestHelpers = require("./test-helpers");
const index_1 = require("./index");
// Mock Objects
class MockDataAccessProvider {
    constructor(da) {
        this.da = da;
    }
    provide() {
        return Promise.resolve(this.da);
    }
}
class MockDataAccess {
    constructor(migratedMigrations = []) {
        this.migratedMigrations = migratedMigrations;
        this.migrate = TestHelpers.spy(this.migrate);
        this.rollback = TestHelpers.spy(this.rollback);
        this.close = TestHelpers.spy(this.close);
    }
    getMigratedMigrations() {
        return Promise.resolve(this.migratedMigrations.slice());
    }
    migrate(migrationId, action) {
        return Promise.resolve();
    }
    rollback(migrationId, action) {
        return Promise.resolve();
    }
    close() {
        return Promise.resolve();
    }
}
class MockMigrationProvider {
    constructor(migrations = []) {
        this.migrations = migrations;
    }
    provide() {
        return Promise.resolve(this.migrations.slice());
    }
}
class MockMigration {
    constructor(id) {
        this.id = id;
        this.up = TestHelpers.spy(this.up);
        this.down = TestHelpers.spy(this.down);
    }
    up(q) {
        return Promise.resolve();
    }
    down(q) {
        return Promise.resolve();
    }
}
// Tests
describe('flock#DefaultMigrator', function () {
    describe('#getMigrationState', function () {
        const migrations = [
            new MockMigration('one'),
            new MockMigration('two'),
            new MockMigration('three')
        ];
        const migratedMigrations = [
            { id: 'two', migratedAt: new Date() },
            { id: 'three', migratedAt: new Date() }
        ];
        let da = null;
        let migrator = null;
        beforeEach(function () {
            da = new MockDataAccess(migratedMigrations);
            const dap = new MockDataAccessProvider(da);
            const mp = new MockMigrationProvider(migrations);
            migrator = new index_1.DefaultMigrator(mp, dap);
        });
        it('should resolve to a list of migration states', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const states = yield migrator.getMigrationState();
                Assert.deepStrictEqual(states, [
                    { id: 'one', migrated: false, migratedAt: null },
                    { id: 'two', migrated: true, migratedAt: migratedMigrations[0].migratedAt },
                    { id: 'three', migrated: true, migratedAt: migratedMigrations[1].migratedAt }
                ]);
                Assert.strictEqual(da.close['calls'].length, 1);
            });
        });
    });
    describe('#migrate', function () {
        const migrations = [
            new MockMigration('one'),
            new MockMigration('two'),
            new MockMigration('three'),
            new MockMigration('four'),
            new MockMigration('five')
        ];
        const migratedMigrations = [
            { id: 'one', migratedAt: new Date() },
            { id: 'two', migratedAt: new Date() }
        ];
        let da = null;
        let migrator = null;
        beforeEach(function () {
            da = new MockDataAccess(migratedMigrations);
            const dap = new MockDataAccessProvider(da);
            const mp = new MockMigrationProvider(migrations);
            migrator = new index_1.DefaultMigrator(mp, dap);
        });
        it('should throw when migrating a migration that does not exist', function () {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield migrator.migrate('nope');
                }
                catch (_) {
                    return;
                }
                Assert.fail('No error thrown');
            });
        });
        it('should migrate all migrations after the last migration that has not been migrated', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield migrator.migrate();
                Assert.deepStrictEqual(da.migrate['calls'].length, 3);
                Assert.deepStrictEqual(da.migrate['calls'].map(x => x.args[0]), ['three', 'four', 'five']);
                Assert.strictEqual(da.close['calls'].length, 1);
            });
        });
        it('should migrate all migrations up to the migration specified', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield migrator.migrate('three');
                Assert.deepStrictEqual(da.migrate['calls'].length, 1);
                Assert.deepStrictEqual(da.migrate['calls'].map(x => x.args[0]), ['three']);
                Assert.strictEqual(da.close['calls'].length, 1);
            });
        });
    });
    describe('#rollback', function () {
        const migrations = [
            new MockMigration('one'),
            new MockMigration('two'),
            new MockMigration('three'),
            new MockMigration('four'),
            new MockMigration('five')
        ];
        const migratedMigrations = [
            { id: 'one', migratedAt: new Date() },
            { id: 'two', migratedAt: new Date() },
            { id: 'three', migratedAt: new Date() }
        ];
        let da = null;
        let migrator = null;
        beforeEach(function () {
            da = new MockDataAccess(migratedMigrations);
            const dap = new MockDataAccessProvider(da);
            const mp = new MockMigrationProvider(migrations);
            migrator = new index_1.DefaultMigrator(mp, dap);
        });
        it('should throw when migrating a migration that does not exist', function () {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield migrator.rollback('nope');
                }
                catch (_) {
                    return;
                }
                Assert.fail('No error thrown');
            });
        });
        it('should rollback the last migrated migration', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield migrator.rollback();
                Assert.deepStrictEqual(da.rollback['calls'].length, 1);
                Assert.deepStrictEqual(da.rollback['calls'].map(x => x.args[0]), ['three']);
                Assert.strictEqual(da.close['calls'].length, 1);
            });
        });
        it('should rollback the specified migration (if migrated already)', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield migrator.rollback('two');
                Assert.deepStrictEqual(da.rollback['calls'].length, 1);
                Assert.deepStrictEqual(da.rollback['calls'].map(x => x.args[0]), ['two']);
                Assert.strictEqual(da.close['calls'].length, 1);
                yield migrator.rollback('four');
                Assert.deepStrictEqual(da.rollback['calls'].length, 1);
                Assert.deepStrictEqual(da.rollback['calls'].map(x => x.args[0]), ['two']);
                Assert.strictEqual(da.close['calls'].length, 2);
            });
        });
        it('should rollback all migrated migrations when passed "@all"', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield migrator.rollback('@all');
                Assert.deepStrictEqual(da.rollback['calls'].length, 3);
                Assert.deepStrictEqual(da.rollback['calls'].map(x => x.args[0]), ['one', 'two', 'three']);
                Assert.strictEqual(da.close['calls'].length, 1);
            });
        });
    });
});
