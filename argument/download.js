// Purpose: Download, but not install, an addon
// Created on: 5/1/26 @ 1:39 PM

const ArgumentManager = require("../internal/argument_manager")
const Manager = require("../internal/manager")

module.exports = require("../internal/argument")("Download an addon in the current folder", ["<addons>"], async () => {
    for (const addon of ArgumentManager.getAddons())
        await Manager.download(addon)
})