// Purpose: Internal functions
// Created on: 8/5/26 @ 3:47 PM

const {writeFileSync} = require("fs")

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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports.getData = array => {
    let body = "["
    let count = 0

    for (let i = 0; i < array.length; i++) {
        body += `${array[i]},`
        count++
    }

    return {
        body: `${body.substring(0, body.length - 1)}]`,
        count
    }
}

module.exports.getAddonInformation = async ids => {
    if (ids.length > 50) {
        console.log("Number of IDs too large. Grabbing 50 items at a time")

        let firstCall = true
        let results = []
        let count = 0
        let newIds = []

        const parseIds = async () => {
            if (newIds.length === 0)
                return

            if (!firstCall) {
                console.log("Sleeping for 10 seconds")
                await sleep(10_000)
            }

            firstCall = false

            console.log(`Parsing: ${newIds.length} addons`)

            const grabbed = await module.exports.getAddonInformation(newIds)

            results.push(...grabbed.addons)

            if (grabbed.count !== newIds.length) {
                const deadIds = newIds.filter(id => !grabbed.addons.includes(id))

                console.log("RIP the following IDs")
                console.log(deadIds.join("\n"))

                for (const id of deadIds) {
                    results.push({
                        publishedfileid: id,
                        result: 9
                    })
                }
            }

            console.log(`Parsed: ${grabbed.count}`)
            console.log(`Count: ${results.length}`)

            count += grabbed.count
            newIds = []

        }

        for (const id of ids) {
            newIds.push(id)

            if (newIds.length < 50)
                continue

            await parseIds()
        }

        await parseIds()
        return {
            addons: results,
            count
        }
    }

    const body = module.exports.getData(ids).body
    const response = await fetchit("https://steamworkshopdownloader.io/api/details/file", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body
    })

    let json = await response.json()
    let results = []
    let collections = require("./generated_collections.json")
    let addedCollections = []
    let count = 0

    for (const addon of json) {
        if (addon.result !== 1) {
            console.log(`RIP: ${addon.publishedfileid}`)
            continue
        }

        if (addon.file_url === addon.preview_url) {
            const ids = addon.children.map(addon => addon.publishedfileid)

            console.log(`Parsing collection: ${addon.publishedfileid}`)

            const grabbed = await module.exports.getAddonInformation(ids)

            count += grabbed.count

            results.push(...grabbed.addons)
            addedCollections.push({
                name: addon.title,
                generated: true,
                ids
            })
            continue
        }

        count++

        const parsedTags = []

        if (addon.tags != null) {
            for (const tag of addon.tags)
                parsedTags.push({
                    tag: tag.tag
                })
        }

        results.push({
            publishedfileid: addon.publishedfileid,
            result: addon.result,
            creator: addon.creator,
            creator_app_id: addon.creator_appid,
            consumer_app_id: addon.consumer_appid,
            filename: addon.filename,
            file_size: addon.file_size,
            file_url: addon.file_url,
            hcontent_file: addon.hcontent_file,
            preview_url: addon.preview_url,
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

    if (addedCollections.length !== 0) {
        collections.push(...addedCollections)
        writeFileSync("./generated_collections.json", JSON.stringify(collections))
    }

    return {
        addons: results,
        count
    }
}

module.exports.downloadAddon = async addon => {
    console.log(`Downloading: ${addon.publishedfileid}`)
    writeFileSync(`./${addon.publishedfileid}.vpk`, await (await fetchit(addon.file_url)).bytes())
    // TODO: It isn't always a jpg
    writeFileSync(`./${addon.publishedfileid}.jpg`, await (await fetchit(addon.preview_url)).bytes())
}
