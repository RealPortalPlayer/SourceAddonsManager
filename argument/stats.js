// Purpose: Show stats
// Created on: 5/1/26 @ 4:04 AM

const Logger =  require("../internal/logger")
const Manager = require("../internal/manager")

module.exports = require("../internal/argument")("Show stats", [], () => {
    Logger.debug(Manager.getAllAddons().length)
    Logger.debug(Manager.getAllCollections().length)
    Logger.log(`Addons: ${Manager.getAllAddons().length}`)
    Logger.log(`Collections: ${Manager.getEnabledCollections().length}/${Manager.getAllCollections().length}`)
})