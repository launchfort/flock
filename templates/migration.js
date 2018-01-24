/*
SQL Snippets:

See: https://www.postgresql.org/docs/10/static/sql-createtable.html

  CREATE TABLE IF NOT EXISTS "TableName" (
    id SERIAL,
    created_at timestamp DEFAULT current_timestamp,
    modified_at timestamp,
    ...
    PRIMARY KEY (id)
  )

See: https://www.postgresql.org/docs/10/static/sql-altertable.html

  ALTER TABLE IF EXISTS "TableName"
    ADD COLUMN IF NOT EXISTS my_col integer
    ADD PRIMARY KEY (my_col)
    DROP COLUMN IF EXISTS other_col
    ALTER COLUMN some_col TYPE varchar(1024)

See: https://www.postgresql.org/docs/10/static/sql-droptable.html

  DROP TABLE IF EXISTS "TableName"

*/

/*
Context Methods:

tableExists(tableName): Promise<boolean>
columnExists(tableName, columnName): Promise<boolean>
columnDataType(tableName, columnName): Promise<string|null>
inspectColumn(tableName, columnName): Promise<{}>
*/

exports.up = function (context) {
  const { client } = context
  const query =
`SQL QUERY`

  return client.query(query)
}

exports.down = function (context) {
  const { client } = context
  const query =
`SQL QUERY`

  return client.query(query)
}
