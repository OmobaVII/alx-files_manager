const sha1 = require('sha1');
const dbClient = require('../utils/db');
import Queue from 'bull/lib/queue';

const userQueue = new Queue('email sending');

const UsersController = {
  async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }
    const existingUser = await dbClient.collection('users').findOne({ email });
    if (existingUser) {
      return response.status(400).json({ error: 'Already exist' });
    }
    const newUser = {
      email,
      password: sha1(password),
    };
      const inserting = await dbClient.collection('users').insertOne(newUser);
      const _id = inserting.insertedId;

      userQueue.add({ _id });
      return response.status(201).json({ email, id: _id });
    },
}

module.exports = UsersController;
