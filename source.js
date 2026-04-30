// Purpose: Main index
// Created on: 4/29/26 @ 11:10 PM

const {basename} = require("path")

const removeNewlineEnd = text => text.endsWith("\n") ? text.substring(0, text.length - 1) : text

const findAddon = (mods, fuzzy) => {
    let addonName = process.argv
    let addons = []

    addonName.shift()
    addonName.shift()
    addonName.shift()

    addonName = addonName.join(" ").toLowerCase()

    let checkTitle = title => title.toLowerCase().includes(addonName)
    let checkDescription = description => checkTitle(description)

    if (!fuzzy) {
        checkTitle = title => title.toLowerCase() === addonName
        checkDescription = description => false
    }

    for (const addon of mods.response.publishedfiledetails) {
        if (addon.result !== 1)
            continue

        if (!checkTitle(addon.title) && !checkDescription(addon.description)) {
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

const main = async () => {
    if (process.argv.length <= 2) {
        const executableName = basename(process.argv[1])

        console.log(`${executableName} <operation> [...]`)
        console.log("   install <addon>")
        console.log("   search <addon>")
        console.log("   list")
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

            for (const addon of findAddon(mods, false))
                console.log(`Downloading: [${addon.publishedfileid}] ${removeNewlineEnd(addon.title)}`)

            break
        }

        case "search":
        {
            if (process.argv.length <= 3) {
                console.log("Missing mod name")
                process.exit(1)
            }


            for (const addon of findAddon(mods, true))
                console.log(`[${addon.publishedfileid}] ${removeNewlineEnd(addon.title)}`)

            break
        }

        case "list": // TODO: Pages?
            for (const addon of mods.response.publishedfiledetails) {
                if (addon.result !== 1)
                    continue

                console.log(`
============================================ [${addon.publishedfileid}] Addon: ${removeNewlineEnd(addon.title)}
${removeNewlineEnd(addon.description)}`)
            }

            break

        default:
            console.error(`Invalid option: ${process.argv[2]}`)
            process.exit(1)
    }
}

main()