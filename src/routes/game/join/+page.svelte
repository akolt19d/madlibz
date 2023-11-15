<script>
    export let data;
    import Loader from '$lib/components/Loader.svelte';
    import { globalSocket } from '$lib/socket.js';
    import { goto } from '$app/navigation';
    import { setCookie } from 'svelte-cookie';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { showLoginToast } from '$lib/ToastUtils.js';

    const socket = globalSocket
    const toastStore = getToastStore()
    let { roomId, isUsernameSet, username } = data
    let usernameInput = generateAnonUsername()

    if(isUsernameSet) {
        socket.emit("joiningRoom", roomId, username, (res) => {
            if(res.canJoin)
                goto(`/game/${roomId}`)
            else {
                showLoginToast(toastStore, res.message)
                goto("/game")
            }
        })
    }

    function generateAnonUsername() {
        let randomUsername = "User#"
        for(let i = 0; i < 4; i++) {
            randomUsername += String(Math.floor(Math.random() * 9))
        }
        
        return randomUsername
    }

    function joinRoom() {
        if(!usernameInput)
            return
        
        socket.emit("joiningRoom", roomId, usernameInput, (res) => {
            if(res.canJoin) {
                setCookie("username", usernameInput, 30)
                goto(`/game/${roomId}`)
            }
            else {
                showLoginToast(toastStore, res.message)
                goto("/game")
            }
        })
    }
</script>

{#if isUsernameSet}
    <Loader />
{:else}
    <div class="flex-wrapper">
        <main class="card w-96 p-12 text-center relative bbb bt-shadow-r">
            <label for="username">Enter your username</label>
            <input type="text" id="username" name="username" placeholder="Username" class="input-primary mb-2 mt-1" bind:value={usernameInput}>
            <button on:click={joinRoom} class="btn-success shadow-[2px_2px_0_2px_#3a8146]">Join room {roomId}</button>
        </main>
    </div>
{/if}