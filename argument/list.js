// Purpose: List all addons
// Created on: 5/1/26 @ 2:50 AM

const Addons = require("../internal/addons")
const ArgumentManager = require("../internal/argument_manager")

module.exports = require("../internal/argument")("List all addons", ["[--include_descriptions]"], () => {
    for (const addon of Addons.getAll())
        Addons.print(addon, ArgumentManager.includesArgument("--include_descriptions"))
})