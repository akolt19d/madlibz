<script>
    export let data
    import { AppShell } from '@skeletonlabs/skeleton';
    import Chat from '$lib/components/Chat.svelte';
    import PlayerPanel from '$lib/components/PlayerPanel.svelte';

    let { chat, players, username, roomId } = data
</script>

<AppShell slotSidebarLeft="p-6 pt-2 h-screen" slotPageFooter="p-6" slotPageContent="h-full p-6 pt-2 grid grid-rows-[auto_1fr]">
    <svelte:fragment slot="sidebarLeft">
        <PlayerPanel {players} {roomId} />
    </svelte:fragment>
    <svelte:fragment slot="pageFooter">
        <Chat {chat} {username} {roomId} />
    </svelte:fragment>
    <slot />
</AppShell>