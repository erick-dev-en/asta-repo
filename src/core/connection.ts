import { Client } from "pg";

interface ConnectionOptions {
  user: string;
  password: string;
  database: string;
  hostname: string;
  port: number;
}

class DatabaseConnection {
  private client: Client;

  constructor(private options: ConnectionOptions) {
    this.client = new Client(this.options);
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Connected to the database.");
    } catch (error) {
      console.error("Failed to connect to the database:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.client.end();
      console.log("Disconnected from the database.");
    } catch (error) {
      console.error("Error during disconnection:", error);
    }
  }

  getClient() {
    return this.client;
  }
}

export default DatabaseConnection;
