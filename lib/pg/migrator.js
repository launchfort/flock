const { Client } = require('pg')
const flock = require('../flock')
const { MigrationsTableMigrationInteractor } = require('./migrations-table-migration-interactor')
const { context: createContextMethods } = require('./context')

class Migrator extends flock.Migrator {
  constructor (migrationInteractors) {
    super([
      new MigrationsTableMigrationInteractor()
    ].concat(migrationInteractors))
  }

  async connect (context) {
    const client = new Client()
    await client.connect()
    return Object.freeze(
      Object.assign(
        {},
        context,
        { client },
        createContextMethods(client)
      )
    )
  }

  async migrate (context, lastId = null) {
    context = await this.connect(context)
    const { client } = context

    return super.migrate(context, lastId).then(() => {
      return client.end()
    }, error => {
      return client.end().then(() => {
        return Promise.reject(error)
      })
    })
  }

  async rollback (context, lastId = '@latest') {
    context = await this.connect(context)
    const { client } = context

    return super.rollback(context, lastId).then(() => {
      return client.end()
    }, error => {
      return client.end().then(() => {
        return Promise.reject(error)
      })
    })
  }

  async getLatest (context) {
    context = await this.connect(context)
    const { client } = context

    return super.getLatest(context).then(lastId => {
      return client.end().then(() => lastId)
    }, error => {
      return client.end().then(() => Promise.reject(error))
    })
  }
}

exports.Migrator = Migrator
