// Purpose: List all addons
// Created on: 5/1/26 @ 2:50 AM

const Manager = require("../internal/manager")

module.exports = require("../internal/argument")("List all addons", ["[--include_extras]"], () => {
    for (const addon of Manager.getAllAddons())
        Manager.print(addon.title)
})