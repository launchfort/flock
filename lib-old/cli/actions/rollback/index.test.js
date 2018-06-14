const assert = require('assert')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const { migrate } = require('../migrate')
const { rollback } = require('./index')
const { migrationTableCache } = require('../../../drivers/dummy')
const { tmpdir } = require('../../../tmp')
const { rmdirp } = require('../../../rmdirp')

const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)

describe('cli/actions#rollback', function () {
  let dir = null
  beforeEach(function () {
    Object.keys(migrationTableCache).forEach(x => {
      delete migrationTableCache[x]
    })
    return tmpdir().then(x => {
      dir = x
    })
  })

  afterEach(function () {
    return dir ? rmdirp(dir) : null
  })

  it('should call down on a migration', async function () {
    const spyPath = path.resolve(__dirname, '../../../spy')
    const migrationFileName = path.join(dir, 'migrations/create-table.js')

    await mkdir(path.join(dir, 'migrations'))
    await writeFile(
      migrationFileName,
      `const { spy } = require('${spyPath}')
      exports.up = spy()
      exports.down = spy()
      `,
      { encoding: 'utf8' }
    )

    await migrate({
      cfgFileName: path.join(dir, '.flockrc.json'),
      answers: {
        driver: 'flock:lib/drivers/dummy',
        migrationTable: 'migration',
        migrationDir: path.join(dir, 'migrations')
      }
    })

    assert.ok(fs.existsSync(path.join(dir, '.flockrc.json')), 'Config file was not created')
    assert.deepStrictEqual({
      driver: 'flock:lib/drivers/dummy',
      migrationTable: 'migration',
      migrationDir: path.join(dir, 'migrations')
    }, JSON.parse(fs.readFileSync(path.join(dir, '.flockrc.json'))))
    assert.deepStrictEqual(migrationTableCache, {
      [path.basename(migrationFileName, path.extname(migrationFileName))]: true
    })

    await rollback({
      cfgFileName: path.join(dir, '.flockrc.json')
    })

    assert.deepStrictEqual(migrationTableCache, {})

    const m = require(migrationFileName)
    assert.strictEqual(m.up.calls.length, 1)
    assert.strictEqual(m.down.calls.length, 1)
  })
})
