import { stories } from '$lib/db/stories'
import { error, json } from '@sveltejs/kit'
import { ObjectId } from 'mongodb'
import type { RequestHandler, RequestEvent } from './$types'
import type { Story } from '$lib/db/stories'
import type { Filter } from 'mongodb'

interface StoryWithGapAmount extends Story {
    gapAmount?: number
}

function calcGapAmount(text: string): number {
    const regex = /_([^_]+)_/g
    const matches = text.match(regex)
    return matches ? matches.length : 0
}

async function getStoryWithId(id: string): Promise<StoryWithGapAmount | null> {
    if (!ObjectId.isValid(id)) {
        return null
    }
    const fullStory = await stories.findOne({ _id: new ObjectId(id) })

    if (!fullStory)
        return null

    const storyWithGap: StoryWithGapAmount = {
        ...fullStory,
        gapAmount: calcGapAmount(fullStory.story)
    }
    return storyWithGap
}

async function getStoryWithFilters(filters: Filter<Story>): Promise<StoryWithGapAmount | null> {
    const aggregationResult = await stories.aggregate<Story>([
        { $match: filters },
        { $sample: { size: 1 } }
    ]).toArray()

    const fullStory = aggregationResult.length > 0 ? aggregationResult[0] : null

    if (!fullStory)
        return null

    const storyWithGap: StoryWithGapAmount = {
        ...fullStory,
        gapAmount: calcGapAmount(fullStory.story)
    }
    return storyWithGap
}

function convertStringToBool(str: string | null): boolean | null {
    if (str === "true")
        return true
    if (str === "false")
        return false
    return null
}

export const GET: RequestHandler = async ({ url }: RequestEvent) => {
    const id = url.searchParams.get("id")
    const tagsParam = url.searchParams.get("tags")
    const nsfwParam = url.searchParams.get("nsfw")
    const originalParam = url.searchParams.get("original")

    const filters: Filter<Story> = {}

    if (tagsParam) {
        filters.tags = { $all: tagsParam.split(',') }
    }
    const nsfwValue = convertStringToBool(nsfwParam)
    if (nsfwValue !== null) {
        filters.nsfw = nsfwValue
    }
    const originalValue = convertStringToBool(originalParam)
    if (originalValue !== null) {
        filters.original = originalValue
    }

    let storyResult: StoryWithGapAmount | null = null

    if (id) {
        storyResult = await getStoryWithId(id)
    } else if (Object.keys(filters).length > 0) {
        storyResult = await getStoryWithFilters(filters)
    } else {
        storyResult = await getStoryWithFilters({})
    }

    if (!storyResult) {
        throw error(404, 'Story not found')
    }

    return json(storyResult)
}