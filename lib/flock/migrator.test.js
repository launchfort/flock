const assert = require('assert')
const { Migrator } = require('./migrator')
const { spy } = require('../spy')

class TestMigrator extends Migrator {
  constructor (interactors, migrationTable, disconnectSpy) {
    super(interactors, migrationTable)
    this.disconnectSpy = disconnectSpy
  }

  connect () {
    return Promise.resolve({
      context: { migrationTable: '' },
      disconnect: this.disconnectSpy
    })
  }
}

describe('Migrator', function () {
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
        done()
      }).catch(done)
    })
  })

  describe('migrate', function () {
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
        done()
      }).catch(done)
    })
  })

  describe('rollback', function () {
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

        done()
      }).catch(done)
    })
  })
})
