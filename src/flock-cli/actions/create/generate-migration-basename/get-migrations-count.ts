import * as FileSystem from 'fs'

/**
 * Count the number of migrations that have been created in the migrations
 * directory. If the prefix is specified then counts the number of migrations
 * that start with the prefix. If migrationDir is falsey or the directory it
 * refers to does not exist then resolves to 0.
 *
 * @example getMigrationsCount('migrations').then(count => ...)
 * @example getMigrationsCount('migrations', { prefix: '2018-01-05' }).then(count => ...)
 * @param migrationDir The migration directory
 * @param prefix The optional migration file prefix
 */
export function getMigrationsCount (migrationDir: string, { prefix = null } = {}) {
  if (migrationDir) {
    return new Promise<string[]>((resolve, reject) => {
      FileSystem.readdir(migrationDir, (error, files) => {
        error ? reject(error) : resolve(files)
      })
    }).then(files => {
      return files.filter(x => prefix ? x.startsWith(prefix) : true).length
    }).catch(error => {
      if (error.code === 'ENOENT') {
        return 0
      } else {
        throw error
      }
    })
  } else {
    return Promise.resolve(0)
  }
}
