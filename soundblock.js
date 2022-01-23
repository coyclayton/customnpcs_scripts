function interact(e) {
    e.setCanceled(true);
    var td = e.npc.getTempdata();
    var theDate = Date.now();
    var lastPlayed;
    if (td.has('lastPlayed') == false) {
        lastPlayed = 0;
    } else {
        lastPlayed = td.get('lastPlayed');
    }
    if ((theDate - lastPlayed) > 300000) {
        var players = e.player.getWorld().getNearbyEntities(e.player.pos, 64, EntityType_PLAYER);
        for(var i in players) {
        var player = players[i];
            player.playSound("customnpcs:dbi.witcher",1,1);
        }    
        e.npc.say("Sure!  Here's a song!")
        td.put('lastPlayed', theDate);
    } else {
        e.npc.say("Sorry, I need to rest my voice");
        e.npc.say("I'll be ready again in "+(300-Math.floor((theDate-lastPlayed)/1000)).toString()+ " seconds");
    }
}