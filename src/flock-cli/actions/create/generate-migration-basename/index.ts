import { formatDate, zeroPad } from '../../../../formatting'
import { getMigrationsCount } from './get-migrations-count'

/**
   * Generates a new file basename for the next migration module.
   *
   * @param migrationType The migration type
   * @param tableName The table being migrated
   * @param migrationDir The migration directory
   * @param date The optional date to use in the basename (optional)
   */
export function generateMigrationBasename (migrationType: string, tableName: string = '', { migrationDir = 'migrations', date = new Date() } = {}) {
  const timecode = formatDate(date, 'YYYY-MM-DD')
  return getMigrationsCount(migrationDir, { prefix: timecode }).then(count => {
    const countPadded = zeroPad(count + 1, 3)
    // If tableName is blank then we truncate the trailing '--'.
    return `${timecode}--${countPadded}--${migrationType}--${tableName}.js`.replace(/--$/, '')
  })
}
