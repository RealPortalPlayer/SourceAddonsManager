// Purpose: Show stats
// Created on: 5/1/26 @ 4:04 AM

const Collections = require("../internal/collections")
const Addons = require("../internal/addons")

module.exports = require("../internal/argument")("Show stats", [], () => {
    console.log(`Addons: ${Addons.getAll().length}`)
    console.log(`Collections: ${Collections.getEnabled().length}/${Collections.getAll().length}`)
})