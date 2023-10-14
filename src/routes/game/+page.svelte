<script>
    import { generateRoomCode } from "$lib/RoomCode";

    function log() {
        console.log(generateRoomCode())
    }
</script>

<h1>You can</h1>
<button on:click={log}>Create a room</button>
<p>or</p>
<button>Join a room</button>
<input type="text" placeholder="room code">