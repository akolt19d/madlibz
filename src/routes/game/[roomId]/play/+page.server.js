import { hasGameStarted } from '$lib/db/active.js'
import { redirect } from '@sveltejs/kit'
import { active } from '$lib/db/active.js'

export async function load({ parent }) {
    let data = await parent()
    if(!(await hasGameStarted(data.roomId)))
        throw redirect(302, `/game/${data.roomId}`)
    let room = await active.findOne({ roomId: data.roomId })
    let { story } = room
    return {
        ...data,
        story
    }
}