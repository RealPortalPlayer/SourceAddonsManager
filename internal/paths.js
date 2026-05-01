// Purpose: Easy to get paths
// Created on: 5/1/26 @ 8:13 AM

const {userInfo, platform} = require("os")

module.exports.getConfiguration = () => {
    switch (platform()) {
        case "linux": case "freebsd": case "openbsd": return `${userInfo().homedir}/.config/sam`
        case "darwin": return `${userInfo().homedir}/Library/Application Support/SourceAddonsManager`
        case "win32": return `${userInfo().homedir}/AppData/Local/SourceAddonsManager`
    }
}

module.exports.getEnabledCollections = () => {
    return `${module.exports.getConfiguration()}/collections.json`
}

module.exports.getSteamApplications = () => {
    // TODO: This could be changed
    switch (platform()) {
        case "linux": case "freebsd": case "openbsd": return `${userInfo().homedir}/.local/share/Steam/steamapps`
        // TODO: macOS
        // TODO: The C: drive letter can be changed
        case "win32": return "C:\\Program Files (x86)\\Steam\\steamapps"
    }
}