const assert = require('assert')
const { Client } = require('pg')
const { context: createContextMethods } = require('./context')
const { driver } = require('./driver')

describe('driver', function () {
  it('should construct a migrator', function (done) {
    const options = {
      migrationDir: './fixtures/pg-migrations',
      migrationTable: 'temp_migrations'
    }
    driver(options).then((migrator) => {
      assert.strictEqual(migrator.migrationInteractors.length, 2)
      assert.strictEqual(migrator.migrationInteractors[0].id, 'migrations table')
      assert.strictEqual(migrator.migrationInteractors[1].id, 'one')
      assert.strictEqual(migrator.migrationInteractors[1].proxy, require('../../fixtures/pg-migrations/one'))
      done()
    }).catch(done)
  })

  it('should migrate a database', async function () {
    const options = {
      migrationDir: './fixtures/pg-migrations',
      migrationTable: 'temp_migrations'
    }

    const client = new Client()
    await client.connect()
    const methods = createContextMethods(client)
    const migrator = await driver(options)

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
