const {basename} = require("path")
const {writeFileSync, existsSync, readdirSync} = require("fs")

const files = readdirSync(".").filter(file => file.endsWith(".vpk"))
let data = require("./data.json")
let missingFromData = []
let missingFile = []

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

    missingFile.push(addon)
}

if (missingFromData.length === 0 && missingFile.length === 0) {
    console.log("You are missing nothing")
    process.exit()
}

console.log(`Missing from data: ${missingFromData.length}`)
console.log(`Missing files: ${missingFile.length}`)

const awaitHack = async () => {
    const body = new URLSearchParams()

    body.append("itemcount", missingFromData.length)

    for (let i = 0; i < missingFromData.length; i++)
	    body.append(`publishedfileids[${i}]`, missingFromData[i])

	console.log("Getting addon information")
	console.log("This might take a while")

	const response = await fetchit("https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: body
	})
	const json = await response.json()

	console.log("Saving addon information")
	console.log(`Had ${data.response.resultcount} addons`)

	let downloaded = 0

	for (const addon of json.response.publishedfiledetails) {
		if (addon.result !== 1) {
			console.log(`RIP: ${addon.publishedfileid}`)
			continue
		}

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
        const body = new URLSearchParams()

        body.append("itemcount", missingFile.length)

        for (let i = 0; i < missingFile.length; i++)
    	    body.append(`publishedfileids[${i}]`, missingFile[i])

    	console.log("Getting addon information")

    	const response = await fetchit("https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/", {
    		method: "POST",
    		headers: {
    			"Content-Type": "application/x-www-form-urlencoded"
    		},
    		body: body
    	})
    	const json = await response.json()

    	let downloaded = 0

    	for (const addon of json.response.publishedfiledetails) {
    		if (addon.result !== 1) {
    			console.log(`RIP: ${addon.publishedfileid}`)
    			continue
    		}

    		downloaded++

    		console.log(`Downloading: ${addon.publishedfileid}`)
    		writeFileSync(`./${addon.publishedfileid}.vpk`, await (await fetchit(addon.file_url)).bytes())

    		// idk if this is actually needed, but just in-case
    		writeFileSync(`./${addon.publishedfileid}.jpg`, await (await fetchit(addon.preview_url)).bytes())
    	}

    	writeFileSync("./data.json", JSON.stringify(data))
    	console.log(`Wrote ${downloaded} new addons`)
    }

    awaitHack2()
})