import * as FileSystem from 'fs'
import * as Path from 'path'

/**
 * Attempts to recursively create a directory path.
 *
 * @param dir The directory path to create
 */
export function mkdirp (dir: string): Promise<void> {
  if (!dir) {
    return Promise.reject(new Error('Empty directory encountered'))
  }

  return mkdir(dir).catch(error => {
    if (error.code === 'ENOENT') {
      return mkdirp(Path.dirname(dir)).then(() => {
        return mkdir(dir)
      })
    } else if (error.code === 'EEXIST') {
      return Promise.resolve()
    } else {
      return Promise.reject(error)
    }
  })
}

function mkdir (dir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    FileSystem.mkdir(dir, error => {
      error ? reject(error) : resolve()
    })
  })
}
