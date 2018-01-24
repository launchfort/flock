exports.up = function (context) {
  const { client } = context
  const query =
`CREATE TABLE IF NOT EXISTS messages (
  id SERIAL,
  created_at timestamp DEFAULT current_timestamp,
  PRIMARY KEY (id)
)`
  return client.query(query)
}

exports.down = function (context) {
  const { client } = context
  const query = `DROP TABLE IF EXISTS messages`
  return client.query(query)
}
