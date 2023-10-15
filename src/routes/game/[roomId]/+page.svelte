<script>
  import { beforeNavigate } from "$app/navigation";
    export let data;
    import { io } from "socket.io-client"

    const socket = io()

    socket.emit("joiningRoom", data.roomId)

    socket.on("alertRoom", (message) => {
        alert(message)
    })

    beforeNavigate(() => {
        socket.emit("leavingRoom", data.roomId)
    })
</script>

<h1>{ data.roomId }</h1>