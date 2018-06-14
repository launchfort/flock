"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const commander_1 = require("commander");
const Actions = require("./actions");
const template_provider_1 = require("./template-provider");
function run(args) {
    const cmd = init();
    if (args.length > 2) {
        cmd.parse(args);
    }
    else {
        cmd.help();
    }
}
exports.run = run;
function requireRc(fileName = 'flockrc') {
    let rc = require(Path.resolve(fileName));
    rc.templateProvider = rc.templateProvider || new template_provider_1.DefaultTemplateProvider();
    return rc;
}
function init() {
    let cmd = new commander_1.Command();
    const pkg = require('../package.json');
    cmd.version(pkg.version, '-v, --version');
    cmd
        .command('create')
        .description('Create a database migration')
        .option('-r, --require <moduleId>', 'Module ID of a module to require before migrating')
        .option('--rc', 'The rc file to load (default flockrc.js)')
        .action((cmd) => {
        if (cmd.require)
            require(cmd.require);
        const { migrationDir, templateProvider } = requireRc(cmd.rc);
        const opts = { migrationDir, templateProvider };
        Actions.create(opts).catch(error => {
            console.error(error);
            process.exit(1);
        });
    });
    cmd
        .command('migrate [migrationId]')
        .description('Run all migrations, or up to a specific migration')
        .option('-l, --list', 'Display list of migrations to pick from')
        .option('-r, --require <moduleId>', 'Module ID of a module to require before migrating')
        .option('--rc', 'The rc file to load (default flockrc.js)')
        .action((migrationId, cmd) => {
        if (cmd.require)
            require(cmd.require);
        const { migrator } = requireRc(cmd.rc);
        const opts = {
            showList: !!cmd.list,
            migrationId,
            migrator
        };
        Actions.migrate(opts).catch(error => {
            console.error(error);
            process.exit(1);
        });
    });
    cmd
        .command('rollback [migrationId]')
        .description('Rollback the last ran migration, all migrations, or down to a specific migration')
        .option('-l, --list', 'Display list of migrations to pick from')
        .option('-r, --require <moduleId>', 'Module ID of a module to require before rolling back')
        .option('--rc', 'The rc file to load (default flockrc.js)')
        .usage('rollback [migrationId | @all]')
        .action((migrationId, cmd) => {
        if (cmd.require)
            require(cmd.require);
        const { migrator } = requireRc(cmd.rc);
        const opts = {
            showList: !!cmd.list,
            migrationId,
            migrator
        };
        Actions.rollback(opts).catch(error => {
            console.error(error);
            process.exit(1);
        });
    });
    cmd
        .command('upgrade')
        .description('Upgrade a flock project using a .yo-rc.json or .flockrc.json file to use a flockrc.js file')
        .option('-c, --config', 'The flock 2.x config file to read from (default .flockrc.json)')
        .option('--rc', 'The rc file to write to (default flockrc.js)')
        .action((cmd) => {
        Actions.upgrade({ cfgFileName: cmd.config, rcFileName: cmd.rc }).catch(error => {
            console.error(error);
            process.exit(1);
        });
    });
    cmd
        .command('*')
        .action(() => cmd.help());
    return cmd;
}
