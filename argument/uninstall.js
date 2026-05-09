// Purpose: Uninstall addons
// Created on: 5/1/26 @ 2:59 AM

const {rmSync, mkdirSync, readdirSync, unlinkSync, existsSync} = require("fs")

const Addons = require("../internal/addons")
const Collections = require("../internal/collections")
const Paths = require("../internal/paths")
const Logger = require("../internal/logger")
const Strings = require("../internal/strings")
const Game = require("../internal/game")
const ArgumentManager = require("../internal/argument_manager")

module.exports = require("../internal/argument")("Uninstall addon", ["<addons/--all>"], async () => {
    if (ArgumentManager.includesArgument("--all")) {
        Logger.log("Uninstalling all addons")
        rmSync(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons`, {
            recursive: true
        })
        mkdirSync(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons`)

        for (const collection of Collections.getEnabled())
            await Collections.install(collection)

        return
    }

    for (const addon of ArgumentManager.getAddons()) {
        {
            const collection = Collections.get(addon)

            if (collection != null) {
                const deletePathIfExists = (path, recursive) => {
                    if (!existsSync(path))
                        return

                    rmSync(path, {
                        recursive
                    })
                }

                const uninstall = selected => {
                    for (const addon of selected.ids) {
                        {
                            const foundCollection = Collections.get(addon)

                            if (foundCollection != null) {
                                uninstall(foundCollection)
                                return
                            }
                        }

                        const loggingAddon = Addons.findOrExit(addon, false)[0]

                        Logger.log(`Deleting: [${loggingAddon.publishedfileid}] ${Strings.removeNewlineEnd(loggingAddon.title)}`)
                        Logger.debug(loggingAddon.publishedfileid)
                        deletePathIfExists(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons/${addon}`, true)
                        deletePathIfExists(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons/${addon}.${Game.getAddonExtension()}`, false)
                        deletePathIfExists(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons/${addon}.jpg`, false)
                    }
                }

                uninstall(collection)
                continue
            }
        }

        for (const file of readdirSync(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons`)) {
            if (!file.endsWith(`.${Game.getAddonExtension()}`))
                continue

            const details = Addons.findOrExit(addon, false)
            let logged = []

            for (const addon of details) {
                if (file !== addon.publishedfileid && file !== `${addon.publishedfileid}.jpg` && file !== `${addon.publishedfileid}.${Game.getAddonExtension()}`)
                    continue

                if (!logged.includes(addon.publishedfileid)) {
                    Logger.log(`Deleting: [${addon.publishedfileid}] ${Strings.removeNewlineEnd(addon.title)}`)
                    Logger.debug(addon.publishedfileid)
                    logged.push(addon.publishedfileid)
                }

                unlinkSync(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons/${file}`)
            }
        }
    }


})