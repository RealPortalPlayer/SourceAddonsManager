const {basename} = require("path")
const {writeFileSync, existsSync} = require("fs")

if (process.argv.length <= 2) {
	console.log(`Usage: ${basename(__filename)} <ids>`)
	process.exit(1)
}

const fetchit = async (url, data) => {
    let attempts = 0

    while (true) {
        try {
            return await fetch(url, data)
        } catch {
            console.log(`Failed to download... attempt ${++attempts}`)
        }
    }
}

const body1 = new URLSearchParams()
const body2 = new URLSearchParams()
let count = 0

process.argv.shift()
process.argv.shift()

body1.append("collectioncount", 0)
body2.append("itemcount", 0)

for (let i = 0; i < process.argv.length; i++) {
	count++

	body1.append(`publishedfileids[${i}]`, process.argv[i])
	body2.append(`publishedfileids[${i}]`, process.argv[i])
}

body1.set("collectioncount", count)
body2.set("itemcount", count)

const awaitHack = async () => {
	if (count === 0) {
		console.log("Nothing new to download")
		return
	}

	console.log("Getting collection addons")

	const response1 = await fetchit("https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: body1
	})
	const json1 = await response1.json()

	console.log("Getting collection information")

	const response2 = await fetchit("https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: body2
	})
	const json2 = await response2.json()

	console.log("Saving collection details")

	let collections = require("./generated_collections.json")
	let idsToNames = {}

	for (const collection of json2.response.publishedfiledetails) {
		if (collection.result !== 1) {
			console.log(`RIP: ${collection.publishedfileid}`)
			continue
		}

		idsToNames[collection.publishedfileid] = collection.title

		if (collections.filter(found => found.name === collection.title).length !== 0)
			continue

		collections.push({
			name: collection.title,
			generated: true,
			ids: []
		})
	}

	let addonsToDownload = []

	console.log("Getting all addons")

	for (const collection of json1.response.collectiondetails) {
		if (collection.result !== 1) {
			console.log(`RIP: ${collection.publishedfileid}`)
			continue
		}

		for (const addon of collection.children) {
			addonsToDownload.push(addon.publishedfileid)

			const foundCollection = collections.filter(found => found.name === idsToNames[collection.publishedfileid])[0]

			if (foundCollection.ids.includes(addon.publishedfileid))
				continue

			foundCollection.ids.push(addon.publishedfileid)
		}
	}

	writeFileSync("./generated_collections.json", JSON.stringify(collections))

	process.argv = []

	process.argv.push(null)
	process.argv.push(null)
	process.argv.push(...addonsToDownload)
	require("./.get")
}

awaitHack()
