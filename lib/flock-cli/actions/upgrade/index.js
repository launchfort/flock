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
const Path = require("path");
const util_1 = require("util");
const write_rc_1 = require("../write-rc");
const unlink = util_1.promisify(FileSystem.unlink);
function upgrade({ yoRcFileName = '.yo-rc.json', cfgFileName = '.flockrc.json', rcFileName = 'flockrc.js' } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let migrationDir = '';
        let migrationTable = '';
        if (!FileSystem.existsSync(rcFileName)) {
            // Upgrade from 2.x to 3.x
            if (FileSystem.existsSync(cfgFileName)) {
                const cfg = require(Path.resolve(cfgFileName));
                migrationDir = cfg.migrationDir || 'migrations';
                migrationTable = cfg.migrationTable || 'migration';
                yield unlink(cfgFileName);
                // Upgrade from 1.x to 3.x
            }
            else if (FileSystem.existsSync(yoRcFileName)) {
                const yorc = require(Path.resolve(yoRcFileName));
                const { flock: { promptValues = {} } } = yorc;
                migrationDir = promptValues.migrationDir || 'migrations';
                migrationTable = promptValues.migrationTable || 'migration';
                yield unlink(yoRcFileName);
                // Upgrade from 0.x to 3.x (assume project was using flock in the early form)
            }
            else {
                // Version 0.x had migrationTable set to 'migrations'
                migrationDir = 'migrations';
                migrationTable = 'migrations';
            }
        }
        return write_rc_1.writeRc({
            migrationDir,
            migrationTable,
            fileName: rcFileName
        });
    });
}
exports.upgrade = upgrade;
