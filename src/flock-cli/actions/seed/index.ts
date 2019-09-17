import * as Flock from '../../../index'

export async function seed ({ migrator }: { migrator: Flock.Migrator }) {
  if (typeof migrator.seed === 'function') {
    const t = Date.now()
    console.log('Seed started')
    await migrator.seed()
    const time = ((Date.now() - t) / 1000).toFixed(3)
    console.log(`Seed successfully completed in ${time} seconds`)
  } else {
    console.log('Seed not present')
  }
}
