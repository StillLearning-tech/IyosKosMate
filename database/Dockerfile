# Database Dockerfile with pre-seeded schema
FROM postgres:16-alpine

# Copy initial schema & seeds to PostgreSQL entrypoint
COPY init.sql /docker-entrypoint-initdb.d/init.sql

HEALTHCHECK --interval=5s --timeout=5s --retries=5 \
  CMD pg_isready -U ${POSTGRES_USER:-kosmate} -d ${POSTGRES_DB:-kosmate_db} || exit 1
