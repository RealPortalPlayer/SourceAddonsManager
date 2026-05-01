// Purpose: Download entire collections
// Created on: 5/1/26 @ 1:51 PM

const Collections = require("../internal/collections")

module.exports = require("../internal/argument")("Download entire collections", ["<collection>"], async () => {
    await Collections.download(Collections.get(process.argv[3]))
})