<script>
    import { fly } from "svelte/transition";

    export let story;
    let isStoryCustom = Object.keys(story).length == 3
</script>

<div in:fly={{ duration: 400, y: 200, opacity: 0, delay: 400 }} out:fly={{ duration: 400, y: 200, opacity: 0 }} class="card mx-4 p-8 py-4 variant-filled-tertiary border-4 border-tertiary-700 shadow-[.25rem_.25rem_0_.25rem_#91b16a]">
    <h3 class="h2 text-center bt-text-r !text-secondary-500">{ story.title }</h3>
    <div class="grid grid-cols-2 gap-2 my-1 text-xs px-2 !font-bold">
        <span>Amount of gaps: {story.gapAmount}</span>
        {#if isStoryCustom}
            <span class="text-right text-error-500">Custom story</span>
        {:else}
            <span class="text-right">Language: {story.language}</span>
        {/if}
    </div>
    {#if !isStoryCustom}    
        <div class="flex gap-1">
            {#if story.original}
                <span class="chip py-1 variant-filled-warning border-4 border-warning-700 hover:!filter-none cursor-default">Original</span>
            {/if}
            {#if story.nsfw}
                <span class="chip py-1 variant-filled-error border-4 border-error-700 hover:!filter-none cursor-default">NSFW</span>
            {/if}
            {#each story.tags as tag}
                <span class="chip py-1 variant-filled-primary border-4 border-primary-700 hover:!filter-none cursor-default">{ tag }</span>
            {/each}
        </div>
        <hr class="my-4 mb-2 !border-t-4 !border-dashed !border-tertiary-700">
        <div class="text-sm text-right">
            <span>
                {story.likes}👍
            </span>    
            <span>
                {story.dislikes}👎
            </span>
        </div>
    {/if}
</div>