<script>
    export let story;
</script>

<div class="card mx-4 p-8 py-4 variant-filled-tertiary border-4 border-tertiary-700 shadow-[.25rem_.25rem_0_.25rem_#91b16a]">
    <h3 class="h2 text-center bt-text-r before:!text-secondary-500" data-value={story.title}>{ story.title }</h3>
    <div class="grid grid-cols-2 gap-2 my-1 text-xs px-2 !font-bold">
        <span>Amount of gaps: {story.gapAmount}</span>
        <span class="text-right">Language: {story.language}</span>
    </div>
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
</div>