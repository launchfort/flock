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
      enumerateBultInDriverModules(),
      enumerateInstalledDriverModules()
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
  generateMigrationBasename (migrationType, tableName, { migrationDir = 'migrations' } = {}) {
    if (!MigrationTypeEnum[migrationType]) {
      throw Object.assign(new Error('Migration type invalid.'), { code: 'EINVALIDMIGRATIONTYPE' })
    }

    const timecode = formatDate(new Date())
    return getMigrationsCount(migrationDir, timecode).then(count => {
      count = zeroPad(count + 1, 3)
      // If tableName is blank then we truncate the trailing '--'.
      return `${timecode}--${count}--${migrationType}--${tableName}.js`.replace(/--$/, '')
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

    let driverDir = ''

    if (driverModuleId.startsWith('flock:')) {
      driverModuleId = driverModuleId.replace('flock:', '')
      driverDir = path.resolve(__dirname, '../..', driverModuleId)
    } else {
      driverDir = path.dirname(require.resolve(driverModuleId))
    }

    const templateFileName = `${driverDir}/templates/${migrationType}.ejs`

    if (fs.existsSync(templateFileName)) {
      return templateFileName
    } else {
      throw Object.assign(
        new Error(`Template ${migrationType}.ejs not found.`),
        { code: 'ENOENT' }
      )
    }
  }

  /**
   * Creates a new Migrator instance using the specified driver module ID to
   * instantiate the migrator.
   *
   * @param {string} driverModuleId The module ID of the database driver
   * @param {{ migrationDir?:string, migrationTable?:string }} options
   * @return {Promise<Migrator>}
   */
  createMigrator (driverModuleId, { migrationDir = 'migrations', migrationTable = 'migration' } = {}) {
    let createMigrator = null

    if (driverModuleId.startsWith('flock:')) {
      driverModuleId = driverModuleId.replace('flock:', '')
      ;({ createMigrator } = require(
        path.resolve(__dirname, '../..', driverModuleId)) || {})
    } else {
      ({ createMigrator } = require(driverModuleId) || {})
    }

    if (typeof createMigrator === 'function') {
      return createMigrator({ migrationDir, migrationTable })
    } else {
      throw new Error(`Database driver ${driverModuleId} has no createMigrator function.`)
    }
  }
}

exports.Environment = Environment

// Enumerate database drivers in the node_modules directory.
function enumerateInstalledDriverModules () {
  return enumerateDriverModules('node_modules').then(x => {
    return x.map(y => {
      return {
        name: y.name,
        description: y.description,
        id: y.name
      }
    })
  })
}

// Enumerate database drivers in the lib/drivers directory.
function enumerateBultInDriverModules () {
  return enumerateDriverModules(path.resolve(__dirname, '../drivers')).then(x => {
    return x.map(y => {
      return {
        name: y.name,
        description: y.description,
        // Start the driver module ID with 'flock:' to indicate it's relative to the
        // project root.
        id: 'flock:' + path.relative(path.join(__dirname, '../..'), y.path)
      }
    })
  })
}

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
          path: x
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
      return files.filter(x => prefix ? x.startsWith(prefix) : true).length
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

function formatDate (d, format = 'YYYY-MM-DD') {
  return format.replace(/YYYY/g, (_) => {
    return d.getFullYear()
  }).replace(/DD/g, (_) => {
    return zeroPad(d.getDate(), 2)
  }).replace(/MM/g, (_) => {
    return zeroPad(d.getMonth() + 1, 2)
  })
}

function zeroPad (n, miniumumDigits = 1) {
  n = parseInt(n, 10)
  const x = Math.pow(10, miniumumDigits || 1)

  if (n < x) {
    const s = Math.abs(n).toString().split('')
    let digits = []

    while (digits.length < miniumumDigits) {
      digits.push(s.pop() || 0)
    }

    return (n < 0 ? '-' : '') + digits.reverse().join('')
  } else {
    return x.toString()
  }
}