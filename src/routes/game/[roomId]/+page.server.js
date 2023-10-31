import { hasGameStarted, hasSummaryStarted } from '$lib/db/active.js'
import { redirect } from '@sveltejs/kit'

export async function load({ parent }) {
    let data = await parent()
    if((await hasGameStarted(data.roomId)) || (await hasSummaryStarted(data.roomId)))
        throw redirect(302, "/game")

    return data
}