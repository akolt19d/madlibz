<script>
    import { globalSocket } from "$lib/socket";
    export let chat, username, roomId;
    const socket = globalSocket
    let chatInput = ""

    socket.on("chatUpdate", (updatedChat) => {
        console.log("Chat update!")
        chat = updatedChat
    })

    function sendChatMessage() {
        if(!chatInput)
            return 
        socket.emit("sendingChatMessage", roomId, username, chatInput)
        chatInput = ""
    }

    function processKeyPress(event) {
        if(event.key === "Enter")
            document.getElementById("chat-button").click()
    }
</script>

<div class="grid grid-rows-[1fr_auto] h-80 p-8">
    <div id="chat" class="card variant-filled-surface p-4 overflow-y-scroll">
        {#each chat as chatMessage}
            <p class={chatMessage.user ? "chatMessage" : "serverMessage"}>{chatMessage.user ? `${chatMessage.user}: ` : ""}{chatMessage.message}</p>
        {/each}
    </div>
    <div class="input-group input-group-divider grid-cols-[1fr_auto]">
        <input type="text" id="chat-input" on:keypress={processKeyPress} bind:value={chatInput}>
        <button on:click={sendChatMessage} class="btn variant-filled-primary" id="chat-button">Send</button>
    </div>
</div>

<style>
    .serverMessage {
        color: red;
    }
</style>