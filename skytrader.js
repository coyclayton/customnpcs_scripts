
// MAX Trades is 4
var trades = [
    {
        take_item: "fsmm:20foney",
        take_qty: 1,
        give_item: "minecraft:glass",
        give_qty: 1
    }
]

// MAX Inventory 4
var inventory = {
    "minecraft:glass": 128
}

var sales = {};

function init(e) {
    trades.forEach(function(entry, index){
        var take = e.npc.world.createItem(entry.take_item,0,entry.take_qty);
        var give = e.npc.world.createItem(entry.give_item,0,entry.give_qty);
        e.npc.role.set(index, take, null, give);
    });
}

function interact(e) {
    e.npc.say("Hello @p, I come from the glorious fire kingdom to sell glass.");
}

function role(e) {
   var give = e.sold.getName();
   var take = e.currency1.getName();
   
   if (e.toString().contains("Failed") == true) {
       return;
   } 

   trades.map(function(element, index){
    if (element.give_item == give && element.take_item == take) {
        if (inventory[give] < e.sold.getStackSize()) {
            e.npc.say("My business here is done");
            e.setCanceled(true);
        } else {
            if (sales[take] == undefined) {
                sales[take] = 0;
            }
            inventory[take] += e.currency1.getStackSize();
            inventory[give] -= e.sold.getStackSize();
            e.npc.say("Here you are, I've got " + inventory[give] + " left");
        }
    } else {
        e.npc.say("Sorry, I can't do that.");
    }
   });
}