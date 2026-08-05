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

module.exports.getAddonInformation = async body => {
    const response = await fetchit("https://steamworkshopdownloader.io/api/details/file", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body
    })

    const json = await response.json()
    let results = []

    for (const addon of json) {
        if (addon.result !== 1) {
            console.log(`RIP: ${addon.publishedfileid}`)
            continue
        }

        const parsedTags = []

        for (const tag of addon.tags)
            parsedTags.push({
                tag: tag.tag
            })

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

    return {
        addons: results,
        count: json.length
    }
}

module.exports.downloadAddon = async addon => {
    console.log(`Downloading: ${addon.publishedfileid}`)
    writeFileSync(`./${addon.publishedfileid}.vpk`, await (await fetchit(addon.file_url)).bytes())
    // TODO: It isn't always a jpg
    writeFileSync(`./${addon.publishedfileid}.jpg`, await (await fetchit(addon.preview_url)).bytes())
}
