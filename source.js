// Purpose: Main index
// Created on: 4/29/26 @ 11:10 PM

const {basename} = require("path")
const {readdirSync} = require("fs")

const Logger = require("./internal/logger")
const Game = require("./internal/game")
const Manager = require("./internal/manager")

const main = async () => {
    const validArguments = {}

    for (const argument of readdirSync(`${__dirname}/argument`)) {
        if (!argument.endsWith(".js"))
            continue

        try {
            validArguments[argument.substring(0, argument.length - 3)] = require(`${__dirname}//argument/${argument}`)
        } catch {}
    }

    if (process.argv.length <= 3) {
        Logger.log(`${basename(process.argv[1])} <game> <operation> [--parsable] [--dry] [...]`)

        for (const argument in validArguments) {
            const value = validArguments[argument]

            if (value.length === 0) {
                Logger.log(`   ${argument}: ${value.description}`)
                continue
            }

            Logger.log(`   ${argument} ${value.arguments.join(" ")}: ${value.description}`)
        }

        process.exit(6)
    }

    const argument = validArguments[process.argv[3]]

    if (argument == null) {
        Logger.error(`Invalid option: ${process.argv[3]}`)
        process.exit(1)
    }

    if (argument.arguments.filter(found => found.startsWith("<")).length > process.argv.length - 3) {
        Logger.error("Not enough arguments")
        process.exit(2)
    }

    Game.initialize()
    await Manager.initialize()
    await argument.action()
}

main()