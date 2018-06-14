import * as assert from 'assert'
import * as Path from 'path'
import * as TestHelpers from 'test-helpers'
import { getMigrationsCount } from './get-migrations-count'

describe('generate-migration-basename/get-migrations-count', function () {
  let dir = ''

  before(async function () {
    dir = await TestHelpers.tmpdir()
    await TestHelpers.touch(Path.join(dir, 'one.js'))
    await TestHelpers.touch(Path.join(dir, 'two-1.js'))
    await TestHelpers.touch(Path.join(dir, 'two-2.js'))
    await TestHelpers.touch(Path.join(dir, 'two-3.js'))
    await TestHelpers.touch(Path.join(dir, 'three.js'))
  })

  after(function () {
    if (dir) {
      return TestHelpers.rmdirp(dir)
    }
  })

  it('should count the number of migration files', async function () {
    const count = await getMigrationsCount(dir)
    assert.strictEqual(count, 5)
  })

  it('should count the number of migration files with a prefix', async function () {
    const count = await getMigrationsCount(dir, { prefix: 'two-' })
    assert.strictEqual(count, 3)
  })
})
