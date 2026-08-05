const {basename} = require("path")
const {writeFileSync, existsSync} = require("fs")

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

let body = "["
let count = 0

process.argv.shift()
process.argv.shift()

for (let i = 0; i < process.argv.length; i++) {
	if (existsSync(`./${process.argv[i]}.vpk`))
		continue

	body += `${process.argv[i]},`
	count++
}

body = `${body.substring(0, body.length - 1)}]`

const awaitHack = async () => {
	if (count === 0) {
		console.log("Nothing new to download")
		return
	}

	console.log("Getting addon information")

	const response = await fetchit("https://steamworkshopdownloader.io/api/details/file", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: body
	})
	const json = await response.json()

	console.log("Saving addon information")

	let data = require("./data.json")

	console.log(`Had ${data.response.resultcount} addons`)

	let looped = 0
	let downloaded = 0

	for (const addon of json) {
		if (addon.result !== 1) {
			console.log(`RIP: ${addon.publishedfileid}`)
			continue
		}

		looped++

		if (data.response.publishedfiledetails.filter(found => found.publishedfileid === addon.publishedfileid).length !== 0)
			continue

		downloaded++

		{
			const parsedTags = []

			for (const tag of addon.tags)
				parsedTags.push({
					tag: tag.tag
				})

			data.response.publishedfiledetails.push({
				publishedfiledid: addon.publishedfileid,
				result: addon.result,
				creator: addon.creator,
				creator_app_id: addon.creator_appid,
				consumer_app_id: addon.consumer_appid,
				filename: addon.filename,
				file_size: addon.file_size,
				file_url: addon.file_url,
				hcontent_file: addon.hcontent_file,
				hcontent_preview: addon.hcontent_preview,
				title: addon.title,
				description: addon.description,
				time_created: addon.time_created,
				time_updated: addon.time_updated,
				visibility: addon.visibility,
				banned: addon.banned ? 1 : 0,
				ban_reason: addon.ban_reason,
				subscriptions: addon.subscriptions,
				favorited: addon.favorited,
				lifetime_subscriptions: addon.lifetime_subscriptions,
				lifetime_favorited: addon.livetime_favorited,
				views: addon.views,
				tags: parsedTags
			})
		}

		console.log(`Downloading: ${addon.publishedfileid}`)
		writeFileSync(`./${addon.publishedfileid}.vpk`, await (await fetchit(addon.file_url)).bytes())

		// idk if this is actually needed, but just in-case
		// TODO: It isn't always a jpg
		writeFileSync(`./${addon.publishedfileid}.jpg`, await (await fetchit(addon.preview_url)).bytes())
	}

	data.response.resultcount = data.response.publishedfiledetails.length

	writeFileSync("./data.json", JSON.stringify(data))
	console.log(`Wrote ${downloaded} new addons`)
	console.log(`Failed: ${json.response.resultcount - looped}`)
}

awaitHack()
