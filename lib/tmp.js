const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')

function randomFileName ({ ext = '' } = {}) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(48, (error, buffer) => {
      error ? reject(error) : resolve(buffer.toString('hex') + ext)
    })
  })
}

function tmpdir () {
  return randomFileName().then(baseName => {
    return path.join(os.tmpdir(), baseName)
  }).then(dir => {
    return new Promise((resolve, reject) => {
      fs.mkdir(dir, error => error ? reject(error) : resolve(dir))
    })
  })
}

exports.randomFileName = randomFileName
exports.tmpdir = tmpdir
