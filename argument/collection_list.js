// Purpose: List collections
// Created on: 5/1/26 @ 3:25 AM

const Collections = require("../internal/collections")
const ArgumentManager = require("../internal/argument_manager")

module.exports = require("../internal/argument")("List collections", ["[--include_addons]"], () => {
    for (const collection of Collections.getAll())
        Collections.print(collection, ArgumentManager.includesArgument("--include_addons"))
})