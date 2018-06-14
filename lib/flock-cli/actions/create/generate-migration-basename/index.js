"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_date_1 = require("./format-date");
const zero_pad_1 = require("./zero-pad");
const get_migrations_count_1 = require("./get-migrations-count");
var MigrationType;
(function (MigrationType) {
    MigrationType["CREATE_TABLE"] = "create-table";
    MigrationType["ALTER_TABLE"] = "alter-table";
    MigrationType["OTHER"] = "other";
})(MigrationType = exports.MigrationType || (exports.MigrationType = {}));
/**
   * Generates a new file basename for the next migration module.
   *
   * @param migrationType The migration type
   * @param tableName The table being migrated
   * @param migrationDir The migration directory
   */
function generateMigrationBasename(migrationType, tableName = '', { migrationDir = 'migrations' } = {}) {
    if (!MigrationType[migrationType]) {
        throw Object.assign(new Error('Migration type invalid.'), { code: 'EINVALIDMIGRATIONTYPE' });
    }
    const timecode = format_date_1.formatDate(new Date(), 'YYYY-MM-DD');
    return get_migrations_count_1.getMigrationsCount(migrationDir, { prefix: timecode }).then(count => {
        const countPadded = zero_pad_1.zeroPad(count + 1, 3);
        // If tableName is blank then we truncate the trailing '--'.
        return `${timecode}--${countPadded}--${migrationType}--${tableName}.js`.replace(/--$/, '');
    });
}
exports.generateMigrationBasename = generateMigrationBasename;
