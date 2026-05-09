// Purpose: Search addons
// Created on: 5/1/26 @ 2:41 AM

const Addons = require("../internal/addons")

module.exports = require("../internal/argument")("Search addons", ["<addon>"], () => {
    for (const addon of Addons.findOrExit(process.argv[4], true))
        Addons.print(addon, false)
})