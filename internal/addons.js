// Purpose: Addon management
// Created on: 5/1/26 @ 2:29 AM

const {writeFileSync, rmSync} = require("fs")
const {execSync} = require("child_process")

const Strings = require("./strings")
const Paths = require("./paths")

let mods = null

module.exports.initialize = async () => {
    // FIXME: This sucks, but there isn't really much we can do about it... Too bad.
    mods = await (await fetch("http://10.0.44.20:5113/Mods/Left 4 Dead 2/data.json")).json()
}

module.exports.getAll = () => mods.response.publishedfiledetails

module.exports.find = (addonName, fuzzy) => {
    let addons = []

    addonName = addonName.toLowerCase()

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

module.exports.install = async addon => {
    console.log(`Downloading: [${addon.publishedfileid}] ${Strings.removeNewlineEnd(addon.title)}`)

    const vpk = await fetch(`http://10.0.44.20:5113/Mods/Left 4 Dead 2/${addon.publishedfileid}.vpk`)

    if (!vpk.ok) {
        console.log("Error while trying to download addon from server")
        process.exit(1)
    }

    writeFileSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}.vpk`, await vpk.bytes())

    const jpg = await fetch(`http://10.0.44.20:5113/Mods/Left 4 Dead 2/${addon.publishedfileid}.jpg`)

    if (!jpg.ok) {
        console.log("Error while trying to download image from server. Was this addon unavailable when added?")
        console.log("The addon should still work, but it might not have an image in the addons menu")
        return
    }

    writeFileSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}.jpg`, await jpg.bytes())

    let vpkedit = null

    try {
        vpkedit = execSync("command -v vpkeditcli").toString()
        vpkedit = vpkedit.substring(0, vpkedit.length - 1)
    } catch {
        console.log("VPKEdit is not installed. Unable to fix addon images")
        return
    }

    if (!execSync(`${vpkedit} "${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}.vpk" --file-tree`).toString().includes("addoninfo.txt"))
        return // No need to try fixing the addon image if it isn't going to show up in the first place

    let magick = null

    try {
        magick = execSync("command -v magick").toString()
        magick = magick.substring(0, magick.length - 1)
    } catch {
        console.log("ImageMagick is not installed. Unable to fix addon images")
        return
    }

    try {
        execSync(`${vpkedit} "${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}.vpk" -o "${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons" --extract > /dev/null`)
    } catch {
        console.log("Failed to extract addon")
        return
    }

    try {
        execSync(`${magick} "${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}.jpg" -strip -sampling-factor 4:2:0 "${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}/addonimage.jpg"`)
    } catch {
        console.log("Failed to fix image")
        rmSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}`, {
            recursive: true
        })
    }

    rmSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}.vpk`)
    rmSync(`${Paths.getSteamApplications()}/common/Left 4 Dead 2/left4dead2/addons/${addon.publishedfileid}.jpg`)
}

module.exports.print = (addon, includeDescriptions) => {
    if (addon.result !== 1) {
        addon.title = "<[KRATCY]: THIS ADDON IS UNAVAILABLE ON THE STEAM WORKSHOP>"
        addon.description = "<[KRATCY]: THIS ADDON IS UNAVAILABLE ON THE STEAM WORKSHOP>"
    }

    let finalString = ""

    if (includeDescriptions)
        finalString += "\n============================================ "

    finalString += `[${addon.publishedfileid}] `

    if (includeDescriptions)
        finalString += "Addon: "

    finalString += Strings.removeNewlineEnd(addon.title)

    if (includeDescriptions)
        finalString += `\n${Strings.removeNewlineEnd(addon.description)}`

    console.log(finalString)
}

module.exports.installList = async ids => {
    for (const id of ids) {
        const details = module.exports.find(id, false)

        if (details.length === 0 || details.length > 1) {
            console.log(`???????????????? ${id}, ${details.length}`)
            continue
        }

        await module.exports.install(details[0])
    }
}
