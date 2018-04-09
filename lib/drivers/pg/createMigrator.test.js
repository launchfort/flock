const assert = require('assert')
const path = require('path')
const { Client } = require('pg')
const { context: createContextMethods } = require('./context')
const { createMigrator } = require('./createMigrator')

describe('createMigrator', function () {
  it('should construct a migrator', function (done) {
    const options = {
      migrationDir: path.resolve(__dirname, './fixtures/pg-migrations'),
      migrationTable: 'temp_migrations'
    }
    createMigrator(options).then((migrator) => {
      assert.strictEqual(migrator.migrationTable, options.migrationTable)
      assert.strictEqual(migrator.migrationInteractors.length, 2)
      assert.strictEqual(migrator.migrationInteractors[0].id, 'create-table--temp_migrations')
      assert.strictEqual(migrator.migrationInteractors[1].id, 'one')
      assert.strictEqual(migrator.migrationInteractors[1].proxy, require('./fixtures/pg-migrations/one'))
      done()
    }).catch(done)
  })

  it('should migrate a database', async function () {
    const migrationDir = path.resolve(__dirname, './fixtures/pg-migrations')
    const migrationTable = 'temp_migrations'

    const client = new Client()
    await client.connect()
    const methods = createContextMethods(client)
    const migrator = await createMigrator({ migrationDir, migrationTable })

    try {
      let exists = await methods.tableExists(migrationTable)
      assert.strictEqual(exists, false)
      exists = await methods.tableExists('messages')
      assert.strictEqual(exists, false)
      await migrator.migrate()
      exists = await methods.tableExists('messages')
      assert.strictEqual(exists, true)

      const lastId = await migrator.getLatest()
      assert.strictEqual(lastId, 'one')
    } catch (error) {
      throw error
    } finally {
      try {
        await migrator.rollback('@all')
        assert.strictEqual(await methods.tableExists(migrationTable), false)
        assert.strictEqual(await methods.tableExists('messages'), false)
      } finally {
        client.end()
      }
    }
  })
})
