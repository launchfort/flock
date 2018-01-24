class Migrator {
  constructor (migrationInteractors) {
    this.migrationInteractors = migrationInteractors.slice()
  }

  migrate (context, lastId = null) {
    const index = lastId
      ? this.migrationInteractors.findIndex(x => x.id === lastId)
      : Infinity

    if (index < 0) {
      throw new Error(`Migration with ID ${lastId} not found.`)
    }

    const migrationInteractors = this.migrationInteractors.slice(0, index + 1)

    return migrationInteractors.reduce((promise, migrationInteractor) => {
      return promise.then(async () => {
        const hasRun = await migrationInteractor.hasRun(context)
        if (!hasRun) {
          return migrationInteractor.up(context)
        }
      })
    }, Promise.resolve())
  }

  async getLatest (context) {
    const migrationInteractors = this.migrationInteractors.slice()

    while (migrationInteractors.length) {
      const migrationInteractor = migrationInteractors.pop()
      const hasRun = await migrationInteractor.hasRun(context)

      if (hasRun) {
        return migrationInteractor.id
      }
    }

    return ''
  }

  async rollback (context, lastId = '@latest') {
    if (lastId === '@latest') {
      lastId = await this.getLatest(context)

      // Nothing to actually rollback.
      if (lastId === '') {
        return
      }
    }

    const index = lastId
      ? this.migrationInteractors.findIndex(x => x.id === lastId)
      : 0

    if (index < 0) {
      throw new Error(`Migration with ID ${lastId} not found.`)
    }

    const migrationInteractors = this.migrationInteractors.slice(index).reverse()

    return migrationInteractors.reduce((p, migrationInteractor) => {
      return p.then(async () => {
        const hasRun = await migrationInteractor.hasRun(context)
        if (hasRun) {
          return migrationInteractor.down(context)
        }
      })
    }, Promise.resolve())
  }
}

exports.Migrator = Migrator
