<script>
    export let data
    import { globalSocket } from '$lib/socket.js';
    import { goto } from '$app/navigation';

    let { chat } = data
    let chatInput = ""
    const socket = globalSocket

    socket.on("chatUpdate", (updatedChat) => {
        console.log("Chat update!")
        chat = updatedChat
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

<button on:click={leaveRoom}>Leave room</button>
<slot />
<input type="text" bind:value={chatInput}><button on:click={sendChatMessage}>Send</button>
<div id="chat">
    {#each chat as chatMessage}
        <p class={chatMessage.user ? "chatMessage" : "serverMessage"}>{chatMessage.user ? `${chatMessage.user}: ` : ""}{chatMessage.message}</p>
    {/each}
</div>

<style>
    #chat {
        border: 1px solid black;
    }

    .serverMessage {
        color: red;
    }
</style>