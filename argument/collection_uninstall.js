// Purpose: Uninstall a collection
// Created on: 5/2/26 @ 2:59 AM

const {existsSync, rmSync} = require("fs")

const Collections = require("../internal/collections")
const Logger = require("../internal/logger")
const Paths = require("../internal/paths")
const Addons = require("../internal/addons")
const Strings = require("../internal/strings")

const deletePathIfExists = (path, recursive) => {
    if (!existsSync(path))
        return

    rmSync(path, {
        recursive
    })
}

module.exports = require("../internal/argument")("Uninstall a collection", ["<collection>"], () => {
    const collection = Collections.get(process.argv[4])

    if (collection == null) {
        Logger.log(`Collection not found`)
        return
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

            const loggingAddon = Addons.find(addon, false)[0]

            Logger.log(`Deleting: [${loggingAddon.publishedfileid}] ${Strings.removeNewlineEnd(loggingAddon.title)}`)
            Logger.debug(loggingAddon.publishedfileid)
            deletePathIfExists(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon}`, true)
            deletePathIfExists(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon}.vpk`, false)
            deletePathIfExists(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon}.jpg`, false)
        }
    }

    uninstall(collection)
})