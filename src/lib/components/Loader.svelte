<script>
    import { ProgressRadial } from "@skeletonlabs/skeleton"
    import { fly, blur } from "svelte/transition";
</script>

<div class="flex-wrapper" in:blur={{ duration: 100 }} out:fly={{ duration: 200, y: -200, opacity: 0 }}>
    <ProgressRadial track="stroke-transparent" meter="stroke-black" stroke={150} />
</div>