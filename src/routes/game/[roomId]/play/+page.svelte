<script>
    export let data;

    let { players, username, story, gameSettings } = data
    
</script>

<h3>Players ({players.length}):</h3>
<ol>
    {#each players as player}
        <li>{player.username} {player.username == username ? "(you)" : ""}</li>
    {/each}
</ol>
<h4>{ story.title }</h4>