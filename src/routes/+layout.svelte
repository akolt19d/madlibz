<script>
  import "../app.postcss";
</script>

<slot />

<style lang="postcss">
  :global(button) {
    @apply btn variant-filled-primary;
  }
  :global(input), :global(textarea) {
    @apply input;
  }
</style>
