"use strict";

const Discord = require("discord.js");

const Command = require("./bot/Command");
const events = require("./discord.js/events");
const Role = require("./bot/Role");

module.exports = class Bot {
  static get events() {
    return events;
  }

  constructor({ name, commandPrefix, activityMessage, discordToken }) {
    this.name = name;
    this._commandPrefix = Command.prefix = commandPrefix;
    this._activityMessage = activityMessage;
    this._discordToken = discordToken;
    this.client = new Discord.Client();
    this.online = false;

    // bind handlers
    this._onMessage = this._onMessage.bind(this);
    this._onReady = this._onReady.bind(this);

    // setup internal event handlers
    this.client.on(Bot.events.ready, this._onReady);
    this.client.on(Bot.events.message, this._onMessage);

    // setup data structures for later
    this.channels = {};
    this.commands = {};
    this.roles = {};
  }

  addCommand(key, handler, options) {
    if (!key) throw new Error("You must specify a command key.");
    else if (!handler) throw new Error("You must specify a command handler.");
    else if (this.commands[key]) throw new Error(`Command already registered with key ${key}.`);
    this.commands[key] = new Command(key, handler, options);
  }

  removeCommand(key) {
    delete this.commands[key];
  }

  connect() {
    this.client.login(this._discordToken);
  }

  on(event, handler) {
    let eventHandler = handler;
    if (event === Bot.events.ready) {
     eventHandler = () => {
       this._onReady();
       handler();
     };
    } else if (event === Bot.events.message) {
      eventHandler = message => {
        this._onMessage(message);
        handler(message);
      };
    }
    this.client.on(event, eventHandler);
  }

  async restart() {
    await this.client.destroy();
    await this.client.login(this._discordToken);
  }

  async setActivityMessage(message) {
    if (!this.client.user) return;
    this._activityMessage = message;
    await this.restart();
  }

  setChannels(channels) {
    Object.entries(channels).forEach(([name, id]) => this.channels[name] = id);
  }

  setRoles(roles) {
    Object.entries(roles).forEach(([title, role]) => {
      this.roles[title] = role;
      title = `${title[0].toUpperCase()}${title.substring(1)}`;
      this[`is${title}`] = user => role.hasRole(user);
    });
  }

  _loadChannels() {
    Object.entries(this.channels).forEach(([name, id]) => this.channels[name] = this.client.channels.get(id));
  }

  _onMessage(message) {
    if (!message.content.startsWith(this._commandPrefix)) return;
    const tokens = message.content.substring(1).split(" ");
    const command = this.commands[tokens[0]];
    if (!command || !command.authorized(message.member, this.roles)) return;
    message.tokens = tokens.slice(1);
    if (tokens[1] === "help") command.help(message);
    else if (tokens[1] === "usage") command.usage(message);
    else command.run(message);
  }

  _onReady() {
    this.client.user.setActivity(this._activityMessage);
    this._loadChannels();
  }
};
