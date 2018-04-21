const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path')
const fs = require('fs-extra')
const { Environment } = require('../../flock/environment')

describe('flock:create', function () {
  it('should create a migration file', function () {
    return helpers.run(path.resolve(__dirname))
      .inTmpDir(function (dir) { })
      .withLocalConfig({
        promptValues: {
          driver: 'flock:lib/drivers/pg',
          migrationTable: 'migration',
          migrationDir: 'migrations'
        }
      })
      .withPrompts({
        migrationType: 'create-table',
        table: 'test',
        migrationName: 'create-table.js'
      })
      .then(() => {
        assert.file('migrations/create-table.js')
      })
  })

  it('should create a migration file and increment the sequence by one when created on same day as existing migration file', function () {
    return helpers.run(path.resolve(__dirname))
      .inTmpDir(async function (dir) {
        const env = new Environment()
        const migrationBasename = await env.generateMigrationBasename('create-table', 'message', { migrationDir: 'migrations' })
        return fs.createFile(path.join(dir, 'migrations', migrationBasename))
      })
      .withLocalConfig({
        promptValues: {
          driver: 'flock:lib/drivers/pg',
          migrationTable: 'migration',
          migrationDir: 'migrations'
        }
      })
      .withPrompts({
        migrationType: 'other',
        table: 'test'
      })
      .then(async () => {
        const files = (await fs.readdir('migrations')).sort()
        const parts = files.map(x => x.split('--'))

        assert.strictEqual(files.length, 2)
        assert.deepStrictEqual(parts[0].slice(1), [
          '001', 'create-table', 'message.js'
        ])
        assert.deepStrictEqual(parts[1].slice(1), [
          '002', 'other', 'test.js'
        ])
      })
  })
})
