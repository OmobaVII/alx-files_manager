const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

import redisClient from '../utils/redis';

const dbCli = require('../utils/db');

class FilesController {
  static async postUpload(request, response) {
    const token = request.headers['x-token'];
    const { name, type, parentId = 0, isPublic = false, data } = request.body

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return response.status(400).json({ error: 'Missing type or invalid type provided' });
    }
    if ((type !== 'folder') && (!data)) {
      return response.status(400).json({ error: 'Missing data' });
    }
    if (parentId !== 0) {
      const parentFile = await dbCli.client.db().collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return response.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return response.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileData = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: ObjectId(parentId),
    };
    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileId = ObjectId();
      const filePath = path.join(folderPath, fileId.toString());

      const fileBuffer = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, fileBuffer);
      fileData.localPath = filePath;
    }

    try {
      const insertedFile = await dbCli.client.db().collection('files').insertOne(fileData);
      const newFile = insertedFile.ops[0];
      return response.status(201).json(newFile);
    } catch (error) {
      console.error('Error creating file:', error);
      return response.status(500).json({ error: 'Error creating file' });
    }
  }
};

module.exports = FilesController;
