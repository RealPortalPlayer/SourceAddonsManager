// Purpose: Toggle collection
// Created on: 5/1/26 @ 3:34 AM

const Collections = require("../internal/collections")

module.exports =  require("../internal/argument")("Toggle collection", ["<collection>"], async () => {
    Collections.toggle(process.argv[4])
})