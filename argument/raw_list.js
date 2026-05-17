// Purpose: Print the full data.json file
// Created on: 5/17/26 @ 5:40 PM

const fetchit = require("../internal/fetchit")
const Configuration = require("../internal/configuration")

module.exports = require("../internal/argument")("Print the full data.json file", [], async () => {
    console.log(JSON.stringify(await (await fetchit(Configuration.getDataURL())).json()))
})