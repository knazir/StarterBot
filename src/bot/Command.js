"use strict";

module.exports = class Command {
  constructor(key, handler, options) {
    this.key = key;
    this.handler = handler;
    this.options = options || {};

    // bind handlers
    this.usage = this.usage.bind(this);
  }

  help(message) {
    const description = this.options.description || "No description exists for this command.";
    message.reply(`\`${Command.prefix}${this.key}\`: ${description}`);
  }

  usage(message) {
    const usage = this.options.usage || "No usage instructions exist for this command.";
    message.reply(`\`${Command.prefix}${this.key} ${usage}\``);
  }

  run(message, bot) {
    return this.handler(message, bot, this.usage);
  }

  authorized(user, roles) {
    const adminRoles = Object.values(roles).filter(role => role.isAdminRole());
    for (const role of adminRoles) {
      if (role.hasRole(user)) return true;
    }
    if (this.options.requiresRole) {
      return this.options.requiresRole.hasRole(user);
    } else if (this.options.requiredRoles) {
      return this.options.requiredRoles.filter(role => role.hasRole(user)).length === this.options.requiredRoles;
    } else if (this.options.requiresOneRoleOf) {
      return this.options.requiresOneRoleOf(role => role.hasRole(user)).length > 0;
    }
    return false;
  }
};
