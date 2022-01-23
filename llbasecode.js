// BASECODE VARIABLES========================================================
var sim = "0000.crc.testchat";
var baseCodeVersion = 1;

// ========= core connection code ===========================================
function httpGet(theUrl){
    var con = new java.net.URL(theUrl).openConnection();
    con.requestMethod = "GET";
    return asResponse(con);
}
function httpPost(theUrl, data, contentType){
    contentType = contentType || "application/json";
    var con = new java.net.URL(theUrl).openConnection();
    con.requestMethod = "POST";
    con.setRequestProperty("Content-Type", contentType);
    // Send post request
    con.doOutput=true;
    write(con.outputStream, data);
    return asResponse(con);
}
function asResponse(con){
    var d = read(con.inputStream);
    return {data : d, statusCode : con.responseCode};
}
function write(outputStream, data){
    var wr = new java.io.DataOutputStream(outputStream);
    wr.writeBytes(data);
    wr.flush();
    wr.close();
}
function read(inputStream){
    var inReader = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream));
    var inputLine;
    var response = new java.lang.StringBuffer();
    while ((inputLine = inReader.readLine()) != null) {
           response.append(inputLine);
    }
    inReader.close();
    return response.toString();
}
function apiDo(envelope){
    try{
        var inboundraw = httpPost("http://localhost:8010/mc", JSON.stringify(envelope)); 
        return inboundraw.data;
    }
    catch(e){
        print("An error occured");
        print(e);
        return {success:0}
    }
}
// =================== HELPERS =============================
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
var storage = {};
storage.put = function(key, data) {
  var packet = {
      daction:"stateSet",
      datakey: key,
      payload: data
  };
  return apiDo(packet);
}
storage.fetch = function(key) {
    var packet = {
        daction:"stateGet",
        datakey: key
    };
    var result = JSON.parse(apiDo(packet));
    return result.payload;
}
//===================== script specific items
var mynpc;
var localstore = {};

function init(e) {
    mynpc = e.npc;
    localstore = storage.fetch(sim);
 }

function interact(e){
    if (e.player.isSneaking()) {
        if (localstore.counter == undefined) {
            localstore.counter = 0;
        }
        localstore.counter++;
        storage.put(sim, localstore);
    } else {
        localstore = storage.fetch(sim);
        mynpc.sayTo(e.player, localstore.counter.toString());
    }
    e.setCanceled(true);
    var handItem = e.player.getMainhandItem();
    var tags = handItem.getItemNbt().getCompound("tag");

}



