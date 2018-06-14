export interface MigrationProvider {
  provide (): Promise<Migration[]>
}

export interface Migration {
  id: string
  up (queryInterface: QueryInterface): Promise<void>
  down (queryInterface: QueryInterface): Promise<void>
}

export interface DataAccessProvider {
  provide (): Promise<DataAccess>
}

export interface DataAccess {
  getMigratedMigrations (): Promise<{ id: string, migratedAt: Date }[]>
  migrate (migrationId: string, action: (queryInterface: QueryInterface) => Promise<void>): Promise<void>
  rollback (migrationId: string, action: (queryInterface: QueryInterface) => Promise<void>): Promise<void>
  close (): Promise<void>
}

export interface QueryInterface {
  query (queryObject: any): Promise<QueryResult>
  tableExists (tableName: string): Promise<boolean>
  columnExists (tableName: string, columnName: string): Promise<boolean>
}

export interface QueryResult {
  rowCount: number
  rows: { [col: string]: any }[]
}

export class Migrator {
  getMigrations: () => Promise<Migration[]>
  getDataAccess: () => Promise<DataAccess>

  constructor (migrationProvider: MigrationProvider, dataAccessProvider: DataAccessProvider) {
    this.getMigrations = () => migrationProvider.provide()
    this.getDataAccess = () => dataAccessProvider.provide()
  }

  async getMigrationState () {
    // Get migrations on disk
    const migrations = await this.getMigrations()
    // Get all migrations that have a record in the DB (i.e. have been migrated)
    const dataAccess = await this.getDataAccess()
    const migratedMigrations = await dataAccess.getMigratedMigrations()

    // Map over all migrations and return a state object for each
    return migrations.map(x => {
      const m = migratedMigrations.find(y => y.id === x.id)
      return {
        id: x.id,
        migrated: !!m,
        migratedAt: m ? m.migratedAt : null
      }
    })
  }

  async migrate (migrationId: string = null): Promise<void> {
    const dataAccess = await this.getDataAccess()
    const migrated = await dataAccess.getMigratedMigrations()
    let migrations = await this.getMigrations()

    if (migrationId !== null) {
      const k = migrations.findIndex(x => x.id === migrationId)
      if (k >= 0) {
        migrations = migrations.slice(0, k + 1)
      } else {
        throw new Error(`Migration ${migrationId} not found`)
      }
    }

    migrations = migrations.filter(x => !migrated.some(y => y.id === x.id))

    return migrations.reduce((p, m) => {
      return p.then(async () => {
        return dataAccess.migrate(m.id, q => m.up(q))
      })
    }, Promise.resolve()).then(() => {
      return dataAccess.close()
    }, error => {
      return dataAccess.close().then(() => Promise.reject(error))
    })
  }

  async rollback (migrationId: string = null): Promise<void> {
    const dataAccess = await this.getDataAccess()
    let migrated = await dataAccess.getMigratedMigrations()
    let migrations = []

    // Ensure the migrated results are sorted by migratedAt in ascending order.
    migrated = migrated.sort((a, b) => {
      return a.migratedAt.getTime() - b.migratedAt.getTime()
    })

    if (migrationId === null) {
      if (migrated.length === 0) {
        migrations = []
      } else {
        const lastMigrated = migrated.slice(-1).pop()
        const m = migrations.find(x => x.id === lastMigrated.id)
        if (m) {
          migrations = [ m ]
        } else {
          throw new Error(`The last migrated migration ${lastMigrated.id} cannot be found`)
        }
      }
    } else if (migrationId !== '@all') {
      migrations = await this.getMigrations()
      const m = migrations.find(x => x.id === migrationId)
      if (m) {
        migrations = [ m ]
      } else {
        throw new Error(`Migration ${migrationId} not found`)
      }
    }

    migrations = migrations.filter(x => migrated.some(y => y.id === x.id))

    return migrations.reduce((p, m) => {
      return p.then(async () => {
        return dataAccess.rollback(m.id, q => m.down(q))
      })
    }, Promise.resolve()).then(() => {
      return dataAccess.close()
    }, error => {
      return dataAccess.close().then(() => Promise.reject(error))
    })
  }
}

// // flockrc.js
// const { Migrator, NodeModuleMigrationProvider } = require('@gradealabs/flock')
// const { DataAccessProvider } = require('@gradealabs/flock-pg')
//
// const migrationDir = 'migrations'
// const migrationTableName = 'migration'
// const acquireLock = true
// const dap = new DataAccessProvider({ migrationTableName, acquireLock })
// const mp = new NodeModuleMigrationProvider({ migrationDir })
//
// exports.migrator = new Migrator(mp, dap)
// exports.migrationDir = migrationDir
