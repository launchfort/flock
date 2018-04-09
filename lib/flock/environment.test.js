const path = require('path')
const fs = require('fs')
const util = require('util')
const assert = require('assert')
const { Environment } = require('./environment')

const writeFile = util.promisify(fs.writeFile)

describe('Environment', function () {
  describe('#enumerateDrivers', function () {
    it('should enumerate the built in drivers', async function () {
      const env = new Environment()
      const drivers = await env.enumerateDrivers()
      assert.deepStrictEqual(drivers, [
        {
          id: 'flock:lib/drivers/pg',
          description: 'Flock database driver for Postgres',
          name: 'flock-pg'
        }
      ])
    })
  })

  describe('#generateMigrationBasename', function () {
    it('should throw when given an invalid migration type', async function () {
      try {
        const env = new Environment()
        await env.generateMigrationBasename('bla', 'test')
      } catch (error) {
        if (error.code !== 'EINVALIDMIGRATIONTYPE') {
          throw error
        }
      }
    })

    it('should generate a new migration file name (starting a day\'s sequence)', async function () {
      const env = new Environment()
      const basename = await env.generateMigrationBasename(
        'create-table',
        'message',
        { migrationDir: path.resolve(__dirname, '../../fixtures/env') }
      )
      const d = new Date()
      const m = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)
      const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      const timecode = `${d.getFullYear()}-${m}-${day}`
      assert.strictEqual(basename, `${timecode}--1--create-table--message.js`)
    })

    it('should generate a new migration file name (starting a day\'s sequence)', async function () {
      const migrationDir = path.resolve(__dirname, '../../fixtures/env')
      const d = new Date()
      const m = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)
      const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      const timecode = `${d.getFullYear()}-${m}-${day}`

      await writeFile(path.join(migrationDir, `${timecode}--1--create-table--message.js`), '', { encoding: 'utf8' })

      try {
        const env = new Environment()
        const basename = await env.generateMigrationBasename(
          'create-table',
          'message',
          { migrationDir: path.resolve(__dirname, '../../fixtures/env') }
        )
        assert.strictEqual(basename, `${timecode}--2--create-table--message.js`)
      } finally {
        fs.unlinkSync(path.join(migrationDir, `${timecode}--1--create-table--message.js`))
      }
    })

    describe('#getTemplateFileName', function () {
      it('should throw when given an invalid migration type', async function () {
        try {
          const env = new Environment()
          await env.getTemplateFileName('bla', 'test')
        } catch (error) {
          if (error.code !== 'EINVALIDMIGRATIONTYPE') {
            throw error
          }
        }
      })

      it('should retrieve the template file name from the database driver module', function () {
        const env = new Environment()
        const id = require.resolve('../drivers/pg')
        const templateFileName = env.getTemplateFileName('create-table', id)
        assert.strictEqual(templateFileName,
          path.resolve(id, '../templates/create-table.ejs')
        )
      })

      it('should create a migrator from a built-in driver module', async function () {
        const env = new Environment()
        const id = 'flock:lib/drivers/pg'
        const m = await env.createMigrator(id, { migrationDir: '__none__', migrationTable: 'migs' })
        assert.deepStrictEqual(m.migrationIds, [ 'create-table--migs' ])
      })
    })
  })
})
