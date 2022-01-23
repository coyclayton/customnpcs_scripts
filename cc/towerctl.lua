monitor = peripheral.find("monitor");
height = 40;
width = 7;

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

term.redirect(monitor)
monitorReset();
writeColor(colors.blue,1,30)
writeColor(colors.red, 31, 40)
colorWipeDown(colors.white, 0.05)
colorWipeLeft(colors.red, 0.05)
term.restore()