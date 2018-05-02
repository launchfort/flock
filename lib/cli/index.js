const program = require('commander')
const pkg = require('../../package.json')
const actions = require('./actions')

module.exports = function (args) {
  initProgram()

  if (args.length > 2) {
    program.parse(args)
  } else {
    program.help()
  }
}

function initProgram () {
  program.version(pkg.version, '-v, --version')

  program
    .command('create')
    .description('Create a database migration')
    .option('-c, --config', 'The config file to load (default .flockrc.json)')
    .action((cmd) => {
      actions.create({ cfgFileName: cmd.config })
    })

  program
    .command('migrate [migrationId]')
    .description('Run all migrations, or up to a specific migration')
    .option('-r, --require <moduleId>', 'Module ID of a module to require before migrating')
    .option('-l, --list', 'Display list of migrations to pick from')
    .option('-c, --config', 'The config file to load (default .flockrc.json)')
    .action((migrationId, cmd) => {
      if (cmd.require) {
        require(cmd.require)
      }
      actions.migrate({ migrationId, list: cmd.list, cfgFileName: cmd.config })
    })

  program
    .command('rollback [migrationId]')
    .description('Rollback the last ran migration, all migrations, or down to a specific migration')
    .option('-r, --require <moduleId>', 'Module ID of a module to require before rolling back')
    .option('-l, --list', 'Display list of migrations to pick from')
    .option('-c, --config', 'The config file to load (default .flockrc.json)')
    .usage('rollback [migrationId | @all]')
    .action((migrationId, cmd) => {
      if (cmd.require) {
        require(cmd.require)
      }
      actions.rollback({ migrationId, list: cmd.list, cfgFileName: cmd.config })
    })

  program
    .command('upgrade')
    .description('Upgrade a flock project using a .yo-rc.json file to use a .flockrc.json file')
    .option('-c, --config', 'The config file to write to (default .flockrc.json)')
    .action((migrationId, cmd) => {
      actions.upgrade({ cfgFileName: cmd.config })
    })

  program
    .command('*')
    .action(() => program.help())
}
