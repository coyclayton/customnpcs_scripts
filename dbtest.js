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
dbm.esq = function(xdata) {
    return "'"+xdata+"'" 
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

function interact(e) {
    e.setCanceled(true);
    e.player.message(JSON.stringify(dbm.get_kvm("tester")));
    dbm.set_kvm("tester",{foo:"bar"});
    e.player.message("test - " + JSON.stringify(dbm.get_kvm("tester")));
}
