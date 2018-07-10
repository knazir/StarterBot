"use strict";

const FileTool = require("../src/utils/FileTool");

const modules = {};
FileTool.requireAllFilesFromDirectorySync(__dirname).forEach(Module => modules[Module.name] = Module);

module.exports = modules;
