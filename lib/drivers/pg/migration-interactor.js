const flock = require('../../flock')

/**
 * A migration interactor that will use a Postgres client to perform a migration.
 * All migrations will be ran in a SQL transaction and automatically rolled back
 * in the event of an error.
 */
class MigrationInteractor extends flock.MigrationInteractor {
  /**
   * Checks the migration table to determine if this migration has already ran.
   *
   * @param {Object} context The migration context
   * @return {Promise<boolean>}
   */
  async hasRun (context) {
    const { migrationTable, client } = context
    const query = `SELECT id FROM "${migrationTable}" WHERE id = $1`
    const values = [ this.id ]
    const result = await client.query(query, values)
    return result.rowCount === 1
  }

  up (context) {
    const { migrationTable, client } = context
    return client.query('BEGIN').then(() => {
      return super.up(context).then(() => {
        const query = `INSERT INTO "${migrationTable}" (id) VALUES($1)`
        const values = [ this.id ]
        return client.query(query, values)
      }).then(() => {
        return client.query('COMMIT')
      })
    }).catch(error => {
      return client.query('ROLLBACK').then(() => {
        return Promise.reject(error)
      })
    })
  }

  down (context) {
    const { migrationTable, client } = context

    return client.query('BEGIN').then(() => {
      return super.down(context).then(() => {
        const query = `DELETE FROM "${migrationTable}" WHERE id = $1`
        const values = [ this.id ]
        return client.query(query, values)
      }).then(() => {
        return client.query('COMMIT')
      })
    }).catch(error => {
      return client.query('ROLLBACK').then(() => {
        return Promise.reject(error)
      })
    })
  }
}

exports.MigrationInteractor = MigrationInteractor
