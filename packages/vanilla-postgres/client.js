import pkg from 'pg';
const { Client } = pkg;


const client = new Client({
  host: 'localhost',
  user: 'your-username',
  password: 'your-password',
  database: 'postgres',
  port: 5433,
});



export default client;
