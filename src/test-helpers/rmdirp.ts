import * as FileSystem from 'fs'
import * as Path from 'path'

export function rmdirp (dir: string): Promise<void> {
  return rmdir(dir).catch(error => {
    if (error.code === 'ENOTEMPTY') {
      return readdir(dir).then(files => {
        const { dirs: theDirs, files: theFiles } = files

        return Promise.all(
          theFiles.map(x => {
            return unlink(Path.join(dir, x))
          })
        ).then(() => {
          return theDirs.reduce((p, x) => {
            return p.then(() => {
              return rmdirp(Path.join(dir, x))
            })
          }, Promise.resolve())
        })
      }).then(() => {
        return rmdir(dir)
      })
    } else {
      return Promise.reject(error)
    }
  })
}

function rmdir (dir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    FileSystem.rmdir(dir, error => {
      error ? reject(error) : resolve()
    })
  })
}

function readdir (dir: string) {
  return new Promise<string[]>((resolve, reject) => {
    FileSystem.readdir(dir, (error, files) => {
      error ? reject(error) : resolve(files)
    })
  }).then(files => {
    return Promise.all<{ stats: FileSystem.Stats, file: string }>(
      files.map(file => {
        return new Promise((resolve, reject) => {
          FileSystem.stat(Path.join(dir, file), (error, stats) => {
            error ? reject(error) : resolve({ file, stats })
          })
        })
      })
    ).then(files => {
      const theDirs = files.filter(x => x.stats.isDirectory()).map(x => x.file)
      const theFiles = files.filter(x => x.stats.isFile()).map(x => x.file)
      return { files: theFiles, dirs: theDirs }
    })
  })
}

function unlink (fileName): Promise<void> {
  return new Promise((resolve, reject) => {
    FileSystem.unlink(fileName, error => {
      error ? reject(error) : resolve()
    })
  })
}
