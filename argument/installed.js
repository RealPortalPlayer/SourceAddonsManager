// Purpose: Tell what addons you got installed
// Created on: 5/1/26 @ 8:06 PM

const {readdirSync, statSync} = require("fs")

const Paths = require("../internal/paths")
const Game = require("../internal/game")
const Manager = require("../internal/manager")

module.exports = require("../internal/argument")("Tell what addons you got installed", [], () => {
    const addons = readdirSync(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons`)

    for (const addon of addons) {
        let id = ""

        if (statSync(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons/${addon}`).isDirectory())
            id = addon
        else {
            if (addon.endsWith(".jpg") || !addon.endsWith(`.${Game.getAddonExtension()}`))
                continue

            id = addon.substring(0, addon.length - 4)
        }

        Manager.printAddons(id, false)
    }
})