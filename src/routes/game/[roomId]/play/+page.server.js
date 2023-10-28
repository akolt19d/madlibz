import { hasGameStarted } from '$lib/db/active.js'
import { redirect } from '@sveltejs/kit'
import { active } from '$lib/db/active.js'

function processStory(text) {
    let regex = /_([^_]+)_/g
    return text.match(regex).map(x => x.slice(1, x.length - 1))
}

function extendOrder(order, length) {
    let extendedOrder = [...order]
    for(let i = order.length; i < length; i++) {
        extendedOrder.push(order[i % order.length])
    }
    return extendedOrder
}

export async function load({ parent }) {
    let data = await parent()
    if(!(await hasGameStarted(data.roomId)))
        throw redirect(302, `/game/${data.roomId}`)
    let room = await active.findOne({ roomId: data.roomId })
    let { story, gameSettings } = room

    story.gaps = processStory(story.story)
    gameSettings.order = extendOrder(gameSettings.order, story.gaps.length)
    // console.log(gameSettings.order)
    return {
        ...data,
        story,
        gameSettings
    }
}