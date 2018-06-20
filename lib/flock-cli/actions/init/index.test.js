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
const TestHelpers = require("../../../test-helpers");
const index_1 = require("./index");
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
describe('flock-cli/actions/init', function () {
    let dir = null;
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            dir = yield TestHelpers.tmpdir();
        });
    });
    afterEach(function () {
        return dir ? TestHelpers.rmdirp(dir) : null;
    });
    it('should create an rc file', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const rcFileName = Path.join(dir, 'flockrc-.js');
            yield index_1.init({ rcFileName });
            const rcExists = yield exists(rcFileName);
            Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`);
            const rcText = yield readFile(rcFileName);
            Assert.ok(rcText.indexOf(`const migrationTableName = 'migration'`) > 0);
            Assert.ok(rcText.indexOf(`const migrationDir = 'migrations'`) > 0);
        });
    });
    it('should reject if an rc file already exists', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const rcFileName = Path.join(dir, 'flockrc-.js');
            yield TestHelpers.touch(rcFileName);
            Assert.ok(FileSystem.existsSync(rcFileName), 'Rc file does not exist (not touched)');
            try {
                yield index_1.init({ rcFileName });
                throw new Error('Should reject if rc file exists');
            }
            catch (error) {
                Assert.strictEqual(error.code, 'RC_FILE_EXISTS');
            }
        });
    });
});
