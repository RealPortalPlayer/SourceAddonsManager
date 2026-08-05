const {writeFileSync, existsSync, readdirSync} = require("fs")

const {getData, getAddonInformation, downloadAddon} = require("./.internal.js")

const files = readdirSync(".").filter(file => file.endsWith(".vpk"))
let data = require("./data.json")
let missingFromData = []
let missingFile = []

for (const file of files) {
    const id = file.substring(0, file.length - 4)
    const found = data.response.publishedfiledetails.filter(addon => addon.publishedfileid === id)

    if (found.length !== 0)
        continue

    missingFromData.push(id)
}

for (const addon of data.response.publishedfiledetails) {
    if (existsSync(`./${addon.publishedfileid}.vpk`) || addon.result !== 1)
        continue

    missingFile.push(addon.publishedfileid)
}

if (missingFromData.length === 0 && missingFile.length === 0) {
    console.log("You are missing nothing")
    process.exit()
}

console.log(`Missing from data: ${missingFromData.length}`)
console.log(`Missing files: ${missingFile.length}`)

const awaitHack = async () => {
	const {body} = getData(missingFromData)

	if (body === "]")
		return

	console.log("Getting addon information")
	console.log("This might take a while")

	const result = await getAddonInformation(body)
	let downloaded = 0

	console.log("Saving addon information")
	console.log(`Had ${data.response.resultcount} addons`)

	for (const addon of result.addons) {
        console.log(addon.publishedfileid)

		downloaded++

		data.response.publishedfiledetails.push(addon)
	}

	data.response.resultcount = data.response.publishedfiledetails.length

	writeFileSync("./data.json", JSON.stringify(data))
	console.log(`Wrote ${downloaded} new addons`)
}

awaitHack().then(() => {
    if (missingFile.length === 0) {
        console.log("You are not missing any files")
        process.exit()
    }

    const awaitHack2 = async () => {
		let {body} = getData(missingFile)

		console.log(body)

    	console.log("Getting addon information")

    	const result = await getAddonInformation(body)

    	let downloaded = 0

    	for (const addon of result.addons) {
    		downloaded++

			await downloadAddon(addon)
    	}

    	writeFileSync("./data.json", JSON.stringify(data))
    	console.log(`Wrote ${downloaded} new addons`)
    }

    awaitHack2()
})