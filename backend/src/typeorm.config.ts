import "dotenv/config";
import { DataSource } from "typeorm";

// Debug das variáveis de ambiente
console.log("=== DEBUG VARIÁVEIS DE AMBIENTE ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USERNAME:", process.env.DB_USERNAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD );
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("===================================");

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + "/entities/*.{ts,js}"],
  migrations: ["src/migrations/*.ts"],
  synchronize: true,
  extra: {
    connectTimeout: 10000,
    connectionLimit: 10,   
  }
});
