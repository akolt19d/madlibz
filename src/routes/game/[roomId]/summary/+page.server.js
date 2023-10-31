import { hasSummaryStarted } from '$lib/db/active.js'
import { redirect } from '@sveltejs/kit'
import { active } from '$lib/db/active.js'

export async function load({ parent }) {
    let data = await parent()
    if(!(await hasSummaryStarted(data.roomId)))
        throw redirect(302, `/game/${data.roomId}`)
    let room = await active.findOne({ roomId: data.roomId })
    let { story, gameSettings } = room
    return {
        ...data,
        story,
        gameSettings
    }
}