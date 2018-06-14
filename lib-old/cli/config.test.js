const assert = require('assert')
const fs = require('fs')
const path = require('path')
const config = require('./config')
const { tmpdir } = require('../tmp')
const { rmdirp } = require('../rmdirp')

describe('config#replaceYoRc', function () {
  let dir = null
  beforeEach(function () {
    return tmpdir().then(x => {
      dir = x
    })
  })

  afterEach(function () {
    return dir ? rmdirp(dir) : null
  })

  it('should replace a .yo-rc.json file in the current working directory', async function () {
    const yo = createFakeYoRc(path.join(dir, '.yo-rc.json'))
    await config.replaceYoRc(path.join(dir, '.yo-rc.json'), { cfgFileName: path.join(dir, '.flockrc.json') })
    const cfg = await config.load(path.join(dir, '.flockrc.json'))

    assert.ok(!fs.existsSync(path.join(dir, '.yo-rc.json')))
    assert.ok(cfg.driver, yo.flock.promptValues.driver)
    assert.ok(cfg.migrationTable, yo.flock.promptValues.migrationTable)
    assert.ok(cfg.migrationDir, yo.flock.promptValues.migrationDir)
  })
})

function createFakeYoRc (fileName) {
  const yo = {
    flock: {
      promptValues: {
        driver: 'one',
        migrationTable: 'two',
        migrationDir: 'three'
      }
    }
  }
  fs.writeFileSync(fileName, JSON.stringify(yo), { encoding: 'utf8' })
  return yo
}
