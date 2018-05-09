# Flock

Flock is a database agnostic migration library and command line tool.

Where a migration is a Node module that exports the following functions.

```
{
  up (context): Promise<void>,
  down (context): Promise<void>
}
```

The command line tool will write project settings to a `.flockrc.json` file
after running any command. Be sure to check this into source control.

## Install

```
npm install gradealabs/flock -D
```

## Command line usage

```
Usage: flock [options] [command]

Options:

  -v, --version                     output the version number
  -h, --help                        output usage information

Commands:

  create [options]                  Create a database migration
  migrate [options] [migrationId]   Run all migrations, or up to a specific migration
  rollback [options] [migrationId]  Rollback the last ran migration, all migrations, or down to a specific migration
  upgrade [options]                 Upgrade a flock project using a .yo-rc.json file to use a .flockrc.json file
```

### create

The `create` command will create a new migration file in the designated migration directory.
By default the migration file will be given an identifying name based on the migration
type selected and the table being migrated. The name of the migration file will
automatically be sequentially named for you. However, you may decide to rename
the file.

```
Usage: create [options]

Create a database migration

Options:

  -c, --config  The config file to load (default .flockrc.json)
  -h, --help    output usage information
```

### migrate

The `migrate` command will migrate all migrations in the specified migration directory.

A migrationId is the basename of a migration file without it's `.js` extension.

```
Usage: migrate [options] [migrationId]

Run all migrations, or up to a specific migration

Options:

  -r, --require   Module ID of a module to require before migrating
  -l, --list      Display list of migrations to pick from
  -c, --config    The config file to load (default .flockrc.json)
  -h, --help      output usage information
```

When using the `--list` option, migration IDs are listed with `✓` to indicte they
have been migrated and, a `✗` to indicate they have not been migrated.

Optionally a migration ID can be specified indicating what migration should be
last to be migrated.

Example:
```
flock migrate some-migration
```

In this example all migrations before and including `some-migration` will be
migrated. Migrations occurring after `some-migration` will not be migrated.

### rollback

The `rollback` command will rollback the last migrated migration from the specified
migration directory.

A migrationId is the basename of a migration file without it's `.js` extension.

```
Usage: rollback rollback [migrationId | @all]

Rollback the last ran migration, all migrations, or down to a specific migration

Options:

  -r, --require   Module ID of a module to require before rolling back
  -l, --list      Display list of migrations to pick from
  -c, --config    The config file to load (default .flockrc.json)
  -h, --help      output usage information
```

When using the `--list` option, migration IDs are listed with `✓` to indicte they
have been migrated and, a `✗` to indicate they have not been migrated.

Optionally a migration ID can be specified indicating what migration should be
last to be rolled back.

Example:
```
flock rollback some-migration
flock rollback @all // rollback all migrations
```

In this example all migrations after and including `some-migration` will be
rolled back. Migrations occurring before `some-migration` will not be rolled back.

If the migration ID is `@all` then all migtations will be rolled back.

### upgrade

The `upgrade` command will take a project that is using flock 1.x up to the
latest config file format for flock 2+.

```
Usage: upgrade [options]

Upgrade a flock project using a .yo-rc.json file to use a .flockrc.json file

Options:

  -c, --config              The config file to write to (default .flockrc.json)
  -h, --help                output usage information
```

## Testing

To test the plugins first run `docker-compose up` from the module directory.
Then run `npm test`.

## API

*Coming Soon*

## Drivers

Flock can be extended to support other databases through the use of plugins. The
following plugins are supported by default.

- flock-pg

*NOTE: This driver may not always be installed by default in the future.*

### flock-pg

The `flock-pg` driver adds support for connecting to Postgres databases. Every
migration will have the following context passed to its `up` and `down` functions.

```
{
  // The name of the migrations table
  migrationTable: string,
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

**Connecting**

To set the connection details for the database use the following environment
variables.

```
DATABASE_URL
```

OR

```
PGUSER
PGPASSWORD
PGHOST
PGPORT
PGDATABASE
```

See: https://node-postgres.com/features/connecting
