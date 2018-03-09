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
      assert.strictEqual(migrator.migrationInteractors.length, 2)
      assert.strictEqual(migrator.migrationInteractors[0].id, 'migrations table')
      assert.strictEqual(migrator.migrationInteractors[1].id, 'one')
      assert.strictEqual(migrator.migrationInteractors[1].proxy, require('./fixtures/pg-migrations/one'))
      done()
    }).catch(done)
  })

  it('should migrate a database', async function () {
    const options = {
      migrationDir: path.resolve(__dirname, './fixtures/pg-migrations'),
      migrationTable: 'temp_migrations'
    }

    const client = new Client()
    await client.connect()
    const methods = createContextMethods(client)
    const migrator = await createMigrator(options)

    try {
      let exists = await methods.tableExists('temp_migrations')
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
        await migrator.rollback()
        assert.strictEqual(await methods.tableExists('messages'), false)
      } finally {
        client.end()
      }
    }
  })
})
