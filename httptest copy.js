var conn = Java.type("java.sql.Connection");
var DriverManager = Java.type("java.sql.DriverManager");


function interact(e) {
    e.setCanceled(true);
    var conn = null;
    var result = {}
    var urlp = "jdbc:mysql://127.0.0.1/minecraft";
    var login = "mcserver";
    var password = "local_access_only";
    try
    {
        conn = DriverManager.getConnection(urlp, login, password);
        var query = "select * from kvm where pkey='tester'";
        var st = conn.createStatement();
        var rs = st.executeQuery(query);

        while (rs.next())
        {
            result.value = rs.getString("vstore");
            e.player.message(result.value);
        }
        st.close();
    }
    catch (e) { print(e); result.error = e; }
    finally { if (conn != null) { try { conn.close(); } catch (e) {} } }
}
