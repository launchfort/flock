# Flock

Flock is a database agnostic migration library and command line tool.

Where a migration is a Node module that exports the following functions.

```
{
  up (queryInterface: QueryInterface): Promise<void>,
  down (queryInterface: QueryInterface): Promise<void>
}
```

## Install and Initialization

```
npm install gradealabs/flock
./node_modules/.bin/flock init
```

## Writing a Migration

A migration is by default a Nodejs module that exports an `up` and `down`
functions that accept a `QueryInterface` instance and return a `Promise`.

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

The `QueryInterface#query` method will have a unique signature for each flock
plugin. For example `flock-pg` this method has the same signature as the `pg`
module's `Client#query` method. Other flock plugins will likely have a different
signature.

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

*TODO*

## Command Line

Read the [docs]('./COMMAND_LINE.md).

## API

*TODO*
