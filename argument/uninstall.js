// Purpose: Uninstall addons
// Created on: 5/1/26 @ 2:59 AM

const {rmSync, mkdirSync, readdirSync, unlinkSync, existsSync} = require("fs")

const Addons = require("../internal/addons")
const Collections = require("../internal/collections")
const Paths = require("../internal/paths")
const Logger = require("../internal/logger")
const Strings = require("../internal/strings")
const Game = require("../internal/game")

module.exports = require("../internal/argument")("Uninstall addon", ["<addon/--all>"], async () => {
    if (process.argv[4] === "--all") {
        Logger.log("Uninstalling all addons")
        rmSync(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons`, {
            recursive: true
        })
        mkdirSync(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons`)

        for (const collection of Collections.getEnabled())
            await Collections.install(collection)

        return
    }

    {
        const collection = Collections.get(process.argv[4])

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
            return
        }
    }

    for (const file of readdirSync(`${Paths.getSteamApplications()}/common/${Game.getName()}/${Game.getSubdirectory()}/addons`)) {
        if (!file.endsWith(`.${Game.getAddonExtension()}`))
            continue

        const details = Addons.findOrExit(process.argv[4], true)
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
})