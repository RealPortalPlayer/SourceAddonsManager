// Purpose: Prevent addon from installing
// Created on: 5/21/26 @ 1:48 AM

const Manager = require("../internal/manager")
const ArgumentManager = require("../internal/argument_manager")

module.exports = require("../internal/argument")("Prevent addon from installing", ["<addon>"], () => {
    for (const addon of ArgumentManager.getAddons())
        Manager.blacklistAddon(addon)
})