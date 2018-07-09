"use strict";

const FileTool = require("../utils/FileTool");

const exports = {};
FileTool.requireAllFilesFromDirectorySync("./").forEach(module => exports[module.constructor.name] = module);

module.exports = exports;
