import { stories } from '$lib/db/stories.js'
import { ObjectId } from 'mongodb'

function calcGapAmount(text) {
    let regex = /_([^_]+)_/g
    return text.match(regex).length
}

export async function GET({ url }) {
    const id = url.searchParams.get("id")
    // console.log(id)
    let fullStory = await stories.findOne({ _id: new ObjectId(id) })
    let {story } = fullStory
    fullStory.gapAmount = calcGapAmount(story)

    return new Response(JSON.stringify(fullStory))
}