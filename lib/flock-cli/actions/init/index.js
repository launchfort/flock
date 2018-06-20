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
const FileSystem = require("fs");
const write_rc_1 = require("../write-rc");
function init({ rcFileName = '.flockrc.js' } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let migrationDir = 'migrations';
        let migrationTable = 'migration';
        if (FileSystem.existsSync(rcFileName)) {
            return Promise.reject(Object.assign(new Error(`Rc file ${rcFileName} already exists`), { code: 'RC_FILE_EXISTS' }));
        }
        return write_rc_1.writeRc({
            migrationDir,
            migrationTable,
            fileName: rcFileName
        });
    });
}
exports.init = init;
