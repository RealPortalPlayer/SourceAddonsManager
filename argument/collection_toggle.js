// Purpose: Toggle collection
// Created on: 5/1/26 @ 3:34 AM

const ArgumentManager = require("../internal/argument_manager")
const Manager = require("../internal/manager")

module.exports =  require("../internal/argument")("Toggle collection", ["<collections>"], async () => {
    for (const collection of ArgumentManager.getAddons())
        Manager.toggleCollection(collection)
})