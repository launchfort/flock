const assert = require('assert')
const { Migrator } = require('./migrator')
const { spy } = require('../spy')

class TestMigrator extends Migrator {
  constructor (interactors, migrationTable, disconnectSpy) {
    super(interactors, migrationTable)
    this.disconnectSpy = disconnectSpy
  }

  isMigrationTableReady () {
    return Promise.resolve(true)
  }

  connect () {
    return Promise.resolve({
      context: { migrationTable: '' },
      disconnect: this.disconnectSpy
    })
  }
}

describe('Migrator', function () {
  describe('migrationIds', function () {
    it('should all the migration IDs', function () {
      const migrationInteractors = [
        {
          id: 'nope',
          hasRun () { return true },
          up () {},
          down () {}
        },
        {
          id: 'one',
          hasRun () { return true },
          up () { },
          down () { }
        },
        {
          id: 'last',
          hasRun () { return false },
          up () {},
          down () {}
        }
      ]
      const migrator = new TestMigrator(migrationInteractors, 'Table', spy())
      assert.deepStrictEqual(migrator.migrationIds, [
        'nope', 'one', 'last'
      ])
    })
  })

  describe('getLatest', function () {
    it('should get the migration ID of the last migration that was migrated', function (done) {
      const migrationInteractors = [
        {
          id: 'nope',
          hasRun () { return true },
          up () {},
          down () {}
        },
        {
          id: 'one',
          hasRun () { return true },
          up () { },
          down () { }
        },
        {
          id: 'last',
          hasRun () { return false },
          up () {},
          down () {}
        }
      ]
      const migrator = new TestMigrator(migrationInteractors, 'Table', spy())

      migrator.getLatest().then(latestId => {
        assert.strictEqual(latestId, 'one')
        assert.strictEqual(migrator.disconnectSpy.calls.length, 1)
      }).then(done, done)
    })
  })

  describe('inspectMigrations', function () {
    it('should inspect each migration', function (done) {
      const migrationInteractors = [
        {
          id: 'nope',
          hasRun () { return true },
          up () {},
          down () {}
        },
        {
          id: 'one',
          hasRun () { return false },
          up () { },
          down () { }
        },
        {
          id: 'last',
          hasRun () { return false },
          up () {},
          down () {}
        }
      ]
      const migrator = new TestMigrator(migrationInteractors, 'Table', spy())

      migrator.inspectMigrations().then(result => {
        assert.deepStrictEqual(result, [
          { id: 'nope', migrated: true },
          { id: 'one', migrated: false },
          { id: 'last', migrated: false }
        ])
      }).then(done, done)
    })
  })

  describe('migrate', function () {
    it('should throw if migration ID is not found', function (done) {
      const migrationInteractors = [
        {
          id: 'one',
          hasRun: spy(),
          up: spy(),
          down: spy()
        },
        {
          id: 'two',
          hasRun: spy(() => true),
          up: spy(),
          down: spy()
        },
        {
          id: 'three',
          hasRun: spy(),
          up: spy(),
          down: spy()
        }
      ]
      const migrator = new TestMigrator(migrationInteractors, 'Table', spy())

      migrator.migrate('four').then(() => {
        done(new Error('Expected migrator.migrate to throw'))
      }).catch(() => done())
    })

    it('should call up on all migrations that have not been migrated', function (done) {
      const migrationInteractors = [
        {
          id: 'one',
          hasRun: spy(),
          up: spy(),
          down: spy()
        },
        {
          id: 'two',
          hasRun: spy(() => true),
          up: spy(),
          down: spy()
        },
        {
          id: 'three',
          hasRun: spy(),
          up: spy(),
          down: spy()
        }
      ]
      const migrator = new TestMigrator(migrationInteractors, 'Table', spy())

      migrator.migrate().then(() => {
        assert.strictEqual(migrationInteractors[0].hasRun.calls.length, 1)
        assert.strictEqual(migrationInteractors[0].up.calls.length, 1)
        assert.strictEqual(migrationInteractors[0].down.calls.length, 0)

        assert.strictEqual(migrationInteractors[1].hasRun.calls.length, 1)
        assert.strictEqual(migrationInteractors[1].up.calls.length, 0)
        assert.strictEqual(migrationInteractors[1].down.calls.length, 0)

        assert.strictEqual(migrationInteractors[2].hasRun.calls.length, 1)
        assert.strictEqual(migrationInteractors[2].up.calls.length, 1)
        assert.strictEqual(migrationInteractors[2].down.calls.length, 0)

        assert.strictEqual(migrator.disconnectSpy.calls.length, 1)
      }).then(done, done)
    })

    it('should call up on a subset of migrations', function (done) {
      const migrationInteractors = [
        {
          id: 'one',
          hasRun: spy(),
          up: spy(),
          down: spy()
        },
        {
          id: 'two',
          hasRun: spy(() => true),
          up: spy(),
          down: spy()
        },
        {
          id: 'three',
          hasRun: spy(),
          up: spy(),
          down: spy()
        }
      ]
      const migrator = new TestMigrator(migrationInteractors, 'Table', spy())

      migrator.migrate('two').then(() => {
        assert.strictEqual(migrationInteractors[0].hasRun.calls.length, 1)
        assert.strictEqual(migrationInteractors[0].up.calls.length, 1)
        assert.strictEqual(migrationInteractors[0].down.calls.length, 0)

        assert.strictEqual(migrationInteractors[1].hasRun.calls.length, 1)
        assert.strictEqual(migrationInteractors[1].up.calls.length, 0)
        assert.strictEqual(migrationInteractors[1].down.calls.length, 0)

        assert.strictEqual(migrationInteractors[2].hasRun.calls.length, 0)
        assert.strictEqual(migrationInteractors[2].up.calls.length, 0)
        assert.strictEqual(migrationInteractors[2].down.calls.length, 0)

        assert.strictEqual(migrator.disconnectSpy.calls.length, 1)
      }).then(done, done)
    })
  })

  describe('rollback', function () {
    it('should throw if migration ID is not found', function (done) {
      const migrationInteractors = [
        {
          id: 'one',
          hasRun: spy(),
          up: spy(),
          down: spy()
        },
        {
          id: 'two',
          hasRun: spy(() => true),
          up: spy(),
          down: spy()
        },
        {
          id: 'three',
          hasRun: spy(),
          up: spy(),
          down: spy()
        }
      ]
      const migrator = new TestMigrator(migrationInteractors, 'Table', spy())

      migrator.rollback('four').then(() => {
        done(new Error('Expected migrator.rollback to throw'))
      }).catch(() => done())
    })

    it('should call down on last migration that has been migrated', function (done) {
      const migrationInteractors = [
        {
          id: 'one',
          hasRun: spy(),
          up: spy(),
          down: spy()
        },
        {
          id: 'two',
          hasRun: spy(() => true),
          up: spy(),
          down: spy()
        },
        {
          id: 'three',
          hasRun: spy(),
          up: spy(),
          down: spy()
        }
      ]
      const migrator = new TestMigrator(migrationInteractors, 'Table', spy())

      migrator.rollback().then(() => {
        assert.strictEqual(migrationInteractors[0].hasRun.calls.length, 0)
        assert.strictEqual(migrationInteractors[0].up.calls.length, 0)
        assert.strictEqual(migrationInteractors[0].down.calls.length, 0)

        assert.strictEqual(migrationInteractors[1].hasRun.calls.length, 2)
        assert.strictEqual(migrationInteractors[1].up.calls.length, 0)
        assert.strictEqual(migrationInteractors[1].down.calls.length, 1)

        assert.strictEqual(migrationInteractors[2].hasRun.calls.length, 2)
        assert.strictEqual(migrationInteractors[2].up.calls.length, 0)
        assert.strictEqual(migrationInteractors[2].down.calls.length, 0)

        assert.strictEqual(migrator.disconnectSpy.calls.length, 2)
      }).then(done, done)
    })

    it('should call down on all migrations', function (done) {
      const migrationInteractors = [
        {
          id: 'one',
          hasRun: spy(() => true),
          up: spy(),
          down: spy()
        },
        {
          id: 'two',
          hasRun: spy(() => true),
          up: spy(),
          down: spy()
        },
        {
          id: 'three',
          hasRun: spy(),
          up: spy(),
          down: spy()
        }
      ]
      const migrator = new TestMigrator(migrationInteractors, 'Table', spy())

      migrator.rollback('@all').then(() => {
        assert.strictEqual(migrationInteractors[0].hasRun.calls.length, 1)
        assert.strictEqual(migrationInteractors[0].up.calls.length, 0)
        assert.strictEqual(migrationInteractors[0].down.calls.length, 1)

        assert.strictEqual(migrationInteractors[1].hasRun.calls.length, 1)
        assert.strictEqual(migrationInteractors[1].up.calls.length, 0)
        assert.strictEqual(migrationInteractors[1].down.calls.length, 1)

        assert.strictEqual(migrationInteractors[2].hasRun.calls.length, 1)
        assert.strictEqual(migrationInteractors[2].up.calls.length, 0)
        assert.strictEqual(migrationInteractors[2].down.calls.length, 0)

        assert.strictEqual(migrator.disconnectSpy.calls.length, 1)
      }).then(done, done)
    })
  })
})
