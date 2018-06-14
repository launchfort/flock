const assert = require('assert')
const path = require('path')
const { MigrationInteractorFactory } = require('./migration-interactor-factory')
const { spy } = require('../spy')

class Factory extends MigrationInteractorFactory {
  constructor () {
    super()
    this.create = spy()
  }
}

describe('MigrationInteractorFactory', function () {
  describe('createFromDirectory', function () {
    it('should scan a directory', function (done) {
      const factory = new Factory()
      factory.createFromDirectory('./fixtures/flock').then(interactors => {
        assert.strictEqual(interactors.length, 3)
        assert.strictEqual(factory.create.calls.length, 3)
        assert.deepStrictEqual(factory.create.calls.map(x => x.args), [
          [ path.resolve('./fixtures/flock', 'one.js') ],
          [ path.resolve('./fixtures/flock', 'three') ],
          [ path.resolve('./fixtures/flock', 'two.js') ]
        ])
        done()
      }).catch(done)
    })
  })
})
