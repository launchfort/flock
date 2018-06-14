import * as Assert from 'assert'
import * as TestHelpers from 'test-helpers'
import { migrate } from './index'

describe('flock-cli/actions/migrate', function () {
  it('should call migrate', async function () {
    const mockMigrator = new TestHelpers.MockMigrator()
    await migrate({
      showList: false,
      migrationId: 'one',
      migrator: mockMigrator
    })

    Assert.strictEqual(mockMigrator.migrate['calls'].length, 1)
    Assert.deepStrictEqual(mockMigrator.migrate['calls'][0].args, [ 'two' ])
  })
})
