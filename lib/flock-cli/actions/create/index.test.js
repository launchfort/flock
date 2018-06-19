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
const FileSystem = require("fs");
const TestHelpers = require("../../../test-helpers");
const index_1 = require("./index");
describe('flock-cli/actions/create', function () {
    let dir = null;
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            dir = yield TestHelpers.tmpdir();
        });
    });
    afterEach(function () {
        return dir ? TestHelpers.rmdirp(dir) : null;
    });
    it('should create a migration file', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield index_1.create({
                migrationDir: dir,
                templateProvider: {
                    migrationTypes: ['-'],
                    provideFileName(migrationType) {
                        return Promise.resolve(Path.resolve(__dirname, '../../templates/default.ejs'));
                    }
                },
                migrationType: '-',
                tableName: '-',
                migrationName: 'create-something.js'
            });
            Assert.ok(FileSystem.existsSync(Path.join(dir, 'create-something.js')), 'Migration file was not created');
        });
    });
});
