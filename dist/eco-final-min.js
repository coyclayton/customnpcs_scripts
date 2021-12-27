var bookmgr={makepage:function(t){var e="";return t.forEach(function(t){e+=t+"\n"}),e},updateBook:function(t,e,o,n,a){null!=n&&t.setAuthor(n),null!=e&&t.setText(e),null!=o&&t.setTitle(o),null!=a&&t.setLore(a)}},conn=Java.type("java.sql.Connection"),DriverManager=Java.type("java.sql.DriverManager"),dbm={doQuery:function(t,e,o,n){null==n&&(n=!1);var a=Java.type("java.sql.Connection"),c=Java.type("java.sql.DriverManager"),i=(a=null,{});try{var r=(a=c.getConnection("jdbc:mysql://127.0.0.1/minecraft","mcserver","local_access_only")).createStatement();if(n)var l=r.executeUpdate(t);else l=r.executeQuery(t);return i.data=e(l,o),r.close(),i}catch(t){print(t),i.error=t}finally{if(null!=a)try{a.close()}catch(t){}}},parseKvmResult:function(t,e){var o;switch(e){case"get":for(;t.next();)o=t.getString("vstore");return o;case"set":return!0}},get_kvm:function(t){var e="select * from kvm where pkey='"+t+"'",o=dbm.doQuery(e,dbm.parseKvmResult,"get");return null==o.error?JSON.parse(o.data):{error:!0}},set_kvm:function(t,e,o){if(null==o&&(o=!1),o)var n="insert into kvm (pkey, vstore) values ('@a@','@b@')";else n="update kvm set vstore='@b@' where pkey='@a@'";return n=n.replace("@a@",t).replace("@b@",JSON.stringify(e)),null==dbm.doQuery(n,dbm.parseKvmResult,"set",!0).error}},guihelp={};function interact(t){switch(t.player.getMainhandItem().getName()){default:case"minecraft:written_book":}}guihelp.liner=function(){var t=0;return this.ht=function(e){return t+=e+1,e},this.y=function(){return t},this},guihelp.makeField=function(t,e,o,n,a){t.addLabel(e,a,0,n,99,20),t.addTextField(o,100,n,100,20)};var storage,guis={},cityEconomy=!1,cityName="TenshiraCity",statusDialogID=18,signs={dateSign:{x:-339,y:69,z:256},nextSign:{x:-339,y:69,z:255},miscSign:{x:-339,y:69,z:254}};function init(t){storage=t.npc.getWorld().getStoreddata(),cityEconomy=storage.has("CityEconData-".concat(cityName))?JSON.parse(storage.get("CityEconData-".concat(cityName))):{setup:!1,version:1,fingerPrint:roll(1e6),lastRoll:"",nextRoll:"",basePopular:0,totalPopular:0,totalFootTraffic:0,maxFootTraffic:0,maxSpend:{uc:0,mc:0,lc:0},spendRoll:{uc:0,mc:0,lc:0},spend:{uc:0,mc:0,lc:0},visitors:{uc:0,mc:0,lc:0},tca:{uc:0,mc:0,lc:0},retail:{uc:0,mc:0,lc:0},tavern:{uc:0,mc:0,lc:0},hotel:{uc:0,mc:0,lc:0}}}function interact(t){switch(guis.menu=t.API.createCustomGui(9e3,255,255,!1),t.player.getMainhandItem().getName()){default:break;case"minecraft:stone":updateSigns(t),t.setCanceled(!0);break;case"minecraft:dirt":storage.remove("CityEconData-".concat(cityName)),t.player.message("EconData Scrubbed"),init(t),t.setCanceled(!0);break;case"ordinarycoins:coinbronze":buildSetupMenu(t),buildRollMenu(t),guis.menu.addButton(901,"Economy Simulation Setup",5,5),guis.menu.addButton(902,"Roll Menu",5,25),t.player.showCustomGui(guis.menu),t.setCanceled(!0);break;case"minecraft:written_book":writeFullReport(t),t.npc.sayTo(t.player,"Ok, I've updated the book with the report."),t.setCanceled(!0)}}function writeFullReport(t){var e=t.player.getMainhandItem(),o=[],n=new Date,a=n.getFullYear()+"-"+(n.getMonth()+1)+"-"+n.getDate();o.push(makePage(["CITY ECON REPORT","for the week of",a,"inclusive","===============","","City Traffic Rating:"," "+rater(cityEconomy.totalPopular,""," high"),"","Total Visitation:"," "+cityEconomy.totalFootTraffic.toString()])),o.push(makeDemographicPage("Upper Class","uc")),o.push(makeDemographicPage("Middle Class","mc")),o.push(makeDemographicPage("Lower Class","lc")),updateBook(e,o,"City SitRep","---",["City: "+cityName])}function makeDemographicPage(t,e){return makePage(["==Demographics",t,"------------","","Total Visitors:"+cityEconomy.visitors[e].toString(),"","Spend per Visitor:"," C$"+cityEconomy.maxSpend[e].toString(),"","Total POTENTIAL:"," C$"+cityEconomy.tca[e].toString(),""])}function makePage(t){var e="";return t.forEach(function(t){e+=t+"\n"}),e}function updateBook(t,e,o,n,a){null!=n&&t.setAuthor(n),null!=e&&t.setText(e),null!=o&&t.setTitle(o),null!=a&&t.setLore(a)}function buildRollMenu(t){guis.roll=t.API.createCustomGui(9003,255,255,!1),guis.roll.addLabel(930,"== Economic Rolling Menu",0,0,255,20),guis.roll.addLabel(931,"Current Fingerprint: "+cityEconomy.fingerPrint.toString(),0,20,255,20),guis.roll.addButton(932,"Roll New Week",0,40,255,20),guis.roll.addButton(933,"Exit",0,60,255,20)}function buildSetupMenu(t){guis.setup=t.API.createCustomGui(9001,255,255,!1),guis.setup.addLabel(800,"== Setup Menu ==",0,0,255,20),guis.setup.addLabel(805,"Base Popularity:",0,20,127,20),guis.setup.addTextField(810,128,20,127,20),guis.setup.addLabel(815,"Max Foot Traffic:",0,40,127,20),guis.setup.addTextField(820,128,40,127,20),guis.setup.addLabel(825,"Max UC Spend:",0,60,127,20),guis.setup.addTextField(830,128,60,127,20),guis.setup.addLabel(835,"Max MC Spend:",0,80,127,20),guis.setup.addTextField(840,128,80,127,20),guis.setup.addLabel(845,"Max LC Spend:",0,100,127,20),guis.setup.addTextField(850,128,100,127,20),guis.setup.addButton(898,"Save and Update",0,121,255,20),guis.setup.addButton(899,"Exit Unsaved",0,141,255,20)}function saveEconomy(){storage.put("CityEconData-".concat(cityName),JSON.stringify(cityEconomy))}function roll(t){return null==t&&(t=20),Math.ceil(Math.random()*t)}function rollObj(){var t=roll(20),e=roll(20),o=roll(20);return{uc:t,mc:e,lc:o,ttl:t+e+o}}function popspread(t,e){return{uc:Math.round(t*e.uc/e.ttl),mc:Math.round(t*e.mc/e.ttl),lc:Math.round(t*e.lc/e.ttl)}}function rollCityEconomy(t){var e=Math.ceil(20*Math.random())-10;cityEconomy.dynScore=e,cityEconomy.totalPopular=cityEconomy.basePopular+e,cityEconomy.totalPopular<0&&(cityEconomy.totalPopular=1),cityEconomy.totalFootTraffic=Math.floor(cityEconomy.totalPopular/20*cityEconomy.maxFootTraffic),cityEconomy.fingerPrint=roll(1e6);var o=new Date;cityEconomy.lastRoll=o.getFullYear()+"-"+(o.getMonth()+1)+"-"+o.getDate(),o=new Date(Date.now()+6048e5),cityEconomy.nextRoll=o.getFullYear()+"-"+(o.getMonth()+1)+"-"+o.getDate(),cityEconomy.visitors=popspread(cityEconomy.totalFootTraffic,rollObj()),cityEconomy.spendRoll=rollObj(),cityEconomy.spend.uc=Math.floor(cityEconomy.maxSpend.uc*(cityEconomy.spendRoll.uc/20)),cityEconomy.spend.mc=Math.floor(cityEconomy.maxSpend.mc*(cityEconomy.spendRoll.mc/20)),cityEconomy.spend.lc=Math.floor(cityEconomy.maxSpend.lc*(cityEconomy.spendRoll.lc/20)),cityEconomy.tca.uc=cityEconomy.visitors.uc*cityEconomy.spend.uc,cityEconomy.tca.mc=cityEconomy.visitors.mc*cityEconomy.spend.mc,cityEconomy.tca.lc=cityEconomy.visitors.lc*cityEconomy.spend.lc;var n=popspread(cityEconomy.tca.uc,rollObj());cityEconomy.retail.uc=n.uc,cityEconomy.hotel.uc=n.mc,cityEconomy.tavern.uc=n.lc;var a=popspread(cityEconomy.tca.mc,rollObj());cityEconomy.retail.mc=a.uc,cityEconomy.hotel.mc=a.mc,cityEconomy.tavern.mc=a.lc;var c=popspread(cityEconomy.tca.lc,rollObj());cityEconomy.retail.lc=c.uc,cityEconomy.hotel.lc=c.mc,cityEconomy.tavern.lc=c.lc;var i=t.API.getDialogs().get(statusDialogID),r="The cities overall foot traffic this week was "+rater(cityEconomy.totalPopular,"busy")+"\n";r+="I estimate that we saw around "+cityEconomy.totalFootTraffic.toString()+" people roaming our streets.\n",r+="My sources say the wealthy visitors made up "+rater(cityEconomy.spendRoll.uc,""," large")+" amount of the visitors\n",r+="with the middle class being "+rater(cityEconomy.spendRoll.mc,""," highly")+"and the lower class \n",r+="cheap spenders representing a "+rater(cityEconomy.spendRoll.lc,""," high")+" part of the mix. \n",r+="That's all for now.",i.setText(r),i.save(),updateSigns(t),saveEconomy(),t.player.message(JSON.stringify(cityEconomy))}function updateSigns(t){changeFancySignText(t,signs.dateSign,5,cityEconomy.lastRoll),changeFancySignText(t,signs.dateSign,7,cityEconomy.nextRoll),changeFancySignText(t,signs.nextSign,0,"")}function changeFancySignText(t,e,o,n){try{var a=t.player.getWorld().getBlock(e.x,e.y,e.z),c=a.getTileEntityNBT();c.setString("text"+o.toString(),n),a.setTileEntityNBT(c)}catch(o){print(e),print(o),t.player.message("Signs missing or misconfigured")}}function rater(t,e,o){return null==o&&(o=""),(t>=18?"extremely"+o:t<=17&&t>=15?"fairly"+o:t<=14&&t>=10?"about average":t<=9&&t>=5?"below average":"almost non existent")+" "+e}function customGuiButton(t){switch(t.buttonId){case 932:rollCityEconomy(t),t.player.showCustomGui(guis.menu);break;case 933:t.player.showCustomGui(guis.menu);break;case 902:t.player.showCustomGui(guis.roll);break;case 901:guis.setup.getComponent(810).setText(cityEconomy.basePopular.toString()),guis.setup.getComponent(820).setText(cityEconomy.maxFootTraffic.toString()),guis.setup.getComponent(830).setText(cityEconomy.maxSpend.uc.toString()),guis.setup.getComponent(840).setText(cityEconomy.maxSpend.mc.toString()),guis.setup.getComponent(850).setText(cityEconomy.maxSpend.lc.toString()),t.player.showCustomGui(guis.setup);break;case 898:cityEconomy.basePopular=parseInt(guis.setup.getComponent(810).getText(),10),cityEconomy.maxFootTraffic=parseInt(guis.setup.getComponent(820).getText(),10),null==cityEconomy.maxSpend&&(cityEconomy.maxSpend={}),cityEconomy.maxSpend.uc=parseInt(guis.setup.getComponent(830).getText(),10),cityEconomy.maxSpend.mc=parseInt(guis.setup.getComponent(840).getText(),10),cityEconomy.maxSpend.lc=parseInt(guis.setup.getComponent(850).getText(),10),cityEconomy.setup=!0,saveEconomy();case 899:t.player.showCustomGui(guis.menu)}}