import { hasGameStarted, hasSummaryStarted } from '$lib/db/active'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad, PageData } from './$types'

export const load: PageServerLoad = async ({ parent }: { parent: () => Promise<PageData> }) => {
    const data: PageData = await parent()

    if (!data.roomId) {
        console.error("RoomId missing from parent layout data!")
        throw redirect(302, "/game")
    }

    if ((await hasGameStarted(data.roomId)) || (await hasSummaryStarted(data.roomId))) {
        throw redirect(302, `/game/${data.roomId}/play`)
    }

    return data
}