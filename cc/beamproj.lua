peripheral.find('modem', rednet.open);
running = true;
os.setComputerLabel("BeamController")
myFilename = "beamcontrol_a"
versionID = "1.1.0"

leftSide = {
    ch1 = {
        shutter = false,  -- black
        c1 = false,      -- red
        c2 = false,      -- green
        c3 = false       -- blue
    },
    ch2 = {
        shutter = false, -- grey
        c1 = false,      -- yellow
        c2 = false,      -- pink
        c3 = false       -- purple
    },
    ch3 = {
        shutter = false, -- light grey
        c1 = false,      -- cyan
        c2 = false,      -- magenta
        c3 = false       -- orange
    }
}

rightSide = {
    ch1 = {
        shutter = false,  -- black
        c1 = false,      -- red
        c2 = false,      -- green
        c3 = false       -- blue
    },
    ch2 = {
        shutter = false, -- grey
        c1 = false,      -- yellow
        c2 = false,      -- pink
        c3 = false       -- purple
    },
    ch3 = {
        shutter = false, -- light grey
        c1 = false,      -- cyan
        c2 = false,      -- magenta
        c3 = false       -- orange
    }
}

backSide = {
    ch1 = {
        shutter = false,  -- black
        c1 = false,      -- red
        c2 = false,      -- green
        c3 = false       -- blue
    },
    ch2 = {
        shutter = false, -- grey
        c1 = false,      -- yellow
        c2 = false,      -- pink
        c3 = false       -- purple
    },
    ch3 = {
        shutter = false, -- light grey
        c1 = false,      -- cyan
        c2 = false,      -- magenta
        c3 = false       -- orange
    }
}

function resetProjectors() 
    changeSignal("back",1,false,false,false,true)
    changeSignal("back",2,false,false,false,true)
    changeSignal("back",3,false,false,false,true)
    changeSignal("right",1,false,false,false,true)
    changeSignal("right",2,false,false,false,true)
    changeSignal("right",3,false,false,false,true)
    changeSignal("left",1,false,false,false,true)
    changeSignal("left",2,false,false,false,true)
    changeSignal("left",3,false,false,false,true)
    updateProjectors("back")
    updateProjectors("right")
    updateProjectors("left")
end

function changeSignal(side, channelnum, c1t, c2t, c3t, shuttert)
    local channel = "ch"..channelnum 
    if side == "right" then
        rightSide[channel]["shutter"] = shuttert
        rightSide[channel]["c1"] = c1t
        rightSide[channel]["c2"] = c2t
        rightSide[channel]["c3"] = c3t
    elseif side == "left" then
        leftSide[channel]["shutter"] = shuttert
        leftSide[channel]["c1"] = c1t
        leftSide[channel]["c2"] = c2t
        leftSide[channel]["c3"] = c3t
    elseif side == "back" then
        backSide[channel]["shutter"] = shuttert
        backSide[channel]["c1"] = c1t
        backSide[channel]["c2"] = c2t
        backSide[channel]["c3"] = c3t
    end
    updateProjectors(side)
end

function changeAndCommit(side, channelnum, c1, c2, c3, shutter)
    changeSignal(side, channelnum, c1, c2, c3, shutter)
    updateProjectors(side)
end

function updateProjectors(side)
    local sideData
    if side == "right" then
        sideData = rightSide
    elseif side == "left" then
        sideData = leftSide
    elseif side == "back" then
        sideData = backSide
    end
    local mask = 0
    for k,v in pairs(sideData) do
        if k == "ch1" then
            if v['shutter'] then mask = mask + colors.black end
            if v['c1'] then mask = mask + colors.red end
            if v['c2'] then mask = mask + colors.green end
            if v['c3'] then mask = mask + colors.blue end
        end
        if k == "ch2" then
            if v['shutter'] then mask = mask + colors.gray end
            if v['c1'] then mask = mask + colors.yellow end
            if v['c2'] then mask = mask + colors.pink end
            if v['c3'] then mask = mask + colors.purple end
        end
        if k == "ch3" then
            if v['shutter'] then mask = mask + colors.lightGray end
            if v['c1'] then mask = mask + colors.cyan end
            if v['c2'] then mask = mask + colors.magenta end
            if v['c3'] then mask = mask + colors.orange end
        end
    end
    if side == "right" then redstone.setBundledOutput("right", mask)
    elseif side == "left" then redstone.setBundledOutput("left", mask)
    elseif side == "back" then redstone.setBundledOutput("back", mask) end
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
        changeAndCommit("back",1,false,false,false,false)
        sleep(1)
        changeAndCommit("back",1,true,false,false,false)
        sleep(1)
        changeAndCommit("back",1,false,true,false,false)
        sleep(1)
        changeAndCommit("back",1,false,false,true,false)
        sleep(1)
        changeAndCommit("back",1,false,false,false,true)
        sleep(1)
        changeAndCommit("back",2,false,false,false,false)
        sleep(1)
        changeAndCommit("back",2,true,false,false,false)
        sleep(1)
        changeAndCommit("back",2,false,true,false,false)
        sleep(1)
        changeAndCommit("back",2,false,false,true,false)
        sleep(1)
        changeAndCommit("back",2,false,false,false,true)
        resetProjectors()
    elseif (cue == 1) then
        x = 0
        while (x < 5) do
        changeSignal("back",1,false,false,false,false)
        changeSignal('back',2,false,false,false,false)
        updateProjectors("back")
        sleep(1)
        changeAndCommit("back",1,true,false,false,false)
        sleep(1)
        changeSignal("back",1,false,false,false,false)
        changeSignal("back",2,true,false,false,false)
        updateProjectors("back")
        sleep(1)
        changeSignal("back",1,false,false,false,false)
        changeSignal('back',2,false,false,false,false)
        x = x+1
        end
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


