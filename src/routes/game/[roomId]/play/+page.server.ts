import { hasGameStarted } from '$lib/db/active'
import { redirect } from '@sveltejs/kit'
import { active } from '$lib/db/active'
import type { PageServerLoad, PageData } from './$types'
import type { Story } from '$lib/db/stories'

export const load: PageServerLoad = async ({ parent }: { parent: () => Promise<PageData> }) => {
    const data: PageData = await parent()

    if (!data.roomId) {
        console.error("RoomId missing from parent layout data in play page!")
        throw redirect(302, "/game")
    }

    if (!(await hasGameStarted(data.roomId))) {
        throw redirect(302, `/game/${data.roomId}`)
    }

    const room = await active.findOne({ roomId: data.roomId })

    if (!room || !room.story) {
        console.error(`Room ${data.roomId} or its story not found for play page.`)
        throw redirect(302, `/game/${data.roomId}`)
    }

    if (!data.username) {
        console.error("Username missing from parent layout data in play page!")
        throw redirect(302, `/game/join?r=${data.roomId}`)
    }

    const player = room.players.find(x => x.username === data.username)

    if (!player) {
        console.error(`Player ${data.username} not found in room ${data.roomId} on play page.`)
        throw redirect(302, `/game/join?r=${data.roomId}`)
    }

    const { gameSettings } = room
    const fullStory = room.story
    const { story, ...processedStory } = fullStory

    return {
        ...data,
        story: processedStory,
        gameSettings,
        playerIndex: player.roomIndex
    }
}