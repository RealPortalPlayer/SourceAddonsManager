// Purpose: Show stats
// Created on: 5/1/26 @ 4:04 AM

const Collections = require("../internal/collections")
const Addons = require("../internal/addons")
const Logger =  require("../internal/logger")

module.exports = require("../internal/argument")("Show stats", [], () => {
    Logger.debug(Addons.getAll().length)
    Logger.debug(Collections.getAll().length)
    Logger.log(`Addons: ${Addons.getAll().length}`)
    Logger.log(`Collections: ${Collections.getEnabled().length}/${Collections.getAll().length}`)
})