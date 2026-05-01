// Purpose: Collection management
// Created on: 5/1/26 @ 3:03 AM

const {existsSync, mkdirSync, writeFileSync} = require("fs")

const Addons = require("./addons")
const Paths = require("./paths")
const {find} = require("./addons");

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
    collections = await (await fetch("http://10.0.44.20:5113/Mods/Left 4 Dead 2/collections.json")).json()
    localCollections = require(Paths.getLocalCollections())

    for (const collection of localCollections.local) {
        const oldCollection = module.exports.get(collection.name)

        if (oldCollection == null) {
            collections.push(collection)
            continue
        }

        for (const id of collection.ids) {
            if (oldCollection.ids.includes(id))
                continue

            oldCollection.ids.push(id)
        }
    }
}

module.exports.get = name => collections.filter(found => found.name === name)[0]

module.exports.install = async collection => {
    if (collection == null) {
        console.log(`Collection not found: ${name}`)
        return
    }

    console.log(`Installing collection: ${name}`)
    await Addons.installList(collection.ids)
}

module.exports.getAll = () => collections

module.exports.getEnabled = () => {
    let array = []

    for (const collection of localCollections.enabled)
        array.push(module.exports.get(collection))

    return array
}

module.exports.print = (collection, includeAddons) => {
    console.log(`${collection.name}${includeAddons ? ":" : ""}`)

    if (!includeAddons)
        return

    for (const addon of collection.ids)
        Addons.print(Addons.find(addon, false)[0], false)
}

module.exports.toggle = name => {
    const collection = module.exports.get(name)

    if (collection == null) {
        console.log(`Collection not found: ${name}`)
        process.exit(1)
    }

    if (!localCollections.enabled.includes(name)) {
        console.log(`Enabling: ${name}`)
        localCollections.enabled.push(name)
    } else {
        console.log(`Disabling: ${name}`)

        localCollections.enabled = localCollections.enabled.filter(collection => collection !== name)
    }

    writeFileSync(Paths.getLocalCollections(), JSON.stringify(localCollections))
}

module.exports.addLocal = (name, addon) => {
    let collection = localCollections.local.find(found => found.name === name)

    if (collection == null)
        collection = {
            name,
            ids: []
        }

    const addons = Addons.find(addon, false)
    let added = 0

    for (const found of addons) {
        if (collection.ids.includes(found.publishedfileid))
            continue

        added++

        console.log(`Adding: ${name} <- [${found.publishedfileid}] ${found.title}`)

        collection.ids.push(found.publishedfileid)
    }

    if (added === 0) {
        console.log("Collection was left unmodified")
        process.exit(1)
    }

    localCollections.local = localCollections.local.filter(found => found.name !== name)

    localCollections.local.push(collection)
    writeFileSync(Paths.getLocalCollections(), JSON.stringify(localCollections))
}