"use strict";

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

module.exports = class FileTool {
  static requireAllFilesFromDirectorySync(dirname) {
    const directoryPath = path.join(dirname);
    const filenames = fs.readdirSync(directoryPath);
    return filenames.map(filename => require(`${directoryPath}/${filename}`));
  }

  static async requireAllFilesFromDirectory(dirname) {
    const directoryPath = path.join(dirname);
    const filenames = await promisify(fs.readdir)(directoryPath);
    return filenames.map(filename => require(`${directoryPath}/${filename}`));
  }
};
