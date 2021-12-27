//==================== database utility library
// mysql database access with built in kvm
var conn = Java.type("java.sql.Connection");
var DriverManager = Java.type("java.sql.DriverManager");
var dbm = {};
dbm.doQuery = function(qstring, rsparser, rsparam, manip) {
    if (manip==undefined) manip = false;
    var conn = Java.type("java.sql.Connection");
    var DriverManager = Java.type("java.sql.DriverManager");
    var conn = null;
    var result = {}
    var urlp = "jdbc:mysql://127.0.0.1/minecraft";
    var login = "mcserver";
    var password = "local_access_only";
    try
    {
        conn = DriverManager.getConnection(urlp, login, password);
        //var query = "select * from kvm where pkey='tester'";
        var st = conn.createStatement();
        if (manip) {
            var rs = st.executeUpdate(qstring);
        } else {
            var rs = st.executeQuery(qstring);
        }
        result.data = rsparser(rs, rsparam);
        st.close();
        return result; //returns a java ResultSet
    }
    catch (e) { print(e); result.error = e; }
    finally { if (conn != null) { try { conn.close(); } catch (e) {} } }
}
dbm.parseKvmResult = function(rs, rsparam) {
    var rdata;
    switch(rsparam) {
        case "get":
            while (rs.next())
            {
                rdata = rs.getString("vstore");
            } 
            return rdata;   
        case "set":
            return true;
    }
}
dbm.get_kvm = function(kvmkey) {
    var query = "select * from kvm where pkey='"+kvmkey+"'";
    var dres = dbm.doQuery(query, dbm.parseKvmResult, "get");
    if (dres.error == undefined) {
        return JSON.parse(dres.data);
    } else {
        return {error: true};
    }
}
dbm.set_kvm = function(kvmkey, kvmdata, isNew) {
    if (isNew==undefined) isNew = false;
    if (isNew) {
        var query = "insert into kvm (pkey, vstore) values ('@a@','@b@')";
    } else {
        var query = "update kvm set vstore='@b@' where pkey='@a@'";
    }
    query = query.replace("@a@", kvmkey).replace("@b@", JSON.stringify(kvmdata));
    var dres = dbm.doQuery(query, dbm.parseKvmResult, "set", true);
    if (dres.error == undefined) {
        return true;
    } else {
        return false;
    }
}

