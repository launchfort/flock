const assert = require('assert')
const { spy } = require('../../spy')
const { MigrationsTableMigrationInteractor } = require('./migrations-table-migration-interactor')

describe('MigrationsTableMigrationInteractor', function () {
  describe('up', function () {
    it('should perform a migration', function (done) {
      const migrationTable = 'migrations'
      const context = {
        migrationTable,
        client: {
          end: spy(() => Promise.resolve()),
          query: spy(() => Promise.resolve())
        }
      }

      const migration = new MigrationsTableMigrationInteractor()

      migration.up(context).then(() => {
        assert.deepStrictEqual(
          context.client.query.calls.map(x => x.args),
          [
            [
              'BEGIN'
            ],
            [
              [
                `CREATE TABLE IF NOT EXISTS "${migrationTable}" (`,
                '  id varchar(512),',
                '  created_at timestamp DEFAULT current_timestamp,',
                '  PRIMARY KEY(id)',
                ')'
              ].join('\n')
            ],
            [
              'COMMIT'
            ]
          ]
        )
        assert.strictEqual(context.client.end.calls.length, 0)
        done()
      }).catch(done)
    })
  })

  describe('down', function () {
    it('should perform a rollback', function (done) {
      const migrationTable = 'migrations'
      const context = {
        migrationTable,
        client: {
          end: spy(() => Promise.resolve()),
          query: spy(() => Promise.resolve())
        }
      }

      const migration = new MigrationsTableMigrationInteractor()

      migration.down(context).then(() => {
        assert.deepStrictEqual(
          context.client.query.calls.map(x => x.args),
          [
            [
              'BEGIN'
            ],
            [
              `DROP TABLE IF EXISTS "${migrationTable}"`
            ],
            [
              'COMMIT'
            ]
          ]
        )
        assert.strictEqual(context.client.end.calls.length, 0)
        done()
      }).catch(done)
    })
  })
})
