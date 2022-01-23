monitor = peripheral.find("monitor");
peripheral.find('modem', rednet.open);
height = 40;
width = 7;
running = true;
os.setComputerLabel("LightTowerControler")
pastebinId = "wxSWyDn3"
versionID = "1.0.5"

function writeColor(color, startLine, endLine)
    paintutils.drawFilledBox(1, startLine, 7, endLine, color)
end

function monitorReset() 
    monitor.setBackgroundColor(colors.black);
    monitor.clear();
end

function colorWipeDown(color, speed)
    local y = 1;
    while (y <= 40) 
    do
        paintutils.drawFilledBox(1,y,7,y,color)
        sleep(speed)
        y = y+1
    end
end

function colorWipeLeft(color, speed) 
    local x = 1;
    while (x <= 7)
    do
        paintutils.drawFilledBox(x,0,x,40,color)
        sleep(speed)
        x = x+1
    end
end

function runScene(cue)
    term.clear()
    term.setCursorPos(1,1)
    term.write("Executing Cue: "..cue)
    os.setComputerLabel("LTC @ Cue :" .. cue)
    term.redirect(monitor)
    if (cue == 0) then
        monitorReset();
    elseif (cue == -1) then
        monitorReset();
        writeColor(colors.red, 1, 13)
        writeColor(colors.green, 13, 23)
        writeColor(colors.blue, 24, 40)
        colorWipeDown(colors.red, 0.05)
        colorWipeLeft(colors.green, 0.05)  
        colorWipeDown(colors.blue, 0.05)
        monitorReset();      
    end
    term.redirect(term.native())
end

function startSystem()
    term.setCursorPos(1,2)
    term.write("Show Version : " .. versionID)
    while running
    do
        local id, message = rednet.receive(nil, 10)
        if id ~= nil then
            local fullMessage = textutils.unserialize(message)
            if (fullMessage.cue ~= nil) then
                runScene(fullMessage.cue);
            end
            if (fullMessage.cmd == 1) then
                shell.execute("cd","/")
                shell.execute("rm","startup")
                shell.execute("pastebin","get",pasteBinId,"startup")
                os.reboot()
            end
            if (fullMessage.cmd == 2) then
                monitorReset()
                os.shutdown()
            end
        end
    end
end

term.setCursorPos(1,2)
term.write("Staring LightTower(c)")
term.write("Show Version: "..versionID)
runScene(-1)
runScene(0)
startSystem()


