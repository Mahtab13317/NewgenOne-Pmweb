const reservedSQLKeyWords = [
  "CREATE",
  "PRIMARY",
  "INSERT",
  "SELECT",
  "FROM",
  "ALTER",
  "ADD",
  "DISTINCT",
  "UPDATE",
  "SET",
  "DELETE",
  "TRUNCATE",
  "AS",
  "ORDER",
  "ASC",
  "DESC",
  "BETWEEN",
  "WHERE",
  "AND",
  "OR",
  "NOT",
  "LIMIT",
  "IS",
  "DROP",
  "TABLE",
  "GROUP",
  "HAVING",
  "IN",
  "JOIN",
  "UNION",
  "EXISTS",
  "LIKE",
  "CASE",
];

export const isSQLKeywordFunc = (name) => {
  let isSQLKeyword = false;
  if (reservedSQLKeyWords?.includes(name?.trim()?.toUpperCase())) {
    isSQLKeyword = true;
  }
  return isSQLKeyword;
};
