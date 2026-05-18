// Purpose: Collection management
// Created on: 5/1/26 @ 3:03 AM

const {existsSync} = require("fs")

const Paths = require("../paths")
const Logger = require("../logger")
const fetchit = require("../fetchit")
const Configuration = require("../configuration")
const Manager = require("../manager")
const Game = require("../game")
const FilesystemWrapper = require("../filesystem_wrapper")

let collections = null
let localCollections = null

module.exports.initialize = async () => {
    if (!existsSync(Paths.getConfiguration()))
        FilesystemWrapper.mkdir(Paths.getConfiguration())

    if (!existsSync(Paths.getLocalCollections()))
        FilesystemWrapper.writeFile(Paths.getLocalCollections(), JSON.stringify({}))

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

    collections = {}
    collections[Game.getName()] = []
    collections[Game.getName()].push(...handmadeCollections)
    collections[Game.getName()].push(...generatedCollections)

    localCollections = require(Paths.getLocalCollections())

    if (localCollections[Game.getName()] == null)
        localCollections[Game.getName()] = {
            "enabled": [],
            "local": []
        }

    for (const collection of localCollections[Game.getName()].local) {
        const oldCollection = module.exports.get(collection.name)[0]

        if (oldCollection == null) {
            collection.local = true

            collections[Game.getName()].push(collection)
            continue
        }

        if (collection.override) {
            collections = collections[Game.getName()].filter(found => found.name !== collection.name)

            oldCollection.local = true

            collections[Game.getName()].push(collection)
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

module.exports.get = name => collections[Game.getName()].filter(found => found.name === name)

module.exports.getAll = () => collections[Game.getName()]

module.exports.getEnabled = () => {
    let array = []

    for (const collection of localCollections[Game.getName()].enabled)
        array.push(module.exports.get(collection)[0].name)

    return array
}

module.exports.toggle = name => {
    const collection = module.exports.get(name)[0]

    if (collection == null) {
        Logger.error(`Collection not found: ${name}`)
        process.exit(4)
    }

    if (!localCollections[Game.getName()].enabled.includes(name)) {
        Logger.log(`Enabling: ${name}`)
        localCollections[Game.getName()].enabled.push(name)
    } else {
        Logger.log(`Disabling: ${name}`)

        localCollections[Game.getName()].enabled = localCollections[Game.getName()].enabled.filter(collection => collection !== name)
    }

    FilesystemWrapper.writeFile(Paths.getLocalCollections(), JSON.stringify(localCollections))
}

module.exports.addLocal = (name, addon, override) => {
    if (name === addon) {
        Logger.error("You cannot add a collection to itself")
        process.exit(7)
    }

    let collection = localCollections[Game.getName()].local.find(found => found.name === name)

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

    localCollections[Game.getName()].local = localCollections[Game.getName()].local.filter(found => found.name !== name)

    localCollections[Game.getName()].local.push(collection)
    FilesystemWrapper.writeFile(Paths.getLocalCollections(), JSON.stringify(localCollections))
}