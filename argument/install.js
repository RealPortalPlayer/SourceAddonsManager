// Purpose: Install addon
// Created on: 5/1/26 @ 2:29 AM

const Addons = require("../internal/addons")

module.exports = require("../internal/argument")("Install addon", ["<addon>"], async () => {
    const addons = Addons.find(process.argv[3], false)

    if (addons.length > 1) {
        console.log("Found more than one addon. Search to narrow it down")
        process.exit(1)
    }

    await Addons.install(addons[0])
})