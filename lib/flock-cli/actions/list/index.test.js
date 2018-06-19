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
const TestHelpers = require("../../../test-helpers");
const index_1 = require("./index");
describe('flock-cli/actions/list', function () {
    it('should list all migrations', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const mockMigrator = new TestHelpers.MockMigrator([
                { id: 'one', migrated: true, migratedAt: new Date(2018, 0, 1) },
                { id: 'two', migrated: true, migratedAt: new Date(2018, 0, 2) },
                { id: 'three', migrated: false, migratedAt: new Date(2018, 0, 3) },
                { id: 'four', migrated: false, migratedAt: new Date(2018, 0, 4) }
            ]);
            const log = TestHelpers.spy();
            yield index_1.list({
                migrator: mockMigrator,
                log
            });
            Assert.strictEqual(log.calls.length, 1);
            Assert.deepStrictEqual([].concat(...log.calls.map(x => x.args)), [
                'Migrations:', '\n', mockMigrator.migrationState.map(x => {
                    return {
                        value: x.id,
                        name: `${x.migrated ? '✓' : '✗'} ${x.id}`
                    };
                })
            ]);
        });
    });
});
