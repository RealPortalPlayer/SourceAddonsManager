// Purpose: Collection management
// Created on: 5/1/26 @ 3:03 AM

const {existsSync, mkdirSync, writeFileSync} = require("fs")

const Addons = require("./addons")

let externalCollections = null
let internalCollections = null

module.exports.initialize = async () => {
    if (!existsSync("/home/kratcy/.config/sam"))
        mkdirSync("/home/kratcy/.config/sam")

    if (!existsSync("/home/kratcy/.config/sam/collections.json"))
        writeFileSync("/home/kratcy/.config/sam/collections.json", "[]")


    externalCollections = await (await fetch("http://10.0.44.20:5113/Mods/Left 4 Dead 2/collections.json")).json()
    internalCollections = require("/home/kratcy/.config/sam/collections.json")
}

module.exports.get = name => externalCollections.filter(found => found.name === name)[0]

module.exports.install = async name => {
    const collection = module.exports.get(name)

    if (collection == null) {
        console.log(`Collection not found: ${name}`)
        return
    }

    console.log(`Installing collection: ${name}`)
    await Addons.installList(collection.ids)
}

module.exports.getAll = local => local ? internalCollections : externalCollections

module.exports.print = collection => {
    console.log(`${collection.name}:`)

    for (const addon of collection.ids)
        Addons.print(Addons.find(addon, false)[0], false)
}

module.exports.toggle = name => {
    const collection = module.exports.get(name)

    if (collection == null) {
        console.log(`Collection not found: ${name}`)
        process.exit(1)
    }

    if (!internalCollections.includes(name)) {
        console.log(`Enabling: ${name}`)
        internalCollections.push(name)
    } else {
        console.log(`Disabling: ${name}`)

        internalCollections = internalCollections.filter(collection => collection !== name)
    }

    writeFileSync("/home/kratcy/.config/sam/collections.json", JSON.stringify(internalCollections))
}