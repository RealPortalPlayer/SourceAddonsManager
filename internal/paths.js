// Purpose: Easy to get paths
// Created on: 5/1/26 @ 8:13 AM

const {userInfo, platform} = require("os")
const configuration = require("../configuration.json")

module.exports.getConfiguration = () => {
    switch (platform()) {
        case "linux": case "freebsd": case "openbsd": return `${userInfo().homedir}/.config/sam`
        case "darwin": return `${userInfo().homedir}/Library/Application Support/SourceAddonsManager`
        case "win32": return `${userInfo().homedir}/AppData/Local/SourceAddonsManager`
    }
}

module.exports.getLocalCollections = () => {
    return `${module.exports.getConfiguration()}/collections.json`
}

module.exports.getBlacklist = () => {
    return `${module.exports.getConfiguration()}/blacklist.json`
}

module.exports.getSteamApplications = () => {
    if (configuration.custom_steamapps_path != null)
        return configuration.custom_steamapps_path

    // TODO: This could be changed
    switch (platform()) {
        case "linux": case "freebsd": case "openbsd": return `${userInfo().homedir}/.local/share/Steam/steamapps`
        // TODO: macOS
        // TODO: The C: drive letter can be changed
        case "win32": return "C:\\Program Files (x86)\\Steam\\steamapps"
    }
}