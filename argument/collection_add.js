// Purpose: Add to a local collection
// Created on: 5/1/26 @ 11:04 AM

const Collections = require("../internal/collections")

module.exports = require("../internal/argument")("Add to a local collection", ["<name>", "<addon>", "[--override]"], () => {
    Collections.addLocal(process.argv[4], process.argv[5], process.argv[6] === "--override")
})