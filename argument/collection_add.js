// Purpose: Add to a local collection
// Created on: 5/1/26 @ 11:04 AM

const ArgumentManager = require("../internal/argument_manager")
const Logger = require("../internal/logger")
const Manager = require("../internal/manager")

module.exports = require("../internal/argument")("Add to a local collection", ["<name>", "<addons>", "[--override]"], async () => {
    const addons = ArgumentManager.getAddons()
    const collectionName = addons.shift()
    const override = ArgumentManager.includesArgument("--override")
    const collection = Manager.get(collectionName, false)

    if (addons.length === 0) {
        Logger.error("No addons specified")
        process.exit(2)
    }

    if (collection.title != null) {
        Logger.error(`Found no collection: ${collectionName}`)
        process.exit(4)
    }

    for (const addon of addons) {
        let found = Manager.get(addon, false)[0]

        if (found == null) {
            Logger.error(`Found no addons/collections: ${addon}`)
            process.exit(4)
        }

        Manager.addToLocalCollection(collectionName, found.title ?? found.name, override)

        if (!Manager.getEnabledCollections().includes(collectionName))
            continue

        await Manager.install(found.title ?? found.name)
    }
})