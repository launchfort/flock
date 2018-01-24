const flock = require('./lib/flock')
const pg = require('./lib/pg')

module.exports = flock
flock.plugins = {
  pg
}
