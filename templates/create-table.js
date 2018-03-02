console.warn('fdsdfsdf')/*
SQL Snippets:

See: https://www.postgresql.org/docs/10/static/sql-createtable.html

  CREATE TABLE IF NOT EXISTS "TableName" (
    id SERIAL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    modified_at timestamp with time zone,
    key text,
    ...
    PRIMARY KEY (id),
    FOREIGN KEY (text)
      REFERENCES "OtherTable" (text)
      ON DELETE CASCADE
      ON UPDATE CASCADE
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
See: https://www.postgresql.org/docs/10/static/datatype.html

Common Data Types:

smallint
integer
bigint
smallserial
serial
bigserial
numeric
numeric(precision, scale) i.e. NUMERIC(4, 2) (4 digits left and right of decimal, only 2 digits permitted on right of decimal)
real
double precision
money
text
varchar(length)
char(length) (blank padded)
timestamp
timestamp with time zone
date
time
time with time zone
interval
boolean
jsonb

See: https://www.postgresql.org/docs/10/static/datatype-enum.html

CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');

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
`CREATE TABLE IF NOT EXISTS "TableName" (
  id SERIAL,
  created_at timestamp with time zone DEFAULT current_timestamp,
  modified_at timestamp with time zone,
  key text,
  ...
  PRIMARY KEY (id),
  FOREIGN KEY (text)
    REFERENCES "OtherTable" (text)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)`

  return client.query(query)
}

exports.down = function (context) {
  const { client } = context
  const query =
`DROP TABLE IF EXISTS "TableName"`

  return client.query(query)
}
