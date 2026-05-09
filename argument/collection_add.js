// Purpose: Add to a local collection
// Created on: 5/1/26 @ 11:04 AM

const Collections = require("../internal/collections")
const Addons = require("../internal/addons")

module.exports = require("../internal/argument")("Add to a local collection", ["<name>", "<addon>", "[--override]"], async () => {
    Collections.addLocal(process.argv[4], process.argv[5], process.argv[6] === "--override")

    const collection = Collections.get(process.argv[4])

    if (!Collections.getEnabled().includes(collection))
        return

    await Addons.install(Addons.findOrExit(process.argv[5], false)[0])
})