# Flock

Flock is a database agnostic migration library.

*NOTE: Currently only works with Postgres databases.*

A migration is a Node module that exports the following functions.

```
{
  up (context): Promise<void>,
  down (context): Promise<void>
}
```

## Command line usage

```
flock {command} [lastId] [arguments]

Commands:
create {migrations/filename.js}
migrate [lastId]
rollback [lastId]
latest

Arguments:
--options file.json
--help
```

### create

The `create` command will create a new migration file in the specified location.

Example:
```
flock create migrations/first-migration.js
```

### migrate

The `migrate` command will migrate all migrations in the `./migrations` directory
(or whatever directory specifed in the options file).

*NOTE: Migrations will be sorted based on their basename without extension before
they are migrated.*

Example:
```
flock migrate
```

Optionally a migration ID can be specified indicating what migration should be
last to be migrated.

Example:
```
flock migrate some-mygration
```

In this example all migrations before and including `some-migration` will be
migrated. Migrations occurring after `some-migration` will not be migrated.

### rollback

The `rollback` command will rollback the last migrated migration from the `./migrations` directory
(or whatever directory specifed in the options file).

*NOTE: Migrations will be sorted based on their basename without extension before
they are migrated.*

Example:
```
flock rollback
```

Optionally a migration ID can be specified indicating what migration should be
last to be rolled back.

Example:
```
flock rollback some-mygration
```

In this example all migrations after and including `some-migration` will be
rolled back. Migrations occurring before `some-migration` will not be rolled back.

### latest

The `latest` command retrieves the ID of the last migration to be migrated.

Example:
```
flock latest
```

## Plugins

Flock can be extended to support other databases through the use of plugins. The
following plugins are supported by default:

- pg

*NOTE: At this time the only plugin supported is pg and is hardcoded when calling
the flock command line tool. In the future external plugins will be supported.*

### pg

The `pg` plugin adds support for connecting Postgres databases. Every migration
will have the following context passed to its `up` and `down` functions.

```
{
  // The name of the migrations table
  tableName: string,
  // The Client instance (pg module)
  client: pg.Client,
  tableExists(tableName: string): Promise<boolean>,
  columnExists(tableName: string, columnName: string): Promise<boolean>,
  columnDataType(tableName: string, columnName: string): Promise<string | null>,
  // Retrieves a row from `information_schema.columns`
  inspectColumn(tableName: string, columnName: string): Promise<{}>
}
```

Any method that accepts `tableName` as an argument will only search tables that
the current user has access to and has been created in the current schema.

*NOTE: The current/default schema can be changed with `SET search_path = new_schema`.*

## Testing

To test the plugins first run `docker-compose up` from the module directory.
Then run `npm test`.

