const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = 'localhost';
    this.port = '27017';
    this.databaseName = 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(this.url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.database = null;

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.database = this.client.db(this.databaseName);
      console.log('Connected to MongoDB!');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const userCollection = this.database.collection('users');
    const count = await userCollection.countDocuments();
    return count;
  }

  async nbFiles() {
    const fileCollection = this.database.collection('files');
    const count = await fileCollection.countDocuments();
    return count;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
