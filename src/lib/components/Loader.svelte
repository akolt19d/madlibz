<script>
    import { ProgressRadial } from "@skeletonlabs/skeleton"
    import { fly } from "svelte/transition";
</script>

<div class="flex-wrapper bg-surface-backdrop-token" out:fly={{ duration: 200, y: -200, opacity: 0 }}>
    <ProgressRadial track="stroke-primary-500/25" meter="stroke-primary-500" />
</div>