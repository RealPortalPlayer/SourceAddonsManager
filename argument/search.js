// Purpose: Search addons
// Created on: 5/1/26 @ 2:41 AM

const ArgumentManager = require("../internal/argument_manager")
const Manager = require("../internal/manager")
const Logger = require("../internal/logger")

module.exports = require("../internal/argument")("Search addons", ["<addons>"], () => {
    for (const addon of ArgumentManager.getAddons())
        Manager.print(addon)
})