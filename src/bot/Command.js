"use strict";

module.exports = class Command {
  constructor(key, handler, options, parent) {
    this.key = key;
    this.handler = handler;
    this.options = options || {};
    this.parent = parent;
    this.subCommands = {};

    // bind handlers
    this._showUsage = this._showUsage.bind(this);
  }

  addSubCommand(key, handler, options) {
    if (!key) throw new Error("You must specify a sub command key.");
    else if (!handler) throw new Error("You must specify a sub command handler.");
    else if (this.subCommands[key]) throw new Error(`Command already registered with key ${key}.`);
    this.subCommands[key] = new Command(key, handler, options, this);
  }

  async run(message, bot) {
    if (!this._authorized(message.member, bot.roles)) return;

    const argument = message.tokens[0];
    const subCommand = this.subCommands[argument];

    if (subCommand) {
      message.tokens = message.tokens.slice(1);
      return subCommand.run(message, bot);
    } else if (argument === "help") {
      this._showHelp(message);
    } else if (argument === "usage") {
      this._showUsage(message);
    } else {
      bot.commandWillRun(this, message);
      const result = await this.handler(message, bot, this._showUsage);
      bot.commandFinished(this, message);
      return result;
    }
  }

  toString() {
    if (!this.parent) return `${Command.prefix}${this.key}`;
    return `${this.parent.toString()} ${this.key}`;
  }

  _showHelp(message) {
    const description = this.options.description || "No description exists for this command.";
    message.reply(`\`${this.toString()}\`: ${description}`);
  }

  _showUsage(message) {
    if (!this.options.usage) message.reply(`\`${this.toString()}\`: No usage instructions exist for this command.`);
    else message.reply(`\`${this.toString()} ${this.options.usage}\``);
  }

  _authorized(user, roles) {
    const adminRoles = Object.values(roles).filter(role => role.isAdminRole());
    for (const role of adminRoles) {
      if (role.hasRole(user)) return true;
    }
    if (this.options.requiresAdmin) {
      return false; // we just checked if they were admin, so clearly they're not
    } else if (this.options.requiresRole) {
      return this.options.requiresRole.hasRole(user);
    } else if (this.options.requiredRoles) {
      return this.options.requiredRoles.filter(role => role.hasRole(user)).length === this.options.requiredRoles;
    } else if (this.options.requiresOneRoleOf) {
      return this.options.requiresOneRoleOf.filter(role => role.hasRole(user)).length > 0;
    }
    return false;
  }
};
