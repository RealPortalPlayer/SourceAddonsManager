// Purpose: Install a collection
// Created on: 5/1/26 @ 3:32 AM

const Collections = require("../internal/collections")

module.exports = require("../internal/argument")("Install collection", ["<collection>"], async () => {
    await Collections.install(process.argv[3])
})