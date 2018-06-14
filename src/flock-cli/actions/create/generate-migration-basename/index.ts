import { formatDate } from './format-date'
import { zeroPad } from './zero-pad'
import { getMigrationsCount } from './get-migrations-count'

/**
   * Generates a new file basename for the next migration module.
   *
   * @param migrationType The migration type
   * @param tableName The table being migrated
   * @param migrationDir The migration directory
   */
export function generateMigrationBasename (migrationType: string, tableName: string = '', { migrationDir = 'migrations' } = {}) {
  const timecode = formatDate(new Date(), 'YYYY-MM-DD')
  return getMigrationsCount(migrationDir, { prefix: timecode }).then(count => {
    const countPadded = zeroPad(count + 1, 3)
    // If tableName is blank then we truncate the trailing '--'.
    return `${timecode}--${countPadded}--${migrationType}--${tableName}.js`.replace(/--$/, '')
  })
}
