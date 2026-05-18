// Purpose: Logging
// Created on: 5/1/26 @ 2:48 PM

const ArgumentManager = require("./argument_manager")

const parsable = ArgumentManager.includesArgument("--parsable")

module.exports.log = message => {
    if (parsable)
        return

    console.log(message)
}

module.exports.debug = message => {
    if (!parsable)
        return

    console.log(message)
}

module.exports.error = message => {
    if (parsable)
        return

    console.error(message)
}