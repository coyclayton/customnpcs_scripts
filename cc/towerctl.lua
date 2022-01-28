monitor = peripheral.find("monitor");
peripheral.find('modem', rednet.open);
running = true;
os.setComputerLabel("LightTowerCtl")
myFilename = "tower_a"
versionID = "1.1.0"


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

function installUpdate(fullMessage) 
    local fb = fs.open("startup","w")
    fb.write(fullMessage.program)
    fb.close()
    sleep(2)
    os.reboot()
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
                if (fullMessage.filename == myFilename) then
                    installUpdate(fullMessage)
                end
            end
            if (fullMessage.cmd == 2) then
                monitorReset()
                os.shutdown()
            end
        end
    end
end

term.setCursorPos(1,2)
term.write("LightTower Control(c)")
term.write("Show Version: "..versionID)
runScene(-1)
runScene(0)
startSystem()


