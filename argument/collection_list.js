// Purpose: List collections
// Created on: 5/1/26 @ 3:25 AM

const Collections = require("../internal/collections")
const ArgumentManager = require("../internal/argument_manager")
const Logger = require("../internal/logger")
const Addons = require("../internal/addons")

module.exports = require("../internal/argument")("List collections", ["[--include_addons]"], () => {
    const includeAddons = ArgumentManager.includesArgument("--include_addons")

    for (const collection of Collections.getAll()) {
        let badge = "[P]"

        if (collection.modified)
            badge = "[M]"
        else if (collection.local)
            badge = "[L]"
        else if (collection.generated)
            badge = "[G]"

        Logger.debug(collection.name)
        Logger.log(`${Collections.getEnabled().includes(collection.name) ? "* " : "  "}${badge} ${collection.name}${includeAddons ? ":" : ""}`)

        if (!includeAddons)
            continue

        for (const addon of collection.ids) {
            const foundAddon = Addons.find(addon, false)[0]

            if (foundAddon == null) {
                const testCollection = Collections.get(addon)

                if (testCollection != null) {
                    Logger.debug(addon)
                    Logger.log(`[COLLECTION] ${addon}`)
                    continue
                }

                Logger.error(`RIP: ${addon}`)
                continue
            }

            Addons.print(foundAddon, false)
        }
    }
})