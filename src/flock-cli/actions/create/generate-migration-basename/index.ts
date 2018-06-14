import { formatDate } from './format-date'
import { zeroPad } from './zero-pad'
import { getMigrationsCount } from './get-migrations-count'

export enum MigrationType {
  CREATE_TABLE = 'create-table',
  ALTER_TABLE = 'alter-table',
  OTHER = 'other'
}

/**
   * Generates a new file basename for the next migration module.
   *
   * @param migrationType The migration type
   * @param tableName The table being migrated
   * @param migrationDir The migration directory
   */
export function generateMigrationBasename (migrationType: MigrationType, tableName: string = '', { migrationDir = 'migrations' } = {}) {
  if (!MigrationType[migrationType]) {
    throw Object.assign(new Error('Migration type invalid.'), { code: 'EINVALIDMIGRATIONTYPE' })
  }

  const timecode = formatDate(new Date(), 'YYYY-MM-DD')
  return getMigrationsCount(migrationDir, { prefix: timecode }).then(count => {
    const countPadded = zeroPad(count + 1, 3)
    // If tableName is blank then we truncate the trailing '--'.
    return `${timecode}--${countPadded}--${migrationType}--${tableName}.js`.replace(/--$/, '')
  })
}
