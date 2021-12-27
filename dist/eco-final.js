
//an array of strings, will munge it together with newlines
//should check to make sure each lines isnt to long and
//the page isnt to long, but it dosent yet
var bookmgr = {};
bookmgr.makepage = function(pageArray) {
    var thisPage = "";
    pageArray.forEach(function(line){
        thisPage += line+"\n";
    });
    return thisPage;
}
// Lore array, 2 elements, each a string. will display on hover over
bookmgr.updateBook = function(handItem, pageArray, title, author, loreArray) {
    if (author != undefined) handItem.setAuthor(author);
    if (pageArray != undefined) handItem.setText(pageArray);
    if (title != undefined) handItem.setTitle(title);
    if (loreArray != undefined) handItem.setLore(loreArray);
}

// LIB: MYSQL mysql database access <<<<<<
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

// LIB: gui helper functions for fast gui generation
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


function interact(e) {
    var handItem = e.player.getMainhandItem(); 
    switch(handItem.getName()) {
        default:
            break;
        case "minecraft:written_book":
            break;
    }
}
// Custom GUI

var guis = {};

var cityEconomy = false;
var cityName = "TenshiraCity";
var statusDialogID = 18;
var signs = {
  dateSign: {x:-339,y:69,z:256},
  nextSign: {x:-339,y:69,z:255},
  miscSign: {x:-339,y:69,z:254},
}
var storage;

function init(e) {
    storage = e.npc.getWorld().getStoreddata();
    if (storage.has("CityEconData-".concat(cityName))) {
        cityEconomy = JSON.parse(storage.get("CityEconData-".concat(cityName)));
    } else {
        cityEconomy = {
            setup: false,
            version: 1,
            fingerPrint: roll(1000000),
            lastRoll:"",
            nextRoll:"",
            basePopular: 0,
            totalPopular: 0,
            totalFootTraffic:  0,
            maxFootTraffic: 0,
            maxSpend: { uc: 0, mc: 0, lc: 0 },
            spendRoll: { uc: 0, mc: 0, lc: 0 },
            spend: { uc: 0, mc: 0, lc: 0 },
            visitors: {uc: 0, mc: 0, lc: 0 },
            tca: {uc: 0, mc: 0, lc: 0 },
            retail: { uc:0, mc: 0, lc: 0},
            tavern: { uc:0, mc: 0, lc: 0},
            hotel: { uc:0, mc: 0, lc: 0},
        };   
    }
}

function interact(e) {
    guis.menu = e.API.createCustomGui(9000, 255, 255, false);
    switch(e.player.getMainhandItem().getName()) {
        default:
            break;
        case "minecraft:stone":
            updateSigns(e);
            e.setCanceled(true);
            break;
        case "minecraft:dirt":
            storage.remove("CityEconData-".concat(cityName));
            e.player.message("EconData Scrubbed");
            init(e);
            e.setCanceled(true);
            break;
        case "ordinarycoins:coinbronze":
            buildSetupMenu(e);
            buildRollMenu(e);
            guis.menu.addButton(901, "Economy Simulation Setup", 5, 5);
            guis.menu.addButton(902, "Roll Menu", 5, 25);
            e.player.showCustomGui(guis.menu);
            e.setCanceled(true);
            break;
        case "minecraft:written_book":
            writeFullReport(e);
            e.npc.sayTo(e.player, "Ok, I've updated the book with the report.");
            e.setCanceled(true);
            break;
    }
}

function writeFullReport(e) {
    var theBook = e.player.getMainhandItem();
    var pages = [];
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    pages.push(makePage([
        "CITY ECON REPORT",
        "for the week of",
        date,
        "inclusive",
        "===============",
        "",
        "City Traffic Rating:",
        " "+rater(cityEconomy.totalPopular, "", " high"),
        "",
        "Total Visitation:",
        " "+cityEconomy.totalFootTraffic.toString(),
    ]));
    pages.push(makeDemographicPage("Upper Class", "uc"));
    pages.push(makeDemographicPage("Middle Class", "mc"));
    pages.push(makeDemographicPage("Lower Class", "lc"));
    updateBook(theBook, pages, "City SitRep","---",["City: "+cityName]);
    return;
}

