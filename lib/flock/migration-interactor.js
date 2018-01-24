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

  hasRun (context) {
    throw new Error('Unimplemented')
  }

  up (context) {
    if (this.proxy) {
      return new Promise(resolve => {
        resolve(this.proxy.up(context))
      })
    } else {
      return Promise.reject(new Error('Unimplemented'))
    }
  }

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
