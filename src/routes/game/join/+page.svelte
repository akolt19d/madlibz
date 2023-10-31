<script>
    export let data;
    import Loader from '$lib/components/Loader.svelte';
    import { globalSocket } from '$lib/socket.js';
    import { goto } from '$app/navigation';
    import { setCookie } from 'svelte-cookie';

    const socket = globalSocket
    let { roomId, isUsernameSet, username } = data
    let usernameInput = ""

    if(isUsernameSet) {
        socket.emit("joiningRoom", roomId, username, (isActive) => {
            if(isActive)
                goto(`/game/${roomId}`)
            else 
                goto("/game")
        })
    }

    function joinRoom() {
        socket.emit("joiningRoom", roomId, usernameInput, (isActive) => {
            if(isActive) {
                setCookie("username", usernameInput, 30)
                goto(`/game/${roomId}`)
            }
            else 
                goto("/game")
        })
    }
</script>

{#if isUsernameSet}
    <Loader />
{:else}
    <label for="username">Enter your username</label>
    <input type="text" id="username" name="username" placeholder="Username" bind:value={usernameInput}>
    <button on:click={joinRoom}>Join</button>
{/if}