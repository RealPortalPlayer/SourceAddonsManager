// Purpose: Main index
// Created on: 4/29/26 @ 11:10 PM

const {basename} = require("path")
const {writeFileSync, existsSync, mkdirSync, readdirSync} = require("fs")

const removeNewlineEnd = text => text.endsWith("\n") ? text.substring(0, text.length - 1) : text

const findAddon = (mods, shiftTimes, fuzzy) => {
    let addonName = [...process.argv]
    let addons = []

    for (let i = 0; i < shiftTimes; i++)
        addonName.shift()

    addonName = addonName.join(" ").toLowerCase()

    let checkTitle = title => title.toLowerCase().includes(addonName)
    let checkDescription = description => checkTitle(description)

    if (!fuzzy) {
        checkTitle = title => title.toLowerCase() === addonName
        checkDescription = description => false
    }

    for (const addon of mods.response.publishedfiledetails) {
        if (addon.result !== 1) {
            addon.title = "<[KRATCY]: THIS ADDON IS UNAVAILABLE ON THE STEAM WORKSHOP>"
            addon.description = "<[KRATCY]: THIS ADDON IS UNAVAILABLE ON THE STEAM WORKSHOP>"
            addon.tags = [{tag: "<[KRATCY]: THIS ADDON IS UNAVAILABLE ON THE STEAM WORKSHOP>"}]
        }

        if (!checkTitle(addon.title) && !checkDescription(addon.description)) {
            if (addon.publishedfileid === addonName) {
                addons.push(addon)
                continue
            }

            if (!fuzzy)
                continue

            let add = false

            for (const tag of addon.tags) {
                if (!tag.tag.toLowerCase().includes(addonName))
                    continue

                add = true
                break
            }

            if (!add)
                continue

            addons.push(addon)
            continue
        }

        addons.push(addon)
    }

    if (addons.length === 0) {
        console.error("Found no addons")
        process.exit(1)
    }

    return addons
}

const listAll = (mods, includeDescriptions) => {
    for (const addon of mods.response.publishedfiledetails) {
        if (addon.result !== 1) {
            addon.title = "<[KRATCY]: THIS ADDON IS UNAVAILABLE ON THE STEAM WORKSHOP>"
            addon.description = "<[KRATCY]: THIS ADDON IS UNAVAILABLE ON THE STEAM WORKSHOP>"
        }

        console.log(`${includeDescriptions ? "\n============================================" : ""}[${addon.publishedfileid}] ${includeDescriptions ? "Addon: " : ""}${removeNewlineEnd(addon.title)}${includeDescriptions ? `\n${removeNewlineEnd(addon.description)}` : ""}`)
    }
}

const main = async () => {
    if (process.argv.length <= 2 || (process.argv[2] === "collection" && process.argv.length === 3)) {
        const executableName = basename(process.argv[1])

        console.log(`${executableName} <operation> [...]`)
        console.log("   install <addon>")
        console.log("   search <addon>")
        console.log("   list [--include_descriptions]")
        console.log("   collection list")
        console.log("   collection create <name>")
        console.log("   collection add <name> <id>")
        console.log("   collection install <name>")
        return
    }

    // TODO: More than just Left 4 Dead 2?
    const mods = await (await fetch("http://10.0.44.20:5113/Mods/Left 4 Dead 2/data.json")).json()

    switch (process.argv[2]) {
        case "install":
        {
            if (process.argv.length <= 3) {
                console.log("Missing mod name")
                process.exit(1)
            }

            const addons = findAddon(mods, 3, false)

            if (addons.length > 1) {
                console.log("Found more than one addon. Search to narrow it down")
                process.exit(1)
            }

            const addon = addons[0]

            console.log(`Downloading: [${addon.publishedfileid}] ${removeNewlineEnd(addon.title)}`)

            const vpk = await fetch(`http://10.0.44.20:5113/Mods/Left 4 Dead 2/${addon.publishedfileid}.vpk`)

            if (!vpk.ok) {
                console.log("Error while trying to download addon from server")
                process.exit(1)
            }

            writeFileSync(`/home/kratcy/.steamapps/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}.vpk`, await vpk.bytes())
            break
        }

        case "search":
        {
            if (process.argv.length <= 3) {
                console.log("Missing mod name")
                process.exit(1)
            }

            for (const addon of findAddon(mods, 3, true))
                console.log(`[${addon.publishedfileid}] ${removeNewlineEnd(addon.title)}`)

            break
        }

        case "list": // TODO: Pages?
            listAll(mods, process.argv[3] === "--include_descriptions")
            break

        case "collection":
        {
            if (!existsSync("/home/kratcy/.config/sam"))
                mkdirSync("/home/kratcy/.config/sam")

            switch (process.argv[3]) {
                case "list":
                    for (const collection of readdirSync("/home/kratcy/.config/sam")) {
                        if (!collection.endsWith(".json"))
                            continue

                        const json = require(`/home/kratcy/.config/sam/${collection}`)

                        console.log(`${collection.substring(0, collection.length - 5)}:`)

                        for (const addon of json) {
                            const details = mods.response.publishedfiledetails.filter(found => found.publishedfileid === addon)

                            if (details.length === 0 || details.length > 1) {
                                console.log(`???????????????? ${details.length}`)
                                continue
                            }

                            console.log(`   [${addon}] ${removeNewlineEnd(details[0].title)}`)
                        }
                    }
                    break

                case "create":
                {
                    if (process.argv.length <= 4) {
                        console.log("Missing collection name")
                        process.exit(1)
                    }

                    if (existsSync(`/home/kratcy/.config/sam/${process.argv[4]}.json`)) {
                        console.error(`Collection already exists: ${process.argv[4]}`)
                        process.exit(1)
                    }

                    console.log(`Creating collection: ${process.argv[4]}`)
                    writeFileSync(`/home/kratcy/.config/sam/${process.argv[4]}.json`, "[]")
                    break
                }

                case "add":
                {
                    if (process.argv.length <= 4) {
                        console.log("Missing collection name")
                        process.exit(1)
                    }

                    if (!existsSync(`/home/kratcy/.config/sam/${process.argv[4]}.json`)) {
                        console.error(`Collection does not exists: ${process.argv[4]}`)
                        process.exit(1)
                    }

                    let collection = require(`/home/kratcy/.config/sam/${process.argv[4]}.json`)

                    for (const addon of findAddon(mods, 5, true)) {
                        if (collection.includes(addon.publishedfileid))
                            continue

                        console.log(`Adding to collection: ${process.argv[4]}, ${addon.publishedfileid}`)

                        collection.push(addon.publishedfileid)
                    }

                    console.log("Writing new collection file")
                    writeFileSync(`/home/kratcy/.config/sam/${process.argv[4]}.json`, JSON.stringify(collection))
                    break
                }

                case "install":
                    console.log("Collection install")
                    break

                default:
                    console.error(`Invalid collection option: ${process.argv[3]}`)
                    process.exit(1)
                    break
            }

            break
        }

        default:
            console.error(`Invalid option: ${process.argv[2]}`)
            process.exit(1)
    }
}

main()