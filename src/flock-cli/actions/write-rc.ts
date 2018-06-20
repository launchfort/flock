import * as FileSystem from 'fs'

/**
 * Used to generate an rc file. By default assumes app will use the flock-pg
 * plugin to talk with Postgres.
 */
export function writeRc ({ migrationDir, migrationTable, fileName }: { migrationDir: string, migrationTable: string, fileName: string }) {
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
