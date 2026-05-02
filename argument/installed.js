// Purpose: Tell what addons you got installed
// Created on: 5/1/26 @ 8:06 PM

const {readdirSync, statSync} = require("fs")

const Paths = require("../internal/paths")
const Addons = require("../internal/addons")

module.exports = require("../internal/argument")("Tell what addons you got installed", [], () => {
    const addons = readdirSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons`)

    for (const addon of addons) {
        let id = ""

        if (statSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon}`).isDirectory())
            id = addon
        else {
            if (addon.endsWith(".jpg") || !addon.endsWith(".vpk"))
                continue

            id = addon.substring(0, id.length - 4)
        }

        Addons.print(Addons.find(id, false)[0], false)
    }
})