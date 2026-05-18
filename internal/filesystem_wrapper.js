// Purpose: Filesystem wrapper
// Created on: 5/18/26 @ 11:09 AM

const {writeFileSync, mkdirSync, rmSync, unlinkSync, cpSync} = require("fs")

const ArgumentManager = require("./argument_manager")

const dry = ArgumentManager.includesArgument("--dry")

module.exports.writeFile = (path, contents) => {
    if (dry)
        return

    writeFileSync(path, contents)
}

module.exports.mkdir = path => {
    if (dry)
        return

    mkdirSync(path)
}

module.exports.rm = (path, options) => {
    if (dry)
        return

    rmSync(path, options)
}

module.exports.unlink = path => {
    if (dry)
        return

    unlinkSync(path)
}

module.exports.cp = (path1, path2, options) => {
    if (dry)
        return

    cpSync(path1, path2, options)
}