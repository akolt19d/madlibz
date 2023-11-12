<script>
    import { globalSocket } from "$lib/socket";
    import { fade } from "svelte/transition";
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

<div class="card variant-filled-primary grid grid-rows-[1fr_auto] h-80 p-8 gap-4 bbb bt-shadow-r">
    <div id="chat" class="card px-4 py-1 overflow-y-auto my-2 bg-primary-300 bbb !border-primary-700">
        {#each chat as chatMessage}
            <p class={chatMessage.user ? "chatMessage" : "serverMessage"} data-value={chatMessage.message} in:fade={{ duration: 200 }}>{chatMessage.user ? `${chatMessage.user}: ` : ""}{chatMessage.message}</p>
        {/each}
    </div>
    <div class="input-group input-group-divider !bg-primary-300 !border-primary-700 focus-within:!border-dashed focus-within:!border-primary-500 grid-cols-[1fr_auto]">
        <input type="text" id="chat-input" class="!bg-primary-300 focus:!bg-transparent" placeholder="Enter message here" on:keypress={processKeyPress} bind:value={chatInput}>
        <button on:click={sendChatMessage} class="btn variant-filled-primary !rounded-r-none" id="chat-button">Send</button>
    </div>
</div>

<style lang="postcss">
    .serverMessage {
        @apply w-max mx-auto py-1 px-2;
        @apply border-red-600 border-4 border-dashed;
        @apply text-center;
        @apply text-red-600;
    }

    #chat > p {
        @apply my-1;
    }
</style>