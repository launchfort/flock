# Flock

Flock is a database agnostic migration library and command line tool.

## Install and Initialization

```
npm install gradealabs/flock
./node_modules/.bin/flock init
```

*NOTE: If you are upgrading from a previous version of flock then don't run the
`init` command and instead use the `upgrade` command. See [upgrading](./UPGRADING.md).*

## Writing a Migration

A migration is typically a Nodejs module that exports an `up` and `down`
functions that accept a `QueryInterface` instance and return a `Promise`.

*NOTE: Migrations can be anything you want them to be, so long as you configure
the flock Migrator appropriately.*

Where `QueryInterface` is the following
```ts
interface QueryInterface {
  query (queryObject: any): Promise<QueryResult>
  tableExists (tableName: string): Promise<boolean>
  columnExists (tableName: string, columnName: string): Promise<boolean>
  columnDataType (tableName: string, columnName: string): Promise<string|null>
}
interface QueryResult {
  rowCount: number
  rows: { [col: string]: any }[]
}
```

The `QueryInterface#query` method will have a unique signature provided by the
flock plugin that implemented it. For example in `flock-pg` this method has the
same signature as the `pg` module's `Client#query` method. Other flock plugins
will likely have their own signature.

Here's an example migration that uses the `flock-pg` plugin.

```js
// migrations/2018-01-01--001--create-table--user.js

exports.up = function (queryInterface) {
  const sql =
  `CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    modified_at timestamp with time zone DEFAULT current_timestamp,
    PRIMARY KEY (id)
  )`
  const query = { text: sql }
  return queryInterface.query(query)
}

exports.down = function (queryInterface) {
  const sql =
  `DROP TABLE IF EXISTS "user"`
  const query = { text: sql }
  return queryInterface.query(query)
}
```

## Programmatic Usage

The programmatic API for flock centers around the `Migrator` interface, that
describes the behaviour of the controller responsible for performing
migrations.

```ts
interface Migrator {
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
  migrate (migrationId?: string): Promise<void>
  /**
   * Rolls back the last migrated migration. If a migration ID is specified then
   * rolls back only the migration. If migration ID is '@all' then rolls back
   * all migrated migrations.
   *
   * @param migrationId The migration to rollback or '@all' to rollback all migrated migrations
   */
  rollback (migrationId?: string): Promise<void>
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
interface MigrationState {
  id: string
  migrated: boolean
  migratedAt?: Date
}
```

A `Migrator` has the same API as the Nodejs `EventEmitter` class and additional
methods for running migrations. You don't have to implement this interface there
is a default implementation `DefaultMigrator` class that flock exports for you.

```ts
class DefaultMigrator extends EventEmitter implements Migrator
  constructor (migrationProvider: MigrationProvider, dataAccessProvider: DataAccessProvider)
}
```

Where `MigrationProvider` and `DataAccessProvider` have these interfaces:

```ts
/** Provides Migration instances to a Migrator. */
interface MigrationProvider {
  /** Scans the file system or creates adhoc migrations. */
  provide (): Promise<Migration[]>
}

interface Migration {
  id: string
  up (queryInterface: QueryInterface): Promise<void>
  down (queryInterface: QueryInterface): Promise<void>
}

/** Provides DataAccess instances to a Migrator. */
interface DataAccessProvider {
  /** Open a new database connection and provides a DataAccess instance. */
  provide (): Promise<DataAccess>
}

/**
 * Represents an open database connection.
 */
interface DataAccess {
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
interface QueryInterface {
  /** Make a database query. The signature of this function will be unique for each flock plugin. */
  query (queryObject: any): Promise<QueryResult>
  tableExists (tableName: string): Promise<boolean>
  columnExists (tableName: string, columnName: string): Promise<boolean>
  columnDataType (tableName: string, columnName: string): Promise<string|null>
}

interface QueryResult {
  rowCount: number
  rows: { [col: string]: any }[]
}
```

Flock also exports a default implementation of a `MigrationProvider` that will
scan a directory for Nodejs modules that you can use when configuring the
`DefaultMigrator`.

```ts
class NodeModuleMigrationProvider implements MigrationProvider {
  constructor (dir = 'migrations', options?: { filter: (fileName: string) => boolean })
}
```

The `NodeModuleMigrationProvider` class will provide migrations sorted
alphabetically instead of the order given by the file system, and the module ID
will be the basename with no extension from the module file name.

Any file or folder the starts with `_` or `.` will be ignored. Also common files
will also be ignored: `jpg|jpeg|gif|png|pdf|docx|doc|xml|txt|css|csv|xlsx|md`.

Optionally you can specify a custom filter that can be used to ignore other file
names by specifying the `filter` option.

Example:
```js
// If migrations/ contains the modules `a`, `b` and `c`
const mp = new NodeModuleMigrationProvider('migrations')
const migrations = await mp.provide() // [ {id:'a', ...}, {id:'b', ...}, {id:'c', ...} ]
```

### Full Programmitic Example

```js
const { DefaultMigrator, NodeModuleMigrationProvider } = require('@gradealabs/flock')
const { DataAccessProvider } = require('flock-some-plugin')

const dap = new DataAccessProvider({ migrationTableName: 'migration' })
const mp = new NodeModuleMigrationProvider('migrations')
const migrator = new DefaultMigrator(mp, dap)
```

## Command Line

Read the [docs](./COMMAND_LINE.md).
