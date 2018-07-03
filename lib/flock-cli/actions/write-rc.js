"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileSystem = require("fs");
/**
 * Used to generate an rc file. By default assumes app will use the flock-pg
 * plugin to talk with Postgres.
 */
function writeRc({ migrationDir, migrationTable, fileName }) {
    const text = `const { DefaultMigrator, NodeModuleMigrationProvider } = require('@gradealabs/flock')
const { DataAccessProvider, TemplateProvider } = require('@gradealabs/flock-pg')

const migrationDir = '${migrationDir}'
const migrationTableName = '${migrationTable}'
const dap = new DataAccessProvider({ migrationTableName })
const mp = new NodeModuleMigrationProvider(migrationDir)

exports.migrator = new DefaultMigrator(mp, dap)
exports.migrationDir = migrationDir
exports.templateProvider = new TemplateProvider()

`;
    return new Promise((resolve, reject) => {
        FileSystem.writeFile(fileName, text, { encoding: 'utf8' }, error => {
            error ? reject(error) : resolve();
        });
    });
}
exports.writeRc = writeRc;
