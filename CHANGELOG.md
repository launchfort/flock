# 3.2.1

**Patch**

- Add missing `await` keyword when calling `rollback` after a seed.

# 3.2.0

**Minor**

- Add support for `seed` command line and `seed` Migrator method.
- Update the RC generated from the `init` CLI command so that it shows an example
  of calling the seed when the schema changes after migrating.

**Patch**

- Ensure timing is calcuated correctly when running `migrate` and `rollback` from CLI.

# 3.1.0

**Minor**

- Add support to the `NodeModuleMigrationProvider` to ignore files and folders
  that starts with `.` and end with `jpg|jpeg|gif|png|pdf|docx|doc|xml|txt|css|csv|xlsx|md|db`.
- Add `filter` option that `NodeModuleMigrationProvider` that allows for ignoring
  custom files.

# 3.0.3

**Patch**

- Add support to the `NodeModuleMigrationProvider` to ignore files and folders
  that starts with `_`.
- Add a nice error message to `NodeModuleMigrationProvider` when a migration
  cannot be loaded, asking users to prefix with `_` to ignore.

# 3.0.2

**Patch**

- Resolve issue with `init` and `upgrade` command line actions from creating
  an incorrect `.flockrc.js` file where the `NodeModuleMigrationProvider`
  instance was constructed incorrectly.
- Update `README.md` to show proper `NodeModuleMigrationProvider` construction
  examples.
- Add a section to the `README.md` that describes how to upgrade and then points
  to the `UPGRADING.md` document.

# 3.0.1

**Patch**

- Resolve issue with the create commandline action complaining about cannot
  find template `undefined`.

# 3.0.0

**Major**

- Completely re-written in TypeScript with a better architected pluggable API.
- The config file `.flockrc.json` has been replaced with an rc JavaScript module
  with the file name `.flockrc.js` by default.
- Configuration has changed so that all setup and initialization occurs in the
  rc file.
- Postgres support is not included in this module anymore. You will need to
  install `gradealabs/flock-pg`.

**Minor**

- Add the `init` command line action that will initialize a flock project by
  creating the rc file for you.
- Add the `list` command line action that will list all migrations and whether
  they have been migrated `✓` or not `✗`.

# 2.0.0

**What's New**

The `.yo-rc.json` file has been replaced with `.flockrc.json`. This was done
so that we have more control on the format of the config going forward and not
dependant on `yeoman`.

Each `flock` command now supports a `-c` or `--config` option that can point to
an rc file to load as the config. This was done to give `flock` users the
ability to rename the config and/or move the config wherever they choose.

Upgrading to the new config file from `flock` 0.x and 1.x is handled by calling
the new `upgrade` command. Calling the command is only necessary if a proejct
using `flock` was upgraded to use version 2.x.

**Fixes and improvements**

- Add unit tests to all command line actions
- Resolve the unterminated process issue
  (i.e. needing to press Enter after migrating using the CLI)
- Refactor out `yeoman` and instead just rely on `inquirer`
- Upgrade dependencies to resolve known vulnerabilities

**Breaking changes**

- The config file `.yo-rc.json` has been replaced with `.flockrc.json`
