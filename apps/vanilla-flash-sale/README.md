provision postgres resource as high performance vs lite performance to benchmark the difference

- provisioned a postgres where it is limited to 0.05CPU and 50MB memory to mock a low capacity database 
- this low capacity database can be used to explore how to optimize services to work with low capacity databases
- we call such low capacity database MySql

write speed: ~170/s




- Configure ELK stack
  - docker compose 
  - configure ELK https://www.elastic.co/guide/en/elasticsearch/reference/current/create-enrollment-token.html