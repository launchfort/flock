import { readdir } from 'fs'
import * as path from 'path'
import { MigrationProvider, Migration, QueryInterface } from '../index'

export class NodeModuleMigrationProvider implements MigrationProvider {
  dir: string
  // The custom filename filter
  private filter: (fileName: string) => boolean

  constructor (dir = 'migrations', options?: { filter: (fileName: string) => boolean }) {
    const { filter = (x: string) => true } = (options || {})
    this.dir = dir
    this.filter = filter
  }

  provide (): Promise<Migration[]> {
    return new Promise((resolve, reject) => {
      readdir(this.dir, (error, files) => {
        error ? reject(error) : resolve(files)
      })
    }).then((files: string[]) => {
      return files
        // Ignore modules that start with '_' or '.'
        .filter(x => !x.startsWith('_') && !x.startsWith('.'))
        // Ignore modules that end with .db (i.e. thumbs.db)
        .filter(x => !x.endsWith('.db'))
        // Ignore modules that end with known mimetype extension
        .filter(x => /\.(?:jpg|jpeg|gif|png|pdf|docx|doc|xml|txt|css|csv|xlsx|md)$/i.test(x) === false)
        .filter(this.filter)
        // Sort files alphabetically
        .sort(((a, b) => a.localeCompare(b)))
        .map(x => new NodeModuleMigration(path.join(this.dir, x)))
    })
  }
}

export class NodeModuleMigration implements Migration {
  id: string
  module: any

  constructor (fileName) {
    try {
      this.module = require(path.resolve(fileName))
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error(`Cannot load migration as a Node module [${fileName}]. Prefix with '_' to ignore.`)
      } else {
        throw error
      }
    }

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
