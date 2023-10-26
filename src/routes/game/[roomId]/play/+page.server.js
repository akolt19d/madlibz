import { hasGameStarted } from '$lib/db/active.js'
import { redirect } from '@sveltejs/kit'

export async function load({ parent }) {
    let data = await parent()
    if(!(await hasGameStarted(data.roomId)))
        throw redirect(302, `/game/${data.roomId}`)
    // console.log(parentParams)
    return data
}