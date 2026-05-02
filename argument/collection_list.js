// Purpose: List collections
// Created on: 5/1/26 @ 3:25 AM

const Collections = require("../internal/collections")

module.exports = require("../internal/argument")("List collections", ["[--include_addons]"], () => {
    for (const collection of Collections.getAll())
        Collections.print(collection, process.argv[4] === "--include_addons")
})