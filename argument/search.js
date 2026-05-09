// Purpose: Search addons
// Created on: 5/1/26 @ 2:41 AM

const Addons = require("../internal/addons")
const ArgumentManager = require("../internal/argument_manager")

module.exports = require("../internal/argument")("Search addons", ["<addons>"], () => {
    for (const addon of ArgumentManager.getAddons())
        for (const foundAddon of Addons.findOrExit(addon, true))
            Addons.print(foundAddon, false)
})