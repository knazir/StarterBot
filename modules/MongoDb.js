"use strict";

const { MongoClient, ObjectID } = require("mongodb");

const { Module } = require("../");

module.exports = class MongoDb extends Module {
  constructor({ databaseUrl }) {
    super();
    this._databaseUrl = databaseUrl;
  }

  getKey() {
    return "mongodb";
  }

  start() {
    this._client = MongoClient.connect(this._databaseUrl, { useNewUrlParser: true });
  }

  //////////////// API ////////////////

  addToCollection(collectionName, item) {
    const collection = this._client.collection(collectionName);
    if (!collection) throw new Error(`Collection ${collectionName} does not exist.`);
    Array.isArray(item) ? collection.insertMany(item) : collection.insertOne(item);
  }

  deleteFromCollection(collectionName, item) {
    const collection = this._client.collection(collectionName);
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
