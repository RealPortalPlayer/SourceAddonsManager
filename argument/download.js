// Purpose: Download, but not install, an addon
// Created on: 5/1/26 @ 1:39 PM

const Addons = require("../internal/addons")
const Logger = require("../internal/logger")
const Collections = require("../internal/collections")
const ArgumentManager = require("../internal/argument_manager")

module.exports = require("../internal/argument")("Download an addon in the current folder", ["<addons>"], async () => {
    for (const addon of ArgumentManager.getAddons()) {
        {
            const collection = Collections.get(addon)

            if (collection != null) {
                await Collections.download(collection)
                continue
            }
        }

        const addons = Addons.findOrExit(addon, false)

        if (addons.length > 1) {
            Logger.error("Found more than one addon. Search to narrow it down")
            process.exit(3)
        }

        await Addons.download(addons[0])
    }
})