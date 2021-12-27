
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