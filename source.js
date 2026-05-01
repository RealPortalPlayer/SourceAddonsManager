// Purpose: Main index
// Created on: 4/29/26 @ 11:10 PM

const {basename} = require("path")
const {readdirSync} = require("fs")

const Addons = require("./internal/addons")
const Collections = require("./internal/collections")

const main = async () => {
    const validArguments = {}

    for (const argument of readdirSync("./argument")) {
        if (!argument.endsWith(".js"))
            continue

        validArguments[argument.substring(0, argument.length - 3)] = require(`./argument/${argument}`)
    }

    if (process.argv.length <= 2) {
        console.log(`${basename(process.argv[1])} <operation> [...]`)

        for (const argument in validArguments) {
            const value = validArguments[argument]

            if (value.length === 0) {
                console.log(`   ${argument}: ${value.description}`)
                continue
            }

            console.log(`   ${argument} ${value.arguments.join(" ")}: ${value.description}`)
        }

        return
    }

    const argument = validArguments[process.argv[2]]

    if (argument == null) {
        console.error(`Invalid option: ${process.argv[2]}`)
        process.exit(1)
    }

    if (argument.arguments.filter(found => found.startsWith("<")).length > process.argv.length - 3) {
        console.log("Not enough arguments")
        process.exit(1)
    }

    await Addons.initialize()
    await Collections.initialize()
    await argument.action()
}

main()