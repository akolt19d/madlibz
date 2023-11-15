export function showLoginToast(toastStore, message) {
    toastStore.trigger({
        message: message,
        background: "variant-filled-error",
        classes: "toast-error",
        autohide: false
    })
}

export function showErrorToast(toastStore, message) {
    toastStore.trigger({
        message: message,
        background: "variant-filled-error",
        classes: "toast-error",
        timeout: 3500
    })
}

export function showCopyToast(toastStore, message) {
    toastStore.trigger({
        message: `Copied ${message}!`,
        background: "variant-filled-success",
        classes: "toast-success",
        timeout: 2000
    })
}