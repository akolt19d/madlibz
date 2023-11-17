<script>
    import { goto } from "$app/navigation";
    import Loader from "$lib/components/Loader.svelte";
    import { globalSocket } from "$lib/socket.js";
    import { TabGroup, Tab, ProgressRadial, getModalStore, getToastStore, InputChip } from '@skeletonlabs/skeleton';
    import StoryCard from "$lib/components/StoryCard.svelte";
    import { fade } from "svelte/transition";
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import FormattingGuide from "./FormattingGuide.svelte";
    import { showErrorToast } from "$lib/ToastUtils";
    export let data;

    const socket = globalSocket
    const modalStore = getModalStore()
    const toastStore = getToastStore()

    const formatGuideModal = {
        type: "component",
        component: { ref: FormattingGuide }
    }

    let { isPlayerHost, players } = data
    let loading = false

    let gameOption = 0
    let story = null
    let storyId = "65381226d28bcf3c21673659"
    let isGameStarting = false
    let countdown = 0
    let gameVariables = writable({})
    let title = ""
    let text = ""
    let filters = {
        tags: [],
        original: null,
        nsfw: null
    }
    $: console.log(filters)
    let storyArea
    $: if(storyArea) {
        processText()
    }	

    function processText() {
        let regex = /_([^_]+)_/g
        let invalidRegex = /([<>])/g
        let text2 = text.replace(invalidRegex, (match) => {
            return `<code class="code variant-soft-error text-error-500 font-bold">${match}</code>`
        })
        storyArea.innerHTML = text2.replace(regex, (match) => {
            return `<code class="code variant-soft-warning text-warning-500 font-bold">${match}</code>`
        })
    }

    onMount(() => {
        socket.emit("getGameVariables", data.roomId, (vars) => {
            gameVariables.set(vars)
            console.log("Vars update!", $gameVariables)
        })
    })

    socket.on("gameVarsUpdate", (vars) => {
        gameVariables.set(vars)
        console.log("Vars update!", $gameVariables)
    })

    socket.on("startGame", () => {
        isGameStarting = true
        countdown = 3
        let interval = setInterval(() => {
            console.log(countdown)
            countdown -= 1
            if(countdown == 0) {
                clearInterval(interval)
                setTimeout(() => {
                    goto(`/game/${data.roomId}/play`)
                }, 300)
            }
        }, 1000)
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })

        let host = players.filter(x => x.isHost)[0]
        isPlayerHost = host.username == data.username
    })

    function removeStory() {
        story = null
        socket.emit("selectingStory", data.roomId, story)
    }

    function handleInvalidInputChip() {
        showErrorToast(toastStore, "The tag you tried to enter is invalid.")
    }

    function validateInputChip(value) {
        let regex = /^[a-zA-Z0-9%_.~-]+$/g
        return regex.test(value)
    }

    function inputCustomStory() {
        let regex = /_([^_]+)_/g
        let invalidRegex = /([<>])/g
        if(invalidRegex.test(text) || text.length == 0 || title.length == 0 || !text.match(regex)) {
            showErrorToast(toastStore, "There is an error with the submitted story. Please check if the submission criteria are met.")
            return
        }

        story = null
        story = {
            title,
            story: text,
            gapAmount: text.match(regex).length
        }
        socket.emit("selectingStory", data.roomId, story)
        console.log(story)
    }

    function createQueryString() {
        let { original, nsfw, tags } = filters
        let queryArr = []
        if(original !== null)
            queryArr.push(`original=${original}`)
        if(nsfw !== null)
            queryArr.push(`nsfw=${nsfw}`)
        if(tags.length > 0)
            queryArr.push(`tags=${tags.join(",")}`)

        return `?${queryArr.join("&")}`
    }

    async function getRandomStory() {
        const queryString = createQueryString()
        const res = await fetch(`/api/story${queryString}`)
        story = await res.json()
        if(story)
            socket.emit("selectingStory", data.roomId, story)
        else 
            showErrorToast(toastStore, "A story with the given filters doesn't exist.")
    }

    async function getStory() {
        const res = await fetch(`/api/story?id=${storyId}`)
        story = await res.json()
        if(story)
            socket.emit("selectingStory", data.roomId, story)
        else 
            showErrorToast(toastStore, "The story with this ID doesn't exist or has been deleted.")
        console.log(story, story.story.length)
    }

    async function startGame() {
        if(story)
            socket.emit("startingGame", data.roomId, story)
        else 
            console.log("You must choose a story!")
    }

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }
</script>

<svelte:head>
    <title>Room {data.roomId}</title>
</svelte:head>

