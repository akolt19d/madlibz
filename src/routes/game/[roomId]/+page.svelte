<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import Loader from "$lib/components/Loader.svelte";
    import { globalSocket } from "$lib/socket.js";
    export let data;

    const socket = globalSocket

    let { players, isPlayerHost } = data
    let loading = false

    let gameOption = false
    let story
    let selectedStory = null

    $: {
        console.log(selectedStory)
    }

    onMount(() => {
        story = getStory()
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })
    })

    socket.on("startGame", () => {
        goto(`/game/${data.roomId}/play`)
    })

    async function getStory() {
        const res = await fetch('/api/story?id=65381226d28bcf3c21673659')
        const story = await res.json()
        return story
    }

    async function startGame() {
        if(story)
            socket.emit("startingGame", data.roomId, await getStory())
        else 
            alert("You must choose a story!")
    }
</script>

{#if loading}
    <Loader />
{:else}
    {#if isPlayerHost}
        <button on:click={startGame}>Start game</button>
    {/if}
    <h1>Room code: <button class="roomcode" on:click={() => { navigator.clipboard.writeText(data.roomId); }}>{ data.roomId }</button></h1>
    <h3>Players ({players.length}/10):</h3>
    <ol>
        {#each players as player}
            <li>{player.username} {player.isHost ? "👑" : ""}</li>
        {/each}
    </ol>
    <input type="checkbox" bind:checked={gameOption}>
    {#if gameOption}
        {#await story}
            <p>waiting...</p>
        {:then fetchedStory}
        <div class="card">
            <h3>{fetchedStory.title}</h3>
            <h6>{ fetchedStory.gapAmount } gaps</h6>
            {#if fetchedStory.gapAmount > players.length}
                <p class="warning">Warning! There aren't enough gaps for the amount of players in the lobby. Someone won't get to play.</p>
            {/if}
            <button on:click={() => { selectedStory = fetchedStory }}>Select</button>
        </div>
        {/await}
    {:else}
        <p>Podaj własny tekst</p>
        <input type="text" name="title" placeholder="Tytuł"><br>
        <textarea cols="30" rows="10" placeholder="Historyjka..." /><br>
    {/if}
{/if}

<style>
    .roomcode {
        cursor: pointer;
    }

    .card {
        padding: 10px;
        border: 1px solid black;
    }

    .warning {
        color: red;
    }
</style>