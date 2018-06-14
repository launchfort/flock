const assert = require('assert')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const { tmpdir } = require('../../../tmp')
const { rmdirp } = require('../../../rmdirp')
const { upgrade } = require('./index')

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)
const exists = fileName => stat(fileName).then(() => true).catch(error => {
  if (error.code === 'ENOENT') {
    return false
  } else {
    throw error
  }
})

describe('cli/actions#upgrade', function () {
  let dir = null
  beforeEach(function () {
    return tmpdir().then(x => {
      dir = x
    })
  })

  afterEach(function () {
    return dir ? rmdirp(dir) : null
  })

  it('should upgrade a project that used version 1.x', async function () {
    const cfgFileName = path.join(dir, '.flockrc-.json')
    const yoRcFileName = path.join(dir, '.yo-rc.json')
    const yoRc = {
      flock: {
        promptValues: {
          driver: 'flock:lib/drivers/pg',
          migrationDir: 'migrations',
          migrationTable: 'migration'
        }
      }
    }

    await writeFile(yoRcFileName, JSON.stringify(yoRc), { encoding: 'utf8' })
    await upgrade({ yoRcFileName, cfgFileName })

    const yoRcExists = await exists(yoRcFileName)
    assert.strictEqual(yoRcExists, false, '.yo-rc.json still exists')

    const cfg = await readFile(cfgFileName).then(x => JSON.parse(x))
    assert.deepStrictEqual(cfg, yoRc.flock.promptValues)
  })

  it('should upgrade a project that used version 0.x', async function () {
    const cfgFileName = path.join(dir, '.flockrc-.json')

    await upgrade({ cfgFileName })

    const cfg = await readFile(cfgFileName).then(x => JSON.parse(x))
    assert.deepStrictEqual(cfg, {
      driver: 'flock:lib/drivers/pg',
      migrationDir: 'migrations',
      migrationTable: 'migrations'
    })
  })

  it('should not upgrade a project that used version 2.x', async function () {
    const cfgFileName = path.join(dir, '.flockrc-.json')
    const yoRcFileName = path.join(dir, '.yo-rc.json')
    const cfg = {
      driver: 'flock:lib/drivers/pg',
      migrationDir: 'migrations_folder',
      migrationTable: 'migration_boom'
    }

    await writeFile(cfgFileName, JSON.stringify(cfg), { encoding: 'utf8' })
    await upgrade({ yoRcFileName, cfgFileName })

    const cfg2 = await readFile(cfgFileName).then(x => JSON.parse(x))
    assert.deepStrictEqual(cfg2, cfg)
  })
})
