// Purpose: Download, but not install, an addon
// Created on: 5/1/26 @ 1:39 PM

const Addons = require("../internal/addons")
const Logger = require("../internal/logger")
const Collections = require("../internal/collections")

module.exports = require("../internal/argument")("Download an addon in the current folder", ["<addon>"], async () => {
    {
        const collection = Collections.get(process.argv[4])

        if (collection != null) {
            await Collections.download(collection)
            return
        }
    }

    const addons = Addons.findOrExit(process.argv[4], false)

    if (addons.length > 1) {
        Logger.log("Found more than one addon. Search to narrow it down")
        process.exit(3)
    }

    await Addons.download(addons[0])
})