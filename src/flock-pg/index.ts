import * as Path from 'path'
import { Client } from 'pg'
import * as Flock from 'flock'

export class TemplateProvider implements Flock.TemplateProvider {
  readonly migrationTypes = [ 'create-table', 'alter-table', 'other' ]

  provideFileName (migrationType: string) {
    if (this.migrationTypes.indexOf(migrationType) >= 0) {
      return Promise.resolve(Path.join(__dirname, 'templates', migrationType + '.ejs'))
    } else {
      return Promise.reject(new Error(`Unsupported migration type [${migrationType}]`))
    }
  }
}

export class DataAccessProvider implements Flock.DataAccessProvider {
  readonly migrationTableName: string
  readonly acquireLock: boolean
  readonly connectionString: string

  constructor ({ migrationTableName = 'migration', acquireLock = true, connectionString = process.env.DATABASE_URL } = {}) {
    this.migrationTableName = migrationTableName
    this.acquireLock = acquireLock
    this.connectionString = connectionString
  }

  async provide () {
    const lock = 5432
    let locked = false
    const client = new Client({ connectionString: this.connectionString })

    if (this.acquireLock) {
      const advisoryLockResult = await client.query(`SELECT pg_try_advisory_lock(${lock})`)
      locked = advisoryLockResult.rows[0].pg_try_advisory_lock === true

      if (!locked) {
        await client.end()
        throw new Error(`Advisory lock "${lock}" could not be acquired.`)
      }
    }

    return new PgDataAccess(client, this.migrationTableName, { lock: locked ? lock : NaN })
  }
}

export class PgDataAccess implements Flock.DataAccess {
  private client: Client
  private qi: PgQueryInterface
  readonly migrationTableName: string
  readonly lock: number

  constructor (client, migrationTableName, { lock = NaN } = {}) {
    this.client = client
    this.qi = new PgQueryInterface(client)
    this.migrationTableName = migrationTableName
    this.lock = lock
  }

  async getMigratedMigrations () {
    const result = await this.qi.query({
      text: `SELECT id, created_at FROM "${this.migrationTableName}"`
    })
    return (result.rows || []).map(x => {
      return { id: x.id, migratedAt: x.created_at }
    })
  }

  async migrate (migrationId: string, action: (qi: Flock.QueryInterface) => Promise<void>) {
    const hasMigrated = await this.hasMigrated(migrationId)

    if (hasMigrated) {
      return
    }

    await this.qi.query({ text: 'BEGIN' })
    try {
      await this.qi.query({
        text:
          `CREATE TABLE IF NOT EXISTS "${this.migrationTableName}" (
            id varchar(512),
            created_at timestamp DEFAULT current_timestamp,
            PRIMARY KEY(id)
          )`
      })
      await action(this.qi)
      await this.qi.query({
        text: `INSERT INTO "${this.migrationTableName}" (id) VALUES($1)`,
        values: [ migrationId ]
      })
      await this.qi.query({ text: 'COMMIT' })
    } catch (error) {
      await this.qi.query({ text: 'ROLLBACK' })
      throw error
    }
  }

  async rollback (migrationId: string, action: (qi: Flock.QueryInterface) => Promise<void>) {
    const migrationTableExists = await this.qi.tableExists(this.migrationTableName)

    if (!migrationTableExists) {
      return
    }

    const hasMigrated = await this.hasMigrated(migrationId)

    if (!hasMigrated) {
      return
    }

    await this.qi.query({ text: 'BEGIN' })
    try {
      await action(this.qi)
      await this.qi.query({
        text: `DELETE FROM "${this.migrationTableName}" WHERE id = $1`,
        values: [ migrationId ]
      })
      await this.qi.query({ text: 'COMMIT' })
    } catch (error) {
      await this.qi.query({ text: 'ROLLBACK' })
      throw error
    }
  }

  async close () {
    if (!isNaN(this.lock) && this.lock !== null) {
      await this.qi.query({ text: `SELECT pg_advisory_unlock(${this.lock})` })
    }
    return this.client.end()
  }

  private async hasMigrated (migrationId: string) {
    const result = await this.qi.query({
      text: `SELECT id FROM "${this.migrationTableName}" WHERE id = $1`,
      values: [ migrationId ]
    })
    return result.rowCount === 1
  }
}

export class PgQueryInterface implements Flock.QueryInterface {
  client: { query(queryObject: { text: string, values?: any[], name?: string }): Promise<Flock.QueryResult> }

  constructor (client: Client) {
    this.client = client
  }

  query (queryObject: { text: string, values?: any[], name?: string }): Promise<Flock.QueryResult> {
    return this.client.query(queryObject)
  }

  async tableExists (tableName: string) {
    // ANSI SQL compliant query. This should work for all RDMS.
    // NOTE: use schema_name() for MSSQL
    const result = await this.query({
      text:
        `SELECT table_name
        FROM   information_schema.tables
        WHERE  table_name = $1
        AND table_schema = current_schema()
        `,
      values: [ tableName ]
    })
    return result.rowCount === 1
  }

  async columnExists (tableName: string, columnName: string) {
    // ANSI SQL compliant query. This should work for all RDMS.
    // NOTE: use schema_name() for MSSQL
    const result = await this.query({
      text:
        `SELECT column_name
        FROM information_schema.columns
        WHERE table_name=$1
        and column_name=$2
        and table_schema = current_schema()`,
      values: [ tableName, columnName ]
    })
    return result.rowCount === 1
  }

  async columnDataType (tableName: string, columnName: string): Promise<string|null> {
    return this.inspectColumn(tableName, columnName).then(col => {
      return col ? col.data_type : null
    })
  }

  private async inspectColumn (tableName: string, columnName: string) {
    // ANSI SQL compliant query. This should work for all RDMS.
    // NOTE: use schema_name() for MSSQL
    const result = await this.query({
      text:
        `SELECT *
        FROM   information_schema.columns
        WHERE  table_name = $1
        AND table_schema = current_schema()
        AND column_name = $2`,
      values: [ tableName, columnName ]
    })
    return result.rowCount === 1 ? result.rows[0] : null
  }
}
