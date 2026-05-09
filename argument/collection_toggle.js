// Purpose: Toggle collection
// Created on: 5/1/26 @ 3:34 AM

const Collections = require("../internal/collections")
const ArgumentManager = require("../internal/argument_manager")

module.exports =  require("../internal/argument")("Toggle collection", ["<collections>"], async () => {
    for (const collection of ArgumentManager.getAddons())
        Collections.toggle(collection)
})