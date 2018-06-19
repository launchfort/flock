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
const Path = require("path");
const TestHelpers = require("../../../../test-helpers");
const get_migrations_count_1 = require("./get-migrations-count");
describe('generate-migration-basename/get-migrations-count', function () {
    let dir = '';
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            dir = yield TestHelpers.tmpdir();
            yield TestHelpers.touch(Path.join(dir, 'one.js'));
            yield TestHelpers.touch(Path.join(dir, 'two-1.js'));
            yield TestHelpers.touch(Path.join(dir, 'two-2.js'));
            yield TestHelpers.touch(Path.join(dir, 'two-3.js'));
            yield TestHelpers.touch(Path.join(dir, 'three.js'));
        });
    });
    after(function () {
        if (dir) {
            return TestHelpers.rmdirp(dir);
        }
    });
    it('should count the number of migration files', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield get_migrations_count_1.getMigrationsCount(dir);
            Assert.strictEqual(count, 5);
        });
    });
    it('should count the number of migration files with a prefix', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield get_migrations_count_1.getMigrationsCount(dir, { prefix: 'two-' });
            Assert.strictEqual(count, 3);
        });
    });
});
