peripheral.find('modem', rednet.open);
running = true;
pasteBinId = "sNYXELWe"
term.clear()
os.setComputerLabel("ShowCtl: Disneyland Forever")
term.setCursorPos(1,1);
term.write("Loading Show : Disneyland Forever")
-- Hardware show files for hardware controllers on the network
files = {}
files[1] = {pbid="wxSWyDn3",filename="tower_a", remote=true}
files[2] = {pbid="TEHqwT74",filename="jumbotron", remote=true}
files[3] = {pbid="ZKs0Znju",filename="beamcontrol_a", remote=true}
files[4] = {pbid="sNYXELWe",filename="startup", remote=false}

function sendCue(tcue) 
    local msg = {
        cue = tcue
    }
    rednet.broadcast(textutils.serialise(msg))
    term.setCursorPos(1,2)
    term.write("Sent Cue " .. tcue)
end

function update() 
    term.setCursorPos(1,2)
    term.write(" >> Dispatching updated showfiles")
    for k,v in ipairs(files) do
        if (v.remote == true) then
            term.setCursorPos(1,2)
            term.clearLine()
            term.write("Sending " .. v.filename)
            local fsb = fs.open(v.filename,"r")
            local body = fsb.readAll()
            fsb.close()
            local msg = {
                cmd = 1,
                filename = v.filename,
                program = body
            }
            rednet.broadcast(textutils.serialise(msg))
        end
    end  
    term.setCursorPos(1,2)
    term.write("Sent all updated showfiles")
end

function updateFiles() 
    term.setCursorPos(1,5)
    term.write(">>> Updating local files from pastebin")
    for k,v in ipairs(files) do
        term.setCursorPos(1,5)
        term.clearLine()
        term.write("Getting " .. v.filename)
        updateFromPasteBin(v.pbid, v.filename)
        sleep(2)
    end
    term.clearLine()
    term.setCursorPos(1,5)
    term.write("Files updated")
    os.reboot()
end

function updateFromPasteBin(pbid, filename) 
    shell.execute("rm",filename)
    shell.execute("pastebin","get",pbid,filename)
end

function beamCheck()
    term.setCursorPos(1,2)
    term.write("...5 seconds to beamcheck")
    sleep(5)
    sendCue(-1)
end

while (running) do
    term.clear()
    term.setCursorPos(1,1);
    term.write("ActiveShow : Disneyland Forever")
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
    elseif cmd == "updatefiles" then
        updateFiles()
    elseif cmd == "quit" then
        running = false
    end
end


