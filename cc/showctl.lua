monitor = peripheral.find("monitor");
peripheral.find('modem', rednet.open);
height = 40;
width = 7;
running = true;
pasteBinId = "sNYXELWe"
term.clear()
os.setComputerLabel("ShowController-Boot")
term.setCursorPos(1,1);
term.write("Loading Show : Disneyland Forever")

function sendCue(tcue) 
    local msg = {
        cue = tcue
    }
    rednet.broadcast(textutils.serialise(msg))
    term.setCursorPos(1,2)
    term.write("Sent Cue " .. tcue)
end

function update() 
    local msg = {
        cmd = 1
    }
    rednet.broadcast(textutils.serialise(msg))
    term.setCursorPos(1,2)
    term.write("Sent update command to show network")
    shell.execute("cd","/")
    shell.execute("rm","startup")
    shell.execute("pastebin","get",pasteBinId,"startup")
    os.reboot()
end

function beamCheck()
    term.setCursorPos(1,2)
    term.write("...5 seconds to beamcheck")
    sleep(5)
    sendCue(-1)
end

function runShow() {
    
}


while (running) do
    local cueNum = 0
    term.setCursorPos(1,3)
    term.clearLine()
    term.write("ShowCMD:>>");
    local cmd = read()
    if (cmd == "beamcheck") then
        beamCheck()
    elseif cmd == "sendcue" then
        term.setCursorPos(1,3)
        term.clearLine()
        term.write("What Cue #:")
        local cueInput = read()
        sendCue(tonumber(cueInput))
    elseif cmd == "update" then
        update()
    elseif cmd == "quit" then
        running = false
    end
end


