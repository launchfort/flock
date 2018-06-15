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
const util_1 = require("util");
const TestHelpers = require("test-helpers");
const index_1 = require("./index");
const writeFile = util_1.promisify(FileSystem.writeFile);
const readFile = util_1.promisify(FileSystem.readFile);
const stat = util_1.promisify(FileSystem.stat);
const exists = fileName => stat(fileName).then(() => true).catch(error => {
    if (error.code === 'ENOENT') {
        return false;
    }
    else {
        throw error;
    }
});
describe('flock-cli/actions/upgrade', function () {
    let dir = null;
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            dir = yield TestHelpers.tmpdir();
        });
    });
    afterEach(function () {
        return dir ? TestHelpers.rmdirp(dir) : null;
    });
    it('should upgrade a project that used version 0.x', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const rcFileName = Path.join(dir, 'flockrc-.js');
            yield index_1.upgrade({ rcFileName });
            const rcExists = yield exists(rcFileName);
            Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`);
            const rcText = yield readFile(rcFileName);
            Assert.ok(rcText.indexOf(`const migrationTableName = 'migrations'`) > 0);
            Assert.ok(rcText.indexOf(`const migrationDir = 'migrations'`) > 0);
        });
    });
    it('should upgrade a project that used version 1.x', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const rcFileName = Path.join(dir, 'flockrc-.js');
            const yoRcFileName = Path.join(dir, '.yo-rc.json');
            const yoRc = {
                flock: {
                    promptValues: {
                        driver: 'flock:lib/drivers/pg',
                        migrationDir: 'miggrationDir',
                        migrationTable: 'migrationTable'
                    }
                }
            };
            yield writeFile(yoRcFileName, JSON.stringify(yoRc), { encoding: 'utf8' });
            yield index_1.upgrade({ yoRcFileName, rcFileName });
            const yoRcExists = yield exists(yoRcFileName);
            Assert.notEqual(yoRcExists, '.yo-rc.json still exists');
            const rcExists = yield exists(rcFileName);
            Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`);
            const rcText = yield readFile(rcFileName);
            Assert.ok(rcText.indexOf(`const migrationTableName = '${yoRc.flock.promptValues.migrationTable}'`) > 0);
            Assert.ok(rcText.indexOf(`const migrationDir = '${yoRc.flock.promptValues.migrationDir}'`) > 0);
        });
    });
    it('should upgrade a project that used version 2.x', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const rcFileName = Path.join(dir, 'flockrc-.js');
            const cfgFileName = Path.join(dir, '.flockrc-.json');
            const cfg = {
                driver: 'flock:lib/drivers/pg',
                migrationDir: 'miggrationDir!!',
                migrationTable: 'migrationTable!!'
            };
            yield writeFile(cfgFileName, JSON.stringify(cfg), { encoding: 'utf8' });
            yield index_1.upgrade({ cfgFileName, rcFileName });
            const cfFileExists = yield exists(cfgFileName);
            Assert.notEqual(cfFileExists, `${Path.basename(cfgFileName)} still exists`);
            const rcExists = yield exists(rcFileName);
            Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`);
            const rcText = yield readFile(rcFileName);
            Assert.ok(rcText.indexOf(`const migrationTableName = '${cfg.migrationTable}'`) > 0);
            Assert.ok(rcText.indexOf(`const migrationDir = '${cfg.migrationDir}'`) > 0);
        });
    });
    it('should leave a project that used version 3.x unmodified', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const rcFileName = Path.join(dir, 'flockrc-.js');
            const rc = 'Hello World!';
            yield writeFile(rcFileName, rc, { encoding: 'utf8' });
            yield index_1.upgrade({ rcFileName });
            const rcExists = yield exists(rcFileName);
            Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`);
            const rcText = yield readFile(rcFileName);
            Assert.strictEqual(rc, 'Hello World!');
        });
    });
});
