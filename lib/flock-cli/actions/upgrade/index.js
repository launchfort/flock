"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileSystem = require("fs");
const Path = require("path");
function upgrade({ yoRcFileName = '.yo-rc.json', cfgFileName = '.flockrc.json', rcFileName = 'flockrc.js' } = {}) {
    let migrationDir = '';
    let migrationTable = '';
    if (!FileSystem.existsSync(rcFileName)) {
        // Upgrade from 2.x to 3.x
        if (FileSystem.existsSync(cfgFileName)) {
            const cfg = require(Path.resolve(cfgFileName));
            migrationDir = cfg.migrationDir || 'migrations';
            migrationTable = cfg.migrationTable || 'migration';
            // Upgrade from 1.x to 3.x
        }
        else if (FileSystem.existsSync(yoRcFileName)) {
            const yorc = require(Path.resolve(yoRcFileName));
            const { flock: { promptValues = {} } } = yorc;
            migrationDir = promptValues.migrationDir || 'migrations';
            migrationTable = promptValues.migrationTable || 'migration';
            // Upgrade from 0.x to 3.x (assume project was using flock in the early form)
        }
        else {
            migrationDir = 'migrations';
            migrationTable = 'migrations';
        }
    }
    return writeRc({
        migrationDir,
        migrationTable,
        fileName: rcFileName
    });
}
exports.upgrade = upgrade;
function writeRc({ migrationDir, migrationTable, fileName }) {
    const text = `const { Migrator, NodeModuleMigrationProvider } = require('@gradealabs/flock')
const { DataAccessProvider, TemplateProvider } = require('@gradealabs/flock-pg')

const migrationDir = '${migrationDir}'
const migrationTableName = '${migrationTable}'
const dap = new DataAccessProvider({ migrationTableName })
const mp = new NodeModuleMigrationProvider({ migrationDir })

exports.migrator = new Migrator(mp, dap)
exports.migrationDir = migrationDir
exports.templateProvider = new TemplateProvider()

`;
    return new Promise((resolve, reject) => {
        FileSystem.writeFile(fileName, text, { encoding: 'utf8' }, error => {
            error ? reject(error) : resolve();
        });
    });
}
