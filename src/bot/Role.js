"use strict";

module.exports = class Role {
  constructor(name, id, admin) {
    this.name = name;
    this.id = id;
    this.admin = admin;
  }

  hasRole(user) {
    return user.roles.find("name", this.name) || user.roles.find("id", this.id);
  }

  isAdminRole() {
    return this.admin;
  }
};
