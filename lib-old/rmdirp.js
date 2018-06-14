const fs = require('fs')
const path = require('path')

function rmdirp (dir) {
  return rmdir(dir).catch(error => {
    if (error.code === 'ENOTEMPTY') {
      return readdir(dir).then(files => {
        const { dirs: theDirs, files: theFiles } = files

        return Promise.all(
          theFiles.map(x => {
            return unlink(path.join(dir, x))
          })
        ).then(() => {
          return theDirs.reduce((p, x) => {
            return p.then(() => {
              return rmdirp(path.join(dir, x))
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

function rmdir (dir) {
  return new Promise((resolve, reject) => {
    fs.rmdir(dir, error => {
      error ? reject(error) : resolve()
    })
  })
}

function readdir (dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      error ? reject(error) : resolve(files)
    })
  }).then(files => {
    return Promise.all(
      files.map(file => {
        return new Promise((resolve, reject) => {
          fs.stat(path.join(dir, file), (error, stats) => {
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

function unlink (fileName) {
  return new Promise((resolve, reject) => {
    fs.unlink(fileName, error => {
      error ? reject(error) : resolve()
    })
  })
}

exports.rmdirp = rmdirp
