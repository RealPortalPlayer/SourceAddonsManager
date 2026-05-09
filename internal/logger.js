// Purpose: Logging
// Created on: 5/1/26 @ 2:48 PM

module.exports.log = message => {
    if (process.env.SAM_PARSABLE === "1")
        return

    console.log(message)
}

module.exports.debug = message => {
    if (process.env.SAM_PARSABLE !== "1")
        return

    console.log(message)
}

module.exports.error = message => {
    if (process.env.SAM_PARSABLE === "1")
        return

    console.error(message)
}