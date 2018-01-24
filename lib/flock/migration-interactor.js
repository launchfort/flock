/**
 * A class that proxy's a module that exports an 'up' and 'down' function. If a
 * proxy is not sepcified then all methods of this class must be implemented.
 *
 * @property {string} id The unique ID of the migration
 * @property {{ up(context: Object): any, down(context: Object): any }} proxy The proxied module object
 */
class MigrationInteractor {
  constructor (id, proxy = null) {
    this.id = id

    this.proxy = proxy

    if (this.proxy) {
      if (typeof this.proxy.up !== 'function') {
        throw new Error(`Proxy (${this.id}) does not define an up method`)
      }

      if (typeof this.proxy.down !== 'function') {
        throw new Error(`Proxy (${this.id}) does not define a down method`)
      }
    }
  }

  /**
   * Determines if this migration has already ran.
   *
   * @abstract
   * @param {Object} context The migration context
   */
  hasRun (context) {
    throw new Error('Unimplemented')
  }

  /**
   * Run this migration.
   *
   * @param {Object} context The migration context
   */
  up (context) {
    if (this.proxy) {
      return new Promise(resolve => {
        resolve(this.proxy.up(context))
      })
    } else {
      return Promise.reject(new Error('Unimplemented'))
    }
  }

  /**
   * Rollback this migration.
   *
   * @param {Object} context The migration context
   */
  down (context) {
    if (this.proxy) {
      return new Promise(resolve => {
        resolve(this.proxy.down(context))
      })
    } else {
      return Promise.reject(new Error('Unimplemented'))
    }
  }
}

exports.MigrationInteractor = MigrationInteractor
