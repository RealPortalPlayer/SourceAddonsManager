// Purpose: Add to a local collection
// Created on: 5/1/26 @ 11:04 AM

const Collections = require("../internal/collections")
const Addons = require("../internal/addons")
const ArgumentManager = require("../internal/argument_manager")
const Logger = require("../internal/logger")

module.exports = require("../internal/argument")("Add to a local collection", ["<name>", "<addons>", "[--override]"], async () => {
    const addons = ArgumentManager.getAddons()
    const collectionName = addons.shift()
    const override = ArgumentManager.includesArgument("--override")
    const collection = Collections.get(collectionName)

    if (addons.length === 0) {
        Logger.error("No addons specified")
        process.exit(2)
    }

    for (const addon of addons) {
        let foundAddon = Addons.find(addon, false)
        let installFunction = Addons.install

        if (foundAddon == null) {
            foundAddon = Collections.getEnabled(addon)
            installFunction = Collections.install

            if (foundAddon == null) {
                Logger.error(`Failed to find addon: ${addon}`)
                process.exit(4)
            }
        }

        Collections.addLocal(collectionName, addon, override)

        if (!Collections.getEnabled().includes(collection))
            continue

        await (installFunction)(foundAddon)
    }
})