-- init-log.sql
CREATE TABLE winston_logs
(
    level character varying,
    message character varying,
    meta json,
    timestamp timestamp without time zone DEFAULT now()
)