<script>
    import "../app.postcss";
    import ViewTransition from "$lib/components/ViewTransition.svelte";
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup, initializeStores, Modal, Toast } from '@skeletonlabs/skeleton';
    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    initializeStores();
</script>

<ViewTransition />
<Toast position="tr" background="variant-filled-success" shadow="toast-success" buttonDismiss="btn-icon btn-icon-sm bg-black/25" />
<Modal background="variant-filled-tertiary" height="!max-h-screen" width="!w-[clamp(280px,100%,1000px)]" shadow="border-[.5rem] border-tertiary-700 shadow-[-6px_6px_0_6px_#91b16a]" regionBody="px-2 max-h-[200px] overflow-auto" regionHeader="text-center h3 font-bold" regionBackdrop="bg-black/40" buttonNeutral="btn-error shadow-[-2px_2px_0_2px_#8b3731] !outline-none" buttonTextCancel="Close" />
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
        @apply bg-primary-500 border-primary-700;
        @apply grid grid-cols-6;
        @apply cursor-text;
        border-width: var(--theme-border-base);
        border-radius: var(--theme-rounded-base);
        transition-property: border-color, filter;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
    }

    :global(.roomcode-input:hover) {
        filter: brightness(1.05);
    }

    :global(.neon-border) {
        border-width: var(--theme-border-base);
        @apply border-primary-100;
        box-shadow: 0px 0px 8px #c8ff00, 0px 0px 4px white, 0px 0px 12px #96bf00 !important;
    }

    :global(.bg) {
        background-image: url("/seamless-pattern-01.svg");
        background-size: 25vw;
        background-blend-mode:soft-light
    }

    :global(.bbb) {
        @apply border-black border-[.5rem];
    }

    :global(.bt-shadow-r) {
        box-shadow: 6px 10px 0px 6px black;
    }

    :global(.bt-shadow-l) {
        box-shadow: -6px 10px 0px 6px black;
    }

    :global(.btn-primary) {
        @apply btn variant-filled-primary border-4 border-primary-700;
    }

    :global(.btn-secondary) {
        @apply btn variant-filled-secondary border-4 border-secondary-700;
    }

    :global(.btn-tertiary) {
        @apply btn variant-filled-tertiary border-4 border-tertiary-700;
    }

    :global(.btn-success) {
        @apply btn variant-filled-success border-4 border-success-700;
    }

    :global(.btn-warning) {
        @apply btn variant-filled-warning border-4 border-warning-700;
    }

    :global(.btn-error) {
        @apply btn variant-filled-error border-4 border-error-700;
    }

    :global(.input-primary) {
        @apply input border-primary-700 bg-primary-500 focus:border-primary-500 focus:bg-transparent focus:border-dashed focus:!ring-transparent;
    }

    :global(.input-secondary) {
        @apply input border-secondary-700 bg-secondary-500 focus:border-secondary-500 focus:bg-transparent focus:border-dashed focus:!ring-transparent;
    }

    :global(.input-tertiary) {
        @apply input border-tertiary-700 bg-tertiary-500 focus:border-tertiary-500 focus:bg-transparent focus:border-dashed focus:!ring-transparent;
    }

    :global(.bt-text-l), :global(.bt-text-r) {
        @apply text-primary-500 relative z-10 font-bold;
        -webkit-text-stroke-width: 1px;
        -webkit-text-stroke-color: black;
    }

    :global(.bt-text-l) {
        @apply !drop-shadow-[-1px_1px_0_black]
    }

    :global(.bt-text-r) {
        @apply !drop-shadow-[2px_2px_0_black]
    }
/* 
    :global(.bt-text-r::before) {
        content: attr(data-value);
        @apply text-primary-500;
        position: absolute;
        transform: translate(-2px, -2px);
        z-index: 1;
    }

    :global(.bt-text-l::before) {
        content: attr(data-value);
        @apply text-primary-500;
        position: absolute;
        transform: translate(2px, -2px);
        z-index: 1;
    } */
</style>
