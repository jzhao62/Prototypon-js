-- init-log.sql
CREATE TABLE logs (
                      id SERIAL PRIMARY KEY,
                      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                      level VARCHAR(10) NOT NULL,
                      message TEXT NOT NULL,
                      metadata JSONB
);