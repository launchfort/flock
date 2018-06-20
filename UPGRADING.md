# Upgrading

Running `flock upgrade` will attempt to upgrade your project to use a config
file that is compatible with the version of flock you have installed.

If previously using flock@2 be sure to pass `--config` if you have used a custom
config file name.

When upgrading the following `.flockrc.js` file will be created with the
`migrationDir` and `migrationTable` being read from you existing config file.

```js
const { DefaultMigrator, NodeModuleMigrationProvider } = require('@gradealabs/flock')
const { DataAccessProvider, TemplateProvider } = require('@gradealabs/flock-pg')

const migrationDir = '${migrationDir}'
const migrationTableName = '${migrationTable}'
const dap = new DataAccessProvider({ migrationTableName })
const mp = new NodeModuleMigrationProvider({ migrationDir })

exports.migrator = new DefaultMigrator(mp, dap)
exports.migrationDir = migrationDir
exports.templateProvider = new TemplateProvider()

```

Once this file has been created you will need to install the correct flock
plugin to communicate with your database of choice. By default it's assumed
that you'll be talking to a Postgres database and so the rc file depends on
`@gradealabs/flock-pg`. Change this out for your own plugin as needed.

*NOTE: @gradealabs/flock-pg is installed from GitHub using `npm install gradealabs/flock-pg`*