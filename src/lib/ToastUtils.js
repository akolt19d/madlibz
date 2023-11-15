export function showLoginToast(toastStore, message) {
    toastStore.trigger({
        message: message,
        background: "variant-filled-error",
        classes: "toast-error",
        autohide: false
    })
}