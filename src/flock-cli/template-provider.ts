import * as Path from 'path'

export interface TemplateProvider {
  /** Supported migration types (i.e. [ 'create-table', 'alter-table', 'other' ]) */
  readonly migrationTypes: string[]
  provideFileName (migrationType: string): Promise<string>
}

export class DefaultTemplateProvider implements TemplateProvider {
  readonly migrationTypes: string[] = []
  private dir: string

  constructor (dir = Path.join(__dirname, 'templates')) {
    this.dir = dir
  }

  provideFileName (migrationType: string) {
    const fileName = Path.join(this.dir, 'default.ejs')
    return Promise.resolve(fileName)
  }
}
