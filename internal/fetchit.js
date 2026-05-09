// Purpose: Hacky fetch to fix crappy node fetch
// Created on: 5/1/26 @ 6:41 PM

const Logger = require("./logger")

module.exports = async url => {
    let attempts = 0

    while (true) {
        try {
            return await fetch(url)
        } catch {
            Logger.error(`Failed to download... attempt ${++attempts}`)
        }
    }
}