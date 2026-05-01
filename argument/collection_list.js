// Purpose: List collections
// Created on: 5/1/26 @ 3:25 AM

const Collections = require("../internal/collections")

module.exports = require("../internal/argument")("List collections", [], () => {
    for (const collection of Collections.getAll(false))
        Collections.print(collection)
})