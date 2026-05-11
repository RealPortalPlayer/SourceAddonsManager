// Purpose: Addons/collections management
// Created on: 5/9/26 @ 3:01 PM

const Addons = require("./manager/addons")
const Collections = require("./manager/collections")
const Logger = require("./logger")
const ArgumentManager = require("./argument_manager")
const Strings = require("./strings");

let objectNamesToObjects = {
    "Collections": Collections,
    "Addons": Addons
}
let calledIdentifiers = {}

const checkFunction = (object, name) => {
    if (calledIdentifiers[name] == null)
        calledIdentifiers[name] = []

    if (calledIdentifiers[name].includes(object))
        throw new Error(`Function tried to call itself. Cannot continue. ID: ${object}.${name}`)

    calledIdentifiers[name].push(object)
}

const callFunction = (object, name, ...passedArguments) => {
    checkFunction(object, name)

    const returnValue = objectNamesToObjects[object][name](...passedArguments)

    calledIdentifiers[name].splice(calledIdentifiers[name].indexOf(object), 1)
    return returnValue
}

const callAsyncFunction = async (object, name, ...passedArguments) => {
    checkFunction(object, name)

    const returnValue = await objectNamesToObjects[object][name](...passedArguments)

    calledIdentifiers[name].splice(calledIdentifiers[name].indexOf(object), 1)
    return returnValue
}

const callCollectionsFunction = (name, ...passedArguments) => callFunction("Collections", name, ...passedArguments)
const callAddonsFunction = (name, ...passedArguments) => callFunction("Addons", name, ...passedArguments)
const callAsyncCollectionsFunction = async (name, ...passedArguments) => await callAsyncFunction("Collections", name, ...passedArguments)
const callAsyncAddonsFunction = async (name, ...passedArguments) => await callAsyncFunction("Addons", name, ...passedArguments)

const getCollection = name => callCollectionsFunction("get", name)
const getAddons = (name, fuzzy) => callAddonsFunction("get", name, fuzzy)

module.exports.initialize = async () => {
    await callAsyncAddonsFunction("initialize")
    await callAsyncCollectionsFunction("initialize")
}

module.exports.getAllCollections = () => callCollectionsFunction("getAll")
module.exports.getAllAddons = () => callAddonsFunction("getAll")
module.exports.get = (name, fuzzy) => {
    const collections = getCollection(name)

    return collections.length !== 0 ? collections : getAddons(name, fuzzy)
}
module.exports.getEnabledCollections = () => callCollectionsFunction("getEnabled")

let ignorelist = []

const installInternal = async (functionName, name) => {
    {
        const collection = getCollection(name)[0]

        if (collection != null) {
            for (const id of collection.ids) {
                const foundCollection = Collections.get(id)

                if (foundCollection != null) {
                    if (ignorelist.includes(id)) {
                        Logger.error(`Recursion loop prevented. Collection already installed earlier: ${id}`)
                        continue
                    }

                    ignorelist.push(id)
                    await installInternal(functionName, id)
                    continue
                }

                const addon = getAddons(id, false)

                if (addon.length === 0 || addon.length > 1) {
                    Logger.error(`???????????????? ${id}, ${addon.length}`)
                    continue
                }

                await installInternal(functionName, addon[0].title)
            }

            return
        }
    }

    const addon = getAddons(name, false)

    if (addon.length === 0) {
        Logger.error(`Found no addons/collections: ${name}`)
        process.exit(4)
    }

    if (addon.length > 1) {
        Logger.error("Found more than one addon. Search to narrow it down")
        process.exit(3)
    }

    await callAsyncAddonsFunction(functionName, addon[0])
}

module.exports.install = async name => {
    await installInternal("install", name)
}

module.exports.download = async name => {
    await installInternal("download", name)
}

module.exports.print = (name, fuzzy) => {
    const includeExtras = ArgumentManager.includesArgument("--include_extras")

    {
        const collection = getCollection(name)[0]
        const showEnabledOnly = ArgumentManager.includesArgument("--show_enabled_only")

        if (collection != null) {
            let badge = "[P]"

            if (collection.modified)
                badge = "[M]"
            else if (collection.local)
                badge = "[L]"
            else if (collection.generated)
                badge = "[G]"

            if (showEnabledOnly && !Collections.getEnabled().includes(collection.name))
                return

            Logger.debug(collection.name)
            Logger.log(`${Collections.getEnabled().includes(collection.name) ? "* " : "  "}${badge} ${collection.name}${includeExtras ? ":" : ""}`)

            if (!includeExtras)
                return

            for (const addon of collection.ids) {
                const foundAddon = getAddons(addon, false)[0]

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

                Logger.debug(foundAddon)
                Logger.log(`[${foundAddon.publishedfileid}] ${Strings.removeNewlineEnd(foundAddon.title)}`)
            }

            return
        }
    }

    const addon = getAddons(name, fuzzy)[0]

    if (addon == null) {
        Logger.error(`Found no addons/collections: ${name}`)
        process.exit(4)
    }

    if (process.env.SAM_PARSABLE === "1") {
        Logger.debug(addon.publishedfileid)
        return
    }

    let finalString = ""

    if (includeExtras)
        finalString += "\n============================================ "

    finalString += `[${addon.publishedfileid}] `

    if (includeExtras)
        finalString += "Addon: "

    finalString += Strings.removeNewlineEnd(addon.title)

    if (includeExtras)
        finalString += `\n${Strings.removeNewlineEnd(addon.description)}`

    Logger.log(finalString)
}

module.exports.addToLocalCollection = (name, addonName, override) => {
    callCollectionsFunction("addLocal", name, addonName, override)
}

module.exports.toggleCollection = name => {
    callCollectionsFunction("toggle", name)
}