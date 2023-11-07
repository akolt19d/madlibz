<script>
  import "../app.postcss";
</script>

<slot />

<style lang="postcss">
  :global(.flex-wrapper) {
        /* background-color: red; */
        @apply container;
        @apply flex;
        @apply justify-center;
        @apply items-center;
        @apply mx-auto;
        @apply h-screen;
    }

    :global(.roomcode-input) {
        @apply py-2 mx-auto my-2;
        @apply bg-surface-700-200-token border-surface-500-400-token;
        @apply grid grid-cols-6;
        @apply cursor-text;
        border-width: var(--theme-border-base);
        border-radius: var(--theme-rounded-base);
        transition-property: border-color;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
    }

    :global(.neon-border) {
        border-width: var(--theme-border-base);
        @apply border-primary-100;
        box-shadow: 0px 0px 8px #c8ff00, 0px 0px 4px white, 0px 0px 12px #96bf00 !important;
    }
/* 
    :global(button) {
        @apply btn variant-filled-primary;
    }

    :global(input), :global(textarea) {
        @apply input;
    } */
</style>
