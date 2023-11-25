<script>
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { toBlob } from 'html-to-image'
    import { saveAs } from 'file-saver'
    import { fly } from 'svelte/transition';
    export let parent;

    const modalStore = getModalStore()
    const { title, body } = $modalStore[0]
    const variants = ["primary", "secondary", "tertiary"].sort(() => (Math.random() > .5) ? 1 : -1)
    console.log(variants)
    let isDownloading = false
    let article, storyP

    $: if(article) {
        article.innerHTML = body
    }

    $: if(storyP) {
        storyP.innerHTML = body
    }

    function download() {
        isDownloading = true
        let processedTitle = title.toLowerCase().replaceAll(" ", "_")
        setTimeout(() => {
            toBlob(document.getElementById("downloadableStory")).then((blob) => {
                if (window.saveAs) {
                    window.saveAs(blob, processedTitle);
                } else {
                    saveAs(blob, processedTitle);
                }
                isDownloading = false
            })
        }, 1000)
    }
</script>

{#if isDownloading} 
    <div class="fixed w-screen h-screen top-0 left-0 bg-black/40 flex justify-center flex-col items-center z-50">
        <div in:fly={{ duration: 400, y: 300, opacity: 0 }} out:fly={{ duration: 400, y: -300, opacity: 0 }} class="bbb bt-shadow-l card bg-white p-8 flex justify-center flex-col gap-4 {parent.width}">
            <p class="h3 text-center w-fit">The image has been saved!</p>
            <div id="downloadableStory" class="{parent.width} {parent.height} card bg variant-filled-{variants[0]} rounded-none px-8 py-4 border-{variants[0]}-700 border-[.5rem] !bg-{variants[0]}-500">
                <h1 class="relative h1 text-center bt-text-r !text-{variants[1]}-500">{ title }</h1>
                <p class="m-2 text-justify" bind:this={storyP}></p>
            </div>
        </div>
    </div>   
{/if}
<div class="{parent.background} {parent.shadow} {parent.width} {parent.height} {parent.padding} {parent.spacing} {parent.rounded}">
    <header class="{parent.regionHeader} bt-text-l">
        { title }
    </header>
    <article bind:this={article}>
    </article>
    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn-warning shadow-[-2px_2px_0_2px_#b57e40] !outline-none" on:click={download}>Download</button>
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{ parent.buttonTextCancel }</button>
    </footer>
</div>