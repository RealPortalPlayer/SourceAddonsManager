// Purpose: Install addon
// Created on: 5/1/26 @ 2:29 AM

const ArgumentManager = require("../internal/argument_manager")
const Manager = require("../internal/manager")

module.exports = require("../internal/argument")("Install addon", ["<addons>", "--allow_more_than_one"], async () => {
    for (const addon of ArgumentManager.getAddons())
        await Manager.install(addon)
})