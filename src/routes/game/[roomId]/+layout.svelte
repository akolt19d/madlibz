<script>
    export let data
    import { globalSocket } from '$lib/socket.js';
    import { goto } from '$app/navigation';
    import { AppShell } from '@skeletonlabs/skeleton';

    let { chat, players } = data
    let chatInput = ""
    const socket = globalSocket

    socket.on("chatUpdate", (updatedChat) => {
        console.log("Chat update!")
        chat = updatedChat
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })
    })

    function sendChatMessage() {
        if(!chatInput)
            return 
        socket.emit("sendingChatMessage", data.roomId, data.username, chatInput)
        chatInput = ""
    }

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }
</script>

<AppShell>
    <svelte:fragment slot="sidebarLeft">
        <div class="p-2 variant-filled-primary h-screen">
            <h3 class="h3">Room code: <button class="cursor-pointer" on:click={() => { navigator.clipboard.writeText(data.roomId); }}>{ data.roomId }</button></h3>
            <button class="btn variant-filled-surface block w-full" on:click={() => { navigator.clipboard.writeText(window.location.href); }}>Invite</button>
            <h5 class="h5">Players ({players.length}/10):</h5>
            <ol>
                {#each players as player}
                    <li class="card px-3 py-2 my-1 variant-ghost-surface">{player.username} {player.isHost ? "👑" : ""}</li>
                {/each}
            </ol>
        </div>
    </svelte:fragment>
    <svelte:fragment slot="pageFooter">
        <div class="grid grid-rows-[1fr_auto] h-80 p-8">
            <div id="chat" class="card variant-filled-surface p-4 overflow-y-scroll">
                {#each chat as chatMessage}
                    <p class={chatMessage.user ? "chatMessage" : "serverMessage"}>{chatMessage.user ? `${chatMessage.user}: ` : ""}{chatMessage.message}</p>
                {/each}
            </div>
            <div class="input-group input-group-divider grid-cols-[1fr_auto]">
                <input type="text" bind:value={chatInput}>
                <button on:click={sendChatMessage} class="btn variant-filled-primary">Send</button>
            </div>
        </div>
    </svelte:fragment>
    <section class="p-8">
        <button on:click={leaveRoom} class="btn variant-filled-secondary">Leave room</button>
        <slot />
    </section>
</AppShell>

<style>
    .serverMessage {
        color: red;
    }
</style>