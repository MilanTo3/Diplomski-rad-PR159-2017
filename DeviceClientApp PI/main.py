import time
import json, threading, os, serial, board
from configparser import ConfigParser
from pathlib import Path
import RPi.GPIO as GPIO
from mcp3002Manager import MCP3002Manager
#from camController import CameraController
from imageManager import ImageManager
from PIL import Image
import adafruit_dht
import gpiozero

#ser = serial.Serial('/dev/ttyS0', baudrate=115200, timeout=1) # check this!

# ----- Podaci za MQTT autentikaciju i komunikaciju:

path = Path(__file__).absolute().parent
configlocation = path / 'config.txt'
conf = ConfigParser()
conf.readfp(open(configlocation))

ID = conf.get('My Section', 'ID') # Client id
username = conf.get('My Section', 'username')
password = conf.get('My Section', 'password')
channelID = conf.get('My Section', 'channelID')

mqtt_server = "mqtt3.thingspeak.com"
port = 1883

pub = "channels/"+ channelID +"/publish/fields/" # field1=100&field2=50
sub = "channels/"+ channelID +"/subscribe/fields/field#" # subscribe to image request field

# ------------------ Setup sim7600Manager.
# ------------------
mcpManager = MCP3002Manager()
#imageManager = ImageManager()
#camController = CameraController()
#camController.takePicture()
#imageManager.JPEGSaveWithTargetSize(Image.open(path / 'capture.jpg'), 'compressedcapture.jpg', 105000)
#imageManager.uploadImage()
def buttonCallback(self):
  print('callback: ' + str(GPIO.input(17)))

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.add_event_detect(17, GPIO.RISING, buttonCallback)
dht22 = adafruit_dht.DHT22(board.D22, use_pulseio=False)

Record = { "vlaznost_vazduha": 0,
           "temperatura": 0,
           "kvalitet_vazduha": 0,
           "vlaznost_zemljista": 0,
           "uv_zracenje": 0 }

onceperday_flag = False

# ----------- Kalibracija senzora vlaznosti zemljista
drylimit = 590
wetlimit = 200
# 10 seconds calibration

def loop():

  while True:
    getRecords()
    writeRecords()
    #sendRecords()

    time.sleep(15)
  
def getTempandHumidity():
   signal = False
   while not(signal):
      try:
         l = dht22.temperature
         k = dht22.humidity
         if(l == None or k == None):
          continue
         signal = True
         return [l, k]
      except:
         signal = False

def getRecords():

  va1 = gpiozero.MCP3208(channel=0)
  va2 = gpiozero.MCP3208(channel=1)
  print('Raw vlu: ' + str(va2.raw_value))
  print(va1.raw_value, valmap(va2.raw_value, wetlimit, drylimit, 100, 0))
  Record["kvalitet_vazduha"] = mcpManager.get_adc(0)
  l = mcpManager.get_adc(1)
  soilh = round(valmap(l, wetlimit, drylimit, 100, 0), 1)
  Record["vlaznost_zemljista"] = soilh
  th = getTempandHumidity()
  Record["temperatura"] = th[0]
  Record["vlaznost_vazduha"] = th[1]
  #outputVoltage = 3.3 / refLevel * uvLevel
  #uvIntensity = mapfloat(outputVoltage, 0.99, 2.8, 0.0, 15.0)

def valmap(value, istart, istop, ostart, ostop):
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart))

def mapfloat(value, istart, istop, ostart, ostop):
  return (value - istart) * (ostop - ostart) / (istop - istart) + ostart

def writeRecords():

  print("\n Temperatura: " + str(Record["temperatura"]) + "\t Vlaznost vazduha: " + str(Record["vlaznost_vazduha"])
        + "\t Vlaznost zemljista: " + str(Record["vlaznost_zemljista"]) + "\t Kvalitet vazduha: " + str(Record["kvalitet_vazduha"])
        + "\t UV zracenje: " + str(Record["uv_zracenje"]))

def sendRecords():
  print("to do")
  
def getResponseData():
  while True:
    print("Subscribe method!")
    time.sleep(10)
  # 1. Get request from the phone for image. Image flag is YR (otherwise NR)
  # 2. Snip an image.
  # 3. Compress and convert the image to base64.
  # 4. upload the image to imgur.
  # 5. publish the link of the image to the url field.
  # 6. Send IU flag to the image request field.
  # 7. When the IU flag is received by the phone, the phone downloads the image from the link.
  # 8. The phone resets the image request field to NR.

loop()