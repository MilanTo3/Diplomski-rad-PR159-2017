import adafruit_dht
import gpiozero, board

class SensorManager:
    # ----------- Kalibracija senzora vlaznosti zemljista
    drylimit = 775
    wetlimit = 280
    # 10 seconds calibration

    airqch = gpiozero.MCP3004(channel=0)
    soilmch = gpiozero.MCP3004(channel=2)
    uvch = gpiozero.MCP3004(channel=3)
    dht22 = adafruit_dht.DHT22(board.D22, use_pulseio=True)

    def readTempandHumidity(self):
        signal = False
        while not(signal):
            try:
                l = self.dht22.temperature
                k = self.dht22.humidity
                if(l == None or k == None):
                    continue
                signal = True
                return [l, k]
            except:
                signal = False

    def readSoilMoisturePercentage(self):
        l = self.soilmch.raw_value
        soilh = round(self.valmap(l, self.wetlimit, self.drylimit, 100, 0), 1)
        if(soilh > 100): return 100
        elif(soilh < 0): return 0
        
        return soilh
    
    def readSoilMoistureRawSensorValue(self):
        return self.soilmch.raw_value

    def readAirQuality(self):
        return self.airqch.raw_value
    
    def readUVIndex(self):
        uvIntensity = self.valmap(self.uvch.voltage, 0.98, 2.72, 0.0, 15.0)
        uvIntensity = round(uvIntensity, 1)
        if(uvIntensity < 0): return 0

        return uvIntensity

    def valmap(self, value, istart, istop, ostart, ostop):
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart))
