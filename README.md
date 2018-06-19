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
Usage:  [options] [command]

Options:

  -v, --version                     output the version number
  -h, --help                        output usage information

Commands:

  create [options]                  Create a database migration
  migrate [options] [migrationId]   Run all migrations, or up to a specific migration
  rollback [options] [migrationId]  Rollback the last ran migration, all migrations, or down to a specific migration
  upgrade [options]                 Upgrade a flock project using a .yo-rc.json or .flockrc.json file to use a flockrc.js file
  list [options]                    Display list of migrations
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

  -r, --require <moduleId>  Module ID of a module to require before creating a migration
  --rc                      The rc file to load (default flockrc.js)
  -h, --help                output usage information
```

### migrate

The `migrate` command will migrate all migrations in the specified migration directory.

A migrationId is the basename of a migration file without it's `.js` extension.

```
Usage: migrate [options] [migrationId]

Run all migrations, or up to a specific migration

Options:

  -l, --list                Display list of migrations to pick from
  -r, --require <moduleId>  Module ID of a module to require before migrating
  --rc                      The rc file to load (default flockrc.js)
  -h, --help                output usage information
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

  -l, --list                Display list of migrations to pick from
  -r, --require <moduleId>  Module ID of a module to require before rolling back
  --rc                      The rc file to load (default flockrc.js)
  -h, --help                output usage information
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

The `upgrade` command will take a project that is using a previous version of
flock and attempt to upgrade the config file to a config file that is compatible
with the version of flock installed.

```
Usage: upgrade [options]

Upgrade the flock project config file

Options:

  -c, --config  The flock 2.x config file to read from (default .flockrc.json)
  --rc          The rc file to write to (default flockrc.js)
  -h, --help    output usage information
```

### list

List all migrations and whether have been run or not.

```
Usage: list [options]

Display list of migrations

Options:

  --rc        The rc file to write to (default flockrc.js)
  -h, --help  output usage information
```

## API

*Coming Soon*
