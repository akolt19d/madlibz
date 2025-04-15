import type { ToastSettings, ToastStore } from '@skeletonlabs/skeleton';

export function showLoginToast(toastStore: ToastStore, message: string): void {
    const toast: ToastSettings = {
        message: message,
        background: "variant-filled-error",
        classes: "toast-error",
        autohide: false
    };
    toastStore.trigger(toast);
}

export function showErrorToast(toastStore: ToastStore, message: string): void {
    const toast: ToastSettings = {
        message: message,
        background: "variant-filled-error",
        classes: "toast-error",
        timeout: 3500
    };
    toastStore.trigger(toast);
}

export function showCopyToast(toastStore: ToastStore, message: string): void {
    const toast: ToastSettings = {
        message: `Copied ${message}!`,
        background: "variant-filled-success",
        classes: "toast-success",
        timeout: 2000
    };
    toastStore.trigger(toast);
}