'use strict'


class UserModel {

    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    get id() {
        return this.id;
    }
    set id(id) {
        this.id = id;
    }

    get username() {
        return this.username;
    }
    set username (username) {
        this.username = username;
    }

    get password() {
        return this.password;
    }
    set password (password) {
        this.password = password;
    }

}

module.exports = UserModel;
