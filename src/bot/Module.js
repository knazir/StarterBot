"use strict";

module.exports = class Module {
  getKey() {
    throw new Error(`Module ${this.constructor.name} does not implement a getKey() method.`);
  }

  start() { }
  shutdown() { }
};