{#if isGameStarting}
    <div transition:fade={{ duration: 250 }} class="fixed w-screen h-screen top-0 left-0 bg-black/40 flex justify-center items-center z-50">
        <div class="card bg-white py-8 gap-4 bbb bt-shadow-l relative !text-center">
            {#key countdown}
                <p transition:fade={{ duration: 250 }} class="h1 bt-text-l !absolute w-full" data-value={ countdown ? countdown : "Start!" }>{ countdown ? countdown : "Start!" }</p>
            {/key}
            <p class="h1 bt-text-l opacity-0 mx-8">Start!</p>
        </div>
    </div>
{/if}
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
                <Tab bind:group={gameOption} value={0}>Select random story</Tab>
                <Tab bind:group={gameOption} value={1}>Get story by ID</Tab>
                <Tab bind:group={gameOption} value={2}>Upload custom story</Tab>
                <svelte:fragment slot="panel">
                    <div class="grid grid-cols-2">
                        {#if gameOption == 0}
                            <div class="h-full w-fit px-4">
                                <h3 class="h3">Select random story</h3>
                                <div class="card mt-1 mb-4 p-8 py-4 variant-filled-secondary border-4 border-secondary-700 shadow-[-.25rem_.25rem_0_.25rem_#9e5f8d]">
                                    <p class="font-bold">You can specify filters for the story:</p>
                                    <div class="flex justify-evenly text-center gap-2 my-2">
                                        <div class="flex flex-col gap-1">
                                            <label for="select-nsfw">NSFW</label>
                                            <select bind:value={filters.nsfw} id="select-nsfw" class="select">
                                                <option value={true}>Yes</option>
                                                <option value={false}>No</option>
                                                <option value={null}>No preference</option>
                                            </select>
                                        </div>
                                        <div class="flex flex-col gap-1">
                                            <label for="select-original">Original</label>
                                            <select bind:value={filters.original} id="select-original" class="select">
                                                <option value={true}>Yes</option>
                                                <option value={false}>No</option>
                                                <option value={null}>No preference</option>
                                            </select>
                                        </div>
                                    </div>
                                    <InputChip placeholder="Enter tags..." validation={validateInputChip} on:invalid={handleInvalidInputChip} bind:value={filters.tags} max={10} chips="variant-filled-primary border-4 border-primary-700 hover:!filter-none" />
                                </div>
                                <button class="btn-primary" on:click={getRandomStory}>Select</button>
                                {#if !story}
                                    <p class="h3 mt-2 text-error-500 font-bold">No story selected.</p>
                                {:else}
                                    <button class="btn-error" on:click={removeStory}>Remove story</button>
                                {/if}
                            </div>
                            <div class="p-4 w-max">
                                {#if story}
                                    {#key Object.keys(story).length}
                                        <StoryCard {story} />
                                    {/key}
                                {/if}
                            </div>
                        {:else if gameOption == 1}
                            <div class="h-full w-fit px-4">
                                <label for="story-id" class="h3">Enter story identificator:</label>
                                <input type="text" id="story-id" placeholder="Story ID" class="input-primary my-2" maxlength="24" bind:value={storyId}>
                                <button class="btn-secondary" disabled={!(storyId.length > 0)} on:click={getStory}>Select</button>
                                {#if !story}
                                    <p class="h3 mt-2 text-error-500 font-bold">No story selected.</p>
                                {:else}
                                    <button class="btn-error" on:click={removeStory}>Remove story</button>
                                    {#key players.length}
                                        {#if story.gapAmount < players.length}
                                            <p class="mt-2 text-error-500 font-bold">The story you selected is too short for the size of the lobby. Not everyone is going to play.</p>
                                        {/if}
                                    {/key} 
                                {/if}
                            </div>
                            <div class="p-4 w-max">
                                {#if story}
                                    {#key Object.keys(story).length}
                                        <StoryCard {story} />
                                    {/key}
                                {/if}
                            </div>
                        {:else}
                            <div class="h-full px-4 grid grid-rows-[auto_1fr_auto] gap-2">
                                <input type="text" name="title" placeholder="Title" class="input text-sm" bind:value={title}>
                                <div>
                                    <textarea cols="30" rows="16" placeholder="Story..." class="input text-xs" bind:value={text} on:input={processText}/>
                                    <button class="text-xs anchor cursor-pointer" on:click={() => { modalStore.trigger(formatGuideModal) }}>Don't know how to format the text? Click here.</button>
                                </div>
                                <div>
                                    <button class="btn-secondary" disabled={!(title.length > 0 && text.length > 0)} on:click={inputCustomStory}>Submit</button>
                                    {#if story}
                                        <button class="btn-error" on:click={removeStory}>Remove story</button>
                                    {/if}
                                </div>
                            </div>
                            <div class="p-4 w-max mx-auto text-center">
                                {#if story}
                                    {#key Object.keys(story).length}
                                        <StoryCard {story} />
                                    {/key}
                                {:else}
                                    <h4 class="text-sm font-bold">{ title }</h4>
                                    <p class="text-xs" bind:this={storyArea}></p>
                                {/if}
                            </div>
                        {/if}
                    </div>
                </svelte:fragment>
            </TabGroup>
        {:else}
            <div class="w-full h-full flex justify-center items-center !flex-col gap-4">
                {#if Object.keys($gameVariables).length > 0}
                    <p>Selected story:</p>
                    {#key Object.keys($gameVariables.selectedStory).length}
                        <StoryCard story={$gameVariables.selectedStory} />
                    {/key}
                {:else}
                    <p>The host is currently setting up the game.</p>
                    <ProgressRadial track="stroke-transparent" meter="stroke-black" stroke={150} />
                {/if}
            </div>
        {/if}
    </div>
{/if}