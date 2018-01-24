const assert = require('assert')
const { Client } = require('pg')
const { context: createContextMethods } = require('./context')
const { plugin } = require('./plugin')
const { loadEnvFileSync, applyEnv } = require('../env')

describe('plugin', function () {
  it('should construct a migrator and context', function (done) {
    const options = {
      directory: './fixtures/pg-migrations',
      tableName: 'temp_migrations'
    }
    plugin(options).then(({ migrator, context }) => {
      assert.deepStrictEqual(context, { tableName: 'temp_migrations' })
      assert.strictEqual(migrator.migrationInteractors.length, 2)
      assert.strictEqual(migrator.migrationInteractors[0].id, 'migrations table')
      assert.strictEqual(migrator.migrationInteractors[1].id, 'one')
      assert.strictEqual(migrator.migrationInteractors[1].proxy, require('../../fixtures/pg-migrations/one'))
      done()
    }).catch(done)
  })

  it('should migrate a database', async function () {
    const options = {
      directory: './fixtures/pg-migrations',
      tableName: 'temp_migrations'
    }

    applyEnv(loadEnvFileSync('./.test.env'))

    const client = new Client()
    await client.connect().then(() => client)
    const methods = createContextMethods(client)
    const { migrator, context } = await plugin(options)

    try {
      let exists = await methods.tableExists('temp_migrations')
      assert.strictEqual(exists, false)
      exists = await methods.tableExists('messages')
      assert.strictEqual(exists, false)
      await migrator.migrate(context)
      exists = await methods.tableExists('messages')
      assert.strictEqual(exists, true)

      const lastId = await migrator.getLatest(context)
      assert.strictEqual(lastId, 'one')
    } catch (error) {
      throw error
    } finally {
      try {
        await migrator.rollback(context, null)
        assert.strictEqual(await methods.tableExists('messages'), false)
      } finally {
        client.end()
      }
    }
  })
})
