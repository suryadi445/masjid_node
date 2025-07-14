#!/bin/bash

echo "🔄 Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  echo "🔄 Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
  sleep 1
done
echo "✅ PostgreSQL is up - continuing..."

echo "🔧 Running database setup..."
node createDatabase.js
npx knex migrate:latest --knexfile knexfile.js
npx knex seed:run --knexfile knexfile.js
echo "✅ Database setup complete."


exec "$@"
