// Purpose: Show stats
// Created on: 5/1/26 @ 4:04 AM

const Logger =  require("../internal/logger")
const Manager = require("../internal/manager")

module.exports = require("../internal/argument")("Show stats", [], () => {
    const addons = Manager.getAllAddons()
    let dead = 0

    for (const addon of addons) {
        if (addon.result === 1)
            continue

        dead++
    }

    Logger.debug(Manager.getAllAddons().length)
    Logger.debug(Manager.getAllCollections().length)
    Logger.log(`Addons: ${addons.length} (${dead} of which were deleted off the Workshop)`)
    Logger.log(`Collections: ${Manager.getEnabledCollections().length}/${Manager.getAllCollections().length}`)


})