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
