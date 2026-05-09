// Purpose: Supported games
// Created on: 5/2/26 @ 3:55 AM

const Logger = require("./logger")

let name = ""
let subdirectory = ""
let addonExtension = ""

module.exports.initialize = () => {
    switch (process.argv[2]) {
        case "l4d2":
            name = "Left 4 Dead 2"
            subdirectory = "left4dead2"
            addonExtension = "vpk"
            break

        default:
            Logger.error(`Invalid game: ${process.argv[2]}`)
            process.exit(8)
    }
}

module.exports.getName = () => name
module.exports.getSubdirectory = () => subdirectory
module.exports.getAddonExtension = () => addonExtension