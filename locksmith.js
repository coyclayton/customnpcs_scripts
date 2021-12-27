
function interact(e) {
    var handItem = e.player.getMainhandItem(); 
    switch(handItem.getName()) {
        default:
            break;
        case "endermail:package":
            e.setCanceled(true);
            doLockDupeOrder(e, handItem);
            break;
    }
}

function doLockDupeOrder(e, handItem) {
    var forEach = Array.prototype.forEach;
    var reqs = {
        keyFound: false,
        lockFound: false,
        ironFound: false
    }
    var locks = [];
    var srcKeyID = "";
    var ironCount = 0;
    var workLock;
    var ironStacks;
    var nbt = handItem.getItemNbt();
    var BoxContents = nbt.getCompound("tag").getCompound("BlockEntityTag").getList("Items",10);
    forEach.call(BoxContents, function(xitem){
        if (xitem.getString("id") == "locks:key") {
            e.npc.sayTo(e.player, "Ok, there's the key you want worked with...");
            srcKeyID = xitem.getCompound("tag").getInteger("id");
            reqs.keyFound = true;
        }
        if (xitem.getString("id") == "locks:lock") {
            e.npc.sayTo(e.player, "There's a lock..");
            locks.push(xitem);
            reqs.lockFound = true;
        }
        if (xitem.getString("id") == "minecraft:iron_ingot") {
            ironCount += xitem.getByte("Count");
            xitem.setByte("Count", 0);
        }
    });
    if (ironCount != 0) {
        e.npc.sayTo(e.player, "Woooo you brought Iron!  I'll bulk forge you locks!  You can rekey them later!");
        var makeLocks = Math.floor(ironCount/2);
        while (makeLocks > 0) {
            makeALock(e, srcKeyID);
            makeLocks--;
        }
        e.npc.sayTo(e.player, "Ok, done.  Repack them in the box with a key to rekey them all!");
        return;
    }
    if (srcKeyID == "") {
        e.npc.sayTo(player, "I didn't find a key in here");
        return;
    }
    if (locks.length != 0) {
        forEach.call(locks, function(wlock){
            var tag = wlock.getCompound("tag");
            tag.setInteger("id", srcKeyID);
        });
    }
    e.npc.sayTo(e.player, "Ok, all done!");
}

function makeALock(e, keyId) {
    var newLock = e.player.world.createItem("locks:lock",0,1);
    e.npc.dropItem(newLock);
    e.npc.sayTo(e.player, "You get a lock!");
    return;
}