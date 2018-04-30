const assert = require('assert')
const path = require('path')
const fs = require('fs')
const { tmpdir } = require('../../../tmp')
const { rmdirp } = require('../../../rmdirp')
const { create } = require('./index')
const { Environment } = require('../../../flock/environment')

describe('cli/actions#create', function () {
  let dir = null
  beforeEach(function () {
    return tmpdir().then(x => {
      dir = x
    })
  })

  afterEach(function () {
    return dir ? rmdirp(dir) : null
  })

  it('should create a migration file', async function () {
    await create({
      cfgFileName: path.join(dir, '.flockrc.json'),
      answers: {
        driver: 'flock:lib/drivers/dummy',
        migrationTable: 'migration',
        migrationDir: path.join(dir, 'migrations'),
        migrationType: 'create-table',
        table: 'test',
        migrationName: 'create-table.js'
      }
    })

    assert.ok(fs.existsSync(path.join(dir, 'migrations/create-table.js')), 'Migration file was not created')
    assert.ok(fs.existsSync(path.join(dir, '.flockrc.json')), 'Config file was not created')
  })

  it('should create a migration file and increment the sequence by one when created on same day as existing migration file', async function () {
    const migrationDir = path.join(dir, 'migrations')
    const env = new Environment()

    await create({
      cfgFileName: path.join(dir, '.flockrc.json'),
      answers: {
        driver: 'flock:lib/drivers/dummy',
        migrationTable: 'migration',
        migrationDir,
        migrationType: 'create-table',
        table: 'message',
        migrationName: await env.generateMigrationBasename('create-table', 'message', { migrationDir })
      }
    })

    await create({
      cfgFileName: path.join(dir, '.flockrc.json'),
      answers: {
        driver: 'flock:lib/drivers/dummy',
        migrationTable: 'migration',
        migrationDir,
        migrationType: 'other',
        table: 'test',
        migrationName: await env.generateMigrationBasename('other', 'test', { migrationDir })
      }
    })

    const files = fs.readdirSync(path.join(dir, 'migrations')).sort()
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
