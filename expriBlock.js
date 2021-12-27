    
function interact(e) {
    var handItem = e.player.getMainhandItem(); 
    switch(handItem.getName()) {
        default:
            break;
        case "minecraft:written_book":
            var today = new Date();
            var nbt = handItem.getNbt();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var page1 = makePage([
                ">>STOCK CERTIFICATE",
                "Issued:"+date,
                "------------------",
                "CyMex International",
                "Trading Company",
                "SYMBOL: CMEX",
                "SHARES: 10"
            ]);
            updateBook(handItem,[page1], "Stock Cert", "KSR Broker",["Stock Cert: CMEX", "10 Shares/Issues"+date]);
            nbt.setString("Symbol","CMEX");
            nbt.setInteger("Shares",10);
            break;
    }
}

function makePage(pageArray) {
    var thisPage = "";
    pageArray.forEach(function(line){
        thisPage += line+"\n";
    });
    return thisPage;
}

function updateBook(handItem, pageArray, title, author, loreArray) {
    if (author != undefined) handItem.setAuthor(author);
    if (pageArray != undefined) handItem.setText(pageArray);
    if (title != undefined) handItem.setTitle(title);
    if (loreArray != undefined) handItem.setLore(loreArray);
}
