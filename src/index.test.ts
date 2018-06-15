import * as Assert from 'assert'
import * as TestHelpers from 'test-helpers'
import {
  DefaultMigrator,
  DataAccess,
  DataAccessProvider,
  MigrationProvider,
  Migration,
  QueryInterface
} from './index'

// Mock Objects

class MockDataAccessProvider implements DataAccessProvider {
  da: MockDataAccess

  constructor (da: MockDataAccess) {
    this.da = da
  }

  provide () {
    return Promise.resolve(this.da)
  }
}

class MockDataAccess implements DataAccess {
  migratedMigrations: { id: string, migratedAt: Date }[]

  constructor (migratedMigrations: { id: string, migratedAt: Date }[] = []) {
    this.migratedMigrations = migratedMigrations
    this.migrate = TestHelpers.spy(this.migrate)
    this.rollback = TestHelpers.spy(this.rollback)
    this.close = TestHelpers.spy(this.close)
  }

  getMigratedMigrations () {
    return Promise.resolve(this.migratedMigrations.slice())
  }

  migrate (migrationId: string, action: (q: QueryInterface) => Promise<void>) {
    return Promise.resolve()
  }

  rollback (migrationId: string, action: (q: QueryInterface) => Promise<void>) {
    return Promise.resolve()
  }

  close () {
    return Promise.resolve()
  }
}

class MockMigrationProvider implements MigrationProvider {
  migrations: MockMigration[]

  constructor (migrations: MockMigration[] = []) {
    this.migrations = migrations
  }

  provide () {
    return Promise.resolve(this.migrations.slice())
  }
}

class MockMigration implements Migration {
  id: string

  constructor (id: string) {
    this.id = id
    this.up = TestHelpers.spy(this.up)
    this.down = TestHelpers.spy(this.down)
  }

  up (q: QueryInterface) {
    return Promise.resolve()
  }

  down (q: QueryInterface) {
    return Promise.resolve()
  }
}

// Tests

describe('flock#DefaultMigrator', function () {
  describe('#getMigrationState', function () {
    const migrations = [
      new MockMigration('one'),
      new MockMigration('two'),
      new MockMigration('three')
    ]
    const migratedMigrations = [
      { id: 'two', migratedAt: new Date() },
      { id: 'three', migratedAt: new Date() }
    ]
    let migrator: DefaultMigrator = null

    beforeEach(function () {
      const da = new MockDataAccess(migratedMigrations)
      const dap = new MockDataAccessProvider(da)
      const mp = new MockMigrationProvider(migrations)
      migrator = new DefaultMigrator(mp, dap)
    })

    it('should resolve to a list of migration states', async function () {
      const states = await migrator.getMigrationState()

      Assert.deepStrictEqual(states, [
        { id: 'one', migrated: false, migratedAt: null },
        { id: 'two', migrated: true, migratedAt: migratedMigrations[0].migratedAt },
        { id: 'three', migrated: true, migratedAt: migratedMigrations[1].migratedAt }
      ])
    })
  })

  describe('#migrate', function () {
    const migrations = [
      new MockMigration('one'),
      new MockMigration('two'),
      new MockMigration('three'),
      new MockMigration('four'),
      new MockMigration('five')
    ]
    const migratedMigrations = [
      { id: 'one', migratedAt: new Date() },
      { id: 'two', migratedAt: new Date() }
    ]
    let da: MockDataAccess = null
    let migrator: DefaultMigrator = null

    beforeEach(function () {
      da = new MockDataAccess(migratedMigrations)
      const dap = new MockDataAccessProvider(da)
      const mp = new MockMigrationProvider(migrations)
      migrator = new DefaultMigrator(mp, dap)
    })

    it('should throw when migrating a migration that does not exist', async function () {
      try {
        await migrator.migrate('nope')
      } catch (_) {
        return
      }
      Assert.fail('No error thrown')
    })

    it('should migrate all migrations after the last migration that has not been migrated', async function () {
      await migrator.migrate()
      Assert.deepStrictEqual(da.migrate['calls'].length, 3)
      Assert.deepStrictEqual(da.migrate['calls'].map(x => x.args[0]), [ 'three', 'four', 'five' ])
    })

    it('should migrate all migrations up to the migration specified', async function () {
      await migrator.migrate('three')
      Assert.deepStrictEqual(da.migrate['calls'].length, 1)
      Assert.deepStrictEqual(da.migrate['calls'].map(x => x.args[0]), [ 'three' ])
    })
  })

  describe('#rollback', function () {
    const migrations = [
      new MockMigration('one'),
      new MockMigration('two'),
      new MockMigration('three'),
      new MockMigration('four'),
      new MockMigration('five')
    ]
    const migratedMigrations = [
      { id: 'one', migratedAt: new Date() },
      { id: 'two', migratedAt: new Date() },
      { id: 'three', migratedAt: new Date() }
    ]
    let da: MockDataAccess = null
    let migrator: DefaultMigrator = null

    beforeEach(function () {
      da = new MockDataAccess(migratedMigrations)
      const dap = new MockDataAccessProvider(da)
      const mp = new MockMigrationProvider(migrations)
      migrator = new DefaultMigrator(mp, dap)
    })

    it('should throw when migrating a migration that does not exist', async function () {
      try {
        await migrator.rollback('nope')
      } catch (_) {
        return
      }
      Assert.fail('No error thrown')
    })

    it('should rollback the last migrated migration', async function () {
      await migrator.rollback()
      Assert.deepStrictEqual(da.rollback['calls'].length, 1)
      Assert.deepStrictEqual(da.rollback['calls'].map(x => x.args[0]), [ 'three' ])
    })

    it('should rollback the specified migration (if migrated already)', async function () {
      await migrator.rollback('two')
      Assert.deepStrictEqual(da.rollback['calls'].length, 1)
      Assert.deepStrictEqual(da.rollback['calls'].map(x => x.args[0]), [ 'two' ])
      await migrator.rollback('four')
      Assert.deepStrictEqual(da.rollback['calls'].length, 1)
      Assert.deepStrictEqual(da.rollback['calls'].map(x => x.args[0]), [ 'two' ])
    })

    it('should rollback all migrated migrations when passed "@all"', async function () {
      await migrator.rollback('@all')
      Assert.deepStrictEqual(da.rollback['calls'].length, 3)
      Assert.deepStrictEqual(da.rollback['calls'].map(x => x.args[0]), [ 'one', 'two', 'three' ])
    })
  })
})
