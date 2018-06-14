import * as FileSystem from 'fs'
import * as OS from 'os'
import * as Path from 'path'
import * as Crypto from 'crypto'

export function randomFileName ({ ext = '' } = {}) {
  return new Promise<string>((resolve, reject) => {
    Crypto.randomBytes(48, (error, buffer) => {
      error ? reject(error) : resolve(buffer.toString('hex') + ext)
    })
  })
}

export function tmpdir () {
  return randomFileName().then(baseName => {
    return Path.join(OS.tmpdir(), baseName)
  }).then(dir => {
    return new Promise<string>((resolve, reject) => {
      FileSystem.mkdir(dir, error => error ? reject(error) : resolve(dir))
    })
  })
}
