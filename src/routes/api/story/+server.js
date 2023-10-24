import { stories } from '$lib/db/stories.js'
import { ObjectId } from 'mongodb'

export async function GET({ url }) {
    const id = url.searchParams.get("id")
    // console.log(id)
    const story = await stories.findOne({ _id: new ObjectId(id) })
    // console.log(story)

    return new Response(JSON.stringify(story))
}