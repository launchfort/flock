import * as Path from 'path'
import * as Ejs from 'ejs'

export interface TemplateRenderer {
  render (migrationType: string, context: any): Promise<string>
}

export class DefaultTemplateRenderer implements TemplateRenderer {
  private dir: string

  constructor (dir = Path.join(__dirname, 'templates')) {
    this.dir = dir
  }

  render (fileName: string, context: any) {
    return new Promise<string>((resolve, reject) => {
      Ejs.renderFile(fileName, context, (error, str) => {
        error ? reject(error) : resolve(str)
      })
    })
  }
}
