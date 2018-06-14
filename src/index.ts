import { EventEmitter } from 'events'

export { NodeModuleMigrationProvider } from './node-migration-provider'
export { TemplateProvider } from 'flock-cli'

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
  columnDataType (tableName: string, columnName: string): Promise<string|null>
}

export interface QueryResult {
  rowCount: number
  rows: { [col: string]: any }[]
}

export interface Migrator {
  getMigrationState (): Promise<MigrationState[]>
  migrate (migrationId?: string): Promise<void>
  rollback (migrationId?: string): Promise<void>
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
  getMigrations: () => Promise<Migration[]>
  getDataAccess: () => Promise<DataAccess>

  constructor (migrationProvider: MigrationProvider, dataAccessProvider: DataAccessProvider) {
    super()
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
        this.emit('migrating', { migrationId: m.id })
        await dataAccess.migrate(m.id, q => m.up(q))
        this.emit('migrate', { migrationId: m.id })
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
}
