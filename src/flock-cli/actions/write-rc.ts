import * as FileSystem from 'fs'

/**
 * Used to generate an rc file. By default assumes app will use the flock-pg
 * plugin to talk with Postgres.
 */
export function writeRc ({ migrationDir, migrationTable, fileName }: { migrationDir: string, migrationTable: string, fileName: string }) {
  const text =
`const { DefaultMigrator, NodeModuleMigrationProvider } = require('@gradealabs/flock')
const { DataAccessProvider, TemplateProvider } = require('@gradealabs/flock-pg')

// Optionally we can run our seed automatically when there are schema changes.
// class MyMigrator extends DefaultMigrator {
//   async migrate (migrationId: string = null) {
//     const { schemaHasChanged } = await super.migrate(migrationId)
//     // When migrating all migrations and there are schema changes then we seed
//     // automatically.
//     if (migrationId === null && schemaHasChanged) {
//       await this.seed()
//     }
//
//     return { schemaHasChanged }
//   }
// }

const migrationDir = '${migrationDir}'
const migrationTableName = '${migrationTable}'
const dap = new DataAccessProvider({ migrationTableName })
const mp = new NodeModuleMigrationProvider(migrationDir)
const seed = null
// Optionally specify your seed that initializes the database with data.
// const seed = {
//   run (q: QueryInterface) {
//     // TODO: Seed the DB with data.
//     return Promise.resolve()
//   }
// }

exports.migrator = new DefaultMigrator(mp, dap, seed)
exports.migrationDir = migrationDir
exports.templateProvider = new TemplateProvider()

`

  return new Promise<void>((resolve, reject) => {
    FileSystem.writeFile(fileName, text, { encoding: 'utf8' }, error => {
      error ? reject(error) : resolve()
    })
  })
}
