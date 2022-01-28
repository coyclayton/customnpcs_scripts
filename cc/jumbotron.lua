monitor = peripheral.find("monitor");
peripheral.find('modem', rednet.open);
height = 33;
width = 61;
running = true;
os.setComputerLabel("JumboTronControler")
myFilename = "jumbotron"
versionID = "1.1.0"

function writeColor(color, startLine, endLine)
    paintutils.drawFilledBox(1, startLine, width, endLine, color)
end

function monitorReset() 
    monitor.setBackgroundColor(colors.black);
    monitor.clear();
end

function colorWipeDown(color, speed)
    local y = 1;
    while (y <= height) 
    do
        paintutils.drawFilledBox(1,y,width,y,color)
        sleep(speed)
        y = y+1
    end
end

function colorWipeLeft(color, speed) 
    local x = 1;
    while (x <= width)
    do
        paintutils.drawFilledBox(x,0,x,height,color)
        sleep(speed)
        x = x+1
    end
end

function runScene(cue)
    term.clear()
    term.setCursorPos(1,1)
    term.write("Executing Cue: "..cue)
    os.setComputerLabel("Jumbo @ Cue :" .. cue)
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
term.write("Staring JumboTronCtl(c)")
term.write("Show Version: "..versionID)
runScene(-1)
runScene(0)
startSystem()