var guihelp = {};
guihelp.liner = function() {
    var curHeight = 0;
    this.ht = function(amt) {
        curHeight += amt + 1;
        return amt;
    }
    this.y = function() { return curHeight;}
    return this;
}
guihelp.makeField = function(gui, lid, fid, y, labelTxt) {
    gui.addLabel(lid, labelTxt, 0, y, 99, 20);
    gui.addTextField(fid, 100, y, 100, 20);
    return;
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

//==================== END LIBRARIES =====================

var inUse = false;
var inUseUser = "";
var mode = 0;
var modeData = {};
var realRoomTotal = 6;
var roomCost = 950;
var thisNPC;
var myBalance = 0;
var storage;
var resortData;

function init(e) {
    thisNPC = e.npc;
    storage = e.npc.getWorld().getStoreddata();
    if (storage.has("AmangiriResortData")) {
        resortData = JSON.parse(storage.get("AmangiriResortData"));
    } else {
        resortData = {
            balance: 0
        }   
    }
    thisNPC.say("Amangiri Front Desk Online");  
}

function saveStorage() {
    storage.put("AmangiriResortData", JSON.stringify(resortData));
}

function interact(e) {
    var handItem = e.player.getMainhandItem();
    if (handItem.getName() == "enderpay:filled_banknote" && e.player.getName() == "coyclayton") {
        var ht = handItem.getItemNbt().getCompound('tag');
        if (ht.getLong("Amount") == 1) {
            ht.setLong("Amount", resortData.balance);
            resortData.balance = 0;
            saveStorage();
            thisNPC.sayTo(e.player, "Checkin balance Deposited");
            return;    
        }
    }
    e.setCanceled(true);
    thisNPC = e.npc;
    if (inUse && e.player.getDisplayName() != inUseUser) {
        e.npc.sayTo(e.player, "I'm helping someone at the moment, be right with you.");
    } else {
        inUse = true;
        inUseUser = e.player.getDisplayName();
        reupSession();
        switch(mode) {
            case 0:
                greet.showform(e);
                break;
            case 1:
                checkin.payment(e);
                break;
            case 2:
                checkin.activate(e);
                break;
        }
    }
}

function customGuiButton(e) {
    if (e.player.getDisplayName() == inUseUser) {
        if (e.gui.getID() == 100) greet.handle(e);
        if (e.gui.getID() == 101) res.handle(e);
    } else {
        e.npc.sayTo("Oh I'm sorry, I had to move on to someone else.  You'll have to get back in line.");
    }
}

// Single User State Management
function resetState(e) {
    thisNPC.say("Can I help the next person please?");
    inUse = false;
    inUseUser = "";
    mode = 0;
}
function timer(e) {
    if (e.id == 1) {
        resetState(e);
    }
}
function reupSession() {
    thisNPC.timers.forceStart(1, 2400, false);
}

//============= Greeting Menu
var greet = {};
greet.showform = function(e) {
    var handItem = e.player.getMainhandItem(); 
    switch(handItem.getName()) {
        default:
            var gui = e.API.createCustomGui(100, 200, 400, false);
            gui.addLabel(10, "Hello " + e.player.getDisplayName() + ", Welcome to the Burj Al Amangiri.  How can I help you today?", 0, 0, 200, 60);
            gui.addButton(20, "I have a reservation.", 0, 60, 200, 20);
            gui.addButton(25, "I'd like to make a reservation", 0, 81, 200, 20);
            e.player.showCustomGui(gui);        
            break;
        case "minecraft:written_book":
            reupSession();
            thisNPC.sayTo(e.player, "Give me a moment to check that.");
            greet.startCheckIn(e, handItem);
            break;
    }
}
greet.startCheckIn = function(e, handItem) {
    var tags = handItem.getItemNbt().getCompound("tag");
    if (tags.has("useType")) {
        var useType = tags.getString("useType");
        if (useType == "AmanResortsBooking") {
            var tryStart = tags.getString("inDate");
            var iDate = new Date(tryStart);
            var now = new Date();
            if (now.getTime() < iDate.getTime()) {
                thisNPC.sayTo(e.player, "Oh I'm sorry, its to early for you to check in right now");
                resetState();
                return;
            }
            mode = 1;  //change to payment receive mode.
            modeData = {
                due: tags.getInteger('price'),
                paid: 0
            }
            thisNPC.sayTo(e.player, "Excellent " + e.player.getDisplayName() + ", your total for check-in is $"+modeData.due+".  Please provide a check in that amount.");
            reupSession();
        } else {
            thisNPC.sayTo(e.player, "This does not appear to be one of our reservations.");
            resetState();
        }
    } else {
        thisNPC.sayTo(e.player, "Hm... I'm looking for a reservation.");
        resetState();
    }
}
greet.handle = function(e) {
    switch (e.buttonId) {
        default:
            break;
        case 20:
            resetState();
            e.player.showDialog(41, "Front Desk Agent");
            break;
        case 25:
            thisNPC.say("I'm happy to help you with that!");
            res.showform(e);
            break;
    }
}
//============= Payment Process
var checkin = {};
checkin.payment = function(e) {
    var handItem = e.player.getMainhandItem();
    if (handItem.getName() == "enderpay:filled_banknote") {
        var tags = handItem.getItemNbt().getCompound('tag');
        var checkAmount = tags.getInteger("Amount");
        if (checkAmount != modeData.due) {
            thisNPC.sayTo(e.player, "We really need exact change on that folio bill.  Please present a check for exactly $" + modeData.due.toString());
            thisNPC.sayTo(e.player, "This check is for " + checkAmount.toString());
            reupSession();
        } else {
            tags.setLong("Amount", 0);
            resortData.balance += modeData.due;
            saveStorage();
            mode = 2; // set the mode to reservation activation.
            reupSession();
            thisNPC.sayTo(e.player, "Ok, now I need your reservation book 1 more time.");
        }
    } else {
        thisNPC.sayTo(e.player, "This isnt the kind we're looking for.");
    }
}
checkin.activate = function(e) {
    var handItem = e.player.getMainhandItem();
    if (handItem.getName() == "minecraft:written_book") {
        var tomorrow = new Date(new Date().getTime() + (86400*1000));
        var tags = handItem.getItemNbt().getCompound('tag');
        var endDate = new Date(tags.getString("outDate"));
        tags.setInteger("LastDispensed", 0);
        tags.setInteger("Tokens", 30);
        tags.setLong("goodUntil", endDate.getTime());
        handItem.setTitle("ResortPass");
        handItem.setAuthor("Aman Resorts");
        handItem.setLore(["Pass good thru "+formatDate(endDate)]);
        var pages = [bookmgr.makepage([
            "AMANGIRI RESORTS",
            ">> ResortPass",
            "================",
            "Available Tokens:",
            "  > 30",
            "================",
            "Tokens Renew:",
            formatDate(tomorrow),
            "================"
        ])];
        tags.setList("pages", pages);
        thisNPC.sayTo(e.player, "You're all setup!");
        e.player.showDialog(42, "Front Desk");
        resetState();
        return;
    } else {
        thisNPC.sayTo(e.player, "Sorry, need your reservation book.");
    }
}

//============= Make a Res Menu
var res = {};
function formatDate(today) {
    return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
}
res.showform = function(e) {
    var gui = e.API.createCustomGui(101, 200, 400, false);
    var line = guihelp.liner();
    gui.addLabel(10, "Of course, what date will you be joining us?", 0, line.y(), 200, line.ht(60));
    guihelp.makeField(gui, 15, 100, line.y(), "Check In (YYYY-MM-DD):"); line.ht(20);
    guihelp.makeField(gui, 20, 101, line.y(), "How many nights?"); line.ht(20);
    gui.addButton(25, "Check this date", 0, line.y(), 200, 20);
    e.player.showCustomGui(gui);
}
res.handle = function(e) {
    switch(e.buttonId) {
        case 25:
            res.spawnResRequest(e);
            e.player.closeGui();
            break;
    }
}
res.spawnResRequest = function(e) {
    var dateText = e.gui.getComponent(100).getText();
    try {
        var sdate = new Date(dateText);
        var nights = parseInt(e.gui.getComponent(101).getText(), 10);
        var inDate = formatDate(sdate);
        var outDate = formatDate(new Date(sdate.getTime() + (nights * 86400) * 1000));
        var price = roomCost * nights;
        var rreq = e.player.world.createItem("minecraft:written_book",0,1);

        var pages = [bookmgr.makepage([
            ">> Amangiri Resort <<",
            "   Booking Request",
            "---------",
            "Guest: " + e.player.getDisplayName(),
            "Arr: " + inDate,
            "Dep:" + outDate,
            "Total Stay Price:",
            "C$" + price.toString(),
            "----------",
            "Payment due at check in."
        ])];
        
        rreq.setTitle("Amangiri Booking Request");
        rreq.setAuthor("Aman Resorts Res Group");
        rreq.setLore(["Burj Al Amangiri","Stay "+inDate+"/"+outDate]);
        var rTags = rreq.getItemNbt().getCompound("tag");
        rTags.setString("useType", "AmanResortsBooking");
        rTags.setString("inDate", inDate);
        rTags.setString("outDate", outDate);
        rTags.setInteger("price", price);
        rTags.setString("user", e.player.getUUID());
        rTags.setString("userName", e.player.getDisplayName());
        rTags.setList("pages", pages);
        e.player.giveItem(rreq);
        thisNPC.sayTo(e.player, "Look over this request and if you're happy then come back on your check-in date and show it to me.  Looking forward to your stay!");
        return;
    } catch (err) {
        thisNPC.sayTo(e.player, "Hmm, I can't seem to issue you a request for that date");
        print(err);
        resetState();
    }
}




