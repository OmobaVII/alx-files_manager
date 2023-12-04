const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const AppController = {
  async getStatus(request, response) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();
    if (dbStatus && redisStatus) {
      return response.status(200).json({ redis: true, db: true });
    } else {
      return response.status(500).json({ redis: false, db: false });
    }
  },

  async getStats(request, response) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      return response.status(200).json({ users: usersCount, files: filesCount })
    } catch (err) {
      return response.status(500).json({ error: 'Error fetching stats' });
    }
  },
};

module.exports = AppController;
