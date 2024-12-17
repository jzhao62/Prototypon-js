import pkg from 'pg';
const { Client: DatabaseClient } = pkg;

class ClientsFactory {
  constructor(numberOfClients) {
    this.clients = [];
    for (let i = 0; i < numberOfClients; i++) {
      this.clients.push(
        new DatabaseClient({
          host: 'localhost',
          user: 'postgres',
          password: 'postgrespassword',
          database: 'postgres',
          port: 5432,
        }),
      );
    }
  }

  getClients() {
    return this.clients;
  }
}

export default ClientsFactory;
