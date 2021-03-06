
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

// ========= MINEBRAIN CONNECTION ===========================================
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
// =================== END MINEBRAIN CONNECTION =============================

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