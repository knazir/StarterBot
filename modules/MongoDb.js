"use strict";

const { MongoClient, ObjectID } = require("mongodb");

const { Module } = require("../");

module.exports = class MongoDb extends Module {
  constructor({ databaseUrl, collections }) {
    super();
    this._databaseUrl = databaseUrl;
    this._collections = collections || [];
  }

  getKey() {
    return "mongodb";
  }

  async start() {
    this._client = await MongoClient.connect(this._databaseUrl);
    this.collections = {};
    this._collections.forEach(collectionName => {
      let collection = this.getCollection(collectionName);
      if (!collection) {
        this.createCollection(collectionName);
        collection = this.getCollection(collectionName);
      }
      this.collections[collectionName] = collection;
    });
    delete this._collections;
  }

  //////////////// API ////////////////

  addToCollection(collection, item) {
    collection = typeof collection === "string" ? this._client.collection(collection) : collection;
    if (!collection) throw new Error(`Collection ${collection} does not exist.`);
    Array.isArray(item) ? collection.insertMany(item) : collection.insertOne(item);
  }

  deleteFromCollection(collection, item) {
    collection = typeof collection === "string" ? this._client.collection(collectionName) : collection;
    if (!collection) throw new Error(`Collection ${collectionName} does not exist.`);
    Array.isArray(item) ? collection.deleteMany(item) : collection.deleteOne(item);
  }

  createCollection(name) {
    this._client.createCollection(name);
  }

  dropDatabase() {
    this._client.dropDatabase();
  }

  getCollection(name) {
    return this._client.collection(name);
  }
};
