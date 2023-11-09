<script>
    import { ProgressRadial } from "@skeletonlabs/skeleton"
    import { fly, blur } from "svelte/transition";
</script>

<div class="flex-wrapper" in:blur={{ duration: 100 }} out:fly={{ duration: 200, y: -200, opacity: 0 }}>
    <ProgressRadial track="stroke-primary-500/25" meter="stroke-primary-500" />
</div>