import { readdir } from 'fs'
import * as path from 'path'
import { MigrationProvider, Migration, QueryInterface } from '../index'

export class NodeModuleMigrationProvider implements MigrationProvider {
  dir: string

  constructor (dir = 'migrations') {
    this.dir = dir
  }

  provide (): Promise<Migration[]> {
    return new Promise((resolve, reject) => {
      readdir(this.dir, (error, files) => {
        error ? reject(error) : resolve(files)
      })
    }).then((files: string[]) => {
      return files.map(x => new NodeModuleMigration(path.join(this.dir, x)))
    })
  }
}

export class NodeModuleMigration implements Migration {
  id: string
  module: any

  constructor (fileName) {
    this.module = require(path.resolve(fileName))
    this.id = path.basename(fileName, path.extname(fileName))

    if (!this.module) {
      throw new Error('Invalid migration, must have an up() and down() functions')
    } else if (typeof this.module.up !== 'function') {
      throw new Error('Migration missing up() function')
    } else if (typeof this.module.down !== 'function') {
      throw new Error('Migration missing down() function')
    }
  }

  up (queryInterface: QueryInterface) {
    return this.module.up(queryInterface)
  }

  down (queryInterface: QueryInterface) {
    return this.module.down(queryInterface)
  }
}
