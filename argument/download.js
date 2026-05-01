// Purpose: Download, but not install, an addon
// Created on: 5/1/26 @ 1:39 PM

const Addons = require("../internal/addons")

module.exports = require("../internal/argument")("Download an addon in the current folder", ["<addon>"], async () => {
    const addons = Addons.find(process.argv[3], false)

    if (addons.length > 1) {
        console.log("Found more than one addon. Search to narrow it down")
        process.exit(1)
    }

    await Addons.download(addons[0])
})