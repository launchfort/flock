import { EventEmitter } from 'events'
import { formatDate } from './formatting'

export { NodeModuleMigrationProvider } from './node-migration-provider'
export { TemplateProvider } from './flock-cli'

/** Provides Migration instances to a Migrator. */
export interface MigrationProvider {
  /** Scans the file system or creates adhoc migrations. */
  provide (): Promise<Migration[]>
}

/** The seed to initialize the database */
export interface Seed {
  run (queryInterface: QueryInterface): Promise<void>
}

export interface Migration {
  id: string
  up (queryInterface: QueryInterface): Promise<void>
  down (queryInterface: QueryInterface): Promise<void>
}

/** Provides DataAccess instances to a Migrator. */
export interface DataAccessProvider {
  /** Open a new database connection and provides a DataAccess instance. */
  provide (): Promise<DataAccess>
}

/**
 * Represents an open database connection.
 */
export interface DataAccess {
  /** Retrieve all migrations that have been migrated. */
  getMigratedMigrations (): Promise<{ id: string, migratedAt: Date }[]>
  /** Migrate the specified migration where action is the database queries to run. */
  migrate (migrationId: string, action: (queryInterface: QueryInterface) => Promise<void>): Promise<void>
  /** Rollback the specified migration where action is the database queries to run. */
  rollback (migrationId: string, action: (queryInterface: QueryInterface) => Promise<void>): Promise<void>
  /** Close the database connection. */
  close (): Promise<void>
}

/** Represents the interface migrations use to perform database queries. */
export interface QueryInterface {
  /** Make a database query. The signature of this function will be unique for each flock plugin. */
  query (queryObject: any): Promise<QueryResult>
  tableExists (tableName: string): Promise<boolean>
  columnExists (tableName: string, columnName: string): Promise<boolean>
  columnDataType (tableName: string, columnName: string): Promise<string|null>
}

export interface QueryResult {
  rowCount: number
  rows: { [col: string]: any }[]
}

export interface Migrator {
  /**
   * Retrieve the state for each migration.
   */
  getMigrationState (): Promise<MigrationState[]>
  /**
   * Migrates all migrations before and including the specified migration ID
   * that have not been migrated yet. If no migration ID is specified then
   * migrates all migrations.
   *
   * @param migrationId The migration to migrate down to
   */
  migrate (migrationId?: string): Promise<{ schemaHasChanged: boolean }>
  /**
   * Rolls back the last migrated migration. If a migration ID is specified then
   * rolls back only the migration. If migration ID is '@all' then rolls back
   * all migrated migrations.
   *
   * @param migrationId The migration to rollback or '@all' to rollback all migrated migrations
   */
  rollback (migrationId?: string): Promise<void>
  /**
   * Runs a seed that will initialize the database with data.
   */
  seed (): Promise<void>
  /** EventEmitter API */
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this;
  removeAllListeners(event?: string | symbol): this;
  setMaxListeners(n: number): this;
  getMaxListeners(): number;
  listeners(event: string | symbol): Function[];
  rawListeners(event: string | symbol): Function[];
  emit(event: string | symbol, ...args: any[]): boolean;
  eventNames(): Array<string | symbol>;
  listenerCount(type: string | symbol): number;
}

export interface MigrationState {
  id: string
  migrated: boolean
  migratedAt?: Date
}

export class DefaultMigrator extends EventEmitter implements Migrator {
  private seeder: Seed = null
  getMigrations: () => Promise<Migration[]>
  getDataAccess: () => Promise<DataAccess>

  constructor (migrationProvider: MigrationProvider, dataAccessProvider: DataAccessProvider, seed?: Seed) {
    super()
    this.seeder = seed
    this.getMigrations = () => migrationProvider.provide()
    this.getDataAccess = () => dataAccessProvider.provide()
  }

  async getMigrationState (): Promise<MigrationState[]> {
    // Get migrations on disk
    const migrations = await this.getMigrations()
    // Get all migrations that have a record in the DB (i.e. have been migrated)
    const dataAccess = await this.getDataAccess()
    const migratedMigrations = await dataAccess.getMigratedMigrations()
    await dataAccess.close()

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

  async migrate (migrationId: string = null): Promise<{ schemaHasChanged: boolean }> {
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
    const schemaHasChanged = migrations.length > 0

    return migrations.reduce((p, m) => {
      return p.then(async () => {
        this.emit('migrating', { migrationId: m.id })
        await dataAccess.migrate(m.id, q => m.up(q))
        this.emit('migrate', { migrationId: m.id })
      })
    }, Promise.resolve()).then(() => {
      return dataAccess.close().then(() => {
        return { schemaHasChanged }
      })
    }, error => {
      return dataAccess.close().then(() => Promise.reject(error))
    })
  }

  async rollback (migrationId: string = null): Promise<void> {
    const dataAccess = await this.getDataAccess()
    let migrated = await dataAccess.getMigratedMigrations()
    let migrations = await this.getMigrations()

    // Ensure the migrated results are sorted by migratedAt in ascending order.
    migrated.sort((a, b) => {
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
          throw new Error(`The last migrated migration [${lastMigrated.id}] cannot be found`)
        }
      }
    } else if (migrationId !== '@all') {
      const m = migrations.find(x => x.id === migrationId)
      if (m) {
        migrations = [ m ]
      } else {
        throw new Error(`Migration [${migrationId}] not found`)
      }
    }

    migrations = migrations.filter(x => migrated.some(y => y.id === x.id))

    return migrations.reduce((p, m) => {
      return p.then(async () => {
        this.emit('rollbacking', { migrationId: m.id })
        await dataAccess.rollback(m.id, q => m.down(q))
        this.emit('rollback', { migrationId: m.id })
      })
    }, Promise.resolve()).then(() => {
      return dataAccess.close()
    }, error => {
      return dataAccess.close().then(() => Promise.reject(error))
    })
  }

  async seed (): Promise<void> {
    if (this.seeder) {
      const dataAccess = await this.getDataAccess()
      const d = formatDate(new Date())
      const id = `${d}--seed`
      this.emit('seeding')

      // Run the seed in a migration "context" so we get auto-rollbacks if the
      // seed fails...
      try {
        await dataAccess.migrate(id, q => this.seeder.run(q))
      } catch (error) {
        await dataAccess.close()
        return Promise.reject(error)
      }

      // ...then we rollback the seed right away so we remove the entry from the
      // migration table.
      await dataAccess.rollback(id, q => Promise.resolve())
      this.emit('seed')
      await dataAccess.close()
    }
  }
}
