<script>
    import { goto } from "$app/navigation";
    import Loader from "$lib/components/Loader.svelte";
    import { globalSocket } from "$lib/socket.js";
    import { TabGroup, Tab, ProgressRadial } from '@skeletonlabs/skeleton';
    import StoryCard from "$lib/components/StoryCard.svelte";
    export let data;

    const socket = globalSocket

    let { isPlayerHost, players } = data
    let loading = false

    let gameOption = true
    let story = null
    let storyId = "65381226d28bcf3c21673659"
    let selectedStory = null

    socket.on("startGame", () => {
        goto(`/game/${data.roomId}/play`)
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })
    })

    socket.on("newStory", async (id) => {
        const res = await fetch(`/api/story?id=${id}`)
        selectedStory = await res.json()
    })

    async function getStory(id) {
        const res = await fetch(`/api/story?id=${id}`)
        story = await res.json()
        if(story)
            socket.emit("selectingStory", data.roomId, id)
        console.log(story)
    }

    async function startGame() {
        if(story)
            socket.emit("startingGame", data.roomId, story)
        else 
            alert("You must choose a story!")
    }

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }
</script>

{#if loading}
    <Loader />
{:else}
    <div>
        <button on:click={leaveRoom} class="btn-error shadow-[-2px_2px_0_2px_#8b3731] ml-[2px]">Leave room</button>
        {#if isPlayerHost}
            <button on:click={startGame} class="btn-success shadow-[-2px_2px_0_2px_#3a8146]" disabled={!story}>Start game</button>
        {/if}
    </div>
    <div class="card my-4 p-6 bbb bt-shadow-r">
        {#if isPlayerHost}
            <TabGroup active="border-black border-solid border-b-4" hover="border-transparent hover:border-black/25 hover:border-dashed border-b-4" border="border-b-4">
                <Tab bind:group={gameOption} value={true}>Select existing story</Tab>
                <Tab bind:group={gameOption} value={false}>Upload custom story</Tab>
                <svelte:fragment slot="panel">
                    {#if gameOption}
                        <div class="grid grid-cols-2">
                            <div class="h-full w-fit px-4">
                                <label for="story-id">Enter story identificator:</label>
                                <input type="text" id="story-id" placeholder="Story ID" class="input-primary my-2" maxlength="24" bind:value={storyId}>
                                <button class="btn-secondary" on:click={() => { getStory(storyId) }}>Select</button>
                                {#if !story}
                                    <p class="h3 mt-2 text-error-500 font-bold">No story selected.</p>
                                {:else}
                                    {#key players.length}
                                        {#if story.gapAmount < players.length}
                                            <p class="mt-2 text-error-500 font-bold">The story you selected is too short for the size of the lobby. Not everyone is going to play.</p>
                                        {/if}
                                    {/key} 
                                {/if}
                            </div>
                            <div class="p-4 w-max">
                                {#if story}
                                    <StoryCard {story} />
                                {/if}
                            </div>
                        </div>
                    {:else}
                        <input type="text" name="title" placeholder="Title" class="input mb-1"><br>
                        <textarea cols="30" rows="10" placeholder="Story..." class="input" /><br>
                    {/if}
                </svelte:fragment>
            </TabGroup>
        {:else}
            <div class="w-full h-full flex justify-center items-center !flex-col gap-4">
                {#if selectedStory}
                    <p>Selected story:</p>
                    {#key selectedStory._id}
                        <StoryCard story={selectedStory} />
                    {/key}
                {:else}
                    <p>The host is currently setting up the game.</p>
                    <ProgressRadial track="stroke-transparent" meter="stroke-black" stroke={150} />
                {/if}
            </div>
        {/if}
    </div>
{/if}