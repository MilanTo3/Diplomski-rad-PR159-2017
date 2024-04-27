import gpiozero, time
import adafruit_dht, board

ch1 = gpiozero.MCP3004(channel=0)
ch2 = gpiozero.MCP3004(channel=2)
ch3 = gpiozero.MCP3004(channel=3)
dht22 = adafruit_dht.DHT22(board.D22, use_pulseio=True)

def readUVIndex(voltage):
        uvIntensity = valmap(round(voltage,2), 0.99, 2.8, 0.0, 15.0)
        uvIntensity = round(uvIntensity, 1)
        if(uvIntensity < 0): return 0

        return uvIntensity

def valmap(value, istart, istop, ostart, ostop):
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart))

while True:
    print(ch1.raw_value, ch2.raw_value)
    time.sleep(10)