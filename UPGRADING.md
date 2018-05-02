# Upgrading

## 0.x to 1.x

Version 1.x uses yeoman to drive the command line interface. We'll need to
create a `.yo-rc.json` file with the appropriate settings that mimick what
was set by default in version 0.x.

```json
{
  "flock": {
    "prompValues": {
      "driver": "flock:lib/drivers/pg",
      "migrationDir": "migrations",
      "migrationTable": "migrations"
    }
  }
}
```
