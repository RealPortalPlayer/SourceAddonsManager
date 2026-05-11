// Purpose: List collections
// Created on: 5/1/26 @ 3:25 AM

const ArgumentManager = require("../internal/argument_manager")
const Logger = require("../internal/logger")
const Manager = require("../internal/manager")

module.exports = require("../internal/argument")("List collections", ["[--include_extras]", "[--show_enabled_only]"], () => {
    for (const collection of Manager.getAllCollections())
        Manager.print(collection.name, false)
})