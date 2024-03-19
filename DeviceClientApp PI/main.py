import time
import json, threading, os, serial
from configparser import ConfigParser
from pathlib import Path
import RPi.GPIO as GPIO
from mcp3002Manager import MCP3002Manager

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
GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.IN)

Record = { "vlaznost_vazduha": 0, 
           "temperatura": 0,
           "kvalitet_vazduha": 0,
           "vlaznost_zemljista": 0,
           "uv_zracenje": 0,
           "jacina_signala": 0 }

onceperday_flag = False

# ----------- Kalibracija senzora vlaznosti zemljista
drylimit = 590
wetlimit = 205
# 10 seconds calibration

def loop():

  while True:
    #send_record = getRecords()
    #writeRecords(send_record)
    #sendRecords(send_record)
    l = mcpManager.get_adc(1, 'soilm')
    value = valmap(l, wetlimit, drylimit, 100, 0)
    print(l)
    print(value)
    time.sleep(15)

def getRecords():

  print('Todo')

def valmap(value, istart, istop, ostart, ostop):
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart))

def mapfloat(value, istart, istop, ostart, ostop):
  return (value - istart) * (ostop - ostart) / (istop - istart) + ostart

def writeRecords(send_record):

  print("\n Temperatura: " + str(send_record.temperatura) + "\t Vlaznost vazduha: " + str(send_record.vlaznost_vazduha)
        + "\t Vlaznost zemljista: " + str(send_record.vlaznost_zemljista) + "\t Kvalitet vazduha: " + str(send_record.kvalitet_vazduha)
        + "\t UV zracenje: " + str(send_record.uv_zracenje))

def sendRecords(send_record):
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