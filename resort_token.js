
function init(e) {
    print("Token Dispenser Online");
}

var bookmgr = {};
bookmgr.makepage = function(pageArray) {
    var thisPage = "";
    pageArray.forEach(function(line){
        thisPage += line+"\n";
    });
    var output = '{"text":"'+thisPage+'"}'; 
    return output;
}
function formatDate(today) {
    return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
}
function interact(e) {    
    var handItem = e.player.getMainhandItem(); 
    if (handItem.getName() == "minecraft:written_book") {
        var tags = handItem.getItemNbt().getCompound('tag');
        if (tags.has('goodUntil')) {
            var todayObj = new Date(formatDate(new Date()));
            var tomorrowObj = new Date( new Date().getTime() + (86400*1000));
            var todayString = formatDate(todayObj);
            var goodTilObj = new Date(tags.getLong("goodUntil"));
            if (todayObj.getTime() > goodTilObj.getTime()) {
                e.player.message("Your pass has expired.  We hope you enjoyed your stay.  Come again soon!");
                return;
            } else {
                if (todayObj.getTime() > (tags.getLong("LastDispensed")+86400)) {
                    tags.setLong("LastDispensed", todayObj.getTime());
                    tags.setInteger("Tokens", 30);
                }
                var curBal = tags.getInteger("Tokens");
                if (curBal > 0) {
                    curBal--;
                    tags.setInteger("Tokens", curBal);
                    var aToken = e.player.world.createItem("harvestcraft:garliccoinitem",0,1);
                    var tokTag = aToken.getItemNbt().getCompound('tag');
                    tokTag.setString("Resort","Amangiri");
                    e.player.giveItem(aToken);
                    var pages = [bookmgr.makepage([
                        "AMANGIRI RESORTS",
                        ">> ResortPass",
                        "================",
                        "Available Tokens:",
                        "  = "+curBal.toString(),
                        "================",
                        "Tokens Renew:",
                        formatDate(tomorrowObj),
                        "================"
                    ])];
                    tags.setList("pages", pages);
                } else {
                    e.player.message("No more tokens available today");
                }
            }
        } else {
            e.player.message("*boop* Invalid ResortPass");
        }
    }
}