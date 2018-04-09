const program = require('commander')
const yeoman = require('yeoman-environment')
const pkg = require('../package.json')

module.exports = function (args) {
  initProgram(initYeomanEnv())

  if (args.length > 2) {
    program.parse(args)
  } else {
    program.help()
  }
}

function initYeomanEnv () {
  const env = yeoman.createEnv()

  env.register(require.resolve('./generators/create'), 'flock:create')
  env.register(require.resolve('./generators/migrate'), 'flock:migrate')
  env.register(require.resolve('./generators/rollback'), 'flock:rollback')

  return env
}

function initProgram (env) {
  program.version(pkg.version, '-v, --version')

  program
    .command('create')
    .description('Create a database migration')
    .action((cmd) => {
      if (cmd.require) {
        require(cmd.require)
      }
      env.run([ 'flock:create' ], {})
    })

  program
    .command('migrate [migrationId]')
    .description('Run all migrations, or up to a specific migration')
    .option('-r, --require <moduleId>', 'Module ID of a module to require before migrating')
    .option('-l,--list', 'Display list of migrations to pick from')
    .action((migrationId, cmd) => {
      if (cmd.require) {
        require(cmd.require)
      }
      env.run([ 'flock:migrate' ].concat(program.rawArgs.slice(3)))
    })

  program
    .command('rollback [migrationId]')
    .description('Rollback the last ran migration, all migrations, or down to a specific migration')
    .option('-r, --require <moduleId>', 'Module ID of a module to require before rolling back')
    .option('-l,--list', 'Display list of migrations to pick from')
    .usage('rollback [migrationId | @all]')
    .action((migrationId, cmd) => {
      if (cmd.require) {
        require(cmd.require)
      }
      env.run([ 'flock:rollback' ].concat(program.rawArgs.slice(3)))
    })

  program
    .command('*')
    .action(() => program.help())
}
