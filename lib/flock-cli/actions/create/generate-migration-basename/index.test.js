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
const TestHelpers = require("test-helpers");
const index_1 = require("./index");
describe('generate-migration-basename', function () {
    let dir = '';
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            dir = yield TestHelpers.tmpdir();
            yield TestHelpers.touch(Path.join(dir, '2018-01-02--001--create-model--pizza.js'));
            yield TestHelpers.touch(Path.join(dir, '2018-01-02--002--create-model--pizza.js'));
        });
    });
    after(function () {
        if (dir) {
            return TestHelpers.rmdirp(dir);
        }
    });
    it('should generate a new migration basename', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const basename = yield index_1.generateMigrationBasename('create-model', 'user', { migrationDir: dir, date: new Date(2018, 0, 1) });
            Assert.strictEqual(basename, '2018-01-01--001--create-model--user.js');
        });
    });
    it('should generate a migration basename that is next in a sequence', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const basename = yield index_1.generateMigrationBasename('create-model', 'user', { migrationDir: dir, date: new Date(2018, 0, 2) });
            Assert.strictEqual(basename, '2018-01-02--003--create-model--user.js');
        });
    });
});
