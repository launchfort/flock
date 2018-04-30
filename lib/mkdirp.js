const fs = require('fs')
const path = require('path')

function mkdirp (dir) {
  if (!dir) {
    return Promise.reject(new Error('Empty directory encountered'))
  }

  return mkdir(dir).catch(error => {
    if (error.code === 'ENOENT') {
      return mkdirp(path.dirname(dir)).then(() => {
        return mkdir(dir)
      })
    } else if (error.code === 'EEXIST') {
      return Promise.resolve()
    } else {
      return Promise.reject(error)
    }
  })
}
function mkdir (dir) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, error => {
      error ? reject(error) : resolve()
    })
  })
}

exports.mkdirp = mkdirp
