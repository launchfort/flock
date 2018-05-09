# Upgrading

## 0.x to 1.x

Version 1.x uses yeoman to drive the command line interface. We'll need to
create a `.yo-rc.json` file with the appropriate settings that mimick what
was set by default in version 0.x.

```json
{
  "flock": {
    "promptValues": {
      "driver": "flock:lib/drivers/pg",
      "migrationDir": "migrations",
      "migrationTable": "migrations"
    }
  }
}
```

## 0.x to 2.x and 1.x to 2.x

Version 2.x uses a `.flockrc.json` config file. After installing version 2.x,
use the new `upgrade` command to perform an upgrade. The upgrade will take care
of upgrading your config file for you.

See the [CHANGELOG.md](./CHANGELOG.md) for more information on what changed in
version 2.x.
