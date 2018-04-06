const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)

const MigrationTypeEnum = {
  'create-table': 'create-table',
  'alter-table': 'alter-table',
  'other': 'other'
}

class Environment {
  /**
   * Enumerate all installed database drivers as well as built-in drivers.
   * Installed drivers take precedence over the built-in drivers.
   *
   * @return {Promise<{ id:string, description:string, name:string }[]>}
   */
  enumerateDrivers () {
    return Promise.all([
      // Enumerate builtin database driver modules
      enumerateDriverModules(path.resolve(__dirname, '../drivers')),
      // Enumerate installed database driver modules
      enumerateDriverModules(path.resolve('node_modules'))
    ]).then(([ a, b ]) => {
      return [].concat(a, b)
    })
  }

  /**
   * Generates a new file basename for the next migration module.
   *
   * @param {'create-table'|'alter-table'|'other'} migrationType The migration type
   * @param {string} tableName The table being migrated
   * @param {{ migrationDir?:string }} options
   * @return {Promise<string>}
   */
  generateMigrationBasename (migrationType, tableName, { migrationDir = 'migrations' }) {
    if (!MigrationTypeEnum[migrationType]) {
      throw Object.assign(new Error('Migration type invalid.'), { code: 'EINVALIDMIGRATIONTYPE' })
    }

    const timecode = formatDate(new Date())
    return getMigrationsCount(migrationDir, timecode).then(count => {
      return `${timecode}-${count}-${migrationType}--${tableName}.js`
    })
  }

  /**
   * Retrieves the template file name that can be used to generate a new migration module.
   *
   * @param {'create-table'|'alter-table'|'other'} migrationType The migration type
   * @param {string} driverModuleId The module ID of the database driver
   */
  getTemplateFileName (migrationType, driverModuleId) {
    if (!MigrationTypeEnum[migrationType]) {
      throw Object.assign(new Error('Migration type invalid.'), { code: 'EINVALIDMIGRATIONTYPE' })
    }

    const driverDir = driverModuleId.endsWith('.js')
      ? path.dirname(driverModuleId)
      : driverModuleId

    return `${driverDir}/templates/${migrationType}.ejs`
  }

  /**
   * Creates a new Migrator instance using the specified driver module ID to
   * instantiate the migrator.
   *
   * @param {string} driverModuleId The module ID of the database driver
   * @param {{ migrationDir?:string, migrationTable?:string }} options
   * @return {Promise<Migrator>}
   */
  createMigrator (driverModuleId, { migrationDir = 'migrations', migrationTable = 'migration' }) {
    const { createMigrator } = require(driverModuleId) || {}
    if (typeof driver === 'function') {
      return createMigrator({ migrationDir, migrationTable })
    } else {
      throw new Error(`Database driver ${driverModuleId} has no createMigrator function.`)
    }
  }
}

exports.Environment = Environment

function enumerateDriverModules (dir) {
  return readdir(dir).then(dirs => {
    return dirs.map(x => {
      try {
        x = path.join(dir, x)
        const pkg = require(path.join(x, 'package.json'))
        const kw = [].concat(pkg.keywords).filter(Boolean)
        const o = {
          name: pkg.name,
          description: pkg.description,
          id: require.resolve(x)
        }
        return kw.includes('flock-driver') ? o : null
      } catch (_) {
        return null
      }
    }).filter(Boolean)
  }, error => {
    if (error.code === 'ENOENT') {
      return []
    } else {
      return Promise.reject(error)
    }
  })
}

function getMigrationsCount (migrationDir, prefix = null) {
  if (migrationDir) {
    return readdir(migrationDir).then(files => {
      return files.filter(x => prefix ? x.startsWith(prefix) : true)
    }, error => {
      if (error.code === 'ENOENT') {
        return 0
      } else {
        return Promise.reject(error)
      }
    })
  } else {
    return Promise.resolve(0)
  }
}

function formatDate (d, format = 'YYYY_MM_DD') {
  return format.replace(/YYYY/g, (_) => {
    return d.getFullYear()
  }).replace(/DD/g, (_) => {
    return zeroPad(d.getDate())
  }).replace(/MM/g, (_) => {
    return zeroPad(d.getMonth() + 1)
  })
}

function zeroPad (n, padding = 1) {
  n = parseFloat(n)
  const x = 10 * padding

  if (n < x) {
    return `0${n}`
  } else {
    return x.toString()
  }
}
