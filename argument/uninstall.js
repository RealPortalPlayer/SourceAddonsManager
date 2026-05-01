// Purpose: Uninstall addons
// Created on: 5/1/26 @ 2:59 AM

const {rmSync, mkdirSync, readdirSync, unlinkSync} = require("fs")

const Addons = require("../internal/addons")
const Collections = require("../internal/collections")
const Paths = require("../internal/paths")

module.exports = require("../internal/argument")("Uninstall addon", ["<addon/--all>"], async () => {
    if (process.argv[3] === "--all") {
        console.log("Uninstalling all addons")
        rmSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons`, {
            recursive: true
        })
        mkdirSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons`)

        for (const collection of Collections.getEnabled())
            await Collections.install(collection)

        return
    }

    for (const file of readdirSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons`)) {
        if (!file.endsWith(".vpk"))
            continue

        const details = Addons.find(process.argv[3], true)

        for (const addon of details) {
            if (file !== `${addon.publishedfileid}.vpk`)
                continue

            console.log(`Deleting: [${addon.publishedfileid}] ${removeNewlineEnd(addon.title)}`)
            unlinkSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${file}`)
        }
    }
})