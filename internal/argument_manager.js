// Purpose: Manage arguments
// Created on: 5/9/26 @ 9:59 AM

const filteredArguments = [...process.argv]
const unfilteredArguments = [...process.argv]

{
    const index = process.argv.indexOf("--")

    if (index !== -1)
        filteredArguments.length = index
}

filteredArguments.shift() // node
filteredArguments.shift() // source.js
filteredArguments.shift() // <game>
filteredArguments.shift() // <operation>
unfilteredArguments.shift()
unfilteredArguments.shift()
unfilteredArguments.shift()
unfilteredArguments.shift()

module.exports.includesArgument = argument => filteredArguments.includes(argument)
module.exports.getAddons = () => unfilteredArguments.filter(argument => !argument.startsWith("--") || unfilteredArguments.indexOf(argument) > filteredArguments.length)
