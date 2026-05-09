// Purpose: Collection management
// Created on: 5/1/26 @ 3:03 AM

const {existsSync, mkdirSync, writeFileSync} = require("fs")

const Paths = require("../paths")
const Logger = require("../logger")
const fetchit = require("../fetchit")
const Configuration = require("../configuration")
const Manager = require("../manager")

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

    let handmadeCollections = []
    let generatedCollections = []

    try {
        handmadeCollections = await (await fetchit(Configuration.getHandmadeCollectionsURL())).json()
    } catch {
        // intentionally ignored
    }

    try {
        generatedCollections = await (await fetchit(Configuration.getGeneratedCollectionsURL())).json()
    } catch {
        // intentionally ignored
    }

    collections = []
    collections.push(...handmadeCollections)
    collections.push(...generatedCollections)

    localCollections = require(Paths.getLocalCollections())

    for (const collection of localCollections.local) {
        const oldCollection = module.exports.get(collection.name)[0]

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

module.exports.get = name => collections.filter(found => found.name === name)

module.exports.getAll = () => collections

module.exports.getEnabled = () => {
    let array = []

    for (const collection of localCollections.enabled)
        array.push(module.exports.get(collection)[0].name)

    return array
}

module.exports.toggle = name => {
    const collection = module.exports.get(name)[0]

    if (collection == null) {
        Logger.error(`Collection not found: ${name}`)
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
        Logger.error("You cannot add a collection to itself")
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
            Logger.error(`Collection already includes collection: ${addon}`)
            return
        }

        Logger.log(`Adding collection to collection: ${name} <- ${addon}`)

        collection.ids.push(addon)
    } else {
        const addons = Manager.get(addon, false)
        let added = 0

        for (const found of addons) {
            if (collection.ids.includes(found.publishedfileid))
                continue

            added++

            Logger.log(`Adding: ${name} <- [${found.publishedfileid}] ${found.title}`)

            collection.ids.push(found.publishedfileid)
        }

        if (added === 0) {
            Logger.error(`Collection already includes: ${addon}`)
            return
        }
    }

    localCollections.local = localCollections.local.filter(found => found.name !== name)

    localCollections.local.push(collection)
    writeFileSync(Paths.getLocalCollections(), JSON.stringify(localCollections))
}