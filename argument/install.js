// Purpose: Install addon
// Created on: 5/1/26 @ 2:29 AM

const Addons = require("../internal/addons")
const Logger = require("../internal/logger")

module.exports = require("../internal/argument")("Install addon", ["<addon>"], async () => {
    const addons = Addons.find(process.argv[3], false)

    if (addons.length > 1) {
        Logger.log("Found more than one addon. Search to narrow it down")
        process.exit(3)
    }

    await Addons.install(addons[0])
})