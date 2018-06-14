const { parse: parseUrl } = require('url')
const { parse: parseQueryString } = require('querystring')

let config = {}

let databaseUrl = parseUrl(process.env.DATABASE_URL || '')
if (databaseUrl.protocol !== 'postgres:') {
  databaseUrl = {}
}
const [pgUser, pgPassword] = (databaseUrl.auth || '').split(':')

if (!process.env.PGSSLMODE && databaseUrl.query) {
  const q = parseQueryString(databaseUrl.query)
  if (q.sslmode) {
    // Used by the pg package, there's no 1:1 config option
    process.env.PGSSLMODE = q.sslmode
  }
}

config.pgConfig = {
  host: process.env.PGHOST || databaseUrl.hostname,
  port: process.env.PGPORT || databaseUrl.port,
  database: process.env.PGDATABASE || databaseUrl.pathname.slice(1),
  user: process.env.PGUSER || pgUser,
  password: process.env.PGPASSWORD || pgPassword
}

module.exports = config
