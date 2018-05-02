import * as fs from 'fs'
import * as path from 'path'

declare const require: (moduleId: string) => any

interface MigrationProvider {
  provide (): Promise<Migration[]>
}

interface Migration {
  id: string
  up (dataAccess: DataAccess): Promise<void>
  down (dataAccess: DataAccess): Promise<void>
}

interface DataAccessProvider {
  provide (): Promise<DataAccess>
}

interface DataAccess {
  getMigratedMigrations (): Promise<{ id: string, createdAt: Date }[]>
  migrate (migrationId: string, action: (queryInterface) => Promise<void>): Promise<void>
  rollback (migrationId: string, action: (queryInterface) => Promise<void>): Promise<void>
  close (): Promise<void>
}

class Migrator {
  private getMigrations: () => Promise<Migration[]>
  private getDataAccess: () => Promise<DataAccess>

  constructor (migrationProvider: MigrationProvider, dataAccessProvider: DataAccessProvider) {
    this.getMigrations = () => migrationProvider.provide()
    this.getDataAccess = () => dataAccessProvider.provide()
  }

  async migrate (migrationId = null): Promise<void> {
    const dataAccess = await this.getDataAccess()
    const migrated = await dataAccess.getMigratedMigrations()
    let migrations = await this.getMigrations()

    if (migrationId !== null) {
      const k = migrations.findIndex(x => x.id === migrationId)
      if (k >= 0) {
        migrations = migrations.slice(0, k + 1)
      } else {
        throw new Error()
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

  async rollback (migrationId = null): Promise<void> {
    const dataAccess = await this.getDataAccess()
    let migrated = await dataAccess.getMigratedMigrations()
    let migrations = await this.getMigrations()

    // Ensure the migrated results are sorted by createdAt in ascending order.
    migrated = migrated.sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime()
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
          throw new Error()
        }
      }
    } else if (migrationId !== '@all') {
      const m = migrations.find(x => x.id === migrationId)
      if (m) {
        migrations = [ m ]
      } else {
        throw new Error()
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

class NodeModuleMigrationProvider implements MigrationProvider {
  dir: string

  constructor (dir = 'migrations') {
    this.dir = dir
  }

  provide (): Promise<Migration[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(this.dir, (error, files) => {
        error ? reject(error) : resolve(files)
      })
    }).then((files: string[]) => {
      return files.map(x => new NodeModuleMigration(path.join(this.dir, x)))
    })
  }
}

class NodeModuleMigration implements Migration {
  id: string
  module: any

  constructor (fileName) {
    this.module = require(path.resolve(fileName))
    this.id = path.basename(fileName, path.extname(fileName))

    if (!this.module) {
      throw new Error('Invalid migration, must have an up() and down() functions')
    } else if (typeof this.module.up !== 'function') {
      throw new Error('Migration missing up() function')
    } else if (typeof this.module.down !== 'function') {
      throw new Error('Migration missing down() function')
    }
  }

  up (dataAccess: DataAccess) {
    return this.module.up(dataAccess)
  }

  down (dataAccess: DataAccess) {
    return this.module.down(dataAccess)
  }
}

class PgDataAccessProvider implements DataAccessProvider {
  migrationTableName: string
  acquireLock: boolean

  constructor ({ migrationTableName = 'migration', acquireLock = true } = {}) {
    this.migrationTableName = migrationTableName
    this.acquireLock = acquireLock
  }

  async provide () {
    const lock = 5432
    let locked = false
    const client = new Client()

    if (this.acquireLock) {
      const advisoryLockResult = await client.query(`SELECT pg_try_advisory_lock(${lock})`)
      locked = advisoryLockResult.rows[0].pg_try_advisory_lock === true

      if (!locked) {
        await client.end()
        throw new Error(`Advisory lock "${lock}" could not be acquired.`)
      }
    }

    return new PgDataAccess(client, this.migrationTableName, { lock: locked ? lock : null })
  }
}

class PgDataAccess implements DataAccess {
  client: any
  migrationTableName: string
  lock: number

  constructor (client, migrationTableName, { lock = NaN } = {}) {
    this.client = client
    this.migrationTableName = migrationTableName
    this.lock = lock
  }

  async getMigratedMigrations () {
    const result = await this.client.query(
      `SELECT id, created_at FROM "${this.migrationTableName}"`
    )
    return (result.rows || []).map(x => {
      return { id: x.id, createdAt: x.created_at }
    })
  }

  async migrate (migrationId, action) {
    const hasMigrated = await this.hasMigrated(migrationId)

    if (hasMigrated) {
      return
    }

    await this.client.query('BEGIN')
    try {
      await this.client.query(
        `CREATE TABLE IF NOT EXISTS "${this.migrationTableName}" (
          id varchar(512),
          created_at timestamp DEFAULT current_timestamp,
          PRIMARY KEY(id)
        )`
      )
      await action(this.getQueryInterface())
      await this.client.query(
        `INSERT INTO "${this.migrationTableName}" (id) VALUES($1)`,
        [ migrationId ]
      )
      await this.client('COMMIT')
    } catch (error) {
      await this.client('ROLLBACK')
      throw error
    }
  }

  async rollback (migrationId, action) {
    const migrationTableExists = await this.tableExists(this.migrationTableName)

    if (!migrationTableExists) {
      return
    }

    const hasMigrated = await this.hasMigrated(migrationId)

    if (!hasMigrated) {
      return
    }

    await this.client.query('BEGIN')
    try {
      await action(this.getQueryInterface())
      await this.client.query(
        `DELETE FROM "${this.migrationTableName}" WHERE id = $1`
        [ migrationId ]
      )
      await this.client('COMMIT')
    } catch (error) {
      await this.client('ROLLBACK')
      throw error
    }
  }

  async close () {
    if (!isNaN(this.lock) && this.lock !== null) {
      await this.client.query(`SELECT pg_advisory_unlock(${this.lock})`)
    }
    return this.client.end()
  }

  getQueryInterface () {
    return {
      query: this.client.query.bind(this.client),
      tableExists: this.tableExists.bind(this),
      columnExists: this.columnExists.bind(this),
      inspectColumn: this.inspectColumn.bind(this),
      columnDataType: this.columnDataType.bind(this)
    }
  }

  async hasMigrated (migrationId: string) {
    const result = await this.client.query(
      `SELECT id FROM "${this.migrationTableName}" WHERE id = $1`,
      [ migrationId ]
    )
    return result.rowCount === 1
  }

  async tableExists (tableName) {
    // ANSI SQL compliant query. This should work for all RDMS.
    const query =
  `SELECT EXISTS (
    SELECT 1
    FROM   information_schema.tables
    WHERE  table_name = $1
    AND table_schema = current_schema()
  )`
    const values = [ tableName ]
    const result = await this.client.query(query, values)
    return result.rowCount === 1 ? !!result.rows[0].exists : false
  }

  async columnExists (tableName, columnName) {
    // ANSI SQL compliant query. This should work for all RDMS.
    const query =
  `SELECT EXISTS (
    SELECT 1
    FROM   information_schema.columns
    WHERE  table_name = $1
    AND table_schema = current_schema()
    AND column_name = $2
  )`
    const values = [ tableName, columnName ]
    const result = await this.client.query(query, values)
    return result.rowCount === 1 ? !!result.rows[0].exists : false
  }

  async inspectColumn (tableName, columnName) {
    // ANSI SQL compliant query. This should work for all RDMS.
    const query =
  `SELECT *
  FROM   information_schema.columns
  WHERE  table_name = $1
  AND table_schema = current_schema()
  AND column_name = $2`
    const values = [ tableName, columnName ]
    const result = await this.client.query(query, values)
    return result.rowCount === 1 ? result.rows[0] : {}
  }

  async columnDataType (tableName, columnName) {
    return this.inspectColumn(tableName, columnName).then(col => {
      return col.data_type || null
    })
  }
}

// // flockrc.js
// const { Migrator, NodeModuleMigrationProvider } = require('flock')
// const { DataAccessProvider } = require('flock-pg')
//
// const migrationDir = 'migrations'
// const migrationTableName = 'migration'
// const acquireLock = true
// const dap = new DataAccessProvider({ migrationTableName, acquireLock })
// const mp = new NodeModuleMigrationProvider({ migrationDir })
//
// exports.migrator = new Migrator(mp, dap)
// exports.migrationDir = migrationDir

