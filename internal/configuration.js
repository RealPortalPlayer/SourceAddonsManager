// Purpose: Parsed configuration
// Created on: 5/7/26 @ 3:45 PM

const configuration = require("../configuration.json")
const Game = require("./game")

const parseGame = string => `${module.exports.getBaseURL()}${string.replaceAll("$1", Game.getName())}`

module.exports.getBaseURL = () => configuration.base
module.exports.getDataURL = () => parseGame(configuration.data)
module.exports.getVPKURL = name => parseGame(configuration.vpk).replaceAll("$2", name).replaceAll("$3", Game.getAddonExtension())
module.exports.getJPGURL = name => parseGame(configuration.jpg).replaceAll("$2", name)
module.exports.getHandmadeCollectionsURL = () => parseGame(configuration.handmade_collections)
module.exports.getGeneratedCollectionsURL = () => parseGame(configuration.generated_collections)
module.exports.getAddonsDependenciesURL = () => parseGame(configuration.addons_dependencies)