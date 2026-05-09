// Purpose: Install addon
// Created on: 5/1/26 @ 2:29 AM

const Addons = require("../internal/addons")
const Logger = require("../internal/logger")
const Collections = require("../internal/collections")

module.exports = require("../internal/argument")("Install addon", ["<addon>"], async () => {
    {
        const collection = Collections.get(process.argv[4])

        if (collection != null) {
            await Collections.install(collection)
            return
        }
    }

    const addons = Addons.findOrExit(process.argv[4], false)

    if (addons.length > 1) {
        Logger.error("Found more than one addon. Search to narrow it down")
        process.exit(3)
    }

    await Addons.install(addons[0])
})