function makeDemographicPage(label, segment) {
    return makePage([
        "==Demographics",
        label,
        "------------",
        "",
        "Total Visitors:" + cityEconomy.visitors[segment].toString(),
        "",
        "Spend per Visitor:",
        " C$" + cityEconomy.maxSpend[segment].toString(),
        "",
        "Total POTENTIAL:",
        " C$" + cityEconomy.tca[segment].toString(),
        ""
    ]);
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

function buildRollMenu(e) {
    guis.roll = e.API.createCustomGui(9003, 255, 255, false);
    guis.roll.addLabel(930,  "== Economic Rolling Menu", 0, 0, 255, 20);
    guis.roll.addLabel(931,  "Current Fingerprint: "+cityEconomy.fingerPrint.toString(), 0, 20, 255, 20);
    guis.roll.addButton(932, "Roll New Week", 0, 40, 255, 20);
    guis.roll.addButton(933, "Exit", 0, 60, 255, 20);
}

function buildSetupMenu(e) {
    // build out the economic setup menu
    guis.setup = e.API.createCustomGui(9001, 255, 255, false);
    guis.setup.addLabel(800, "== Setup Menu ==", 0, 0, 255, 20);
    guis.setup.addLabel(805, "Base Popularity:", 0, 20, 127, 20);  guis.setup.addTextField(810, 128, 20, 127, 20);
    guis.setup.addLabel(815, "Max Foot Traffic:", 0, 40, 127, 20); guis.setup.addTextField(820, 128, 40, 127, 20);
    guis.setup.addLabel(825, "Max UC Spend:", 0, 60, 127, 20); guis.setup.addTextField(830, 128, 60, 127, 20);
    guis.setup.addLabel(835, "Max MC Spend:", 0, 80, 127, 20); guis.setup.addTextField(840, 128, 80, 127, 20);
    guis.setup.addLabel(845, "Max LC Spend:", 0, 100, 127, 20); guis.setup.addTextField(850, 128, 100, 127, 20);

    guis.setup.addButton(898, "Save and Update", 0, 121, 255, 20);
    guis.setup.addButton(899, "Exit Unsaved", 0, 141, 255, 20);
}

function saveEconomy() {
    storage.put("CityEconData-".concat(cityName), JSON.stringify(cityEconomy));
}

function roll(sides) {
    if (sides == undefined) { sides = 20 }
    return Math.ceil(Math.random() * sides);
}

function rollObj() {
    var ucr = roll(20);
    var mcr = roll(20);
    var lcr = roll(20);
    var ttl = ucr + mcr + lcr;
    return {
        uc: ucr,
        mc: mcr,
        lc: lcr,
        ttl: ttl
    }
}

function popspread(amt, xroll) {
    var spreader = {
        uc: Math.round((amt * xroll.uc) / xroll.ttl),
        mc: Math.round((amt * xroll.mc) / xroll.ttl),
        lc: Math.round((amt * xroll.lc) / xroll.ttl),
    }
    return spreader;
}

function rollCityEconomy(e) {
    var xroll;
    var dynPopScore = Math.ceil(Math.random()*20);
    var dynScore = (dynPopScore-10);
    cityEconomy.dynScore = dynScore;
    cityEconomy.totalPopular = cityEconomy.basePopular + dynScore;
    if (cityEconomy.totalPopular < 0) {
        cityEconomy.totalPopular = 1;
    }
    cityEconomy.totalFootTraffic = Math.floor((cityEconomy.totalPopular/20)*cityEconomy.maxFootTraffic);
    cityEconomy.fingerPrint = roll(1000000);
    var today = new Date();
    cityEconomy.lastRoll = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    today = new Date(Date.now() + ((86400*7)*1000));
    cityEconomy.nextRoll = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();


    cityEconomy.visitors = popspread(cityEconomy.totalFootTraffic, rollObj());

    cityEconomy.spendRoll = rollObj();
    cityEconomy.spend.uc = Math.floor(cityEconomy.maxSpend.uc * (cityEconomy.spendRoll.uc/20));
    cityEconomy.spend.mc = Math.floor(cityEconomy.maxSpend.mc * (cityEconomy.spendRoll.mc/20));
    cityEconomy.spend.lc = Math.floor(cityEconomy.maxSpend.lc * (cityEconomy.spendRoll.lc/20));

    cityEconomy.tca.uc = cityEconomy.visitors.uc * cityEconomy.spend.uc;
    cityEconomy.tca.mc = cityEconomy.visitors.mc * cityEconomy.spend.mc;
    cityEconomy.tca.lc = cityEconomy.visitors.lc * cityEconomy.spend.lc;

    // handle upper class
    var uc = popspread(cityEconomy.tca.uc, rollObj());
    cityEconomy.retail.uc = uc.uc;
    cityEconomy.hotel.uc = uc.mc;
    cityEconomy.tavern.uc = uc.lc;

    // handle middle class
    var mc = popspread(cityEconomy.tca.mc, rollObj());
    cityEconomy.retail.mc = mc.uc;
    cityEconomy.hotel.mc = mc.mc;
    cityEconomy.tavern.mc = mc.lc;

    // handle lower class
    var lc = popspread(cityEconomy.tca.lc, rollObj());
    cityEconomy.retail.lc = lc.uc;
    cityEconomy.hotel.lc = lc.mc;
    cityEconomy.tavern.lc = lc.lc

    var dialog = e.API.getDialogs().get(statusDialogID);
    //setup the dialog report.
    var report = "The cities overall foot traffic this week was " + rater(cityEconomy.totalPopular, "busy")+"\n";
    report += "I estimate that we saw around " + cityEconomy.totalFootTraffic.toString() + " people roaming our streets.\n";
    report += "My sources say the wealthy visitors made up " + rater(cityEconomy.spendRoll.uc,""," large")+" amount of the visitors\n";
    report += "with the middle class being " + rater(cityEconomy.spendRoll.mc,"", " highly") + "and the lower class \n";
    report += "cheap spenders representing a "+rater(cityEconomy.spendRoll.lc, "", " high") + " part of the mix. \n";
    report += "That's all for now.";
    dialog.setText(report);
    dialog.save();
    updateSigns(e);
    saveEconomy();
    e.player.message(JSON.stringify(cityEconomy));
}

function updateSigns(e) {
   changeFancySignText(e, signs.dateSign, 5, cityEconomy.lastRoll);
   changeFancySignText(e, signs.dateSign, 7, cityEconomy.nextRoll);
   changeFancySignText(e, signs.nextSign, 0, "");
   return
}

function changeFancySignText(e, signCoordObj, lineNum, text) {
    try {
        var sign1 = e.player.getWorld().getBlock(signCoordObj.x, signCoordObj.y, signCoordObj.z);
        var tnbc = sign1.getTileEntityNBT();
        tnbc.setString("text"+lineNum.toString(), text);
        sign1.setTileEntityNBT(tnbc);
    } catch (error) {
        print(signCoordObj);
        print(error);
        e.player.message("Signs missing or misconfigured");
    }
    return;
}

function rater(rateValue, adj, extd) {
    var enh;
    if (extd == undefined) {
        extd = "";
    }
    if (rateValue >= 18) {
        enh = "extremely"+extd;
    } else if (rateValue <= 17 && rateValue >= 15) {
        enh = "fairly"+extd;
    } else if (rateValue <= 14 && rateValue >= 10) {
        enh = "about average";
    } else if (rateValue <= 9 && rateValue >= 5) {
        enh = "below average";
    } else {
        enh = "almost non existent";
    }
    return enh+" "+adj;
}

function customGuiButton(e) {
    switch(e.buttonId) {
        case 932:
            rollCityEconomy(e);
            e.player.showCustomGui(guis.menu);
            break;
        case 933:
            e.player.showCustomGui(guis.menu);
            break;
        case 902: 
            e.player.showCustomGui(guis.roll);
            break;
        case 901:  // setup and display the economy setup.
            guis.setup.getComponent(810).setText(cityEconomy.basePopular.toString());
            guis.setup.getComponent(820).setText(cityEconomy.maxFootTraffic.toString());
            guis.setup.getComponent(830).setText(cityEconomy.maxSpend.uc.toString());
            guis.setup.getComponent(840).setText(cityEconomy.maxSpend.mc.toString());
            guis.setup.getComponent(850).setText(cityEconomy.maxSpend.lc.toString());
            e.player.showCustomGui(guis.setup);
            break;
        case 898: // setup menu -> save values
            cityEconomy.basePopular = parseInt(guis.setup.getComponent(810).getText(),10);
            cityEconomy.maxFootTraffic = parseInt(guis.setup.getComponent(820).getText(),10);
            if (cityEconomy.maxSpend == undefined) { cityEconomy.maxSpend = {}; }
            cityEconomy.maxSpend.uc = parseInt(guis.setup.getComponent(830).getText(),10);
            cityEconomy.maxSpend.mc = parseInt(guis.setup.getComponent(840).getText(),10);
            cityEconomy.maxSpend.lc = parseInt(guis.setup.getComponent(850).getText(),10);
            cityEconomy.setup = true;
            saveEconomy();
        case 899: // setup menu -> exit unsaved
            e.player.showCustomGui(guis.menu);
            break;
    }
}