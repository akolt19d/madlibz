import { stories } from '$lib/db/stories.js'
import { error } from '@sveltejs/kit'
import { ObjectId } from 'mongodb'

function calcGapAmount(text) {
    let regex = /_([^_]+)_/g
    return text.match(regex).length
}

async function getStoryWithId(id) {
    let fullStory = await stories.findOne({ _id: new ObjectId(id) })

    if(!fullStory)
        return JSON.stringify(null)

    let { story } = fullStory
    fullStory.gapAmount = calcGapAmount(story)
    return JSON.stringify(fullStory)
}

async function getStoryWithFilters(filters) {
    let fullStory = await stories.aggregate([
        { $match: filters },
        { $sample: { size: 1 } }
    ]).toArray().then(arr => arr[0])

    if(!fullStory)
        return JSON.stringify(null)

    let { story } = fullStory
    fullStory.gapAmount = calcGapAmount(story)
    return JSON.stringify(fullStory)
}

function convertStringToBool(string) {
    if(string == "true")
        return true
    else if(string == "false")
        return false

    return null
}

export async function GET({ url }) {
    const id = url.searchParams.get("id")
    let filters = {
        tags: url.searchParams.get("tags") ? url.searchParams.get("tags").split(',') : null,
        nsfw: convertStringToBool(url.searchParams.get("nsfw")),
        original: convertStringToBool(url.searchParams.get("original"))
    }
    let { tags } = filters
    if(tags)
        filters.tags = { $all: tags }
    if(id)
        return new Response(await getStoryWithId(id))
    else {
        const processedFilters = Object.entries(filters).filter(([key, value]) => value !== null)
        return new Response(await getStoryWithFilters(Object.fromEntries(processedFilters)))
    }

}