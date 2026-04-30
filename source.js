// Purpose: Main index
// Created on: 4/29/26 @ 11:10 PM

const {basename} = require("path")

const main = async () => {
    if (process.argv.length <= 2) {
        const executableName = basename(process.argv[1])

        console.log(`usage:  ${executableName} <operation> [...]`)
        console.log("operations:")
        console.log(`    ${executableName} {-I --install}     <mod>`)
        console.log(`    ${executableName} {-S --search}     <mod>`)
        console.log(`    ${executableName} {-L --list}`)
        return
    }

    // TODO: More than just Left 4 Dead 2?
    console.log("Getting mods")

    const mods = await (await fetch("http://10.0.44.20:5113/Mods/Left 4 Dead 2/data.json")).json()

    switch (process.argv[2]) {
        case "-I": case "--install":
            console.log("Install")
            break

        case "-S": case "--search":
            console.log("Search")
            break

        case "-L": case "--list":
            console.log("List")
            break

        default:
            console.error(`Invalid option: ${process.argv[2]}`)
            process.exit(1)
    }
}

main()