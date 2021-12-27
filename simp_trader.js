// MAX Inventory 4
var inventory = {
    "fsmm:20foney": 64
}

function role(e) {
   var give = e.sold.getName();
   var take = e.currency1.getName();
   var player = e.player;
   var pname = e.player.getDisplayName();
   
   if (e.toString().contains("Failed") == true) {
       return;
   }

   if (inventory[give] == undefined) {
       e.npc.sayTo(player, "Sorry "+pname+" I don't have that kind of currency on me");
       e.setCanceled(true);
    } else {
       if (inventory[give] <= 0) {
         e.npc.sayTo(player, "I'm all broke now.  But thanks for the business");
         e.npc.sayTo(player, "Bye now!");
         e.setCanceled(true);
         e.npc.despawn();
       } else {
           inventory[give] -= 1;
       }
   }   
}