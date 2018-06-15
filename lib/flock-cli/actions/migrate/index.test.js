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
const TestHelpers = require("test-helpers");
const index_1 = require("./index");
describe('flock-cli/actions/migrate', function () {
    it('should call migrate', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const mockMigrator = new TestHelpers.MockMigrator();
            yield index_1.migrate({
                showList: false,
                migrationId: 'one',
                migrator: mockMigrator
            });
            Assert.strictEqual(mockMigrator.rollback['calls'].length, 0);
            Assert.strictEqual(mockMigrator.migrate['calls'].length, 1);
            Assert.deepStrictEqual(mockMigrator.migrate['calls'][0].args, ['one']);
        });
    });
});
