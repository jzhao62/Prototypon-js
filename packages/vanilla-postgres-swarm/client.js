import pkg from 'pg';
const { Client } = pkg;

const available_ports = [5432];

const clients = available_ports.map(
  (port) =>
    new Client({
      host: 'localhost',
      user: 'postgres',
      password: 'postgrespassword',
      database: 'postgres',
      port,
    }),
);

export default clients;
