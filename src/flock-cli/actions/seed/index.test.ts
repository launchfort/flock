import * as Assert from 'assert'
import * as TestHelpers from '../../../test-helpers'
import { seed } from './index'

describe('flock-cli/actions/seed', function () {
  it('should call migrate', async function () {
    const mockMigrator = new TestHelpers.MockMigrator()
    await seed({ migrator: mockMigrator })

    Assert.strictEqual(mockMigrator.rollback['calls'].length, 0)
    Assert.strictEqual(mockMigrator.migrate['calls'].length, 0)
    Assert.strictEqual(mockMigrator.seed['calls'].length, 1)
  })
})
