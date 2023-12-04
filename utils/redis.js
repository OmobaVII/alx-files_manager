const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (error) => {
      console.error('Redis Error:', error);
    });
    this.con = false;
    this.client.on('connect', () => {
      this.con = true;
    });
    this.client.on('end', () => {
      this.con = false;
    });
  }

  isAlive() {
    return this.con;
  }

  async get(key) {
    return new Promise((accept, reject) => {
      this.client.get(key, (error, response) => {
        if (error) {
          reject(error);
        } else {
          accept(response);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((accept, reject) => {
      this.client.setex(key, duration, value, (error, response) => {
        if (error) {
          reject(error);
        } else {
          accept(response);
        }
      });
    });
  }

  async del(key) {
    return new Promise((accept, reject) => {
      this.client.del(key, (error, response) => {
        if (error) {
          reject(error);
        } else {
          accept(response);
        }
      });
    });
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
