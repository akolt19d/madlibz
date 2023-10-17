<script>
    import { beforeNavigate, goto } from "$app/navigation";
    import { io } from "socket.io-client"
    import { onMount } from "svelte";
    import Loader from "$lib/components/Loader.svelte";
    export let data;

    const socket = io()

    let players = []
    let roomInactive = false
    let loading = true

    onMount(() => {
        socket.emit("joiningRoom", data.roomId, data.username, (isValid) => {
            if(!isValid) {
                roomInactive = true
                goto("/game")
            }
            loading = false
        })
    })

    socket.on("alertRoom", (message) => {
        console.log(message)
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        players = updatedPlayers.map(x => x.username)
    })

    beforeNavigate(() => {
        if(!roomInactive)
            socket.emit("leavingRoom", data.roomId, data.username)
    })
</script>

{#if loading}
    <Loader />
{:else}
    <h1>Room code: { data.roomId }</h1>
    <h3>Players:</h3>
    <ol>
        {#each players as player}
            <li>{player}</li>
        {/each}
    </ol>
{/if}