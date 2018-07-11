"use strict";

const { MongoClient } = require("mongodb");

const { Module } = require("../");

module.exports = class MongoDb extends Module {
  constructor({ databaseUrl, databaseName, collections }) {
    super();
    this._databaseUrl = databaseUrl;
    this._databaseName = databaseName;
    this._collections = collections || [];
  }

  getKey() {
    return "mongodb";
  }

  async start() {
    this._client = await MongoClient.connect(this._databaseUrl, { useNewUrlParser: true });
    this._db = this._client.db(this._databaseName);

    this.collections = {};
    this._collections.forEach(async collectionName => {
      let collection = this.getCollection(collectionName);
      if (!collection) {
        await this.createCollection(collectionName);
        collection = this.getCollection(collectionName);
      }
      this.collections[collectionName] = collection;
    });
    delete this._collections;
  }

  //////////////// API ////////////////

  async addToCollection(collection, item) {
    collection = typeof collection === "string" ? await this.getCollection(collection) : collection;
    if (!collection) throw new Error(`Collection ${collection} does not exist.`);
    return Array.isArray(item) ? collection.insertMany(item) : collection.insertOne(item);
  }

  createCollection(name, validator) {
    return this._db.createCollection(name, validator || {});
  }

  async deleteFromCollection(collection, item) {
    collection = typeof collection === "string" ? await this.getCollection(collection) : collection;
    if (!collection) throw new Error(`Collection ${collection} does not exist.`);
    return Array.isArray(item) ? collection.deleteMany(item) : collection.deleteOne(item);
  }

  async findInCollection(collection, item) {
    collection = typeof collection === "string" ? await this.getCollection(collection) : collection;
    if (!collection) throw new Error(`Collection ${collection} does not exist.`);
    return Array.isArray(item) ? (await collection.find(item)).toArray() : collection.findOne(item);
  }

  getCollection(name) {
    return this._db.collection(name);
  }
};
