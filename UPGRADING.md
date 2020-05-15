# Upgrading

Running `flock upgrade` will attempt to upgrade your project to use a config
file that is compatible with the version of flock you have installed.

If previously using flock@2 be sure to pass `--config` if you have used a custom
config file name.

When upgrading the following `.flockrc.js` file will be created with the
`migrationDir` and `migrationTable` being read from you existing config file.

```js
const { DefaultMigrator, NodeModuleMigrationProvider } = require('@launchfort/flock')
const { DataAccessProvider, TemplateProvider } = require('@launchfort/flock-pg')

const migrationDir = '${migrationDir}'
const migrationTableName = '${migrationTable}'
const dap = new DataAccessProvider({ migrationTableName })
const mp = new NodeModuleMigrationProvider(migrationDir)

exports.migrator = new DefaultMigrator(mp, dap)
exports.migrationDir = migrationDir
exports.templateProvider = new TemplateProvider()

```

Once this file has been created you will need to install the correct flock
plugin to communicate with your database of choice. By default it's assumed
that you'll be talking to a Postgres database and so the rc file depends on
`@launchfort/flock-pg`. Change this out for your own plugin as needed.

*NOTE: @launchfort/flock-pg is installed from GitHub using `npm install launchfort/flock-pg`*

## Upgrading Migration Files

Each migration file will likely need to be tweaked a bit to use the `QueryInterface`
being provided by whatever database plugin you're using.

### Upgrading From 0.x or 1.x or 2.x

All prior 3.x versions of Flock only supported a built-in Postgres plugin, and
the `QueryInterface` provided by `flock-pg` has a similar API as what is
expected by your migration files in 0.x. So in short nothing *needs* to change,
but you should think about refactoring your migrations from this:

```js
exports.up = function (context) {
  const { client } = context
  const query = `MY QUERY`
  return client.query(query)
}
```

To this:
```js
exports.up = function (queryInterface) {
  const sql = `MY QUERY`
  return queryInterface.query({ text: sql })
}
```
