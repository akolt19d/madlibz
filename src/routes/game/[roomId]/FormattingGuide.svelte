<script>
    export let parent;
    let title = "Guide on how to format custom story"
</script>

<div class="{parent.background} {parent.shadow} {parent.width} {parent.height} {parent.padding} {parent.spacing} {parent.rounded}">
    <header class="{parent.regionHeader} bt-text-l">
        {title}
    </header>
    <article>
        <ul>
            <li>
                <h4 class="text-2xl font-black text-secondary-700">Basics</h4>
                <div class="ml-2">
                    <p>The tool is very easy to use. The main thing you need to know is how to format a <b class="text-secondary-700">gap</b>.</p>
                    <p>Gaps are the spaces which are replaced by fills inputted during the game. Every gap has a general category, which hints at what fills are appropriate, e.g. "noun" or "place".</p>
                    <p>We format gaps as shown below:</p>
                    <div class="w-full flex justify-center my-2">
                        <code class="code text-3xl p-2">_category_</code>
                    </div>
                </div>
            </li>
            <li class="my-4">
                <h4 class="text-2xl font-black text-secondary-700">Preview</h4>
                <div class="ml-2">
                    <p>Next to the inputs, there is a live preview of your custom story. Make sure to check if everything is being read correctly.</p>
                    <p>By the end all of your gaps should be colored as <code class="code variant-soft-warning text-warning-500 font-bold">orange</code>.</p>
                </div>
            </li>
            <li>
                <h4 class="text-2xl font-black text-secondary-700">Forbidden characters</h4>
                <div class="ml-2">
                    <p>There are certain characters which you cannot use in your story, for various reasons.</p>
                    <p>If you happen to type one in, the preview on the right will mark it in <code class="code variant-soft-error text-error-500 font-bold">red</code>. In order to use the story, it must not contain any forbidden characters.</p>
                </div>
            </li>
        </ul>
    </article>
    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>Got it!</button>
    </footer>
</div>