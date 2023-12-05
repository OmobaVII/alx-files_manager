import sha1 from 'sha1';
import Queue from 'bull/lib/queue';

import dbClient from '../utils/db';

const userQueue = new Queue('email sending');

class UsersController {
  static async postNew(request, response) {
    const email = request.body ? request.body.email : null;
    const password = request.body ? request.body.password : null;
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }
    const existingUser = await (await dbClient.usersCollection()).findOne({ email });
    if (existingUser) {
      response.status(400).json({ error: 'Already exist' });
      return;
    }
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: sha1(password) });
    const userId = insertionInfo.insertedId.toString();
    userQueue.add({ userId });
    response.status(201).json({ email, id: userId });
  }

  static async getMe(request, response) {
    const { user } = request;
    response.status(200).json({ email: user.email, id: user._id.toString() });
  }
}

module.exports = UsersController;
