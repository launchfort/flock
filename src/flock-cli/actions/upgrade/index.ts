import * as FileSystem from 'fs'
import * as Path from 'path'

export function upgrade ({ yoRcFileName = '.yo-rc.json', cfgFileName = '.flockrc.json', rcFileName = 'flockrc.js' } = {}) {
  let migrationDir = ''
  let migrationTable = ''

  if (!FileSystem.existsSync(rcFileName)) {
    // Upgrade from 2.x to 3.x
    if (FileSystem.existsSync(cfgFileName)) {
      const cfg = require(Path.resolve(cfgFileName))
      migrationDir = cfg.migrationDir || 'migrations'
      migrationTable = cfg.migrationTable || 'migration'
    // Upgrade from 1.x to 3.x
    } else if (FileSystem.existsSync(yoRcFileName)) {
      const yorc = require(Path.resolve(yoRcFileName))
      const { flock: { promptValues = {} } } = yorc
      migrationDir = promptValues.migrationDir || 'migrations'
      migrationTable = promptValues.migrationTable || 'migration'
    // Upgrade from 0.x to 3.x (assume project was using flock in the early form)
    } else {
      migrationDir = 'migrations'
      migrationTable = 'migrations'
    }
  }

  return writeRc({
    migrationDir,
    migrationTable,
    fileName: rcFileName
  })
}

function writeRc ({ migrationDir, migrationTable, fileName }: { migrationDir: string, migrationTable: string, fileName: string }) {
  const text =
`const { DefaultMigrator, NodeModuleMigrationProvider } = require('@gradealabs/flock')
const { DataAccessProvider, TemplateProvider } = require('@gradealabs/flock-pg')

const migrationDir = '${migrationDir}'
const migrationTableName = '${migrationTable}'
const dap = new DataAccessProvider({ migrationTableName })
const mp = new NodeModuleMigrationProvider({ migrationDir })

exports.migrator = new DefaultMigrator(mp, dap)
exports.migrationDir = migrationDir
exports.templateProvider = new TemplateProvider()

`

  return new Promise<void>((resolve, reject) => {
    FileSystem.writeFile(fileName, text, { encoding: 'utf8' }, error => {
      error ? reject(error) : resolve()
    })
  })
}

