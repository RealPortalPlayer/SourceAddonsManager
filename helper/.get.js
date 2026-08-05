const {basename} = require("path")
const {writeFileSync, existsSync} = require("fs")

const {getData, getAddonInformation, downloadAddon} = require("./.internal.js")

if (process.argv.length <= 2) {
	console.log(`Usage: ${basename(__filename)} <ids>`)
	process.exit(1)
}

if (!existsSync("./data.json"))
    writeFileSync("./data.json", JSON.stringify({
        "response": {
            "result": 1,
            "resultcount": 0,
            "publishedfiledetails": []
        }
    }))

if (!existsSync("./generated_collections.json"))
	writeFileSync("./generated_collections.json", JSON.stringify([]))

process.argv.shift()
process.argv.shift()

let {body, count} = getData(process.argv.filter(item => !existsSync(`./${item}.vpk`)))

const awaitHack = async () => {
	if (count === 0) {
		console.log("Nothing new to download")
		return
	}

	console.log("Getting addon information")

	let data = require("./data.json")

	const result = await getAddonInformation(body)
	let looped = 0
	let downloaded = 0

	console.log("Saving addon information")
	console.log(`Had ${data.response.resultcount} addons`)

	for (const addon of result.addons) {
		looped++

		if (data.response.publishedfiledetails.filter(found => found.publishedfileid === addon.publishedfileid).length !== 0)
			continue

		downloaded++

		data.response.publishedfiledetails.push(addon)
		await downloadAddon(addon)
	}

	data.response.resultcount = data.response.publishedfiledetails.length

	writeFileSync("./data.json", JSON.stringify(data))
	console.log(`Wrote ${downloaded} new addons`)
	console.log(`Failed: ${result.count - looped}`)
}

awaitHack()
