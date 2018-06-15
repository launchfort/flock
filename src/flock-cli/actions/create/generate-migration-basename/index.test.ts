import * as Assert from 'assert'
import * as Path from 'path'
import * as TestHelpers from 'test-helpers'
import { generateMigrationBasename } from './index'

describe('generate-migration-basename', function () {
  let dir = ''

  before(async function () {
    dir = await TestHelpers.tmpdir()
    await TestHelpers.touch(Path.join(dir, '2018-01-02--001--create-model--pizza.js'))
    await TestHelpers.touch(Path.join(dir, '2018-01-02--002--create-model--pizza.js'))
  })

  after(function () {
    if (dir) {
      return TestHelpers.rmdirp(dir)
    }
  })

  it('should generate a new migration basename', async function () {
    const basename = await generateMigrationBasename('create-model', 'user', { migrationDir: dir, date: new Date(2018, 0, 1) })
    Assert.strictEqual(basename, '2018-01-01--001--create-model--user.js')
  })

  it('should generate a migration basename that is next in a sequence', async function () {
    const basename = await generateMigrationBasename('create-model', 'user', { migrationDir: dir, date: new Date(2018, 0, 2) })
    Assert.strictEqual(basename, '2018-01-02--003--create-model--user.js')
  })
})
