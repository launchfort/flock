import * as FileSystem from 'fs'

export function touch (fileName) {
  return new Promise<void>((resolve, reject) => {
    FileSystem.writeFile(fileName, '', { encoding: 'utf8' }, error => {
      error ? reject(error) : resolve()
    })
  })
}
