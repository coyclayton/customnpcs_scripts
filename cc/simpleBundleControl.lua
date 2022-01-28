peripheral.find('modem', rednet.open);
running = true;
os.setComputerLabel("BeamController")
myFilename = "beamcontrol_a"
versionID = "1.1.0"
 
 
function resetProjectors() 
    sendSignal("*", colors.black)
end
 
function sendSignal(side, mask) 
    if side == "*" then
        redstone.setBundledOutput("right", mask)
        redstone.setBundledOutput("left", mask)
        redstone.setBundledOutput("back", mask)
    else
        redstone.setBundledOutput(side, mask)
    end
end
 
function runScene(cue)
    term.clear()
    term.setCursorPos(1,1)
    term.write("Executing Cue: "..cue)
    os.setComputerLabel("BeamProj @ Cue :" .. cue)
    if (cue == 0) then
        resetProjectors();
    elseif (cue == -1) then
        sleep(1)
        sendSignal("right", colors.red)
        sleep(1)
        sendSignal("right", colors.blue)
        sleep(1)
        sendSignal("right", colors.green)
        sleep(1)
        sendSignal("right", colors.brown)
        sleep(1)
        sendSignal("left", colors.red)
        sleep(1)
        sendSignal("left", colors.blue)
        sleep(1)
        sendSignal("left", colors.green)
        sleep(1)
        sendSignal("left", colors.brown)
        sleep(1)
        resetProjectors()
    end
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
term.write("BeaconBeam Projector Control(c)")
term.write("Show Version: "..versionID)
runScene(-1)
runScene(0)
startSystem()