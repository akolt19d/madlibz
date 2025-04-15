import { hasSummaryStarted } from '$lib/db/active'
import { redirect } from '@sveltejs/kit'
import { active } from '$lib/db/active'
import type { PageServerLoad, PageServerLoadEvent, PageData } from './$types'
import type { Story } from '$lib/db/stories'

export const load: PageServerLoad = async ({ parent }: PageServerLoadEvent) => {
    const data: PageData = await parent()

    if (!data.roomId) {
        console.error("RoomId missing from parent layout data in summary page!")
        throw redirect(302, "/game")
    }

    if (!(await hasSummaryStarted(data.roomId))) {
        throw redirect(302, `/game/${data.roomId}`)
    }

    const room = await active.findOne({ roomId: data.roomId })

    if (!room || !room.story) {
        console.error(`Room ${data.roomId} or its story not found for summary page.`)
        throw redirect(302, `/game/${data.roomId}`)
    }

    const { story, gameSettings } = room

    return {
        ...data,
        story,
        gameSettings
    }
}