// Purpose: Collection management
// Created on: 5/1/26 @ 3:03 AM

const {existsSync, mkdirSync, writeFileSync} = require("fs")

const Addons = require("./addons")
const Paths = require("./paths")
const Logger = require("./logger")
const fetchit = require("./fetchit")
const Configuration = require("../internal/configuration")

let collections = null
let localCollections = null

module.exports.initialize = async () => {
    if (!existsSync(Paths.getConfiguration()))
        mkdirSync(Paths.getConfiguration())

    if (!existsSync(Paths.getLocalCollections()))
        writeFileSync(Paths.getLocalCollections(), JSON.stringify({
            enabled: [],
            local: []
        }))

    // FIXME: This sucks, but there isn't really much we can do about it... Too bad.

    const handmadeCollections  = await (await fetchit(Configuration.getHandmadeCollectionsURL())).json()
    const generatedCollections  = await (await fetchit(Configuration.getGeneratedCollectionsURL())).json()

    collections = []
    collections.push(...handmadeCollections)
    collections.push(...generatedCollections)

    localCollections = require(Paths.getLocalCollections())

    for (const collection of localCollections.local) {
        const oldCollection = module.exports.get(collection.name)

        if (oldCollection == null) {
            collection.local = true

            collections.push(collection)
            continue
        }

        if (collection.override) {
            collections = collections.filter(found => found.name !== collection.name)

            oldCollection.local = true

            collections.push(collection)
            continue
        }

        for (const id of collection.ids) {
            if (oldCollection.ids.includes(id))
                continue

            oldCollection.modified = true

            oldCollection.ids.push(id)
        }
    }
}

module.exports.get = name => collections.filter(found => found.name === name)[0]

module.exports.install = async collection => {
    if (collection == null) {
        Logger.log(`Collection not found`)
        return
    }

    Logger.log(`Installing collection: ${collection.name}`)
    await Addons.installList(collection.ids)
}

module.exports.download = async collection => {
    if (collection == null) {
        Logger.log(`Collection not found`)
        return
    }

    if (!existsSync(`${process.cwd()}/${collection.name}`))
        mkdirSync(`${process.cwd()}/${collection.name}`)

    process.chdir(`${process.cwd()}/${collection.name}`)
    Logger.log(`Downloading collection: ${collection.name}`)
    await Addons.downloadList(collection.ids)
}

module.exports.getAll = () => collections

module.exports.getEnabled = () => {
    let array = []

    for (const collection of localCollections.enabled)
        array.push(module.exports.get(collection))

    return array
}

module.exports.print = (collection, includeAddons) => {
    let badge = "[P]"

    if (collection.modified)
        badge = "[M]"
    else if (collection.local)
        badge = "[L]"
    else if (collection.generated)
        badge = "[G]"

    Logger.debug(collection.name)
    Logger.log(`${localCollections.enabled.includes(collection.name) ? "* " : "  "}${badge} ${collection.name}${includeAddons ? ":" : ""}`)

    if (!includeAddons)
        return

    for (const addon of collection.ids)
        Addons.print(Addons.find(addon, false)[0], false)
}

module.exports.toggle = name => {
    const collection = module.exports.get(name)

    if (collection == null) {
        Logger.log(`Collection not found: ${name}`)
        process.exit(4)
    }

    if (!localCollections.enabled.includes(name)) {
        Logger.log(`Enabling: ${name}`)
        localCollections.enabled.push(name)
    } else {
        Logger.log(`Disabling: ${name}`)

        localCollections.enabled = localCollections.enabled.filter(collection => collection !== name)
    }

    writeFileSync(Paths.getLocalCollections(), JSON.stringify(localCollections))
}

module.exports.addLocal = (name, addon, override) => {
    if (name === addon) {
        Logger.log("You cannot add a collection to itself")
        process.exit(7)
    }

    let collection = localCollections.local.find(found => found.name === name)

    if (collection == null)
        collection = {
            name,
            ids: [],
            override: !!override
        }

    const testCollection = module.exports.get(addon)

    if (testCollection != null) {
        if (collection.ids.includes(addon)) {
            Logger.log("Collection was left unmodified")
            process.exit(1)
        }

        Logger.log(`Adding collection to collection: ${name} <- ${addon}`)

        collection.ids.push(addon)
    } else {
        const addons = Addons.find(addon, false)
        let added = 0

        for (const found of addons) {
            if (collection.ids.includes(found.publishedfileid))
                continue

            added++

            Logger.log(`Adding: ${name} <- [${found.publishedfileid}] ${found.title}`)

            collection.ids.push(found.publishedfileid)
        }

        if (added === 0) {
            Logger.log("Collection was left unmodified")
            process.exit(1)
        }
    }

    localCollections.local = localCollections.local.filter(found => found.name !== name)

    localCollections.local.push(collection)
    writeFileSync(Paths.getLocalCollections(), JSON.stringify(localCollections))
}