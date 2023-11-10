<script>
    export let data
    import { globalSocket } from '$lib/socket.js';
    import { goto } from '$app/navigation';
    import { AppShell } from '@skeletonlabs/skeleton';
    import Chat from '$lib/components/Chat.svelte';
    import PlayerPanel from '$lib/components/PlayerPanel.svelte';

    let { chat, players, username, roomId } = data
    const socket = globalSocket

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }
</script>

<AppShell slotSidebarLeft="card">
    <svelte:fragment slot="sidebarLeft">
        <PlayerPanel {players} {roomId} />
    </svelte:fragment>
    <svelte:fragment slot="pageFooter">
        <Chat {chat} {username} {roomId} />
    </svelte:fragment>
    <section class="p-8">
        <button on:click={leaveRoom} class="btn variant-filled-error">Leave room</button>
        <slot />
    </section>
</AppShell>